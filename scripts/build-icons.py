"""Builds the favicon and app icons from assets/brand/escape-logo.png.

Run with `npm run icons:build` (needs Python 3 with Pillow).
The logo is trimmed to its artwork and centred on a white square so it stays
as large and legible as possible at tab size and on dark browser chrome.
"""

from pathlib import Path

from PIL import Image, ImageChops

ROOT = Path(__file__).resolve().parent.parent
SOURCE = ROOT / "assets" / "brand" / "escape-logo.png"
PADDING = 0.06  # of the square's side

logo = Image.open(SOURCE).convert("RGB")
white = Image.new("RGB", logo.size, "white")
# Bounding box of everything that isn't (near-)white.
diff = ImageChops.difference(logo, white).convert("L").point(lambda v: 255 if v > 24 else 0)
box = diff.getbbox()
if box is None:
    raise SystemExit("Logo appears to be blank")
art = logo.crop(box)

side = round(max(art.size) / (1 - 2 * PADDING))
square = Image.new("RGB", (side, side), "white")
square.paste(art, ((side - art.width) // 2, (side - art.height) // 2))
# Next.js only decodes icons (incl. PNGs inside .ico) stored as RGBA.
square = square.convert("RGBA")


def save(size: int, path: str) -> None:
    out = ROOT / path
    out.parent.mkdir(parents=True, exist_ok=True)
    square.resize((size, size), Image.LANCZOS).save(out, optimize=True)
    print(f"{path}  {size}×{size}")


save(512, "app/icon.png")
save(180, "app/apple-icon.png")
save(192, "public/icons/icon-192.png")
save(512, "public/icons/icon-512.png")

ico = ROOT / "app" / "favicon.ico"
square.resize((256, 256), Image.LANCZOS).save(ico, sizes=[(16, 16), (32, 32), (48, 48)])
print("app/favicon.ico  16, 32, 48")
