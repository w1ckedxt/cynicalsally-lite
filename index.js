#!/usr/bin/env node

/**
 * Sally Lite — Thin client for AI code review.
 * Collects files, calls the CynicalSally backend, displays results.
 * Contains NO prompts, NO AI logic — purely a client.
 */

import { program } from "commander";
import chalk from "chalk";
import ora from "ora";
import { readFileSync, readdirSync, statSync, existsSync, mkdirSync, writeFileSync } from "node:fs";
import { join, relative, resolve, basename, extname } from "node:path";
import { homedir } from "node:os";
import { randomUUID } from "node:crypto";

// --- Config (device ID persistence) ---

const CONFIG_DIR = join(homedir(), ".sally");
const CONFIG_FILE = join(CONFIG_DIR, "config.json");

function getDeviceId() {
  try {
    if (existsSync(CONFIG_FILE)) {
      const config = JSON.parse(readFileSync(CONFIG_FILE, "utf-8"));
      if (config.device_id) return config.device_id;
    }
  } catch { /* ignore */ }

  const id = randomUUID();
  try {
    mkdirSync(CONFIG_DIR, { recursive: true });
    writeFileSync(CONFIG_FILE, JSON.stringify({ device_id: id }, null, 2), { mode: 0o600 });
  } catch { /* ignore */ }
  return id;
}

// --- File collection ---

const SKIP_DIRS = new Set([
  "node_modules", ".git", ".next", ".vercel", ".turbo",
  "dist", "build", "out", ".cache", ".parcel-cache",
  "__pycache__", ".pytest_cache", ".mypy_cache",
  ".gradle", ".idea", ".vscode", "coverage",
  "vendor", "target", "bin", "obj",
]);

const SKIP_EXTENSIONS = new Set([
  ".png", ".jpg", ".jpeg", ".gif", ".webp", ".svg", ".ico", ".bmp",
  ".mp4", ".mp3", ".wav", ".avi", ".mov", ".flac",
  ".woff", ".woff2", ".ttf", ".otf", ".eot",
  ".zip", ".tar", ".gz", ".rar", ".7z",
  ".exe", ".dll", ".so", ".dylib", ".bin",
  ".pdf", ".doc", ".docx", ".xls", ".xlsx",
  ".lock", ".lockb",
  ".map", ".min.js", ".min.css",
]);

const MAX_FILES = 50;
const MAX_FILE_SIZE = 100 * 1024; // 100KB

function loadGitignore(dir) {
  const gitignorePath = join(dir, ".gitignore");
  if (!existsSync(gitignorePath)) return () => false;

  try {
    const lines = readFileSync(gitignorePath, "utf-8")
      .split("\n")
      .map((l) => l.trim())
      .filter((l) => l && !l.startsWith("#"));

    return (filePath) => {
      const rel = relative(dir, filePath);
      return lines.some((pattern) => {
        const clean = pattern.replace(/\/$/, "");
        if (rel === clean || rel.startsWith(clean + "/")) return true;
        if (basename(rel) === clean) return true;
        return false;
      });
    };
  } catch {
    return () => false;
  }
}

function isBinary(content) {
  const sample = content.slice(0, 512);
  return sample.includes("\0");
}

function collectFiles(dir) {
  const rootDir = resolve(dir);
  const isIgnored = loadGitignore(rootDir);
  const files = [];

  function walk(currentDir) {
    if (files.length >= MAX_FILES) return;

    let entries;
    try {
      entries = readdirSync(currentDir);
    } catch {
      return;
    }

    for (const entry of entries) {
      if (files.length >= MAX_FILES) break;

      const fullPath = join(currentDir, entry);
      let stat;
      try {
        stat = statSync(fullPath);
      } catch {
        continue;
      }

      if (stat.isDirectory()) {
        if (SKIP_DIRS.has(entry)) continue;
        if (isIgnored(fullPath)) continue;
        walk(fullPath);
        continue;
      }

      if (!stat.isFile()) continue;
      if (stat.size > MAX_FILE_SIZE) continue;
      if (stat.size === 0) continue;
      if (SKIP_EXTENSIONS.has(extname(entry).toLowerCase())) continue;
      if (entry.startsWith(".")) continue;
      if (isIgnored(fullPath)) continue;

      try {
        const content = readFileSync(fullPath, "utf-8");
        if (isBinary(content)) continue;
        files.push({ path: relative(rootDir, fullPath), content });
      } catch {
        continue;
      }
    }
  }

  walk(rootDir);
  return files;
}

// --- Output formatting ---

function scoreColor(score) {
  if (score < 4) return chalk.red;
  if (score < 7) return chalk.yellow;
  return chalk.green;
}

function scoreBar(score) {
  const filled = Math.round(score);
  const empty = 10 - filled;
  return chalk.magenta("█".repeat(filled)) + chalk.gray("░".repeat(empty));
}

function severityColor(severity) {
  if (severity === "critical") return chalk.red;
  if (severity === "major") return chalk.yellow;
  return chalk.gray;
}

function displayResult(result) {
  const { data, voice, meta } = result;

  console.log();
  console.log(chalk.magenta("  ☠  SALLY'S CODE REVIEW"));
  console.log(chalk.gray(`  ${meta.mode === "quick" ? "Quick Roast" : "Full Truth"} • ${meta.files_reviewed} file${meta.files_reviewed === 1 ? "" : "s"} reviewed`));
  console.log();

  // Score
  const color = scoreColor(data.score);
  console.log(`  Score: ${color(`${data.score}/10`)} [${scoreBar(data.score)}]`);
  console.log(chalk.gray("  " + "─".repeat(50)));
  console.log();

  // Roast
  if (voice.roast) {
    const paragraphs = voice.roast.split("\n\n");
    for (const p of paragraphs) {
      console.log(`  ${chalk.white(p)}`);
      console.log();
    }
  }

  // Issues
  if (data.issues && data.issues.length > 0) {
    console.log(chalk.gray("  " + "─".repeat(50)));
    console.log(chalk.magenta("  TOP ISSUES"));
    console.log();

    data.issues.forEach((issue, i) => {
      const sColor = severityColor(issue.severity);
      console.log(`  ${chalk.white(`${i + 1}.`)} ${sColor(issue.severity.toUpperCase())} ${chalk.gray(issue.issue_code)}`);
      console.log(`     ${chalk.white(issue.title)}`);
      if (issue.description) {
        console.log(`     ${chalk.gray(issue.description)}`);
      }
      if (issue.evidence && issue.evidence.length > 0) {
        for (const e of issue.evidence) {
          console.log(`     ${chalk.cyan("→")} ${chalk.gray(e)}`);
        }
      }
      if (issue.fix) {
        console.log(`     ${chalk.green("✓")} ${chalk.gray(issue.fix)}`);
      }
      console.log();
    });
  }

  // Actionable fixes
  if (data.actionable_fixes && data.actionable_fixes.length > 0) {
    console.log(chalk.gray("  " + "─".repeat(50)));
    console.log(chalk.magenta("  ACTIONABLE FIXES"));
    console.log();
    for (const fix of data.actionable_fixes) {
      console.log(`  ${chalk.green("✓")} ${chalk.gray(fix)}`);
    }
    console.log();
  }

  // Bright side + hardest sneer
  console.log(chalk.gray("  " + "─".repeat(50)));
  if (voice.bright_side) {
    console.log(`  ${chalk.green("✨")} ${chalk.gray(voice.bright_side)}`);
  }
  if (voice.hardest_sneer) {
    console.log(`  ${chalk.red("🔥")} ${chalk.gray(voice.hardest_sneer)}`);
  }
  console.log();

  // Quota info
  if (result.quota && result.quota.remaining !== undefined) {
    const remaining = result.quota.remaining === Infinity ? "unlimited" : result.quota.remaining;
    console.log(chalk.gray(`  Reviews remaining: ${remaining}`));
    console.log();
  }
}

// --- API call ---

async function submitReview(files, mode, deviceId, lang, tone) {
  const apiUrl = process.env.SALLY_API_URL || "https://cynicalsally-web.onrender.com";
  const url = `${apiUrl}/api/v1/review`;

  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ files, mode, deviceId, lang, tone }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: "Unknown error" }));
    throw new Error(error.error || `HTTP ${response.status}`);
  }

  return response.json();
}

// --- CLI ---

program
  .name("sally")
  .description("Sally Lite — AI code reviewer with zero filter")
  .version("1.0.0");

program
  .command("roast")
  .description("Roast your code. No mercy.")
  .argument("[paths...]", "Files or directories to review", ["."])
  .option("-m, --mode <mode>", "Review mode: quick or full_truth", "quick")
  .option("-t, --tone <tone>", "Sally's mood: cynical, neutral, professional", "cynical")
  .option("-l, --lang <lang>", "Language code", "en")
  .option("--json", "Output raw JSON (for CI/piping)")
  .option("--fail-under <score>", "Exit code 1 if score below threshold", parseFloat)
  .action(async (paths, options) => {
    const deviceId = getDeviceId();

    // Collect files from all paths
    const spinner = ora({
      text: chalk.gray("Collecting files..."),
      color: "magenta",
    }).start();

    let allFiles = [];
    for (const p of paths) {
      const resolved = resolve(p);
      try {
        const stat = statSync(resolved);
        if (stat.isDirectory()) {
          allFiles = allFiles.concat(collectFiles(resolved));
        } else if (stat.isFile()) {
          const content = readFileSync(resolved, "utf-8");
          if (!isBinary(content) && content.length <= MAX_FILE_SIZE) {
            allFiles.push({ path: relative(process.cwd(), resolved), content });
          }
        }
      } catch (err) {
        spinner.fail(chalk.red(`Cannot read: ${p}`));
        process.exit(1);
      }
    }

    if (allFiles.length === 0) {
      spinner.fail(chalk.red("No files found to review."));
      process.exit(1);
    }

    // Cap at MAX_FILES
    if (allFiles.length > MAX_FILES) {
      allFiles = allFiles.slice(0, MAX_FILES);
    }

    spinner.text = chalk.gray(`Sending ${allFiles.length} file${allFiles.length === 1 ? "" : "s"} to Sally...`);

    try {
      const result = await submitReview(
        allFiles,
        options.mode,
        deviceId,
        options.lang,
        options.tone,
      );

      spinner.stop();

      if (options.json) {
        console.log(JSON.stringify(result, null, 2));
      } else {
        displayResult(result);
      }

      // Exit code for CI
      if (options.failUnder && result.data?.score < options.failUnder) {
        console.log(chalk.red(`  Score ${result.data.score} is below threshold ${options.failUnder}`));
        process.exit(1);
      }
    } catch (err) {
      spinner.fail(chalk.red(err.message));

      if (err.message.includes("monthly review limit") || err.message.includes("SuperClub")) {
        console.log();
        console.log(chalk.magenta("  Want unlimited code reviews?"));
        console.log(chalk.gray("  → https://cynicalsally.com/superclub"));
        console.log();
      }

      process.exit(1);
    }
  });

program.parse();
