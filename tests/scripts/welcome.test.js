'use strict';

const assert = require('assert');
const path = require('path');
const { spawnSync } = require('child_process');
const { version } = require('../../package.json');

const repoRoot = path.resolve(__dirname, '..', '..');
const eccScript = path.join(repoRoot, 'scripts', 'ecc.js');

let passed = 0;
let failed = 0;

function test(name, fn) {
  try {
    fn();
    console.log(`  ✓ ${name}`);
    passed += 1;
  } catch (error) {
    console.log(`  ✗ ${name}`);
    console.log(`    Error: ${error.message}`);
    failed += 1;
  }
}

function runEcc(args, env = {}) {
  return spawnSync(process.execPath, [eccScript, ...args], {
    cwd: repoRoot,
    encoding: 'utf8',
    env: { ...process.env, NO_COLOR: '1', ...env },
  });
}

function containsTerminalControlBytes(value) {
  return Array.from(value).some(character => {
    const codePoint = character.codePointAt(0);
    return codePoint <= 0x1f || (codePoint >= 0x7f && codePoint <= 0x9f);
  });
}

console.log('\n=== Opencode Patch welcome command tests ===\n');

test('opencode-patch welcome renders the install artwork for captured agent output', () => {
  const result = runEcc(['welcome']);

  assert.strictEqual(result.status, 0, result.stderr);
  assert.match(result.stdout, /Welcome to Opencode Patch!/);
  assert.ok(result.stdout.includes(`v${version}`));
  assert.match(result.stdout, /GitHub:\s+https:\/\/github\.com\/kuldeep7ke\/opencodemeva/);
  assert.match(result.stdout, /Releases:\s+https:\/\/github\.com\/kuldeep7ke\/opencodemeva\/releases/);
  assert.strictEqual(result.stderr, '');
});

test('opencode-patch welcome disables ANSI color when stdout is redirected', () => {
  const env = { ...process.env, TERM: 'xterm-256color' };
  delete env.NO_COLOR;
  const result = spawnSync(process.execPath, [eccScript, 'welcome'], {
    cwd: repoRoot,
    encoding: 'utf8',
    env,
  });

  assert.strictEqual(result.status, 0, result.stderr);
  assert.strictEqual(result.stdout.includes('\u001b['), false);
});

test('opencode-patch welcome supports explicit update and configured outcomes', () => {
  const cases = [
    ['updated', /Opencode Patch is updated/],
    ['configured', /Opencode Patch is configured/],
    ['migrated', /Opencode Patch is configured/],
    ['resumed', /Opencode Patch is configured/],
    ['already-migrated', /Opencode Patch is configured/],
  ];

  for (const [action, expected] of cases) {
    const result = runEcc(['welcome', '--action', action]);
    assert.strictEqual(result.status, 0, result.stderr);
    assert.match(result.stdout, expected);
  }
});

test('opencode-patch welcome renders a provider-verified installed version', () => {
  const result = runEcc(['welcome', '--version', '2.1.0']);

  assert.strictEqual(result.status, 0, result.stderr);
  assert.match(result.stdout, /v2\.1\.0/);
});

test('opencode-patch welcome rejects unsafe version text', () => {
  const result = runEcc(['welcome', '--version', '2.1.0\u001b[31m']);

  assert.strictEqual(result.status, 1);
  assert.match(result.stderr, /Invalid --version value/);
  assert.strictEqual(containsTerminalControlBytes(result.stderr.trimEnd()), false);
  assert.strictEqual(result.stdout, '');
});

test('opencode-patch welcome keeps parser error output free of terminal control bytes', () => {
  const actionResult = runEcc(['welcome', '--action', 'broken\u001b[31m']);
  const argumentResult = runEcc(['welcome', '--bad\u001b[31m']);

  for (const result of [actionResult, argumentResult]) {
    assert.strictEqual(result.status, 1);
    assert.strictEqual(containsTerminalControlBytes(result.stderr.trimEnd()), false);
    assert.strictEqual(result.stdout, '');
  }
});

test('opencode-patch welcome rejects unknown actions before rendering', () => {
  const result = runEcc(['welcome', '--action', 'broken']);

  assert.strictEqual(result.status, 1);
  assert.match(result.stderr, /Invalid --action value/);
  assert.strictEqual(result.stdout, '');
});

console.log(`\nResults: Passed: ${passed}, Failed: ${failed}\n`);
if (failed > 0) process.exit(1);
