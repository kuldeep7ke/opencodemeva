import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { bundleDir, findMemoryBinary, opencodeConfigDir } from "./paths.js";
import { deepMerge, mergePluginArrays } from "./merge.js";

const MANIFEST_FILE = "opencodemeva.manifest.json";
const BACKUP_DIR = ".opencodemeva-backups";

export const OPTS_DIR = path.join(bundleDir(), "options");
export const BUNDLE_OPENCODE = path.join(OPTS_DIR, "opencode.json");
export const BUNDLE_AGENTS = path.join(OPTS_DIR, "AGENTS.md");

export function manifestPath(configDir = opencodeConfigDir()) {
  return path.join(configDir, MANIFEST_FILE);
}

function hash(content) {
  return crypto.createHash("sha256").update(content).digest("hex");
}

function manifestExists(configDir) {
  return fs.existsSync(manifestPath(configDir));
}

function readManifest(configDir) {
  try {
    return JSON.parse(fs.readFileSync(manifestPath(configDir), "utf8"));
  } catch {
    return null;
  }
}

export function loadBundleConfig() {
  return JSON.parse(fs.readFileSync(BUNDLE_OPENCODE, "utf8"));
}

export function loadUserConfig(configDir) {
  const p = path.join(configDir, "opencode.json");
  if (!fs.existsSync(p)) return {};
  const raw = fs.readFileSync(p, "utf8");
  try {
    return JSON.parse(raw);
  } catch {
    // Real-world opencode.json files often carry // or /* */ comments.
    try {
      return JSON.parse(stripJsonComments(raw));
    } catch {
      throw new Error(`Existing config is not valid JSON: ${p}`);
    }
  }
}

// Strip // line comments and /* block comments, leaving string literals
// (including comment-like sequences inside quotes) untouched.
export function stripJsonComments(src) {
  let out = "";
  let i = 0;
  let inStr = false;
  let esc = false;
  while (i < src.length) {
    const c = src[i];
    const next = src[i + 1];
    if (inStr) {
      out += c;
      if (esc) esc = false;
      else if (c === "\\") esc = true;
      else if (c === '"') inStr = false;
      i++;
      continue;
    }
    if (c === '"') { inStr = true; out += c; i++; continue; }
    if (c === "/" && next === "/") {
      while (i < src.length && src[i] !== "\n") i++;
      continue;
    }
    if (c === "/" && next === "*") {
      i += 2;
      while (i < src.length && !(src[i] === "*" && src[i + 1] === "/")) i++;
      i += 2;
      continue;
    }
    out += c;
    i++;
  }
  return out;
}

// Only copy the option categories we ship. Never README / guides / memory.
const COPY_DIRS = ["agents", "commands", "skills", "plugins"];

function categoryOf(srcPath) {
  const rel = path.relative(OPTS_DIR, srcPath);
  const top = rel.split(path.sep)[0];
  return COPY_DIRS.includes(top) ? top : null;
}

export function listBundleFiles() {
  const files = [];
  function walk(dir) {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) walk(full);
      else files.push(full);
    }
  }
  walk(OPTS_DIR);
  return files.filter((f) => categoryOf(f) !== null && !f.endsWith(MANIFEST_FILE));
}

export function mergedConfig(userConfig, bundleConfig) {
  // Bundle provides defaults; user config always wins on leaf conflicts.
  const base = deepMerge(JSON.parse(JSON.stringify(bundleConfig)), userConfig);

  // mcp: per-server merge; if the user defines a server with the same name,
  // their entire definition wins. Bundle servers fill missing names only.
  if (isPlainObjectSafe(bundleConfig.mcp) || isPlainObjectSafe(userConfig.mcp)) {
    const out = { ...(userConfig.mcp || {}) };
    for (const [name, def] of Object.entries(bundleConfig.mcp || {})) {
      if (out[name] === undefined) out[name] = def;
    }
    base.mcp = out;
  }

  // plugin: union of both lists, bundle entries first (they are installed).
  base.plugin = mergePluginArrays(bundleConfig.plugin, userConfig.plugin);

  return base;
}

function isPlainObjectSafe(v) {
  return v !== null && typeof v === "object" && !Array.isArray(v);
}

export function patchMemoryBinary(cfg) {
  const bin = findMemoryBinary();
  if (!bin || !cfg.mcp || !cfg.mcp.memory || !Array.isArray(cfg.mcp.memory.command)) return cfg;
  // Only auto-patch the bundle's placeholder server; never touch a
  // user-defined memory server (it stays exactly as the user configured).
  // The placeholder command is never a valid binary, so patch it whether
  // the entry is enabled or not; preserve an explicit enabled:true.
  const placeholder = JSON.stringify(cfg.mcp.memory.command) === JSON.stringify(["codebase-memory-mcp"]);
  if (placeholder) {
    cfg.mcp = { ...cfg.mcp, memory: { ...cfg.mcp.memory, command: [bin], enabled: true } };
  }
  return cfg;
}

export function planInstall({ configDir = opencodeConfigDir(), overwrite = false } = {}) {
  const actions = [];
  const bundleFiles = listBundleFiles();
  for (const src of bundleFiles) {
    const rel = path.relative(OPTS_DIR, src);
    const dest = path.join(configDir, rel);
    const exists = fs.existsSync(dest);
    const same = exists && hash(fs.readFileSync(dest)) === hash(fs.readFileSync(src));
    if (exists && !same) {
      actions.push({ kind: overwrite ? "overwrite" : "skip", rel, src, dest, exists: true });
    } else {
      actions.push({ kind: exists && same ? "same" : "copy", rel, src, dest, exists });
    }
  }
  return actions;
}

export function install({ configDir = opencodeConfigDir(), overwrite = false, backup = true, dryRun = false } = {}) {
  const logs = [];
  const log = (msg) => (dryRun ? logs.push(`[dry-run] ${msg}`) : logs.push(msg));

  fs.mkdirSync(configDir, { recursive: true });

  // 1. Backup existing opencode.json before we touch it. First install wins:
  // when a manifest already exists, the original backup (if any) is already
  // recorded there — never back up our own generated output over it.
  const userCfgPath = path.join(configDir, "opencode.json");
  const backupPath = path.join(configDir, BACKUP_DIR, "opencode.json.bak");
  const prevManifest = manifestExists(configDir) && !dryRun ? readManifest(configDir) : null;
  let restoredOnUninstall = null;
  if (backup && fs.existsSync(userCfgPath) && !dryRun && !prevManifest) {
    fs.mkdirSync(path.dirname(backupPath), { recursive: true });
    if (!fs.existsSync(backupPath)) {
      fs.copyFileSync(userCfgPath, backupPath);
      log(`backed up ${userCfgPath} -> ${backupPath}`);
    } else {
      log(`backup already exists: ${backupPath} (kept)`);
    }
    restoredOnUninstall = backupPath;
  }

  // 2. Merge opencode.json (user config wins), then enable memory binary if found.
  const hadUserConfigBefore = fs.existsSync(userCfgPath);
  const userCfg0 = loadUserConfig(configDir);
  const merged = mergedConfig(userCfg0, loadBundleConfig());
  const patched = patchMemoryBinary(merged);
  const next = JSON.stringify(patched, null, 2) + "\n";
  let agentsInstalled = false;

  if (!dryRun) {
    fs.mkdirSync(path.join(configDir, "agents"), { recursive: true });
    fs.mkdirSync(path.join(configDir, "commands"), { recursive: true });
    fs.mkdirSync(path.join(configDir, "skills"), { recursive: true });
    fs.mkdirSync(path.join(configDir, "plugins"), { recursive: true });
    fs.writeFileSync(userCfgPath, next);
    if (fs.existsSync(BUNDLE_AGENTS)) {
      const destAgents = path.join(configDir, "AGENTS.md");
      if (!fs.existsSync(destAgents)) {
        fs.copyFileSync(BUNDLE_AGENTS, destAgents);
        agentsInstalled = true;
        log(`installed ${destAgents}`);
      } else if (overwrite) {
        const pre = path.join(configDir, BACKUP_DIR, "AGENTS.md");
        fs.mkdirSync(path.dirname(pre), { recursive: true });
        if (!fs.existsSync(pre)) fs.copyFileSync(destAgents, pre);
        fs.copyFileSync(BUNDLE_AGENTS, destAgents);
        agentsInstalled = true;
        log(`overwrite: AGENTS.md (previous copy kept at ${pre})`);
      } else {
        log("skipped existing AGENTS.md (kept user copy)");
      }
    }
  } else {
    const before = loadUserConfig(configDir);
    const changedKeys = Object.keys(patched).filter((k) => JSON.stringify(before[k]) !== JSON.stringify(patched[k]));
    log(`would write opencode.json (keys changed/added: ${changedKeys.join(", ") || "none"})`);
    log(`AGENTS.md: ${fs.existsSync(path.join(configDir, "AGENTS.md")) ? "exists (keep)" : "would install"}`);
  }

  // 3. Copy curated option files.
  const actions = planInstall({ configDir, overwrite });
  let copied = 0, skipped = 0, overwritten = 0;
  for (const a of actions) {
    if (a.kind === "skip") {
      skipped++;
      log(`skip (user file kept): ${a.rel}`);
    } else if (a.kind === "same") {
      log(`already present: ${a.rel}`);
    } else {
      if (!dryRun) {
        // preserve the pre-existing file before overwriting (first backup wins)
        if (a.exists) {
          const pre = path.join(configDir, BACKUP_DIR, a.rel);
          if (!fs.existsSync(pre)) {
            fs.mkdirSync(path.dirname(pre), { recursive: true });
            fs.copyFileSync(a.dest, pre);
          }
        }
        fs.mkdirSync(path.dirname(a.dest), { recursive: true });
        fs.copyFileSync(a.src, a.dest);
      }
      if (a.kind === "overwrite") overwritten++;
      else copied++;
      log(`${a.kind === "overwrite" ? "overwrite" : "copy"}: ${a.rel}`);
    }
  }

  // 4. Write manifest for clean uninstall. Merge with any previous manifest
  // so reinstalls accumulate (never truncate) and the first install's
  // hadUserConfig/backup stay authoritative for uninstall decisions.
  if (!dryRun) {
    const files = actions.filter((a) => a.kind === "copy" || a.kind === "overwrite").map((a) => a.rel);
    if (agentsInstalled) files.push("AGENTS.md");
    const prev = prevManifest;
    const prevFiles = prev?.files;
    if (!agentsInstalled && Array.isArray(prevFiles) && prevFiles.includes("AGENTS.md")) files.push("AGENTS.md");
    const mergedFiles = [...new Set([...(Array.isArray(prevFiles) ? prevFiles : []), ...files])];
    const manifest = {
      version: 1,
      installedAt: new Date().toISOString(),
      target: configDir,
      backup: restoredOnUninstall ?? prev?.backup ?? null,
      hadUserConfig: prev ? prev.hadUserConfig : hadUserConfigBefore,
      files: mergedFiles,
    };
    fs.writeFileSync(manifestPath(configDir), JSON.stringify(manifest, null, 2) + "\n");
    log(`wrote manifest ${manifestPath(configDir)}`);
  }

  const summary = {
    configDir,
    configFile: userCfgPath,
    copied,
    skipped,
    overwritten,
    totals: { agents: COPY_DIRS.length },
  };
  return { logs, summary, plan: actions };
}

export function uninstall({ configDir = opencodeConfigDir(), dryRun = false } = {}) {
  const logs = [];
  const log = (msg) => (dryRun ? logs.push(`[dry-run] ${msg}`) : logs.push(msg));
  const mp = manifestPath(configDir);
  if (!fs.existsSync(mp)) {
    return { logs: ["no manifest found; nothing to uninstall"], summary: null };
  }
  const manifest = readManifest(configDir);
  if (!manifest) {
    return { logs: [`manifest at ${mp} is not valid JSON; refusing to uninstall blind`], summary: null };
  }

  let removed = 0;
  for (const rel of manifest.files || []) {
    const dest = path.join(configDir, rel);
    const pre = path.join(configDir, BACKUP_DIR, rel);
    if (!dryRun && fs.existsSync(pre)) {
      // A user file was overwritten at install time: put it back.
      fs.mkdirSync(path.dirname(dest), { recursive: true });
      fs.copyFileSync(pre, dest);
      fs.rmSync(pre, { force: true });
      log(`restored user file: ${rel}`);
      continue;
    }
    if (!fs.existsSync(dest)) continue;
    if (!dryRun) fs.rmSync(dest, { force: true });
    removed++;
    log(`remove: ${rel}`);
  }

  // Clean up empty category directories we created (never touches user files).
  // Also prunes the backup dir when every per-file backup was restored.
  if (!dryRun) {
    const walk = (dir) => {
      let entries;
      try {
        entries = fs.readdirSync(dir, { withFileTypes: true });
      } catch {
        return;
      }
      for (const e of entries) {
        if (e.isDirectory()) walk(path.join(dir, e.name));
      }
      try {
        if (fs.readdirSync(dir).length === 0) fs.rmdirSync(dir);
      } catch {
        // still has content or in use; leave it
      }
    };
    for (const cat of [...COPY_DIRS, BACKUP_DIR]) {
      const dir = path.join(configDir, cat);
      if (fs.existsSync(dir)) walk(dir);
    }
  }

  // restore backed-up opencode.json
  const backupPath = manifest.backup;
  const userCfgPath = path.join(configDir, "opencode.json");
  if (backupPath && fs.existsSync(backupPath)) {
    if (!dryRun) {
      fs.copyFileSync(backupPath, userCfgPath);
      fs.rmSync(backupPath, { force: true });
    }
    log(`restored ${userCfgPath} from backup`);
  } else if (backupPath) {
    log(`backup missing (${backupPath}); leaving ${userCfgPath} untouched`);
  } else if (manifest.hadUserConfig) {
    log(`install had no backup; leaving ${userCfgPath} untouched`);
  } else {
    // No config existed before install, so remove the one we created.
    if (!dryRun && fs.existsSync(userCfgPath)) fs.rmSync(userCfgPath, { force: true });
    log("removed opencode.json created by install (none existed before)");
  }

  if (!dryRun) fs.rmSync(mp, { force: true });
  return { logs, summary: { configDir, removed, manifestFile: mp } };
}

export function status(configDir = opencodeConfigDir()) {
  const mp = manifestPath(configDir);
  const cfgFile = path.join(configDir, "opencode.json");
  return {
    configDir,
    installed: fs.existsSync(mp),
    hasConfig: fs.existsSync(cfgFile),
    manifest: fs.existsSync(mp) ? readManifest(configDir) : null,
  };
}