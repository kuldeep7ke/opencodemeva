import fs from "node:fs";
import path from "node:path";

// Merge six "everything-opencode" source repos into a single validated pack.
// Usage:
//   node scripts/merge.mjs
// Env:
//   SOURCES_DIR  where the repo-* clones live (default: <repo>/sources)
//   OUT_DIR      where agents/commands/skills/plugins are written (default: <repo>)
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const DEFAULTS = {
  sourcesDir: process.env.SOURCES_DIR || path.join(HERE, "..", "sources"),
  outDir: process.env.OUT_DIR || path.join(HERE, ".."),
};
const ROOT = DEFAULTS.sourcesDir;
const OUT = DEFAULTS.outDir;

const REPOS = [
  { name: "defuj", root: path.join(ROOT, "repo-defuj"), prio: 1 },
  { name: "noahain", root: path.join(ROOT, "repo-noahain"), prio: 2 },
  { name: "jakezp", root: path.join(ROOT, "repo-jakezp"), prio: 3 },
  { name: "karma", root: path.join(ROOT, "repo-karma"), prio: 4 },
  { name: "speedoa", root: path.join(ROOT, "repo-speedoa"), prio: 5 },
  { name: "kevinlupera", root: path.join(ROOT, "repo-kevinlupera"), prio: 6 },
];

// ---------- minimal YAML ----------
function parseScalar(val) {
  val = val.trim();
  if (val === "true") return true;
  if (val === "false") return false;
  if (val === "null" || val === "~") return null;
  if (/^-?\d+(\.\d+)?$/.test(val)) return Number(val);
  if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
    return val.slice(1, -1);
  }
  return val;
}
function parseYaml(src) {
  const lines = src.split(/\r?\n/).filter((l) => l.trim() !== "" && !l.trim().startsWith("#"));
  let idx = 0;
  function parseBlock(indent) {
    const obj = {};
    while (idx < lines.length) {
      const line = lines[idx];
      const leadM = line.match(/^\s*/);
      const lead = leadM ? leadM[0].length : 0;
      const content = line.slice(lead);
      if (content.startsWith("- ") && lead >= indent) break;
      if (lead < indent) break;
      if (lead > indent) { idx++; continue; }
      if (content.startsWith("- ")) break;
      const colon = content.indexOf(":");
      if (colon === -1) { idx++; continue; }
      const key = content.slice(0, colon).trim().replace(/^["']|["']$/g, "");
      const val = content.slice(colon + 1).trim();
      idx++;
      if (val === "") {
        const nxt = lines[idx] ? lines[idx].match(/^\s*/)[0].length : 0;
        if (nxt > indent && lines[idx] && lines[idx].trim().startsWith("- ")) {
          obj[key] = parseList(nxt);
        } else {
          obj[key] = parseBlock(indent + 2);
        }
      } else {
        obj[key] = parseScalar(val);
      }
    }
    return obj;
  }
  function parseList(indent) {
    const arr = [];
    while (idx < lines.length) {
      const line = lines[idx];
      const lead = line.match(/^\s*/)[0].length;
      if (lead < indent) break;
      const content = line.slice(lead);
      if (!content.startsWith("- ")) break;
      arr.push(parseScalar(content.slice(2).trim()));
      idx++;
    }
    return arr;
  }
  // if frontmatter has a top-level list first, handle too
  const obj = {};
  while (idx < lines.length) {
    const line = lines[idx];
    if (line.trim() === "") { idx++; continue; }
    const leadM = line.match(/^\s*/);
    const lead = leadM ? leadM[0].length : 0;
    if (lead > 0) { idx++; continue; }
    if (line.trim().startsWith("- ")) { obj[Symbol("list")] = parseList(0); break; }
    const colon = line.indexOf(":");
    if (colon === -1) { idx++; continue; }
    const key = line.slice(0, colon).trim().replace(/^["']|["']$/g, "");
    const val = line.slice(colon + 1).trim();
    idx++;
    if (val === "") {
      const nxtIdx = lines[idx];
      const nxt = nxtIdx ? nxtIdx.match(/^\s*/)[0].length : 0;
      if (nxt > 0 && nxtIdx && nxtIdx.trim().startsWith("- ")) obj[key] = parseList(nxt);
      else obj[key] = parseBlock(2);
    } else {
      obj[key] = parseScalar(val);
    }
  }
  return obj;
}
function parseFrontmatter(text) {
  const m = text.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/);
  if (!m) return { fm: {}, body: text };
  return { fm: parseYaml(m[1]), body: text.slice(m[0].length).trimStart() };
}
function stripEmbeddedFrontmatter(text) {
  const m = text.match(/^---\r?\n[\s\S]*?\r?\n---\r?\n?/);
  return m ? text.slice(m[0].length).trimStart() : text;
}
function yamlScalar(v) {
  if (typeof v === "boolean") return v ? "true" : "false";
  if (typeof v === "number") return String(v);
  if (typeof v === "string") {
    if (/^\s|\s$|[\r\n:]|^["']|["']$/.test(v)) return JSON.stringify(v);
    return v;
  }
  return String(v);
}
function emitYaml(obj, indent = 0) {
  const pad = " ".repeat(indent);
  const lines = [];
  for (const k of Object.keys(obj)) {
    const v = obj[k];
    const key = /[:#\s]/.test(k) ? JSON.stringify(k) : k;
    if (v && typeof v === "object" && !Array.isArray(v)) {
      lines.push(`${pad}${key}:`);
      lines.push(emitYaml(v, indent + 2));
    } else if (Array.isArray(v)) {
      lines.push(`${pad}${key}:`);
      for (const it of v) lines.push(`${pad}  - ${yamlScalar(it)}`);
    } else {
      lines.push(`${pad}${key}: ${yamlScalar(v)}`);
    }
  }
  return lines.join("\n");
}

// ---------- helpers ----------
const exists = (p) => fs.existsSync(p);
const read = (p) => (exists(p) ? fs.readFileSync(p, "utf8") : "");
const copydir = (src, dest) =>
  fs.cpSync(src, dest, { recursive: true, force: true, errorOnExist: false });
const mkdir = (p) => fs.mkdirSync(p, { recursive: true });

const ALLOWED_AGENT_FIELDS = [
  "name", "model", "variant", "description", "mode", "hidden", "color",
  "steps", "options", "permission", "disable", "temperature", "top_p",
];
const TOOL_TO_PERM = {
  read: "read", grep: "grep", glob: "glob", write: "write", edit: "edit",
  bash: "bash", task: "task", webfetch: "webfetch", websearch: "websearch", lsp: "lsp",
};
const TOOL_NAME_ALIASES = {
  Read: "read", Grep: "grep", Glob: "glob", Write: "write", Edit: "edit",
  Bash: "bash", Task: "task", WebFetch: "webfetch", WebSearch: "websearch",
};

function toolsToPermission(tools, out = {}) {
  if (!tools || typeof tools !== "object") return out;
  for (const [k, v] of Object.entries(tools)) {
    let key = null;
    if (TOOL_NAME_ALIASES[k] || TOOL_TO_PERM[k.toLowerCase()]) {
      key = TOOL_NAME_ALIASES[k] || TOOL_TO_PERM[k.toLowerCase()];
    } else if (k.startsWith("lsp_")) {
      key = "lsp";
    }
    if (!key) continue;
    out[key] = v === false ? "deny" : v === true ? "allow" : String(v);
  }
  return out;
}
function cleanAgentFm(fm, { forceMode = "subagent" } = {}) {
  const out = {};
  for (const f of ALLOWED_AGENT_FIELDS) if (fm[f] !== undefined) out[f] = fm[f];
  if (!out.mode) out.mode = forceMode;
  if (fm.tools) out.permission = toolsToPermission(fm.tools, out.permission || {});
  return out;
}
function writeAgentFile(file, fm, body) {
  const yaml = emitYaml(fm);
  const name = fm.name;
  let fileBase = path.basename(file, ".md");
  if (fm.name) fileBase = String(fm.name);
  mkdir(path.dirname(file));
  fs.writeFileSync(path.join(OUT, "agents", `${fileBase}.md`), `---\n${yaml}\n---\n\n${body.trim()}\n`);
  return fileBase;
}
function normalizeAgentRef(v) {
  if (v == null) return v;
  const s = String(v).trim();
  const unquoted = s.replace(/^["']|["']$/g, "");
  return unquoted.split(":").filter(Boolean).pop() || unquoted;
}
function writeCommandFile(destName, fm, body) {
  const out = {};
  for (const f of ["description", "agent", "model", "variant", "subtask"]) if (fm[f] !== undefined) out[f] = fm[f];
  if (out.agent) out.agent = normalizeAgentRef(out.agent);
  if (!out.description) {
    const h = body.match(/^\s*#+\s+(.+)$/m);
    if (h) out.description = h[1].trim().replace(/[*_`]/g, "");
    else out.description = `Run the ${destName} workflow`;
  }
  const yaml = emitYaml(out);
  mkdir(path.join(OUT, "commands"));
  fs.writeFileSync(path.join(OUT, "commands", `${destName}.md`), `---\n${yaml}\n---\n\n${body.trim()}\n`);
}

// ---------- collect skills ----------
const skills = new Map(); // name -> {prio, srcPkg, repo}
function addSkill(name, prio, pkgDir) {
  if (!name) return;
  if (skills.has(name)) {
    const cur = skills.get(name);
    if (prio < cur.prio) skills.set(name, { prio, srcPkg: pkgDir });
  } else {
    skills.set(name, { prio, srcPkg: pkgDir });
  }
}
function scanSkills(baseDir, prio, repo) {
  if (!exists(baseDir)) return;
  for (const entry of fs.readdirSync(baseDir, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;
    const fmPath = path.join(baseDir, entry.name, "SKILL.md");
    if (exists(fmPath)) {
      const { fm } = parseFrontmatter(read(fmPath));
      const name = pickSkillName(fm, entry.name);
      addSkill(name, prio, path.join(baseDir, entry.name));
    }
    // nested groups like core/ and stacks/
    const nested = path.join(baseDir, entry.name);
    const sub = fs.readdirSync(nested, { withFileTypes: true });
    for (const s of sub) {
      if (!s.isDirectory()) continue;
      const sfm = path.join(nested, s.name, "SKILL.md");
      if (exists(sfm)) {
        const { fm } = parseFrontmatter(read(sfm));
        const name = pickSkillName(fm, s.name);
        addSkill(name, prio, path.join(nested, s.name));
      }
    }
  }
}
function pickSkillName(fm, dirName) {
  const fn = fm.name ? String(fm.name) : "";
  if (/^[a-z0-9]+(-[a-z0-9]+)*$/.test(fn)) return fn;
  if (/^[a-z0-9]+(-[a-z0-9]+)*$/.test(dirName)) return dirName;
  return dirName.replace(/[^a-z0-9-]/gi, "-").replace(/-+/g, "-").replace(/^-|-$/g, "") || "unnamed";
}
for (const r of REPOS) {
  scanSkills(path.join(r.root, ".opencode", "skills"), r.prio, r.name);
  scanSkills(path.join(r.root, "skills"), r.prio, r.name);
}
mkdir(path.join(OUT, "skills"));
for (const [name, { srcPkg }] of skills) {
  copydir(srcPkg, path.join(OUT, "skills", name));
  // ensure SKILL.md has name+description frontmatter or opencode filters it out
  const destSkill = path.join(OUT, "skills", name, "SKILL.md");
  const raw = read(destSkill);
  if (!/^---\r?\n[\s\S]*\r?\n---/.test(raw)) {
    const h = raw.match(/^\s*#+\s+(.+)$/m);
    const desc = h ? h[1].trim().replace(/[*_`]/g, "") : `Use when working on ${name} topics`;
    fs.writeFileSync(
      destSkill,
      `---\nname: ${name}\ndescription: ${JSON.stringify(desc)}\n---\n\n${raw.trim()}\n`
    );
  }
}

// ---------- collect commands ----------
const commands = new Map();
function addCommand(name, prio, srcFile) {
  if (!commands.has(name)) commands.set(name, { prio, srcFile });
  else if (prio < commands.get(name).prio) commands.set(name, { prio, srcFile });
}
function scanCommands(baseDir, prio, prefix = "") {
  if (!exists(baseDir)) return;
  for (const entry of fs.readdirSync(baseDir, { withFileTypes: true })) {
    if (entry.isDirectory()) {
      scanCommands(path.join(baseDir, entry.name), prio, `${entry.name}-`);
    } else if (entry.isFile() && entry.name.endsWith(".md")) {
      addCommand(prefix + path.basename(entry.name, ".md"), prio, path.join(baseDir, entry.name));
    }
  }
}
for (const r of REPOS) {
  scanCommands(path.join(r.root, ".opencode", "commands"), r.prio);
  scanCommands(path.join(r.root, "commands"), r.prio);
}
for (const [name, { srcFile }] of commands) {
  const { fm, body } = parseFrontmatter(read(srcFile));
  writeCommandFile(name, fm, body);
}

// ---------- collect agents ----------
const agents = new Map(); // name -> {prio, write: fn|{fm, body, name}}
function addAgent(name, prio, record) {
  if (!agents.has(name)) agents.set(name, { prio, record });
  else if (prio < agents.get(name).prio) agents.set(name, { prio, record });
}

// defuj: generate from opencode.json + prompt files
{
  const cfg = JSON.parse(read(path.join(REPOS[0].root, "opencode.json")));
  const adir = path.join(REPOS[0].root, ".opencode", "prompts", "agents");
  for (const [key, def] of Object.entries(cfg.agent || {})) {
    const m = String(def.prompt || "").match(/\{file:([^}]+)\}/);
    const promptPath = m ? path.join(REPOS[0].root, m[1]) : path.join(adir, `${key}.md`);
    let body = read(promptPath) || read(path.join(adir, `${key}.md`)) || "";
    body = stripEmbeddedFrontmatter(body);
    if (!body) { console.log("WARN defuj: no prompt for agent", key); continue; }
    addAgent(key, 1, { fm: { description: def.description, mode: def.mode || "subagent", model: def.model, permission: def.permission, color: def.color, temperature: def.temperature }, body });
  }
}
// karma: md files
{
  const kdir = path.join(REPOS[3].root, ".opencode", "agents");
  if (exists(kdir)) {
    for (const f of fs.readdirSync(kdir).filter((x) => x.endsWith(".md"))) {
      const { fm, body } = parseFrontmatter(read(path.join(kdir, f)));
      const name = fm.name ? String(fm.name) : path.basename(f, ".md");
      addAgent(name, 4, { fm: cleanAgentFm(fm), body });
    }
  }
}
// jakezp: md files, normalize
{
  const jdir = path.join(REPOS[2].root, "agents");
  if (exists(jdir)) {
    for (const f of fs.readdirSync(jdir).filter((x) => x.endsWith(".md"))) {
      const { fm, body } = parseFrontmatter(read(path.join(jdir, f)));
      let name = fm.name ? String(fm.name) : path.basename(f, ".md").replace(/^EO-/, "");
      if (name.startsWith("EO-") && name.length > 3) name = name.slice(3);
      addAgent(name, 3, { fm: cleanAgentFm(fm), body });
    }
  }
}
// noahain: generate from opencode.json + prompts
{
  const cfg = JSON.parse(read(path.join(REPOS[1].root, "opencode.json")));
  const pdir = path.join(REPOS[1].root, "prompts");
  for (const [key, def] of Object.entries(cfg.agent || {})) {
    const m = String(def.prompt || "").match(/\{file:([^}]+)\}/);
    const promptPath = m ? path.join(REPOS[1].root, m[1]) : null;
    let body = promptPath ? read(promptPath) : "";
    body = stripEmbeddedFrontmatter(body);
    if (!body && def.description) {
      body = `You are the ${key} agent.\n\n${def.description}\n`;
    }
    if (!body) { console.log("WARN noahain: no prompt for agent", key); continue; }
    const perms = {};
    const ap = def.permission || {};
    for (const [k, v] of Object.entries(ap)) perms[k] = typeof v === "object" && v !== null ? { ...v } : v;
    addAgent(key, 2, { fm: { description: def.description, mode: "subagent", model: def.model, permission: perms }, body });
  }
}
// kevinlupera: md files
{
  const kdir = path.join(REPOS[5].root, "agents");
  if (exists(kdir)) {
    for (const f of fs.readdirSync(kdir).filter((x) => x.endsWith(".md"))) {
      const { fm, body } = parseFrontmatter(read(path.join(kdir, f)));
      const name = fm.name ? String(fm.name) : path.basename(f, ".md");
      addAgent(name, 6, { fm: cleanAgentFm(fm), body });
    }
  }
}
mkdir(path.join(OUT, "agents"));
for (const [name, { record }] of agents) {
  const fm = record.fm || {};
  const body = record.body || "";
  const finalFm = { name, description: fm.description, mode: fm.mode || "subagent" };
  if (fm.temperature !== undefined) finalFm.temperature = fm.temperature;
  if (fm.color) finalFm.color = fm.color;
  if (fm.permission && Object.keys(fm.permission).length) finalFm.permission = fm.permission;
  const yaml = emitYaml(finalFm);
  fs.writeFileSync(path.join(OUT, "agents", `${name}.md`), `---\n${yaml}\n---\n\n${body.trim()}\n`);
}

// plugins
mkdir(path.join(OUT, "plugins"));
// speedoa set (skip auto-format + test-watcher)
for (const p of ["console-log-warning", "dangerous-command-blocker", "env-protection",
                 "notification", "pr-helper", "pre-commit-check", "session-summary", "type-checker"]) {
  const s = path.join(REPOS[4].root, "plugins", `${p}.ts`);
  if (exists(s)) fs.copyFileSync(s, path.join(OUT, "plugins", path.basename(s)));
}
// karma tool-guardrails (self-contained)
{
  const s = path.join(REPOS[3].root, ".opencode", "plugins", "tool-guardrails.ts");
  if (exists(s)) fs.copyFileSync(s, path.join(OUT, "plugins", "tool-guardrails.ts"));
}

// summary
console.log("SKILLS:", skills.size);
console.log("COMMANDS:", commands.size);
console.log("AGENTS:", agents.size);
console.log("PLUGINS:", fs.readdirSync(path.join(OUT, "plugins")).length);
console.log("--- agents ---");
console.log([...agents.keys()].sort().join(", "));