const GITHUB_TOKEN = process.env.GITHUB_TOKEN || "";
const GITHUB_CACHE_TTL = 10 * 60 * 1000; // 10 minutes
const MAX_GITHUB_FILES = 10;
const MAX_FILE_SIZE = 30 * 1024; // 30KB per file
const CODE_EXTENSIONS = new Set([
  ".js", ".ts", ".tsx", ".jsx", ".py", ".rb", ".go", ".rs", ".java",
  ".c", ".cpp", ".h", ".cs", ".php", ".swift", ".kt", ".scala",
  ".vue", ".svelte", ".css", ".scss", ".html", ".sql", ".sh",
  ".yaml", ".yml", ".json", ".toml", ".env.example",
]);
const ghCache = new Map(); // key → { data, expiry }

export function parseGitHubUrl(url) {
  // Supports: github.com/owner/repo, github.com/owner/repo/tree/branch/path
  const match = url.match(/github\.com\/([^/]+)\/([^/]+)/);
  if (!match) return null;
  const owner = match[1];
  const repo = match[2].replace(/\.git$/, "");
  // Extract optional path from /tree/branch/path
  const treeParts = url.match(/\/tree\/[^/]+\/(.+)/);
  const path = treeParts ? treeParts[1] : "";
  return { owner, repo, path };
}

export async function fetchGitHubFiles(owner, repo, path) {
  const cacheKey = `${owner}/${repo}/${path || ""}`;
  const cached = ghCache.get(cacheKey);
  if (cached && cached.expiry > Date.now()) {
    console.log(`GitHub cache hit: ${cacheKey}`);
    return cached.data;
  }

  const ghHeaders = { "Accept": "application/vnd.github+json", "User-Agent": "SallyLite/1.0" };
  if (GITHUB_TOKEN) ghHeaders["Authorization"] = `Bearer ${GITHUB_TOKEN}`;

  // Step 1: get default branch
  const repoRes = await fetch(`https://api.github.com/repos/${owner}/${repo}`, { headers: ghHeaders });
  if (!repoRes.ok) {
    if (repoRes.status === 404) throw new Error("Repository not found. Make sure it's public.");
    if (repoRes.status === 403) {
      const remaining = repoRes.headers.get("x-ratelimit-remaining");
      const resetEpoch = repoRes.headers.get("x-ratelimit-reset");
      const resetMin = resetEpoch ? Math.ceil((Number(resetEpoch) * 1000 - Date.now()) / 60000) : "?";
      console.warn(`GitHub 403 — rate limit hit. Remaining: ${remaining}, resets in ${resetMin}m`);
      throw new Error(`GitHub rate limit exceeded. Try again in ~${resetMin} minutes.`);
    }
    throw new Error(`GitHub API error: ${repoRes.status}`);
  }
  const rlRemaining = repoRes.headers.get("x-ratelimit-remaining");
  if (rlRemaining !== null) console.log(`GitHub rate limit remaining: ${rlRemaining}`);
  const repoData = await repoRes.json();
  const branch = repoData.default_branch || "main";

  // Step 2: get file tree
  const treeRes = await fetch(
    `https://api.github.com/repos/${owner}/${repo}/git/trees/${branch}?recursive=1`,
    { headers: ghHeaders },
  );

  if (!treeRes.ok) {
    if (treeRes.status === 403) {
      const resetEpoch = treeRes.headers.get("x-ratelimit-reset");
      const resetMin = resetEpoch ? Math.ceil((Number(resetEpoch) * 1000 - Date.now()) / 60000) : "?";
      throw new Error(`GitHub rate limit exceeded. Try again in ~${resetMin} minutes.`);
    }
    throw new Error(`Could not read repository tree (${treeRes.status}).`);
  }

  const treeData = await treeRes.json();
  if (!treeData.tree) throw new Error("Could not read repository tree.");

  // Filter to code files, skip large ones, respect path prefix
  const codeFiles = treeData.tree
    .filter((f) => {
      if (f.type !== "blob") return false;
      if (f.size > MAX_FILE_SIZE) return false;
      if (path && !f.path.startsWith(path)) return false;
      const ext = "." + f.path.split(".").pop();
      return CODE_EXTENSIONS.has(ext);
    })
    .sort((a, b) => b.size - a.size) // prioritize larger (more interesting) files
    .slice(0, MAX_GITHUB_FILES);

  if (codeFiles.length === 0) throw new Error("No code files found in this repository.");

  // Step 3: fetch each file's raw content
  const files = await Promise.all(
    codeFiles.map(async (f) => {
      const rawUrl = `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/${f.path}`;
      const rawRes = await fetch(rawUrl, { headers: { "User-Agent": "SallyLite/1.0" } });
      if (!rawRes.ok) return null;
      const content = await rawRes.text();
      return { path: f.path, content };
    })
  );

  const result = files.filter(Boolean);
  ghCache.set(cacheKey, { data: result, expiry: Date.now() + GITHUB_CACHE_TTL });
  // Evict old entries to prevent memory leak
  if (ghCache.size > 500) {
    const now = Date.now();
    for (const [k, v] of ghCache) { if (v.expiry < now) ghCache.delete(k); }
  }
  return result;
}
