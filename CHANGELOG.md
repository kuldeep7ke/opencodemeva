# Changelog

## Unreleased

### Fixed

- Opencode settings updates now tolerate a missing Windows device ID while retaining full-precision inode checks and strict matching when both device IDs are available.

## 2.2.0 - 2026-08-25

### Added

- Guided, manifest-driven setup for opencode, with exact install-state ownership, health checks, repair, and uninstall workflows.
- New workflow and operator capabilities including multi-model council review, dev-team collaboration, agent evaluation, living-docs governance, secure terminal opening, and TasteForge multimodal workflows.
- Expanded release artifact lifecycle testing, Docker-based CLI testing, and stronger Python validation.

### Changed

- Default MCP connector set reduced to a single connector (`chrome-devtools`) per the new connector policy (`docs/MCP-CONNECTOR-POLICY.md`). The six previous defaults (`github`, `context7`, `exa`, `memory`, `playwright`, `sequential-thinking`) were retired after the June 2026 audit: their jobs are covered by skills wrapping CLIs/REST APIs (`github-ops`, `documentation-lookup`, `exa-search`, e2e skills) or by harness-native features (memory, extended thinking, web search). All six remain opt-in via `mcp-configs/mcp-servers.json`.
- Opencode home installs now use the canonical `~/.config/opencode` location, safely discover and migrate unchanged managed files from legacy `~/.opencode` installs, and preserve modified legacy files for review. Bundled agents inherit the model selected by the user.
- `skill-comply` is now part of the install manifest and npm distribution, with generated Python caches excluded from both install and package surfaces.
- Release automation now verifies the tag is exactly on `origin/main`, fails closed on npm registry errors, tests the exact packed artifact across Linux, macOS, and Windows, publishes stable versions to a staging dist-tag, verifies registry bytes before promoting `latest`, creates the GitHub Release after promotion, and uses reviewed release notes.

### Fixed

- `opencode-patch memory` writes and `--body-file` reads failed on Windows under Node 22.12-22.16 and 24.0-24.1. The memory vault's TOCTOU guard no longer depends on the runtime's patch level. The guard's stat calls now request `BigInt` values, so Windows file IDs past `Number.MAX_SAFE_INTEGER` can no longer collapse two distinct files into one identity.
- Selective reinstall now merges the prior ownership ledger, so later module additions do not orphan files from earlier installs and uninstall removes the complete managed surface.
- The experimental Nasiko CLI lifecycle bridge now recovers locks only after confirming the recorded owner is dead, preserves replacement locks, strictly rejects malformed tar sizes, padding, terminators, and trailing data, and fails uninstall when staged files remain.
- Hook, plan-canvas, session, memory, observer, skill-evolution, and Windows compatibility regressions fixed across the runtime.

### Release audit

- Audited the complete delta from `v2.1.0`: 108 commits across 530 files, with 40,299 insertions and 4,679 deletions on the pre-release baseline.
- The release gate installs and exercises the exact npm archive, including cumulative ownership, doctor, drift detection, repair, uninstall, and user-file preservation.

## 2.0.0 - 2026-06-09

### Added

- `orch-*` orchestrator skill family and dynamic workflow team orchestration.
- `kubernetes-patterns` skill, worktree-lifecycle service, MCP inventory, and opencode session adapters.

### Fixed

- Plugin hooks silently no-oped on Node 21+ (`require.main` undefined under `node -e`).
- Windows reliability: plugin-root normalization, stdin prompt passing, symlink/chmod test guards.
- Session-end `$`-sequence corruption, project-detect boundary matching, install manifest gaps, corrupted legacy shim truncation.

### Changed

- Version graduated to 2.0.0 stable across package, plugin, opencode, and agent metadata.
- Smaller default opencode install surface; `rules/zh` removed from the always-loaded default install.

---

*Note: Earlier history has been condensed. See Git history for full details.*
