/* core.js — verktøy: tilfeldighet, tallteori, uttrykksparser, svarsjekk, logikk, tegning */
(function(G){
'use strict';
const C = G.C = {};

/* ---------- tilfeldighet ---------- */
C.ri = (a,b)=> a + Math.floor(Math.random()*(b-a+1));
C.pick = arr => arr[Math.floor(Math.random()*arr.length)];
C.shuffle = arr => { const a=arr.slice(); for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];} return a; };
C.sample = (arr,k)=> C.shuffle(arr).slice(0,k);
C.chance = p => Math.random()<p;

/* ---------- tallteori ---------- */
const gcd = C.gcd = (a,b)=>{ a=Math.abs(a); b=Math.abs(b); while(b){[a,b]=[b,a%b];} return a; };
C.lcm = (a,b)=> a/gcd(a,b)*b;
C.mod = (a,n)=> ((a%n)+n)%n;
C.isPrime = n=>{ if(n<2) return false; for(let d=2;d*d<=n;d++) if(n%d===0) return false; return true; };
C.primesIn = (a,b)=>{ const r=[]; for(let i=a;i<=b;i++) if(C.isPrime(i)) r.push(i); return r; };
C.factor = n=>{ const f=[]; let m=n; for(let p=2;p*p<=m;p++){ let k=0; while(m%p===0){m/=p;k++;} if(k) f.push([p,k]); } if(m>1) f.push([m,1]); return f; };
C.phi = n=> C.factor(n).reduce((acc,[p,k])=> acc*(Math.pow(p,k)-Math.pow(p,k-1)),1);
C.factorStr = n=> C.factor(n).map(([p,k])=> k>1? `${p}<sup>${k}</sup>`:`${p}`).join(' · ');
C.modpow = (a,e,n)=>{ let r=1n, b=BigInt(C.mod(a,n)), E=BigInt(e), N=BigInt(n); while(E>0n){ if(E&1n) r=r*b%N; b=b*b%N; E>>=1n; } return Number(r); };
/* Euklid med steg: returnerer rader [a,q,b,r] slik at a = q·b + r */
C.euclidRows = (a,b)=>{ const rows=[]; while(b!==0){ const q=Math.floor(a/b), r=a%b; rows.push([a,q,b,r]); a=b; b=r; } return rows; };
/* utvidet Euklid: s,t slik at s·a + t·b = gcd */
C.egcd = (a,b)=>{ let [or,r]=[a,b],[os,s]=[1,0],[ot,t]=[0,1]; while(r!==0){ const q=Math.floor(or/r); [or,r]=[r,or-q*r]; [os,s]=[s,os-q*s]; [ot,t]=[t,ot-q*t]; } return {g:or,s:os,t:ot}; };
C.inv = (a,n)=>{ const e=C.egcd(C.mod(a,n),n); return e.g===1? C.mod(e.s,n) : null; };
/* tilbakesubstitusjon som HTML-linjer, for a·s + b·t = 1 (a>b) */
C.backSub = (a,b)=>{
  const rows=C.euclidRows(a,b); // a = q b + r
  const useful=rows.filter(r=>r[3]!==0);
  if(!useful.length) return {lines:[],s:0,t:1};
  // start: g = x - q*y fra siste rad med rest g
  let last=useful[useful.length-1];
  const g=last[3];
  // representer g = c1*X + c2*Y der X,Y er tall
  let X=last[0], Y=last[2], c1=1, c2=-last[1];
  const lines=[`${g} = ${X} − ${last[1]}·${Y}`];
  for(let i=useful.length-2;i>=0;i--){
    const [A,Q,B,R]=useful[i]; // R = A - Q*B ; R er Y i nåværende uttrykk
    // erstatt Y=R: c1*X + c2*(A - Q*B) ; X == B
    const nc1=c2, nc2=c1 - c2*Q; // koeff for A og B
    lines.push(`&nbsp;&nbsp;= ${fmtLin(c1,X,c2,`(${A} − ${Q}·${B})`)}`);
    X=A; Y=B; c1=nc1; c2=nc2;
    lines.push(`&nbsp;&nbsp;= ${fmtLin(c1,X,c2,Y)}`);
  }
  return {lines, cA:c1, A:X, cB:c2, B:Y};
};
function fmtLin(c1,X,c2,Y){ const s2 = c2<0? ` − ${Math.abs(c2)===1?'':Math.abs(c2)+'·'}${Y}` : ` + ${c2===1?'':c2+'·'}${Y}`; return `${c1===1?'':c1===-1?'−':c1+'·'}${X}${s2}`; }
C.squaringTable = (a,e,n)=>{ // returnerer {bits:[potenser], rows:[[2^i, verdi]]}
  const bits=[]; for(let i=0;(1<<i)<=e;i++) if(e&(1<<i)) bits.push(1<<i);
  const rows=[]; let v=C.mod(a,n), p=1; rows.push([1,v]);
  while(p*2<=e){ v=v*v%n; p*=2; rows.push([p,v]); }
  return {bits:bits.reverse(), rows};
};
C.binom = (n,k)=>{ if(k<0||k>n) return 0n; let r=1n; for(let i=1;i<=k;i++){ r=r*BigInt(n-k+i)/BigInt(i);} return r; };
C.fact = n=>{ let r=1n; for(let i=2;i<=n;i++) r*=BigInt(i); return r; };
C.perm = (n,k)=>{ if(k>n) return 0n; let r=1n; for(let i=0;i<k;i++) r*=BigInt(n-i); return r; };
C.surj = (m,n)=>{ let s=0n; for(let i=0;i<=n;i++){ const t=C.binom(n,i)*BigInt(n-i)**BigInt(m); s += (i%2? -t : t);} return s; };
C.fmt = x=>{ const s=String(x); return s.replace(/\B(?=(\d{3})+(?!\d))/g,' '); };

/* ---------- rasjonal uttrykksparser (BigInt) ---------- */
function R(n,d=1n){ if(d<0n){n=-n;d=-d;} const g=bgcd(n<0n?-n:n,d); return {n:n/g,d:d/g}; }
function bgcd(a,b){ while(b){[a,b]=[b,a%b];} return a||1n; }
const Ra={ add:(a,b)=>R(a.n*b.d+b.n*a.d,a.d*b.d), sub:(a,b)=>R(a.n*b.d-b.n*a.d,a.d*b.d), mul:(a,b)=>R(a.n*b.n,a.d*b.d), div:(a,b)=>{ if(b.n===0n) throw 'del på 0'; return R(a.n*b.d,a.d*b.n);} };
C.evalExpr = function(str){
  let s=String(str).trim().toLowerCase()
    .replace(/[·×⋅∙]/g,'*').replace(/−|–/g,'-').replace(/\*\*/g,'^').replace(/÷/g,'/')
    .replace(/(\d)[\s '.](?=\d{3}(\D|$))/g,'$1').replace(/(\d)[\s '.](?=\d{3}(\D|$))/g,'$1')
    .replace(/\s+/g,'');
  if(!s) throw 'tomt';
  let i=0;
  const peek=()=>s[i];
  function num(){ let j=i; while(i<s.length && /[0-9]/.test(s[i])) i++; if(j===i) throw 'forventet tall'; return R(BigInt(s.slice(j,i))); }
  function primary(){
    const c=peek();
    if(c==='('){ i++; const v=expr(); if(s[i]!==')') throw 'mangler )'; i++; return v; }
    if(c==='-'){ i++; const v=power(); return R(-v.n,v.d); }
    if(c==='+'){ i++; return power(); }
    if(/[a-z]/.test(c)){ let j=i; while(i<s.length && /[a-z]/.test(s[i])) i++; const name=s.slice(j,i);
      if(s[i]!=='(') throw 'ukjent navn '+name; i++; const a=expr(); let b=null; if(s[i]===','){ i++; b=expr(); } if(s[i]!==')') throw 'mangler )'; i++;
      const ai=a.n/a.d, bi=b? b.n/b.d : null;
      if(name==='c'||name==='binom'||name==='ncr') return R(C.binom(Number(ai),Number(bi)));
      if(name==='p'||name==='npr') return R(C.perm(Number(ai),Number(bi)));
      if(name==='phi'||name==='φ') return R(BigInt(C.phi(Number(ai))));
      throw 'ukjent funksjon '+name; }
    if(/[0-9]/.test(c)) return num();
    throw 'uventet tegn '+(c||'slutt');
  }
  function postfix(){ let v=primary(); while(s[i]==='!'){ i++; if(v.d!==1n||v.n<0n||v.n>2000n) throw 'ugyldig fakultet'; v=R(C.fact(Number(v.n))); } return v; }
  function power(){ const b=postfix(); if(s[i]==='^'){ i++; const e=power(); if(e.d!==1n||e.n<0n||e.n>100000n) throw 'ugyldig eksponent'; return R(b.n**e.n, b.d**e.n);} return b; }
  function term(){ let v=power(); while(i<s.length && (s[i]==='*'||s[i]==='/'||s[i]==='('||/[0-9a-z]/.test(s[i]))){ const op=s[i]; if(op==='*'||op==='/') i++; const r=power(); v= op==='/'? Ra.div(v,r) : Ra.mul(v,r);} return v; }
  function expr(){ let v=term(); while(s[i]==='+'||s[i]==='-'){ const op=s[i++]; const r=term(); v= op==='+'? Ra.add(v,r):Ra.sub(v,r);} return v; }
  const v=expr(); if(i<s.length) throw 'uventet '+s[i]; return v;
};
C.numEq = (input, ans)=>{ try{ const v=C.evalExpr(input); const a = (typeof ans==='object' && ans && 'n' in ans)? ans : R(BigInt(ans)); return v.n===a.n && v.d===a.d; }catch(e){ return null; } };

/* sett-parsing: "{1,2,{3}}" eller "{(1,2),(2,3)}" -> sorterte nøkler */
C.parseSet = str=>{
  let s=String(str).trim().replace(/∅/g,'{}').replace(/⟨/g,'(').replace(/⟩/g,')').replace(/\s+/g,'');
  if(s==='') return null;
  if(s[0]!=='{'||s[s.length-1]!=='}') return null;
  const inner=s.slice(1,-1); const out=[]; let depth=0, cur='';
  for(const ch of inner){ if(ch==='{'||ch==='(') depth++; if(ch==='}'||ch===')') depth--; if(ch===','&&depth===0){ out.push(cur); cur=''; } else cur+=ch; }
  if(cur!=='') out.push(cur);
  return out.map(e=> e[0]==='{'? 'S'+(C.parseSet(e)||[]).slice().sort().join('|') : e);
};
C.setEq = (input, arr)=>{ const a=C.parseSet(input); if(a===null) return null; const A=new Set(a), B=new Set(arr.map(String)); if(A.size!==B.size) return false; for(const x of A) if(!B.has(x)) return false; return true; };
C.setStr = arr=> arr.length? '{'+arr.join(', ')+'}' : '∅';

/* ---------- utsagnslogikk ---------- */
const V=(v)=>({op:'var',v}), N=(a)=>({op:'not',a}), B=(op,a,b)=>({op,a,b});
C.L={V,N,A:(a,b)=>B('and',a,b),O:(a,b)=>B('or',a,b),I:(a,b)=>B('imp',a,b),E:(a,b)=>B('iff',a,b),T:{op:'top'},F:{op:'bot'}};
const SYM={and:'∧',or:'∨',imp:'→',iff:'↔'};
C.fstr = (f,top=true)=>{
  switch(f.op){
    case 'var': return f.v; case 'top': return '⊤'; case 'bot': return '⊥';
    case 'not': return '¬'+C.fstr(f.a,false);
    default: { const s=C.fstr(f.a,false)+' '+SYM[f.op]+' '+C.fstr(f.b,false); return top? s : '('+s+')'; }
  }
};
C.feval = (f,env)=>{
  switch(f.op){ case 'var': return env[f.v]; case 'top': return true; case 'bot': return false; case 'not': return !C.feval(f.a,env);
    case 'and': return C.feval(f.a,env)&&C.feval(f.b,env); case 'or': return C.feval(f.a,env)||C.feval(f.b,env);
    case 'imp': return !C.feval(f.a,env)||C.feval(f.b,env); case 'iff': return C.feval(f.a,env)===C.feval(f.b,env); }
};
C.fvars = (f,set=new Set())=>{ if(f.op==='var') set.add(f.v); if(f.a) C.fvars(f.a,set); if(f.b) C.fvars(f.b,set); return [...set].sort(); };
C.rows = vars=>{ const out=[]; const n=vars.length; for(let m=0;m<(1<<n);m++){ const env={}; vars.forEach((v,i)=> env[v]=!!(m&(1<<(n-1-i)))); out.push(env);} return out; };
C.fclass = f=>{ const vs=C.fvars(f); const vals=C.rows(vs).map(e=>C.feval(f,e)); if(vals.every(x=>x)) return 'taut'; if(vals.every(x=>!x)) return 'kontra'; return 'ingen'; };
C.subformulas = f=>{ const out=[]; (function rec(g){ if(g.op==='var'||g.op==='top'||g.op==='bot') return; if(g.a) rec(g.a); if(g.b) rec(g.b); const s=C.fstr(g); if(!out.find(x=>C.fstr(x)===s)) out.push(g); })(f); return out; };
C.silly = f=>{ if(!f||f.op==='var') return false; if(f.op==='not') return f.a.op==='not'||C.silly(f.a); if(f.b&&C.fstr(f.a)===C.fstr(f.b)) return true; if(f.b&&((f.a.op==='not'&&C.fstr(f.a.a)===C.fstr(f.b))||(f.b.op==='not'&&C.fstr(f.b.a)===C.fstr(f.a)))) return true; return C.silly(f.a)||(f.b?C.silly(f.b):false); };
C.randFormula = (vars, depth)=>{
  if(depth<=0 || (depth<2 && C.chance(0.3))){ const v=V(C.pick(vars)); return C.chance(0.25)? N(v):v; }
  const r=Math.random();
  if(r<0.12) return N(C.randFormula(vars,depth-1));
  const op=C.pick(['and','or','imp','imp','iff','and','or']);
  return B(op,C.randFormula(vars,depth-1),C.randFormula(vars,depth-1));
};

/* ---------- HTML-hjelpere ---------- */
C.esc = s=> String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
C.bin = (n,k)=> `<span class="binom"><span>${n}</span><span>${k}</span></span>`;
C.frac = (a,b)=> `<span class="frac"><span>${a}</span><span>${b}</span></span>`;
C.mod_ = n=> ` (mod ${n})`;

/* ---------- graftegning (SVG) ---------- */
C.circleLayout = (n, w=300, h=240, r=null)=>{ const cx=w/2, cy=h/2; r=r||Math.min(w,h)/2-28; return Array.from({length:n},(_,i)=>{ const a=-Math.PI/2+2*Math.PI*i/n; return [cx+r*Math.cos(a), cy+r*Math.sin(a)]; }); };
/* g: {n, labels?, edges:[[u,v,w?]], pos?}; opts: {w,h,hi:Set(edgeKey), click:true, id} */
C.ekey = (u,v)=> u<v? u+'-'+v : v+'-'+u;
C.drawGraph = (g, opts={})=>{
  const W=opts.w||320, H=opts.h||250; const pos=g.pos||C.circleLayout(g.n,W,H);
  const lab=i=> g.labels? g.labels[i] : String(i+1);
  let s=`<svg class="gsvg" viewBox="0 0 ${W} ${H}" width="${W}" role="img" aria-label="graf">`;
  g.edges.forEach(([u,v,w],idx)=>{
    const [x1,y1]=pos[u],[x2,y2]=pos[v]; const k=C.ekey(u,v);
    const hi = opts.hi && opts.hi.has(k); const dim = opts.dim && opts.dim.has(k);
    s+=`<g class="edge${hi?' hi':''}${dim?' dim':''}${opts.click?' clickable':''}" data-e="${k}" data-i="${idx}">`;
    s+=`<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" class="eline"/>`;
    if(opts.click) s+=`<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" class="ehit"/>`;
    if(w!==undefined && w!==null){ const mx=(x1+x2)/2, my=(y1+y2)/2; s+=`<rect x="${mx-10}" y="${my-9}" width="20" height="18" rx="5" class="wbg"/><text x="${mx}" y="${my+4.5}" class="wtxt">${w}</text>`; }
    s+=`</g>`;
  });
  pos.forEach(([x,y],i)=>{ const hi=opts.hiNodes&&opts.hiNodes.has(i); s+=`<g class="node${hi?' hi':''}"><circle cx="${x}" cy="${y}" r="14"/><text x="${x}" y="${y+5}">${lab(i)}</text></g>`; });
  return s+'</svg>';
};
C.adj = g=>{ const A=Array.from({length:g.n},()=>[]); g.edges.forEach(([u,v])=>{A[u].push(v);A[v].push(u);}); return A; };
C.connected = g=>{ const A=C.adj(g); const seen=new Set([0]); const st=[0]; while(st.length){ const u=st.pop(); for(const v of A[u]) if(!seen.has(v)){seen.add(v);st.push(v);} } return seen.size===g.n; };
C.degrees = g=>{ const d=Array(g.n).fill(0); g.edges.forEach(([u,v])=>{d[u]++;d[v]++;}); return d; };
C.hamCycle = g=>{ const A=C.adj(g).map(a=>new Set(a)); const n=g.n; const path=[0]; const used=new Set([0]);
  function rec(){ if(path.length===n) return A[path[n-1]].has(0); for(const v of A[path[path.length-1]]){ if(!used.has(v)){ used.add(v); path.push(v); if(rec()) return true; path.pop(); used.delete(v);} } return false; }
  return rec()? path.slice() : null; };
C.hamPath = g=>{ const A=C.adj(g).map(a=>new Set(a)); const n=g.n;
  for(let s=0;s<n;s++){ const path=[s], used=new Set([s]); const rec=()=>{ if(path.length===n) return true; for(const v of A[path[path.length-1]]) if(!used.has(v)){used.add(v);path.push(v); if(rec()) return true; path.pop(); used.delete(v);} return false; }; if(rec()) return path; }
  return null; };
C.permutations = arr=>{ if(arr.length<=1) return [arr.slice()]; const out=[]; arr.forEach((x,i)=>{ const rest=arr.slice(0,i).concat(arr.slice(i+1)); C.permutations(rest).forEach(p=>out.push([x].concat(p))); }); return out; };
C.edgeSet = g=> new Set(g.edges.map(([u,v])=>C.ekey(u,v)));
C.isIsoMap = (g,h,map)=>{ const E=C.edgeSet(h); if(g.edges.length!==h.edges.length) return false; return g.edges.every(([u,v])=>E.has(C.ekey(map[u],map[v]))); };
const PERMS={}; C.permsN = n=> PERMS[n]||(PERMS[n]=C.permutations([...Array(n).keys()]));
C.findIso = (g,h)=>{ if(g.n!==h.n||g.edges.length!==h.edges.length) return null; const dg=C.degrees(g), dh=C.degrees(h); if(dg.slice().sort().join()!==dh.slice().sort().join()) return null; const E=C.edgeSet(h); for(const p of C.permsN(g.n)){ let ok=true; for(let i=0;i<g.n;i++) if(dg[i]!==dh[p[i]]){ok=false;break;} if(!ok) continue; if(g.edges.every(([u,v])=>E.has(C.ekey(p[u],p[v])))) return p; } return null; };
C.countAuto = g=> C.permsN(g.n).filter(p=>C.isIsoMap(g,g,p)).length;
C.complement = g=>{ const E=C.edgeSet(g); const edges=[]; for(let u=0;u<g.n;u++) for(let v=u+1;v<g.n;v++) if(!E.has(C.ekey(u,v))) edges.push([u,v]); return {n:g.n,edges,labels:g.labels,pos:g.pos}; };
C.randGraph = (n,m)=>{ // sammenhengende enkel graf med m kanter
  for(let tries=0;tries<500;tries++){ const all=[]; for(let u=0;u<n;u++) for(let v=u+1;v<n;v++) all.push([u,v]); const edges=C.sample(all,m).sort((a,b)=>a[0]-b[0]||a[1]-b[1]); const g={n,edges}; if(C.connected(g)) return g; }
  return {n,edges:[...Array(n-1).keys()].map(i=>[i,i+1])};
};
/* vektet graf, nær-planar, med posisjoner */
C.randWeighted = (n, W=360, H=270)=>{
  for(let t=0;t<300;t++){
    const pos=[]; const cols=Math.ceil(Math.sqrt(n*1.4)); const rows=Math.ceil(n/cols);
    const cells=C.sample([...Array(cols*rows).keys()], n);
    cells.forEach(c=>{ const cx=c%cols, cy=Math.floor(c/cols); pos.push([30+ (W-60)*(cx+0.5)/cols + C.ri(-14,14), 26+(H-52)*(cy+0.5)/rows + C.ri(-12,12)]); });
    const d=(i,j)=>Math.hypot(pos[i][0]-pos[j][0],pos[i][1]-pos[j][1]);
    const cand=[]; for(let i=0;i<n;i++) for(let j=i+1;j<n;j++) cand.push([i,j,d(i,j)]);
    cand.sort((a,b)=>a[2]-b[2]);
    const edges=[];
    const cross=(a,b,c,dd)=>{ if(a===c||a===dd||b===c||b===dd) return false; const o=(p,q,r)=>Math.sign((q[0]-p[0])*(r[1]-p[1])-(q[1]-p[1])*(r[0]-p[0])); const P=pos; return o(P[a],P[b],P[c])!==o(P[a],P[b],P[dd]) && o(P[c],P[dd],P[a])!==o(P[c],P[dd],P[b]); };
    for(const [i,j,dist] of cand){ if(edges.length>=Math.round(n*1.75)) break; if(dist>(W/cols)*1.9) continue; if(edges.some(([a,b])=>cross(a,b,i,j))) continue; edges.push([i,j]); }
    const g={n,edges,pos,w:W,h:H}; if(!C.connected(g)) continue;
    const xs=pos.map(p=>p[0]), ys=pos.map(p=>p[1]); const x0=Math.min(...xs),x1=Math.max(...xs),y0=Math.min(...ys),y1=Math.max(...ys);
    g.pos=pos.map(([x,y])=>[30+(W-60)*(x-x0)/Math.max(1,x1-x0), 26+(H-52)*(y-y0)/Math.max(1,y1-y0)]);
    g.edges=edges.map(([a,b])=>[a,b,C.ri(1,12)]);
    return g;
  }
};
C.mstWeight = g=>{ const parent=[...Array(g.n).keys()]; const f=x=>parent[x]===x?x:(parent[x]=f(parent[x])); let tot=0; g.edges.slice().sort((a,b)=>a[2]-b[2]).forEach(([u,v,w])=>{ const a=f(u),b=f(v); if(a!==b){parent[a]=b; tot+=w;} }); return tot; };

/* ---------- DFA-tegning ---------- */
/* d: {states:[names], start:0, accept:Set, delta:[{ '0':j,'1':k }], alpha:['0','1'] } */
C.drawDFA = (d, opts={})=>{
  const n=d.states.length; const W=opts.w||(n<=3?360:420), H=opts.h||(n<=3?200:280);
  let pos;
  if(n<=4){ pos=d.states.map((_,i)=>[70+(W-130)*i/Math.max(1,n-1), H/2+ (n===4? (i%2? 40:-40):(i===1&&n===3? -10:0))]); }
  else pos=C.circleLayout(n,W,H, Math.min(W,H)/2-40);
  if(opts.pos) pos=opts.pos;
  // samle kanter
  const lab={}; d.delta.forEach((tr,i)=>{ for(const a of d.alpha){ const j=tr[a]; if(j===undefined||j===null) continue; const k=i+'>'+j; (lab[k]=lab[k]||[]).push(a); } });
  let s=`<svg class="dfa" viewBox="0 0 ${W} ${H}" width="${W}" role="img" aria-label="tilstandsmaskin"><defs><marker id="ah${opts.id||''}" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" class="ahead"/></marker></defs>`;
  const R=19, mk=`url(#ah${opts.id||''})`;
  Object.entries(lab).forEach(([k,syms])=>{
    const [i,j]=k.split('>').map(Number); const t=syms.join(',');
    const [x1,y1]=pos[i],[x2,y2]=pos[j];
    if(i===j){ const up = y1 < H/2+1 ? -1 : 1; const yy=y1+up*R; s+=`<path d="M ${x1-8} ${yy} C ${x1-26} ${yy+up*40}, ${x1+26} ${yy+up*40}, ${x1+8} ${yy}" class="tr" marker-end="${mk}"/><text x="${x1}" y="${yy+up*36+(up>0?8:0)}" class="trl">${t}</text>`; return; }
    const both = lab[j+'>'+i];
    const dx=x2-x1, dy=y2-y1, L=Math.hypot(dx,dy), ux=dx/L, uy=dy/L; const nx=-uy, ny=ux;
    const bend = both? 26 : (Math.abs(i-j)>1 && n<=4 ? 34 : 0);
    const sx=x1+ux*R+nx*(both?6:0), sy=y1+uy*R+ny*(both?6:0), ex=x2-ux*R+nx*(both?6:0), ey=y2-uy*R+ny*(both?6:0);
    const cx=(x1+x2)/2+nx*bend, cy=(y1+y2)/2+ny*bend;
    s+=`<path d="M ${sx} ${sy} Q ${cx} ${cy} ${ex} ${ey}" class="tr" marker-end="${mk}"/>`;
    const lx=(sx+2*cx+ex)/4+nx*10, ly=(sy+2*cy+ey)/4+ny*10+4;
    s+=`<text x="${lx}" y="${ly}" class="trl">${t}</text>`;
  });
  const [sx0,sy0]=pos[d.start]; s+=`<path d="M ${sx0-R-30} ${sy0} L ${sx0-R-2} ${sy0}" class="tr" marker-end="${mk}"/><text x="${sx0-R-34}" y="${sy0-6}" class="trl" text-anchor="end">start</text>`;
  pos.forEach(([x,y],i)=>{ s+=`<g class="st"><circle cx="${x}" cy="${y}" r="${R}"/>${d.accept.has(i)?`<circle cx="${x}" cy="${y}" r="${R-4}"/>`:''}<text x="${x}" y="${y+4.5}">${d.states[i]}</text></g>`; });
  return s+'</svg>';
};
C.runDFA = (d,str)=>{ let q=d.start; const path=[q]; for(const ch of str){ q=d.delta[q][ch]; if(q===undefined||q===null) return {acc:false,path,dead:true}; path.push(q);} return {acc:d.accept.has(q),path}; };
C.allStrings = (alpha,maxLen)=>{ const out=['']; let layer=['']; for(let L=1;L<=maxLen;L++){ const nl=[]; for(const s of layer) for(const a of alpha) nl.push(s+a); out.push(...nl); layer=nl; } return out; };
/* regulært uttrykk i kursnotasjon -> JS RegExp */
C.regexToJS = (r)=>{
  let s=String(r).replace(/\s+/g,'').replace(/[∪+]/g,'|').replace(/[Λλε]/g,'(?:)').replace(/∗/g,'*');
  if(/[^012()|*?:]/.test(s)) throw 'Bare 0, 1, 2, |, *, ( ) og Λ er lov';
  // tom alternativ-gren håndteres av JS
  return new RegExp('^(?:'+s+')$');
};

/* ---------- lagring ---------- */
const KEY='dm2c_eksamenslab_v1';
C.load = ()=>{ try{ return JSON.parse(localStorage.getItem(KEY))||{}; }catch(e){ return {}; } };
C.store = C.load();
C.save = ()=>{ try{ localStorage.setItem(KEY, JSON.stringify(C.store)); }catch(e){} };
C.record = (genId, topic, ok)=>{
  const st=C.store; st.gen=st.gen||{}; st.top=st.top||{};
  const g=st.gen[genId]=st.gen[genId]||{a:0,c:0,last:[]}; g.a++; if(ok) g.c++; g.last=(g.last||[]).concat(ok?1:0).slice(-6);
  const t=st.top[topic]=st.top[topic]||{a:0,c:0}; t.a++; if(ok) t.c++;
  st.total=(st.total||0)+1; if(ok) st.right=(st.right||0)+1;
  const today=new Date().toISOString().slice(0,10); st.day=st.day||{}; st.day[today]=(st.day[today]||0)+1;
  C.save();
};
})(typeof window!=='undefined'? window : globalThis);
