# CYNICALSALLY-LITE — Project File

> Source of truth voor Sally Lite.
> Laatste update: 2026-03-21

---

## WAT IS SALLY LITE?

Sally Lite is een **thin client** die developers met één klik deployen op Render. Het is een gratis proeverij van Sally's code reviews. Bevat GEEN AI logica, GEEN prompts — puur een interface die code doorstuurt naar de CynicalSally backend.

**Funnel:** Lite (gratis, 3/dag) → Full Suite CLI (€175.63/yr FF of €19.98/mo)

---

## ARCHITECTUUR

```
Sally Lite (deze repo)              CynicalSally Backend (cynicalsally-render)
┌──────────────────────┐            ┌──────────────────────────┐
│ server.js (web UI)   │  POST      │ /api/v1/review           │
│ index.js  (CLI tool) │ ────────>  │ - Rate limiting          │
│                      │            │ - Device/IP quota        │
│ ❌ Geen prompts       │ <────────  │ - Claude AI review       │
│ ❌ Geen AI logica     │  JSON      │ - Sally's persoonlijkheid │
│ ❌ Geen secrets       │            │ - Scoring + issues       │
└──────────────────────┘            └──────────────────────────┘
  Open source (MIT)                   Gesloten backend (ons)
```

---

## STATUS

| Component | Status | Notes |
|-----------|--------|-------|
| Web service (`server.js`) | ✅ DONE | HTML UI, proxy naar backend |
| CLI tool (`index.js`) | ✅ DONE | File collection, terminal output |
| Render Blueprint (`render.yaml`) | ✅ DONE | Web service, free tier |
| README + deploy button | ✅ DONE | Funnel CTA's erin |
| Render project aanmaken | ⬜ WACHT | Thomas moet 2e project betalen |
| Echte AI reviews | ⬜ WACHT | Backend stuurt mock data tot Claude credits |

---

## FILES

| File | Doel |
|------|------|
| `server.js` | HTTP server + HTML UI (Render web service) |
| `index.js` | CLI tool (lokaal gebruik, `node index.js roast ./src/`) |
| `render.yaml` | Render Blueprint configuratie |
| `package.json` | Dependencies (chalk, commander, ora) + ESM |

---

## BACKEND DEPENDENCY

Sally Lite callt: `POST {SALLY_API_URL}/api/v1/review`

Request: `{ files: [{path, content}], mode, deviceId, lang, tone }`
Response: `{ data: {score, issues, actionable_fixes}, voice: {roast, bright_side, hardest_sneer}, meta, quota }`

Environment variable: `SALLY_API_URL` (default: `https://cynicalsally-web.onrender.com`)

---

## VOLGENDE STAPPEN

1. Wachten op Shifra — zij bepaalt hoe Sally Lite er visueel uitziet
2. Render project aanmaken → Lite repo koppelen → Blueprint deploy
3. Claude API credits → backend mock data → echte reviews
4. End-to-end test: web UI + CLI
5. Render marketing materiaal voorbereiden

## CONTEXT

- 2026-03-21: Repo is prima, wachten op Shifra voor haar visie
- Full Suite pagina (cynicalsally-render) is live met 6 CLI tools + SuperClub included
- SuperClub is nu puur web + Chrome Extension (paars), CLI is Full Suite (amber)

---

*CynicalSally Lite — Thomas 2026*
