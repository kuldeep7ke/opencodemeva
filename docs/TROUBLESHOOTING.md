# Troubleshooting

Common issues and workarounds for Opencode Patch users.

## Opencode Patch Dashboard Does Not Start

**Symptoms:** `npm run dashboard` or `python3 ecc_dashboard.py` fails, often with `ModuleNotFoundError: No module named 'tkinter'`.

**What helps:**

- The GUI dashboard needs Tkinter, which many Python installs omit:
  - Debian/Ubuntu: `sudo apt-get install python3-tk`
  - Fedora: `sudo dnf install python3-tkinter`
  - macOS (Homebrew): `brew install python-tk`
  - Windows: re-run the python.org installer and enable "tcl/tk and IDLE"
- Or use the browser dashboard, which only needs Node: `npm run dashboard:web`, then open the printed localhost URL.
- Both commands must be run from a full clone of the repo (`git clone https://github.com/kuldeep7ke/opencodemeva`), not from inside the opencode plugin directory — plugin installs do not ship `package.json` scripts.

## Hook Edits Do Not Hot-Reload

**Symptoms:** Changes to hook configuration do not take effect until the session is restarted.

**What helps:**

- Restart the opencode session after changing hooks.

## Repeated Overload Responses

**Symptoms:** opencode starts failing under high hook/tool/context pressure.

**What helps:**

- Reduce tool-definition pressure with `ENABLE_TOOL_SEARCH=auto:5` if your setup supports it.
- Lower `MAX_THINKING_TOKENS` for routine work.
- Disable unused MCP servers per project.
- Compact manually at natural breakpoints instead of waiting for auto-compaction.

## Related Docs

- [hook-bug-workarounds.md](./hook-bug-workarounds.md) for the shorter hook/compaction/MCP recovery checklist.
- [hooks/README.md](../hooks/README.md) for hook lifecycle and exit-code behavior.
- [token-optimization.md](./token-optimization.md) for cost and context management settings.
