#!/usr/bin/env bash
# build-deb.sh - assemble installer/linux into a .deb package for Ubuntu/Debian.
#
# Requires: dpkg-deb (present on Ubuntu/Debian; not needed to inspect output).
# Intended primarily for CI (ubuntu runner); runnable on any Debian family box.
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
HERE="$REPO_ROOT/installer/linux"
VERSION="2.2.1"
PKG="opencodemeva-patch"
OUT_DIR="$REPO_ROOT/installer/dist"
STAGE="$REPO_ROOT/installer/_stage/deb"

PACK_DIRS="agents skills commands rules hooks mcp-configs workflows plugins"

rm -rf "$STAGE"
mkdir -p "$STAGE/DEBIAN" \
         "$STAGE/opt/opencodemeva/pack" \
         "$STAGE/usr/bin" \
         "$STAGE/usr/share/applications" \
         "$STAGE/usr/share/icons/hicolor/256x256/apps" \
         "$STAGE/usr/share/icons/hicolor/512x512/apps" \
         "$STAGE/usr/share/doc/$PKG"

# Debian control metadata (no exec bit, generated fresh each build).
cp "$HERE/debian/DEBIAN/control" "$STAGE/DEBIAN/control"
printf '%s\n' \
  "The OpenCode Meva patch pack is installed to /opt/opencodemeva/pack." \
  "Run 'opencodemeva-patch' to apply it to your ~/.config/opencode." \
  "Run 'opencodemeva-patch --unapply' to remove it again." \
  "The marker .opencodemeva.json records per-file checksums so user-edited" \
  "files are left alone on removal." \
  > "$STAGE/usr/share/doc/$PKG/README"

cp "$HERE/opencodemeva-patch" "$STAGE/usr/bin/opencodemeva-patch"
cp "$HERE/apply-patch.sh" "$STAGE/opt/opencodemeva/apply-patch.sh"
cp "$HERE/debian/usr/share/applications/opencodemeva-patch.desktop" \
   "$STAGE/usr/share/applications/opencodemeva-patch.desktop"

cp "$REPO_ROOT/installer/assets/appicon-256.png" \
   "$STAGE/usr/share/icons/hicolor/256x256/apps/opencodemeva.png"
cp "$REPO_ROOT/installer/assets/appicon-512.png" \
   "$STAGE/usr/share/icons/hicolor/512x512/apps/opencodemeva.png"

cp "$HERE/debian/DEBIAN/postinst" "$STAGE/DEBIAN/postinst"
cp "$HERE/debian/DEBIAN/postrm" "$STAGE/DEBIAN/postrm"
chmod 0755 "$STAGE/usr/bin/opencodemeva-patch" \
           "$STAGE/opt/opencodemeva/apply-patch.sh" \
           "$STAGE/DEBIAN/postinst" \
           "$STAGE/DEBIAN/postrm"

# Stage the pack itself, excluding junk that should never ship.
for dir in $PACK_DIRS; do
  src="$REPO_ROOT/$dir"
  [ -d "$src" ] || { echo "warning: missing pack dir $dir" >&2; continue; }
  cp -a "$src" "$STAGE/opt/opencodemeva/pack/$dir"
done
find "$STAGE/opt/opencodemeva/pack" -type d \( -name __pycache__ -o -name node_modules -o -name .git \) -prune -exec rm -rf {} +
find "$STAGE/opt/opencodemeva/pack" -type f -name '*.pyc' -delete || true

mkdir -p "$OUT_DIR"
DEB="$OUT_DIR/${PKG}_${VERSION}_all.deb"
dpkg-deb --build --root-owner-group "$STAGE" "$DEB" >/dev/null

(cd "$OUT_DIR" && sha256sum "$(basename "$DEB")" > SHA256SUMS.txt)
echo "Built: $DEB"
(cd "$OUT_DIR" && cat SHA256SUMS.txt)