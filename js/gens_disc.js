/* gens_disc.js — telling, mengder, relasjoner, funksjoner, logikk, predikatlogikk */
(function(G){
'use strict';
const C=G.C, F=G.F, S=G.S, GENS=G.GENS; const add=o=>GENS.push(o);
const b=C.bin, fm=C.fmt;

/* ================= TELLING ================= */
add({id:'mengdetell',topic:'telling',name:'Mengder & funksjoner: tell',method:false,quick:true,make(){
  const n=C.ri(2,4), m=C.ri(Math.max(3,n),6); const A=[...Array(m).keys()].map(i=>i+1), Bs=['a','b','c','d'].slice(0,n);
  const parts=[F.num('Hvor mange elementer har A × B?',m*n,`|A×B| = |A|·|B| = ${m}·${n} = ${m*n}.`),
    F.num('Hvor mange elementer har potensmengden P(A)?',2n**BigInt(m),`Hvert element er med eller ikke: 2<sup>${m}</sup> = ${2**m}.`),
    F.num('Hvor mange relasjoner finnes på A?',2n**BigInt(m*m),`En relasjon på A er en delmengde av A×A, som har ${m}·${m} = ${m*m} elementer ⇒ 2<sup>${m*m}</sup> = ${fm(2n**BigInt(m*m))}.`),
    F.num('Hvor mange funksjoner finnes fra A til B?',BigInt(n)**BigInt(m),`Hvert av de ${m} elementene i A sendes til ett av ${n} elementer: ${n}<sup>${m}</sup> = ${n**m}.`),
    F.num('Hvor mange injektive funksjoner finnes fra B til A?',C.perm(m,n),`Første element i B har ${m} valg, neste ${m-1}, …: P(${m},${n}) = ${[...Array(n).keys()].map(i=>m-i).join('·')} = ${C.perm(m,n)}.`),
    F.num('Hvor mange surjektive funksjoner finnes fra A til B?',C.surj(m,n),`Inklusjon–eksklusjon: ${[...Array(n+1).keys()].map(i=>`${i%2?'−':'+'} ${b(n,i)}·${n-i}<sup>${m}</sup>`).join(' ').replace(/^\+ /,'')} = ${C.surj(m,n)}. (Alle funksjoner minus de som bommer på minst ett element.)`)];
  if(C.chance(0.3)){ parts.splice(4,1,F.num('Hvor mange injektive funksjoner finnes fra A til A × B?',C.perm(m*n,m),`|A×B| = ${m*n}. Injektiv: ${[...Array(m).keys()].map(i=>m*n-i).join('·')} = ${fm(C.perm(m*n,m))}.`)); }
  return {prompt:`La A = {${A.join(', ')}} og B = {${Bs.join(', ')}}.`,parts,
    steps:[S(`Huskeliste (ingen formelark!): |A×B| = |A||B|, |P(A)| = 2<sup>|A|</sup>, relasjoner på A: 2<sup>|A|²</sup>, funksjoner A→B: |B|<sup>|A|</sup>, injektive A→B: P(|B|,|A|) = |B|!/(|B|−|A|)!, bijeksjoner (|A|=|B|=n): n!, surjektive: Σ (−1)<sup>i</sup> C(|B|,i)(|B|−i)<sup>|A|</sup>.`,[], `Surjektive A→B med |A|=5, |B|=3: 3⁵ − 3·2⁵ + 3·1⁵ = 243 − 96 + 3 = 150 (H25).`)]};
}});

add({id:'stjerner',topic:'telling',name:'Stjerner og streker (x₁+…+xₖ = n)',method:true,quick:true,make(){
  const k=C.ri(3,5), n=C.ri(8,20); const v=C.pick(['ge0','ge1','low','up']);
  let low=Array(k).fill(0), cond='alle x<sub>i</sub> ≥ 0', N=n, ans, sol, extra='';
  if(v==='ge1'){ low=Array(k).fill(1); cond='alle x<sub>i</sub> ≥ 1'; }
  if(v==='low'){ do{ low=Array.from({length:k},()=>C.ri(0,3)); }while(low.reduce((a,c)=>a+c,0)>n-4||low.every(x=>x===0)); cond=low.map((l,i)=>`x<sub>${i+1}</sub> ≥ ${l}`).join(', '); }
  const L=low.reduce((a,c)=>a+c,0); N=n-L;
  if(v==='up'){ const U=C.ri(2,Math.max(2,Math.floor(n/2))); cond=`alle x<sub>i</sub> ≥ 0 og x<sub>1</sub> ≤ ${U}`; const tot=C.binom(n+k-1,k-1), badN=n-(U+1); const bad= badN>=0? C.binom(badN+k-1,k-1):0n; ans=tot-bad;
    sol=`Komplement: alle løsninger ${b(n+k-1,k-1)} = ${tot} minus de med x<sub>1</sub> ≥ ${U+1}: sett y<sub>1</sub> = x<sub>1</sub> − ${U+1}, gir ${b(badN+k-1,k-1)} = ${bad}. Svar ${ans}.`;
    return {prompt:`Hvor mange heltallsløsninger har x<sub>1</sub> + ⋯ + x<sub>${k}</sub> = ${n} når ${cond}?`,parts:[F.num('antall',ans,sol)],
      steps:[S(`Uten øvre grense: «${n} kuler i ${k} bokser» = C(n+k−1, k−1).`,[F.num('alle',tot)],`${b(n+k-1,k-1)} = ${tot}`),S(`Tell de «ulovlige» (x<sub>1</sub> ≥ ${U+1}): trekk ${U+1} fra x<sub>1</sub> og tell på nytt.`,[F.num('ulovlige',bad)],`${b(badN+k-1,k-1)} = ${bad}`),S(`Trekk fra.`,[F.num('svar',ans)],`${tot} − ${bad} = ${ans}`)]};
  }
  ans=C.binom(N+k-1,k-1);
  sol=`${L?`Substituer y<sub>i</sub> = x<sub>i</sub> − (nedre grense): y<sub>1</sub>+⋯+y<sub>${k}</sub> = ${n} − ${L} = ${N}, y<sub>i</sub> ≥ 0. `:''}Antall = ${b(`${N}+${k}−1`,`${k}−1`)} = ${b(N+k-1,k-1)} = ${ans}.`;
  return {prompt:`Hvor mange heltallsløsninger har x<sub>1</sub> + ⋯ + x<sub>${k}</sub> = ${n} når ${cond}?`,parts:[F.num('Antall løsninger',ans,sol)],
    steps:[S(`Tolkning: plasser ${n} like kuler i ${k} ulike bokser.${L?` Først legger vi de påkrevde ${L} kulene (nedre grenser) i boksene. Hvor mange kuler er igjen?`:''}`,L?[F.num('kuler igjen',N)]:[],L?`${n} − ${L} = ${N}`:'Ingen nedre grenser å trekke fra.'),
      S(`Fordel ${N} kuler fritt i ${k} bokser: ${N} stjerner og ${k}−1 streker ⇒ C(n+k−1, k−1).`,[F.num('svar',ans)],`${b(N+k-1,k-1)} = ${ans}`,`C(n+k−1, k−1) = C(n+k−1, n).`)]};
}});

const WORDS=['EKSAMENSFEST','MATEMATIKK','DISKRET','KONGRUENS','INDUKSJON','TILSTAND','RELASJON','KRYPTERING','MENGDELÆRE','PRIMTALL','ALGEBRA','STATISTIKK','BANANA','TRONDHEIM','GLØSHAUGEN','SANNHETSTABELL'];
add({id:'anagram',topic:'telling',name:'Anagrammer (ord med like bokstaver)',method:true,quick:true,make(){
  const w=C.pick(WORDS); const cnt={}; for(const ch of w) cnt[ch]=(cnt[ch]||0)+1; const reps=Object.entries(cnt).filter(([,c])=>c>1);
  const den=reps.reduce((a,[,c])=>a*C.fact(c),1n); const ans=C.fact(w.length)/den;
  const parts=[F.num(`Hvor mange ulike ord (anagrammer) kan lages av alle bokstavene i ${w}?`,ans,`${w.length} bokstaver; gjentatte: ${reps.map(([l,c])=>`${l}×${c}`).join(', ')||'ingen'}. ${w.length}!/(${reps.map(([,c])=>c+'!').join('·')||'1'}) = ${fm(ans)}.`)];
  const steps=[S(`Tell antall bokstaver totalt.`,[F.num('n',w.length)],`${w} har ${w.length} bokstaver.`),
    S(`Hvilke bokstaver gjentas? Skriv nevneren som produkt av fakulteter (f.eks. «3!*3!»).`,[F.num('nevner',den)],reps.map(([l,c])=>`${l} forekommer ${c} ganger`).join(', ')+`. Nevner = ${reps.map(([,c])=>c+'!').join('·')||'1'} = ${den}.`,'Bytter vi to like bokstaver, får vi samme ord — derfor deler vi.'),
    S(`Svar: n!/(nevner).`,[F.num('antall',ans)],`${w.length}! / ${den} = ${fm(ans)}`)];
  if(reps.length){ const [L,c]=reps[0]; const rest=w.length-c+1; const den2=reps.slice(1).reduce((a,[,cc])=>a*C.fact(cc),1n); const a2=C.fact(rest)/den2;
    parts.push(F.num(`Hvor mange av dem har alle ${c} ${L}-ene ved siden av hverandre?`,a2,`Lim sammen ${L.repeat(c)} til én blokk: ${rest} «symboler», ${rest}!/${reps.slice(1).map(([,cc])=>cc+'!').join('·')||'1'} = ${fm(a2)}.`)); }
  return {prompt:`Se på ordet <b>${w}</b>. Et «ord» er her en hvilken som helst rekkefølge av bokstavene.`,parts,steps};
}});

add({id:'passord',topic:'telling',name:'Passord med krav',method:true,quick:true,make(){
  const t=C.pick(['h25','k26','range','norep']);
  if(t==='h25'){ const L=C.pick([26,29]), n=C.ri(5,8); const D=10; const ans=BigInt(L)*BigInt(L+D)**BigInt(n-1)-BigInt(L)**BigInt(n);
    return {prompt:`Passord har lengde ${n} og bygges av ${L} små bokstaver og sifrene 0–9. Passordet må inneholde minst ett siffer, og første tegn må være en bokstav. Hvor mange passord finnes?`,
      parts:[F.num('Antall passord',ans,`Første tegn bokstav, resten fritt: ${L}·${L+D}<sup>${n-1}</sup>. Trekk fra de uten siffer (kun bokstaver): ${L}<sup>${n}</sup>. Svar: ${L}·${L+D}<sup>${n-1}</sup> − ${L}<sup>${n}</sup> = ${fm(ans)}.`)],
      steps:[S(`Tell alle passord der første tegn er bokstav (ignorer «minst ett siffer»).`,[F.num('antall',BigInt(L)*BigInt(L+D)**BigInt(n-1))],`${L}·${L+D}<sup>${n-1}</sup>`,'Første plass: L valg. Hver av de andre: L+10 valg.'),
        S(`«Minst ett» ⇒ bruk komplement: tell de som IKKE har noe siffer.`,[F.num('uten siffer',BigInt(L)**BigInt(n))],`Bare bokstaver: ${L}<sup>${n}</sup>`),
        S(`Trekk fra.`,[F.num('svar',ans)],`${fm(ans)}`,'Du kan skrive uttrykk som 29*39^5-29^6 direkte i svarfeltet.')]};}
  if(t==='k26'){ const L=26, D=10, Sp=C.ri(3,6), n=C.ri(4,6); const T=L+D; const ans=BigInt(T)**BigInt(n)+BigInt(Sp*(n-1))*BigInt(T)**BigInt(n-1);
    return {prompt:`Passord av lengde ${n} lages av 26 bokstaver, 10 sifre og ${Sp} spesialsymboler. Det kan ikke være mer enn ett spesialsymbol, og et spesialsymbol kan ikke stå først. Hvor mange muligheter?`,
      parts:[F.num('Antall passord',ans,`Tilfelle 0 spesialsymboler: 36<sup>${n}</sup>. Tilfelle 1: velg symbol (${Sp}), plass (${n-1}, ikke først), resten 36<sup>${n-1}</sup>. Sum: 36<sup>${n}</sup> + ${Sp}·${n-1}·36<sup>${n-1}</sup> = ${fm(ans)}.`)],
      steps:[S(`Del opp i tilfeller etter antall spesialsymboler. Ingen spesialsymboler:`,[F.num('antall',BigInt(T)**BigInt(n))],`36<sup>${n}</sup>`),S(`Nøyaktig ett spesialsymbol: velg hvilket, hvor (ikke først), og fyll resten.`,[F.num('antall',BigInt(Sp*(n-1))*BigInt(T)**BigInt(n-1))],`${Sp}·${n-1}·36<sup>${n-1}</sup>`),S('Legg sammen (disjunkte tilfeller).',[F.num('svar',ans)],fm(ans))]};}
  if(t==='range'){ const L=29, D=10, a=C.ri(3,4), bb=a+C.ri(1,2); let tot=0n, good=0n; const terms=[]; for(let k=a;k<=bb;k++){ tot+=39n**BigInt(k); good+=39n**BigInt(k)-29n**BigInt(k)-10n**BigInt(k); terms.push(`(39<sup>${k}</sup> − 29<sup>${k}</sup> − 10<sup>${k}</sup>)`); }
    return {prompt:`Passord lages av symbolene a–å (29 bokstaver) og 0–9, og har mellom ${a} og ${bb} tegn.`,
      parts:[F.num('Hvor mange passord finnes?',tot,`Σ 39<sup>k</sup> for k = ${a}..${bb} = ${fm(tot)}.`),F.num('Hvor mange av dem har minst én bokstav og minst ett siffer?',good,`For hver lengde k: alle − bare bokstaver − bare sifre. ${terms.join(' + ')} = ${fm(good)}.`)],
      steps:[S(`Summeregelen: tell hver lengde for seg og legg sammen.`,[F.num('alle',tot)],`${[...Array(bb-a+1).keys()].map(i=>`39<sup>${a+i}</sup>`).join(' + ')}`),S(`For «minst én bokstav og minst ett siffer»: trekk fra passordene som er bare bokstaver eller bare sifre (disse er disjunkte).`,[F.num('svar b)',good)],terms.join(' + '))]};}
  const T=C.pick([26,36,62]), k=C.ri(4,7); const ans=C.perm(T,k);
  return {prompt:`Hvor mange passord av lengde ${k} kan lages av ${T} ulike symboler hvis ingen symboler kan gjentas?`,parts:[F.num('Antall passord',ans,`Ordnet utvalg uten tilbakelegging: ${T}!/(${T}−${k})! = ${[...Array(k).keys()].map(i=>T-i).join('·')} = ${fm(ans)}.`)],
    steps:[S(`Rekkefølgen betyr noe, og ingen gjentakelse ⇒ ordnet utvalg uten tilbakelegging: P(n,k) = n!/(n−k)!.`,[F.num('svar',ans)],`${[...Array(k).keys()].map(i=>T-i).join('·')}`)]};
}});

add({id:'komite',topic:'telling',name:'Utvalg fra grupper (inkl.–eksl.)',method:true,quick:true,make(){
  const g=[C.ri(7,13),C.ri(6,12),C.ri(6,12)], names=C.pick([['studenter fra IndØk','fra Data','fra IngIKT'],['studenter fra Fysmat','fra Kybernetikk','fra Elektro'],['førsteklassinger','andreklassinger','tredjeklassinger']]); const k=C.ri(5,6); const T=g[0]+g[1]+g[2];
  const exact=C.binom(g[0],2)*C.binom(g[1],2)*C.binom(g[2],2);
  const tot=C.binom(T,k); const one=[C.binom(T-g[0],k),C.binom(T-g[1],k),C.binom(T-g[2],k)]; const two=[C.binom(g[2],k),C.binom(g[1],k),C.binom(g[0],k)]; const atleast=tot-(one[0]+one[1]+one[2])+(two[0]+two[1]+two[2]);
  const parts=[F.num(`… uten noen restriksjoner?`,tot,`${b(T,k)} = ${fm(tot)}`),F.num(`… når det skal være minst én fra hver av de tre gruppene?`,atleast,`Komplement + inklusjon–eksklusjon: ${b(T,k)} − [${b(T-g[0],k)} + ${b(T-g[1],k)} + ${b(T-g[2],k)}] + [${b(g[2],k)} + ${b(g[1],k)} + ${b(g[0],k)}] = ${fm(tot)} − ${fm(one[0]+one[1]+one[2])} + ${fm(two[0]+two[1]+two[2])} = ${fm(atleast)}.`)];
  if(k===6) parts.unshift(F.num(`… når det skal være nøyaktig to fra hver gruppe?`,exact,`${b(g[0],2)}·${b(g[1],2)}·${b(g[2],2)} = ${fm(exact)}`));
  return {prompt:`En klasse har ${g[0]} ${names[0]}, ${g[1]} ${names[1]} og ${g[2]} ${names[2]} (${T} totalt). Det skal velges en referansegruppe på ${k} personer (rekkefølgen spiller ingen rolle). På hvor mange måter kan det gjøres …`,parts,
    steps:[S(`Uordnet utvalg uten tilbakelegging av ${k} fra ${T}.`,[F.num('alle',tot)],`${b(T,k)}`),
      S(`«Minst én fra hver» ⇒ tell de som mangler minst én gruppe. Mangler gruppe 1: velg alle ${k} blant de ${T-g[0]} andre. Regn |M₁| + |M₂| + |M₃|.`,[F.num('sum enkle',one[0]+one[1]+one[2])],`${b(T-g[0],k)} + ${b(T-g[1],k)} + ${b(T-g[2],k)} = ${one.join(' + ')}`),
      S(`Snitt: mangler to grupper ⇒ alle fra den tredje. Regn |M₁∩M₂| + |M₁∩M₃| + |M₂∩M₃|. (Mangler alle tre: 0.)`,[F.num('sum snitt',two[0]+two[1]+two[2])],`${b(g[2],k)} + ${b(g[1],k)} + ${b(g[0],k)} = ${two.join(' + ')}`),
      S(`Svar = alle − (enkle − snitt).`,[F.num('svar',atleast)],fm(atleast))]};
}});

add({id:'kort',topic:'telling',name:'Kortstokk og hender',method:false,quick:true,make(){
  const v=C.pick(['h24','farge','ess','to']);
  if(v==='h24'){ const k=3; const ord=C.perm(54,3), un=C.binom(54,3), same=un-(C.binom(53,2)-52n);
    return {prompt:`En kortstokk har 52 vanlige kort og to jokere (54 kort). Du trekker ${k} kort.`,parts:[F.num('På hvor mange måter kan du trekke tre kort hvis rekkefølgen teller og de to jokerne regnes som ulike?',ord,`54·53·52 = ${fm(ord)}`),F.num('… hvis rekkefølgen <i>ikke</i> teller og jokerne er ulike?',un,`${b(54,3)} = ${fm(un)}`),F.num('… hvis rekkefølgen ikke teller og de to jokerne regnes som <i>like</i>?',same,`I b) ble hender med nøyaktig én joker telt to ganger (én gang med J1, én gang med J2). Det er ${b(52,2)} = 1326 slike hender for hver joker. Når jokerne er like, skal de bare telles én gang, så vi trekker fra 1326: ${fm(un)} − 1 326 = ${fm(same)}. (H24)`)],steps:[]};}
  if(v==='farge'){ const ans=4n*C.binom(13,5); return {prompt:`Du trekker en hånd på 5 kort fra en vanlig kortstokk med 52 kort (rekkefølgen spiller ingen rolle).`,parts:[F.num('Hvor mange ulike hender finnes?',C.binom(52,5),`${b(52,5)} = 2 598 960`),F.num('Hvor mange hender har alle fem kortene i samme farge (f.eks. alle hjerter)?',ans,`Velg farge (4), velg 5 av 13: 4·${b(13,5)} = ${ans}`),F.num('Hvor mange hender har nøyaktig to hjerter?',C.binom(13,2)*C.binom(39,3),`${b(13,2)}·${b(39,3)} = ${fm(C.binom(13,2)*C.binom(39,3))}`)],steps:[]};}
  if(v==='ess'){ const k=C.ri(4,6); return {prompt:`Du trekker en hånd på ${k} kort fra en vanlig kortstokk med 52 kort, der 4 av kortene er ess. Rekkefølgen spiller ingen rolle.`,parts:[F.num('Hvor mange hender inneholder minst ett ess?',C.binom(52,k)-C.binom(48,k),`Komplement: alle hender minus hendene uten ess. Uten ess velger du alle ${k} blant de 48 andre kortene: ${b(52,k)} − ${b(48,k)} = ${fm(C.binom(52,k))} − ${fm(C.binom(48,k))} = ${fm(C.binom(52,k)-C.binom(48,k))}`),F.num('Hvor mange hender inneholder nøyaktig ett ess?',4n*C.binom(48,k-1),`Velg hvilket ess (4 måter), og fyll resten med ikke-ess: 4·${b(48,k-1)} = ${fm(4n*C.binom(48,k-1))}`)],steps:[S(`«Minst ett» ⇒ komplement nesten alltid!`,[],``)]};}
  return {prompt:`Du trekker 5 kort ett og ett og legger dem på rad foran deg, så rekkefølgen teller. Kortstokken har 52 kort.`,parts:[F.num('Hvor mange ulike rekker kan du få?',C.perm(52,5),`52·51·50·49·48 = ${fm(C.perm(52,5))}`),F.num('Hvor mange av rekkene har fem ulike verdier (ingen par; det finnes 13 verdier og 4 farger)?',C.perm(13,5)*4n**5n,`Velg verdier i rekkefølge: 13·12·11·10·9, og farge for hvert: 4<sup>5</sup>. ${fm(C.perm(13,5)*4n**5n)}`)],steps:[]};
}});

add({id:'bitstreng',topic:'telling',name:'Bitstrenger',method:false,quick:true,make(){
  const n=C.ri(6,12), k=C.ri(2,Math.min(5,n-2));
  let atl=0n; for(let i=k;i<=n;i++) atl+=C.binom(n,i);
  const startEnd=2n**BigInt(n-1)+2n**BigInt(n-2)-2n**BigInt(n-3);
  const fib=[1,2]; for(let i=2;i<=n;i++) fib.push(fib[i-1]+fib[i-2]);
  const parts=[F.num(`Hvor mange har nøyaktig ${k} enere?`,C.binom(n,k),`Velg plassene til enerne: ${b(n,k)} = ${C.binom(n,k)}`),
    F.num(`Hvor mange har minst ${k} enere?`,atl,`Σ<sub>i=${k}</sub><sup>${n}</sup> C(${n},i) = 2<sup>${n}</sup> − Σ<sub>i&lt;${k}</sub> C(${n},i) = ${atl}`),
    F.num(`Hvor mange starter med 1 eller slutter med 00 (eller begge)?`,startEnd,`|A∪B| = |A|+|B|−|A∩B| = 2<sup>${n-1}</sup> + 2<sup>${n-2}</sup> − 2<sup>${n-3}</sup> = ${startEnd}`),
    F.num(`Hvor mange har ikke to enere på rad («11» forekommer ikke)?`,fib[n],`a<sub>n</sub> = a<sub>n−1</sub> + a<sub>n−2</sub> (slutter på 0: a<sub>n−1</sub>, slutter på 01: a<sub>n−2</sub>), a₀=1, a₁=2: ${fib.slice(0,n+1).join(', ')}. Svar ${fib[n]}.`)];
  return {prompt:`Se på alle bitstrenger (strenger av 0 og 1) av lengde ${n}.`,parts,steps:[S(`Verktøy: «nøyaktig k» → C(n,k). «Minst» → sum eller komplement. «Eller» → inklusjon–eksklusjon. «Ikke 11» → rekursjon (Fibonacci).`,[],``)]};
}});

const SCEN=[
  {t:(n,k)=>`På hvor mange måter kan ${k} personer av ${n} sette seg på ${k} nummererte stoler?`,typ:0,f:(n,k)=>C.perm(n,k)},
  {t:(n,k)=>`Hvor mange måter kan man velge et styre på ${k} (uten roller) blant ${n} personer?`,typ:1,f:(n,k)=>C.binom(n,k)},
  {t:(n,k)=>`En kode består av ${k} tegn, og hvert tegn velges blant ${n} mulige symboler. Samme symbol kan brukes flere ganger. Hvor mange koder finnes?`,typ:2,f:(n,k)=>BigInt(n)**BigInt(k)},
  {t:(n,k)=>`Du kjøper ${k} boller i et bakeri med ${n} sorter (flere av samme sort er lov). Hvor mange ulike kjøp?`,typ:3,f:(n,k)=>C.binom(n+k-1,k)},
  {t:(n,k)=>`I en konkurranse med ${n} deltakere deles det ut ${k} ulike premier (1. plass, 2. plass, …, ${k}. plass). Ingen kan vinne mer enn én. På hvor mange måter kan premiene deles ut?`,typ:0,f:(n,k)=>C.perm(n,k)},
  {t:(n,k)=>`Du kaster ${k} like terninger med ${n} sider. Hvor mange ulike utfall (bare antall av hver verdi teller)?`,typ:3,f:(n,k)=>C.binom(n+k-1,k)},
  {t:(n,k)=>`Du kaster ${k} ulike (nummererte) terninger med ${n} sider. Hvor mange utfall?`,typ:2,f:(n,k)=>BigInt(n)**BigInt(k)},
  {t:(n,k)=>`Hvor mange delmengder med ${k} elementer har en mengde med ${n} elementer?`,typ:1,f:(n,k)=>C.binom(n,k)},
];
const TYP=['Ordnet, uten tilbakelegging: n!/(n−k)!','Uordnet, uten tilbakelegging: C(n,k)','Ordnet, med tilbakelegging: n<sup>k</sup>','Uordnet, med tilbakelegging: C(n+k−1,k)'];
add({id:'utvalg',topic:'telling',name:'Hvilken utvalgsmodell?',method:false,quick:true,make(){
  const s=C.pick(SCEN); const n=C.ri(6,12), k=C.ri(3,Math.min(5,n-1)); const ans=s.f(n,k);
  return {prompt:s.t(n,k),parts:[F.mc('Hvilken utvalgsmodell passer?',TYP,s.typ,`${TYP[s.typ]}`),F.num('Hvor mange?',ans,`= ${fm(ans)}`)],steps:[S(`Spør deg selv: (1) Teller rekkefølgen? (2) Kan samme element velges flere ganger?`,[],`Ordnet/uordnet × med/uten tilbakelegging gir de fire formlene.`)]};
}});

add({id:'tilordning',topic:'logikk',name:'Tell tilordninger som gjør formel sann',method:false,quick:true,make(){
  const n=6; const vs=[...Array(n).keys()].map(i=>'x'+(i+1));
  const tpl=C.pick([
    {s:'¬x1 ∧ x6',f:e=>!e.x1&&e.x6,why:'x1 = F og x6 = T er låst, de 4 andre fritt: 2⁴ = 16.'},
    {s:'(x1 ∧ x2 ∧ x3) ∨ (x4 ∧ x5 ∧ x6)',f:e=>(e.x1&&e.x2&&e.x3)||(e.x4&&e.x5&&e.x6),why:'|A∪B| = 2³ + 2³ − 1 = 15.'},
    {s:'(x1 ∧ x2 ∧ x3) → (x4 ∨ x5 ∨ x6)',f:e=>!(e.x1&&e.x2&&e.x3)||(e.x4||e.x5||e.x6),why:'Usann kun når x1=x2=x3=T og x4=x5=x6=F: 1 tilordning. 64 − 1 = 63.'},
    {s:'x1 ⊕ x2  (dvs. (x1 ∧ ¬x2) ∨ (¬x1 ∧ x2))',f:e=>e.x1!==e.x2,why:'Halvparten av valgene for (x1,x2) — 2 av 4 — og resten fritt: 2·2⁴ = 32.'},
    {s:'(x1 ∨ x2) ∧ (x3 ∨ x4)',f:e=>(e.x1||e.x2)&&(e.x3||e.x4),why:'3 av 4 for (x1,x2), 3 av 4 for (x3,x4), x5,x6 fritt: 3·3·4 = 36.'},
    {s:'x1 → (x2 → x3)',f:e=>!e.x1||!e.x2||e.x3,why:'Usann kun når x1=T, x2=T, x3=F: 2³ usanne. 64 − 8 = 56.'},
    {s:'(x1 ↔ x2) ∧ (x3 ↔ x4)',f:e=>e.x1===e.x2&&e.x3===e.x4,why:'2 valg for paret (x1,x2), 2 for (x3,x4), 4 for x5,x6: 16.'},
    {s:'¬(x1 ∨ x2 ∨ x3)',f:e=>!e.x1&&!e.x2&&!e.x3,why:'x1=x2=x3=F, resten fritt: 2³ = 8.'}]);
  const cnt=C.rows(vs).filter(tpl.f).length;
  return {prompt:`La X = {x1, …, x6}. Det finnes 2⁶ = 64 tilordninger. Hvor mange av dem gjør formelen <b>${tpl.s}</b> sann?`,parts:[F.num('Antall tilordninger',cnt,tpl.why)],steps:[S(`Tips: tell ofte det motsatte — hvor mange gjør formelen USANN? — og trekk fra 64.`,[],``)]};
}});

/* ================= MENGDER ================= */
add({id:'mengdeop',topic:'mengder',name:'Mengdeoperasjoner',method:false,quick:true,make(){
  const U=[...Array(10).keys()].map(i=>i+1); const A=C.sample(U,C.ri(3,5)).sort((a,b)=>a-b); let B; do{ B=C.sample(U,C.ri(3,5)).sort((a,b)=>a-b);}while(A.filter(x=>B.includes(x)).length===0||A.filter(x=>B.includes(x)).length>2);
  const un=[...new Set(A.concat(B))].sort((a,b)=>a-b), it=A.filter(x=>B.includes(x)), d1=A.filter(x=>!B.includes(x)), d2=B.filter(x=>!A.includes(x)), sym=d1.concat(d2).sort((a,b)=>a-b);
  const pw=[[]]; it.forEach(x=>{ pw.slice().forEach(s=>pw.push(s.concat(x))); });
  const pwStr=pw.map(s=>'S'+s.map(String).sort().join('|'));
  const parts=[F.set('A ∪ B',un,''),F.set('A ∩ B',it,''),F.set('A \\ B',d1,''),F.set('(A \\ B) ∪ (B \\ A)',sym,'Symmetrisk differanse: elementer i nøyaktig én av mengdene.'),F.num('Hvor mange elementer har A × B?',A.length*B.length,`${A.length}·${B.length}`),
    Object.assign(F.set('P(A ∩ B)',[],`P(A∩B) = {${pw.map(s=>'{'+s.join(', ')+'}').join(', ')}} (${pw.length} elementer)`),{ans:pwStr,show:`{${pw.map(s=>'{'+s.join(',')+'}').join(', ')}}`})];
  return {prompt:`La A = {${A.join(', ')}} og B = {${B.join(', ')}}. Skriv mengder som {1, 2, 3}, og tom mengde som {} eller ∅.`,parts,steps:[]};
}});
add({id:'mengderek',topic:'mengder',name:'Rekonstruer A og B',method:false,quick:true,make(){
  const U=C.shuffle([...Array(10).keys()]); const d1=U.slice(0,3).sort((a,b)=>a-b), d2=U.slice(3,5).sort((a,b)=>a-b), it=U.slice(5,7).sort((a,b)=>a-b);
  const A=d1.concat(it).sort((a,b)=>a-b), B=d2.concat(it).sort((a,b)=>a-b), un=A.concat(d2).sort((a,b)=>a-b);
  return {prompt:`La A \\ B = {${d1.join(', ')}}, B \\ A = {${d2.join(', ')}} og A ∩ B = {${it.join(', ')}}.`,parts:[F.set('Finn A',A,'A = (A\\B) ∪ (A∩B)'),F.set('Finn A ∪ B',un,'(A\\B) ∪ (B\\A) ∪ (A∩B)'),F.num('Hvor mange elementer har P(B)?',2**B.length,`2<sup>${B.length}</sup>`)],steps:[]};
}});
const SETTF=[
  ['P(A ∩ B) ⊆ P(B)',true,'Hvis X ⊆ A∩B så er X ⊆ B.'],['∅ = P(∅)',false,'P(∅) = {∅} har ett element, ∅ har null.'],['A ∩ B ∈ P(A ∪ B)',true,'A∩B ⊆ A∪B, så A∩B er et element i potensmengden.'],
  ['P(A) ∪ P(B) = P(A ∪ B)',false,'Moteks.: A={1}, B={2}: {1,2} ∈ P(A∪B) men ikke i P(A)∪P(B).'],['P(A) ∩ P(B) = P(A ∩ B)',true,'X ⊆ A og X ⊆ B ⇔ X ⊆ A∩B.'],
  ['A \\ (B ∪ C) = (A \\ B) ∩ (A \\ C)',true,'De Morgan for mengder.'],['A \\ (B ∩ C) = (A \\ B) ∩ (A \\ C)',false,'Skal være union: (A\\B) ∪ (A\\C).'],
  ['(A × B) = (B × A) for alle A, B',false,'Moteks.: A={1}, B={2}: (1,2) ≠ (2,1).'],['|A ∪ B| = |A| + |B| − |A ∩ B|',true,'Inklusjon–eksklusjon.'],['A ⊆ A ∪ B',true,'Trivielt.'],
  ['{∅} = ∅',false,'{∅} har ett element.'],['∅ ⊆ A for alle A',true,'Tom mengde er delmengde av alt.'],['∅ ∈ A for alle A',false,'Moteks.: A = {1}.'],['Hvis A ∩ B = A, så er A ⊆ B',true,'Hvert element i A er også i B.']];
add({id:'mengdesant',topic:'mengder',name:'Mengdepåstander: sant/usant',method:false,quick:true,make(){
  const items=C.sample(SETTF,4); return {prompt:`La A, B, C være vilkårlige mengder. Er påstanden sann for <i>alle</i> mengder (Sant), eller finnes et moteksempel (Usant)?`,parts:items.map(([s,v,w])=>F.tf(s,v,w)),steps:[]};
}});

/* ================= RELASJONER & FUNKSJONER ================= */
const relProps=(A,R)=>{ const has=(x,y)=>R.some(([a,b])=>a===x&&b===y); const out={};
  const nr=A.find(x=>!has(x,x)); out.R={v:nr===undefined,why:nr===undefined?'Alle (a,a) er med.':`(${nr},${nr}) ∉ R.`};
  const irr=A.find(x=>has(x,x)); out.I={v:irr===undefined,why:irr===undefined?'Ingen (a,a) er med.':`(${irr},${irr}) ∈ R.`};
  const ns=R.find(([a,b])=>!has(b,a)); out.S={v:!ns,why:!ns?'For hvert (a,b) er (b,a) med.':`(${ns[0]},${ns[1]}) ∈ R men (${ns[1]},${ns[0]}) ∉ R.`};
  const na=R.find(([a,b])=>a!==b&&has(b,a)); out.A={v:!na,why:!na?'Ingen par (a,b),(b,a) med a≠b.':`Både (${na[0]},${na[1]}) og (${na[1]},${na[0]}) er med, men ${na[0]}≠${na[1]}.`};
  let nt=null; for(const [a,b] of R){ for(const [c,d] of R){ if(b===c && !has(a,d)){ nt=[a,b,d]; break; } } if(nt) break; }
  out.T={v:!nt,why:!nt?'Hver gang (a,b),(b,c) er med, er (a,c) med.':`(${nt[0]},${nt[1]}) og (${nt[1]},${nt[2]}) er med, men (${nt[0]},${nt[2]}) ∉ R.`}; return out; };
G.relProps=relProps;
add({id:'relendelig',topic:'relasjoner',name:'Relasjonsegenskaper (endelig)',method:false,quick:true,make(){
  const A=[1,2,3,4]; let R=[]; const typ=C.pick(['rand','po','eq','rand','sym','pred']); let desc='';
  if(typ==='rand'){ for(const x of A) for(const y of A) if(C.chance(0.3)) R.push([x,y]); }
  if(typ==='po'){ const pr=C.pick([['x ≤ y',(x,y)=>x<=y],['x | y (x deler y)',(x,y)=>y%x===0],['x < y',(x,y)=>x<y]]); A.forEach(x=>A.forEach(y=>{ if(pr[1](x,y)) R.push([x,y]); })); }
  if(typ==='eq'){ const cls=A.map(()=>C.ri(0,1)); A.forEach(x=>A.forEach(y=>{ if(cls[x-1]===cls[y-1]) R.push([x,y]); })); if(C.chance(0.4)) R=R.filter(()=>C.chance(0.85)); }
  if(typ==='sym'){ A.forEach(x=>A.forEach(y=>{ if(x<y&&C.chance(0.35)){R.push([x,y]);R.push([y,x]);} })); if(C.chance(0.5)) A.forEach(x=>R.push([x,x])); }
  if(typ==='pred'){ const pr=C.pick([['x + y er partall',(x,y)=>(x+y)%2===0],['x · y er partall',(x,y)=>(x*y)%2===0],['|x − y| ≤ 1',(x,y)=>Math.abs(x-y)<=1],['x + y ≤ 5',(x,y)=>x+y<=5],['y = x + 1',(x,y)=>y===x+1]]); desc=pr[0]; A.forEach(x=>A.forEach(y=>{ if(pr[1](x,y)) R.push([x,y]); })); }
  if(!R.length) R=[[1,2],[2,3],[1,3]];
  R.sort((a,b)=>a[0]-b[0]||a[1]-b[1]); const P=relProps(A,R);
  const keys=C.chance(0.3)? ['R','S','A','T','I']:['R','S','A','T']; const nm={R:'refleksiv',S:'symmetrisk',A:'antisymmetrisk',T:'transitiv',I:'irrefleksiv'};
  return {prompt:`La A = {1, 2, 3, 4} og ${desc?`R = {⟨x, y⟩ ∈ A×A | ${desc}}, altså `:''}R = {${R.map(([a,b])=>`⟨${a},${b}⟩`).join(', ')}}.`,parts:keys.map(k=>F.yn(`Er R ${nm[k]}?`,P[k].v,P[k].why)),
    steps:[S(`Definisjoner: <b>refleksiv</b>: (a,a) ∈ R for alle a. <b>symmetrisk</b>: (a,b) ∈ R ⇒ (b,a) ∈ R. <b>antisymmetrisk</b>: (a,b),(b,a) ∈ R ⇒ a = b. <b>transitiv</b>: (a,b),(b,c) ∈ R ⇒ (a,c) ∈ R. <b>irrefleksiv</b>: ingen (a,a).`,[],`For å svare «nei» holder ett moteksempel. Merk: en relasjon kan være både symmetrisk og antisymmetrisk (f.eks. ∅ eller likhet), og verken.`)]};
}});
const RELINF=[
  {d:'ℕ⁺',r:'x < 2y',R:[1,'x < 2x for x > 0'],S:[0,'⟨1,3⟩ ∈ R, men ⟨3,1⟩ ∉ R (3 ≮ 2)'],A:[0,'⟨2,3⟩ og ⟨3,2⟩ er begge med'],T:[0,'⟨5,3⟩ og ⟨3,2⟩ ∈ R, men 5 ≮ 4']},
  {d:'ℕ',r:'a ≤ b',R:[1,'a ≤ a'],S:[0,'⟨1,2⟩ men ikke ⟨2,1⟩'],A:[1,'a ≤ b og b ≤ a ⇒ a = b'],T:[1,'a ≤ b ≤ c ⇒ a ≤ c']},
  {d:'ℕ',r:'a ≤ b²',R:[1,'a ≤ a² for alle a ∈ ℕ'],S:[0,'⟨1,5⟩ men 5 > 1²'],A:[0,'3 ≤ 2² og 2 ≤ 3²'],T:[0,'7 ≤ 3² og 3 ≤ 2², men 7 > 2²']},
  {d:'ℕ',r:'b = a²',R:[0,'⟨2,2⟩ ∉ R'],S:[0,'⟨2,4⟩ men ikke ⟨4,2⟩'],A:[1,'b = a² og a = b² ⇒ a = b ∈ {0,1}'],T:[0,'⟨2,4⟩,⟨4,16⟩ men 16 ≠ 2²']},
  {d:'ℤ',r:'x − y er delelig med 3',R:[1,'x − x = 0 = 3·0'],S:[1,'3 | x−y ⇒ 3 | y−x'],A:[0,'⟨0,3⟩ og ⟨3,0⟩'],T:[1,'(x−y)+(y−z) = x−z']},
  {d:'ℕ⁺',r:'x | y',R:[1,'x | x'],S:[0,'1 | 2 men 2 ∤ 1'],A:[1,'x | y og y | x ⇒ x = y (positive)'],T:[1,'x | y, y | z ⇒ x | z']},
  {d:'ℤ',r:'x | y',R:[0,'0 ∤ 0 (0 deler ikke 0 med vanlig def.) — men mange lærebøker sier 0|0; uansett: ikke antisymm.'],S:[0,'1 | 2 men 2 ∤ 1'],A:[0,'2 | −2 og −2 | 2, men 2 ≠ −2'],T:[1,'x | y, y | z ⇒ x | z'],skipR:true},
  {d:'ℝ',r:'|x − y| ≤ 1',R:[1,'|x−x| = 0'],S:[1,'|x−y| = |y−x|'],A:[0,'⟨0, 0.5⟩ og ⟨0.5, 0⟩'],T:[0,'⟨0,1⟩,⟨1,2⟩ men |0−2| = 2']},
  {d:'ℤ',r:'xy ≥ 0',R:[1,'x² ≥ 0'],S:[1,'xy = yx'],A:[0,'⟨1,2⟩ og ⟨2,1⟩'],T:[0,'⟨1,0⟩,⟨0,−1⟩ men 1·(−1) < 0']},
  {d:'ℕ',r:'x + y er partall',R:[1,'2x er partall'],S:[1,'x+y = y+x'],A:[0,'⟨1,3⟩ og ⟨3,1⟩'],T:[1,'samme paritet er transitivt']},
  {d:'ℤ',r:'x < y',R:[0,'x ≮ x'],S:[0,'1 < 2 men 2 ≮ 1'],A:[1,'x<y og y<x er umulig, så vakuøst sant'],T:[1,'x<y<z ⇒ x<z']},
  {d:'ℝ',r:'x² = y²',R:[1,'x² = x²'],S:[1,'likhet er symmetrisk'],A:[0,'⟨1,−1⟩ og ⟨−1,1⟩'],T:[1,'x²=y²=z²']}];
add({id:'relinf',topic:'relasjoner',name:'Relasjoner på ℕ, ℤ, ℝ',method:false,quick:true,make(){
  const r=C.pick(RELINF.filter(x=>!x.skipR)); const nm={R:'refleksiv',S:'symmetrisk',A:'antisymmetrisk',T:'transitiv'};
  return {prompt:`La R ⊆ ${r.d} × ${r.d} være relasjonen R = {⟨x, y⟩ | ${r.r}}.`,parts:['R','S','A','T'].map(k=>F.yn(`Er R ${nm[k]}?`,!!r[k][0],r[k][1])),steps:[S(`Uendelig mengde: for «ja» trengs et generelt argument, for «nei» holder ETT konkret moteksempel med tall.`,[],``)]};
}});
const FUNCS=[
  {f:'f(x) = x + 2',d:'ℕ → ℕ',i:[1,'x+2 = y+2 ⇒ x = y'],s:[0,'0 og 1 treffes ikke']},
  {f:'f(x) = x + 2',d:'ℤ → ℤ',i:[1,'kan trekke fra 2'],s:[1,'y = f(y−2)']},
  {f:'f(x) = ⌊x/2⌋',d:'ℕ → ℕ',i:[0,'f(0) = f(1) = 0'],s:[1,'y = f(2y)']},
  {f:'f(x) = x²',d:'ℤ → ℤ',i:[0,'f(−1) = f(1)'],s:[0,'2 treffes ikke']},
  {f:'f(x) = x²',d:'ℕ → ℕ',i:[1,'x² = y² med x,y ≥ 0 ⇒ x = y'],s:[0,'3 er ikke et kvadrat']},
  {f:'f(x) = 2x + 1',d:'ℤ → ℤ',i:[1,'lineær med stigning ≠ 0'],s:[0,'partall treffes ikke']},
  {f:'f(x) = 2x + 1',d:'ℝ → ℝ',i:[1,'strengt voksende'],s:[1,'y = f((y−1)/2)']},
  {f:'f(x) = x³ − x',d:'ℝ → ℝ',i:[0,'f(0) = f(1) = 0'],s:[1,'kontinuerlig, går mot ±∞']},
  {f:'f(x) = eˣ',d:'ℝ → ℝ',i:[1,'strengt voksende'],s:[0,'negative tall treffes ikke']},
  {f:'f(x) = |x|',d:'ℤ → ℕ',i:[0,'f(−1) = f(1)'],s:[1,'n = f(n)']},
  {f:'f(n) = n/2 hvis n partall, (n−1)/2 hvis n odde',d:'ℕ → ℕ',i:[0,'f(2) = f(3) = 1'],s:[1,'y = f(2y)']},
  {f:'f(n) = n + 1 hvis n partall, n − 1 hvis n odde',d:'ℕ → ℕ',i:[1,'den bytter 0↔1, 2↔3, …'],s:[1,'bijeksjon (sin egen invers)']},
  {f:'φ(n) (Eulers phi)',d:'ℕ⁺ → ℕ⁺',i:[0,'φ(35) = φ(45) = 24'],s:[0,'φ(n) = 3 har ingen løsning (H24)']},
  {f:'f(x) = x mod 5',d:'ℤ → {0,1,2,3,4}',i:[0,'f(0) = f(5)'],s:[1,'f(r) = r']}];
add({id:'funk',topic:'relasjoner',name:'Injektiv / surjektiv?',method:false,quick:true,make(){
  const items=C.sample(FUNCS,2); const parts=[]; items.forEach(o=>{ parts.push(F.yn(`${o.f}, ${o.d}: injektiv?`,!!o.i[0],o.i[1])); parts.push(F.yn(`${o.f}, ${o.d}: surjektiv?`,!!o.s[0],o.s[1])); });
  return {prompt:`Avgjør for hver funksjon om den er injektiv og/eller surjektiv. Merk at svaret avhenger av definisjons- og verdimengden!`,parts,steps:[S(`<b>Injektiv</b>: f(x) = f(y) ⇒ x = y (ingen to treffer samme). <b>Surjektiv</b>: hver y i verdimengden treffes. <b>Bijektiv</b>: begge.`,[],`Moteksempler er alltid nok for «nei».`)]};
}});

/* ================= UTSAGNSLOGIKK ================= */
const L=C.L, P=L.V('p'), Q=L.V('q'), Rv=L.V('r');
const TAUT=[()=>L.I(L.A(P,Q),P),()=>L.I(P,L.I(Q,P)),()=>L.O(L.I(P,Q),L.I(Q,P)),()=>L.I(L.A(L.I(P,Q),P),Q),()=>L.E(L.N(L.A(P,Q)),L.O(L.N(P),L.N(Q))),()=>L.A(L.I(L.A(P,Q),P),L.I(P,L.O(P,Q))),()=>L.O(L.I(P,Q),L.O(P,Q)),()=>L.I(L.A(L.I(P,Q),L.I(Q,Rv)),L.I(P,Rv)),()=>L.O(L.A(P,Q),L.O(L.N(P),L.N(Q))),()=>L.I(L.N(Q),L.I(Q,P)),()=>L.E(L.I(P,Q),L.I(L.N(Q),L.N(P)))];
const KONTRA=[()=>L.A(L.O(P,Q),L.A(L.N(P),L.N(Q))),()=>L.A(L.A(P,Q),L.A(Rv,L.N(P))),()=>L.A(L.E(P,Q),L.E(P,L.N(Q))),()=>L.N(L.I(P,L.I(Q,P))),()=>L.A(L.I(P,Q),L.A(P,L.N(Q))),()=>L.O(L.A(P,L.N(P)),L.A(Q,L.N(Q))),()=>L.A(L.N(L.O(P,L.N(Q))),L.O(P,L.N(Q)))];
const INGEN=[()=>L.O(L.A(P,Q),L.A(L.N(P),L.N(Q))),()=>L.A(P,L.O(L.N(P),Q)),()=>L.O(L.A(P,L.N(Q)),L.A(L.N(P),Q)),()=>L.O(P,L.A(Rv,L.I(Rv,Q))),()=>L.I(L.I(P,Q),L.I(P,Rv)),()=>L.N(L.I(L.I(P,Q),L.I(Q,P)))];
const CLS={taut:'Tautologi',kontra:'Kontradiksjon (motsigelse)',ingen:'Ingen av delene'};
G.genFormula=(want)=>{ const bank=want==='taut'?TAUT:want==='kontra'?KONTRA:INGEN; if(C.chance(0.45)) return C.pick(bank)();
  for(let i=0;i<800;i++){ const vars=C.chance(0.6)?['p','q']:['p','q','r']; const f=C.randFormula(vars,C.ri(2,3)); const s=C.fstr(f); if(s.length<9||s.length>34) continue; if(C.fvars(f).length<2||C.silly(f)) continue; if(C.fclass(f)===want) return f; }
  return C.pick(bank)(); };
const ttHTML=(f)=>{ const vs=C.fvars(f); const subs=C.subformulas(f); return `<div class="tblwrap"><table class="tt"><tr>${vs.map(v=>`<th>${v}</th>`).join('')}${subs.map(s=>`<th>${C.fstr(s)}</th>`).join('')}</tr>${C.rows(vs).map(e=>`<tr>${vs.map(v=>`<td>${e[v]?'T':'F'}</td>`).join('')}${subs.map(s=>`<td class="${C.feval(s,e)?'t':'f'}">${C.feval(s,e)?'T':'F'}</td>`).join('')}</tr>`).join('')}</table></div>`; };
G.ttHTML=ttHTML;
const clsWhy=(f)=>{ const c=C.fclass(f); const vs=C.fvars(f); const rows=C.rows(vs); const fr=rows.find(e=>!C.feval(f,e)), tr=rows.find(e=>C.feval(f,e)); const show=e=>vs.map(v=>`${v}=${e[v]?'T':'F'}`).join(', ');
  return c==='taut'?'Sann i alle rader ⇒ tautologi.':c==='kontra'?'Usann i alle rader ⇒ kontradiksjon.':`Sann for ${show(tr)}, usann for ${show(fr)} ⇒ ingen av delene.`; };
add({id:'klassifiser',topic:'logikk',name:'Tautologi, motsigelse eller ingen?',method:true,quick:true,make(){
  const want=C.pick(['taut','taut','kontra','ingen','ingen']); const f=G.genFormula(want); const c=C.fclass(f);
  return {prompt:`Er formelen <span class="fx">${C.fstr(f)}</span> en tautologi, en kontradiksjon eller ingen av delene?`,
    parts:[F.mc('Klassifisering',[CLS.taut,CLS.kontra,CLS.ingen],['taut','kontra','ingen'].indexOf(c),clsWhy(f)+ttHTML(f))],
    steps:[S(`Fyll ut sannhetsverditabellen for hele formelen (klikk i cellene for å veksle T/F). Hjelpekolonnene kan du vise hvis du står fast.`,[{kind:'tt',f,label:'tabell'}],ttHTML(f)),
      S(`Les av siste kolonne: bare T ⇒ tautologi, bare F ⇒ kontradiksjon, blandet ⇒ ingen av delene.`,[F.mc('Klassifisering',[CLS.taut,CLS.kontra,CLS.ingen],['taut','kontra','ingen'].indexOf(c))],clsWhy(f),'Raskere alternativ: prøv å finne én rad som gjør den usann (da er den ikke tautologi) og én som gjør den sann.')]};
}});
add({id:'ekvivalens',topic:'logikk',name:'Ekvivalens og logisk konsekvens',method:true,quick:true,make(){
  const pairs=[[L.I(L.A(P,Q),Rv),L.O(L.I(P,Rv),L.I(Q,Rv))],[L.I(P,L.N(Q)),L.I(Q,L.N(P))],[L.O(P,Q),L.A(Q,P)],[L.I(L.A(P,Q),Rv),L.I(P,Q)],[L.I(P,Q),L.I(Q,P)],[L.N(L.I(P,Q)),L.A(P,L.N(Q))],[L.I(P,Q),L.I(L.N(P),L.N(Q))],[L.N(L.A(P,Q)),L.A(L.N(P),L.N(Q))],[L.I(L.O(P,Q),Rv),L.A(L.I(P,Rv),L.I(Q,Rv))],[L.E(P,Q),L.A(L.I(P,Q),L.I(Q,P))],[L.A(P,Q),L.O(P,Q)],[L.I(P,L.I(Q,Rv)),L.I(L.I(P,Q),Rv)]];
  const [f,g]=C.shuffle(C.pick(pairs)); const vs=[...new Set(C.fvars(f).concat(C.fvars(g)))].sort(); const rows=C.rows(vs);
  const fg=rows.every(e=>!C.feval(f,e)||C.feval(g,e)), gf=rows.every(e=>!C.feval(g,e)||C.feval(f,e));
  const tbl=`<div class="tblwrap"><table class="tt"><tr>${vs.map(v=>`<th>${v}</th>`).join('')}<th>A</th><th>B</th></tr>${rows.map(e=>`<tr>${vs.map(v=>`<td>${e[v]?'T':'F'}</td>`).join('')}<td class="${C.feval(f,e)?'t':'f'}">${C.feval(f,e)?'T':'F'}</td><td class="${C.feval(g,e)?'t':'f'}">${C.feval(g,e)?'T':'F'}</td></tr>`).join('')}</table></div>`;
  const bad=(x,y)=>{ const e=rows.find(e=>C.feval(x,e)&&!C.feval(y,e)); return e? vs.map(v=>`${v}=${e[v]?'T':'F'}`).join(', '):''; };
  return {prompt:`La A = <span class="fx">${C.fstr(f)}</span> og B = <span class="fx">${C.fstr(g)}</span>.`,
    parts:[F.yn('Er B en logisk konsekvens av A (A ⊨ B)?',fg,fg?'I alle rader der A er sann, er B sann.':`Moteksempel: ${bad(f,g)} gir A sann, B usann.`),F.yn('Er A en logisk konsekvens av B?',gf,gf?'I alle rader der B er sann, er A sann.':`Moteksempel: ${bad(g,f)}.`),F.yn('Er A og B logisk ekvivalente?',fg&&gf,(fg&&gf)?'Samme sannhetsverdi i alle rader.':'Ulike i minst én rad.'+tbl)],
    steps:[S(`Lag en felles sannhetsverditabell for A og B.`,[],tbl),S(`A ⊨ B betyr: ingen rad med A = T og B = F. Ekvivalens = konsekvens begge veier.`,[F.yn('A ⊨ B?',fg),F.yn('B ⊨ A?',gf)],`A ⊨ B: ${fg?'ja':'nei'}, B ⊨ A: ${gf?'ja':'nei'}.`)]};
}});
add({id:'falsifiser',topic:'logikk',name:'Når er formelen usann?',method:false,quick:true,make(){
  let f; for(let i=0;i<2000;i++){ const g=C.chance(0.5)? L.I(C.randFormula(['a','b','c'],2),C.randFormula(['a','b','c'],1)) : C.randFormula(['a','b','c'],3); if(C.fvars(g).length<3||C.silly(g)) continue; if(C.rows(['a','b','c']).filter(e=>!C.feval(g,e)).length===1){ f=g; break;} }
  if(!f) f=L.I(L.I(L.V('a'),L.V('b')),L.I(L.V('a'),L.V('c')));
  const e=C.rows(['a','b','c']).find(e=>!C.feval(f,e));
  return {prompt:`Formelen <span class="fx">${C.fstr(f)}</span> er usann for nøyaktig én tilordning. Hvilke sannhetsverdier må a, b og c ha?`,
    parts:['a','b','c'].map(v=>F.mc(`Sannhetsverdi for ${v}`,['Sann','Usann'],e[v]?0:1,`Den eneste raden som gjør formelen usann: a=${e.a?'T':'F'}, b=${e.b?'T':'F'}, c=${e.c?'T':'F'}.`)),steps:[S(`En implikasjon X → Y er usann bare når X er sann og Y er usann. Jobb deg «innover».`,[],`Svar: a=${e.a?'T':'F'}, b=${e.b?'T':'F'}, c=${e.c?'T':'F'}.`+ttHTML(f))]};
}});
const LAWS=[
  [L.N(L.I(P,Q)),[L.A(P,L.N(Q))],[L.I(L.N(P),L.N(Q)),L.A(L.N(P),Q),L.I(Q,P),L.O(L.N(P),L.N(Q))]],
  [L.I(P,Q),[L.O(L.N(P),Q),L.I(L.N(Q),L.N(P))],[L.I(Q,P),L.I(L.N(P),L.N(Q)),L.A(L.N(P),Q),L.O(P,L.N(Q))]],
  [L.N(L.A(P,Q)),[L.O(L.N(P),L.N(Q))],[L.A(L.N(P),L.N(Q)),L.O(P,Q),L.N(L.O(P,Q))]],
  [L.N(L.O(P,Q)),[L.A(L.N(P),L.N(Q))],[L.O(L.N(P),L.N(Q)),L.A(P,Q),L.I(P,L.N(Q))]],
  [L.I(P,L.I(Q,Rv)),[L.I(L.A(P,Q),Rv)],[L.I(L.I(P,Q),Rv),L.A(L.I(P,Q),Rv),L.I(L.O(P,Q),Rv)]],
  [L.A(L.I(P,Rv),L.I(Q,Rv)),[L.I(L.O(P,Q),Rv)],[L.I(L.A(P,Q),Rv),L.O(L.I(P,Rv),Q),L.I(P,L.A(Q,Rv))]],
  [L.E(P,Q),[L.A(L.I(P,Q),L.I(Q,P)),L.O(L.A(P,Q),L.A(L.N(P),L.N(Q)))],[L.O(L.I(P,Q),L.I(Q,P)),L.A(P,Q),L.O(L.A(P,L.N(Q)),L.A(L.N(P),Q))]],
  [L.A(P,L.O(P,Q)),[P],[Q,L.A(P,Q),L.O(P,Q)]],
  [L.N(L.E(P,Q)),[L.O(L.A(P,L.N(Q)),L.A(L.N(P),Q)),L.E(P,L.N(Q))],[L.E(L.N(P),L.N(Q)),L.A(L.N(P),L.N(Q)),L.O(P,Q)]]];
G.LAWS=LAWS;
add({id:'lover',topic:'logikk',name:'Logiske lover (ekvivalente uttrykk)',method:false,quick:true,make(){
  const [f,good,bad]=C.pick(LAWS); const g=C.pick(good); const opts=C.shuffle([g].concat(C.sample(bad,3))); const ans=opts.indexOf(g);
  return {prompt:`Hvilket uttrykk er logisk ekvivalent med <span class="fx">${C.fstr(f)}</span>?`,parts:[F.mc('Velg',opts.map(o=>C.fstr(o)),ans,`Riktig: ${C.fstr(g)}. Huskeregler: p→q ≡ ¬p∨q ≡ ¬q→¬p; ¬(p→q) ≡ p∧¬q; De Morgan: ¬(p∧q) ≡ ¬p∨¬q, ¬(p∨q) ≡ ¬p∧¬q; p→(q→r) ≡ (p∧q)→r; (p→r)∧(q→r) ≡ (p∨q)→r.`)],steps:[]};
}});

/* ================= PREDIKATLOGIKK ================= */
const PREDS=[['x < y',(x,y)=>x<y],['x ≤ y',(x,y)=>x<=y],['x | y',(x,y)=>y%x===0],['x + y er partall',(x,y)=>(x+y)%2===0],['x + y ≤ 5',(x,y)=>x+y<=5],['x · y er partall',(x,y)=>(x*y)%2===0],['x ≠ y',(x,y)=>x!==y],['y = x + 1',(x,y)=>y===x+1],['x + y = 5',(x,y)=>x+y===5],['y ≤ x',(x,y)=>y<=x]];
const FORMS=[['∀x∃y',(D,p)=>D.every(x=>D.some(y=>p(x,y))),(D,p)=>{ const x=D.find(x=>!D.some(y=>p(x,y))); return x!==undefined?`x = ${x} har ingen y.`:`For hver x finnes y: ${D.map(x=>`${x}→${D.find(y=>p(x,y))}`).join(', ')}.`;}],
  ['∃x∀y',(D,p)=>D.some(x=>D.every(y=>p(x,y))),(D,p)=>{ const x=D.find(x=>D.every(y=>p(x,y))); return x!==undefined?`x = ${x} fungerer for alle y.`:'Ingen x fungerer for alle y.';}],
  ['∀y∃x',(D,p)=>D.every(y=>D.some(x=>p(x,y))),(D,p)=>{ const y=D.find(y=>!D.some(x=>p(x,y))); return y!==undefined?`y = ${y} har ingen x.`:'Hver y har en x.';}],
  ['∃y∀x',(D,p)=>D.some(y=>D.every(x=>p(x,y))),(D,p)=>{ const y=D.find(y=>D.every(x=>p(x,y))); return y!==undefined?`y = ${y} fungerer for alle x.`:'Ingen y fungerer for alle x.';}],
  ['∀x∀y',(D,p)=>D.every(x=>D.every(y=>p(x,y))),(D,p)=>{ for(const x of D) for(const y of D) if(!p(x,y)) return `Moteks.: x=${x}, y=${y}.`; return 'Sant for alle par.';}],
  ['∃x∃y',(D,p)=>D.some(x=>D.some(y=>p(x,y))),(D,p)=>{ for(const x of D) for(const y of D) if(p(x,y)) return `x=${x}, y=${y}.`; return 'Ingen par.';}]];
add({id:'predendelig',topic:'predikat',name:'Kvantorer over endelig univers',method:false,quick:true,make(){
  const D=C.chance(0.5)?[1,2,3,4]:[0,1,2,3]; const [ps,p]=C.pick(PREDS.filter(([s])=>!(D[0]===0&&s==='x | y'))); const fs=C.sample(FORMS,4);
  return {prompt:`Univers U = {${D.join(', ')}}. La P(x, y) bety «${ps}». Avgjør sannhetsverdien.`,parts:fs.map(([q,ev,why])=>F.tf(`${q} P(x, y)`,ev(D,p),why(D,p))),
    steps:[S(`Les kvantorene fra venstre: ∀x∃y = «for hver x kan jeg velge en y (som får avhenge av x)». ∃x∀y = «én fast x som fungerer for alle y». ∃x∀y ⇒ ∀y∃x, men ikke omvendt.`,[],``)]};
}});
const PREDINF=[
  ['ℝ \\ {0}','∀x∃y (x = y²)',0,'x < 0 har ingen kvadratrot (K26).'],['ℝ \\ {0}','∀x∃y (xy = 1)',1,'y = 1/x (K26).'],['ℝ \\ {0}','∀x∃y (x + y = 1)',0,'x = 1 krever y = 0 ∉ U (K26).'],['ℝ \\ {0}','∀x∀y∃z (xy = z)',1,'z = xy ≠ 0 (K26).'],['ℝ \\ {0}','∃x∀y∀z (xy = z)',0,'y=z=1 krever x=1, y=1,z=2 krever x=2 (K26).'],
  ['ℕ','∀x∃y (x < y)',1,'y = x + 1.'],['ℕ','∃x∀y (x ≤ y)',1,'x = 0 er minst.'],['ℕ','∃x∀y (y ≤ x)',0,'Det finnes ikke noe største naturlig tall.'],['ℕ','∀y∃x (x < y)',0,'y = 0 har ingen x < 0 i ℕ.'],['ℤ','∀y∃x (x < y)',1,'x = y − 1.'],['ℤ','∃x∀y (x ≤ y)',0,'ℤ har ikke noe minste element.'],
  ['ℕ','∀x (P(x) → P(x+3)), P(x) = «x er partall»',0,'x = 0: 0 partall, 3 odde.'],['ℕ','∀x (P(x) → P(x²)), P = partall',1,'(2k)² = 4k² partall.'],['ℕ','∃x∀y P(x+y), P = partall',0,'For fast x varierer pariteten til x+y.'],['ℕ','∀x∃y P(x+y), P = partall',1,'Velg y = x.'],
  ['ℤ','∀x∃y (x + y = 0)',1,'y = −x.'],['ℕ','∀x∃y (x + y = 0)',0,'x = 1: ingen y ∈ ℕ.'],['ℝ','∃x∀y (xy = y)',1,'x = 1.'],['ℝ','∀x∃y (y² = x)',0,'x = −1.'],['ℤ','∀x∀y∃z (z = (x+y)/2)',0,'x=0, y=1 gir 1/2 ∉ ℤ.']];
add({id:'predinf',topic:'predikat',name:'Kvantorer over ℕ, ℤ, ℝ',method:false,quick:true,make(){
  const items=C.sample(PREDINF,4); return {prompt:`Avgjør om utsagnene er sanne i det oppgitte universet.`,parts:items.map(([U,s,v,w])=>F.tf(`U = ${U}: ${s}`,!!v,w)),steps:[S(`For ∀∃: finn en oppskrift for y gitt x (eller ett moteksempel-x). For ∃∀: finn én x som virker for alle, eller vis at enhver x feiler.`,[],``)]};
}});
const NEG=[['∀x∃y P(x,y)','∃x∀y ¬P(x,y)',['∃x∀y P(x,y)','∀x∃y ¬P(x,y)','∃x∃y ¬P(x,y)']],['∃x∀y P(x,y)','∀x∃y ¬P(x,y)',['∀x∀y ¬P(x,y)','∃x∀y ¬P(x,y)','∀x∃y P(x,y)']],
  ['∀x (P(x) → Q(x))','∃x (P(x) ∧ ¬Q(x))',['∃x (P(x) → ¬Q(x))','∀x (P(x) ∧ ¬Q(x))','∃x (¬P(x) ∧ Q(x))']],['∃x (P(x) ∧ Q(x))','∀x (¬P(x) ∨ ¬Q(x))',['∀x (¬P(x) ∧ ¬Q(x))','∃x (¬P(x) ∨ ¬Q(x))','∀x (P(x) → Q(x))']],
  ['∀x (P(x) → ∃y Q(x,y))','∃x (P(x) ∧ ∀y ¬Q(x,y))',['∃x (P(x) → ∀y ¬Q(x,y))','∀x (P(x) ∧ ∃y ¬Q(x,y))','∃x (¬P(x) ∧ ∀y Q(x,y))']],['∀y∃x (x, y) ∈ R','∃y∀x (x, y) ∉ R',['∃y∃x (x, y) ∉ R','∀y∀x (x, y) ∉ R','∃x∀y (x, y) ∉ R']],
  ['∀ε∃δ∀x (|x| < δ → |f(x)| < ε)','∃ε∀δ∃x (|x| < δ ∧ |f(x)| ≥ ε)',['∃ε∀δ∃x (|x| ≥ δ ∧ |f(x)| ≥ ε)','∃ε∀δ∀x (|x| < δ → |f(x)| ≥ ε)','∀ε∃δ∃x (|x| < δ ∧ |f(x)| ≥ ε)']]];
add({id:'prednegasjon',topic:'predikat',name:'Negasjon av kvantifiserte utsagn',method:false,quick:true,make(){
  const [f,g,bad]=C.pick(NEG); const opts=C.shuffle([g].concat(bad)); return {prompt:`Hva er negasjonen ¬(${f}), skrevet uten ¬ foran kvantorene?`,parts:[F.mc('Velg',opts,opts.indexOf(g),`¬∀x φ ≡ ∃x ¬φ og ¬∃x φ ≡ ∀x ¬φ. Snu hver kvantor og skyv ¬ innover. ¬(A → B) ≡ A ∧ ¬B. Svar: ${g}.`)],steps:[]};
}});
const TRANS=[['Det finnes et minste naturlig tall (P(x,y): x ≤ y)','∃x∀y P(x,y)',['∀x∃y P(x,y)','∃y∀x P(x,y)','∀y∃x P(x,y)']],['Det finnes et største tall (P(x,y): x ≤ y)','∃y∀x P(x,y)',['∃x∀y P(x,y)','∀x∃y P(x,y)','∀y∃x P(x,y)']],
  ['Alle har noen de liker (L(x,y): x liker y)','∀x∃y L(x,y)',['∃y∀x L(x,y)','∀y∃x L(x,y)','∃x∀y L(x,y)']],['Det finnes noen som alle liker','∃y∀x L(x,y)',['∀x∃y L(x,y)','∃x∀y L(x,y)','∀y∃x L(x,y)']],
  ['Ingen liker alle','¬∃x∀y L(x,y)',['∀x¬∀y¬L(x,y)','¬∀x∃y L(x,y)','∃x¬∀y L(x,y)']],['Hver student har tatt minst ett kurs (T(s,k))','∀s∃k T(s,k)',['∃k∀s T(s,k)','∃s∀k T(s,k)','∀k∃s T(s,k)']],
  ['Det finnes en person som fødte alle (R(x,y): x født av y)','∃y∀x R(x,y)',['∀x∃y R(x,y)','∃x∀y R(x,y)','∀y∃x R(x,y)']]];
add({id:'predoversett',topic:'predikat',name:'Fra norsk til predikatlogikk',method:false,quick:true,make(){
  const [s,g,bad]=C.pick(TRANS); const opts=C.shuffle([g].concat(bad)); return {prompt:`Formaliser: «${s}».`,parts:[F.mc('Velg',opts,opts.indexOf(g),`${g}. Rekkefølgen på kvantorene er avgjørende: ∃y∀x = én y for alle x.`)],steps:[]};
}});

})(typeof window!=='undefined'? window : globalThis);
