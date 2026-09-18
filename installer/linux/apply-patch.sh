#!/usr/bin/env bash
# apply-patch.sh - syncs the OpenCode Meva patch pack into ~/.config/opencode.
#
#   Apply:   apply-patch.sh
#   Unapply: apply-patch.sh --unapply
#
# Default target is ~/.config/opencode. Override with -T <dir> or the
# OPENCODE_CONFIG_TARGET env var. Existing user files are never overwritten
# unless --force is supplied.
set -u

PACK="/opt/opencodemeva/pack"
if [ ! -d "$PACK" ] && [ -d "$(dirname "$0")/pack" ]; then
  PACK="$(dirname "$0")/pack"
fi

VERSION="2.2.1"
MARKER_NAME=".opencodemeva.json"
DIRS="agents skills commands rules hooks mcp-configs workflows plugins"

UNAPPLY=0
QUIET=0
FORCE=0
TARGET=""

usage() {
  echo "usage: apply-patch.sh [--unapply] [--quiet] [--force] [-T <dir>]" >&2
  exit 2
}

while [ "$#" -gt 0 ]; do
  case "$1" in
    --unapply) UNAPPLY=1 ;;
    --quiet) QUIET=1 ;;
    --force) FORCE=1 ;;
    -T) TARGET="${2:-}"; shift ;;
    *) usage ;;
  esac
  shift
done

if [ -z "$TARGET" ] && [ -n "${OPENCODE_CONFIG_TARGET:-}" ]; then
  TARGET="$OPENCODE_CONFIG_TARGET"
fi
if [ -z "$TARGET" ]; then
  TARGET="$HOME/.config/opencode"
fi

DEST="$TARGET"
MARKER="$DEST/$MARKER_NAME"

log() {
  if [ "$QUIET" -eq 0 ]; then printf '%s\n' "$*"; fi
}

# Resolve a working Python 3 interpreter (needed for robust JSON/hashing).
PY_CMD="${PYTHON:-}"
if [ -z "$PY_CMD" ]; then
  if command -v python3 >/dev/null 2>&1 && python3 -c 'import sys' >/dev/null 2>&1; then
    PY_CMD="python3"
  elif command -v python >/dev/null 2>&1 && python -c 'import sys' >/dev/null 2>&1; then
    PY_CMD="python"
  else
    echo "python3 is required to apply the patch (set PYTHON to a python3 binary)" >&2
    exit 1
  fi
fi

if [ "$UNAPPLY" -eq 1 ]; then
  if [ ! -f "$MARKER" ]; then
    log "No patch marker found at $MARKER - nothing to undo."
    exit 0
  fi
  "$PY_CMD" - "$MARKER" "$DEST" "$FORCE" <<'PY'
import json, hashlib, os, sys

marker, dest, force = sys.argv[1], sys.argv[2], sys.argv[3] == "1"

def fhash(path):
    try:
        with open(path, "rb") as fh:
            return hashlib.sha256(fh.read()).hexdigest()
    except OSError:
        return ""

try:
    state = json.load(open(marker, encoding="utf-8"))
except Exception as exc:
    print(f"OpenCode Meva Patch: cannot read {marker}: {exc}", file=sys.stderr)
    sys.exit(1)

removed = kept = 0
for rel, meta in (state.get("files") or {}).items():
    full = os.path.join(dest, rel)
    if os.path.isfile(full):
        if force or fhash(full) == meta.get("srcHash"):
            os.remove(full)
            removed += 1
        else:
            kept += 1
try:
    os.remove(marker)
except OSError:
    pass
print(f"OpenCode Meva Patch: removed {removed} files (kept {kept} that were modified).")
if kept:
    print(f"Left modified files in place at: {dest}")
PY
  exit 0
fi

if [ ! -d "$PACK" ]; then
  echo "Patch pack not found at $PACK" >&2
  exit 1
fi

mkdir -p "$DEST"

# Copy pack files into the target. Never overwrite an existing file unless
# --force is given. The marker JSON (with per-file hashes, used by --unapply)
# is written afterwards by a python3 pass that re-scans src vs dest.
for dir in $DIRS; do
  src_dir="$PACK/$dir"
  [ -d "$src_dir" ] || continue
  src_root=$(readlink -f "$src_dir")
  rel_root=$(basename "$src_root")
  find "$src_root" -type f -print0 | while IFS= read -r -d '' src_file; do
    rel="$rel_root/${src_file#"$src_root"/}"
    dest_file="$DEST/$rel"
    if [ -f "$dest_file" ] && [ "$FORCE" -eq 0 ]; then
      continue
    fi
    mkdir -p "$(dirname "$dest_file")"
    cp -f "$src_file" "$dest_file"
  done
done

"$PY_CMD" - "$MARKER" "$PACK" "$DEST" <<'PY'
import hashlib, json, os, shutil, sys
from datetime import datetime, timezone

marker, pack, dest = sys.argv[1], sys.argv[2], sys.argv[3]
dirs = ["agents", "skills", "commands", "rules", "hooks", "mcp-configs", "workflows", "plugins"]

def fhash(path):
    try:
        with open(path, "rb") as fh:
            return hashlib.sha256(fh.read()).hexdigest()
    except OSError:
        return ""

files = {}
stats = {"applied": 0, "skipped": 0}
for d in dirs:
    src_dir = os.path.join(pack, d)
    if not os.path.isdir(src_dir):
        continue
    rel_root = os.path.basename(os.path.normpath(src_dir))
    for root, _dirs, names in os.walk(src_dir):
        for name in names:
            src = os.path.join(root, name)
            if not os.path.isfile(src):
                continue
            rel = rel_root + "/" + os.path.relpath(src, src_dir)
            dest_file = os.path.join(dest, rel.replace("/", os.sep))
            files[rel] = {"srcHash": fhash(src), "present": True}
            if os.path.isfile(dest_file):
                if fhash(dest_file) == files[rel]["srcHash"]:
                    stats["skipped"] += 1
                    continue
                shutil.copyfile(src, dest_file)
                stats["applied"] += 1
            else:
                os.makedirs(os.path.dirname(dest_file), exist_ok=True)
                shutil.copyfile(src, dest_file)
                stats["applied"] += 1

state = {
    "version": "2.2.1",
    "appliedAt": datetime.now(timezone.utc).isoformat(),
    "source": pack,
    "dirs": dirs,
    "files": files,
}
with open(marker, "w", encoding="utf-8") as fh:
    json.dump(state, fh, indent=2)
print(f"OpenCode Meva Patch {state['version']} applied to {dest}")
print(f"  {stats['applied']} files installed, {stats['skipped']} already present (kept yours).")
PY

if [ "$QUIET" -eq 0 ]; then
  echo ""
  echo "Next step: restart your terminal, close and reopen opencode if it's running,"
  echo "then ask opencode for @planner, @code-reviewer, @security-reviewer or load a skill."
fi