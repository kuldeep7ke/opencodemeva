import { mkdtempSync, readFileSync, writeFileSync, existsSync, rmSync, readdirSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { execFileSync } from "node:child_process";
import { install, uninstall, status, mergedConfig, loadBundleConfig, loadUserConfig, patchMemoryBinary } from "../src/installer.js";
import { findMemoryBinary } from "../src/paths.js";

let failed = 0;
function assert(cond, msg) {
  if (cond) console.log(`ok   - ${msg}`);
  else { console.error(`FAIL - ${msg}`); failed++; }
}

const tmp = mkdtempSync(path.join(tmpdir(), "opencodemeva-test-"));

// 1. Fresh install into empty dir.
let r = install({ configDir: tmp });
assert(r.summary.copied > 0, "fresh install copies option files");
assert(status(tmp).installed, "manifest written after install");
const cfg1 = JSON.parse(readFileSync(path.join(tmp, "opencode.json"), "utf8"));
assert(cfg1.lsp === true, "lsp enabled by bundle");
assert(Array.isArray(cfg1.plugin) && cfg1.plugin.length === 10, "10 bundle plugins merged");
assert(cfg1.mcp?.context7, "context7 mcp added");
assert(existsSync(path.join(tmp, "agents", "architect.md")), "agent file installed");

// 2. Idempotent reinstall.
r = install({ configDir: tmp });
assert(r.summary.copied === 0, "reinstall is idempotent (copies 0)");

// 3. User config wins.
const userCfg = { model: "custom/model", lsp: false, plugin: ["./plugins/my-own.ts"], mcp: { context7: { type: "local", command: ["custom"] } } };
const merged = mergedConfig(userCfg, loadBundleConfig());
assert(merged.lsp === false, "user lsp:false wins over bundle lsp:true");
assert(merged.model === "custom/model", "user model preserved");
assert(JSON.stringify(merged.mcp.context7.command) === JSON.stringify(["custom"]), "user mcp server definition wins");
assert(merged.plugin.includes("./plugins/my-own.ts") && merged.plugin.length === 11, "user plugin unioned with bundle plugins");

// 4. Uninstall restores user config.
const tmp3 = mkdtempSync(path.join(tmpdir(), "opencodemeva-test3-"));
writeFileSync(path.join(tmp3, "opencode.json"), JSON.stringify(userCfg, null, 2));
install({ configDir: tmp3 });
uninstall({ configDir: tmp3 });
const restored = JSON.parse(readFileSync(path.join(tmp3, "opencode.json"), "utf8"));
assert(JSON.stringify(restored) === JSON.stringify(userCfg), "uninstall restores original user config");
assert(!existsSync(path.join(tmp3, "agents")), "uninstall removes agents dir");

// 5. Fresh install → uninstall removes config entirely.
const tmp2 = mkdtempSync(path.join(tmpdir(), "opencodemeva-test2-"));
install({ configDir: tmp2 });
uninstall({ configDir: tmp2 });
assert(!existsSync(path.join(tmp2, "opencode.json")), "uninstall removes config created on empty install");

// 6. Reinstall never truncates the manifest (B1 regression).
const m1 = JSON.parse(readFileSync(path.join(tmp, "opencodemeva.manifest.json"), "utf8"));
const n1 = m1.files.length;
install({ configDir: tmp });
const m2 = JSON.parse(readFileSync(path.join(tmp, "opencodemeva.manifest.json"), "utf8"));
assert(m2.files.length === n1, `reinstall preserves manifest file list (${n1} files)`);
assert(m2.hadUserConfig === m1.hadUserConfig, "reinstall preserves original hadUserConfig");
uninstall({ configDir: tmp });
assert(!existsSync(path.join(tmp, "agents")), "uninstall after reinstall removes all bundle files");
assert(!existsSync(path.join(tmp, "opencode.json")), "uninstall after reinstall removes created config");

// 7. --overwrite + uninstall restores the user's original file (B2 regression).
const tmp4 = mkdtempSync(path.join(tmpdir(), "opencodemeva-test4-"));
install({ configDir: tmp4 });
const customAgent = "# MY CUSTOM ARCHITECT — do not lose";
writeFileSync(path.join(tmp4, "agents", "architect.md"), customAgent);
install({ configDir: tmp4, overwrite: true });
assert(readFileSync(path.join(tmp4, "agents", "architect.md"), "utf8").includes("name: architect"), "overwrite replaces with bundle copy");
uninstall({ configDir: tmp4 });
assert(readFileSync(path.join(tmp4, "agents", "architect.md"), "utf8") === customAgent, "uninstall restores overwritten user file");

// 8. AGENTS.md honors --overwrite (B4 regression).
const tmp5 = mkdtempSync(path.join(tmpdir(), "opencodemeva-test5-"));
writeFileSync(path.join(tmp5, "AGENTS.md"), "# user agents notes");
install({ configDir: tmp5 });
assert(readFileSync(path.join(tmp5, "AGENTS.md"), "utf8") === "# user agents notes", "AGENTS.md kept without --overwrite");
install({ configDir: tmp5, overwrite: true });
assert(readFileSync(path.join(tmp5, "AGENTS.md"), "utf8").includes("opencodemeva"), "AGENTS.md replaced with --overwrite");
uninstall({ configDir: tmp5 });
assert(readFileSync(path.join(tmp5, "AGENTS.md"), "utf8") === "# user agents notes", "uninstall restores user AGENTS.md");

// 9. JSONC user configs install cleanly (B3 regression).
const tmp6 = mkdtempSync(path.join(tmpdir(), "opencodemeva-test6-"));
writeFileSync(path.join(tmp6, "opencode.json"), '{\n// user comment\n"model": "custom/model", /* block */\n"lsp": false\n}\n');
install({ configDir: tmp6 });
const cfg6 = JSON.parse(readFileSync(path.join(tmp6, "opencode.json"), "utf8"));
assert(cfg6.model === "custom/model" && cfg6.lsp === false, "JSONC user config merges with user winning");
assert(loadUserConfig(tmp6).model === "custom/model", "loadUserConfig reads JSONC");
uninstall({ configDir: tmp6 });
assert(readFileSync(path.join(tmp6, "opencode.json"), "utf8").includes("// user comment"), "uninstall restores original JSONC byte-for-byte");

// 10. Memory placeholder patching (B6 regression).
const memBin = findMemoryBinary();
const userMem = { mcp: { memory: { type: "local", command: ["my-memory-bin"], enabled: true } } };
assert(JSON.stringify(patchMemoryBinary(JSON.parse(JSON.stringify(userMem))).mcp.memory.command) === JSON.stringify(["my-memory-bin"]), "user-defined memory server never touched");
if (memBin) {
  const ph = { mcp: { memory: { type: "local", command: ["codebase-memory-mcp"], enabled: true } } };
  const patched = patchMemoryBinary(ph);
  assert(JSON.stringify(patched.mcp.memory.command) === JSON.stringify([memBin]), "placeholder memory patched even when enabled");
} else {
  console.log("ok   - (skipped placeholder-enabled assert: no memory binary on this machine)");
}

// 11. CLI arg safety (B5/C2 regressions).
const repoRootReal = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
function cli(args) {
  try {
    execFileSync(process.execPath, [path.join(repoRootReal, "src", "cli.js"), ...args], { stdio: "pipe" });
    return 0;
  } catch (e) {
    return e.status;
  }
}
assert(cli(["install", "--target"]) === 1, "install --target with no value errors instead of touching live config");
assert(cli(["install", "--bogus-flag", "--target", tmp6, "--dry-run", "-y"]) === 1, "unknown flag errors out");
assert(cli(["--help"]) === 0, "--help exits 0");
assert(cli(["install", "--help", "--target", tmp6]) === 0, "install --help prints help instead of prompting");

rmSync(tmp, { recursive: true, force: true });
rmSync(tmp2, { recursive: true, force: true });
rmSync(tmp3, { recursive: true, force: true });
rmSync(tmp4, { recursive: true, force: true });
rmSync(tmp5, { recursive: true, force: true });
rmSync(tmp6, { recursive: true, force: true });

if (failed) { console.error(`\n${failed} test(s) failed`); process.exit(1); }
console.log("\nall tests passed.");