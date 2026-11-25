/* gens_struct.js — induksjon & rekursjon, tilstandsmaskiner & regulære uttrykk, grafer & trær */
(function(G){
'use strict';
const C=G.C, F=G.F, S=G.S, GENS=G.GENS; const add=o=>GENS.push(o);

/* ================= INDUKSJON ================= */
add({id:'rekursjon',topic:'induksjon',name:'Regn ut rekursivt definerte ledd',method:false,quick:true,make(){
  const v=C.pick(['lin','lin','konst','tri']);
  if(v==='tri'){ const t=[0,0,1]; for(let i=3;i<12;i++) t.push(t[i-1]+t[i-2]+t[i-3]); return {prompt:`Tribonacci: t₀ = t₁ = 0, t₂ = 1, t<sub>i+3</sub> = t<sub>i+2</sub> + t<sub>i+1</sub> + t<sub>i</sub>.`,parts:[5,7,9].map(i=>F.num(`t<sub>${i}</sub>`,t[i],`Følgen: ${t.slice(0,10).join(', ')}`)).concat([F.num('Minste m slik at 3m &lt; t<sub>m</sub>',9,`t₈ = 24 = 3·8 (ikke strengt), t₉ = 44 > 27 ⇒ m = 9 (H23).`)]),steps:[]}; }
  const a1=C.ri(1,4), a2=C.ri(1,6), c1=C.ri(1,3), c2=C.pick([1,1,2,3,-1]), d=v==='konst'?C.ri(1,5):0; const a=[null,a1,a2]; for(let n=3;n<=7;n++) a[n]=c1*a[n-1]+c2*a[n-2]+d;
  const rule=`a<sub>n</sub> = ${c1===1?'':c1}a<sub>n−1</sub> ${c2<0?'−':'+'} ${Math.abs(c2)===1?'':Math.abs(c2)}a<sub>n−2</sub>${d?` + ${d}`:''}`;
  return {prompt:`La a₁ = ${a1}, a₂ = ${a2} og ${rule} for n ≥ 3.`,parts:[3,4,5,6].map(n=>F.num(`a<sub>${n}</sub>`,a[n],`a<sub>${n}</sub> = ${c1}·${a[n-1]} ${c2<0?'−':'+'} ${Math.abs(c2)}·${a[n-2]}${d?' + '+d:''} = ${a[n]}`)),steps:[]};
}});

const PROOFS=[
 {id:'odde',t:'Summen av de n første oddetallene',claim:'1 + 3 + 5 + ⋯ + (2n − 1) = n² for alle n ≥ 1.',src:'K26 oppg. 9',
  steps:[['Basissteg (n = 1): hva er venstre og høyre side?',['VS = 1, HS = 1² = 1 ✓','VS = 1, HS = 2 ✗','VS = 2·1 = 2, HS = 1','VS = 0, HS = 0']],
   ['Induksjonshypotese:',['Anta at 1 + 3 + ⋯ + (2k − 1) = k² for en vilkårlig k ≥ 1.','Anta at påstanden holder for alle n.','Anta at 1 + 3 + ⋯ + (2k + 1) = k².','Anta at k² = (k+1)².']],
   ['Neste ledd: hva legger vi til for å gå fra k til k+1?',['2(k + 1) − 1 = 2k + 1','2k − 1','k + 1','(k + 1)²']],
   ['Bruk hypotesen: 1 + ⋯ + (2k−1) + (2k+1) = …',['k² + 2k + 1 = (k + 1)²','k² + 2k + 1 = k² + 1','(k+1)² + 2k + 1','k(k+1)']],
   ['Konklusjon:',['Påstanden holder for k+1, så ved induksjon holder den for alle n ≥ 1.','Vi har vist påstanden for n = k.','Siden den holder for n = 1 er vi ferdige.','Påstanden er sann fordi n² er positiv.']]],
  full:`<b>Basis:</b> n = 1: 1 = 1². <br><b>IH:</b> Anta Σ<sub>i=1</sub><sup>k</sup>(2i − 1) = k². <br><b>Steg:</b> Σ<sub>i=1</sub><sup>k+1</sup>(2i − 1) = Σ<sub>i=1</sub><sup>k</sup>(2i − 1) + (2(k+1) − 1) = k² + 2k + 1 = (k+1)². <br><b>Konklusjon:</b> ved induksjon holder påstanden for alle n ≥ 1.`},
 {id:'kvadrat',t:'Sum av kvadrater',claim:'1² + 2² + ⋯ + n² = n(n+1)(2n+1)/6 for alle n ∈ ℕ.',src:'Øving 3',
  steps:[['Basis n = 0 (eller 1):',['n = 0: tom sum 0 = 0·1·1/6 ✓','n = 0: 1 = 0','n = 1: 1 = 2','Basis trengs ikke']],
   ['Induksjonssteget starter med:',['Σ<sub>i=0</sub><sup>k+1</sup> i² = Σ<sub>i=0</sub><sup>k</sup> i² + (k+1)²','Σ<sub>i=0</sub><sup>k+1</sup> i² = (k+1)·Σ i²','(k+1)(k+2)(2k+3)/6 = k(k+1)(2k+1)/6','Σ i² = (Σ i)²']],
   ['Med IH blir dette:',['k(k+1)(2k+1)/6 + (k+1)²','k(k+1)(2k+1)/6 + k²','(k+1)(k+2)/2','k² + (k+1)²']],
   ['Faktoriser ut (k+1)/6:',['(k+1)/6 · [k(2k+1) + 6(k+1)] = (k+1)/6 · (2k² + 7k + 6)','(k+1)/6 · (2k² + k)','(k+1)/6 · (k² + 6)','(k+1)·k/6']],
   ['Og 2k² + 7k + 6 = …',['(k + 2)(2k + 3), så summen = (k+1)(k+2)(2(k+1)+1)/6 ✓','(k + 1)(2k + 6)','(2k + 1)(k + 6)','(k + 3)(2k + 2)']]],
  full:`<b>Basis:</b> n=0: 0 = 0. <b>IH:</b> Σ<sub>i=0</sub><sup>k</sup> i² = k(k+1)(2k+1)/6. <b>Steg:</b> Σ<sub>i=0</sub><sup>k+1</sup> i² = k(k+1)(2k+1)/6 + (k+1)² = (k+1)(2k² + 7k + 6)/6 = (k+1)(k+2)(2k+3)/6, som er formelen med n = k+1. ∎`},
 {id:'delelig',t:'Delelighet: 3 | n³ − n',claim:'3 | n³ − n for alle n ∈ ℕ.',src:'standard',
  steps:[['Basis n = 0:',['0³ − 0 = 0 = 3·0 ✓','0 er ikke delelig med 3','n = 1: 1 − 1 = 1','3 | 3']],
   ['IH:',['Anta 3 | k³ − k, dvs. k³ − k = 3m for et heltall m.','Anta k³ − k = 3.','Anta 3 | k.','Anta 3 | (k+1)³.']],
   ['Utvid (k+1)³ − (k+1):',['k³ + 3k² + 3k + 1 − k − 1 = (k³ − k) + 3k² + 3k','k³ + 1 − k − 1 = k³ − k','k³ + 3k + 1','(k³ − k) + 1']],
   ['Konklusjon:',['= 3m + 3(k² + k) = 3(m + k² + k), altså delelig med 3 ✓','= 3m + 1, ikke delelig','k³ − k er delelig med 3, ferdig','Vi trenger sterk induksjon']]],
  full:`<b>Basis:</b> 0³ − 0 = 0. <b>IH:</b> k³ − k = 3m. <b>Steg:</b> (k+1)³ − (k+1) = (k³ − k) + 3k² + 3k = 3(m + k² + k). ∎ (Alternativt: n³ − n = (n−1)n(n+1) er produktet av tre påfølgende tall.)`},
 {id:'potens',t:'Delelighet: 6 | 7ⁿ − 1',claim:'6 | 7ⁿ − 1 for alle n ≥ 0.',src:'standard',
  steps:[['Basis n = 0:',['7⁰ − 1 = 0, delelig med 6 ✓','7 − 1 = 6 ✓ (n=0)','1 − 1 = 1','Kan ikke sjekkes']],
   ['Skriv 7<sup>k+1</sup> − 1 ved hjelp av 7<sup>k</sup> − 1:',['7·7<sup>k</sup> − 1 = 7(7<sup>k</sup> − 1) + 6','7<sup>k</sup> − 1 + 7','7(7<sup>k</sup> − 1) − 6','(7<sup>k</sup> − 1)<sup>7</sup>']],
   ['Med IH 7<sup>k</sup> − 1 = 6m:',['= 7·6m + 6 = 6(7m + 1) ✓','= 6m + 6','= 42m − 6, ikke delelig','= 7m']]],
  full:`Basis 7⁰ − 1 = 0. IH: 7<sup>k</sup> − 1 = 6m. 7<sup>k+1</sup> − 1 = 7(7<sup>k</sup> − 1) + 6 = 6(7m + 1). ∎`},
 {id:'ulikhet',t:'Ulikhet: 2ⁿ > n²',claim:'2ⁿ > n² for alle n ≥ 5.',src:'standard',
  steps:[['Basis:',['n = 5: 32 > 25 ✓','n = 1: 2 > 1 ✓ (holder fra n = 1)','n = 4: 16 > 16','n = 0: 1 > 0']],
   ['Steg: 2<sup>k+1</sup> = 2·2<sup>k</sup> > …',['2k² (ved IH)','k² + 1','(k+1)²','2k']],
   ['Vi må vise 2k² ≥ (k+1)². Det holder når …',['k² − 2k − 1 ≥ 0, som er sant for k ≥ 3 (og vi har k ≥ 5) ✓','k ≥ 1','k² ≥ 1','alltid']]],
  full:`Basis: 2⁵ = 32 > 25. IH: 2<sup>k</sup> > k² (k ≥ 5). Steg: 2<sup>k+1</sup> = 2·2<sup>k</sup> > 2k² = k² + k² ≥ k² + 2k + 1 = (k+1)², der k² ≥ 2k + 1 ⇔ (k−1)² ≥ 2, sant for k ≥ 3. ∎`},
 {id:'lucas',t:'Sterk induksjon: Lucas-tall',claim:'a₁ = 1, a₂ = 3, aₙ = aₙ₋₁ + aₙ₋₂. Vis at aₙ < (7/4)ⁿ for alle n ≥ 1.',src:'H25 oppg. 3',
  steps:[['Hvor mange basistilfeller trengs?',['To: n = 1 og n = 2, fordi rekursjonen bruker de to forrige leddene','Ett: n = 1','Ingen','Tre']],
   ['Sjekk basis:',['a₁ = 1 < 7/4 og a₂ = 3 < 49/16 ≈ 3,06 ✓','a₁ = 1 < 1','a₂ = 3 < 7/4','a₂ = 4']],
   ['Sterk IH (k ≥ 3):',['Anta aᵢ < (7/4)ⁱ for alle i = 1, …, k − 1.','Anta a<sub>k</sub> < (7/4)<sup>k</sup>.','Anta a<sub>k−1</sub> = (7/4)<sup>k−1</sup>.','Anta påstanden for alle n.']],
   ['a<sub>k</sub> = a<sub>k−1</sub> + a<sub>k−2</sub> < …',['(7/4)<sup>k−1</sup> + (7/4)<sup>k−2</sup> = (7/4)<sup>k−2</sup>(7/4 + 1) = (7/4)<sup>k−2</sup>·11/4','(7/4)<sup>k</sup>','2·(7/4)<sup>k−1</sup> = (7/4)<sup>k</sup>','(7/4)<sup>2k−3</sup>']],
   ['Avslutt:',['11/4 = 44/16 < 49/16 = (7/4)², så a<sub>k</sub> < (7/4)<sup>k−2</sup>(7/4)² = (7/4)<sup>k</sup> ✓','11/4 > (7/4)², så det feiler','11/4 = 7/4','Ferdig uten mer']]],
  full:`Basis: a₁ = 1 < 7/4, a₂ = 3 < 49/16. Sterk IH: aᵢ < (7/4)ⁱ for i < k (k ≥ 3). Da a<sub>k</sub> = a<sub>k−1</sub> + a<sub>k−2</sub> < (7/4)<sup>k−2</sup>(7/4 + 1) = (7/4)<sup>k−2</sup>·44/16 < (7/4)<sup>k−2</sup>·49/16 = (7/4)<sup>k</sup>. ∎`},
 {id:'siffer',t:'Sterk induksjon: siste siffer er 2',claim:'f(0) = f(1) = 2, f(n) = f(n−1) + 3f(n−2) + 4. Vis at f(n) slutter på 2.',src:'H24 del 2 oppg. 4b',
  steps:[['Omformuler «slutter på 2»:',['f(n) ≡ 2 (mod 10)','f(n) er partall','f(n) = 2','10 | f(n)']],
   ['Basis:',['f(0) = 2 og f(1) = 2 — to basistilfeller fordi f bruker to forrige verdier','Bare f(0)','f(2) = 12','Ingen basis']],
   ['Steg (IH: f(i) ≡ 2 for i ≤ k):',['f(k+1) ≡ 2 + 3·2 + 4 = 12 ≡ 2 (mod 10) ✓','f(k+1) ≡ 2 + 2 + 4 = 8','f(k+1) = 12','f(k+1) ≡ 0']]],
  full:`Vis f(n) ≡ 2 (mod 10). Basis f(0) = f(1) = 2. Sterk IH: f(i) ≡ 2 for 0 ≤ i ≤ k. Da f(k+1) = f(k) + 3f(k−1) + 4 ≡ 2 + 6 + 4 = 12 ≡ 2 (mod 10). ∎`},
 {id:'lukket',t:'Sterk induksjon: lukket form',claim:'a₁ = 1, a₂ = 5, aₙ = aₙ₋₁ + 2aₙ₋₂. Vis at aₙ = 2ⁿ + (−1)ⁿ.',src:'typisk',
  steps:[['Basis:',['a₁ = 2 − 1 = 1 ✓, a₂ = 4 + 1 = 5 ✓','a₁ = 2 + 1 = 3','Bare n = 1 trengs','a₂ = 4']],
   ['a<sub>k</sub> = a<sub>k−1</sub> + 2a<sub>k−2</sub> = (IH) …',['2<sup>k−1</sup> + (−1)<sup>k−1</sup> + 2·2<sup>k−2</sup> + 2(−1)<sup>k−2</sup>','2<sup>k</sup> + (−1)<sup>k</sup>','2<sup>k−1</sup> + 2<sup>k−2</sup>','3·2<sup>k−1</sup>']],
   ['Forenkle:',['= 2<sup>k</sup> + (−1)<sup>k−2</sup>(−1 + 2) = 2<sup>k</sup> + (−1)<sup>k</sup> ✓','= 2<sup>k</sup> − (−1)<sup>k</sup>','= 2<sup>k+1</sup>','= 2<sup>k</sup> + 1']]],
  full:`Basis: a₁ = 1 = 2 − 1, a₂ = 5 = 4 + 1. Sterk IH for k−1, k−2. a<sub>k</sub> = 2<sup>k−1</sup> + (−1)<sup>k−1</sup> + 2<sup>k−1</sup> + 2(−1)<sup>k−2</sup> = 2<sup>k</sup> + (−1)<sup>k−2</sup>(2 − 1) = 2<sup>k</sup> + (−1)<sup>k</sup>. ∎`},
 {id:'tre',t:'Trær: n noder ⇒ n − 1 kanter',claim:'Ethvert tre med n noder har n − 1 kanter.',src:'Trær-notat / H25 oppg. 5',
  steps:[['Basis:',['Et tre med 1 node har 0 = 1 − 1 kanter ✓','Et tre med 2 noder har 2 kanter','K₁ har 1 kant','Basis er unødvendig']],
   ['Hvordan får vi et tre med k + 1 noder fra et med k noder?',['Legg til én ny node og én kant fra den til en eksisterende node (et blad)','Legg til en kant mellom to eksisterende noder','Legg til to noder','Fjern en sykel']],
   ['Telling:',['Noder øker med 1 og kanter øker med 1, så |E| = (k − 1) + 1 = (k + 1) − 1 ✓','Kantene dobles','Kanter øker med 2','Ingenting endres']]],
  full:`Basis: én node, 0 kanter. IH: tre med k noder har k − 1 kanter. Ethvert tre med k+1 noder har et blad; fjernes bladet får vi et tre med k noder (k − 1 kanter). Legg bladet tilbake: k noder + 1, kanter k − 1 + 1 = k. ∎`}];
add({id:'induksjon',topic:'induksjon',name:'Induksjonsbevis steg for steg',method:true,quick:false,make(){
  const p=C.pick(PROOFS);
  return {prompt:`<b>${p.t}</b> <span class="src">(${p.src})</span><br>Bevis ved induksjon: ${p.claim}<div class="tip">Skriv beviset på papir først. Gå så gjennom stegene og velg riktig neste linje.</div>`,
    parts:[F.self('Fikk du til hele beviset?',`<div class="mal">${p.full}</div>`,10)],
    steps:p.steps.map(([q,opts])=>{ const o=C.shuffle(opts); return S(q,[F.mc('Velg',o,o.indexOf(opts[0]))],opts[0]); }).concat([S('Fullstendig løsningsforslag:',[],`<div class="mal">${p.full}</div>`)])};
}});
G.PROOFS=PROOFS;

/* ================= TILSTANDSMASKINER ================= */
const D=(states,delta,accept,start=0)=>({states,delta:delta.map(r=>Array.isArray(r)?Object.fromEntries(r.map((t,i)=>[String(i),t])):r),accept:new Set(accept),start,alpha:delta[0]&&Array.isArray(delta[0])?delta[0].map((_,i)=>String(i)):Object.keys(delta[0])});
const c0=s=>[...s].filter(c=>c==='0').length, c1=s=>[...s].filter(c=>c==='1').length;
const LANGS=[
 {id:'tre0',d:'bitstrenger med nøyaktig tre 0-ere (trenger ikke stå på rad)',src:'K26 10a',p:s=>c0(s)===3,re:'1*01*01*01*',dfa:D(['q0','q1','q2','q3','qd'],[[1,0],[2,1],[3,2],[4,3],[4,4]],[3])},
 {id:'tre0rad',d:'bitstrenger med nøyaktig tre 0-ere, og de tre står på rad',src:'K26 10b–c',p:s=>c0(s)===3&&s.includes('000'),re:'1*0001*',dfa:D(['q0','q1','q2','q3','qd'],[[1,0],[2,4],[3,4],[4,3],[4,4]],[3])},
 {id:'likendet',d:'ikke-tomme bitstrenger som starter og slutter med samme tegn',src:'H25 4',p:s=>s.length>0&&s[0]===s[s.length-1],re:'0|1|0(0|1)*0|1(0|1)*1',dfa:D(['S','q00','q01','q11','q10'],[[1,3],[1,2],[1,2],[4,3],[4,3]],[1,3])},
 {id:'slutt01',d:'bitstrenger som slutter på 01',src:'klassiker',p:s=>s.endsWith('01'),re:'(0|1)*01',dfa:D(['s0','s1','s2'],[[1,0],[1,2],[1,0]],[2])},
 {id:'inn010',d:'bitstrenger som inneholder 010 som delstreng',src:'klassiker',p:s=>s.includes('010'),re:'(0|1)*010(0|1)*',dfa:D(['s0','s1','s2','s3'],[[1,0],[1,2],[3,0],[3,3]],[3])},
 {id:'par1',d:'bitstrenger med et partall antall 1-ere',src:'klassiker',p:s=>c1(s)%2===0,re:'0*(10*10*)*',dfa:D(['P','O'],[[0,1],[1,0]],[0])},
 {id:'ikke11',d:'bitstrenger der 11 ikke forekommer',src:'Øving 3 / klassiker',p:s=>!s.includes('11'),re:'(0|10)*(Λ|1)',dfa:D(['a','b','d'],[[0,1],[0,2],[2,2]],[0,1])},
 {id:'len3',d:'bitstrenger med lengde delelig med 3 (inkl. tom streng)',src:'klassiker',p:s=>s.length%3===0,re:'((0|1)(0|1)(0|1))*',dfa:D(['r0','r1','r2'],[[1,1],[2,2],[0,0]],[0])},
 {id:'div3',d:'bitstrenger som, lest som binærtall, er delelige med 3 (tom streng = 0)',src:'H23 4 (variant)',p:s=>s===''||parseInt(s,2)%3===0,re:'(0|1(01*0)*1)*',dfa:D(['r0','r1','r2'],[[0,1],[2,0],[1,2]],[0])},
 {id:'0til1',d:'bitstrenger som starter med 0 og slutter med 1',src:'klassiker',p:s=>s.length>=2&&s[0]==='0'&&s.endsWith('1'),re:'0(0|1)*1',dfa:D(['S','A','B','D'],[[1,3],[1,2],[1,2],[3,3]],[2])},
 {id:'minst2null',d:'bitstrenger med minst to 0-ere',src:'klassiker',p:s=>c0(s)>=2,re:'1*01*0(0|1)*',dfa:D(['z0','z1','z2'],[[1,0],[2,1],[2,2]],[2])},
 {id:'h24',d:'bitstrenger der to 1-ere på rad bare kan forekomme helt på slutten (f.eks. 101, 1001, 11, 01011 ja; 111, 110 nei)',src:'H24 del 2 oppg. 2',p:s=>{ const t=s.endsWith('11')?s.slice(0,-2):s; return !t.includes('11')&&!(s.endsWith('11')&&t.endsWith('1')); },re:'0*(100*)*(Λ|1|11)',dfa:D(['0|Λ','01','011','11x'],[[0,1],[0,2],[3,3],[3,3]],[0,1,2])},
 {id:'1etter0',d:'bitstrenger der hver 1 umiddelbart etterfølges av en 0',src:'klassiker',p:s=>!/1(?!0)/.test(s),re:'(0|10)*',dfa:D(['A','B','D'],[[0,1],[0,2],[2,2]],[0])},
 {id:'null3',d:'bitstrenger der antall 0-ere er delelig med 3',src:'klassiker',p:s=>c0(s)%3===0,re:'(1*01*01*0)*1*',dfa:D(['r0','r1','r2'],[[1,0],[2,1],[0,2]],[0])},
 {id:'tern',d:'strenger over {0,1,2} på formen: én eller flere 2-ere, så én eller flere 1-ere, så én eller flere 0-ere',src:'S25 4',p:s=>/^2+1+0+$/.test(s),re:'22*11*00*',alpha:['0','1','2'],dfa:D(['s0','s1','s2','s3','s4'],[{0:4,1:4,2:1},{0:4,1:2,2:1},{0:3,1:2,2:4},{0:3,1:4,2:4},{0:4,1:4,2:4}],[3])}];
LANGS.forEach(l=>{ l.alpha=l.alpha||['0','1']; });
G.LANGS=LANGS;
const langCheck=(l,accFn,maxLen)=>{ const strs=C.allStrings(l.alpha,maxLen||(l.alpha.length>2?7:10)); for(const s of strs){ const want=l.p(s), got=accFn(s); if(want!==got) return {ok:false,s,want,got}; } return {ok:true}; };
G.langCheck=langCheck;
add({id:'dfaKjor',topic:'automat',name:'Hvilke strenger aksepteres?',method:false,quick:true,make(){
  let d, strs; outer: for(;;){ const n=C.ri(3,4); const delta=[...Array(n).keys()].map(()=>({0:C.ri(0,n-1),1:C.ri(0,n-1)})); const acc=new Set(C.sample([...Array(n).keys()],C.ri(1,n-1))); d={states:[...Array(n).keys()].map(i=>'q'+i),delta,accept:acc,start:0,alpha:['0','1']};
    const seen=new Set([0]); const st=[0]; while(st.length){ const q=st.pop(); for(const a of ['0','1']){ const r=delta[q][a]; if(!seen.has(r)){seen.add(r);st.push(r);} } } if(seen.size!==n) continue;
    for(let t=0;t<60;t++){ strs=[...new Set([...Array(5)].map(()=>[...Array(C.ri(3,7))].map(()=>C.pick(['0','1'])).join('')))]; const acc=strs.filter(s=>C.runDFA(d,s).acc).length; if(strs.length===5&&acc>=1&&acc<=4) break outer; } }
  const ans=strs.map((s,i)=>i).filter(i=>C.runDFA(d,strs[i]).acc);
  const trace=s=>{ const r=C.runDFA(d,s); return `${s}: `+r.path.map(q=>d.states[q]).join(' → ')+(r.acc?' ✓ godtatt':' ✗ avvist'); };
  return {prompt:`Gitt tilstandsmaskinen under (dobbel sirkel = aksepterende tilstand).<div class="fig">${C.drawDFA(d,{id:'k'+C.ri(1,1e6)})}</div>`,
    parts:[F.multi('Hvilke strenger aksepteres?',strs,ans,strs.map(trace).join('<br>'))],steps:[S(`Følg pilene tegn for tegn fra start. Godta hvis du ender i en aksepterende tilstand.`,[],strs.map(trace).join('<br>'))]};
}});
const REGEXES=[['0*(100*)*(Λ|1|11)','H24'],['1*0001*','K26'],['(0|1)*01','klassiker'],['0*10*10*','nøyaktig to 1-ere'],['(01|10)*','par'],['1(0|1)*1|1','start/slutt 1'],['0|1|0(0|1)*0|1(0|1)*1','H25'],['(0|10)*(Λ|1)','ingen 11'],['(1*01*0)*1*','partall 0-ere'],['0*1*0*','blokker']];
add({id:'regexMatch',topic:'automat',name:'Matcher det regulære uttrykket?',method:false,quick:true,make(){
  const [r]=C.pick(REGEXES); const re=C.regexToJS(r); let strs; for(;;){ const cand=C.shuffle(C.allStrings(['0','1'],6).filter(s=>s.length>=2)); const yes=cand.filter(s=>re.test(s)), no=cand.filter(s=>!re.test(s)); if(yes.length<1||no.length<1) continue; const k=C.ri(1,Math.min(3,yes.length)); strs=C.shuffle(yes.slice(0,k).concat(no.slice(0,5-k))); break; }
  const ans=strs.map((s,i)=>i).filter(i=>re.test(strs[i]));
  return {prompt:`Regulært uttrykk: <span class="fx">${r}</span> &nbsp;(| = eller, * = 0 eller flere ganger, Λ = tom streng)`,parts:[F.multi('Hvilke strenger er i språket?',strs,ans,`I språket: ${ans.map(i=>strs[i]).join(', ')||'ingen'}. Ikke i språket: ${strs.filter((_,i)=>!ans.includes(i)).join(', ')}.`)],steps:[]};
}});
add({id:'dfaDesign',topic:'automat',name:'Lag en tilstandsmaskin',method:true,quick:false,make(){
  const l=C.pick(LANGS);
  return {prompt:`Lag en deterministisk endelig tilstandsmaskin over alfabetet {${l.alpha.join(', ')}} som gjenkjenner <b>${l.d}</b>. <span class="src">(${l.src})</span>`,
    parts:[{kind:'dfa',lang:l,label:'Din tilstandsmaskin',sol:`Løsningsforslag:<div class="fig">${C.drawDFA(l.dfa,{id:'s'+l.id})}</div>`,show:'se figur'}],
    steps:[S(`Strategi: hver tilstand skal <b>huske nøyaktig det du trenger</b> om strengen lest så langt. Hva må maskinen huske her?`,[],hintFor(l)),
      S(`Husk en <b>søppeltilstand</b> (død tilstand) for når strengen aldri kan bli godtatt, og at HVER tilstand må ha én pil for hvert symbol (deterministisk).`,[],`Modell-løsning:<div class="fig">${C.drawDFA(l.dfa,{id:'m'+l.id})}</div>`)]};
}});
function hintFor(l){ const h={tre0:'Antall 0-ere sett så langt: 0, 1, 2, 3, eller «for mange».',tre0rad:'Hvor mange 0-ere på rad har vi sett i den nåværende blokken (0–3), og om en blokk ble avbrutt (død).',likendet:'Første tegn (0 eller 1) og siste tegn lest.',slutt01:'Hvor mye av «01» ligger på slutten akkurat nå.',inn010:'Lengste prefiks av 010 som er en hale av det lest — eller «funnet».',par1:'Bare pariteten til antall 1-ere.',ikke11:'Om siste tegn var 1 — og en død tilstand hvis vi ser 11.',len3:'Lengden mod 3.',div3:'Verdien mod 3. Å lese bit b endrer verdien v til 2v + b.',['0til1']:'Første tegn, og om siste tegn er 1.',minst2null:'Antall 0-ere: 0, 1, eller ≥ 2.',h24:'Har vi sett 11? Var siste tegn 1? Sett 11 og så noe mer ⇒ død.',['1etter0']:'Venter vi på en 0 (forrige var 1)?',null3:'Antall 0-ere mod 3.',tern:'Hvilken blokk vi er i (2-ere, 1-ere, 0-ere), og død tilstand ved feil rekkefølge.'}; return h[l.id]||''; }
add({id:'regexDesign',topic:'automat',name:'Skriv et regulært uttrykk',method:true,quick:false,make(){
  const l=C.pick(LANGS);
  return {prompt:`Finn et regulært uttrykk over {${l.alpha.join(', ')}} for <b>${l.d}</b>. Bruk | for «eller», * for stjerne, parenteser og Λ for tom streng.`,
    parts:[{kind:'regex',lang:l,label:'Ditt uttrykk',sol:`Ett mulig svar: <span class="fx">${l.re}</span>`,show:l.re}],
    steps:[S('Tenk på strukturen: hva må strengen starte/slutte med, hva kan gjentas?',[],`Mulig svar: <span class="fx">${l.re}</span>`)]};
}});
add({id:'dfaSprak',topic:'automat',name:'Hvilket språk gjenkjennes?',method:false,quick:true,make(){
  const ls=C.sample(LANGS.filter(l=>l.alpha.length===2),4); const l=ls[0]; const opts=C.shuffle(ls.map(x=>x.d));
  return {prompt:`Hvilket språk gjenkjenner denne maskinen?<div class="fig">${C.drawDFA(l.dfa,{id:'q'+l.id})}</div>`,parts:[F.mc('Språk',opts,opts.indexOf(l.d),`Riktig: ${l.d}. Regulært uttrykk: ${l.re}.`)],steps:[]};
}});

/* ================= GRAFER ================= */
const L1=i=>String(i+1);
add({id:'grafEuler',topic:'grafer',name:'Grader, Euler og Hamilton',method:false,quick:true,make(){
  const n=C.ri(5,7); const m=C.ri(n,Math.min(n*(n-1)/2-2,n+4)); let g=C.randGraph(n,m);
  if(C.chance(0.4)){ for(let t=0;t<200;t++){ const h=C.randGraph(n,m); const odd=C.degrees(h).filter(x=>x%2).length; if(odd===0||odd===2){ g=h; break; } } }
  const deg=C.degrees(g), odd=deg.map((d,i)=>d%2?i:-1).filter(i=>i>=0); const ham=C.hamCycle(g);
  const conn=C.connected(g);
  return {prompt:`Se på grafen G.<div class="fig">${C.drawGraph(g,{w:300,h:240})}</div>`,
    parts:[F.num('Antall kanter',g.edges.length,`Tell, eller bruk Σ grad = 2|E|: Σ = ${deg.reduce((a,c)=>a+c,0)}.`),F.num('Summen av alle grader',2*g.edges.length,'Håndhilselemmaet: Σ deg(v) = 2|E|.'),
      F.yn('Har G en Eulerkrets (lukket, alle kanter én gang)?',conn&&odd.length===0,`Grader: ${deg.map((d,i)=>`${i+1}:${d}`).join(', ')}. Eulerkrets ⇔ sammenhengende og alle grader partall. Odde: ${odd.map(L1).join(', ')||'ingen'}.`),
      F.yn('Har G en Eulervei/-sti (åpen, alle kanter én gang)?',conn&&odd.length===2,`Åpen Eulervei ⇔ sammenhengende og nøyaktig 2 noder med odde grad (start og slutt der). Antall odde: ${odd.length}.`),
      F.yn('Har G en Hamiltonsykel?',!!ham,ham?`Ja: ${ham.map(L1).join('–')}–${ham[0]+1}.`:'Nei (sjekket alle muligheter). Typisk grunn: en node med grad 1, eller en «flaskehals».')],
    steps:[S('Skriv opp graden til hver node.',deg.map((d,i)=>F.num(`deg(${i+1})`,d)),`Grader: ${deg.join(', ')}`)]};
}});
add({id:'eulerFinn',topic:'grafer',name:'Finn en Eulervei',method:false,quick:true,make(){
  let g; for(let t=0;t<500;t++){ const n=C.ri(5,6); const h=C.randGraph(n,C.ri(n+1,n+3)); const odd=C.degrees(h).filter(x=>x%2).length; if(odd===0||odd===2){ g=h; break; } }
  const deg=C.degrees(g), odd=deg.map((d,i)=>d%2?i:-1).filter(i=>i>=0);
  const check=s=>{ const seq=(String(s).match(/\d+/g)||[]).map(x=>Number(x)-1); if(seq.length<2) return null; const E=new Map(); g.edges.forEach(([u,v])=>E.set(C.ekey(u,v),0)); for(let i=0;i+1<seq.length;i++){ const k=C.ekey(seq[i],seq[i+1]); if(!E.has(k)||E.get(k)) return false; E.set(k,1);} return [...E.values()].every(x=>x===1); };
  return {prompt:`Finn en ${odd.length?'Eulervei':'Eulerkrets'} i grafen. Skriv nodene i rekkefølge, f.eks. «1 2 3 1 4».<div class="fig">${C.drawGraph(g,{w:300,h:240})}</div>`,
    parts:[F.txt('Nodesekvens',check,'(mange riktige svar)',`${odd.length?`Start i en odde node (${odd.map(L1).join(' eller ')}) og slutt i den andre.`:'Alle grader er partall: start hvor som helst og slutt samme sted.'} Bruk Fleury: ikke kryss en «bro» hvis du kan unngå det.`,{ph:'1 2 3 …'})],steps:[]};
}});
add({id:'komplement',topic:'grafer',name:'Komplement og selvkomplementære grafer',method:false,quick:true,make(){
  const n=C.ri(4,5); let g; if(C.chance(0.4)&&n===4) g={n:4,edges:[[0,1],[1,2],[2,3]]}; else if(C.chance(0.3)&&n===5) g={n:5,edges:[[0,1],[1,2],[2,3],[3,4],[4,0]]}; else g=C.randGraph(n,C.ri(n-1,Math.floor(n*(n-1)/4)+1));
  const h=C.complement(g); const iso=!!C.findIso(g,h); const tot=n*(n-1)/2; const v=C.ri(0,n-1);
  return {prompt:`Grafen G har ${n} noder:<div class="fig">${C.drawGraph(g,{w:260,h:210})}</div>`,
    parts:[F.num('Antall kanter i komplementet Ḡ',tot-g.edges.length,`K<sub>${n}</sub> har ${n}·${n-1}/2 = ${tot} kanter. |E(Ḡ)| = ${tot} − ${g.edges.length} = ${tot-g.edges.length}.`),F.num(`deg<sub>Ḡ</sub>(${v+1})`,n-1-C.degrees(g)[v],`deg<sub>Ḡ</sub>(v) = (n − 1) − deg<sub>G</sub>(v) = ${n-1} − ${C.degrees(g)[v]}`),
      F.yn('Er G isomorf med sitt komplement?',iso,`Ḡ:<div class="fig">${C.drawGraph(h,{w:240,h:190})}</div>${iso?'Ja — samme antall kanter og en bijeksjon finnes.':'Nei'+(2*g.edges.length!==tot?` — selvkomplementær krever |E| = ${tot}/2.`:' — sammenlign gradfølgene.')}`)],steps:[]};
}});
const relabel=(g)=>{ const p=C.shuffle([...Array(g.n).keys()]); return {n:g.n,edges:g.edges.map(([u,v])=>[p[u],p[v]].sort((a,b)=>a-b))}; };
add({id:'isomorfi',topic:'grafer',name:'Er grafene isomorfe?',method:false,quick:true,make(){
  const n=C.ri(5,6), m=C.ri(n,n+2); const g=C.randGraph(n,m); let h; const want=C.chance(0.5);
  if(want) h=relabel(g); else { for(let t=0;t<120;t++){ const c=C.randGraph(n,m); if(!C.findIso(g,c) && (t>60 || C.degrees(c).sort().join()===C.degrees(g).sort().join())){ h=c; break; } } if(!h) h=relabel(g); }
  const iso=C.findIso(g,h); const letters='abcdefgh'; h.labels=[...letters.slice(0,n)];
  const dg=C.degrees(g).slice().sort((a,b)=>b-a), dh=C.degrees(h).slice().sort((a,b)=>b-a);
  const parts=[F.yn('Er G og H isomorfe?',!!iso,iso?`En isomorfi: ${iso.map((j,i)=>`${i+1}↦${letters[j]}`).join(', ')}.`:(dg.join()!==dh.join()?`Gradfølgene er ulike: G: (${dg.join(',')}), H: (${dh.join(',')}).`:`Samme gradfølge (${dg.join(',')}), men strukturen er ulik — f.eks. se på hvem nodene med høyest grad er naboer med, eller sykler av gitt lengde.`))];
  if(iso) parts.push(F.txt(`Gi en isomorfi: skriv bildet av 1, 2, …, ${n} i rekkefølge (f.eks. «${letters.slice(0,n).split('').reverse().join(' ')}»)`,s=>{ const t=(String(s).toLowerCase().match(/[a-h]/g)||[]); if(t.length!==n) return null; const map=t.map(c=>letters.indexOf(c)); if(new Set(map).size!==n) return false; return C.isIsoMap(g,h,map); },iso.map(j=>letters[j]).join(' '),'Match noder med samme grad, og sjekk at alle kanter går til kanter.',{ph:'a b c …'}));
  return {prompt:`<div class="figrow"><div><b>G</b>${C.drawGraph(g,{w:240,h:200})}</div><div><b>H</b>${C.drawGraph(h,{w:240,h:200})}</div></div>`,parts,
    steps:[S('Sjekk invarianter først: antall noder, antall kanter, gradfølge, sykler/sammenheng. Ulik invariant ⇒ ikke isomorfe. Like invarianter ⇒ prøv å konstruere en bijeksjon.',[],``)]};
}});
add({id:'automorfi',topic:'grafer',name:'Tell selv-isomorfier',method:false,quick:true,make(){
  const bank=[{n:3,edges:[[0,1],[1,2],[0,2]],d:'K₃'},{n:4,edges:[[0,1],[1,2],[2,3]],d:'stien P₄'},{n:4,edges:[[0,1],[0,2],[0,3]],d:'stjerne'},{n:5,edges:[[0,1],[1,2],[2,3],[3,4],[4,0]],d:'C₅'},{n:4,edges:[[0,1],[1,2],[2,3],[3,0]],d:'C₄'},{n:5,edges:[[0,1],[1,2],[2,3],[3,4]],d:'P₅'},{n:5,edges:[[0,1],[0,2],[0,3],[0,4]],d:'stjerne K₁,₄'},{n:4,edges:[[0,1],[1,2],[2,0],[2,3]],d:'trekant med hale'}];
  const g=C.chance(0.6)? C.pick(bank) : C.randGraph(5,C.ri(4,6)); const k=C.countAuto(g);
  return {prompt:`Hvor mange isomorfier fra grafen til seg selv (automorfier) finnes?<div class="fig">${C.drawGraph(g,{w:240,h:200})}</div>`,parts:[F.num('Antall automorfier',k,`En automorfi må sende noder til noder med samme grad og bevare naboskap. Antall: ${k}. (K₃: 3! = 6; Cₙ: 2n; Pₙ: 2; stjerne K₁,ₖ: k!)`)],steps:[]};
}});
add({id:'mst',topic:'traer',name:'Minimalt spenntre (Prim/Kruskal)',method:true,quick:false,make(){
  const n=C.ri(6,8); const g=C.randWeighted(n); const mode=C.pick(['prim','kruskal']); const start=C.ri(0,n-1); const W=C.mstWeight(g);
  return {prompt:`Finn et minimalt spenntre med <b>${mode==='prim'?`Prims algoritme fra node ${start+1}`:'Kruskals algoritme'}</b>. Klikk på kantene i den rekkefølgen algoritmen velger dem.<div class="tip">${mode==='prim'?'Prim: velg alltid den billigste kanten fra treet ditt til en node utenfor.':'Kruskal: velg alltid den billigste kanten totalt som ikke lager en sykel.'}</div>`,
    parts:[{kind:'mst',g,mode,start,label:'Klikk kanter',sol:`Totalvekt ${W}.`,show:'—'},F.num('Totalvekt',W,`Et MST har ${n-1} kanter og totalvekt ${W}.`)],steps:[]};
}});
add({id:'treFakta',topic:'traer',name:'Telling i trær',method:false,quick:true,make(){
  const v=C.pick(['blad','mary','skog','kn','selv']);
  if(v==='blad'){ const n3=C.ri(1,4), n4=C.ri(0,3), n2=C.ri(0,4); const leaves=2+n3+2*n4; const N=leaves+n2+n3+n4;
    return {prompt:`Et tre har ${n2} noder av grad 2, ${n3} av grad 3, ${n4} av grad 4, og resten er blader (grad 1).`,parts:[F.num('Antall blader',leaves,`La b være antall blader. Noder: n = b + ${n2+n3+n4}, kanter n − 1. Håndhilse: b + ${2*n2+3*n3+4*n4} = 2(n − 1) = 2(b + ${n2+n3+n4} − 1) ⇒ b = ${leaves}.`),F.num('Antall noder',N,''),F.num('Antall kanter',N-1,'')],
      steps:[S('Bruk to fakta: |E| = n − 1 og Σ grad = 2|E|. Sett opp én likning med b ukjent.',[],``)]}; }
  if(v==='mary'){ const m=C.pick([2,3,4]), i=C.ri(3,12); return {prompt:`Et fullt ${m}-ært tre (hver indre node har nøyaktig ${m} barn) har ${i} indre noder.`,parts:[F.num('Antall noder',m*i+1,`n = m·i + 1 = ${m}·${i} + 1`),F.num('Antall blader',(m-1)*i+1,`l = n − i = (m−1)i + 1`)],steps:[S('Hver node unntatt roten er barn av nøyaktig én indre node ⇒ n = mi + 1.',[],``)]}; }
  if(v==='skog'){ const n=C.ri(8,30), k=C.ri(2,5); return {prompt:`En skog (graf uten sykler) har ${n} noder og ${k} sammenhengende komponenter.`,parts:[F.num('Antall kanter',n-k,`Hver komponent er et tre: Σ(nᵢ − 1) = n − k = ${n-k}.`)],steps:[]}; }
  if(v==='kn'){ const n=C.ri(5,20); return {prompt:`Tell kanter i disse grafene.`,parts:[F.num(`Antall kanter i K<sub>${n}</sub>`,n*(n-1)/2,`n(n−1)/2`),F.num(`Antall kanter i et tre med ${n} noder`,n-1,'n − 1'),F.num(`Antall kanter i den komplette bipartitte grafen K<sub>${Math.floor(n/2)},${Math.ceil(n/2)}</sub> (hver node på den ene siden er koblet til alle på den andre)`,Math.floor(n/2)*Math.ceil(n/2),'m·n')],steps:[]}; }
  return {prompt:`Et tre T med n ≥ 2 noder er isomorf med sitt eget komplement (H25 5d).`,parts:[F.num('Hvilken n er mulig?',4,`T har n − 1 kanter, og komplementet har n(n−1)/2 − (n−1). Like mange ⇒ n(n−1)/2 = 2(n−1) ⇒ n = 4. (Stien P₄ er selvkomplementær.)`)],steps:[S('Sett opp: |E(T)| = |E(T̄)| og |E(T)| + |E(T̄)| = |E(Kₙ)|.',[],``)]};
}});

})(typeof window!=='undefined'? window : globalThis);
