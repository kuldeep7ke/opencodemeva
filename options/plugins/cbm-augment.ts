// codebase-memory-mcp:start
// Portable bundle version of the codebase-memory-mcp OpenCode augment plugin.
// Edited by opencodemeva to stay machine-portable: the binary is resolved at
// runtime via CBM_BIN, well-known install locations, then PATH -- never a
// hardcoded absolute path.
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const CANDIDATES =
  process.platform === 'win32'
    ? [
        process.env.CBM_BIN,
        path.join(process.env.LOCALAPPDATA || '', 'Programs', 'codebase-memory-mcp', 'codebase-memory-mcp.exe'),
        path.join(os.homedir(), 'AppData', 'Local', 'Programs', 'codebase-memory-mcp', 'codebase-memory-mcp.exe'),
      ]
    : [
        process.env.CBM_BIN,
        path.join(os.homedir(), '.local', 'bin', 'codebase-memory-mcp'),
        path.join(os.homedir(), 'bin', 'codebase-memory-mcp'),
        '/usr/local/bin/codebase-memory-mcp',
        '/usr/bin/codebase-memory-mcp',
      ];

function resolveBin() {
  for (const c of CANDIDATES) {
    if (c && fs.existsSync(c)) return c;
  }
  return 'codebase-memory-mcp';
}

const BIN = resolveBin();

function augment(tool, args) {
  return new Promise((resolve) => {
    const child = spawn(BIN, ['hook-augment'], {
      stdio: ['pipe', 'pipe', 'ignore'],
      env: { ...process.env, CBM_LOG_LEVEL: 'error' },
    });
    let out = '';
    child.stdout.on('data', (d) => (out += d.toString()));
    child.on('error', () => resolve(''));
    child.on('close', () => resolve(out));
    child.stdin.end(JSON.stringify({
      hook_event_name: 'PreToolUse',
      tool_name: tool,
      tool_input: args ?? {},
    }));
  });
}

export const CodebaseMemory = async () => ({
  'tool.execute.after': async (input, output) => {
    const tool = input?.tool === 'grep' ? 'Grep' : input?.tool === 'glob' ? 'Glob' : null;
    if (!tool) return;
    const extra = await augment(tool, output?.args);
    if (extra && typeof output?.output === 'string') {
      output.output += '\n' + extra;
    }
  },
});
// codebase-memory-mcp:end