#!/bin/bash
# Renders the PNG icons (PWA manifest, Apple touch icon) from the light logo.
# Needs inkscape and ImageMagick. Run from the repository root.
set -euo pipefail

src=src/assets/logo-light.svg
out=public/icons
mkdir -p "$out"
tmp=$(mktemp -d)
trap 'rm -rf "$tmp"' EXIT

# render the logo at size $1, padded onto a $2-sized canvas with background $3
render() {
  inkscape "$src" -w "$1" -h "$1" -o "$tmp/logo.png" 2>/dev/null
  magick -size "$2x$2" "xc:$3" "$tmp/logo.png" -gravity center -composite \
    -strip "$4"
}

# purpose "any": transparent, logo fills the icon
render 192 192 none "$out/manifest-icon-192.png"
render 512 512 none "$out/manifest-icon-512.png"
# purpose "maskable": logo inside the inner 80 % circle (safe zone), opaque
render 116 192 white "$out/manifest-icon-192.maskable.png"
render 308 512 white "$out/manifest-icon-512.maskable.png"
# iOS fills transparency with black and rounds the corners itself
render 148 180 white "$out/apple-icon-180.png"
