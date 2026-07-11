# Changelog – Jánosi Dalma weboldal

## 2026-07-11

### Adatkezelési tájékoztató – román és angol fordítás
- A tájékoztató törzse bekerült a `lang.json`-ba mindhárom nyelven (hu/ro/en)
- Nyelvváltáskor automatikusan vált a tartalom
- Tartalmi frissítés: 9 pontra bővítve (új: Adatfeldolgozó szakasz, adathordozhatóság joga)
- `adatkezeles.html` fallback tartalom szinkronizálva

---

## 2026-07-10

### EmailJS → Formspree migráció
- EmailJS eltávolítva (domain-korlátozás fizetős feature volt)
- Formspree integrálva (`https://formspree.io/f/mykqrdwe`)
- Nincs több külső script betöltés – egyszerűbb, gyorsabb form
- `cdn.jsdelivr.net` dns-prefetch eltávolítva `index.html`-ből

### GDPR hozzájárulás
- Kötelező checkbox hozzáadva a kapcsolati formhoz
- Linkeli az adatkezelési tájékoztatót (`adatkezeles.html`)
- `form_gdpr_consent` kulcs hozzáadva `lang.json`-hoz (hu/ro/en)

### Adatkezelési tájékoztató oldal
- Új oldal: `adatkezeles.html`
- Tartalom: adatkezelő, kezelt adatok, cél, jogalap, megőrzési idő, jogok, panasz, biztonság
- `.privacy-content` és `.privacy-body` CSS stílusok hozzáadva `css/main.css`-hez
- `.gdpr-consent` checkbox stílus hozzáadva `css/components.css`-hez

---

## 2026-07-09

### Szolgáltatás képek előtöltése
- `preloadServiceImages()` függvény hozzáadva `js/main.js`-hez
- `loading="lazy"` attribútum eltávolítva a dinamikusan generált képekről
- Megszünteti a késleltetett képmegjelenést a szolgáltatáskártyák lapozásakor

### Szolgáltatások átstrukturálása
- Két egyéni terápia oldal összevonva eggyé ("Egyéni terápia")
- Szolgáltatások új sorrendje: Egyéni → Párterápia → Online → Csoport → Gyermek → Tanulási nehézségek
- Árak frissítve: Egyéni 200 lej, Párterápia 300 lej, Online 200 lej
- Új oldal: `service/children-groups.html` (Gyermekfoglalkozások)
- Új oldal: `service/periodic-groups.html` (Időszakos csoportok)
- "Időszakos csoportok" navigációs link hozzáadva minden oldalhoz
- Szolgáltatások leírásai frissítve mindhárom nyelven (hu/ro/en)
- Sindelar oldal átnevezve: "Tanulási nehézségek felmérése és prevenciója"

### Felsorolások behúzása
- `.left ul { padding-left: 1.5rem }` hozzáadva `css/main.css`-hez
- A CSS reset (`* { margin: 0; padding: 0 }`) miatt hiányzó alapértelmezett behúzás pótolva

---

## 2026-06-09

### Mobilnézet és vizuális finomítások
- Mobilos szolgáltatáskártyák vizuálisan igazítva a desktop nézethez
- YouTube videó előnézet nagyobb, lapozónyilak láthatók
- Mobil videó előnézet teljes szélességű (nyilak visszakerültek a videó mellé)
- "Itt láthattál korábban" cím balra igazítva

### CSS/JS optimalizálás
- Redundancia és halott kód eltávolítva (-98 sor)

---

## 2026-06-08

### Szolgáltatások desktop – 3D könyv nézet
- Szolgáltatás grid helyett 3D lapozható könyv layout (desktop)
- Könyv gerinc és halmozott lapélek a 3D hatáshoz

### Szolgáltatások mobil – kártyapakli
- Húzható kártyapakli nézet mobilon
- "Bővebben" gomb mindig látható
- Koppintásra megnyíló overlay eltávolítva (egyszerűsítve)

### Blog és videó
- Videó grid helyett reszponzív carousel (3 látható, nyilak átfedésnél)

---

## 2026-01-01

### Kezdeti fejlesztések
- Multilingual rendszer kiépítése (hu/ro/en) `lang.json` alapon
- Szolgáltatás oldalak létrehozása: egyéni, párterápia, online, csoportterápia, Sindelar
- Blog rendszer kialakítása
- Sindelar oldal hozzáadva (tanulási nehézségek)
- Képek és tartalmak feltöltése

---

## 2025-12-31

### Inicializálás
- Projekt létrehozása (`Initial commit`)
- `lang.json` alapstruktúra kialakítása
