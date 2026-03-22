# CLI Burncard Redesign — Volgende Sessie

## Wat er nu is
- Backend endpoint werkt: `GET /api/v1/share-card?source=cli&...` genereert PNG
- Sally Lite toont de PNG inline in results, klikbaar naar full-size
- MAAR: het design is slecht. Dode ruimte, slechte proportions, footer overlapt quote, niet techy genoeg

## Wat er moet gebeuren

### 1. Burncard PNG Design (backend: `app/api/v1/share-card/route.tsx`, source=cli block)

**Vibe:** "leet hacker" terminal aesthetic. Niet gewoon donker — het moet eruitzien alsof een developer het deelt en andere devs denken "wtf is dit, ik wil dit ook".

**Must haves:**
- sally-banner.png als header (Sally + CLI neon sign) — helder, niet grauw
- "CYNICAL SALLY CLI" badge prominent
- Score groot en color-coded (groen/geel/rood)
- Verdict (CATASTROPHIC/DISAPPOINTING/MEDIOCRE/ACCEPTABLE)
- Sneer quote als hero — goed geproportioneerd, GEEN dode ruimte
- `$ sally roast [subject]` in terminal/command style
- `$ npm install -g @cynicalsally/cli` footer
- cynicalsally.com
- 1080x1920 vertical (shareable format)
- Monospace font
- Alle elementen goed geproportioneerd — geen overlap, geen enorme lege vlakken

**Design inspiratie:**
- Terminal windows met groene/rode tekst op zwart
- Code editor dark themes (Dracula, One Dark)
- Hacker aesthetic maar clean en leesbaar
- Denk aan hoe Vercel, Linear, Raycast hun share cards doen — maar dan terminal style

**Huidige problemen te fixen:**
- `flex: 1` op quote box maakt enorme dode ruimte als sneer kort is
- Footer (`npm install` + `cynicalsally.com`) overlapt de quote
- Card body mist `flex: 1` waardoor layout breekt
- Alles te klein (subject was 14px, veel te klein voor 1080px canvas)
- Niet techy genoeg — gewoon donker, geen terminal vibes

### 2. Sally Lite Integratie (`cynicalsally-lite/server.js`)

**Hoe de burncard in de results moet:**
- PNG image inline in results, klikbaar naar full-size in nieuw tab
- Max-width zodat het niet de hele pagina vult maar wel mooi past
- Rode border glow on hover
- `onerror` handler voor als backend niet bereikbaar is

**CRITICAL: Template literal regels**
- Regex backslashes DUBBEL escapen: `\\.` niet `\.`
- GEEN innerHTML met escaped quotes — gebruik DOM API (createElement)
- `${VAR}` wordt door Node geïnterpoleerd — gebruik het bewust
- ALTIJD browser JS validatie check draaien voor push:
```bash
cd ~/cynicalsally-lite && SALLY_API_URL=https://cynicalsally-web.onrender.com node -e "
const http=require('http');const srv=require('child_process').fork('server.js',[],{env:{...process.env,PORT:'9879'},silent:true});
setTimeout(()=>{http.get('http://localhost:9879/',(res)=>{let d='';res.on('data',c=>d+=c);res.on('end',()=>{const s1=d.indexOf('<script>')+8;const s2=d.indexOf('</script>');try{new Function(d.slice(s1,s2));console.log('BROWSER JS: OK')}catch(e){console.log('BROKEN:',e.message)}srv.kill();process.exit()})})},1000);"
```

### 3. Wat NIET aanraken
- Web/extension burncards (zonder `source=cli` parameter)
- De review endpoint response format
- De quips systeem
- Alles wat nu werkt op de Sally Lite pagina (GitHub roast, paste roast, secties, score)

## Files
- Backend burncard: `/Users/thomasgeelens/cynicalsally-render/app/api/v1/share-card/route.tsx` (source=cli block, begint rond regel 31)
- Sally Lite: `/Users/thomasgeelens/cynicalsally-lite/server.js` (results rendering + share code)
- Banner image: `/Users/thomasgeelens/cynicalsally-render/public/sally-banner.png` (1100x445)
