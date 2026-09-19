/**
 * Regression coverage for install/uninstall clarity in README.md.
 *
 * The README is opencode-only: Windows .exe, Debian .deb, and source builds
 * targeting ~/.config/opencode. These tests pin that contract.
 */

const assert = require('assert');
const fs = require('fs');
const path = require('path');

const README = path.join(__dirname, '..', '..', 'README.md');
const RULES_README = path.join(__dirname, '..', '..', 'rules', 'README.md');
const CODEX_AGENTS = path.join(__dirname, '..', '..', '.codex', 'AGENTS.md');

function test(name, fn) {
  try {
    fn();
    console.log(`  \u2713 ${name}`);
    return true;
  } catch (error) {
    console.log(`  \u2717 ${name}`);
    console.log(`    Error: ${error.message}`);
    return false;
  }
}

function runTests() {
  console.log('\n=== Testing install README clarity ===\n');

  let passed = 0;
  let failed = 0;

  const readme = fs.readFileSync(README, 'utf8');
  const rulesReadme = fs.readFileSync(RULES_README, 'utf8');
  const codexAgents = fs.readFileSync(CODEX_AGENTS, 'utf8');

  if (test('README leads with the three opencode install paths', () => {
    assert.ok(
      readme.includes('### Windows (10/11)'),
      'README should document the Windows installer path'
    );
    assert.ok(
      readme.includes('### Ubuntu / Debian'),
      'README should document the Debian package path'
    );
    assert.ok(
      readme.includes('### Build from Source (Any OS)'),
      'README should document the source-build path'
    );
    assert.ok(
      readme.includes('https://github.com/kuldeep7ke/opencodemeva/releases/latest'),
      'README should link installers to the opencodemeva releases page'
    );
    assert.ok(
      readme.includes('npx opencode-patch install'),
      'README should document the opencode-patch install command'
    );
  })) passed++; else failed++;

  if (test('README documents reset and uninstall flow', () => {
    assert.ok(
      readme.includes('## Uninstall'),
      'README should have a visible uninstall section'
    );
    assert.ok(
      readme.includes('npx opencode-patch uninstall --dry-run'),
      'README should document dry-run uninstall'
    );
    assert.ok(
      readme.includes('npx opencode-patch uninstall'),
      'README should document uninstall'
    );
    assert.ok(
      readme.includes('Restores your original opencode config'),
      'README should explain uninstall safety boundaries'
    );
  })) passed++; else failed++;

  if (test('README stays opencode-only', () => {
    for (const banned of [
      'Claude Code',
      'claude.ai/code',
      'ecc-universal',
      'ecc@ecc',
      'affaan-m',
      'ecc.tools',
      'discord.gg',
      '/plugin marketplace add',
      'Kimi Code',
    ]) {
      assert.ok(
        !readme.includes(banned),
        `README should not reference ${banned}`
      );
    }
    assert.ok(
      !/sponsor/i.test(readme),
      'README should not reference sponsors'
    );
    assert.ok(
      !/\bnpx ecc\s/.test(readme),
      'README one-shot commands should use the opencode-patch package name'
    );
  })) passed++; else failed++;

  if (test('README documents low-context no-hooks install path', () => {
    assert.ok(
      readme.includes('npx opencode-patch install --profile minimal'),
      'README should document the minimal profile command'
    );
    assert.ok(
      readme.includes('Start with `rules/common` plus one language pack'),
      'README should steer users away from copying every rules directory'
    );
  })) passed++; else failed++;

  if (test('README binds the install command to the release version', () => {
    const version = JSON.parse(fs.readFileSync(path.join(__dirname, '..', '..', 'package.json'))).version;
    assert.ok(
      readme.includes(`opencodemeva/releases`),
      'README should link to the release distribution surface'
    );
    assert.ok(
      readme.includes(version) || readme.includes('v2.2.1'),
      'README should reference the current release version'
    );
  })) passed++; else failed++;

  if (test('README documents consult-based component discovery', () => {
    assert.ok(
      readme.includes('### Choose Components Only'),
      'README should surface component discovery before install steps'
    );
    assert.ok(
      readme.includes('npx opencode-patch install --skills tdd-workflow,security-review'),
      'README should document the skill-scoped install command'
    );
  })) passed++; else failed++;

  if (test('rules README mirrors namespaced install path', () => {
    assert.ok(
      rulesReadme.includes('mkdir -p ~/.claude/rules/ecc'),
      'rules README should create the user-level rules namespace'
    );
    assert.ok(
      rulesReadme.includes('cp -r rules/common ~/.claude/rules/ecc/'),
      'rules README should copy common rules under ~/.claude/rules/ecc/'
    );
    assert.ok(
      rulesReadme.includes('cp -r rules/typescript ~/.claude/rules/ecc/'),
      'rules README should copy language rules under ~/.claude/rules/ecc/'
    );
    assert.ok(
      rulesReadme.includes('mkdir -p .claude/rules/ecc'),
      'rules README should document the project-local namespace'
    );
    assert.ok(
      !rulesReadme.includes('~/.claude/rules/typescript'),
      'rules README should not recommend flat user-level rule destinations'
    );
  })) passed++; else failed++;

  if (test('packaged Codex guidance keeps its trusted hook subset wording', () => {
    assert.ok(
      codexAgents.includes('Reviewed native subset with explicit trust in `/hooks`'),
      'Packaged Codex guidance should describe the shipped trusted hook subset'
    );
    assert.ok(
      !/not yet supported|codex lacks hooks|security without hooks/i.test(codexAgents),
      'Packaged Codex guidance should not deny native hook support'
    );
  })) passed++; else failed++;

  console.log(`\nResults: Passed: ${passed}, Failed: ${failed}`);
  process.exit(failed > 0 ? 1 : 0);
}

runTests();
