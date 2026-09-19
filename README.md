# opencodemeva

Curated opencode option pack + a small patch installer for Windows and
Ubuntu/Debian.

`opencodemeva` adds a hand-picked set of high-quality opencode options to a
specific user's `~/.config/opencode/` — nothing more. It never pulls READMEs,
guides, or memory/scratch files, and it builds its own config from scratch.

This is the source of truth for the opencode configuration pack. The repo is a
**patch installer** — it installs curated [opencode](https://opencode.ai)
configuration into a user's opencode settings directory.

## What it installs

| Category | Count | What |
| --- | --- | --- |
| **Agents** (`agents/`) | 37 | coding, design, security, database, go, flutter, java, laravel, reviews, vibe testing, seo, multimodal-looker |
| **Commands** (`commands/`) | 26 | `/code-review`, `/design`, `/security`, `/tdd`, `/plan`, `/go-build`, `/go-review`, ... |
| **Skills** (`skills/`) | 79 | patterns, design, imagegen, ui-demo, theme-factory, brainstorming, deep-research, ... |
| **Plugins** (`plugins/`) | 9 | console-log-warning, dangerous-command-blocker, env-protection, notification, pr-helper, pre-commit-check, session-summary, tool-guardrails, type-checker |
| **MCP** servers | 6 | context7, playwright, sequential-thinking, memory, firecrawl, postgres |
| **LSP** | on | `lsp: true` |
| **Instructions** | 1 | global `AGENTS.md` for opencode sessions |

Everything lives under `options/` and is installed verbatim into
`~/.config/opencode/`.

## Install

Requirements: **Node.js >= 18**.

### Windows (PowerShell)

```powershell
.\install.ps1
```

### Ubuntu / Debian (Bash)

```bash
./install.sh
```

### From the npm-style CLI (anywhere)

```bash
node src/cli.js install
```

All three run the same installer. Existing user config is **never clobbered**:

- `opencode.json` is deep-merged; **your settings win** on conflicts.
- Agents/commands/skills/plugins that already exist are kept (`--overwrite`
  replaces them).
- Your original `opencode.json` is backed up and restored on uninstall.

## Usage

```
opencodemeva install    [--target <dir>] [--overwrite] [--dry-run]
opencodemeva uninstall  [--target <dir>] [--dry-run]
opencodemeva status     [--target <dir>]
opencodemeva validate
```

- `--target <dir>` — install into an explicit config dir (default:
  `~/.config/opencode`).
- `--overwrite` — replace existing user files instead of keeping them.
- `--dry-run` — preview what would change without touching anything.
- `--yes` / `-y` — skip interactive confirmation.

After install, **restart opencode** to load the new config (config is read at
startup, not hot-reloaded).

## What it protects

- Never reads or overwrites `.env` files, keys, or credentials.
- Leaves `~/.ssh`, `~/.aws`, `~/.gnupg`, `~/.kube`, `~/.docker` etc. out of
  external-directory access.
- Keeps a manifest (`opencodemeva.manifest.json`) so `uninstall` removes only
  what it installed.

## Development

```bash
npm run validate       # frontmatter/config checks on the options bundle
npm test               # end-to-end install/uninstall round-trip
```

## License

MIT — free and public domain spirit. See [LICENSE](LICENSE).