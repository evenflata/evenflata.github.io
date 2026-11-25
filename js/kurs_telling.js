/* kurs_telling.js — kombinatorikk forklart fra bunnen, med alle utfall listet opp */
(function(G){
'use strict';
const b=(n,k)=>`<span class="binom"><span>${n}</span><span>${k}</span></span>`;
const chips=arr=>`<div class="opts">${arr.map(x=>`<span>${x}</span>`).join('')}</div>`;
const T=G.KURS.find(k=>k.id==='telling');
T.min=15;
T.idea='Kombinatorikk er bare <b>systematisk telling</b>: «hvor mange muligheter finnes?». Nesten alt bygger på én enkelt regel, pluss to spørsmål du stiller deg selv. Under ser du hvert steg med et lite eksempel der <i>alle</i> mulighetene er skrevet opp, så du kan se at formelen stemmer.';
T.sections=[
 {h:'1. Grunnregelen: valg etter hverandre ganges',
  body:`Du har 3 gensere (rød, blå, grønn) og 2 bukser (jeans, chinos). Hvor mange antrekk?<br>For <i>hver</i> genser kan du velge mellom 2 bukser. Det blir 2 + 2 + 2 = <b>3 · 2 = 6</b>:`+chips(['rød+jeans','rød+chinos','blå+jeans','blå+chinos','grønn+jeans','grønn+chinos']),
  rule:'Gjør du flere valg etter hverandre, <b>ganger</b> du antall muligheter i hvert valg.'},
 {h:'2. Gjentakelse lov: n · n · n ⋯ = n<sup>k</sup>',
  body:`En kode på 2 tegn, der hvert tegn er A, B eller C. Samme tegn kan brukes to ganger.<br>Plass 1: 3 valg. Plass 2: fortsatt 3 valg. Totalt <b>3 · 3 = 3² = 9</b>:`+chips(['AA','AB','AC','BA','BB','BC','CA','CB','CC'])+`En PIN-kode på 4 sifre: 10 · 10 · 10 · 10 = 10⁴ = 10 000.`,
  rule:'k plasser, n valg på hver plass, gjentakelse lov ⇒ <b>n<sup>k</sup></b>.'},
 {h:'3. Ingen gjentakelse: n · (n−1) · (n−2) ⋯',
  body:`Velg <b>leder og nestleder</b> blant Anna, Bo og Cecilie. Samme person kan ikke ha begge rollene.<br>Leder: 3 valg. Nestleder: bare 2 igjen. Totalt <b>3 · 2 = 6</b>:`+chips(['Anna–Bo','Anna–Cecilie','Bo–Anna','Bo–Cecilie','Cecilie–Anna','Cecilie–Bo'])+`(første navn = leder). Merk at «Anna–Bo» og «Bo–Anna» er <i>forskjellige</i>, fordi rollene er forskjellige.<br><br><b>Spesialtilfelle:</b> Stiller du opp <i>alle</i> n i en rekke, får du n · (n−1) ⋯ 2 · 1 = <b>n!</b> («n fakultet»). 3 personer i kø: 3! = 6:`+chips(['ABC','ACB','BAC','BCA','CAB','CBA']),
  rule:'Velg k av n i rekkefølge uten gjentakelse ⇒ <b>n · (n−1) ⋯ (n−k+1)</b> (k faktorer) = n!/(n−k)!'},
 {h:'4. Rekkefølgen teller ikke: del på det du har telt for mye',
  body:`Nå skal du bare velge en <b>gruppe på 2</b> blant Anna, Bo og Cecilie, uten roller. Da er «Anna–Bo» og «Bo–Anna» <i>samme</i> gruppe.<br>Fra steg 3 hadde vi 6 ordnede par, men hver gruppe er telt 2 ganger. Altså 6 / 2 = <b>3</b> grupper:`+chips(['{Anna, Bo}','{Anna, Cecilie}','{Bo, Cecilie}'])+`Generelt blir hver gruppe på k personer telt k! ganger (alle måtene å ordne dem på). Derfor deler vi på k!:<div class="big-f">${b('n','k')} = <span class="frac"><span>n · (n−1) ⋯ (n−k+1)</span><span>k!</span></span></div>Eksempel: velg 2 av 4 venner (A, B, C, D): ${b(4,2)} = (4 · 3)/(2 · 1) = <b>6</b>:`+chips(['AB','AC','AD','BC','BD','CD'])+`Les ${b('n','k')} som «n over k» eller «velg k av n». Det skrives også C(n, k).`,
  rule:'Velg en <i>gruppe</i> på k av n (uten rekkefølge, uten gjentakelse) ⇒ <b>'+b('n','k')+'</b>.'},
 {h:'5. To spørsmål avgjør hvilken formel du bruker',
  body:`<div class="tblwrap"><table class="choose"><tr><th></th><th>Kan samme ting velges flere ganger? <b>Nei</b></th><th><b>Ja</b></th></tr>
   <tr><th>Teller rekkefølgen? <b>Ja</b></th><td><b>n!/(n−k)!</b><br><span class="muted">leder + nestleder, podium, ord uten gjentatte bokstaver</span></td><td><b>n<sup>k</sup></b><br><span class="muted">PIN-kode, passord, funksjoner</span></td></tr>
   <tr><th><b>Nei</b></th><td><b>${b('n','k')}</b><br><span class="muted">grupper, komiteer, korthender, delmengder</span></td><td><b>${b('n+k−1','k')}</b><br><span class="muted">kjøpe k boller av n sorter (steg 7)</span></td></tr></table></div>
   Prøv selv i utforskeren under: velg n og k og se alle utfallene for hver av de fire modellene.`,
  demo:true},
 {h:'6. Like bokstaver: del på bytter som ikke synes',
  body:`Hvor mange ord kan lages av bokstavene i <b>ANNA</b>?<br>Hadde alle fire bokstavene vært ulike (A₁ N₁ N₂ A₂), ville det vært 4! = 24 rekkefølger. Men bytter du om de to A-ene, eller de to N-ene, får du <i>samme</i> ord. Hvert ord er altså telt 2! · 2! = 4 ganger. Svaret blir 24 / 4 = <b>6</b>:`+chips(['AANN','ANAN','ANNA','NAAN','NANA','NNAA'])+`Generelt: <b>n! / (k₁! · k₂! ⋯)</b>, der k-ene er hvor mange ganger hver bokstav gjentas. EKSAMENSFEST (12 bokstaver, 3 E og 3 S): 12!/(3! · 3!) = 13 305 600.`,
  rule:'Like elementer ⇒ del på fakultetet av hvor mange ganger hver gjentas.'},
 {h:'7. Stjerner og streker: like ting fordelt på ulike bokser',
  body:`Du kjøper <b>4 boller</b> i et bakeri med <b>3 sorter</b> (kanel | sjokolade | vanilje). Bare antallet av hver sort teller.<br>Tegn hvert kjøp som 4 stjerner og 2 streker. Strekene deler stjernene inn i de 3 sortene:<div class="opts"><span>★★|★|★ = 2 kanel, 1 sjokolade, 1 vanilje</span><span>★★★★|| = 4 kanel</span><span>|★|★★★ = 0 kanel, 1 sjokolade, 3 vanilje</span></div>Alle kjøp er altså en rad med 6 symboler, der du velger hvilke 2 plasser som er streker: ${b(6,2)} = <b>15</b>.<br><br>Dette er <i>samme</i> spørsmål som «hvor mange løsninger har x₁ + x₂ + x₃ = 4 med alle x ≥ 0?» (x₁ = antall kanel osv.).<br>Generelt: n like ting i k bokser ⇒ n stjerner og k−1 streker ⇒ <b>${b('n+k−1','k−1')}</b>.<br><b>Krav x<sub>i</sub> ≥ 1?</b> Legg én ting i hver boks først, og fordel resten fritt. K26: x₁+x₂+x₃+x₄ = 13, x ≥ 0 ⇒ ${b(16,3)} = 560.`,
  rule:'«Hvor mange av hver?» med like ting ⇒ stjerner og streker.'},
 {h:'8. «Minst én»: tell det motsatte og trekk fra',
  body:`Hvor mange koder på 3 tegn fra {a, b, c} inneholder <b>minst én a</b>?<br>Å telle direkte krever mange tilfeller (én a, to a-er, tre a-er). Tell heller det motsatte:<br>Alle koder: 3³ = 27. Koder <i>uten</i> a (bare b og c): 2³ = 8.<br>Med minst én a: 27 − 8 = <b>19</b>.<br><br>Det er akkurat dette passordoppgaven i H25 gjør: alle passord der første tegn er bokstav (29 · 39⁵), minus de som ikke har noe siffer (29⁶).`,
  rule:'Ser du «minst én» eller «minst ett», tenk: <b>alle − ingen</b>.'},
 {h:'9. «Eller»: legg sammen, men ikke tell dobbelt',
  body:`Bitstrenger av lengde 4 som starter med 1 <i>eller</i> slutter med 0:<br>Starter med 1: 2³ = 8. Slutter med 0: 2³ = 8. Men de som gjør <i>begge</i> (1 _ _ 0, 2² = 4 stk) er telt to ganger.<br>Svar: 8 + 8 − 4 = <b>12</b>.<br>Formel: |A ∪ B| = |A| + |B| − |A ∩ B|. Er tilfellene adskilt (kan ikke skje samtidig), legger du bare sammen. Det er addisjonsregelen.`,
  rule:'«Eller» ⇒ legg sammen og trekk fra overlappet.'},
 {h:'10. Funksjoner er også bare valg',
  body:`A = {1, 2, 3}, B = {x, y}. En funksjon A → B betyr at hvert element i A peker på ett element i B.<br><b>Alle funksjoner:</b> 1 velger x eller y, 2 velger x eller y, 3 velger x eller y ⇒ 2 · 2 · 2 = 2³ = <b>8</b> (steg 2!). Generelt |B|<sup>|A|</sup>.`+chips(['xxx','xxy','xyx','xyy','yxx','yxy','yyx','yyy'])+`(«xxy» betyr 1→x, 2→x, 3→y)<br><b>Injektiv</b> = ingen to peker på samme. Det er umulig her (3 elementer, bare 2 mål). Med |A| ≤ |B| blir det |B| · (|B|−1) ⋯ (steg 3).<br><b>Surjektiv</b> = alle i B blir truffet. Tell det motsatte (steg 8): av de 8 er det bare «xxx» og «yyy» som bommer på noe ⇒ 8 − 2 = <b>6</b>. Med 3 eller flere mål blir det inklusjon–eksklusjon (steg 9): |B|<sup>|A|</sup> − ${b('|B|',1)}(|B|−1)<sup>|A|</sup> + ${b('|B|',2)}(|B|−2)<sup>|A|</sup> − ⋯<br><b>Relasjoner på A:</b> A × A har 3 · 3 = 9 par, og hvert par er med eller ikke ⇒ 2⁹.`,
  rule:'Funksjon = hvert element i A gjør ett valg i B.'}];
T.ex={q:'Passord på 6 tegn av 29 bokstaver og 10 sifre. Første tegn skal være en bokstav, og passordet skal ha minst ett siffer. (H25)',
  s:['Steg 1 (grunnregelen): første plass 29 valg, de 5 andre 39 valg hver ⇒ 29 · 39⁵.','Steg 8 («minst ett siffer»): trekk fra de som ikke har noe siffer, altså bare bokstaver ⇒ 29⁶.','Svar: 29 · 39⁵ − 29⁶ = 2 021 678 450. (Skriv 29*39^5-29^6 i svarfeltet.)']};
T.traps=['Still alltid de to spørsmålene: <i>Teller rekkefølgen?</i> <i>Kan noe velges flere ganger?</i>','Korthender, komiteer og grupper: rekkefølgen teller ikke ⇒ '+b('n','k')+'.','Usikker? Lag en mini-versjon med 2–3 elementer, skriv opp alle mulighetene og sjekk formelen.'];
T.must=null;

/* ---- interaktiv utforsker ---- */
G.KURS_DEMO=function(host){
  const L='ABCDE'; let n=3,k=2;
  host.innerHTML=`<div class="demo"><div class="row"><label>n (antall å velge fra): <select id="dn">${[2,3,4,5].map(x=>`<option ${x===n?'selected':''}>${x}</option>`).join('')}</select></label><label>k (antall som velges): <select id="dk">${[1,2,3].map(x=>`<option ${x===k?'selected':''}>${x}</option>`).join('')}</select></label></div><div class="dgrid"></div></div>`;
  const draw=()=>{ const A=L.slice(0,n).split(''); const ordM=[],ordU=[],unU=[],unM=[];
    const rec=(pre)=>{ if(pre.length===k){ const s=pre.join(''); ordM.push(s); if(new Set(pre).size===k){ ordU.push(s); if([...s].every((c,i)=>i===0||s[i-1]<c)) unU.push('{'+pre.join(',')+'}'); } if([...s].every((c,i)=>i===0||s[i-1]<=c)) unM.push(s); return; } for(const a of A) rec(pre.concat(a)); }; rec([]);
    const box=(t,f,arr,ex)=>`<div class="dbox"><div class="dh"><b>${t}</b><span class="cnt">${arr.length}</span></div><div class="muted" style="font-size:13px">${f}</div><div class="muted" style="font-size:12.5px;margin-bottom:6px">${ex}</div>${chips(arr.length?arr:['(ingen — k > n)'])}</div>`;
    const P=[...Array(k).keys()].map(i=>n-i).join(' · ');
    $('.dgrid',host).innerHTML=box('Ordnet, med gjentakelse',`n<sup>k</sup> = ${n}<sup>${k}</sup> = ${n**k}`,ordM,'f.eks. koder/passord')+box('Ordnet, uten gjentakelse',`${P} = ${ordU.length}`,ordU,'f.eks. leder + nestleder')+box('Uordnet, uten gjentakelse',`${b(n,k)} = ${unU.length}`,unU,'f.eks. grupper, korthender')+box('Uordnet, med gjentakelse',`${b(`${n}+${k}−1`,k)} = ${b(n+k-1,k)} = ${unM.length}`,unM,'f.eks. boller av ulike sorter'); };
  const $=(s,r)=>r.querySelector(s);
  $('#dn',host).addEventListener('change',e=>{ n=Number(e.target.value); draw(); }); $('#dk',host).addEventListener('change',e=>{ k=Number(e.target.value); draw(); });
  draw();
};
})(typeof window!=='undefined'? window : globalThis);
