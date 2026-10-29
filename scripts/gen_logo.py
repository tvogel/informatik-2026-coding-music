"""Generates the course logo: beamed eighth notes with lily-pad note heads + bits.

Usage:
    python3 scripts/gen_logo.py light > src/assets/logo-light.svg
    python3 scripts/gen_logo.py dark > src/assets/logo-dark.svg
    python3 scripts/gen_logo.py auto > public/favicon.svg
"""
import math
import sys

TEAL, GREEN, YELLOW, LIME, DARK = "#00aca9", "#13a538", "#ffcc00", "#afca0b", "#00712f"


def pad(cx, cy, rx, ry, rot, notch_at, notch_width, fill):
    """Ellipse with a wedge cut from the centre to the rim (lily pad / note head)."""
    t1 = math.radians(notch_at - notch_width / 2)
    t2 = math.radians(notch_at + notch_width / 2)
    p = lambda t: (rx * math.cos(t), ry * math.sin(t))
    (x1, y1), (x2, y2) = p(t1), p(t2)
    d = f"M0 0L{x2:.2f} {y2:.2f}A{rx} {ry} 0 1 1 {x1:.2f} {y1:.2f}Z"
    return f'<path transform="translate({cx} {cy}) rotate({rot})" d="{d}" fill="{fill}"/>'


def logo(stem_color):
    parts = []
    # bits "1 0 1" top left: bar, ring, bar
    parts.append(f'<rect x="5" y="6" width="3.6" height="13" rx="1.8" fill="{LIME}"/>')
    parts.append(f'<rect x="12.2" y="7.3" width="6.6" height="10.4" rx="3.3" fill="none" stroke="{YELLOW}" stroke-width="2.6"/>')
    parts.append(f'<rect x="22.4" y="6" width="3.6" height="13" rx="1.8" fill="{TEAL}"/>')
    # stems + beam
    parts.append(f'<rect x="28.2" y="17" width="3.4" height="30" fill="{stem_color}"/>')
    parts.append(f'<rect x="54.2" y="11" width="3.4" height="30" fill="{stem_color}"/>')
    parts.append(f'<path d="M28.2 15.5L57.6 8.5V15.5L28.2 22.5Z" fill="{stem_color}"/>')
    # lily-pad note heads, notch pointing down-left like the pads in the school logo
    parts.append(pad(21.5, 49.5, 10.5, 7.6, -22, 145, 20, GREEN))
    parts.append(pad(47.5, 43.5, 10.5, 7.6, -22, 145, 20, TEAL))
    return "\n  ".join(parts)


mode = sys.argv[1] if len(sys.argv) > 1 else "auto"
if mode == "auto":
    # dark green stems in light mode, lighter green on dark backgrounds
    body = logo("STEM").replace('fill="STEM"', 'class="stem"')
    style = (f"<style>.stem{{fill:{DARK}}}"
             f"@media (prefers-color-scheme:dark){{.stem{{fill:{GREEN}}}}}</style>")
else:
    body = logo(DARK if mode == "light" else GREEN)
    style = ""
print(f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">{style}\n  {body}\n</svg>')
