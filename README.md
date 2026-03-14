# Sally Lite

**AI code reviewer with zero filter.** Deploy on Render in one click, roast your code from the terminal.

[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy?repo=https://github.com/nicktron/cynicalsally-lite)

## What is this?

Sally Lite is a free, lightweight code reviewer that runs in your terminal. Point it at your code and get a brutally honest review — scores, issues, fixes, and a personality that doesn't hold back.

```bash
sally roast ./src/
```

```
  ☠  SALLY'S CODE REVIEW
  Quick Roast • 12 files reviewed

  Score: 6.3/10 [██████░░░░]
  ──────────────────────────────────────────────────

  Your naming conventions are doing that thing where they can't decide
  what language they're speaking. Pick camelCase or snake_case.

  ──────────────────────────────────────────────────
  TOP ISSUES

  1. MAJOR NAMING_CONVENTION
     Inconsistent naming conventions
     → src/utils/helpers.ts
     ✓ Pick one naming convention and stick with it.

  ──────────────────────────────────────────────────
  ✨ At least you're using a code reviewer.
  🔥 This code has the architectural integrity of a house of cards.
```

## Quick Start

### Option 1: Deploy to Render (one click)
Click the button above. Done.

### Option 2: Run locally
```bash
git clone https://github.com/nicktron/cynicalsally-lite.git
cd cynicalsally-lite
npm install
node index.js roast ./your-project/
```

## Usage

```bash
# Roast a directory
sally roast ./src/

# Roast specific files
sally roast app.ts utils.ts

# Quick mode (default) — fast, uses Haiku
sally roast ./src/ --mode quick

# JSON output for CI pipelines
sally roast ./src/ --json

# Fail CI if score is below threshold
sally roast ./src/ --fail-under 6.0

# Change language
sally roast ./src/ --lang nl
```

## Options

| Flag | Description | Default |
|------|-------------|---------|
| `--mode` | `quick` or `full_truth` | `quick` |
| `--tone` | `cynical`, `neutral`, `professional` | `cynical` |
| `--lang` | Language code (en, nl, de, etc.) | `en` |
| `--json` | Output raw JSON | - |
| `--fail-under` | Exit 1 if score below threshold | - |

## Limits

Sally Lite is free with generous limits:

| | Lite (free) | CLI Free | SuperClub CLI |
|---|---|---|---|
| Quick Reviews/mo | 90 | 30 | 500 |
| Full Truth/mo | - | 3 | 100 |
| Model | Haiku | Haiku + Sonnet | Sonnet-first |

## Privacy

- Your code is sent to the CynicalSally API for review
- **Code is never stored** — processed in memory, discarded after response
- No telemetry beyond anonymous usage counts
- Device ID stored locally in `~/.sally/config.json`

## Want more?

Sally Lite is a taste of what Sally can do. For the full experience:

- **[Sally CLI](https://cynicalsally.com/cli)** — Full CLI with git diff support, staged changes, CI integration
- **[SuperClub CLI](https://cynicalsally.com/superclub)** — Unlimited reviews, Sonnet-first, priority processing

## License

MIT — see [LICENSE](LICENSE)
