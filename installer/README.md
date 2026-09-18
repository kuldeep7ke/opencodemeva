# OpenCode Meva Patch Installers

Drop-in "patches" that install the OpenCode Meva pack — `agents`, `skills`,
`commands`, `rules`, `hooks`, `mcp-configs`, `workflows`, `plugins` (Everything
Claude Code layout) — into the user's opencode config directory
(`~/.config/opencode`).

The patch is reversible: a marker file (`.opencodemeva.json`) records a SHA-256
per installed file, and unapplying removes only files that were not modified
after installation. Your overrides survive removal.

## What you get

- `installer/windows/opencodemeva-patch-setup-2.2.1.exe` — Inno Setup installer
  for Windows (silent-capable).
- `installer/linux/opencodemeva-patch_2.2.1_all.deb` — Debian/Ubuntu package;
  `opencodemeva-patch` command applies the pack per user.

Built artifacts land in `installer/dist/` (gitignored); `installer/_stage/`
holds staging trees for builds.

## Windows

Build locally (needs Node for the pack version and Inno Setup `ISCC.exe`):

```powershell
.\installer\windows\build.ps1
```

Result: `installer\dist\opencodemeva-patch-setup-2.2.1.exe`.

Silent install to a scratch location, patching a different config dir:

```powershell
$env:OPENCODE_CONFIG_TARGET = "$env:TEMP\ocmcfg"
.\installer\dist\opencodemeva-patch-setup-2.2.1.exe /VERYSILENT /SUPPRESSMSGBOXES /NORESTART
powershell -File "$env:TEMP\ocmcfg\.config\opencode\..\..\app\apply-patch.ps1" -Unapply
```

The installed `apply-patch.ps1` is the same engine the setup runs:

```powershell
powershell -File apply-patch.ps1            # apply
powershell -File apply-patch.ps1 -Unapply   # remove (keeps files you modified)
powershell -File apply-patch.ps1 -Force     # overwrite existing user files
```

Uninstall also triggers `-Unapply` automatically (hidden).

## Ubuntu / Debian

Build on any Debian-family machine (or CI):

```bash
sudo apt-get install -y dpkg-deb   # usually already present
./installer/linux/build-deb.sh
```

Result: `installer/dist/opencodemeva-patch_2.2.1_all.deb`.

Install and apply:

```bash
sudo dpkg -i installer/dist/opencodemeva-patch_2.2.1_all.deb
opencodemeva-patch            # applies to ~/.config/opencode
opencodemeva-patch --unapply  # remove patch
opencodemeva-patch --force    # overwrite existing user files
```

Everything is under `/opt/opencodemeva/pack`; the wrapper at `/usr/bin` targets
the invoking user (or `SUDO_USER`'s config when run via `sudo`).

## CI

`.github/workflows/build-installers.yml` builds both packages on
`workflow_dispatch` or a `v*` tag push and uploads them as artifacts.

## Design notes

- Default behavior never overwrites an existing user file. `--force`/`-Force`
  makes the patch authoritative.
- The marker is stored inside the target config dir, so it moves with the
  config and unapply is aware of where the patch was installed.
- `OPENCODE_CONFIG_TARGET` / `-Target` let you point at any directory (tests,
  WSL, other profiles).