/* kurs.js — kort innføring per emne: idé, må-kunne, løst eksempel, feller */
(function(G){
'use strict';
const b=(n,k)=>`<span class="binom"><span>${n}</span><span>${k}</span></span>`;
G.KURS=[
{id:'mengder',t:'Mengder',min:4,
 idea:'En mengde er en samling elementer uten rekkefølge og uten duplikater. {1, 2, 2} = {2, 1}. Nesten alle eksamener starter med en oppvarming her.',
 must:[
  ['A ∪ B (union)','alt som er i A <i>eller</i> B'],
  ['A ∩ B (snitt)','det som er i <i>både</i> A og B'],
  ['A \\ B (differanse)','i A, men ikke i B'],
  ['(A \\ B) ∪ (B \\ A)','symmetrisk differanse: i nøyaktig én av dem'],
  ['A × B (kartesisk produkt)','alle par (a, b). |A × B| = |A| · |B|'],
  ['P(A) (potensmengden)','mengden av <i>alle delmengder</i> av A, også ∅ og A selv. |P(A)| = 2<sup>|A|</sup>'],
  ['⊆ og ∈','X ⊆ A: X er en delmengde. x ∈ A: x er et element. {1} ⊆ {1,2}, men 1 ∈ {1,2}.']],
 ex:{q:'A = {1, 5, 7, 8}, B = {1, 2, 5}. Finn A ∩ B, (A ∩ B) × B og P(A ∩ B). (Kont 2025)',
  s:['A ∩ B = {1, 5} (tallene som står i begge).','(A ∩ B) × B = alle par (x, y) med x ∈ {1,5}, y ∈ {1,2,5}: {(1,1), (1,2), (1,5), (5,1), (5,2), (5,5)} — 2·3 = 6 par.','P(A ∩ B) = {∅, {1}, {5}, {1, 5}} — 2² = 4 delmengder.']},
 traps:['∅ ≠ {∅}. Den første har 0 elementer, den andre 1.','P(A) ∪ P(B) er <i>ikke</i> lik P(A ∪ B) (tenk {1,2}).','Rekkefølgen teller i par: (1,2) ≠ (2,1).']},

{id:'telling',t:'Kombinatorikk / telling',min:7,
 idea:'Spørsmålet er alltid «hvor mange?». Tell i trinn og gang sammen (multiplikasjonsregelen), del opp i tilfeller og legg sammen (addisjonsregelen), eller tell det motsatte og trekk fra (komplement).',
 must:[
  ['Velg k av n: de fire modellene','<table class="mini"><tr><th></th><th>uten tilbakelegging</th><th>med tilbakelegging</th></tr><tr><th>ordnet</th><td>n!/(n−k)!</td><td>n<sup>k</sup></td></tr><tr><th>uordnet</th><td>'+b('n','k')+' = n!/(k!(n−k)!)</td><td>'+b('n+k−1','k')+'</td></tr></table>'],
  ['Funksjoner A → B','|B|<sup>|A|</sup>. Injektive: |B|·(|B|−1)⋯ (|A| faktorer). Bijeksjoner når |A|=|B|=n: n!'],
  ['Surjektive A → B (|A|=m, |B|=n)','n<sup>m</sup> − '+b('n','1')+'(n−1)<sup>m</sup> + '+b('n','2')+'(n−2)<sup>m</sup> − ⋯'],
  ['Relasjoner på A (|A| = n)','2<sup>n²</sup> (hver av de n² parene er med eller ikke)'],
  ['x₁ + ⋯ + x<sub>k</sub> = n, x<sub>i</sub> ≥ 0','«n kuler i k bokser»: '+b('n+k−1','k−1')+'. Krav x<sub>i</sub> ≥ 1? Legg én kule i hver boks først.'],
  ['Anagrammer','n! / (k₁! k₂! ⋯) der k-ene er hvor mange ganger hver bokstav gjentas'],
  ['Inklusjon–eksklusjon','|A ∪ B| = |A| + |B| − |A ∩ B|. Tre mengder: + alle enkle − alle par + trippel.']],
 ex:{q:'Passord på 6 tegn av 29 bokstaver og 10 sifre. Første tegn bokstav, minst ett siffer. (H25)',
  s:['«Minst ett» → tell alle og trekk fra de som har <i>ingen</i>.','Første tegn bokstav, resten fritt: 29 · 39<sup>5</sup>.','Uten noen siffer (bare bokstaver): 29<sup>6</sup>.','Svar: 29 · 39<sup>5</sup> − 29<sup>6</sup> = 2 021 678 450.']},
 traps:['Teller rekkefølgen? Spør deg selv før du velger formel.','Surjektive er den vanligste feilen: alle minus de som «bommer» på minst ett element.','I svarfeltet kan du skrive uttrykket direkte: 29*39^5-29^6.']},

{id:'relasjoner',t:'Relasjoner og funksjoner',min:6,
 idea:'En relasjon R på A er bare en mengde par (a, b). Du sjekker fire egenskaper. For «ja» trenger du et generelt argument, for «nei» holder ett moteksempel.',
 must:[
  ['Refleksiv','(a, a) ∈ R for <i>alle</i> a'],
  ['Symmetrisk','(a, b) ∈ R ⇒ (b, a) ∈ R'],
  ['Antisymmetrisk','(a, b) og (b, a) begge i R ⇒ a = b'],
  ['Transitiv','(a, b) og (b, c) i R ⇒ (a, c) i R'],
  ['Ekvivalensrelasjon / partiell ordning','R + S + T / R + A + T'],
  ['Funksjon','hvert a har nøyaktig én b med (a, b) ∈ R'],
  ['Injektiv / surjektiv / bijektiv','ingen to inn gir samme ut / alt i verdimengden treffes / begge']],
 ex:{q:'R = {(x, y) | x &lt; 2y} på ℕ⁺. Refleksiv? Symmetrisk? Antisymmetrisk? Transitiv? (H25)',
  s:['Refleksiv: x &lt; 2x for alle positive x → <b>ja</b>.','Symmetrisk: (1, 3): 1 &lt; 6, men (3, 1): 3 &lt; 2 er usant → <b>nei</b>.','Antisymmetrisk: (2, 3) og (3, 2) er begge med, men 2 ≠ 3 → <b>nei</b>.','Transitiv: (5, 3) og (3, 2) er med, men 5 &lt; 4 er usant → <b>nei</b>.']},
 traps:['Symmetrisk og antisymmetrisk utelukker ikke hverandre. Likhet x = y er begge deler.','Svaret om injektiv/surjektiv avhenger av definisjons- og verdimengden: x² er injektiv på ℕ, men ikke på ℤ.']},

{id:'logikk',t:'Utsagnslogikk',min:6,
 idea:'Formler bygd av p, q, r med ¬, ∧, ∨, →, ↔. Du lager sannhetsverditabell og leser av. Med n variabler blir det 2<sup>n</sup> rader.',
 must:[
  ['p → q','usann <b>bare</b> når p = T og q = F. Ellers sann.'],
  ['p ↔ q','sann når p og q er like'],
  ['Tautologi / kontradiksjon','alltid sann / alltid usann. Ellers «ingen av delene».'],
  ['Viktige ekvivalenser','p → q ≡ ¬p ∨ q ≡ ¬q → ¬p &nbsp;·&nbsp; ¬(p → q) ≡ p ∧ ¬q'],
  ['De Morgan','¬(p ∧ q) ≡ ¬p ∨ ¬q, &nbsp; ¬(p ∨ q) ≡ ¬p ∧ ¬q'],
  ['Logisk konsekvens A ⊨ B','i hver rad der A er sann, er også B sann']],
 ex:{q:'Er (p ∧ q) → p en tautologi?',
  s:['Implikasjonen kan bare være usann hvis venstresiden er sann og høyresiden usann.','Venstresiden p ∧ q sann ⇒ p er sann ⇒ høyresiden er sann.','Altså kan den aldri bli usann → <b>tautologi</b>.']},
 traps:['F → hva som helst er SANN. Det er den vanligste feilen i tabellen.','Sett opp radene i fast rekkefølge (FF, FT, TF, TT) så du ikke glemmer noen.']},

{id:'predikat',t:'Predikatlogikk',min:5,
 idea:'Kvantorer: ∀x («for alle x») og ∃x («det finnes en x»). Les dem fra venstre mot høyre. Rekkefølgen er avgjørende.',
 must:[
  ['∀x∃y P(x, y)','for hver x kan du velge en y, og y kan avhenge av x'],
  ['∃y∀x P(x, y)','<b>én</b> fast y som fungerer for alle x (sterkere påstand)'],
  ['Negasjon','¬∀x P ≡ ∃x ¬P og ¬∃x P ≡ ∀x ¬P. Snu hver kvantor og skyv ¬ innover.'],
  ['¬∀x (P → Q)','≡ ∃x (P ∧ ¬Q)'],
  ['Bevise/motbevise','∀: generelt argument, eller ett moteksempel for «usant». ∃: vis ett eksempel.']],
 ex:{q:'Univers ℝ \\ {0}. Er ∀x∃y (xy = 1) sant? Er ∀x∃y (x + y = 1) sant? (K26)',
  s:['xy = 1: gitt x, velg y = 1/x. Det finnes siden x ≠ 0 → <b>sant</b>.','x + y = 1: x = 1 krever y = 0, men 0 er ikke i universet → <b>usant</b>.']},
 traps:['Rekkefølgen betyr alt. I ℕ er ∀x∃y (x &lt; y) sant (velg y = x + 1), mens ∀y∃x (x &lt; y) er usant, fordi y = 0 ikke har noen mindre x.','Universet betyr også mye: samme utsagn kan være sant i ℤ og usant i ℕ.']},

{id:'induksjon',t:'Induksjon og rekursjon',min:7,
 idea:'Du viser at påstanden holder for start-tallet, og at den alltid «arver» seg fra k til k + 1. Da holder den for alle n. Eksamen har nesten alltid ett induksjonsbevis.',
 must:[
  ['Vanlig induksjon (mal)','<b>1. Basis:</b> vis P(n₀). <b>2. IH:</b> «Anta P(k) for en vilkårlig k ≥ n₀.» <b>3. Steg:</b> vis P(k+1) og bruk IH underveis. <b>4. Konklusjon:</b> «Ved induksjon holder P(n) for alle n ≥ n₀.»'],
  ['Sterk induksjon','IH: anta P(i) for <i>alle</i> i ≤ k. Brukes når a<sub>n</sub> avhenger av flere tidligere ledd. Ha like mange basistilfeller som rekursjonen bruker (ofte 2).'],
  ['Sum-triks','Σ<sub>i=1</sub><sup>k+1</sup> = Σ<sub>i=1</sub><sup>k</sup> + (ledd nr. k+1). Bytt den første summen med IH.'],
  ['Delelighet-triks','Skriv uttrykket for k+1 som (uttrykket for k) + noe som åpenbart er delelig.'],
  ['Rekursjon','Regn ut leddene direkte fra regelen, f.eks. a<sub>n</sub> = a<sub>n−1</sub> + a<sub>n−2</sub>.']],
 ex:{q:'Vis at 1 + 3 + ⋯ + (2n − 1) = n². (K26)',
  s:['Basis n = 1: venstre side 1, høyre side 1² = 1 ✓','IH: anta 1 + 3 + ⋯ + (2k − 1) = k².','Steg: 1 + ⋯ + (2k − 1) + (2k + 1) = k² + 2k + 1 = (k + 1)² ✓','Konklusjon: holder for alle n ≥ 1.']},
 traps:['Ikke anta det du skal vise («anta for alle n»).','Skriv ut hvor du bruker IH, det gir poeng.','Ved ulikheter: bruk IH, og vis deretter den lille ekstra ulikheten (f.eks. 44/16 &lt; 49/16 i H25).']},

{id:'tallteori',t:'Euklid, invers og diofantiske likninger',min:8,
 idea:'Denne metoden går igjen på nesten hver eksamen, inne i RSA og kongruenser. Lær den mekanisk.',
 must:[
  ['Divisjon med rest','a = q · b + r, 0 ≤ r &lt; b'],
  ['Euklids algoritme','Del det største tallet på det minste, og fortsett med (divisor, rest) til resten blir 0. <b>Siste rest ≠ 0 er gcd.</b>'],
  ['Utvidet Euklid (baklengs)','Start med siste likning med rest ≠ 0, skriv resten = … og sett inn for restene ovenfra én etter én. Da får du gcd = s·a + t·b.'],
  ['Invers: a<sup>−1</sup> mod n','finnes ⇔ gcd(a, n) = 1. Løs a·x + n·y = 1. Inversen er x redusert mod n.'],
  ['ax + by = c','løsbar ⇔ d = gcd(a, b) deler c. Finn én løsning (x₀, y₀). Alle løsninger er x = x₀ + (b/d)t, y = y₀ − (a/d)t.']],
 ex:{q:'Finn 7<sup>−1</sup> mod 160. (K26)',
  s:['160 = 22 · 7 + 6','7 = 1 · 6 + 1 &nbsp;(rest 1 ⇒ gcd = 1, inversen finnes)','Baklengs: 1 = 7 − 1·6 = 7 − (160 − 22·7) = 23·7 − 1·160','Altså 7 · 23 ≡ 1 (mod 160) ⇒ <b>7<sup>−1</sup> = 23</b>. Sjekk: 161 = 160 + 1 ✓']},
 traps:['Negativ koeffisient? Legg til n: −296 ≡ −296 + 667 = 371 (mod 667).','Små tall? Prøv deg fram: 5 · 2 = 10 ≡ 1 (mod 9) ⇒ 5<sup>−1</sup> = 2.']},

{id:'kongruens',t:'Kongruenser og kinesisk restteorem',min:7,
 idea:'a ≡ b (mod n) betyr at n deler a − b, altså samme rest. Du regner som vanlig, men reduserer underveis. Å «dele» er det samme som å gange med inversen.',
 must:[
  ['Lineær kongruens ax ≡ b (mod n)','løsbar ⇔ d = gcd(a, n) deler b. Da er det d løsninger mod n. Hvis d = 1: x ≡ a<sup>−1</sup>·b.'],
  ['To kongruenser (metoden)','x ≡ r₁ (mod m₁) ⇒ x = r₁ + m₁t. Sett inn i den andre og løs for t. Sett t = t₀ + m₂s tilbake. Da får du x ≡ … (mod m₁m₂).'],
  ['Kinesisk restteorem','gcd(m₁, m₂) = 1 ⇒ nøyaktig én løsning mod m₁m₂'],
  ['Ikke relativt primiske moduler','løsbart ⇔ gcd(m₁, m₂) deler r₁ − r₂. Løsningen er da unik mod lcm(m₁, m₂).'],
  ['Fermats lille teorem','p primtall, p ∤ a ⇒ a<sup>p−1</sup> ≡ 1 (mod p). Reduser eksponenten mod p − 1.'],
  ['Eulers teorem','gcd(a, n) = 1 ⇒ a<sup>φ(n)</sup> ≡ 1 (mod n)']],
 ex:{q:'Løs 5x + 7 ≡ 2 (mod 9), 4x + 1 ≡ 3 (mod 11). (K26)',
  s:['Første: 5x ≡ −5 ≡ 4 (mod 9). 5<sup>−1</sup> = 2 (fordi 10 ≡ 1), så x ≡ 8 (mod 9).','Andre: 4x ≡ 2 (mod 11). 4<sup>−1</sup> = 3 (fordi 12 ≡ 1), så x ≡ 6 (mod 11).','x = 8 + 9t ⇒ 8 + 9t ≡ 6 ⇒ 9t ≡ 9 ⇒ t ≡ 1 (mod 11).','t = 1 + 11s ⇒ x = 17 + 99s, altså <b>x ≡ 17 (mod 99)</b>.']},
 traps:['x ≡ 1 (mod 4) og x ≡ 2 (mod 6): gcd = 2, og 1 − 2 er odde, så systemet har <b>ingen</b> løsning (H25).','Siste siffer i et tall = tallet mod 10.']},

{id:'krypto',t:'φ, RSA og Diffie–Hellman',min:8,
 idea:'RSA er en oppskrift som setter sammen φ, utvidet Euklid og rask eksponentiering. Kan du de tre delene, kan du RSA.',
 must:[
  ['Eulers φ','φ(p) = p − 1, φ(p<sup>k</sup>) = p<sup>k</sup> − p<sup>k−1</sup>, og φ er multiplikativ. φ(pq) = (p − 1)(q − 1).'],
  ['RSA-oppskrift','n = pq, φ = (p−1)(q−1). e må ha gcd(e, φ) = 1. d = e<sup>−1</sup> mod φ.'],
  ['Krypter / dekrypter','c = m<sup>e</sup> mod n, &nbsp; m = c<sup>d</sup> mod n'],
  ['Rask eksponentiering','Skriv eksponenten som sum av toerpotenser (11 = 8 + 2 + 1). Kvadrer: a, a², a⁴, a⁸ mod n. Gang sammen de du trenger og reduser hele tiden.'],
  ['Diffie–Hellman','Offentlige q og g. A = g<sup>a</sup>, B = g<sup>b</sup> mod q. Felles nøkkel K = B<sup>a</sup> = A<sup>b</sup> = g<sup>ab</sup>.']],
 ex:{q:'RSA (n, e) = (221, 35), c = 59. Finn m. (H25)',
  s:['221 = 13 · 17 ⇒ φ = 12 · 16 = 192.','d = 35<sup>−1</sup> mod 192: 192 = 5·35 + 17, 35 = 2·17 + 1 ⇒ 1 = 35 − 2·17 = 11·35 − 2·192 ⇒ <b>d = 11</b>.','11 = 8 + 2 + 1. 59² ≡ 166, 59⁴ ≡ 166² ≡ 152, 59⁸ ≡ 152² ≡ 120 (mod 221).','m ≡ 120 · 166 · 59 ≡ <b>2</b> (mod 221).']},
 traps:['Ugyldig e: sjekk gcd(e, φ). Har de en felles faktor, finnes ingen d.','Faktoriser n ved å prøve primtall opp til √n.']},

{id:'automat',t:'Tilstandsmaskiner og regulære uttrykk',min:7,
 idea:'En tilstandsmaskin leser strengen tegn for tegn. Hver tilstand er et «minne» om det du trenger å vite så langt. Strengen godtas hvis du ender i en dobbel sirkel.',
 must:[
  ['Deterministisk (DFA)','én start, nøyaktig én pil per symbol ut av <i>hver</i> tilstand, og aksepterende tilstander (dobbel sirkel)'],
  ['Designoppskrift','1) Hva må maskinen huske? (antall 0-ere, siste tegn, om noe er «ødelagt»). 2) Lag én tilstand per mulighet. 3) Tegn pilene. 4) Legg til en søppeltilstand som fanger alt ulovlig.'],
  ['Regulære uttrykk','| = eller, * = 0 eller flere ganger, sammenstilling = etter hverandre, Λ = tom streng'],
  ['Nyttige byggeklosser','(0|1)* = alt. 1* = bare enere. (0|1)*01 = slutter på 01. 1*01*01*01* = nøyaktig tre 0-ere.']],
 ex:{q:'Lag en DFA for bitstrenger med nøyaktig tre 0-ere. (K26)',
  s:['Den må huske antall 0-ere: q0, q1, q2, q3, og «for mange» (q4).','På 1: bli der du er. På 0: gå ett steg frem. q4 går til seg selv på alt.','Bare q3 er aksepterende.','Regulært uttrykk: 1*01*01*01*.']},
 traps:['Glemt pil = ikke deterministisk. Bruk søppeltilstand.','Test maskinen din på korte strenger: tom, «0», «1», «000».']},

{id:'grafer',t:'Grafer',min:6,
 idea:'En graf er noder og kanter. Det meste handler om å telle grader og kjenne igjen noen få regler.',
 must:[
  ['Håndhilselemmaet','summen av alle grader = 2 · antall kanter'],
  ['Eulerkrets','bruker alle <i>kanter</i> én gang og ender der den startet ⇔ sammenhengende og alle grader er partall'],
  ['Eulervei (åpen)','⇔ sammenhengende og nøyaktig to noder med odde grad. Start i den ene og slutt i den andre.'],
  ['Hamiltonsykel','besøker alle <i>noder</i> nøyaktig én gang. Det finnes ingen enkel regel, så du må argumentere (en node med grad 1 gjør det umulig).'],
  ['Komplett graf og komplement','|E(Kₙ)| = n(n−1)/2. Komplementet har kantene som mangler: n(n−1)/2 − |E|.'],
  ['Isomorfi','en omdøping av nodene som bevarer kantene. Sjekk først antall noder, antall kanter og gradfølge. Er én av dem ulik, er grafene ikke isomorfe.']],
 ex:{q:'En graf har grader 2, 3, 3, 4, 4. Hvor mange kanter? Har den en Eulervei?',
  s:['Sum av grader = 16 ⇒ 16/2 = 8 kanter.','To noder har odde grad (3 og 3) ⇒ den har en åpen Eulervei (hvis grafen er sammenhengende), men ingen Eulerkrets.']},
 traps:['Euler handler om kanter, Hamilton om noder.','«Ingen av stiene jeg prøvde virket» er ikke et bevis. Bruk et strukturargument.']},

{id:'traer',t:'Trær og minimalt spenntre',min:5,
 idea:'Et tre er en sammenhengende graf uten sykler. Med n noder har det alltid n − 1 kanter. Et minimalt spenntre (MST) kobler alle nodene så billig som mulig.',
 must:[
  ['Fakta om trær','n noder ⇔ n − 1 kanter. Skog med k komponenter har n − k kanter. Hvert tre med ≥ 2 noder har minst 2 blader.'],
  ['Prims algoritme','Start i en node. Legg hele tiden til den billigste kanten fra treet ditt til en node utenfor.'],
  ['Kruskals algoritme','Sorter alle kanter. Ta den billigste som <i>ikke</i> lager sykel, og gjenta til du har n − 1 kanter.'],
  ['Fullt m-ært tre','i indre noder ⇒ n = mi + 1 noder og (m − 1)i + 1 blader'],
  ['Tell blader','Bruk Σ grader = 2(n − 1) og sett opp én likning']],
 ex:{q:'Kan et tre med n ≥ 2 noder være isomorf med sitt komplement? (H25)',
  s:['Treet har n − 1 kanter. Komplementet har n(n−1)/2 − (n − 1).','Like mange kanter ⇒ n(n−1)/2 = 2(n − 1) ⇒ n = 4.','Stien med 4 noder (1–2–3–4) er faktisk sitt eget komplement.']},
 traps:['Skriv ned rekkefølgen kantene velges i, og hvorfor. Det er det som gir poeng («forklar framgangsmåten»).','Ved lik vekt kan du velge fritt.']}
];
})(typeof window!=='undefined'? window : globalThis);
