# CYNICALSALLY-LITE — Project File

> Source of truth voor Sally Lite.
> Laatste update: 2026-03-25

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
| Render project aanmaken | 🔧 BEZIG | Thomas koppelt repo via Blueprint deploy |
| Echte AI reviews | ✅ LIVE | Backend doet echte Claude reviews |
| GitHub repo roast | ✅ DONE | Paste GitHub URL, Sally fetcht + roast codebase |
| Code paste roast | ✅ DONE | Paste code snippet, Sally roast het |
| Code validation | ✅ DONE | looksLikeCode() + prompt injection detectie |
| Quips from backend | ✅ DONE | Waiting quips fetched van /api/v1/quips |
| Sectie-based rendering | ✅ DONE | Observations met titels als aparte secties |
| CLI Burncard | ✅ DONE | Terminal window design, GitHub dark theme, aspect-ratio 9/16, twee-kaart layout naast verdict |
| Share on X | ✅ DONE | Tweet button met sneer + score |
| Bento CTA card | ✅ DONE | Amber Full Suite card met feature list, fullsuitebanner image |
| GitHub-ready repo | ✅ DONE | README geverifieerd, geen AI branding, OSS compliant, klaar voor Render team |
| Assets opgeschoond | ✅ DONE | PNGs naar assets/ folder, plan/ uit git tracking (feedback Shifra) |
| Monolith refactor | ✅ DONE | server.js gesplit in server.js + lib/github.js + lib/html.js (feedback Shifra) |
| Deploy to Render button | ✅ DONE | Op pagina zelf (boven + onder) met SALLYXRENDER.png + Shifra's UTM |
| Window title update | ✅ DONE | "Sally Lite \| Same sharp feedback, simpler to run" (feedback Shifra) |

---

## FILES

| File | Doel |
|------|------|
| `server.js` | Routes, config, validation, assets (~285 regels) |
| `lib/github.js` | GitHub fetch, cache, URL parsing |
| `lib/html.js` | HTML template (export functie) |
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

1. Overleg met Shifra: deployers eigen GITHUB_TOKEN of via backend endpoint
2. Blogpost van Shifra reviewen (zij draftet, input van Render team)
3. Open Graph share page op backend (burncard PNG inline in tweets)
4. Burncard design itereren na live feedback

## CONTEXT

- 2026-03-22: CLI burncard redesigned (terminal window, GitHub dark theme, geen dead space)
- 2026-03-22: Two-card layout (verdict + burncard naast elkaar, aspect-ratio 9/16)
- 2026-03-22: Share on X button, bento CTA card (amber Full Suite branding)
- 2026-03-22: Repo GitHub-ready: README geverifieerd, alle AI branding verwijderd, OSS compliant
- 2026-03-22: sally-banner.png updated (CLI → Lite branding)
- 2026-03-23: Assets naar assets/ folder, plan/ uit git tracking (feedback Shifra/Render team)
- 2026-03-23: Shifra start blogpost over Sally OSS + CLI met input van Render team
- Full Suite pagina (cynicalsally-render) is live met 6 CLI tools + SuperClub included
- SuperClub is nu puur web + Chrome Extension (paars), CLI is Full Suite (amber)
- 2026-03-25: server.js monolith gesplit in 3 modules (feedback Shifra over monolith)
- 2026-03-25: Deploy to Render button op pagina met SALLYXRENDER.png + Shifra's UTM tracking
- 2026-03-25: Window title updated, README deploy button met utm_source=sally_website
- 2026-03-25: Target tracking (repo URL/filename) in admin live feed
- 2026-03-25: Admin visual upgrade (translucent badges, glow, branding, tabular-nums)
- 2026-03-25: LITE_REVIEW event + source tracking (lite, chrome_ext, safari_ext)
- 2026-03-25: is_test systeem verwijderd, alle events tellen mee
- 2026-03-25: Safari ITP workaround (deviceId fallback auth + content script bridge)
- 2026-03-25: Dynamic scoring categories per content type (44+ types, was hardcoded website)
- 2026-03-25: Ethische regels uitgebreid (minderjarigen, PII, discriminatie, voedselveiligheid)

---

*CynicalSally Lite — Thomas 2026*
