import fs from "node:fs";
import path from "node:path";

const M = process.argv[2] || "C:/Users/Admin/.config/opencode";
const fmRe = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?/;

function parseFm(t) {
  const m = t.match(fmRe);
  if (!m) return null;
  const out = {};
  for (const line of m[1].split(/\r?\n/)) {
    const mm = line.match(/^([A-Za-z_][A-Za-z0-9_]*)\s*:\s*(.*)$/);
    if (mm) out[mm[1]] = mm[2];
  }
  return out;
}

const issues = [];
const warn = [];
const allAgents = new Map();

function hasFullDescription(fmRaw) {
  const m = fmRaw.match(/^description\s*:\s*(.*)$/m);
  if (!m) return false;
  if (m[1].trim() !== "") return true;
  const after = fmRaw.slice(fmRaw.indexOf(m[0]) + m[0].length).split(/\r?\n/);
  for (const line of after) {
    if (line.trim() === "") continue;
    return /^\s{2,}/.test(line);
  }
  return false;
}

// ---- agents ----
const agentKeys = new Set(["name","description","mode","hidden","color","temperature","top_p","model","variant","steps","options","permission","disable","tools","allow","deny","lsp","mcp","agent"]);
for (const f of fs.readdirSync(path.join(M, "agents")).filter((x) => x.endsWith(".md"))) {
  const t = fs.readFileSync(path.join(M, "agents", f), "utf8");
  const fm = parseFm(t);
  if (!fm) { issues.push(`AGENT ${f}: no frontmatter`); continue; }
  const base = path.basename(f, ".md");
  if (!fm.name) issues.push(`AGENT ${f}: no name`);
  else if (fm.name !== base) warn.push(`AGENT ${f}: name ${fm.name} != filename ${base}`);
  if (!/^[a-zA-Z0-9][a-zA-Z0-9-]*$/.test(base)) issues.push(`AGENT ${f}: bad filename chars`);
  if (!hasFullDescription((t.match(fmRe) || [, ""])[1] || "")) issues.push(`AGENT ${f}: missing/short description`);
  for (const k of Object.keys(fm)) if (!agentKeys.has(k)) warn.push(`AGENT ${f}: unknown fm key "${k}"`);
  if (allAgents.has(base)) issues.push(`AGENT dup name: ${base}`);
  allAgents.set(base, fm);
  if (t.includes("\uFFFD")) issues.push(`AGENT ${f}: replacement char`);
  // body non-empty
  const body = t.slice((t.match(fmRe) || [, ""])[0]?.length || 0);
  if (!body.trim()) warn.push(`AGENT ${f}: empty body`);
}

// ---- commands ----
const cmdKeys = new Set(["name","description","agent","model","variant","subtask"]);
for (const f of fs.readdirSync(path.join(M, "commands")).filter((x) => x.endsWith(".md"))) {
  const t = fs.readFileSync(path.join(M, "commands", f), "utf8");
  const fm = parseFm(t);
  if (!fm) { issues.push(`CMD ${f}: no frontmatter`); continue; }
  const base = path.basename(f, ".md");
  if (!fm.description) issues.push(`CMD ${f}: missing description`);
  if (!/^[a-zA-Z0-9][a-zA-Z0-9-]*$/.test(base)) issues.push(`CMD ${f}: bad filename chars`);
  for (const k of Object.keys(fm)) if (!cmdKeys.has(k)) warn.push(`CMD ${f}: unknown fm key "${k}"`);
  if (!t.slice((t.match(fmRe) || [, ""])[0]?.length || 0).trim()) warn.push(`CMD ${f}: empty body`);
  if (fm.agent && !allAgents.has(fm.agent)) warn.push(`CMD ${f}: references unknown agent "${fm.agent}"`);
}

// ---- skills ----
let skillDirs = 0;
for (const d of fs.readdirSync(path.join(M, "skills"))) {
  const full = path.join(M, "skills", d);
  if (!fs.statSync(full).isDirectory()) continue;
  skillDirs++;
  const fmf = path.join(full, "SKILL.md");
  if (!fs.existsSync(fmf)) { issues.push(`SKILL ${d}: no SKILL.md`); continue; }
  const t = fs.readFileSync(fmf, "utf8");
  const fm = parseFm(t);
  if (!fm) { issues.push(`SKILL ${d}: SKILL.md missing frontmatter`); continue; }
  if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(d)) issues.push(`SKILL ${d}: bad folder name`);
  if (!fm.name || fm.name !== d) warn.push(`SKILL ${d}: frontmatter name ${fm.name} != folder`);
  if (!hasFullDescription((t.match(fmRe) || [, ""])[1] || "")) issues.push(`SKILL ${d}: missing description`);
  if (t.includes("\uFFFD")) issues.push(`SKILL ${d}: replacement char`);
}

console.log(`agents: ${[...allAgents.keys()].length} | commands: ${fs.readdirSync(path.join(M, "commands")).length} | skill dirs: ${skillDirs}`);
console.log(`ISSUES (${issues.length}):`);
for (const i of issues) console.log("  -", i);
console.log(`WARNINGS (${warn.length}) — first 40:`);
for (const w of warn.slice(0, 40)) console.log("  ~", w);