---
name: ImageMagick compositing colorspace gotcha
description: Why color screenshots desaturate when composited onto a white/rounded card, and how to fix
---

# Color loss when compositing onto an achromatic base

When building framed marketing graphics (e.g. a phone screenshot on a white rounded "card"), compositing a **color** image over an **all-white** base silently desaturates the whole result to grayscale.

**Why:** An all-white (achromatic) canvas like `magick -size WxH xc:none -fill white -draw "roundrectangle ..."` is saved by ImageMagick as a **Grayscale** PNG (auto-grayscale optimization on write). The first/base image in a `-composite` determines the result colorspace, so compositing a color image over a Gray base yields a Gray result — every color washes toward white/gray. `-colorspace sRGB` on the base does **not** help: the achromatic image is still re-reduced to Gray on write.

**How to apply:** Force the base to true RGBA by writing it with the `png32:` prefix (and read/compose normally), e.g. `... -depth 8 png32:/tmp/card_base.png`, then `magick card_base.png photo.png -compose over -composite png32:/tmp/card.png`. Verify with `magick identify -format '%[type] %[colorspace]'` — base should be non-Gray and the result `TrueColorAlpha sRGB`.

**Rounded corners that keep color:** use an alpha mask with DstIn — `magick img.png mask.png -alpha set -compose DstIn -composite out.png` (mask = `xc:none -fill white -draw roundrectangle`). Avoid `-alpha off -compose CopyOpacity`, which behaved unreliably here.

Render SVG→PNG that works: `magick -background none -density 192 svg:in.svg -resize WxH png32:out.png`. Available fonts: DejaVu-Sans / DejaVu-Sans-Bold. Use `magick`, never deprecated `convert`.
