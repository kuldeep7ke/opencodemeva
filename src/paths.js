import { homedir } from "node:os";
import { fileURLToPath } from "node:url";
import path from "node:path";
import fs from "node:fs";

export function configHome() {
  if (process.env.XDG_CONFIG_HOME) return process.env.XDG_CONFIG_HOME;
  return path.join(homedir(), ".config");
}

export function opencodeConfigDir() {
  return path.join(configHome(), "opencode");
}

export function bundleDir() {
  return path.dirname(path.dirname(fileURLToPath(import.meta.url)));
}

export function isWindows() {
  return process.platform === "win32";
}

const WIN_PROGRAMS = [
  path.join(process.env.LOCALAPPDATA || "", "Programs", "codebase-memory-mcp", "codebase-memory-mcp.exe"),
  path.join(homedir(), "AppData", "Local", "Programs", "codebase-memory-mcp", "codebase-memory-mcp.exe"),
];

const POSIX_PROGRAMS = [
  path.join(homedir(), ".local", "bin", "codebase-memory-mcp"),
  path.join(homedir(), "bin", "codebase-memory-mcp"),
  "/usr/local/bin/codebase-memory-mcp",
  "/usr/bin/codebase-memory-mcp",
];

export function findMemoryBinary() {
  const candidates = isWindows() ? WIN_PROGRAMS : POSIX_PROGRAMS;
  for (const p of candidates) {
    if (fs.existsSync(p)) return p;
  }
  return null;
}