import { createServer } from "node:http";
import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { parseGitHubUrl, fetchGitHubFiles } from "./lib/github.js";
import { buildHtml } from "./lib/html.js";

// --- Config ---

const PORT = process.env.PORT || 3000;
const SALLY_API_URL = process.env.SALLY_API_URL || "https://cynicalsally-web.onrender.com";
const MAX_CODE_LENGTH = 500 * 1024; // 500KB max paste
const INSTANCE_DEVICE_ID = `lite-${createHash("sha256").update(SALLY_API_URL + "-sally-lite").digest("hex").slice(0, 16)}`;

// --- Assets ---

const BANNER = readFileSync(new URL("./assets/sally-banner.png", import.meta.url));
const PIXEL_SALLY = readFileSync(new URL("./assets/pixelsally-cursedqueen.png", import.meta.url));
const SALLY_HEAD = readFileSync(new URL("./assets/sally-head.png", import.meta.url));
const FULLSUITE_BANNER = readFileSync(new URL("./assets/fullsuitebanner.png", import.meta.url));
const SALLY_RENDER = readFileSync(new URL("./assets/SALLYXRENDER.png", import.meta.url));
const FAVICON = readFileSync(new URL("./assets/favicon.ico", import.meta.url));
const TOOL_IMAGES = {
  "brainstorm": readFileSync(new URL("./assets/FULL-SUITE-BRAINSTORM.png", import.meta.url)),
  "explain": readFileSync(new URL("./assets/FULL-SUITE-EXPLAIN.png", import.meta.url)),
  "refactor": readFileSync(new URL("./assets/FULL-SUITE-REFACTOR.png", import.meta.url)),
  "frontend": readFileSync(new URL("./assets/FULL-SUITE-FRONTENDREVIEW.png", import.meta.url)),
  "marketing": readFileSync(new URL("./assets/FULL-SUITE-MARKETINGREVIEW.png", import.meta.url)),
  "prreview": readFileSync(new URL("./assets/FULL-SUITE-PRREVIEW.png", import.meta.url)),
};

const HTML = buildHtml(SALLY_API_URL);

// --- Helpers ---

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
  const name = filename || "paste.txt";
  return [{ path: name, content: code }];
}

function looksLikeCode(text) {
  const trimmed = text.trim();
  if (trimmed.length < 10) return false;

  // Prompt injection / jailbreak patterns
  const suspicious = [
    /ignore (all |any )?(previous |prior |above )?instructions/i,
    /you are now/i,
    /act as/i,
    /pretend (you|to be)/i,
    /system prompt/i,
    /reveal your/i,
    /disregard/i,
    /new instructions/i,
    /forget (everything|your|all)/i,
  ];
  if (suspicious.some((p) => p.test(trimmed))) return false;

  // Code signals — at least 2 of these should match
  const signals = [
    /[{}\[\]();]/.test(trimmed),                      // brackets, parens, semicolons
    /\b(function|const|let|var|class|import|export|return|if|else|for|while|def|fn|pub|async|await)\b/.test(trimmed),
    /[=!<>]=|=>|->|\+\+|--/.test(trimmed),            // operators
    /^\s{2,}/m.test(trimmed),                          // indentation
    /\/\/|\/\*|#\s|"""|'''/.test(trimmed),             // comments
    /\.\w+\(/.test(trimmed),                           // method calls
    /\b(null|nil|None|true|false|undefined)\b/.test(trimmed),
  ];
  const score = signals.filter(Boolean).length;
  return score >= 2;
}

// --- Server ---

const server = createServer(async (req, res) => {
  // Health check
  if (req.method === "GET" && req.url === "/health") {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ status: "ok" }));
    return;
  }

  // Serve favicon
  if (req.method === "GET" && req.url === "/favicon.ico") {
    res.writeHead(200, { "Content-Type": "image/x-icon", "Cache-Control": "public, max-age=604800" });
    res.end(FAVICON);
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

  // Serve fullsuite banner
  if (req.method === "GET" && req.url === "/fullsuitebanner.png") {
    res.writeHead(200, { "Content-Type": "image/png", "Cache-Control": "public, max-age=86400" });
    res.end(FULLSUITE_BANNER);
    return;
  }

  // Serve Sally x Render image
  if (req.method === "GET" && req.url === "/sallyxrender.png") {
    res.writeHead(200, { "Content-Type": "image/png", "Cache-Control": "public, max-age=86400" });
    res.end(SALLY_RENDER);
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

  // Quips proxy (cached by browser for 1hr)
  if (req.method === "GET" && req.url?.startsWith("/api/quips")) {
    try {
      const apiRes = await fetch(`${SALLY_API_URL}/api/v1/quips?type=code`, {
        headers: { "User-Agent": "SallyLite/1.0" },
      });
      const text = await apiRes.text();
      const result = JSON.parse(text);
      res.writeHead(200, { "Content-Type": "application/json", "Cache-Control": "public, max-age=3600" });
      res.end(JSON.stringify(result));
    } catch {
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ quips: ["Sally is thinking..."] }));
    }
    return;
  }

  // API proxy — code paste review
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

      if (!looksLikeCode(code)) {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "not_code", redirect: "https://cynicalsally.com" }));
        return;
      }

      const files = splitCodeToFiles(code, filename);

      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 120000);
      const apiRes = await fetch(`${SALLY_API_URL}/api/v1/review`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: controller.signal,
        body: JSON.stringify({
          files,
          mode: "quick",
          deviceId: INSTANCE_DEVICE_ID,
          target: filename || "paste",
          lang: lang || "en",
          tone: tone || "cynical",
        }),
      });
      clearTimeout(timeout);

      const responseText = await apiRes.text();
      let result;
      try {
        result = JSON.parse(responseText);
      } catch {
        console.error(`[review proxy] Sally API returned non-JSON (status ${apiRes.status}): ${responseText.slice(0, 200)}`);
        res.writeHead(502, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Sally's backend returned an unexpected response. Try again in a moment." }));
        return;
      }
      res.writeHead(apiRes.status, { "Content-Type": "application/json" });
      res.end(JSON.stringify(result));
    } catch (err) {
      console.error("[review proxy]", err.message);
      const msg = err.name === "AbortError"
        ? "Sally is taking too long. Try again in a moment."
        : err.message?.includes("not valid JSON") || err.message?.includes("Unexpected token")
          ? "Sally's backend returned an unexpected response. Try again in a moment."
          : "Something went wrong. Try again.";
      res.writeHead(500, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: msg }));
    }
    return;
  }

  // API proxy — GitHub repo review
  if (req.method === "POST" && req.url === "/api/review-github") {
    try {
      const body = JSON.parse(await parseBody(req));
      const { url, lang, tone } = body;

      if (!url || typeof url !== "string") {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Paste a GitHub URL first." }));
        return;
      }

      const parsed = parseGitHubUrl(url);
      if (!parsed) {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "That doesn't look like a GitHub URL. Try github.com/owner/repo" }));
        return;
      }

      const files = await fetchGitHubFiles(parsed.owner, parsed.repo, parsed.path);
      console.log(`[github review] Fetched ${files.length} files from ${parsed.owner}/${parsed.repo}`);

      // Trim total payload
      const GITHUB_PAYLOAD_LIMIT = 200 * 1024;
      let totalSize = 0;
      const trimmedFiles = [];
      for (const f of files) {
        if (totalSize + f.content.length > GITHUB_PAYLOAD_LIMIT) break;
        trimmedFiles.push(f);
        totalSize += f.content.length;
      }
      console.log(`[github review] Sending ${trimmedFiles.length} files (${Math.round(totalSize / 1024)}KB)`);

      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 120000);
      const apiRes = await fetch(`${SALLY_API_URL}/api/v1/review`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: controller.signal,
        body: JSON.stringify({
          files: trimmedFiles,
          mode: "quick",
          deviceId: INSTANCE_DEVICE_ID,
          target: `${parsed.owner}/${parsed.repo}`,
          lang: lang || "en",
          tone: tone || "cynical",
        }),
      });
      clearTimeout(timeout);

      const responseText = await apiRes.text();
      let result;
      try {
        result = JSON.parse(responseText);
      } catch {
        console.error(`[github review] Sally API returned non-JSON (status ${apiRes.status}): ${responseText.slice(0, 200)}`);
        res.writeHead(502, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Sally's backend returned an unexpected response. Try again in a moment." }));
        return;
      }
      res.writeHead(apiRes.status, { "Content-Type": "application/json" });
      res.end(JSON.stringify(result));
    } catch (err) {
      console.error("[github review] Error:", err);
      const msg = err.name === "AbortError"
        ? "Sally is taking too long. Try again in a moment."
        : err.message?.includes("not valid JSON") || err.message?.includes("Unexpected token")
          ? "Sally's backend returned an unexpected response. Try again in a moment."
          : (err.message || "Something went wrong. Try again.");
      const code = err.message?.includes("not found") ? 404 : 500;
      res.writeHead(code, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: msg }));
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
