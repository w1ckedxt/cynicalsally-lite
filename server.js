import { createServer } from "node:http";
import { readFileSync } from "node:fs";
import { randomUUID } from "node:crypto";

const BANNER = readFileSync(new URL("./sally-banner.png", import.meta.url));
const PIXEL_SALLY = readFileSync(new URL("./pixelsally-cursedqueen.png", import.meta.url));
const SALLY_HEAD = readFileSync(new URL("./sally-head.png", import.meta.url));
const TOOL_IMAGES = {
  "brainstorm": readFileSync(new URL("./FULL-SUITE-BRAINSTORM.png", import.meta.url)),
  "explain": readFileSync(new URL("./FULL-SUITE-EXPLAIN.png", import.meta.url)),
  "refactor": readFileSync(new URL("./FULL-SUITE-REFACTOR.png", import.meta.url)),
  "frontend": readFileSync(new URL("./FULL-SUITE-FRONTENDREVIEW.png", import.meta.url)),
  "marketing": readFileSync(new URL("./FULL-SUITE-MARKETINGREVIEW.png", import.meta.url)),
  "prreview": readFileSync(new URL("./FULL-SUITE-PRREVIEW.png", import.meta.url)),
};

const PORT = process.env.PORT || 3000;
const SALLY_API_URL = process.env.SALLY_API_URL || "https://cynicalsally-web.onrender.com";
const MAX_CODE_LENGTH = 500 * 1024; // 500KB max paste
const INSTANCE_DEVICE_ID = `lite-${randomUUID()}`; // One ID per deployed instance — quota tracks on this

/**
 * Sally Lite Web — Simple web UI that proxies code reviews to the CynicalSally backend.
 * No AI, no prompts, no secrets. Just a thin frontend.
 */

function parseBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    let size = 0;
    req.on("data", (chunk) => {
      size += chunk.length;
      if (size > MAX_CODE_LENGTH + 1024) {
        reject(new Error("Payload too large"));
        req.destroy();
        return;
      }
      chunks.push(chunk);
    });
    req.on("end", () => resolve(Buffer.concat(chunks).toString()));
    req.on("error", reject);
  });
}

function splitCodeToFiles(code, filename) {
  // If user provides a filename, use it. Otherwise detect language and use generic name.
  const name = filename || "paste.txt";
  return [{ path: name, content: code }];
}

const server = createServer(async (req, res) => {
  // Health check
  if (req.method === "GET" && req.url === "/health") {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ status: "ok" }));
    return;
  }

  // Serve banner image
  if (req.method === "GET" && req.url === "/sally-banner.png") {
    res.writeHead(200, { "Content-Type": "image/png", "Cache-Control": "public, max-age=86400" });
    res.end(BANNER);
    return;
  }

  // Serve pixel Sally
  if (req.method === "GET" && req.url === "/pixelsally-cursedqueen.png") {
    res.writeHead(200, { "Content-Type": "image/png", "Cache-Control": "public, max-age=86400" });
    res.end(PIXEL_SALLY);
    return;
  }

  // Serve Sally head
  if (req.method === "GET" && req.url === "/sally-head.png") {
    res.writeHead(200, { "Content-Type": "image/png", "Cache-Control": "public, max-age=86400" });
    res.end(SALLY_HEAD);
    return;
  }

  // Serve tool images
  if (req.method === "GET" && req.url?.startsWith("/tool-")) {
    const name = req.url.slice(6, -4); // strip /tool- and .png
    const img = TOOL_IMAGES[name];
    if (img) {
      res.writeHead(200, { "Content-Type": "image/png", "Cache-Control": "public, max-age=86400" });
      res.end(img);
      return;
    }
  }

  // Serve HTML
  if (req.method === "GET" && (req.url === "/" || req.url === "/index.html")) {
    res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
    res.end(HTML);
    return;
  }

  // API proxy
  if (req.method === "POST" && req.url === "/api/review") {
    try {
      const body = JSON.parse(await parseBody(req));
      const { code, filename, lang, tone } = body;

      if (!code || typeof code !== "string" || code.trim().length === 0) {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Paste some code first." }));
        return;
      }

      if (code.length > MAX_CODE_LENGTH) {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Code too large. Max 500KB." }));
        return;
      }

      const files = splitCodeToFiles(code, filename);

      const apiRes = await fetch(`${SALLY_API_URL}/api/v1/review`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          files,
          mode: "quick",
          deviceId: INSTANCE_DEVICE_ID,
          lang: lang || "en",
          tone: tone || "cynical",
        }),
      });

      const result = await apiRes.json();
      res.writeHead(apiRes.status, { "Content-Type": "application/json" });
      res.end(JSON.stringify(result));
    } catch (err) {
      console.error("[review proxy]", err.message);
      res.writeHead(500, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: "Something went wrong. Try again." }));
    }
    return;
  }

  // 404
  res.writeHead(404, { "Content-Type": "text/plain" });
  res.end("Not found");
});

server.listen(PORT, () => {
  console.log(`Sally Lite running on port ${PORT}`);
  console.log(`Backend: ${SALLY_API_URL}`);
  console.log(`Instance ID: ${INSTANCE_DEVICE_ID}`);
});

// --- HTML ---

const HTML = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Sally Lite — AI Code Reviewer</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }

    body {
      font-family: 'SF Mono', 'Fira Code', 'JetBrains Mono', monospace;
      background: #0a0a0a;
      color: #e0e0e0;
      min-height: 100vh;
    }

    .container {
      max-width: 800px;
      margin: 0 auto;
      padding: 2rem 1.5rem;
    }

    /* Hero banner */
    .hero {
      max-width: 800px;
      margin: 0 auto 0;
      padding: 2rem 1.5rem 0;
    }
    .hero-img {
      width: 100%;
      border-radius: 10px;
      display: block;
    }

    /* Header */
    .header {
      text-align: center;
      margin-bottom: 2rem;
    }
    .header-title {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.6rem;
      margin-bottom: 0.3rem;
    }
    .header-title img {
      width: 36px;
      height: 36px;
      image-rendering: pixelated;
    }
    .header h1 {
      font-size: 1.8rem;
      color: #e8503a;
      margin: 0;
    }
    .header h1 span { color: #e0e0e0; }
    .header p {
      color: #666;
      font-size: 0.85rem;
    }
    .header .tagline {
      color: #ccc;
      font-size: 1rem;
      font-style: italic;
      margin-top: 0.6rem;
      line-height: 1.5;
    }

    /* Quota badge */
    .quota-bar {
      display: none;
      justify-content: center;
      margin-bottom: 1.5rem;
    }
    .quota-bar.visible { display: flex; }
    .quota-badge {
      padding: 0.3rem 0.8rem;
      background: #1a1a1a;
      border: 1px solid #2a2a2a;
      border-radius: 4px;
      font-size: 0.75rem;
      color: #888;
    }
    .quota-badge .count { color: #e8503a; font-weight: 600; }
    .quota-badge.exhausted { border-color: #ef444444; }
    .quota-badge.exhausted .count { color: #ef4444; }

    /* Editor */
    .editor-wrap {
      position: relative;
      margin-bottom: 1rem;
    }
    .filename-bar {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.5rem 0.75rem;
      background: #1a1a1a;
      border: 1px solid #2a2a2a;
      border-bottom: none;
      border-radius: 8px 8px 0 0;
    }
    .filename-bar input {
      background: transparent;
      border: none;
      color: #999;
      font-family: inherit;
      font-size: 0.8rem;
      outline: none;
      width: 200px;
    }
    .filename-bar input::placeholder { color: #444; }
    .filename-bar .dot { width: 8px; height: 8px; border-radius: 50%; }
    .dot-red { background: #ff5f56; }
    .dot-yellow { background: #ffbd2e; }
    .dot-green { background: #27c93f; }

    textarea {
      width: 100%;
      min-height: 300px;
      padding: 1rem;
      background: #111;
      border: 1px solid #2a2a2a;
      border-top: none;
      border-radius: 0 0 8px 8px;
      color: #e0e0e0;
      font-family: inherit;
      font-size: 0.85rem;
      line-height: 1.6;
      resize: vertical;
      outline: none;
      tab-size: 2;
    }
    textarea:focus { border-color: #e8503a44; }
    textarea::placeholder { color: #333; }

    /* Button */
    .actions {
      display: flex;
      align-items: center;
      gap: 1rem;
      margin-bottom: 2rem;
    }
    .btn-roast {
      padding: 0.7rem 2rem;
      background: linear-gradient(135deg, #e8503a, #c44030);
      border: none;
      border-radius: 6px;
      color: white;
      font-family: inherit;
      font-size: 0.9rem;
      font-weight: 600;
      cursor: pointer;
      transition: opacity 0.2s;
    }
    .btn-roast:hover { opacity: 0.9; }
    .btn-roast:disabled {
      opacity: 0.4;
      cursor: not-allowed;
    }
    .status {
      color: #666;
      font-size: 0.8rem;
    }
    .status.error { color: #ef4444; }

    /* Results */
    .results { display: none; }
    .results.visible { display: block; }

    .result-header {
      display: flex;
      align-items: center;
      gap: 1rem;
      margin-bottom: 1rem;
    }
    .result-header h2 {
      color: #e8503a;
      font-size: 1.1rem;
    }
    .score-badge {
      padding: 0.25rem 0.75rem;
      border-radius: 4px;
      font-weight: 600;
      font-size: 0.9rem;
    }
    .score-low { background: #ef444422; color: #ef4444; }
    .score-mid { background: #eab30822; color: #eab308; }
    .score-high { background: #22c55e22; color: #22c55e; }

    .score-bar {
      height: 6px;
      background: #1a1a1a;
      border-radius: 3px;
      margin-bottom: 1.5rem;
      overflow: hidden;
    }
    .score-bar-fill {
      height: 100%;
      border-radius: 3px;
      background: linear-gradient(90deg, #e8503a, #c44030);
      transition: width 0.6s ease-out;
    }

    .roast-text {
      padding: 1rem;
      background: #111;
      border: 1px solid #2a2a2a;
      border-radius: 8px;
      margin-bottom: 1.5rem;
      line-height: 1.7;
      color: #ccc;
      font-size: 0.85rem;
    }

    .section-title {
      color: #e8503a;
      font-size: 0.85rem;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      margin-bottom: 0.75rem;
    }

    .issue {
      padding: 0.75rem;
      background: #111;
      border: 1px solid #2a2a2a;
      border-radius: 6px;
      margin-bottom: 0.5rem;
      font-size: 0.8rem;
    }
    .issue-header {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      margin-bottom: 0.3rem;
    }
    .severity {
      padding: 0.1rem 0.4rem;
      border-radius: 3px;
      font-size: 0.7rem;
      font-weight: 600;
      text-transform: uppercase;
    }
    .sev-critical { background: #ef444433; color: #ef4444; }
    .sev-major { background: #eab30833; color: #eab308; }
    .sev-minor { background: #66666633; color: #888; }
    .issue-title { color: #e0e0e0; font-weight: 500; }
    .issue-desc { color: #888; margin-top: 0.25rem; }
    .issue-fix { color: #22c55e; margin-top: 0.25rem; }

    .endquotes {
      display: flex;
      gap: 1rem;
      margin-top: 1.5rem;
    }
    .endquote {
      flex: 1;
      padding: 0.75rem;
      background: #111;
      border: 1px solid #2a2a2a;
      border-radius: 6px;
      font-size: 0.8rem;
      line-height: 1.5;
    }
    .endquote-label {
      font-size: 0.7rem;
      color: #666;
      margin-bottom: 0.3rem;
    }
    .bright { color: #22c55e; }
    .sneer { color: #ef4444; }

    /* CTA */
    .cta {
      margin-top: 2.5rem;
      padding: 1.5rem;
      background: linear-gradient(135deg, #e8503a11, #c4403011);
      border: 1px solid #e8503a33;
      border-radius: 8px;
      text-align: center;
    }
    .cta h3 { color: #e8503a; margin-bottom: 0.5rem; font-size: 1rem; }
    .cta p { color: #888; font-size: 0.8rem; margin-bottom: 1rem; line-height: 1.5; }
    .cta a {
      display: inline-block;
      padding: 0.75rem 2.5rem;
      background: linear-gradient(135deg, #e8503a, #c44030);
      border: none;
      border-radius: 6px;
      color: white;
      font-weight: 600;
      text-decoration: none;
      font-family: inherit;
      font-size: 0.8rem;
      transition: all 0.2s;
    }
    .cta a:hover { opacity: 0.9; }

    /* Tool grid */
    .tool-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 0.75rem;
      margin: 1.5rem 0;
    }
    .tool-card {
      background: #111;
      border: 1px solid #2a2a2a;
      border-radius: 8px;
      padding: 0.75rem;
      transition: border-color 0.2s;
    }
    .tool-card:hover { border-color: #e8503a33; }
    .tool-card img {
      width: 80px;
      height: 80px;
      object-fit: cover;
      object-position: center 40%;
      border-radius: 6px;
      margin: 0 auto 0.5rem;
      display: block;
    }
    .tool-card-body {}
    .tool-card-top { margin-bottom: 0.3rem; }
    .tool-card-name {
      color: #e8503a;
      font-weight: 600;
      font-size: 0.9rem;
    }
    .tool-card-cmd {
      display: block;
      color: #666;
      font-size: 0.7rem;
      margin-bottom: 0.4rem;
    }
    .tool-card-desc {
      color: #bbb;
      font-size: 0.75rem;
      line-height: 1.6;
    }
    @media (max-width: 600px) {
      .tool-grid { grid-template-columns: 1fr; }
    }

    .footer {
      text-align: center;
      margin-top: 2rem;
      padding-top: 1.5rem;
      border-top: 1px solid #1a1a1a;
      color: #444;
      font-size: 0.7rem;
    }
    .cta-sally {
      width: 120px;
      height: auto;
      margin-bottom: 0.75rem;
      image-rendering: pixelated;
    }
    .footer a { color: #555; text-decoration: none; }
    .footer a:hover { color: #e8503a; }

    @media (max-width: 600px) {
      .container { padding: 1rem; }
      .endquotes { flex-direction: column; }
    }
  </style>
</head>
<body>
  <div class="hero">
    <img src="/sally-banner.png" alt="Sally — AI Code Reviewer" class="hero-img">
  </div>
  <div class="container">
    <div class="header">
      <div class="header-title">
        <img src="/sally-head.png" alt="Sally">
        <h1>Sally <span>Lite</span></h1>
      </div>
      <p>Paste your code. Get roasted. No mercy.</p>
      <p class="tagline">"Because 'You're absolutely right' is probably absolutely wrong."</p>
    </div>

    <div class="quota-bar" id="quotaBar">
      <span class="quota-badge" id="quotaBadge"><span class="count" id="quotaCount"></span></span>
    </div>

    <div class="editor-wrap">
      <div class="filename-bar">
        <span class="dot dot-red"></span>
        <span class="dot dot-yellow"></span>
        <span class="dot dot-green"></span>
        <input type="text" id="filename" placeholder="filename.ts (optional)">
      </div>
      <textarea id="code" placeholder="// Paste your code here...&#10;// Sally will review it with zero filter.&#10;&#10;function example() {&#10;  var x = 1&#10;  return x&#10;}" spellcheck="false"></textarea>
    </div>

    <div class="actions">
      <button class="btn-roast" id="roastBtn" onclick="roast()">Roast My Code</button>
      <span class="status" id="status"></span>
    </div>

    <div class="results" id="results">
      <div class="result-header">
        <h2>&#9760; Sally's Verdict</h2>
        <span class="score-badge" id="scoreBadge"></span>
      </div>
      <div class="score-bar"><div class="score-bar-fill" id="scoreBar"></div></div>

      <div class="roast-text" id="roastText"></div>

      <div id="issuesSection">
        <div class="section-title">Issues</div>
        <div id="issuesList"></div>
      </div>

      <div id="fixesSection" style="margin-top:1rem">
        <div class="section-title">Actionable Fixes</div>
        <div id="fixesList"></div>
      </div>

      <div class="endquotes">
        <div class="endquote">
          <div class="endquote-label">&#10024; Bright Side</div>
          <div class="bright" id="brightSide"></div>
        </div>
        <div class="endquote">
          <div class="endquote-label">&#128293; Hardest Sneer</div>
          <div class="sneer" id="hardestSneer"></div>
        </div>
      </div>
    </div>

    <div class="cta">
      <img src="/sally-head.png" alt="Sally" class="cta-sally">
      <h3>Want the full experience?</h3>
      <p>Sally Lite gives you 3 reviews/day. The full CLI unlocks unlimited reviews, git diff support, and Full Truth deep analysis.</p>
      <div class="tool-grid">
        <div class="tool-card">
          <img src="/tool-explain.png" alt="Explain">
          <div class="tool-card-body">
            <div class="tool-card-top"><span class="tool-card-name">Explain</span> <span class="tool-card-cmd">sally explain [file]</span></div>
            <div class="tool-card-desc">I read the spaghetti someone left in your codebase and translate it into plain English &mdash; no judgment on who wrote it, just the cold, clear truth of what it actually does.</div>
          </div>
        </div>
        <div class="tool-card">
          <img src="/tool-refactor.png" alt="Refactor">
          <div class="tool-card-body">
            <div class="tool-card-top"><span class="tool-card-name">Refactor</span> <span class="tool-card-cmd">sally refactor [file]</span></div>
            <div class="tool-card-desc">I don't tell you your code 'could be cleaner' and leave you guessing &mdash; I show you the before, I show you the after, and I explain why one of them is going to haunt your 3am on-call rotation.</div>
          </div>
        </div>
        <div class="tool-card">
          <img src="/tool-prreview.png" alt="PR Review">
          <div class="tool-card-body">
            <div class="tool-card-top"><span class="tool-card-name">PR Review</span> <span class="tool-card-cmd">sally review-pr [pr]</span></div>
            <div class="tool-card-desc">I review your PR like a senior engineer who has time, opinions, and absolutely no reason to be polite about that nested ternary you snuck in on line 47.</div>
          </div>
        </div>
        <div class="tool-card">
          <img src="/tool-brainstorm.png" alt="Brainstorm">
          <div class="tool-card-body">
            <div class="tool-card-top"><span class="tool-card-name">Brainstorm</span> <span class="tool-card-cmd">sally brainstorm ["idea"]</span></div>
            <div class="tool-card-desc">Pitch me your architecture idea and I'll tell you the three ways it falls apart at scale before you've written a single line of code &mdash; consider it cheaper than a post-mortem.</div>
          </div>
        </div>
        <div class="tool-card">
          <img src="/tool-frontend.png" alt="Frontend Review">
          <div class="tool-card-body">
            <div class="tool-card-top"><span class="tool-card-name">Frontend Review</span> <span class="tool-card-cmd">sally frontend [file]</span></div>
            <div class="tool-card-desc">I'll tell you why your component re-renders on every keystroke, why your z-index is load-bearing, and why no, that is not how CSS specificity works.</div>
          </div>
        </div>
        <div class="tool-card">
          <img src="/tool-marketing.png" alt="Marketing Review">
          <div class="tool-card-body">
            <div class="tool-card-top"><span class="tool-card-name">Marketing Review</span> <span class="tool-card-cmd">sally marketing ["copy"]</span></div>
            <div class="tool-card-desc">Run your copy by me before your customers do, because they won't be this constructive about it.</div>
          </div>
        </div>
      </div>
      <a href="https://github.com/w1ckedxt/cynicalsally-cli" target="_blank">Get Sally CLI &rarr;</a>
    </div>

    <div class="footer">
      <p>Powered by <a href="https://cynicalsally.com" target="_blank">CynicalSally</a> &middot; Running on <a href="https://render.com" target="_blank">Render</a></p>
    </div>
  </div>

  <script>
    async function roast() {
      const code = document.getElementById('code').value.trim();
      const filename = document.getElementById('filename').value.trim();
      const btn = document.getElementById('roastBtn');
      const status = document.getElementById('status');
      const results = document.getElementById('results');

      if (!code) {
        status.textContent = 'Paste some code first.';
        status.className = 'status error';
        return;
      }

      btn.disabled = true;
      status.textContent = 'Sally is judging your code...';
      status.className = 'status';
      results.className = 'results';

      try {
        const res = await fetch('/api/review', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ code, filename }),
        });

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || 'Something went wrong');
        }

        renderResult(data);
        showQuota(data.quota);
        results.className = 'results visible';
        results.scrollIntoView({ behavior: 'smooth', block: 'start' });
        status.textContent = '';
      } catch (err) {
        status.textContent = err.message;
        status.className = 'status error';
      } finally {
        btn.disabled = false;
      }
    }

    function renderResult(data) {
      const { data: d, voice, meta } = data;

      // Score
      const score = d.score;
      const badge = document.getElementById('scoreBadge');
      badge.textContent = score + '/10';
      badge.className = 'score-badge ' + (score < 4 ? 'score-low' : score < 7 ? 'score-mid' : 'score-high');
      document.getElementById('scoreBar').style.width = (score * 10) + '%';

      // Roast
      document.getElementById('roastText').innerHTML = voice.roast
        .split('\\n\\n')
        .map(p => '<p style="margin-bottom:0.75rem">' + escapeHtml(p) + '</p>')
        .join('');

      // Issues
      const issuesList = document.getElementById('issuesList');
      issuesList.innerHTML = '';
      if (d.issues && d.issues.length > 0) {
        d.issues.forEach(issue => {
          const sevClass = issue.severity === 'critical' ? 'sev-critical' : issue.severity === 'major' ? 'sev-major' : 'sev-minor';
          issuesList.innerHTML += '<div class="issue">'
            + '<div class="issue-header">'
            + '<span class="severity ' + sevClass + '">' + escapeHtml(issue.severity) + '</span>'
            + '<span class="issue-title">' + escapeHtml(issue.title) + '</span>'
            + '</div>'
            + (issue.description ? '<div class="issue-desc">' + escapeHtml(issue.description) + '</div>' : '')
            + (issue.fix ? '<div class="issue-fix">&#10003; ' + escapeHtml(issue.fix) + '</div>' : '')
            + '</div>';
        });
      }

      // Fixes
      const fixesList = document.getElementById('fixesList');
      fixesList.innerHTML = '';
      if (d.actionable_fixes && d.actionable_fixes.length > 0) {
        d.actionable_fixes.forEach(fix => {
          fixesList.innerHTML += '<div class="issue" style="border-left:2px solid #22c55e">&#10003; ' + escapeHtml(fix) + '</div>';
        });
      }

      // Bright side + sneer
      document.getElementById('brightSide').textContent = voice.bright_side || '';
      document.getElementById('hardestSneer').textContent = voice.hardest_sneer || '';
    }

    function showQuota(quota) {
      const bar = document.getElementById('quotaBar');
      const badge = document.getElementById('quotaBadge');
      const count = document.getElementById('quotaCount');
      if (!quota || quota.remaining === undefined) return;

      const remaining = Math.max(0, quota.remaining);
      const limit = quota.limit;
      count.textContent = remaining + '/' + limit + ' reviews left today';
      badge.className = remaining === 0 ? 'quota-badge exhausted' : 'quota-badge';
      bar.className = 'quota-bar visible';
    }

    function escapeHtml(text) {
      const div = document.createElement('div');
      div.textContent = text;
      return div.innerHTML;
    }

    // Tab support in textarea
    document.getElementById('code').addEventListener('keydown', function(e) {
      if (e.key === 'Tab') {
        e.preventDefault();
        const start = this.selectionStart;
        const end = this.selectionEnd;
        this.value = this.value.substring(0, start) + '  ' + this.value.substring(end);
        this.selectionStart = this.selectionEnd = start + 2;
      }
    });
  </script>
</body>
</html>`;
