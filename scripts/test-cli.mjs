import { mkdtempSync, readFileSync, writeFileSync, existsSync, rmSync, readdirSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { install, uninstall, status, mergedConfig, loadBundleConfig, loadUserConfig } from "../src/installer.js";

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

rmSync(tmp, { recursive: true, force: true });
rmSync(tmp2, { recursive: true, force: true });
rmSync(tmp3, { recursive: true, force: true });

if (failed) { console.error(`\n${failed} test(s) failed`); process.exit(1); }
console.log("\nall tests passed.");