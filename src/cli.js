#!/usr/bin/env node
import { install, uninstall, status, planInstall, mergedConfig, listBundleFiles, loadBundleConfig, loadUserConfig } from "./installer.js";
import { opencodeConfigDir } from "./paths.js";
import fs from "node:fs";
import path from "node:path";

const HELP = `opencodemeva - patch installer for opencode (options pack)

Usage:
  opencodemeva install [--target <dir>] [--overwrite] [--dry-run]
  opencodemeva uninstall [--target <dir>] [--dry-run]
  opencodemeva status [--target <dir>]
  opencodemeva validate
  opencodemeva help

Options:
  --target <dir>   install into an explicit config dir (default: ~/.config/opencode)
  --overwrite      replace existing user agent/command/skill/plugin files
  --dry-run        show what would happen without changing anything
  -y, --yes        skip confirmation prompts
`;

function parseArgs(argv) {
  const out = { target: null, overwrite: false, dryRun: false, yes: false, cmd: null };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--overwrite") out.overwrite = true;
    else if (a === "--dry-run") out.dryRun = true;
    else if (a === "-y" || a === "--yes") out.yes = true;
    else if (a === "--yes=-1") out.yes = true;
    else if (a === "--target") { out.target = argv[++i]; }
    else if (a.startsWith("--target=")) out.target = a.slice("--target=".length);
    else if (!out.cmd) out.cmd = a;
  }
  return out;
}

function confirm(text) {
  process.stdout.write(`${text} (y/N) `);
  const buf = [];
  const wasRaw = process.stdin.isTTY;
  if (wasRaw) process.stdin.setRawMode?.(true);
  process.stdin.resume();
  return new Promise((resolve, reject) => {
    process.stdin.once("data", (d) => {
      const c = d.toString().trim().toLowerCase();
      if (wasRaw) process.stdin.setRawMode?.(false);
      process.stdin.pause();
      resolve(c === "y" || c === "yes");
    });
    process.stdin.once("error", reject);
  });
}

function printLogs(logs) {
  for (const l of logs) console.log(l);
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const cmd = args.cmd || "help";
  const configDir = args.target ? path.resolve(args.target) : opencodeConfigDir();

  if (cmd === "help" || cmd === "--help" || cmd === "-h") {
    console.log(HELP);
    process.exit(0);
  }

  if (cmd === "validate") {
    const bundle = loadBundleConfig();
    const problems = [];
    if (!bundle.$schema) problems.push("opencode.json missing $schema");
    if (!Array.isArray(bundle.plugin)) problems.push("plugin must be an array");
    if (typeof bundle.lsp !== "boolean" && bundle.lsp !== true) problems.push("lsp must be true/boolean");
    if (bundle.mcp) {
      for (const [name, def] of Object.entries(bundle.mcp)) {
        if (!def.type || !["local", "remote"].includes(def.type)) problems.push(`mcp.${name}: missing/invalid type`);
        if (def.type === "local" && !Array.isArray(def.command)) problems.push(`mcp.${name}: local command must be an array`);
      }
    }
    const files = listBundleFiles();
    const pluginRefs = (bundle.plugin || []).filter((p) => typeof p === "string" && p.startsWith("./plugins/"));
    for (const ref of pluginRefs) {
      const name = ref.replace("./plugins/", "");
      if (!files.some((f) => f.endsWith(path.join("plugins", name)))) problems.push(`plugin referenced but missing: ${ref}`);
    }
    if (problems.length) {
      console.log("VALIDATION FAILED:");
      for (const p of problems) console.log("  -", p);
      process.exit(1);
    }
    console.log("VALIDATION OK — bundle is valid for opencode.");
    console.log(`bundle: ${files.length} option files, ${Object.keys(bundle.mcp || {}).length} mcp servers, ${(bundle.plugin || []).length} plugins, lsp=${bundle.lsp}`);
    process.exit(0);
  }

  if (cmd === "status") {
    const s = status(configDir);
    console.log(`config dir : ${s.configDir}`);
    console.log(`installed  : ${s.installed ? "yes" : "no"}`);
    console.log(`has config : ${s.hasConfig ? "yes" : "no"}`);
    if (s.manifest) {
      console.log(`installed  : ${s.manifest.files.length} option files`);
      console.log(`installed at: ${s.manifest.installedAt}`);
    }
    if (fs.existsSync(path.join(configDir, "opencode.json"))) {
      const cfg = loadUserConfig(configDir);
      console.log(`mcp servers: ${Object.keys(cfg.mcp || {}).join(", ") || "none"}`);
      console.log(`plugins    : ${(cfg.plugin || []).length}`);
    }
    process.exit(0);
  }

  if (cmd === "install") {
    if (args.dryRun) {
      console.log(`dry-run install into ${configDir}`);
      const plan = planInstall({ configDir, overwrite: args.overwrite });
      const userCfg = loadUserConfig(configDir);
      const merged = mergedConfig(userCfg, loadBundleConfig());
      console.log(`- opencode.json: merge of ${Object.keys(userCfg).length} existing + bundle keys -> ${Object.keys(merged).length} keys`);
      console.log(`- memory MCP: ${userCfg.mcp?.memory ? "user already defines memory" : "bundle adds memory (binary auto-patched if found)"}`);
      for (const a of plan) console.log(`  [${a.kind}] ${a.rel}`);
      console.log(`\nplan: ${plan.filter((a) => a.kind === "copy").length} copies, ${plan.filter((a) => a.kind === "overwrite").length} overwrites, ${plan.filter((a) => a.kind === "skip").length} skipped (keep user files)`);
      process.exit(0);
    }
    if (!args.yes) {
      console.log(`This patches opencode config at:\n  ${configDir}\nIt adds agents, commands, skills, plugins, mcp, lsp options.\n`)
      const ok = await confirm("Continue?");
      if (!ok) { console.log("aborted."); process.exit(1); }
    }
    const { logs, summary } = install({ configDir, overwrite: args.overwrite });
    printLogs(logs);
    console.log(`\ninstalled ${summary.copied} new / ${summary.overwritten} overwritten option files into ${summary.configDir}`);
    if (summary.skipped > 0) console.log(`${summary.skipped} existing user files were kept (use --overwrite to replace)`);
    console.log("\nRestart opencode to load the new config.");
    process.exit(0);
  }

  if (cmd === "uninstall") {
    if (args.dryRun) {
      const { logs } = uninstall({ configDir, dryRun: true });
      printLogs(logs);
      process.exit(0);
    }
    if (!args.yes) {
      const ok = await confirm(`Remove opencodemeva patch from ${configDir}? This will not touch the rest of your opencode config.\nContinue?`);
      if (!ok) { console.log("aborted."); process.exit(1); }
    }
    const { logs, summary } = uninstall({ configDir });
    printLogs(logs);
    if (summary) console.log(`\nremoved ${summary.removed} option files from ${summary.configDir}`);
    console.log("\nRestart opencode to apply.");
    process.exit(0);
  }

  console.log(HELP);
  process.exit(1);
}

main().catch((e) => {
  console.error("error:", e.message);
  process.exit(1);
});