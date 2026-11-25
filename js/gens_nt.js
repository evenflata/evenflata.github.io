/* gens_nt.js — tallteori, kongruenser, kryptografi */
(function(G){
'use strict';
const C=G.C; const GENS=G.GENS=G.GENS||[];
/* felt-hjelpere (delt med andre generatorfiler) */
const F=G.F={
  num:(label,ans,sol,extra={})=>Object.assign({kind:'num',label,ans,sol,show:C.fmt(ans)},extra),
  tf:(label,ans,sol,extra={})=>Object.assign({kind:'mc',label,opts:['Sant','Usant'],ans:ans?0:1,sol,show:ans?'Sant':'Usant'},extra),
  yn:(label,ans,sol,extra={})=>Object.assign({kind:'mc',label,opts:['Ja','Nei'],ans:ans?0:1,sol,show:ans?'Ja':'Nei'},extra),
  mc:(label,opts,ans,sol,extra={})=>Object.assign({kind:'mc',label,opts,ans,sol,show:opts[ans]},extra),
  multi:(label,opts,ans,sol,extra={})=>Object.assign({kind:'multi',label,opts,ans,sol,show:ans.map(i=>opts[i]).join(', ')||'(ingen)'},extra),
  set:(label,arr,sol,extra={})=>Object.assign({kind:'set',label,ans:arr.map(String),sol,show:C.setStr(arr)},extra),
  txt:(label,check,show,sol,extra={})=>Object.assign({kind:'text',label,check,show,sol},extra),
  self:(label,sol,pts,extra={})=>Object.assign({kind:'self',label,sol,pts},extra),
};
const S=(q,fields,explain,hint)=>({q,fields:fields||[],explain,hint});
const pairCheck=(fn)=> (str)=>{ const m=String(str).replace(/[−–]/g,'-').match(/-?\d+/g); if(!m||m.length<2) return null; return fn(Number(m[0]),Number(m[1])); };
G.pairCheck=pairCheck;
const eRows=(rows)=> rows.map(([a,q,b,r])=>`${a} = ${q} · ${b} + ${r}`).join('<br>');
const eucSteps=(a,b,intro)=>{ // steg der man fyller inn q og r for hver rad
  const rows=C.euclidRows(a,b); const st=[];
  rows.forEach(([A,Q,B,Rr],i)=>{
    st.push(S(`${i===0?(intro||'Euklids algoritme: del det største tallet på det minste.')+'<br>':''}Fyll inn: <b>${A} = q · ${B} + r</b> (0 ≤ r &lt; ${B})`,
      [F.num('q',Q),F.num('r',Rr)], `${A} = ${Q} · ${B} + ${Rr}${Rr===0?' → rest 0, stopp. Siste rest ≠ 0 er gcd.':''}`,
      `q = ⌊${A}/${B}⌋. r = ${A} − q·${B}.`));
  });
  return {rows,st};
};
const sqTableHTML=(a,e,n)=>{ const t=C.squaringTable(a,e,n); return {t, html:`<table class="mini"><tr><th>potens</th>${t.rows.map(r=>`<td>${a}<sup>${r[0]}</sup></td>`).join('')}</tr><tr><th>mod ${n}</th>${t.rows.map(r=>`<td>${r[1]}</td>`).join('')}</tr></table>`}; };
const powSteps=(a,e,n,label)=>{
  const st=[]; const {t,html}=sqTableHTML(a,e,n);
  st.push(S(`Skriv eksponenten ${e} som en sum av toerpotenser (f.eks. «8+2+1»).`,[F.txt('sum',s=>{ const parts=String(s).split('+').map(x=>Number(x.trim())); if(parts.some(isNaN)) return null; return parts.reduce((a,b)=>a+b,0)===e && parts.every(p=>p>0&&(p&(p-1))===0) && new Set(parts).size===parts.length; }, t.bits.join(' + '))],
    `${e} = ${t.bits.join(' + ')} (binært ${e.toString(2)}).`, 'Ta største toerpotens ≤ eksponenten, trekk fra, gjenta.'));
  const need=t.rows.filter(r=>r[0]>1);
  if(need.length) st.push(S(`Kvadrer gjentatte ganger modulo ${n}. Start med ${a}<sup>1</sup> ≡ ${t.rows[0][1]}.`, need.map(r=>F.num(`${a}<sup>${r[0]}</sup> mod ${n}`, r[1])), html, `Hver verdi er forrige verdi i andre, redusert mod ${n}. F.eks. ${a}<sup>2</sup> = ${t.rows[0][1]}² = ${t.rows[0][1]**2} ≡ ${need[0][1]}.`));
  const prodParts=t.bits.map(b=>t.rows.find(r=>r[0]===b)[1]);
  const res=C.modpow(a,e,n);
  // delprodukter
  let acc=1; const chain=[]; prodParts.forEach(v=>{ acc=acc*v%n; chain.push(acc); });
  st.push(S(`Gang sammen de potensene du trenger: ${label||a+'<sup>'+e+'</sup>'} ≡ ${t.bits.map(b=>`${a}<sup>${b}</sup>`).join(' · ')} ≡ ${prodParts.join(' · ')} (mod ${n}). Reduser underveis!`,
    [F.num(`${a}<sup>${e}</sup> mod ${n}`,res)], `Delprodukter mod ${n}: ${chain.join(' → ')}. Svar: <b>${res}</b>.`, 'Gang to og to tall og reduser mod n etter hver multiplikasjon.'));
  return {st,res,html};
};
G.powSteps=powSteps; G.eucSteps=eucSteps; G.S=S;
const add=(o)=>GENS.push(o);

/* ---------- 1. Euklid + Bézout ---------- */
add({id:'euklid',topic:'tallteori',name:'Euklids algoritme og Bézout',method:true,quick:true,make(){
  const g=C.pick([1,1,1,2,3,4,6,7,9,11,12,13]);
  let x,y; do{ x=C.ri(15,90); y=C.ri(8,x-1);}while(C.gcd(x,y)!==1 || C.euclidRows(x,y).length<3);
  const a=g*x, b=g*y; const rows=C.euclidRows(a,b); const bs=C.backSub(a,b); const e=C.egcd(a,b);
  const {st}=eucSteps(a,b);
  st.push(S(`Siste rest som ikke er 0 er gcd. Hva er gcd(${a}, ${b})?`,[F.num('gcd',g)],`gcd(${a}, ${b}) = ${g}.`));
  st.push(S(`Gå baklengs (tilbakesubstitusjon): skriv ${g} som en kombinasjon s·${a} + t·${b}. Oppgi s og t.`,[F.txt('s, t',pairCheck((s,t)=>s*a+t*b===g),`s = ${e.s}, t = ${e.t}`)],
    bs.lines.join('<br>')+`<br>Altså ${g} = (${bs.cA})·${bs.A} + (${bs.cB})·${bs.B}.`, 'Start med siste likning med rest ≠ 0, løs for resten, og sett inn for restene fra likningene over én etter én.'));
  return {prompt:`Bruk Euklids algoritme til å finne gcd(${a}, ${b}), og finn heltall s og t slik at s·${a} + t·${b} = gcd(${a}, ${b}).`,
    parts:[F.num('gcd',g,eRows(rows)),F.txt('s, t',pairCheck((s,t)=>s*a+t*b===g),`s = ${e.s}, t = ${e.t} (andre par fungerer også)`,bs.lines.join('<br>'),{ph:'f.eks. 7, -3'})],steps:st};
}});

/* ---------- 2. Invers modulo n ---------- */
add({id:'invers',topic:'tallteori',name:'Invers modulo n',method:true,quick:true,make(){
  let n,a; do{ n=C.ri(23,199); a=C.ri(5,n-2);}while(C.gcd(a,n)!==1 || C.euclidRows(n,a).length<3);
  const inv=C.inv(a,n); const bs=C.backSub(n,a); const e=C.egcd(n,a);
  const {st}=eucSteps(n,a,`Vi skal løse ${a}x ≡ 1 (mod ${n}), dvs. den diofantiske likningen ${a}x + ${n}y = 1. Kjør Euklid på ${n} og ${a}.`);
  st.push(S(`Tilbakesubstitusjon: skriv 1 = s·${n} + t·${a}. Oppgi t (koeffisienten foran ${a}).`,[F.num('t',e.t)], bs.lines.join('<br>'), 'Bruk likningene baklengs.'));
  st.push(S(`Inversen er t redusert modulo ${n} (et tall mellom 0 og ${n-1}).`,[F.num(`${a}<sup>−1</sup> mod ${n}`,inv)], `${e.t===inv?`t = ${inv} ligger allerede mellom 0 og ${n-1}.`:`${e.t} + ${n} = ${inv}, så t ≡ ${inv} (mod ${n}).`} Sjekk: ${a} · ${inv} = ${a*inv} = ${Math.floor(a*inv/n)}·${n} + 1 ✓`));
  return {prompt:`Finn inversen til ${a} modulo ${n}, altså et tall x med 0 ≤ x &lt; ${n} slik at ${a}x ≡ 1 (mod ${n}).`,
    parts:[F.num(`x`,inv,`${bs.lines.join('<br>')}<br>Så ${a}<sup>−1</sup> ≡ ${e.t===inv?'':e.t+' ≡ '}<b>${inv}</b> (mod ${n}).`)],steps:st};
}});

/* ---------- 3. Diofantisk likning ---------- */
add({id:'diofant',topic:'tallteori',name:'Lineære diofantiske likninger',method:true,quick:true,make(){
  let a,b,d; do{ d=C.pick([1,1,2,3,4,5,6]); a=d*C.ri(3,40); b=d*C.ri(3,40);}while(a===b||C.gcd(a,b)!==d||C.euclidRows(Math.max(a,b),Math.min(a,b)).length<2);
  const solv=d===1||C.chance(0.65); let c; if(solv) c=d*C.ri(1,12); else { do{ c=C.ri(5,60);}while(c%d===0); }
  const big=Math.max(a,b), small=Math.min(a,b);
  const e=C.egcd(a,b); const x0=e.s*(c/d), y0=e.t*(c/d);
  const parts=[F.yn(`Har ${a}x + ${b}y = ${c} heltallsløsninger?`,solv,`gcd(${a}, ${b}) = ${d}. Likningen er løsbar ⇔ gcd | ${c}. ${solv?`${d} | ${c} ✓`:`${d} ∤ ${c}, så ingen løsninger.`}`)];
  const st=[S(`Første sjekk: finn d = gcd(${a}, ${b}).`,[F.num('d',d)],`Euklid: <br>${eRows(C.euclidRows(big,small))}`),
            S(`Er ${c} delelig med d = ${d}?`,[F.yn('d | c ?',solv)], solv?`Ja: ${c} = ${d}·${c/d}. Da finnes uendelig mange løsninger.`:`Nei – ingen heltallsløsninger. Ferdig!`)];
  if(solv){
    parts.push(F.txt('En løsning (x₀, y₀)',pairCheck((x,y)=>a*x+b*y===c),`x₀ = ${x0}, y₀ = ${y0}`,`Finn s,t med s·${a}+t·${b}=${d}: s=${e.s}, t=${e.t}. Gang med ${c}/${d} = ${c/d}: x₀ = ${x0}, y₀ = ${y0}.`,{ph:'x, y'}));
    parts.push(F.num(`Generell løsning x = x₀ + k·t. Hva er steglengden k (positiv)?`,b/d,`x = x₀ + (${b}/${d})t = x₀ + ${b/d}t,  y = y₀ − (${a}/${d})t = y₀ − ${a/d}t.`));
    const bs=C.backSub(big,small);
    st.push(S(`Finn s og t med s·${a} + t·${b} = ${d} (utvidet Euklid).`,[F.txt('s, t',pairCheck((s,t)=>s*a+t*b===d),`s = ${e.s}, t = ${e.t}`)],bs.lines.join('<br>')));
    st.push(S(`Gang likningen med ${c}/${d} = ${c/d} for å få en løsning av ${a}x + ${b}y = ${c}.`,[F.txt('x₀, y₀',pairCheck((x,y)=>a*x+b*y===c),`${x0}, ${y0}`)],`x₀ = ${e.s}·${c/d} = ${x0}, y₀ = ${e.t}·${c/d} = ${y0}.`));
    st.push(S(`Alle løsninger: x = x₀ + (b/d)t, y = y₀ − (a/d)t. Hva er b/d?`,[F.num('b/d',b/d)],`x = ${x0} + ${b/d}t, y = ${y0} − ${a/d}t, t ∈ ℤ.`));
  }
  return {prompt:`Betrakt den diofantiske likningen <b>${a}x + ${b}y = ${c}</b>.`,parts,steps:st};
}});

/* ---------- 4. Lineær kongruens ---------- */
add({id:'linkong',topic:'kongruens',name:'Løs lineær kongruens ax + b ≡ c',method:true,quick:true,make(){
  let n,a,b,c,d,r;
  const wantD=C.chance(0.35);
  for(;;){ n=C.ri(7,45); a=C.ri(2,n-1); d=C.gcd(a,n); if(wantD? d===1: d>1) continue; b=C.ri(0,n+5); c=C.ri(0,n+5); r=C.mod(c-b,n); if(wantD && r%d!==0 && C.chance(0.6)) continue; break; }
  const solv = r%d===0; const n2=n/d; const a2=a/d, r2=r/d; const inv=solv? C.inv(a2%n2,n2):null; const x0= solv? C.mod(inv*r2,n2) : null;
  const sols= solv? [...Array(d).keys()].map(k=>x0+k*n2):[];
  const st=[S(`Flytt konstantleddet: ${a}x ≡ ${c} − ${b} (mod ${n}). Reduser høyresiden til et tall i [0, ${n-1}].`,[F.num('høyreside',r)],`${a}x ≡ ${r} (mod ${n}).`),
    S(`Finn d = gcd(${a}, ${n}). Kongruensen er løsbar ⇔ d | ${r}.`,[F.num('d',d),F.yn('løsbar?',solv)], solv? `d = ${d} deler ${r}. Det blir ${d} løsning${d>1?'er':''} modulo ${n}.` : `d = ${d} deler ikke ${r} → ingen løsning.`)];
  if(solv){
    if(d>1) st.push(S(`Del alt på d = ${d}: ${a2}x ≡ ${r2} (mod ${n2}).`,[],`Nå er gcd(${a2}, ${n2}) = 1.`));
    st.push(S(`Finn inversen til ${a2} modulo ${n2}.`,[F.num(`${a2}<sup>−1</sup> mod ${n2}`,inv)],`${a2} · ${inv} = ${a2*inv} ≡ 1 (mod ${n2}).`,`For små moduler: prøv ${a2}·1, ${a2}·2, ... til du får rest 1. Ellers utvidet Euklid.`));
    st.push(S(`Gang begge sider med inversen: x ≡ ${inv} · ${r2} (mod ${n2}).`,[F.num(`x mod ${n2}`,x0)],`x ≡ ${inv*r2} ≡ ${x0} (mod ${n2}).${d>1?` Modulo ${n} gir det løsningene ${sols.join(', ')}.`:''}`));
  }
  const parts=[F.num(`Hvor mange løsninger finnes modulo ${n}?`,solv?d:0,solv?`${a}x ≡ ${r} (mod ${n}). d = gcd(${a}, ${n}) = ${d}, og d deler høyresiden ${r}, så det er ${d} løsning${d>1?'er':''} modulo ${n}.`:`${a}x ≡ ${r} (mod ${n}). d = gcd(${a}, ${n}) = ${d} deler ikke høyresiden ${r}, så ingen løsning.`)];
  if(solv) parts.push(F.num(`Minste ikke-negative løsning x`,x0,`x ≡ ${x0} (mod ${n2})${d>1?`, dvs. x ∈ {${sols.join(', ')}} mod ${n}`:''}.`));
  return {prompt:`Løs kongruensen <b>${a}x + ${b} ≡ ${c} (mod ${n})</b>.`,parts,steps:st};
}});

/* ---------- 5. Kinesisk restteorem ---------- */
add({id:'crt',topic:'kongruens',name:'System av kongruenser (CRT)',method:true,quick:false,make(){
  let m1,m2; do{ m1=C.ri(4,13); m2=C.ri(5,17);}while(m1===m2||C.gcd(m1,m2)!==1);
  const M=m1*m2; const x=C.ri(0,M-1); const r1=x%m1, r2=x%m2;
  const lin=C.chance(0.55);
  const mk=(m,r)=>{ if(!lin) return {txt:`x ≡ ${r} (mod ${m})`,a:1,b:0,c:r}; let a; do{a=C.ri(2,m-1);}while(C.gcd(a,m)!==1); const b=C.ri(1,9); const c=C.mod(a*r+b,m); return {txt:`${a}x + ${b} ≡ ${c} (mod ${m})`,a,b,c}; };
  const E1=mk(m1,r1), E2=mk(m2,r2);
  const st=[];
  if(lin){
    [[E1,m1,r1],[E2,m2,r2]].forEach(([E,m,r],i)=>{ const rr=C.mod(E.c-E.b,m); const iv=C.inv(E.a,m);
      st.push(S(`Forenkle kongruens ${i+1}: ${E.txt}. Trekk fra ${E.b}: ${E.a}x ≡ ${rr} (mod ${m}). Finn ${E.a}<sup>−1</sup> mod ${m} og løs.`,[F.num(`${E.a}<sup>−1</sup> mod ${m}`,iv),F.num(`x mod ${m}`,r)],`${E.a}·${iv} = ${E.a*iv} ≡ 1 (mod ${m}). x ≡ ${iv}·${rr} = ${iv*rr} ≡ ${r} (mod ${m}).`)); });
  }
  const t0=C.mod((r2-r1)*C.inv(m1%m2,m2),m2); const ivm=C.inv(m1%m2,m2);
  st.push(S(`Systemet er nå x ≡ ${r1} (mod ${m1}), x ≡ ${r2} (mod ${m2}). Siden gcd(${m1},${m2}) = 1 finnes én løsning mod ${M}. Skriv x = ${r1} + ${m1}t og sett inn i den andre: ${m1}t ≡ ${r2} − ${r1} (mod ${m2}). Reduser høyresiden.`,[F.num(`høyreside mod ${m2}`,C.mod(r2-r1,m2))],`${C.mod(m1,m2)}t ≡ ${C.mod(r2-r1,m2)} (mod ${m2}).`));
  st.push(S(`Løs for t: finn ${C.mod(m1,m2)}<sup>−1</sup> mod ${m2} og t.`,[F.num(`invers`,ivm),F.num(`t mod ${m2}`,t0)],`${C.mod(m1,m2)}·${ivm} ≡ 1 (mod ${m2}), så t ≡ ${ivm}·${C.mod(r2-r1,m2)} ≡ ${t0} (mod ${m2}), dvs. t = ${t0} + ${m2}s.`));
  st.push(S(`Sett inn: x = ${r1} + ${m1}(${t0} + ${m2}s) = ? + ${M}s.`,[F.num(`x mod ${M}`,x)],`x = ${r1+m1*t0} + ${M}s, altså x ≡ ${x} (mod ${M}). Sjekk: ${x} mod ${m1} = ${x%m1}, ${x} mod ${m2} = ${x%m2} ✓`));
  return {prompt:`Finn alle heltallsløsninger av systemet<br><div class="sys">${E1.txt}<br>${E2.txt}</div><br>Oppgi svaret som x ≡ ? (mod M).`,
    parts:[F.num('Hva er M (modulusen i svaret x ≡ ? (mod M))?',M,`gcd(${m1},${m2})=1 ⇒ én løsning mod ${m1}·${m2} = ${M}.`),F.num('x (oppgi tallet mellom 0 og M − 1)',x,`x ≡ ${x} (mod ${M}), dvs. x = ${x} + ${M}s, s ∈ ℤ.`)],steps:st};
}});

/* ---------- 6. Er systemet løsbart? ---------- */
add({id:'crtlos',topic:'kongruens',name:'Er kongruenssystemet løsbart?',method:false,quick:true,make(){
  const systems=[]; const types=C.shuffle(['coprime','yes','no']);
  types.forEach(tp=>{ let m1,m2,r1,r2;
    for(;;){ m1=C.ri(3,12); m2=C.ri(3,15); if(m1===m2) continue; const g=C.gcd(m1,m2); if(tp==='coprime'&&g!==1) continue; if(tp!=='coprime'&&g===1) continue; r1=C.ri(0,m1-1); r2=C.ri(0,m2-1); const ok=(r1-r2)%g===0; if(tp==='yes'&&!ok) continue; if(tp==='no'&&ok) continue; break; }
    const g=C.gcd(m1,m2), L=C.lcm(m1,m2); let sol=null; for(let x=0;x<L;x++) if(x%m1===r1&&x%m2===r2){sol=x;break;}
    systems.push({m1,m2,r1,r2,g,L,sol}); });
  return {prompt:`Avgjør for hvert system om det er løsbart.`+systems.map((s,i)=>`<div class="sys"><b>${'ABC'[i]}:</b> x ≡ ${s.r1} (mod ${s.m1}), &nbsp; x ≡ ${s.r2} (mod ${s.m2})</div>`).join(''),
    parts:systems.map((s,i)=>F.yn(`System ${'ABC'[i]} løsbart?`,s.sol!==null, s.g===1? `gcd(${s.m1},${s.m2}) = 1 → alltid løsbart (CRT). Løsning x ≡ ${s.sol} (mod ${s.L}).` : `gcd(${s.m1},${s.m2}) = ${s.g}. Løsbart ⇔ ${s.r1} ≡ ${s.r2} (mod ${s.g}). ${s.sol!==null?`Ja: ${s.r1} − ${s.r2} = ${s.r1-s.r2} er delelig med ${s.g}. Løsning x ≡ ${s.sol} (mod ${s.L}).`:`Nei: ${s.r1} − ${s.r2} = ${s.r1-s.r2} er ikke delelig med ${s.g}.`}`)),
    steps:[S(`Regelen: x ≡ r₁ (mod m₁), x ≡ r₂ (mod m₂) er løsbart ⇔ gcd(m₁,m₂) | (r₁ − r₂). Er gcd = 1, er det alltid løsbart (kinesisk restteorem), og løsningen er unik modulo lcm(m₁,m₂).`,[],`Eks. fra H25: x ≡ 1 (mod 4), x ≡ 2 (mod 6): gcd = 2, men 1 − 2 = −1 er odde → ingen løsning. x ≡ 2 (mod 6), x ≡ 8 (mod 9): gcd = 3 og 2 − 8 = −6 ✓ → x ≡ 8 (mod 18).`)]};
}});

/* ---------- 7. Eulers φ ---------- */
add({id:'phi',topic:'krypto',name:'Eulers φ-funksjon',method:true,quick:true,make(){
  const shapes=['pk','pq','pkqm','pqr','pk'];
  let n; const sh=C.pick(shapes);
  do{ const ps=C.shuffle(C.primesIn(2,31));
    if(sh==='pk'){ const p=C.pick([2,3,5,7]); n=Math.pow(p,C.ri(2,p===2?7:4)); }
    else if(sh==='pq') n=ps[0]*ps[1];
    else if(sh==='pkqm') n=Math.pow(ps[0],C.ri(2,3))*Math.pow(ps[1],C.ri(1,2));
    else n=ps[0]*ps[1]*ps[2];
  }while(n>12000||n<20);
  const f=C.factor(n); const ph=C.phi(n);
  const pieces=f.map(([p,k])=> k>1? `(${p}<sup>${k}</sup> − ${p}<sup>${k-1}</sup>)` : `(${p} − 1)`).join(' · ');
  const vals=f.map(([p,k])=>Math.pow(p,k)-Math.pow(p,k-1));
  const fcheck=s=>{ const parts=String(s).replace(/[·×]/g,'*').split('*').map(x=>x.trim()).filter(Boolean); let prod=1; for(const p of parts){ const m=p.match(/^(\d+)(?:\^(\d+))?$/); if(!m) return null; const b=Number(m[1]), e=Number(m[2]||1); if(!C.isPrime(b)) return false; prod*=Math.pow(b,e);} return prod===n; };
  return {prompt:`Regn ut φ(${n}).`,
    parts:[F.num(`φ(${n})`,ph,`${n} = ${C.factorStr(n)}. φ(${n}) = ${pieces} = ${vals.join(' · ')} = <b>${ph}</b>.`)],
    steps:[S(`Primtallsfaktoriser ${n}. Skriv f.eks. «2^3*5».`,[F.txt('faktorisering',fcheck,C.factorStr(n).replace(/<sup>/g,'^').replace(/<\/sup>/g,''))],`${n} = ${C.factorStr(n)}.`,`Del på små primtall: 2, 3, 5, 7, 11, 13, … Siste siffer 5 ⇒ delelig med 5. Tverrsum delelig med 3 ⇒ delelig med 3.`),
      S(`Bruk φ(p<sup>k</sup>) = p<sup>k</sup> − p<sup>k−1</sup> på hver faktor (og φ(p) = p − 1).`,f.map(([p,k],i)=>F.num(`φ(${p}${k>1?`<sup>${k}</sup>`:''})`,vals[i])),f.map(([p,k],i)=>`φ(${p}${k>1?`<sup>${k}</sup>`:''}) = ${vals[i]}`).join(', ')),
      S(`φ er multiplikativ for relativt primiske faktorer: gang sammen.`,[F.num(`φ(${n})`,ph)],`φ(${n}) = ${vals.join(' · ')} = ${ph}.`)]};
}});

/* ---------- 8. Rask eksponentiering ---------- */
add({id:'modpow',topic:'krypto',name:'Rask eksponentiering (toerpotenser)',method:true,quick:true,make(){
  const n=C.ri(41,251), a=C.ri(3,n-2), e=C.ri(11,60);
  const {st,res}=powSteps(a,e,n);
  return {prompt:`Regn ut ${a}<sup>${e}</sup> mod ${n} for hånd (gjentatt kvadrering).`,parts:[F.num(`${a}<sup>${e}</sup> mod ${n}`,res,sqTableHTML(a,e,n).html)],steps:st};
}});

/* ---------- 9. Fermat / siste siffer ---------- */
add({id:'fermat',topic:'kongruens',name:'Fermats lille teorem & siste siffer',method:true,quick:true,make(){
  if(C.chance(0.55)){
    const p=C.pick([7,11,13,17,19,23]); let a; do{a=C.ri(2,60);}while(a%p===0||a%p===1); const E=C.ri(100,2026); const r=E%(p-1); const res=C.modpow(a,E,p);
    return {prompt:`Finn ${a}<sup>${E}</sup> mod ${p}.`,parts:[F.num(`${a}<sup>${E}</sup> mod ${p}`,res,`Fermat: ${a}<sup>${p-1}</sup> ≡ 1 (mod ${p}). ${E} = ${Math.floor(E/(p-1))}·${p-1} + ${r}, så ${a}<sup>${E}</sup> ≡ ${a}<sup>${r}</sup> ≡ ${res} (mod ${p}).`)],
      steps:[S(`${p} er primtall og ${p} ∤ ${a}, så Fermats lille teorem gir ${a}<sup>${p-1}</sup> ≡ 1 (mod ${p}). Reduser eksponenten modulo ${p-1}.`,[F.num(`${E} mod ${p-1}`,r)],`${E} = ${Math.floor(E/(p-1))}·${p-1} + ${r}.`),
        S(`Reduser grunntallet også: ${a} ≡ ${a%p} (mod ${p}). Regn ut ${a%p}<sup>${r}</sup> mod ${p}.`,[F.num('svar',res)],`${a%p}<sup>${r}</sup> = ${BigInt(a%p)**BigInt(r)} ≡ ${res} (mod ${p}).`)]};
  }
  const a=C.pick([3,7,9,13,17,23,27,33,37,2,4,8,12]); const E=C.ri(50,2026); const res=C.modpow(a,E,10);
  const cyc=[]; let v=a%10; const seen={}; let k=1; while(!(v in seen)){ seen[v]=k; cyc.push(v); v=v*a%10; k++; }
  const L=cyc.length; const start=seen[v]; // syklus starter ved posisjon start
  return {prompt:`Hva er siste siffer i ${a}<sup>${E}</sup>?`,parts:[F.num('siste siffer',res,`Siste siffer = ${a}<sup>${E}</sup> mod 10. Potensene av ${a} mod 10: ${cyc.join(', ')}, ${v}, … (periode ${L-start+1}). Svar: <b>${res}</b>.`)],
    steps:[S(`Siste siffer = resten mod 10. Skriv opp ${a}<sup>1</sup>, ${a}<sup>2</sup>, ${a}<sup>3</sup>, … mod 10 til mønsteret gjentar seg. Hvor lang er perioden?`,[F.num('periode',L-start+1)],`${cyc.map((c,i)=>`${a}<sup>${i+1}</sup> ≡ ${c}`).join(', ')}, så gjentar det seg.`, gcdHint(a)),
      S(`Finn hvor ${E} havner i syklusen (se på ${E} mod ${L-start+1}) og les av.`,[F.num('svar',res)],`${E} mod ${L-start+1} = ${E%(L-start+1)} ⇒ siste siffer ${res}.`)]};
  function gcdHint(a){ return C.gcd(a,10)===1? 'Siden gcd(a,10)=1 sier Euler at a⁴ ≡ 1 (mod 10), så perioden deler 4.':'Her er gcd(a,10) > 1, så vi finner syklusen direkte.'; }
}});

/* ---------- 10. RSA dekryptering ---------- */
const rsaInst=()=>{ for(;;){ const ps=C.shuffle(C.primesIn(7,37)); const p=ps[0],q=ps[1]; const n=p*q; if(n>999||n<100) continue; const ph=(p-1)*(q-1);
  const es=[3,5,7,11,13,17,19,23,29,31,35,37,41,43].filter(e=>C.gcd(e,ph)===1&&e<ph); if(!es.length) continue; const e=C.pick(es); const d=C.inv(e,ph); if(d<5) continue; return {p:Math.min(p,q),q:Math.max(p,q),n,ph,e,d}; } };
add({id:'rsadek',topic:'krypto',name:'RSA: dekrypter chiffertekst',method:true,quick:false,make(){
  const K=rsaInst(); const {p,q,n,ph,e,d}=K; const m=C.ri(2,n-2); const c=C.modpow(m,e,n);
  const bs=C.backSub(ph,e); const ee=C.egcd(ph,e);
  const eu=eucSteps(ph,e,`Finn d = e<sup>−1</sup> mod φ(n): løs ${e}d + ${ph}y = 1 med Euklid på ${ph} og ${e}.`).st;
  const pw=powSteps(c,d,n,`m = ${c}<sup>${d}</sup>`).st;
  const st=[S(`Faktoriser n = ${n} (prøv små primtall).`,[F.txt('p, q',pairCheck((x,y)=>x*y===n&&x>1&&y>1),`${p}, ${q}`)],`${n} = ${p} · ${q}.`,`Prøv å dele ${n} på 7, 11, 13, 17, 19, 23, … Du trenger bare prøve opp til √${n} ≈ ${Math.floor(Math.sqrt(n))}.`),
    S(`Regn ut φ(n) = (p − 1)(q − 1).`,[F.num('φ(n)',ph)],`φ(${n}) = ${p-1} · ${q-1} = ${ph}.`)]
    .concat(eu).concat([S(`Tilbakesubstitusjon gir 1 = s·${ph} + t·${e}. Dekrypteringsnøkkelen d = t mod ${ph}.`,[F.num('d',d)],bs.lines.join('<br>')+`<br>d ≡ ${ee.t} ≡ ${d} (mod ${ph}). Sjekk: ${e}·${d} = ${e*d} ≡ 1 (mod ${ph}).`)])
    .concat([S(`Dekrypter: m = c<sup>d</sup> mod n = ${c}<sup>${d}</sup> mod ${n}.`,[],`Nå rask eksponentiering.`)]).concat(pw);
  return {prompt:`RSA med offentlig nøkkel (n, e) = (${n}, ${e}). Du mottar chifferteksten c = ${c}. Dekrypter, dvs. løs m<sup>${e}</sup> ≡ ${c} (mod ${n}).`,
    parts:[F.num('φ(n)',ph,`${n} = ${p}·${q}, φ = ${p-1}·${q-1} = ${ph}.`),F.num('d',d,bs.lines.join('<br>')+`<br>d = ${d}.`),F.num('m',m,`m = ${c}<sup>${d}</sup> mod ${n} = ${m}. Sjekk: ${m}<sup>${e}</sup> mod ${n} = ${c} ✓`)],steps:st};
}});

/* ---------- 11. RSA: gyldig nøkkel ---------- */
add({id:'rsanokkel',topic:'krypto',name:'RSA: gyldig e? finn d',method:true,quick:false,make(){
  const K=rsaInst(); const {p,q,n,ph}=K; const bad=C.pick([...Array(40).keys()].map(i=>i+4).filter(e=>C.gcd(e,ph)>1));
  const good=C.pick([5,7,11,13,17,19,23].filter(e=>C.gcd(e,ph)===1)); const d=C.inv(good,ph); const g=C.gcd(bad,ph);
  const bs=C.backSub(ph,good);
  return {prompt:`Alice har satt opp RSA med offentlig nøkkel (n, e) = (${n}, ${bad}), men noe fungerer ikke.`,
    parts:[F.txt('Finn primtallene p og q slik at n = pq',pairCheck((x,y)=>x*y===n&&x>1&&y>1),`${p}, ${q}`,`${n} = ${p} · ${q}.`,{ph:'p, q'}),F.num('Regn ut φ(n)',ph,`(p−1)(q−1) = ${p-1}·${q-1} = ${ph}.`),
      F.num(`Hvorfor er e = ${bad} ugyldig? Regn ut gcd(${bad}, φ(n))`,g,`Både ${bad} og ${ph} er delelige med ${g}. e må være relativt primisk med φ(n) for at d = e<sup>−1</sup> mod φ(n) skal eksistere ⇒ ugyldig nøkkel.`),
      F.num(`e = ${good} er et gyldig valg. Finn dekrypteringseksponenten d`,d,`${bs.lines.join('<br>')}<br>d = ${d}.`)],
    steps:[S(`Faktoriser ${n}.`,[F.txt('p, q',pairCheck((x,y)=>x*y===n&&x>1&&y>1),`${p}, ${q}`)],`${n} = ${p}·${q}`),S(`φ(n) = (p−1)(q−1)`,[F.num('φ(n)',ph)],`${ph}`),
      S(`Krav: gcd(e, φ(n)) = 1. Regn ut gcd(${bad}, ${ph}).`,[F.num('gcd',g)],`gcd = ${g} ≠ 1, så ${bad} har ingen invers mod ${ph} — ugyldig.`),
      ...eucSteps(ph,good,`For e = ${good}: løs ${good}d ≡ 1 (mod ${ph}) med Euklid.`).st,
      S(`Tilbakesubstituer og reduser mod ${ph}.`,[F.num('d',d)],bs.lines.join('<br>')+`<br>d = ${d}`)]};
}});

/* ---------- 12. Diffie–Hellman ---------- */
add({id:'dh',topic:'krypto',name:'Diffie–Hellman',method:true,quick:false,make(){
  const q=C.pick(C.primesIn(29,113)); const g=C.ri(2,q-2); const a=C.ri(5,40), b=C.ri(5,40);
  const A=C.modpow(g,a,q), B=C.modpow(g,b,q), K=C.modpow(B,a,q);
  return {prompt:`Diffie–Hellman med offentlige parametre q = ${q} (primtall) og g = ${g}. Alice velger a = ${a}, Bob velger b = ${b}.`,
    parts:[F.num(`A = g<sup>a</sup> mod q`,A,`${g}<sup>${a}</sup> mod ${q} = ${A}`),F.num(`B = g<sup>b</sup> mod q`,B,`${g}<sup>${b}</sup> mod ${q} = ${B}`),F.num(`Felles nøkkel K`,K,`K = B<sup>a</sup> = ${B}<sup>${a}</sup> ≡ A<sup>b</sup> = ${A}<sup>${b}</sup> ≡ ${K} (mod ${q}). Begge er g<sup>ab</sup>.`)],
    steps:[S(`Alice sender A = g<sup>a</sup> mod q.`,[],`Regn ${g}<sup>${a}</sup> mod ${q}:`),...powSteps(g,a,q).st,S(`Bob sender B = g<sup>b</sup> mod q.`,[],``),...powSteps(g,b,q).st,S(`Alice regner K = B<sup>a</sup> mod q.`,[],``),...powSteps(B,a,q).st,
      S(`Eva ser q, g, A, B. For å finne K må hun finne a fra A = g<sup>a</sup> (diskret logaritme) — det er det vanskelige problemet.`,[],`K = ${K}.`)]};
}});

/* ---------- 13. Fermat-faktorisering ---------- */
add({id:'fermatfakt',topic:'tallteori',name:'Fermat-faktorisering',method:true,quick:false,make(){
  let p,q,n,a0,steps; for(;;){ const ps=C.primesIn(31,160); const i=C.ri(0,ps.length-3); p=ps[i]; q=ps[i+C.ri(1,2)]; n=p*q; a0=Math.ceil(Math.sqrt(n)); const a=(p+q)/2; steps=a-a0; if(steps<=2) break; }
  const a=(p+q)/2, b=(q-p)/2; const tries=[]; for(let x=a0;x<=a;x++) tries.push([x,x*x-n]);
  return {prompt:`Bruk Fermat-faktorisering til å finne primtall p &lt; q med p·q = ${n}.`,
    parts:[F.txt('p, q',pairCheck((x,y)=>x*y===n&&x>1&&y>1),`${p}, ${q}`,`Prøv a = ⌈√${n}⌉ = ${a0}, ${a0+1}, …: ${tries.map(([x,v])=>`${x}² − ${n} = ${v}`).join('; ')}. ${a*a-n} = ${b}² ⇒ n = ${a}² − ${b}² = (${a}−${b})(${a}+${b}) = ${p}·${q}.`,{ph:'p, q'})],
    steps:[S(`Idé: skriv n = a² − b² = (a − b)(a + b). Start med a = ⌈√n⌉.`,[F.num('⌈√n⌉',a0)],`√${n} ≈ ${Math.sqrt(n).toFixed(2)}, så a starter på ${a0}.`),
      ...tries.map(([x,v],i)=>S(`a = ${x}: regn ut a² − n.`,[F.num(`${x}² − ${n}`,v),F.yn('kvadrattall?',Number.isInteger(Math.sqrt(v)))],Number.isInteger(Math.sqrt(v))?`${v} = ${Math.sqrt(v)}² ✓ — ferdig!`:`${v} er ikke et kvadrattall, prøv a = ${x+1}.`)),
      S(`Nå er n = a² − b² med a = ${a}, b = ${b}.`,[F.txt('p, q',pairCheck((x,y)=>x*y===n&&x>1&&y>1),`${p}, ${q}`)],`p = a − b = ${p}, q = a + b = ${q}.`)]};
}});

/* ---------- 14. a ≡ b (mod x): finn alle x ---------- */
add({id:'modx',topic:'kongruens',name:'Finn alle moduler x',method:false,quick:true,make(){
  const D=C.pick([36,48,60,72,84,90,96,100,120,126,144,180,225,441,196,210]); const b=C.ri(10,300); const a=b+D*(C.chance(0.5)?1:-1);
  const divs=[]; for(let x=2;x<=Math.abs(D);x++) if(D%x===0) divs.push(x);
  return {prompt:`Finn alle naturlige tall x &gt; 1 slik at ${a} ≡ ${b} (mod x).`,
    parts:[F.num('Hvor mange slike x finnes?',divs.length,`${a} ≡ ${b} (mod x) ⇔ x | ${a} − ${b} = ${a-b}. ${Math.abs(D)} = ${C.factorStr(Math.abs(D))}. Divisorer &gt; 1: ${divs.join(', ')}.`),F.num('Største slike x',Math.abs(D),`x = ${Math.abs(D)}`)],
    steps:[S(`Definisjonen: a ≡ b (mod x) ⇔ x | (a − b). Regn ut a − b.`,[F.num('a − b',a-b)],`${a} − ${b} = ${a-b}.`),S(`Primtallsfaktoriser ${Math.abs(D)} og tell divisorer: antall divisorer = (k₁+1)(k₂+1)⋯. Husk å trekke fra x = 1.`,[F.num('antall x',divs.length)],`${Math.abs(D)} = ${C.factorStr(Math.abs(D))}; divisorer &gt; 1: ${divs.join(', ')}.`)]};
}});

})(typeof window!=='undefined'? window : globalThis);
