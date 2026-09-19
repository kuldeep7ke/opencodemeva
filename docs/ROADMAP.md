# Opencode Patch Roadmap

Status: maintainer planning draft, updated 2026-09-19 against release 2.2.1.

## Vision

Opencode Patch is the extension layer for your opencode CLI. Shared skills, rules, and agent guidance provide portable core workflows that work entirely offline in `~/.config/opencode`.

Three things follow from that:

1. **The repo is the product.** Curated skills, hooks, and rules are the surface people install. Anything that is not installed, tested, or read by someone should not be in the tree.
2. **Evidence over assertion.** A change earns trust through a test receipt, a capsule, and a reproducible verdict, not through a paragraph saying it works.
3. **Operator patterns travel.** Approval loops, channel discipline, agreement generation, and e-sign placement are useful to anyone running agents next to counterparties, customers, or money.

## Where we are

- The 2.2.1 release includes guided manifest-driven setup, install-state ownership, repair and uninstall.
- Catalog: 68 agents, 292 skills, 94 commands. The count is a liability as much as an asset. Overlapping and unreferenced skills exist.
- The README has one primary install section with per-OS details and release history linked to `CHANGELOG.md`.

## Plan

### Track A: condense

Cut what nobody reads or installs. Merge what overlaps. One README that reads top to bottom in one pass. Exit criteria: no zero-reference tracked doc outside `docs/releases/`, no deprecated skill still shipped by default, README under 1,200 lines.

### Track B: evidence

Implement and independently test an OS executor before enabling the gate: contain child processes, filesystem and network access, scrub inherited capabilities, enforce resource limits, and bind replay and result provenance. Keep execution disabled until those boundaries are proven.

### Track C: operator skills

The four desk-pattern skills are present: operator approval loop, counterparty channel discipline, master agreement drafting with bounded schedule append, and e-sign field placement guidance. Validate each with actual consumers before adding more.

### Track D: distribution

Keep the release path boring: tag on main, CI green at the exact head, packed artifact tested on three platforms.

## Next 90 days

Window: 2026-09-19 to 2026-12-18.

### September

- Release the updated opencode-focused patch with condensed docs
- README linear pass merged. Release notes move to `CHANGELOG.md` only.
- Remove deprecated skills from default install

### October

- `harness-optimizer` and `/harness-audit` produce gate receipts
- Capsule recording behind an opt-in hook flag
- First taskset beyond the example: 20 to 60 tasks over one real skill family
- Skill catalog review: every skill has a test, a command, an agent, or a README mention, or it is marked for removal

### November

- 2.3.0: condensation, eval frameworks, and operator skills in one release
- Retrospective grouping over recorded capsules for one task family, report only
- Forced-compaction invariance test in CI

### Decision points

- 2026-10-05: is the README under the line target with no test regressions? If not, cut scope rather than slipping the release.
- 2026-10-31: does a real taskset produce a stable verdict across three runs?
- 2026-11-30: did any outside user adopt a desk-pattern skill? If none, stop adding operator skills and fold the four into a single guide.

## Not on this roadmap

- Online reinforcement learning or weight updates from capsule data.
- Production transparency-log witnessing, GPU attestation, or key management inside the patch package.
- Automatic merge or release driven by a gate verdict. The gate stops changes. A person promotes them.
- Any desk, payment, provider, or counterparty integration. Those belong to the systems that own them.

## How to edit this file

Change the bracketed numbers first. Move items between months freely. When a line ships, delete it here and record it in `CHANGELOG.md`. Keep the file under 200 lines.
