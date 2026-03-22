# Sally Lite

![Cynical Sally](sally-banner.png)

> **"I don't hate your code. I just expected better."** — Sally

**Free code reviewer. Zero filter. Zero sugarcoating.**
Paste code or a GitHub URL, get a brutally honest review — scores, issues, fixes, and a personality that won't hold back.

[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy?repo=https://github.com/w1ckedxt/cynicalsally-lite)

---

## What is Sally Lite?

Sally Lite is a free code review tool powered by [Cynical Sally](https://cynicalsally.com) — a senior engineer who reviews your code like she has time, opinions, and absolutely no reason to be polite.

**Two ways to use it:**

- **Web UI** — Paste code or a GitHub repo URL, get roasted in your browser
- **CLI tool** — Review local files from the terminal

Sally Lite is a thin client — no review logic, no prompts, no secrets. It sends your code to the CynicalSally backend and displays the results.

---

## Features

| | |
|---|---|
| **Scoring** | 0–10 code quality score with detailed breakdown |
| **Observations** | Section-based analysis (architecture, naming, security, DRY, etc.) |
| **Issues** | Severity-tagged: critical / major / minor |
| **Fixes** | Actionable, step-by-step improvements |
| **GitHub Roast** | Paste a repo URL — Sally fetches and reviews the codebase |
| **Burncard** | Shareable PNG card with your score and Sally's hardest sneer |
| **Share on X** | One-click tweet your roast results |

---

## Quick Start

### Deploy to Render (one click)

Click the Deploy button above. That's it. `SALLY_API_URL` is preconfigured.

### Run locally

```bash
git clone https://github.com/w1ckedxt/cynicalsally-lite.git
cd cynicalsally-lite
npm install
npm start
```

Open `http://localhost:3000` in your browser.

### CLI tool

```bash
node index.js roast ./your-project/
```

---

## Architecture

```
Sally Lite (this repo)              CynicalSally Backend
┌──────────────────────┐            ┌──────────────────────────┐
│ server.js (web UI)   │   POST     │ /api/v1/review           │
│ index.js  (CLI tool) │ ────────>  │ - Rate limiting          │
│                      │            │ - Device/IP quota        │
│ No prompts           │ <────────  │ - Code review engine       │
│ No review logic      │   JSON     │ - Sally's personality    │
│ No secrets           │            │ - Scoring + issues       │
└──────────────────────┘            └──────────────────────────┘
  Open source (MIT)                   Closed backend
```

---

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `SALLY_API_URL` | Backend API endpoint | `https://cynicalsally-web.onrender.com` |
| `PORT` | Server port | `3000` |

## CLI Options

| Flag | Description | Default |
|------|-------------|---------|
| `--mode` | `quick` or `full_truth` | `quick` |
| `--tone` | `cynical`, `neutral`, `professional` | `cynical` |
| `--lang` | Language code (en, nl, de, es, fr, etc.) | `en` |
| `--json` | Output raw JSON | - |
| `--fail-under` | Exit 1 if score below threshold | - |

---

## Limits

Sally Lite is free with daily limits:

| | Sally Lite |
|---|---|
| Reviews per day | 3 |
| Mode | Quick Roast |
| GitHub repo roast | Included |
| Code paste roast | Included |

---

## Privacy

- Your code is sent to the CynicalSally API for review
- **Code is never stored** — processed in memory, discarded after response
- No telemetry beyond anonymous usage counts
- Device ID stored locally for rate limiting only

---

## Want the full experience?

Sally Lite is a free taste. The **Full Suite CLI** unlocks everything:

- 6 specialized tools (roast, explain, refactor, brainstorm, frontend, marketing)
- Unlimited daily reviews
- 0–10 scorecard with evidence-backed issues
- Downloadable PDF reports
- SuperClub: Chrome Extension + web access
- No ads, no sugarcoating

**[Get the Full Suite CLI](https://github.com/w1ckedxt/cynicalsally-cli)**

---

## Render Blueprint

This repo includes [`render.yaml`](render.yaml) for one-click deployment as a Render Web Service (free tier, Frankfurt region, health check included).

## License

MIT — see [LICENSE](LICENSE)
