# Sally Lite

![Sally — AI Code Reviewer](sally-banner.png)

**AI code reviewer with zero filter.** Paste code or a GitHub URL, get a brutally honest review. Deploy on Render in one click.

[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy?repo=https://github.com/w1ckedxt/cynicalsally-lite)

## What is Sally Lite?

Sally Lite is a free, lightweight code review tool powered by [Cynical Sally](https://cynicalsally.com) — an AI reviewer that scores your code, finds issues, suggests fixes, and delivers it all with zero sugarcoating.

**Two ways to use it:**

- **Web UI** — Paste code or a GitHub repo URL, get roasted in seconds
- **CLI tool** — Review local files from the terminal

Sally Lite is a thin client. It contains no AI logic, no prompts, no secrets — it sends your code to the CynicalSally backend and displays the results.

## Features

- 0–10 code quality score with detailed breakdown
- Section-based observations (architecture, naming, security, etc.)
- Severity-tagged issues (critical / major / minor)
- Actionable fixes for every issue found
- GitHub repo roasting — paste a URL, Sally fetches and reviews
- CLI burncard — shareable PNG image of your review results
- Share on X — one-click tweet your roast score

## Quick Start

### Option 1: Deploy to Render (one click)

Click the Deploy to Render button above. Set `SALLY_API_URL` to `https://cynicalsally-web.onrender.com` (default). Done.

### Option 2: Run locally

```bash
git clone https://github.com/w1ckedxt/cynicalsally-lite.git
cd cynicalsally-lite
npm install
npm start
```

Open `http://localhost:3000` in your browser.

### Option 3: CLI tool

```bash
node index.js roast ./your-project/
```

## Architecture

```
Sally Lite (this repo)              CynicalSally Backend
┌──────────────────────┐            ┌──────────────────────────┐
│ server.js (web UI)   │  POST      │ /api/v1/review           │
│ index.js  (CLI tool) │ ────────>  │ - Rate limiting          │
│                      │            │ - Device/IP quota        │
│ No prompts           │ <────────  │ - Claude AI review       │
│ No AI logic          │  JSON      │ - Sally's personality    │
│ No secrets           │            │ - Scoring + issues       │
└──────────────────────┘            └──────────────────────────┘
  Open source (MIT)                   Closed backend
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `SALLY_API_URL` | Backend API endpoint | `https://cynicalsally-web.onrender.com` |
| `PORT` | Server port | `3000` |

## CLI Usage

```bash
# Roast a directory
node index.js roast ./src/

# Roast specific files
node index.js roast app.ts utils.ts

# Quick mode (default)
node index.js roast ./src/ --mode quick

# JSON output for CI pipelines
node index.js roast ./src/ --json

# Fail CI if score is below threshold
node index.js roast ./src/ --fail-under 6.0

# Change language
node index.js roast ./src/ --lang nl
```

## CLI Options

| Flag | Description | Default |
|------|-------------|---------|
| `--mode` | `quick` or `full_truth` | `quick` |
| `--tone` | `cynical`, `neutral`, `professional` | `cynical` |
| `--lang` | Language code (en, nl, de, es, fr, etc.) | `en` |
| `--json` | Output raw JSON | - |
| `--fail-under` | Exit 1 if score below threshold | - |

## Limits

Sally Lite is free with generous daily limits:

| | Sally Lite (free) |
|---|---|
| Reviews per day | 3 |
| Mode | Quick Roast |
| GitHub repo roast | Yes |
| Code paste roast | Yes |

## Privacy

- Your code is sent to the CynicalSally API for review
- **Code is never stored** — processed in memory, discarded after response
- No telemetry beyond anonymous usage counts
- Device ID stored locally for rate limiting

## Want more?

Sally Lite is a taste. The full CLI unlocks everything:

- **[Sally CLI Full Suite](https://github.com/w1ckedxt/cynicalsally-cli)** — 6 specialized tools, unlimited reviews, PDF reports, SuperClub included
- **[cynicalsally.com](https://cynicalsally.com)** — Full details and pricing

## Render Blueprint

This repo includes a [`render.yaml`](render.yaml) for one-click deployment as a Render Web Service (free tier, Frankfurt region).

## License

MIT — see [LICENSE](LICENSE)
