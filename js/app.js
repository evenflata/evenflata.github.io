/* app.js — visninger, oppgave-rendering, simulering, pugg */
(function(){
'use strict';
const C=window.C, GENS=window.GENS, EXAMS=window.EXAMS||[];
const $=(s,r=document)=>r.querySelector(s), $$=(s,r=document)=>[...r.querySelectorAll(s)];
const h=(html)=>{ const t=document.createElement('template'); t.innerHTML=html.trim(); return t.content.firstElementChild; };
const VIEW=$('#view');
const TOPICS=[
  {id:'krypto',n:'φ, RSA & Diffie–Hellman',s:'Krypto'},{id:'kongruens',n:'Kongruenser & CRT',s:'Kongruens'},{id:'tallteori',n:'Euklid, invers & diofantiske',s:'Tallteori'},
  {id:'telling',n:'Kombinatorikk / telling',s:'Telling'},{id:'mengder',n:'Mengder',s:'Mengder'},{id:'relasjoner',n:'Relasjoner & funksjoner',s:'Relasjoner'},
  {id:'logikk',n:'Utsagnslogikk',s:'Logikk'},{id:'predikat',n:'Predikatlogikk',s:'Predikat'},{id:'induksjon',n:'Induksjon & rekursjon',s:'Induksjon'},
  {id:'automat',n:'Tilstandsmaskiner & regex',s:'Automater'},{id:'grafer',n:'Grafer',s:'Grafer'},{id:'traer',n:'Trær & MST',s:'Trær'}];
const TMAP=Object.fromEntries(TOPICS.map(t=>[t.id,t]));
const GMAP=Object.fromEntries(GENS.map(g=>[g.id,g]));
const tc=id=>`--tc:var(--t-${id})`;
const TAGFIX={'h25_1_1':['krypto'],'h25_1_5':['grafer','traer'],'h25_2_1':['telling','mengder','relasjoner'],'s25_1_2':['grafer'],'s25_1_3':['induksjon','relasjoner'],'s25_1_5':['logikk'],'s25_1_6':['krypto'],'s25_1_7':['predikat'],'s25_1_8':['grafer','telling','induksjon'],'h24_1_1':['mengder'],'h24_2_1':['grafer'],'h24_2_4':['kongruens','induksjon'],'h24_2_5':['predikat'],'h24_2_6':['krypto','relasjoner'],'h23_1_5':['grafer'],'h23_1_3':['krypto'],'s24_1_8':['grafer']};
EXAMS.forEach(e=>e.tasks.forEach(t=>{ const k=`${e.key}_${t.part}_${t.n}`; t.key=k; if(TAGFIX[k]) t.tags=TAGFIX[k]; if(!t.tags.length) t.tags=['mengder']; }));
const st=C.store; st.bank=st.bank||{}; st.plan2=st.plan2||{}; st.kurs=st.kurs||{}; st.pugg=st.pugg||{}; st.sims=st.sims||[];

let toastT; function toast(msg){ let el=$('.toast'); if(!el){ el=h('<div class="toast" role="status"></div>'); document.body.appendChild(el);} el.textContent=msg; el.hidden=false; clearTimeout(toastT); toastT=setTimeout(()=>el.hidden=true,1800); }
function updCount(){ const today=new Date().toISOString().slice(0,10); $('#todayCount').textContent=(st.day&&st.day[today])||0; $('#accLine').textContent= st.total? `${Math.round(100*(st.right||0)/st.total)} % riktig totalt (${st.total})` : 'Ingen forsøk ennå'; }

/* ---------- seedet tilfeldighet (for simulering) ---------- */
function mulberry(a){ return function(){ a|=0; a=a+0x6D2B79F5|0; let t=Math.imul(a^a>>>15,1|a); t=t+Math.imul(t^t>>>7,61|t)^t; return ((t^t>>>14)>>>0)/4294967296; }; }
function withSeed(seed,fn){ const old=Math.random; Math.random=mulberry(seed); try{ return fn(); } finally { Math.random=old; } }

/* ================= FELT-WIDGETS ================= */
let uid=0;
function mkField(f, mode){
  const id='f'+(++uid); const W={f,kind:f.kind};
  if(f.kind==='num'||f.kind==='text'||f.kind==='set'){
    W.el=h(`<input class="ans" id="${id}" autocomplete="off" spellcheck="false" placeholder="${C.esc(f.ph|| (f.kind==='num'?'tall eller uttrykk, f.eks. 2^5−3':f.kind==='set'?'{1, 2, 3}':'svar'))}">`);
    W.get=()=>W.el.value; W.set=v=>{W.el.value=v||'';};
    W.check=()=>{ const v=W.el.value.trim(); if(!v) return null; if(f.kind==='num') return C.numEq(v,f.ans); if(f.kind==='set') return C.setEq(v,f.ans); try{ return f.check(v); }catch(e){ return null; } };
    W.lock=()=>W.el.disabled=true;
    W.el.addEventListener('keydown',e=>{ if(e.key==='Enter'){ e.preventDefault(); W.onEnter&&W.onEnter(); } });
    return W;
  }
  if(f.kind==='mc'){
    W.sel=-1; W.el=h(`<div class="mcg" role="radiogroup">${f.opts.map((o,i)=>`<button type="button" role="radio" aria-checked="false" data-i="${i}">${o}</button>`).join('')}</div>`);
    W.el.addEventListener('click',e=>{ const b=e.target.closest('button'); if(!b||W.locked) return; W.sel=Number(b.dataset.i); $$('button',W.el).forEach(x=>{ x.classList.toggle('sel',x===b); x.setAttribute('aria-checked',x===b); }); W.onChange&&W.onChange(); });
    W.get=()=>W.sel; W.set=v=>{ if(v==null||v<0) return; W.sel=v; $$('button',W.el).forEach((x,i)=>x.classList.toggle('sel',i===v)); };
    W.check=()=> W.sel<0? null : W.sel===f.ans; W.reveal=()=>{ $$('button',W.el)[f.ans].classList.add('right'); }; W.lock=()=>W.locked=true; return W;
  }
  if(f.kind==='multi'){
    W.el=h(`<div class="chk">${f.opts.map((o,i)=>`<label><input type="checkbox" data-i="${i}"> ${o}</label>`).join('')}</div>`);
    W.el.addEventListener('change',e=>{ e.target.closest('label').classList.toggle('sel',e.target.checked); });
    W.get=()=>$$('input',W.el).map((x,i)=>x.checked?i:-1).filter(i=>i>=0); W.set=v=>{ (v||[]).forEach(i=>{ const x=$$('input',W.el)[i]; if(x){x.checked=true;x.closest('label').classList.add('sel');} }); };
    W.check=()=>{ const s=W.get(); return s.length===f.ans.length && s.every(i=>f.ans.includes(i)); }; W.lock=()=>$$('input',W.el).forEach(x=>x.disabled=true); return W;
  }
  if(f.kind==='self'){
    W.el=h(`<div class="row"><span class="muted">Skriv svaret på papir. Sammenlign med løsningsforslaget og vurder deg selv.</span></div>`);
    W.res=null; W.check=()=>W.res; W.selfOnly=true; return W;
  }
  if(f.kind==='tt') return mkTT(f);
  if(f.kind==='dfa') return mkDFA(f);
  if(f.kind==='regex') return mkRegex(f);
  if(f.kind==='mst') return mkMST(f);
  W.el=h('<span>?</span>'); W.check=()=>null; return W;
}
function mkTT(f){
  const vs=C.fvars(f.f), rows=C.rows(vs), subs=C.subformulas(f.f).slice(0,-1); const W={f,kind:'tt'};
  W.el=h(`<div><div class="tblwrap"><table class="tt"><tr>${vs.map(v=>`<th>${v}</th>`).join('')}${subs.map(s=>`<th class="hc">${C.fstr(s)}</th>`).join('')}<th>${C.fstr(f.f)}</th></tr>${rows.map((e,r)=>`<tr>${vs.map(v=>`<td>${e[v]?'T':'F'}</td>`).join('')}${subs.map(s=>`<td class="hc ${C.feval(s,e)?'t':'f'}">${C.feval(s,e)?'T':'F'}</td>`).join('')}<td class="cell" data-r="${r}" tabindex="0" aria-label="rad ${r+1}"></td></tr>`).join('')}</table></div><div class="row" style="margin-top:6px"><button type="button" class="btn ghost sm hcb">Vis hjelpekolonner</button><span class="muted" style="font-size:13px">Klikk en celle: tom → T → F</span></div></div>`);
  const vals=rows.map(()=>null);
  const cyc=td=>{ const r=Number(td.dataset.r); vals[r]= vals[r]===null? true : vals[r]===true? false : null; td.textContent= vals[r]===null?'':vals[r]?'T':'F'; td.classList.remove('wrong'); };
  W.el.addEventListener('click',e=>{ const td=e.target.closest('td.cell'); if(td) cyc(td); if(e.target.closest('.hcb')) $('table',W.el).classList.toggle('showh'); });
  W.el.addEventListener('keydown',e=>{ const td=e.target.closest('td.cell'); if(td&&(e.key===' '||e.key==='Enter')){ e.preventDefault(); cyc(td);} });
  W.check=()=>{ if(vals.some(v=>v===null)) return null; let ok=true; $$('td.cell',W.el).forEach((td,r)=>{ const right=C.feval(f.f,rows[r]); if(vals[r]!==right){ ok=false; td.classList.add('wrong'); } }); return ok; };
  W.reveal=()=>{ $('table',W.el).classList.add('showh'); $$('td.cell',W.el).forEach((td,r)=>{ const v=C.feval(f.f,rows[r]); vals[r]=v; td.textContent=v?'T':'F'; td.classList.remove('wrong'); }); };
  return W;
}
function mkDFA(f){
  const l=f.lang, A=l.alpha; const W={f,kind:'dfa'}; let S=[{n:'q0',acc:false},{n:'q1',acc:false},{n:'q2',acc:false}]; let T=S.map(()=>A.map(()=>-1)); let start=0;
  W.el=h(`<div class="builder"><div><table class="btab"><thead><tr><th>Tilstand</th><th>Start</th><th>Aksept</th>${A.map(a=>`<th>på ${a}</th>`).join('')}<th></th></tr></thead><tbody></tbody></table>
    <div class="row" style="margin-top:8px"><button type="button" class="btn ghost sm add">+ tilstand</button><button type="button" class="btn sm test">Test maskinen</button></div><div class="fb dfb" style="margin-top:6px"></div></div><div class="prev fig"></div></div>`);
  const tb=$('tbody',W.el);
  const draw=()=>{ tb.innerHTML=S.map((s,i)=>`<tr><td><input type="text" value="${C.esc(s.n)}" data-i="${i}" class="nm" aria-label="navn"></td><td><input type="radio" name="st${f.label}${uid}" ${start===i?'checked':''} data-i="${i}" class="sr" aria-label="start"></td><td><input type="checkbox" ${s.acc?'checked':''} data-i="${i}" class="ac" aria-label="aksepterende"></td>${A.map((a,j)=>`<td><select data-i="${i}" data-j="${j}" class="tsel" aria-label="overgang på ${a}"><option value="-1">–</option>${S.map((x,k)=>`<option value="${k}" ${T[i][j]===k?'selected':''}>${C.esc(x.n)}</option>`).join('')}</select></td>`).join('')}<td>${S.length>1?`<button type="button" class="x" data-i="${i}" aria-label="fjern">✕</button>`:''}</td></tr>`).join(''); preview(); };
  const asD=()=>({states:S.map(s=>s.n),start,accept:new Set(S.map((s,i)=>s.acc?i:-1).filter(i=>i>=0)),alpha:A,delta:T.map(r=>Object.fromEntries(A.map((a,j)=>[a,r[j]<0?undefined:r[j]])))});
  const preview=()=>{ $('.prev',W.el).innerHTML=C.drawDFA(asD(),{id:'b'+uid}); };
  W.el.addEventListener('input',e=>{ if(e.target.classList.contains('nm')){ S[e.target.dataset.i].n=e.target.value||'?'; preview(); $$('.tsel',W.el).forEach(sel=>{ [...sel.options].slice(1).forEach((o,k)=>o.textContent=S[k].n); }); } });
  W.el.addEventListener('change',e=>{ const t=e.target; if(t.classList.contains('sr')) start=Number(t.dataset.i); if(t.classList.contains('ac')) S[t.dataset.i].acc=t.checked; if(t.classList.contains('tsel')) T[t.dataset.i][t.dataset.j]=Number(t.value); preview(); });
  W.el.addEventListener('click',e=>{ const t=e.target;
    if(t.classList.contains('add')){ if(S.length>=8) return toast('Maks 8 tilstander'); S.push({n:'q'+S.length,acc:false}); T.push(A.map(()=>-1)); draw(); }
    if(t.classList.contains('x')){ const i=Number(t.dataset.i); S.splice(i,1); T.splice(i,1); T=T.map(r=>r.map(k=>k===i?-1:k>i?k-1:k)); if(start>=S.length||start===i) start=0; draw(); }
    if(t.classList.contains('test')){ const r=W.check(); W.onTest&&W.onTest(r); } });
  W.check=()=>{ const d=asD(); const res=window.langCheck(l,s=>C.runDFA(d,s).acc); const fb=$('.dfb',W.el);
    const missing=T.some(r=>r.some(k=>k<0));
    if(res.ok){ fb.className='fb dfb ok'; fb.innerHTML=`✓ Riktig! Testet alle strenger opp til lengde ${A.length>2?7:10}.${missing?' (Manglende piler tolkes som avvisning — på eksamen bør du tegne en søppeltilstand.)':''}`; return true; }
    fb.className='fb dfb bad'; fb.innerHTML=`✗ Strengen «${res.s||'Λ (tom)'}» ${res.got?'aksepteres av maskinen din, men er <u>ikke</u> i språket':'avvises av maskinen din, men <u>er</u> i språket'}.`; return false; };
  W.reveal=()=>{ const m=l.dfa; S=m.states.map((n,i)=>({n,acc:m.accept.has(i)})); start=m.start; T=m.delta.map(r=>A.map(a=>r[a]===undefined?-1:r[a])); draw(); };
  draw(); return W;
}
function mkRegex(f){ const W={f,kind:'regex'}; const l=f.lang;
  W.el=h(`<div style="display:flex;flex-direction:column;gap:6px"><div class="row"><input class="ans" placeholder="f.eks. 1*01*(0|1)*" autocomplete="off" spellcheck="false"><button type="button" class="btn sm test">Test uttrykket</button></div><div class="fb rfb"></div></div>`);
  const inp=$('input',W.el); W.get=()=>inp.value; W.set=v=>inp.value=v||'';
  W.check=()=>{ const v=inp.value.trim(); const fb=$('.rfb',W.el); if(!v) return null; let re; try{ re=C.regexToJS(v); }catch(e){ fb.className='fb rfb bad'; fb.textContent='Ugyldig uttrykk: '+(e.message||e); return null; }
    const r=window.langCheck(l,s=>re.test(s)); if(r.ok){ fb.className='fb rfb ok'; fb.textContent='✓ Riktig — stemmer for alle strenger opp til lengde '+(l.alpha.length>2?7:10)+'.'; return true; }
    fb.className='fb rfb bad'; fb.innerHTML=`✗ «${r.s||'Λ (tom streng)'}» ${r.got?'matches av uttrykket ditt, men er ikke i språket':'matches ikke, men er i språket'}.`; return false; };
  $('.test',W.el).addEventListener('click',()=>{ const r=W.check(); W.onTest&&W.onTest(r); }); inp.addEventListener('keydown',e=>{ if(e.key==='Enter'){ e.preventDefault(); W.check(); } });
  W.reveal=()=>{ inp.value=l.re; }; W.lock=()=>inp.disabled=true; return W; }
function mkMST(f){ const g=f.g, W={f,kind:'mst'}; let chosen=[], inTree=new Set(f.mode==='prim'?[f.start]:[]), mistakes=0; const parent=[...Array(g.n).keys()]; const find=x=>parent[x]===x?x:(parent[x]=find(parent[x]));
  W.el=h(`<div><div class="fig gwrap"></div><div class="row"><span class="msg muted">${f.mode==='prim'?`Start i node ${f.start+1}.`:'Start med den billigste kanten.'}</span></div><div class="row" style="margin-top:6px"><button type="button" class="btn ghost sm rs">Start på nytt</button><span class="tot muted"></span></div></div>`);
  const draw=()=>{ $('.gwrap',W.el).innerHTML=C.drawGraph(g,{w:g.w,h:g.h,click:true,hi:new Set(chosen.map(e=>C.ekey(e[0],e[1]))),hiNodes:f.mode==='prim'?inTree:null}); $('.tot',W.el).textContent=`Valgt ${chosen.length}/${g.n-1} kanter · vekt ${chosen.reduce((a,e)=>a+e[2],0)}`; };
  const msg=(t,cls)=>{ const m=$('.msg',W.el); m.className='msg fb '+(cls||''); m.innerHTML=t; };
  W.el.addEventListener('click',e=>{ if(e.target.closest('.rs')){ chosen=[]; inTree=new Set(f.mode==='prim'?[f.start]:[]); parent.forEach((_,i)=>parent[i]=i); draw(); msg('Startet på nytt.'); return; }
    const ge=e.target.closest('.edge'); if(!ge||chosen.length>=g.n-1) return; const [u,v,w]=g.edges[Number(ge.dataset.i)];
    if(chosen.some(c=>C.ekey(c[0],c[1])===C.ekey(u,v))) return;
    if(f.mode==='prim'){ const cross=g.edges.filter(([a,b])=>inTree.has(a)!==inTree.has(b)); const minw=Math.min(...cross.map(x=>x[2]));
      if(inTree.has(u)===inTree.has(v)){ mistakes++; return msg(`✗ Kanten ${u+1}–${v+1} ${inTree.has(u)?'lager en sykel (begge endene er allerede i treet)':'er ikke koblet til treet ennå'}. Prim vokser alltid ut fra treet.`,'bad'); }
      if(w>minw){ mistakes++; const c=cross.find(x=>x[2]===minw); return msg(`✗ Det finnes en billigere kant ut av treet: ${c[0]+1}–${c[1]+1} med vekt ${minw}.`,'bad'); }
      inTree.add(u); inTree.add(v); }
    else { if(find(u)===find(v)){ mistakes++; return msg(`✗ ${u+1}–${v+1} lager en sykel med kantene du har valgt.`,'bad'); }
      const rem=g.edges.filter(([a,b])=>find(a)!==find(b)); const minw=Math.min(...rem.map(x=>x[2])); if(w>minw){ mistakes++; const c=rem.find(x=>x[2]===minw); return msg(`✗ Kruskal tar den billigste kanten som ikke lager sykel: ${c[0]+1}–${c[1]+1} (vekt ${minw}).`,'bad'); }
      parent[find(u)]=find(v); }
    chosen.push([u,v,w]); draw();
    if(chosen.length===g.n-1){ msg(`✓ Ferdig! Minimalt spenntre med totalvekt ${chosen.reduce((a,e)=>a+e[2],0)}${mistakes?` (${mistakes} feilklikk underveis)`:''}.`,'ok'); W.onTest&&W.onTest(true); }
    else msg(`✓ ${u+1}–${v+1} (vekt ${w}). Neste?`,'ok'); });
  W.check=()=> chosen.length===g.n-1 ? (mistakes===0||true) : null;
  W.reveal=()=>{ chosen=[]; inTree=new Set([f.start]); parent.forEach((_,i)=>parent[i]=i);
    while(chosen.length<g.n-1){ let pick; if(f.mode==='prim'){ const cross=g.edges.filter(([a,b])=>inTree.has(a)!==inTree.has(b)); pick=cross.sort((a,b)=>a[2]-b[2])[0]; inTree.add(pick[0]); inTree.add(pick[1]); } else { const rem=g.edges.filter(([a,b])=>find(a)!==find(b)).sort((a,b)=>a[2]-b[2]); pick=rem[0]; parent[find(pick[0])]=find(pick[1]); } chosen.push(pick); }
    draw(); msg(`Rekkefølge: ${chosen.map(e=>`${e[0]+1}–${e[1]+1} (${e[2]})`).join(', ')}`,''); };
  W.lock=()=>{ W.el.style.pointerEvents='none'; };
  draw(); return W; }

/* ================= OPPGAVE (trening) ================= */
let streak=0;
function renderProblem(host, gen, prob, opts={}){
  host.innerHTML='';
  const t=TMAP[gen.topic];
  const card=h(`<section class="card prob" style="${tc(gen.topic)}"><div class="ph"><div class="row"><span class="pill t">${t.s}</span><h2>${gen.name}</h2>${gen.method?'<span class="pill">steg-for-steg</span>':''}</div><div class="row"><span class="streak" title="riktige på rad">${streak?'🔥 '+streak+' på rad':''}</span><button type="button" class="btn ghost sm kb">Innføring</button><button type="button" class="btn ghost sm nx">Ny oppgave ↻</button></div></div><div class="prompt">${prob.prompt}</div><div class="parts"></div><div class="actions"></div><div class="steps"></div></section>`);
  host.appendChild(card);
  const partsEl=$('.parts',card), actEl=$('.actions',card), stepsEl=$('.steps',card);
  let recorded=false; const widgets=[];
  prob.parts.forEach((f,i)=>{
    const W=mkField(f); widgets.push(W);
    const p=h(`<div class="part"><div class="lab">${prob.parts.length>1?String.fromCharCode(97+i)+') ':''}${(f.label||'').replace(/^[a-h]\)\s+/,'')}</div><div class="w"></div><div class="fb" hidden></div><div class="sol" hidden></div></div>`);
    $('.w',p).appendChild(W.el); partsEl.appendChild(p); W.part=p;
    W.onEnter=()=>check();
    if(f.kind==='self'){ const sb=h(`<div class="row"><button type="button" class="btn soft sm">Vis løsningsforslag</button></div>`); $('.w',p).appendChild(sb);
      sb.firstChild.addEventListener('click',()=>{ const s=$('.sol',p); s.hidden=false; s.innerHTML=f.sol; sb.innerHTML=''; const r=h(`<div class="selfrate"><span class="muted">Hvordan gikk det?</span><button type="button" class="g">Klarte det ✓</button><button type="button" class="b">Ikke helt ✗</button></div>`); sb.appendChild(r);
        r.addEventListener('click',e=>{ const b=e.target.closest('button'); if(!b) return; W.res=b.classList.contains('g'); $$('button',r).forEach(x=>x.classList.toggle('on',x===b)); if(!recorded){ recorded=true; C.record(gen.id,gen.topic,W.res); updCount(); } }); }); }
    if(W.kind==='dfa'||W.kind==='regex'||W.kind==='mst'){ W.onTest=(r)=>{ if(r===null) return; p.classList.toggle('ok',r); p.classList.toggle('bad',!r); if(r) showSol(W); if(!recorded&&r!==null&&(W.kind!=='mst'||r)){ recorded=true; C.record(gen.id,gen.topic,!!r); bump(!!r); updCount(); } }; }
  });
  function showSol(W){ const s=$('.sol',W.part); if(W.f.sol){ s.hidden=false; s.innerHTML=W.f.sol; } }
  function bump(ok){ streak= ok? streak+1 : 0; const sk=$('.streak',card); if(sk) sk.textContent= streak? '🔥 '+streak+' på rad':''; }
  const auto=widgets.filter(w=>!w.selfOnly && !['dfa','regex','mst'].includes(w.kind));
  function check(){
    let allOk=true, anyNull=false;
    auto.forEach(W=>{ const r=W.check(); const fb=$('.fb',W.part); fb.hidden=false; W.part.classList.remove('ok','bad');
      if(r===null){ anyNull=true; allOk=false; fb.className='fb'; fb.textContent= W.kind==='mc'?'Velg et alternativ.':W.kind==='tt'?'Fyll ut alle cellene.':'Fyll inn et svar (kunne ikke lese det).'; return; }
      if(r){ W.part.classList.add('ok'); fb.className='fb ok'; fb.textContent='✓ Riktig'; showSol(W); }
      else { allOk=false; W.part.classList.add('bad'); fb.className='fb bad'; fb.textContent='✗ Ikke riktig — prøv igjen, ta steg for steg, eller vis fasit.'; } });
    if(!anyNull && !recorded && auto.length){ recorded=true; C.record(gen.id,gen.topic,allOk); bump(allOk); updCount(); }
    if(allOk && auto.length){ toast(C.pick(['Riktig! 🎉','Sterkt!','Sånn ja!','Perfekt!','Eksamensklar!'])); const nb=$('.nb',actEl); if(nb) nb.focus(); }
  }
  function reveal(){ widgets.forEach(W=>{ if(W.selfOnly) return; const fb=$('.fb',W.part); fb.hidden=false; fb.className='fb'; fb.innerHTML=W.f.show!==undefined? `Fasit: <b>${W.f.show}</b>`:''; if(W.reveal) W.reveal(); showSol(W); }); if(!recorded && auto.length){ recorded=true; C.record(gen.id,gen.topic,false); bump(false); updCount(); } }
  if(auto.length) actEl.appendChild(h(`<button type="button" class="btn ck">Sjekk svar</button>`));
  if(prob.steps&&prob.steps.length) actEl.appendChild(h(`<button type="button" class="btn ${auto.length?'soft':''} sg">Steg for steg</button>`));
  if(auto.length||widgets.some(w=>['dfa','regex','mst'].includes(w.kind))) actEl.appendChild(h(`<button type="button" class="btn ghost fs">Vis fasit</button>`));
  actEl.appendChild(h(`<button type="button" class="btn ghost nb">Neste oppgave →</button>`));
  actEl.addEventListener('click',e=>{ const b=e.target.closest('button'); if(!b) return;
    if(b.classList.contains('ck')) check();
    if(b.classList.contains('fs')) reveal();
    if(b.classList.contains('sg')){ b.disabled=true; renderSteps(stepsEl,prob.steps); }
    if(b.classList.contains('nb')) opts.next&&opts.next(); });
  $('.nx',card).addEventListener('click',()=>opts.next&&opts.next(true));
  $('.kb',card).addEventListener('click',()=>{ kursId=gen.topic; location.hash='#innforing'; });
  if(!auto.length && prob.steps && prob.steps.length && gen.id==='induksjon'){ /* induksjon: start rett i stegene om ønsket */ }
  return card;
}
function renderSteps(host,steps){
  host.innerHTML=''; host.appendChild(h(`<div class="eyebrow">Steg for steg</div>`));
  const add=(i)=>{ if(i>=steps.length){ host.appendChild(h(`<div class="explain">Ferdig! Gå tilbake til oppgaven over og svar — nå kan du metoden.</div>`)); return; }
    const s=steps[i]; const el=h(`<div class="step"><div class="no">${i+1}</div><div class="body"><div class="q">${s.q}</div><div class="fields"></div><div class="row act"></div><div class="hintbox"></div><div class="exbox"></div></div></div>`); host.appendChild(el);
    const ws=s.fields.map(f=>{ const W=mkField(f); const wrap=h(`<div class="fl">${f.kind!=='mc'&&f.kind!=='tt'&&f.label?`<span>${f.label}</span>`:''}</div>`); wrap.appendChild(W.el); $('.fields',el).appendChild(wrap); return W; });
    const act=$('.act',el);
    const finish=()=>{ if(el.classList.contains('done')) return; el.classList.add('done'); act.innerHTML=''; if(s.explain) $('.exbox',el).appendChild(h(`<div class="explain">${s.explain}</div>`)); add(i+1); };
    if(!ws.length){ if(s.explain) $('.exbox',el).appendChild(h(`<div class="explain">${s.explain}</div>`)); const nb=h(`<button type="button" class="btn soft sm">Neste steg →</button>`); act.appendChild(nb); nb.addEventListener('click',()=>{ el.classList.add('done'); act.innerHTML=''; add(i+1); }); return; }
    const ck=h(`<button type="button" class="btn sm">Sjekk</button>`), hb=s.hint?h(`<button type="button" class="btn ghost sm">Hint</button>`):null, vb=h(`<button type="button" class="btn ghost sm">Vis svar</button>`);
    act.appendChild(ck); if(hb) act.appendChild(hb); act.appendChild(vb);
    const fb=h(`<span class="fb"></span>`); act.appendChild(fb);
    const doCheck=()=>{ let ok=true, nul=false; ws.forEach(W=>{ const r=W.check(); if(r===null) nul=true; else if(!r) ok=false; }); if(nul){ fb.className='fb'; fb.textContent='Fyll inn alt først.'; return; } if(ok){ finish(); } else { fb.className='fb bad'; fb.textContent='✗ Ikke helt — prøv igjen eller bruk hint.'; } };
    ws.forEach(W=>{ W.onEnter=doCheck; W.onChange=()=>{ if(ws.length===1&&W.kind==='mc') doCheck(); }; });
    ck.addEventListener('click',doCheck);
    if(hb) hb.addEventListener('click',()=>{ $('.hintbox',el).innerHTML=`<div class="hint">💡 ${s.hint}</div>`; hb.remove(); });
    vb.addEventListener('click',()=>{ ws.forEach(W=>{ if(W.reveal) W.reveal(); else if(W.set){ W.set(W.f.kind==='mc'?W.f.ans:String(W.f.show).replace(/<[^>]+>/g,'')); } }); finish(); });
    const first=$('input,button',$('.fields',el)); if(first&&first.tagName==='INPUT') setTimeout(()=>first.focus({preventScroll:true}),30);
  };
  add(0); host.scrollIntoView({behavior:'smooth',block:'nearest'});
}

/* ================= HJEM ================= */
const PLAN=[
  ['60–90 min','Les innføringen — ett emne om gangen, og gjør 2–3 oppgaver rett etter hvert emne','#innforing'],
  ['15 min','Pugg-kortene: formlene du ikke får på formelark','#pugg'],
  ['60 min','Tallteori steg for steg: Euklid → invers → RSA-dekryptering → kongruenssystem','trener:tallteori,krypto,kongruens'],
  ['30 min','Telling: mengder & funksjoner, passord, stjerner og streker, anagrammer','trener:telling,mengder'],
  ['30 min','Logikk og relasjoner: sannhetstabeller, relasjonsegenskaper, kvantorer','trener:logikk,relasjoner,predikat'],
  ['30 min','Tilstandsmaskiner: bygg 2–3 maskiner og et par regulære uttrykk','trener:automat'],
  ['20 min','Induksjon: 2–3 bevis steg for steg','trener:induksjon'],
  ['20 min','Grafer og trær: MST, Euler/Hamilton, isomorfi','trener:grafer,traer'],
  ['Valgfritt','En prøveeksamen, eller gamle eksamensoppgaver — og så legg deg i tide','#simulering']];
function topicStats(id){ const s=(st.top||{})[id]||{a:0,c:0}; return s; }
function examFreq(id){ return EXAMS.map(e=>e.tasks.some(t=>t.tags.includes(id))); }
function viewHjem(){
  VIEW.innerHTML='';
  const head=h(`<div class="head"><div class="eyebrow">TMA4412 Matematikk 2C · Diskret matematikk</div><h1>Ett emne om gangen</h1><p>Alt her er laget av pensumoppgaver, øvinger og eksamenene 2023–2026. Fra 2025 er det <b>ingen formelark</b>, så nivået speiler H25 og K26.</p></div>`);
  VIEW.appendChild(head);
  const hero=h(`<div class="hero"><div class="card cd"><h2>Husker du lite? Start her.</h2><div class="big" style="font-size:30px">Innføring i 12 korte leksjoner</div><p>Hvert emne forklart enkelt: hva det handler om, formlene du må kunne, ett ferdig løst eksempel og vanlige feller. Ca. 5 minutter per emne — så rett over i oppgaver på akkurat det.</p><div class="row" style="margin-top:14px"><a class="btn" style="background:#fff;color:#b0245a" href="#innforing">Start innføringen</a><a class="btn" style="background:rgba(255,255,255,.18);color:#fff" href="#trener">Gå rett til oppgaver</a></div></div>
    <div class="card"><h3 style="font-size:17px">Forslag til rekkefølge</h3><div class="plan" id="plan"></div></div></div>`);
  VIEW.appendChild(hero);
  const pl=$('#plan',hero);
  PLAN.forEach(([tm,txt,go],i)=>{ const lb=h(`<label class="${st.plan2[i]?'done':''}"><input type="checkbox" ${st.plan2[i]?'checked':''}><div><span>${txt}</span> <a href="${go.startsWith('#')?go:'#trener'}" data-go="${go}" style="font-size:13px;font-weight:800">åpne →</a><div class="tm">${tm}</div></div></label>`); pl.appendChild(lb);
    $('input',lb).addEventListener('change',e=>{ st.plan2[i]=e.target.checked; lb.classList.toggle('done',e.target.checked); C.save(); });
    $('a',lb).addEventListener('click',e=>{ const g=e.target.dataset.go; if(g.startsWith('trener:')){ e.preventDefault(); trainer.topics=new Set(g.slice(7).split(',')); trainer.gen=null; location.hash='#trener'; } }); });
  VIEW.appendChild(h(`<div class="row" style="justify-content:space-between"><h2 style="font-size:20px">Emner — trykk for å terpe</h2><span class="muted" style="font-size:13px">Rutene viser hvilke av de 6 siste eksamenssettene (H25, K26, S25, H24, S24, H23) emnet var med i.</span></div>`));
  const grid=h(`<div class="grid g4"></div>`);
  TOPICS.map(t=>({t,f:examFreq(t.id)})).sort((a,b)=>b.f.filter(Boolean).length-a.f.filter(Boolean).length).forEach(({t,f})=>{ const s=topicStats(t.id); const pct=s.a?Math.round(100*s.c/s.a):0; const n=GENS.filter(g=>g.topic===t.id).length;
    const c=h(`<div class="card tcard" style="${tc(t.id)}" tabindex="0" role="button"><h3>${t.n}</h3><div class="freq" title="eksamener">${f.map(x=>`<i class="${x?'on':''}"></i>`).join('')}</div><div class="tstat"><span>${n} oppgavetyper</span><span>${s.a?`${s.c}/${s.a} riktig`:'ikke prøvd'}</span></div><div class="bar"><i style="width:${pct}%"></i></div></div>`);
    const go=()=>{ trainer.topics=new Set([t.id]); trainer.gen=null; location.hash='#trener'; }; c.addEventListener('click',go); c.addEventListener('keydown',e=>{ if(e.key==='Enter') go(); }); grid.appendChild(c); });
  VIEW.appendChild(grid);
  VIEW.appendChild(h(`<div class="fmt"><div class="card"><div class="eyebrow">Høst 2025</div><h3>5 skriftlige (60 p) + 20 tallsvar/flervalg (40 p)</h3><ul><li>φ(n) og bevis om partall</li><li>RSA-dekryptering med Euklid + toerpotenser</li><li>Lucas-tall + sterk induksjon</li><li>Tilstandsmaskin + regulært uttrykk</li><li>Trær, komplement og isomorfi</li><li>Del 2: tell funksjoner/relasjoner, relasjonsegenskaper, løsbare kongruenssystemer, tautologier, passord og anagram</li></ul></div>
    <div class="card"><div class="eyebrow">Kont 2026</div><h3>10 oppgaver à 10 poeng</h3><ul><li>A × B, injeksjoner, bijeksjoner, funksjoner</li><li>Stjerner og streker + passord</li><li>MST med Prim/Kruskal</li><li>Sannhetstabell: tautologi/kontradiksjon</li><li>RSA: ugyldig e, finn d</li><li>Kongruenssystem med CRT</li><li>Kvantorer over ℝ \\ {0}</li><li>Relasjoner og funksjoner på ℕ</li><li>Induksjon: sum av oddetall</li><li>Tilstandsmaskiner + regex</li></ul></div></div>`));
}

/* ================= TRENER ================= */
const trainer={topics:new Set(),gen:null,mode:'mix'};
function weightOf(g){ const s=(st.gen||{})[g.id]; const acc= s&&s.a? s.c/s.a : 0.4; const recent=s&&s.last&&s.last.length? s.last.reduce((a,c)=>a+c,0)/s.last.length : 0.4; return 0.6+2.2*(1-(acc+recent)/2) + (s&&s.a?0:0.8); }
function pickGen(){ let pool=GENS.filter(g=>!trainer.topics.size||trainer.topics.has(g.topic)); if(trainer.mode==='method') pool=pool.filter(g=>g.method); if(trainer.mode==='quick') pool=pool.filter(g=>g.quick); if(!pool.length) pool=GENS;
  const ws=pool.map(weightOf); let r=Math.random()*ws.reduce((a,c)=>a+c,0); for(let i=0;i<pool.length;i++){ r-=ws[i]; if(r<=0) return pool[i]; } return pool[pool.length-1]; }
function viewTrener(){
  VIEW.innerHTML='';
  VIEW.appendChild(h(`<div class="head"><div class="eyebrow">Oppgavetrener</div><h1>Terp oppgaver — uendelig mange varianter</h1><p>Velg en oppgavetype, eller la blandet modus prioritere det du er svakest på. Står du fast: <b>Steg for steg</b> leder deg gjennom metoden med sjekk på hvert steg.</p></div>`));
  const bar=h(`<div class="card" style="padding:12px 14px"><div class="modebar"><span class="eyebrow" style="margin-right:4px">Emner</span><button type="button" class="chip ${trainer.topics.size?'':'on'}" data-t="">Alle</button>${TOPICS.map(t=>`<button type="button" class="chip ${trainer.topics.has(t.id)?'on':''}" style="${tc(t.id)}" data-t="${t.id}"><span class="dot"></span>${t.s}</button>`).join('')}</div>
    <div class="modebar" style="margin-top:8px"><span class="eyebrow" style="margin-right:4px">Modus</span>${[['mix','Blandet (svakest først)'],['method','Bare metodeoppgaver'],['quick','Raske tallsvar']].map(([k,n])=>`<button type="button" class="chip ${trainer.mode===k&&!trainer.gen?'on':''}" data-m="${k}">${n}</button>`).join('')}</div></div>`);
  VIEW.appendChild(bar);
  const lay=h(`<div class="tlayout"><aside class="card typelist" aria-label="oppgavetyper"></aside><div class="probhost"></div></div>`); VIEW.appendChild(lay);
  const list=$('.typelist',lay), host=$('.probhost',lay);
  const drawList=()=>{ list.innerHTML=TOPICS.filter(t=>!trainer.topics.size||trainer.topics.has(t.id)).map(t=>`<h4 style="${tc(t.id)}"><span class="dot"></span>${t.n}</h4>`+GENS.filter(g=>g.topic===t.id).map(g=>{ const s=(st.gen||{})[g.id]; return `<button type="button" class="ty ${trainer.gen===g.id?'on':''}" data-g="${g.id}"><span>${g.name}${g.method?'<span class="m">STEG</span>':''}</span><span class="sc">${s?`${s.c}/${s.a}`:''}</span></button>`; }).join('')).join(''); };
  const next=()=>{ const g= trainer.gen? GMAP[trainer.gen] : pickGen(); let prob; try{ prob=g.make(); }catch(e){ console.error(e); prob=null; } if(!prob) return next(); renderProblem(host,g,prob,{next:()=>{ next(); drawList(); host.scrollIntoView({behavior:'smooth',block:'start'}); }}); drawList(); };
  bar.addEventListener('click',e=>{ const b=e.target.closest('button'); if(!b) return; if(b.dataset.t!==undefined){ const t=b.dataset.t; if(!t) trainer.topics.clear(); else trainer.topics.has(t)? trainer.topics.delete(t) : trainer.topics.add(t); trainer.gen=null; viewTrener(); } if(b.dataset.m){ trainer.mode=b.dataset.m; trainer.gen=null; viewTrener(); } });
  list.addEventListener('click',e=>{ const b=e.target.closest('.ty'); if(!b) return; trainer.gen=b.dataset.g; next(); if(window.innerWidth<900) host.scrollIntoView({behavior:'smooth'}); });
  next();
}

/* ================= GAMLE EKSAMENER ================= */
const bankF={exam:'',topic:'',status:''};
function viewOppgaver(){
  VIEW.innerHTML='';
  VIEW.appendChild(h(`<div class="head"><div class="eyebrow">Gamle eksamener med løsningsforslag</div><h1>Ekte eksamensoppgaver, én og én</h1><p>Løs oppgaven på papir, åpne løsningsforslaget og merk hvordan det gikk. Merket «ikke helt»? Bruk <b>Tren lignende</b> for nye varianter av samme type.</p></div>`));
  const f=h(`<div class="card filters"><select id="fe" class="ans" style="max-width:220px" aria-label="eksamen"><option value="">Alle eksamener</option>${EXAMS.map(e=>`<option value="${e.key}" ${bankF.exam===e.key?'selected':''}>${e.label}</option>`).join('')}</select><select id="ft" class="ans" style="max-width:230px" aria-label="emne"><option value="">Alle emner</option>${TOPICS.map(t=>`<option value="${t.id}" ${bankF.topic===t.id?'selected':''}>${t.n}</option>`).join('')}</select><select id="fs" class="ans" style="max-width:200px" aria-label="status"><option value="">Alle</option><option value="new" ${bankF.status==='new'?'selected':''}>Ikke merket</option><option value="b" ${bankF.status==='b'?'selected':''}>Merket «ikke helt»</option></select><span class="muted" id="bcount"></span></div>`);
  VIEW.appendChild(f);
  const list=h(`<div class="bank"></div>`); VIEW.appendChild(list);
  const draw=()=>{ list.innerHTML=''; let n=0;
    EXAMS.filter(e=>!bankF.exam||e.key===bankF.exam).forEach(e=>e.tasks.forEach(t=>{
      if(bankF.topic&&!t.tags.includes(bankF.topic)) return; const sr=st.bank[t.key]; if(bankF.status==='new'&&sr) return; if(bankF.status==='b'&&sr!=='b'&&sr!=='m') return; n++;
      const multiPart=e.tasks.some(x=>x.part===2);
      const c=h(`<article class="card exq"><div class="hd"><div class="row"><h3>${e.label} · ${multiPart?`Del ${t.part} · `:''}Oppgave ${t.n}</h3>${t.tags.map(g=>`<span class="pill t" style="${tc(g)}">${TMAP[g].s}</span>`).join('')}</div><div class="selfrate">${[['g','Klarte den'],['m','Delvis'],['b','Ikke helt']].map(([k,l])=>`<button type="button" class="${k} ${sr===k?'on':''}" data-k="${k}">${l}</button>`).join('')}</div></div><div class="blocks"></div><div class="row"><button type="button" class="btn soft sm lf">Vis løsningsforslag</button><button type="button" class="btn ghost sm tl">Tren lignende →</button></div></article>`);
      const bl=$('.blocks',c);
      t.blocks.forEach(([typ,name,w,hgt])=>{ const img=`<img loading="lazy" src="ex/${name}" width="${w}" height="${hgt}" alt="${typ==='q'?'Oppgavetekst':'Løsningsforslag'} ${e.label} oppgave ${t.n}">`; bl.appendChild(h(typ==='q'?`<div>${img}</div>`:`<div class="lfbox" hidden><div class="eyebrow" style="margin-bottom:6px">Løsningsforslag</div>${img}</div>`)); });
      $('.lf',c).addEventListener('click',ev=>{ const boxes=$$('.lfbox',c); const show=boxes.some(b=>b.hidden); boxes.forEach(b=>b.hidden=!show); ev.target.textContent= show?'Skjul løsningsforslag':'Vis løsningsforslag'; });
      $('.tl',c).addEventListener('click',()=>{ trainer.topics=new Set(t.tags); trainer.gen=null; location.hash='#trener'; });
      $('.selfrate',c).addEventListener('click',ev=>{ const b=ev.target.closest('button'); if(!b) return; st.bank[t.key]=b.dataset.k; C.save(); $$('button',b.parentNode).forEach(x=>x.classList.toggle('on',x===b)); toast('Lagret'); });
      list.appendChild(c); }));
    $('#bcount').textContent=`${n} oppgaver`; if(!n) list.appendChild(h(`<div class="card muted">Ingen oppgaver med dette filteret.</div>`)); };
  f.addEventListener('change',()=>{ bankF.exam=$('#fe').value; bankF.topic=$('#ft').value; bankF.status=$('#fs').value; draw(); });
  draw();
}

/* ================= SIMULERING ================= */
const FORMATS={
  h25:{name:'H25-format',desc:'Del 1: 5 skriftlige oppgaver à 12 p. Del 2: tallsvar/flervalg à 2 p per deloppgave.',min:240,
    sections:[{t:'Del 1 — skriftlige oppgaver',tasks:[{g:['phi','fermat'],p:12},{g:['rsadek'],p:12},{g:['rekursjon','induksjon'],p:12},{g:['dfaDesign','regexDesign'],p:12},{g:['treFakta','komplement'],p:12}]},
      {t:'Del 2 — tallsvar og flervalg (2 p per deloppgave)',per:2,tasks:[{g:['mengdetell']},{g:['relinf']},{g:['crtlos']},{g:['klassifiser','klassifiser','klassifiser','klassifiser']},{g:['passord']},{g:['anagram']}]}]},
  k26:{name:'K26-format',desc:'10 oppgaver à 10 poeng, alt skriftlig med begrunnelse.',min:240,
    sections:[{t:'Oppgaver',tasks:[{g:['mengdetell'],p:10},{g:['stjerner','passord'],p:10},{g:['mst'],p:10},{g:['klassifiser','klassifiser','klassifiser','klassifiser'],p:10},{g:['rsanokkel'],p:10},{g:['crt'],p:10},{g:['predinf'],p:10},{g:['relinf','funk'],p:10},{g:['induksjon'],p:10},{g:['dfaDesign','regexDesign'],p:10}]}]},
  lyn:{name:'Lynprøve',desc:'12 raske tallsvar/flervalg på tvers av pensum. 45 minutter.',min:45,
    sections:[{t:'Lynprøve',per:2,tasks:[{g:['mengdetell']},{g:['invers']},{g:['phi']},{g:['crtlos']},{g:['klassifiser']},{g:['relendelig']},{g:['predendelig']},{g:['stjerner']},{g:['dfaKjor']},{g:['grafEuler']},{g:['linkong']},{g:['utvalg']}]}]}};
let sim=null;
function buildSim(fmt,seed){ return withSeed(seed,()=>{ const F=FORMATS[fmt]; let no=0; return F.sections.map(sec=>({t:sec.t,tasks:sec.tasks.map(tk=>{ no++; const items=tk.g.map(id=>({gen:GMAP[id],prob:GMAP[id].make()})); const nparts=items.reduce((a,it)=>a+it.prob.parts.length,0); const pts=tk.p|| (sec.per||2)*nparts; return {no,items,pts,nparts}; })})); }); }
function viewSim(){
  VIEW.innerHTML='';
  if(sim&&!sim.done){ return renderSim(); }
  VIEW.appendChild(h(`<div class="head"><div class="eyebrow">Eksamenssimulering</div><h1>Prøveeksamen på tid</h1><p>Nye oppgaver hver gang, satt sammen som de to siste eksamenene. Tallsvar rettes automatisk; bevis og forklaringer retter du selv mot løsningsforslaget. Ingen formelark — som på ekte.</p></div>`));
  const g=h(`<div class="grid g3"></div>`);
  Object.entries(FORMATS).forEach(([k,F])=>{ const c=h(`<div class="card" style="display:flex;flex-direction:column;gap:8px"><div class="eyebrow">${F.min>=60?F.min/60+' timer':F.min+' min'}</div><h3 style="font-size:19px">${F.name}</h3><p class="muted" style="margin:0">${F.desc}</p><div class="row" style="margin-top:auto"><button type="button" class="btn">Start</button></div></div>`);
    $('button',c).addEventListener('click',()=>{ const seed=Math.floor(Math.random()*1e9); sim={fmt:k,seed,start:Date.now(),min:F.min,answers:{}}; saveSim(); renderSim(); }); g.appendChild(c); });
  VIEW.appendChild(g);
  if(st.sims.length){ VIEW.appendChild(h(`<div class="card"><h3 style="font-size:17px;margin-bottom:8px">Dine tidligere simuleringer</h3><div class="tblwrap"><table class="hist"><tr><th>Når</th><th>Format</th><th>Poeng</th><th>Karakter</th><th>Tid brukt</th></tr>${st.sims.slice().reverse().map(s=>`<tr><td>${new Date(s.at).toLocaleString('nb-NO',{weekday:'short',hour:'2-digit',minute:'2-digit'})}</td><td>${FORMATS[s.fmt]?FORMATS[s.fmt].name:s.fmt}</td><td>${s.score.toFixed(1)} / ${s.max} (${Math.round(100*s.score/s.max)} %)</td><td><b>${grade(100*s.score/s.max)}</b></td><td>${s.mins} min</td></tr>`).join('')}</table></div></div>`)); }
}
function saveSim(){ try{ localStorage.setItem('dm2c_sim',JSON.stringify(sim)); }catch(e){} }
function grade(p){ return p>=89?'A':p>=77?'B':p>=65?'C':p>=53?'D':p>=41?'E':'F'; }
function renderSim(){
  VIEW.innerHTML=''; const F=FORMATS[sim.fmt]; const secs=buildSim(sim.fmt,sim.seed); const all=[];
  const bar=h(`<div class="simbar"><div><div class="eyebrow">${F.name}</div><div class="timer" id="tmr">–</div></div><div class="row"><span class="muted" id="prog"></span><button type="button" class="btn ghost sm" id="quit">Avbryt</button><button type="button" class="btn" id="deliver">Lever og rett</button></div></div>`);
  VIEW.appendChild(bar);
  VIEW.appendChild(h(`<div class="card tip" style="border-left:0">Svarfeltene tar tall og uttrykk (f.eks. <span class="fx">3^5-2*7</span>, <span class="fx">12!/(3!*3!)</span>, <span class="fx">C(16,3)</span>). Bevis og forklaringer skriver du på papir og retter selv etterpå. Siden husker svarene dine hvis du laster den på nytt.</div>`));
  secs.forEach(sec=>{ if(secs.length>1) VIEW.appendChild(h(`<h2 class="sec">${sec.t}</h2>`));
    sec.tasks.forEach(tk=>{ const c=h(`<section class="card simtask"><h3><span>Oppgave ${tk.no}</span><span class="pts">${tk.pts} poeng</span></h3><div class="items"></div><div class="tres"></div></section>`); VIEW.appendChild(c); tk.el=c; tk.ws=[];
      let letter=0;
      tk.items.forEach((it,ii)=>{ const box=h(`<div style="display:flex;flex-direction:column;gap:10px;margin-top:10px"><div class="prompt">${it.prob.prompt}</div><div class="parts"></div><div class="stp"></div></div>`); $('.items',c).appendChild(box);
        it.prob.parts.forEach((f,pi)=>{ const W=mkField(f,'exam'); const key=`${tk.no}_${ii}_${pi}`; W.key=key; tk.ws.push(W); all.push(W);
          const p=h(`<div class="part"><div class="lab">${String.fromCharCode(97+letter++)}) ${(f.label||'').replace(/^[a-h]\)\s+/,'')}</div><div class="w"></div><div class="fb" hidden></div><div class="sol" hidden></div><div class="ptwrap"></div></div>`); $('.w',p).appendChild(W.el); $('.parts',box).appendChild(p); W.part=p; W.item=it;
          if(W.set && sim.answers[key]!==undefined) W.set(sim.answers[key]);
          const store=()=>{ if(W.get){ sim.answers[key]=W.get(); saveSim(); prog(); } };
          W.el.addEventListener('input',store); W.el.addEventListener('change',store); W.el.addEventListener('click',()=>setTimeout(store,0)); });
        it.box=box; }); }); });
  const prog=()=>{ const filled=all.filter(W=>W.get&&((Array.isArray(W.get())&&W.get().length)||(typeof W.get()==='number'&&W.get()>=0)||(typeof W.get()==='string'&&W.get().trim()))).length; $('#prog').textContent=`${filled}/${all.filter(W=>W.get).length} felt besvart`; };
  prog();
  const tick=()=>{ const left=sim.start+sim.min*6e4-Date.now(); const el=$('#tmr'); if(!el) return clearInterval(window.__st); if(left<=0){ el.textContent='Tiden er ute!'; el.classList.add('low'); return; } const hh=Math.floor(left/3.6e6), mm=Math.floor(left%3.6e6/6e4), ss=Math.floor(left%6e4/1e3); el.textContent=`${hh}:${String(mm).padStart(2,'0')}:${String(ss).padStart(2,'0')}`; el.classList.toggle('low',left<10*6e4); };
  tick(); clearInterval(window.__st); window.__st=setInterval(tick,1000);
  $('#quit').addEventListener('click',e=>{ if(e.target.dataset.sure){ sim=null; try{localStorage.removeItem('dm2c_sim');}catch(_){} clearInterval(window.__st); viewSim(); } else { e.target.dataset.sure=1; e.target.textContent='Sikker? Klikk igjen'; } });
  $('#deliver').addEventListener('click',e=>{ if(!e.target.dataset.sure){ e.target.dataset.sure=1; e.target.textContent='Lever nå? Klikk igjen'; return; } grade_(secs); });
}
function grade_(secs){
  clearInterval(window.__st); const used=Math.round((Date.now()-sim.start)/6e4); let score=0, max=0; const per={};
  const tasks=secs.flatMap(s=>s.tasks);
  const sumEl=h(`<div class="card" id="simres" style="display:flex;gap:18px;align-items:center;flex-wrap:wrap"><div class="gradebadge" id="gb">–</div><div><div class="eyebrow">Resultat</div><div class="score" id="sc">–</div><div class="muted" id="scsub"></div></div><div style="flex:1;min-width:220px" id="pertop"></div></div>`);
  $('.simbar').replaceWith(sumEl);
  const recompute=()=>{ score=0; max=0; Object.keys(per).forEach(k=>delete per[k]);
    tasks.forEach(tk=>{ const share=tk.pts/tk.ws.length; let got=0; tk.ws.forEach(W=>{ const v=W.selfOnly? (W.pts===undefined?0:W.pts) : (W.result?share:0); got+=v; const tp=W.item.gen.topic; per[tp]=per[tp]||{g:0,m:0}; per[tp].g+=v; per[tp].m+=share; }); score+=got; max+=tk.pts; $('.pts',tk.el).textContent=`${got.toFixed(1)} / ${tk.pts} poeng`; });
    const pct=100*score/max; $('#gb').textContent=grade(pct); $('#sc').textContent=`${score.toFixed(1)} / ${max}`; $('#scsub').textContent=`${Math.round(pct)} % · ${used} min brukt · selvrettede bevis teller når du gir poeng under`;
    $('#pertop').innerHTML=Object.entries(per).sort((a,b)=>a[1].g/a[1].m-b[1].g/b[1].m).map(([t,v])=>`<div class="tstat" style="${tc(t)}"><span><span class="dot"></span> ${TMAP[t].s}</span><span>${Math.round(100*v.g/v.m)} %</span></div><div class="bar" style="${tc(t)};margin-bottom:5px"><i style="width:${100*v.g/v.m}%"></i></div>`).join('');
    const rec=st.sims.find(s=>s.seed===sim.seed); if(rec){ rec.score=score; } C.save(); };
  tasks.forEach(tk=>{ tk.ws.forEach(W=>{ const share=tk.pts/tk.ws.length; const fb=$('.fb',W.part), sol=$('.sol',W.part); W.lock&&W.lock();
      if(W.selfOnly){ sol.hidden=false; sol.innerHTML=W.f.sol; const steps=Math.max(1,Math.round(share)); const ps=h(`<div class="ptsel"><span class="muted" style="font-size:13px;margin-right:6px">Gi deg selv poeng:</span>${[...Array(steps+1).keys()].map(i=>`<button type="button" data-v="${i*share/steps}">${+(i*share/steps).toFixed(1)}</button>`).join('')}</div>`); $('.ptwrap',W.part).appendChild(ps);
        ps.addEventListener('click',e=>{ const b=e.target.closest('button'); if(!b) return; W.pts=Number(b.dataset.v); $$('button',ps).forEach(x=>x.classList.toggle('on',x===b)); recompute(); }); return; }
      const r=W.check(); W.result=!!r; W.part.classList.add(r?'ok':'bad'); fb.hidden=false; fb.className='fb '+(r?'ok':'bad'); fb.innerHTML= r? '✓ Riktig' : `✗ ${r===null?'Ikke besvart':'Feil'} — fasit: <b>${W.f.show!==undefined?W.f.show:''}</b>`; if(!r&&W.reveal) W.reveal(); if(W.f.sol){ sol.hidden=false; sol.innerHTML=W.f.sol; }
      if(r!==null) C.record(W.item.gen.id,W.item.gen.topic,!!r); });
    tk.items.forEach(it=>{ if(it.prob.steps&&it.prob.steps.length){ const b=h(`<button type="button" class="btn soft sm" style="align-self:flex-start">Se steg for steg</button>`); $('.stp',it.box).appendChild(b); b.addEventListener('click',()=>{ b.remove(); renderSteps($('.stp',it.box),it.prob.steps); }); } }); });
  st.sims.push({at:Date.now(),fmt:sim.fmt,seed:sim.seed,score:0,max:tasks.reduce((a,t)=>a+t.pts,0),mins:used});
  recompute(); updCount(); sim.done=true; try{localStorage.removeItem('dm2c_sim');}catch(_){}
  const again=h(`<div class="row"><button type="button" class="btn">Ny simulering</button><a class="btn ghost" href="#trener">Tren på svake emner</a></div>`); VIEW.appendChild(again); $('button',again).addEventListener('click',()=>{ sim=null; viewSim(); window.scrollTo(0,0); });
  window.scrollTo({top:0,behavior:'smooth'});
}

/* ================= PUGG ================= */
const CARDS=[
 ['telling','Antall funksjoner A → B','|B|<sup>|A|</sup> (hvert element i A har |B| valg)'],
 ['telling','Injektive funksjoner A → B (|A| = k, |B| = n)','P(n,k) = n!/(n−k)! = n(n−1)⋯(n−k+1)'],
 ['telling','Surjektive funksjoner A → B (|A| = m, |B| = n)','Σ<sub>i=0</sub><sup>n</sup> (−1)<sup>i</sup> C(n,i)(n−i)<sup>m</sup>. F.eks. m=5, n=3: 3⁵ − 3·2⁵ + 3·1⁵ = 150'],
 ['telling','Bijeksjoner mellom to mengder med n elementer','n!'],
 ['telling','Antall relasjoner på A (|A| = n)','2<sup>n²</sup> (delmengder av A×A). Refleksive: 2<sup>n(n−1)</sup>. Symmetriske: 2<sup>n(n+1)/2</sup>.'],
 ['telling','|P(A)| og |A × B|','2<sup>|A|</sup> og |A|·|B|'],
 ['telling','De fire utvalgsmodellene (k av n)','Ordnet u/tilb.: n!/(n−k)! · Uordnet u/tilb.: C(n,k) · Ordnet m/tilb.: n<sup>k</sup> · Uordnet m/tilb.: C(n+k−1, k)'],
 ['telling','Heltallsløsninger x₁+⋯+x<sub>k</sub> = n, x<sub>i</sub> ≥ 0','C(n+k−1, k−1) (stjerner og streker). Nedre grenser: trekk fra først.'],
 ['telling','Anagrammer av ord med n bokstaver der bokstaver gjentas k₁, k₂, … ganger','n!/(k₁!·k₂!⋯)'],
 ['telling','Inklusjon–eksklusjon for tre mengder','|A∪B∪C| = |A|+|B|+|C| − |A∩B| − |A∩C| − |B∩C| + |A∩B∩C|'],
 ['telling','«Minst én …»','Tell komplementet: alle − ingen'],
 ['telling','Duehullprinsippet','n+1 duer i n hull ⇒ et hull har minst 2. Generelt: minst ⌈N/k⌉ i ett hull.'],
 ['tallteori','Divisjonsalgoritmen','a = q·b + r med 0 ≤ r < b, unike q og r'],
 ['tallteori','Euklids algoritme','gcd(a,b) = gcd(b, a mod b). Siste rest ≠ 0 er gcd.'],
 ['tallteori','Bézout','Det finnes heltall s,t med s·a + t·b = gcd(a,b). Finnes ved tilbakesubstitusjon.'],
 ['tallteori','Når er ax + by = c løsbar? Generell løsning?','⇔ d = gcd(a,b) | c. x = x₀ + (b/d)t, y = y₀ − (a/d)t'],
 ['tallteori','Når har a en invers mod n?','⇔ gcd(a,n) = 1. Løs ax + ny = 1; inversen er x mod n.'],
 ['kongruens','Når er ax ≡ b (mod n) løsbar, og hvor mange løsninger?','⇔ d = gcd(a,n) | b. Da d løsninger mod n (én løsning mod n/d).'],
 ['kongruens','Kinesisk restteorem','x ≡ r₁ (mod m₁), x ≡ r₂ (mod m₂) med gcd(m₁,m₂)=1 har én løsning mod m₁m₂. Generelt løsbart ⇔ gcd(m₁,m₂) | r₁ − r₂, unik mod lcm.'],
 ['kongruens','Metode for system av to kongruenser','x = r₁ + m₁t → sett inn i nr. 2 → løs m₁t ≡ r₂ − r₁ (mod m₂) for t → sett inn igjen.'],
 ['kongruens','Fermats lille teorem','p primtall, p ∤ a ⇒ a<sup>p−1</sup> ≡ 1 (mod p). Alltid a<sup>p</sup> ≡ a.'],
 ['kongruens','Eulers teorem','gcd(a,n) = 1 ⇒ a<sup>φ(n)</sup> ≡ 1 (mod n)'],
 ['kongruens','Delelighet med 9 / 3','n ≡ tverrsum(n) (mod 9), fordi 10 ≡ 1 (mod 9)'],
 ['krypto','Eulers φ','φ(p<sup>k</sup>) = p<sup>k</sup> − p<sup>k−1</sup>, multiplikativ: φ(n) = Π (p<sub>i</sub><sup>k<sub>i</sub></sup> − p<sub>i</sub><sup>k<sub>i</sub>−1</sup>). φ(pq) = (p−1)(q−1), φ(p) = p−1.'],
 ['krypto','RSA-oppsett','n = pq, φ(n) = (p−1)(q−1), velg e med gcd(e,φ(n)) = 1, d = e<sup>−1</sup> mod φ(n). Offentlig (n,e), hemmelig d.'],
 ['krypto','RSA kryptering/dekryptering','c = m<sup>e</sup> mod n, m = c<sup>d</sup> mod n'],
 ['krypto','Rask eksponentiering','Skriv eksponenten som sum av toerpotenser, kvadrer gjentatte ganger mod n, gang sammen de du trenger.'],
 ['krypto','Diffie–Hellman','Offentlig q (primtall), g. A = g<sup>a</sup>, B = g<sup>b</sup> mod q. Felles K = B<sup>a</sup> = A<sup>b</sup> = g<sup>ab</sup>. Sikkerhet: diskret logaritme er vanskelig.'],
 ['krypto','Fermat-faktorisering','n = a² − b² = (a−b)(a+b). Prøv a = ⌈√n⌉, ⌈√n⌉+1, … til a² − n er et kvadrattall.'],
 ['logikk','Implikasjon','p → q ≡ ¬p ∨ q ≡ ¬q → ¬p (kontraposisjon). Usann bare når p = T, q = F.'],
 ['logikk','Negasjon av implikasjon','¬(p → q) ≡ p ∧ ¬q'],
 ['logikk','De Morgan','¬(p ∧ q) ≡ ¬p ∨ ¬q, ¬(p ∨ q) ≡ ¬p ∧ ¬q'],
 ['logikk','Biimplikasjon','p ↔ q ≡ (p → q) ∧ (q → p) ≡ (p ∧ q) ∨ (¬p ∧ ¬q)'],
 ['logikk','Tautologi / kontradiksjon / logisk konsekvens','Alltid sann / alltid usann / A ⊨ B: B er sann i alle rader der A er sann'],
 ['predikat','Negasjon av kvantorer','¬∀x P(x) ≡ ∃x ¬P(x), ¬∃x P(x) ≡ ∀x ¬P(x). Snu hver kvantor, skyv ¬ inn.'],
 ['predikat','∀x∃y vs ∃y∀x','∃y∀x P ⇒ ∀x∃y P, men ikke omvendt. ∀x∃y: y kan avhenge av x.'],
 ['relasjoner','Refleksiv / symmetrisk / antisymmetrisk / transitiv','(a,a) ∈ R ∀a / (a,b) ⇒ (b,a) / (a,b),(b,a) ⇒ a=b / (a,b),(b,c) ⇒ (a,c)'],
 ['relasjoner','Ekvivalensrelasjon og partiell ordning','Ekvivalens: R + S + T. Partiell ordning: R + A + T.'],
 ['relasjoner','Injektiv / surjektiv / bijektiv','f(x)=f(y) ⇒ x=y / alle y treffes / begge (har invers)'],
 ['induksjon','Mal: vanlig induksjon','1) Basis P(n₀). 2) IH: anta P(k) for vilkårlig k ≥ n₀. 3) Steg: vis P(k+1) med IH. 4) Konklusjon.'],
 ['induksjon','Mal: sterk induksjon','Basis: så mange tilfeller som rekursjonen bruker (ofte 2). IH: anta P(i) for alle n₀ ≤ i ≤ k. Vis P(k+1).'],
 ['automat','Deterministisk endelig tilstandsmaskin','Én pil per symbol ut av hver tilstand, én start, aksepterende tilstander (dobbel sirkel). Bruk søppeltilstand.'],
 ['automat','Regulære uttrykk','| eller, * null eller flere, konkatenasjon, Λ tom streng. (0|1)* = alle bitstrenger.'],
 ['grafer','Håndhilselemmaet','Σ deg(v) = 2|E| ⇒ antall noder med odde grad er partall'],
 ['grafer','Eulerkrets / Eulervei','Krets ⇔ sammenhengende og alle grader partall. Åpen vei ⇔ nøyaktig 2 odde noder (start/slutt).'],
 ['grafer','Hamiltonsykel','Besøker hver node nøyaktig én gang. Ingen enkel betingelse — argumenter med grad-1-noder eller noder som må brukes to ganger.'],
 ['grafer','Komplett graf og komplement','|E(Kₙ)| = n(n−1)/2. |E(Ḡ)| = n(n−1)/2 − |E(G)|. deg<sub>Ḡ</sub>(v) = n−1−deg(v).'],
 ['grafer','Isomorfi','Bijeksjon som bevarer kanter. Invarianter: #noder, #kanter, gradfølge, sykler. Ulik invariant ⇒ ikke isomorfe.'],
 ['traer','Trær','Sammenhengende uten sykler ⇔ sammenhengende med n − 1 kanter. Skog med k komponenter: n − k kanter.'],
 ['traer','Fullt m-ært tre med i indre noder','n = mi + 1 noder, l = (m−1)i + 1 blader'],
 ['traer','Prim og Kruskal','Prim: voks fra én node, billigste kant ut av treet. Kruskal: billigste kant totalt som ikke lager sykel. Begge stopper ved n − 1 kanter.']];
let pugg={mode:'kort',i:0,flip:false,deck:null,topic:''};
function viewPugg(){
  VIEW.innerHTML='';
  VIEW.appendChild(h(`<div class="head"><div class="eyebrow">Pugg — du får ikke formelark</div><h1>Formler og regler du må kunne utenat</h1><p>${CARDS.length} kort, kun det som trengs for å løse oppgavene. Kort du merker «øv mer» kommer oftere.</p></div>`));
  const bar=h(`<div class="row"><button type="button" class="chip ${pugg.mode==='kort'?'on':''}" data-m="kort">Flashcards</button><button type="button" class="chip ${pugg.mode==='ark'?'on':''}" data-m="ark">Hele arket</button><span style="flex:1"></span><select class="ans" id="pt" style="max-width:220px" aria-label="emne"><option value="">Alle emner</option>${TOPICS.filter(t=>CARDS.some(c=>c[0]===t.id)).map(t=>`<option value="${t.id}" ${pugg.topic===t.id?'selected':''}>${t.n}</option>`).join('')}</select></div>`);
  VIEW.appendChild(bar);
  bar.addEventListener('click',e=>{ const b=e.target.closest('[data-m]'); if(b){ pugg.mode=b.dataset.m; viewPugg(); } });
  $('#pt',bar).addEventListener('change',e=>{ pugg.topic=e.target.value; pugg.deck=null; viewPugg(); });
  const cards=CARDS.map((c,i)=>({c,i})).filter(x=>!pugg.topic||x.c[0]===pugg.topic);
  if(pugg.mode==='ark'){ const sh=h(`<div class="sheet"></div>`); TOPICS.forEach(t=>{ const cs=cards.filter(x=>x.c[0]===t.id); if(!cs.length) return; sh.appendChild(h(`<div class="card" style="${tc(t.id)}"><h3><span class="dot"></span>${t.n}</h3><dl>${cs.map(x=>`<div><dt>${x.c[1]}</dt><dd>${x.c[2]}</dd></div>`).join('')}</dl></div>`)); }); VIEW.appendChild(sh); return; }
  if(!pugg.deck){ const ws=cards.map(x=>{ const lv=st.pugg[x.i]||0; return {x,w:Math.random()*(1+lv*1.5)}; }); pugg.deck=ws.sort((a,b)=>a.w-b.w).map(o=>o.x.i); pugg.i=0; pugg.flip=false; }
  const known=cards.filter(x=>(st.pugg[x.i]||0)>=1).length;
  const idx=pugg.deck[pugg.i%pugg.deck.length]; const c=CARDS[idx];
  const card=h(`<div class="card flash" style="${tc(c[0])};border-top:4px solid var(--tc)" tabindex="0" role="button" aria-label="snu kortet"><span class="pill t">${TMAP[c[0]].s}</span><div class="q">${c[1]}</div>${pugg.flip?`<div class="a">${c[2]}</div>`:'<div class="muted">Si svaret høyt — trykk for å snu</div>'}</div>`);
  VIEW.appendChild(card);
  const ctr=h(`<div class="row" style="justify-content:space-between"><span class="muted">Kort ${pugg.i%pugg.deck.length+1} av ${pugg.deck.length} · ${known} kan du</span><div class="row"><button type="button" class="btn ghost" data-a="0">Øv mer</button><button type="button" class="btn" data-a="1">Kunne det ✓</button></div></div>`);
  VIEW.appendChild(ctr);
  const flip=()=>{ pugg.flip=!pugg.flip; viewPugg(); }; card.addEventListener('click',flip); card.addEventListener('keydown',e=>{ if(e.key===' '||e.key==='Enter'){ e.preventDefault(); flip(); } });
  ctr.addEventListener('click',e=>{ const b=e.target.closest('[data-a]'); if(!b) return; st.pugg[idx]=b.dataset.a==='1'? Math.min(3,(st.pugg[idx]||0)+1) : 0; C.save(); if(b.dataset.a==='0') pugg.deck.push(idx); pugg.i++; pugg.flip=false; viewPugg(); });
}


/* ================= INNFØRING ================= */
let kursId=null;
function viewInnforing(){
  const K=window.KURS; if(!kursId) kursId=(K.find(k=>!st.kurs[k.id])||K[0]).id;
  const i=K.findIndex(k=>k.id===kursId), k=K[i]; const ngen=GENS.filter(g=>g.topic===k.id).length;
  VIEW.innerHTML='';
  VIEW.appendChild(h(`<div class="head"><div class="eyebrow">Innføring · ${K.filter(x=>st.kurs[x.id]).length} av ${K.length} lest</div><h1>Kort innføring i hvert emne</h1><p>Les ett emne (ca. 5 min), og gjør så 2–3 oppgaver på akkurat det. Det sitter bedre enn å lese alt først.</p></div>`));
  const lay=h(`<div class="tlayout"><aside class="card typelist" aria-label="emner">${K.map((x,j)=>`<button type="button" class="ty ${x.id===kursId?'on':''}" data-k="${x.id}" style="${tc(x.id)}"><span><span class="dot"></span>&nbsp; ${j+1}. ${x.t}</span><span class="sc">${st.kurs[x.id]?'✓':x.min+' min'}</span></button>`).join('')}</aside>
    <article class="card kurs" style="${tc(k.id)};border-top:4px solid var(--tc)">
      <div class="row" style="justify-content:space-between"><span class="pill t">${TMAP[k.id].s}</span><span class="muted" style="font-size:13px">ca. ${k.min} min</span></div>
      <h2>${i+1}. ${k.t}</h2>
      <p class="idea">${k.idea}</p>
      ${k.sections? k.sections.map(sc=>`<section class="ksec"><h3>${sc.h}</h3><div class="kbody">${sc.body}</div>${sc.demo?'<div class="demohost"></div>':''}${sc.rule?`<div class="krule">${sc.rule}</div>`:''}</section>`).join('') : ''}
      ${k.must?`<h3>Dette må du kunne</h3>
      <div class="must">${k.must.map(([a,b])=>`<div class="mrow${b.includes('<table')?' wide':''}"><div class="mk">${a}</div><div class="mv">${b}</div></div>`).join('')}</div>`:''}
      <h3>Ferdig løst eksempel${k.sections?' (slik det ser ut på eksamen)':''}</h3>
      <div class="exbox2"><div class="exq2">${k.ex.q}</div><ol>${k.ex.s.map(x=>`<li>${x}</li>`).join('')}</ol></div>
      <h3>Typiske feller</h3>
      <ul class="traps">${k.traps.map(x=>`<li>${x}</li>`).join('')}</ul>
      <div class="row" style="margin-top:6px"><button type="button" class="btn tr">Tren på dette (${ngen} oppgavetyper) →</button><button type="button" class="btn ghost nk">${i<K.length-1?'Neste emne: '+K[i+1].t+' →':'Til forsiden'}</button></div>
    </article></div>`);
  VIEW.appendChild(lay);
  const dh=$('.demohost',lay); if(dh&&window.KURS_DEMO) window.KURS_DEMO(dh);
  const markRead=()=>{ st.kurs[k.id]=true; C.save(); };
  $('.typelist',lay).addEventListener('click',e=>{ const bt=e.target.closest('[data-k]'); if(!bt) return; kursId=bt.dataset.k; viewInnforing(); window.scrollTo(0,0); });
  $('.tr',lay).addEventListener('click',()=>{ markRead(); trainer.topics=new Set([k.id]); trainer.gen=null; location.hash='#trener'; });
  $('.nk',lay).addEventListener('click',()=>{ markRead(); if(i<K.length-1){ kursId=K[i+1].id; viewInnforing(); window.scrollTo(0,0); } else location.hash='#hjem'; });
}

/* ================= RUTER ================= */
const ROUTES={hjem:viewHjem,innforing:viewInnforing,trener:viewTrener,oppgaver:viewOppgaver,simulering:viewSim,pugg:viewPugg};
function route(){ const r=(location.hash||'#hjem').slice(1); const fn=ROUTES[r]||viewHjem; $$('#nav a').forEach(a=>a.classList.toggle('on',a.dataset.r===(ROUTES[r]?r:'hjem'))); if(r!=='simulering') clearInterval(window.__st); fn(); window.scrollTo(0,0); }
window.addEventListener('hashchange',route);
try{ const s=JSON.parse(localStorage.getItem('dm2c_sim')); if(s&&!s.done) sim=s; }catch(e){}
try{ const th=localStorage.getItem('dm2c_theme'); if(th) document.documentElement.dataset.theme=th; }catch(e){}
$('#themeBtn').addEventListener('click',()=>{ const cur=document.documentElement.dataset.theme || (matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light'); const nx=cur==='dark'?'light':'dark'; document.documentElement.dataset.theme=nx; try{ localStorage.setItem('dm2c_theme',nx); }catch(e){} });
updCount(); route();
})();
