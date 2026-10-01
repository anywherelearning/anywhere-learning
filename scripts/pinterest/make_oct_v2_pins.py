"""October 2026 v2 batch: photo-led pins built from Amelie's own photos.

Follows Pinterest's own creative research (Academy 4Cs, Sep 2026):
real photo in the centre, copy only at the top and bottom, warm palette,
faces where possible, small centred wordmark (never lower-right).

Three layouts rotate so no two consecutive days and no two versions of the
same link look alike:
  band    - cream headline band, full-width photo, forest footer band
  frame   - warm colour ground, photo as a bordered card in the middle
  overlay - full-bleed photo, soft dark gradients top and bottom for text

Usage:
  python3 scripts/pinterest/make_oct_v2_pins.py            # all 22
  python3 scripts/pinterest/make_oct_v2_pins.py --only 7   # one pin
Output: ~/Desktop/Anywhere Learning/Pinterest/Oct2026 v2/
"""
import argparse
import json
import os

from PIL import Image, ImageDraw, ImageFilter, ImageFont, ImageOps

HERE = os.path.dirname(os.path.abspath(__file__))
FONT_DIR = os.path.join(HERE, "fonts")
SPEC = os.path.join(HERE, "oct-v2-content.json")
PHOTOS = os.path.expanduser("~/Desktop/Anywhere Learning/Photos")
OUT = os.path.expanduser("~/Desktop/Anywhere Learning/Pinterest/Oct2026 v2")

W, H = 1000, 1500
CREAM = (250, 249, 246)
WHITE = (255, 255, 255)
FOREST = (88, 129, 87)
FOREST_DARK = (61, 92, 59)
GOLD = (212, 163, 115)
GOLD_LIGHT = (232, 201, 154)
GOLD_DARK = (166, 124, 82)
TERRA = (196, 131, 106)
INK = (44, 50, 43)
GROUNDS = {
    "gold": (240, 222, 196),
    "terra": (240, 214, 200),
    "sage": (222, 231, 214),
    "cream": (245, 239, 228),
}


def dm(size, weight=700):
    f = ImageFont.truetype(os.path.join(FONT_DIR, "DMSans.ttf"), size)
    f.set_variation_by_axes([min(size, 40), weight])
    return f


def script(size):
    f = ImageFont.truetype(os.path.join(FONT_DIR, "DancingScript.ttf"), size)
    f.set_variation_by_axes([700])
    return f


def wrap(d, text, font, max_w):
    words, lines, cur = text.split(), [], ""
    for w in words:
        t = (cur + " " + w).strip()
        if d.textlength(t, font=font) <= max_w:
            cur = t
        else:
            if cur:
                lines.append(cur)
            cur = w
    if cur:
        lines.append(cur)
    return lines


def balance(d, words, font, n):
    """Split words into n lines minimising the widest line (no orphans)."""
    best, best_w = None, 1e9
    def rec(start, k, acc):
        nonlocal best, best_w
        if k == 1:
            line = " ".join(words[start:])
            cand = acc + [line]
            mw = max(d.textlength(l, font=font) for l in cand)
            if mw < best_w:
                best, best_w = cand, mw
            return
        for i in range(start + 1, len(words) - k + 2):
            rec(i, k - 1, acc + [" ".join(words[start:i])])
    rec(0, n, [])
    return best, best_w


def fit_lines(d, text, max_w, start, weight, max_lines, min_size=44):
    words = text.split()
    size = start
    while size >= min_size:
        f = dm(size, weight)
        for n in range(1, min(max_lines, len(words)) + 1):
            lines, mw = balance(d, words, f, n)
            if mw <= max_w:
                return f, lines
        size -= 2
    f = dm(min_size, weight)
    return f, wrap(d, text, f, max_w)


def ink_h(d, font):
    b = d.textbbox((0, 0), "Hg", font=font)
    return b[3] - b[1]


def draw_center_lines(d, lines, font, y, fill, gap=10, accent=None, accent_fill=None):
    """Draw centred lines starting at y; returns bottom y. `accent` words get accent_fill."""
    lh = ink_h(d, font)
    for line in lines:
        w = d.textlength(line, font=font)
        x = (W - w) / 2
        if accent:
            for word in line.split(" "):
                wf = accent_fill if word.strip(".,?!:").lower() in accent else fill
                d.text((x, y), word, font=font, fill=wf)
                x += d.textlength(word + " ", font=font)
        else:
            d.text((x, y), line, font=font, fill=fill)
        y += lh + gap
    return y - gap


def cover(photo, box_w, box_h, fx=0.5, fy=0.5):
    im = ImageOps.exif_transpose(Image.open(os.path.join(PHOTOS, photo))).convert("RGB")
    scale = max(box_w / im.width, box_h / im.height)
    im = im.resize((round(im.width * scale), round(im.height * scale)), Image.LANCZOS)
    left = min(max(0, round(im.width * fx - box_w / 2)), im.width - box_w)
    top = min(max(0, round(im.height * fy - box_h / 2)), im.height - box_h)
    return im.crop((left, top, left + box_w, top + box_h))


def warm(im, amt=0.06):
    """Gentle warm grade so every photo sits in the same palette."""
    r, g, b = im.split()
    r = r.point(lambda v: min(255, int(v * (1 + amt))))
    b = b.point(lambda v: int(v * (1 - amt)))
    return Image.merge("RGB", (r, g, b))


def rounded(im, radius):
    mask = Image.new("L", im.size, 0)
    ImageDraw.Draw(mask).rounded_rectangle([0, 0, im.width, im.height], radius, fill=255)
    out = Image.new("RGBA", im.size)
    out.paste(im, (0, 0), mask)
    return out


def badge(base, cx, cy, big, small, fill=GOLD, text=WHITE, r=92):
    lay = Image.new("RGBA", base.size, (0, 0, 0, 0))
    d = ImageDraw.Draw(lay)
    sh = Image.new("RGBA", base.size, (0, 0, 0, 0))
    ImageDraw.Draw(sh).ellipse([cx - r, cy - r + 8, cx + r, cy + r + 8], fill=(30, 30, 20, 70))
    base.alpha_composite(sh.filter(ImageFilter.GaussianBlur(8)))
    d.ellipse([cx - r, cy - r, cx + r, cy + r], fill=fill + (255,), outline=WHITE + (255,), width=6)
    fb = dm(78 if len(big) <= 2 else 58, 800)
    fs = dm(24, 700)
    bw, bh = d.textlength(big, font=fb), ink_h(d, fb)
    sw = d.textlength(small, font=fs)
    total = bh + 10 + ink_h(d, fs)
    y0 = cy - total / 2 - 6
    d.text((cx - bw / 2, y0), big, font=fb, fill=text)
    d.text((cx - sw / 2, y0 + bh + 18), small, font=fs, fill=text)
    base.alpha_composite(lay)


def wordmark_block(d, y, color, url_color):
    f = script(44)
    t = "Anywhere Learning"
    d.text(((W - d.textlength(t, font=f)) / 2, y), t, font=f, fill=color)
    fu = dm(24, 600)
    u = "anywherelearning.co"
    d.text(((W - d.textlength(u, font=fu)) / 2, y + 60), u, font=fu, fill=url_color)


def checklist(d, items, x, y, w, color, box_color, size=34):
    f = dm(size, 600)
    for it in items:
        d.rounded_rectangle([x, y + 4, x + 34, y + 38], 7, outline=box_color, width=4)
        d.text((x + 52, y), it, font=f, fill=color)
        y += 56
    return y


# ------------------------------------------------------------------ layouts

def layout_band(p):
    base = Image.new("RGBA", (W, H), CREAM + (255,))
    d = ImageDraw.Draw(base)
    y = 64
    fk = dm(26, 700)
    k = p["kicker"].upper()
    d.text(((W - d.textlength(k, font=fk)) / 2, y), k, font=fk, fill=GOLD_DARK)
    y += 56
    fh, lines = fit_lines(d, p["headline"], W - 120, 96, 800, 2)
    y = draw_center_lines(d, lines, fh, y, FOREST_DARK, gap=14,
                          accent=set(a.lower().strip('.,?!:') for a in p.get("accent", [])), accent_fill=TERRA)
    top_end = y + 54

    has_list = bool(p.get("checklist"))
    foot_h = 420 if has_list else 210
    ph = H - top_end - foot_h
    photo = warm(cover(p["photo"], W, ph, *p.get("focus", [0.5, 0.5])))
    base.paste(photo, (0, top_end))

    d.rectangle([0, H - foot_h, W, H], fill=FOREST_DARK)
    fy = H - foot_h + 38
    if has_list:
        fy = checklist(d, p["checklist"], 120, fy, W - 240, CREAM, GOLD_LIGHT) + 6
    fs, sl = fit_lines(d, p["sub"], W - 140, 36, 600, 1, min_size=26)
    fy = draw_center_lines(d, sl, fs, fy, GOLD_LIGHT) + 26
    wordmark_block(d, fy, CREAM, GOLD_LIGHT)

    if p.get("badge"):
        badge(base, W - 140, top_end + 20, p["badge"][0], p["badge"][1], fill=TERRA)
    return base


def layout_frame(p):
    ground = GROUNDS[p.get("ground", "gold")]
    base = Image.new("RGBA", (W, H), ground + (255,))
    d = ImageDraw.Draw(base)
    y = 70
    fk = dm(26, 700)
    k = p["kicker"].upper()
    d.text(((W - d.textlength(k, font=fk)) / 2, y), k, font=fk, fill=GOLD_DARK)
    y += 54
    fh, lines = fit_lines(d, p["headline"], W - 120, 92, 800, 2)
    y = draw_center_lines(d, lines, fh, y, INK, gap=12,
                          accent=set(a.lower().strip('.,?!:') for a in p.get("accent", [])), accent_fill=TERRA)
    top_end = y + 48

    foot_h = 250
    m, border = 64, 14
    cw, ch = W - 2 * m, H - top_end - foot_h
    photo = warm(cover(p["photo"], cw - 2 * border, ch - 2 * border, *p.get("focus", [0.5, 0.5])))
    card = Image.new("RGB", (cw, ch), WHITE)
    card.paste(photo, (border, border))
    card = rounded(card, 30)
    sh = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    ImageDraw.Draw(sh).rounded_rectangle([m, top_end + 14, m + cw, top_end + ch + 14], 30, fill=(60, 40, 20, 70))
    base.alpha_composite(sh.filter(ImageFilter.GaussianBlur(14)))
    base.alpha_composite(card, (m, top_end))

    fy = top_end + ch + 40
    fs, sl = fit_lines(d, p["sub"], W - 140, 36, 600, 1, min_size=26)
    fy = draw_center_lines(d, sl, fs, fy, INK) + 24
    wordmark_block(d, fy, FOREST_DARK, GOLD_DARK)
    if p.get("badge"):
        badge(base, m + 70, top_end + 10, p["badge"][0], p["badge"][1], fill=FOREST)
    return base


def gradient(w, h, color, top_alpha, bottom_alpha):
    g = Image.new("RGBA", (w, h))
    px = g.load()
    for yy in range(h):
        a = int(top_alpha + (bottom_alpha - top_alpha) * (yy / max(1, h - 1)) ** 1.1)
        for xx in range(w):
            px[xx, yy] = color + (a,)
    return g


def layout_overlay(p):
    photo = warm(cover(p["photo"], W, H, *p.get("focus", [0.5, 0.5]))).convert("RGBA")
    base = photo
    shade = (38, 46, 34)
    base.alpha_composite(gradient(W, 560, shade, 235, 0), (0, 0))
    base.alpha_composite(gradient(W, 430, shade, 0, 240), (0, H - 430))
    d = ImageDraw.Draw(base)
    y = 70
    fk = dm(26, 700)
    k = p["kicker"].upper()
    kw = d.textlength(k, font=fk)
    d.rounded_rectangle([(W - kw) / 2 - 22, y - 12, (W + kw) / 2 + 22, y + 40], 26, fill=GOLD + (255,))
    d.text(((W - kw) / 2, y - 2), k, font=fk, fill=WHITE)
    y += 78
    fh, lines = fit_lines(d, p["headline"], W - 110, 98, 800, 3)
    draw_center_lines(d, lines, fh, y, CREAM, gap=12,
                      accent=set(a.lower().strip('.,?!:') for a in p.get("accent", [])), accent_fill=GOLD_LIGHT)

    fs, sl = fit_lines(d, p["sub"], W - 140, 38, 600, 1, min_size=26)
    fy = H - 236
    draw_center_lines(d, sl, fs, fy, CREAM)
    wordmark_block(d, H - 160, CREAM, GOLD_LIGHT)
    if p.get("badge"):
        badge(base, W - 130, H - 560, p["badge"][0], p["badge"][1], fill=TERRA)
    return base


LAYOUTS = {"band": layout_band, "frame": layout_frame, "overlay": layout_overlay}


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--only", type=int)
    args = ap.parse_args()
    pins = json.load(open(SPEC))
    os.makedirs(OUT, exist_ok=True)
    for p in pins:
        if args.only and p["n"] != args.only:
            continue
        im = LAYOUTS[p["layout"]](p).convert("RGB")
        name = f'{p["n"]:02d}-{p["date"]}-{p["slug"]}.jpg'
        im.save(os.path.join(OUT, name), quality=90)
        print("wrote", name)


if __name__ == "__main__":
    main()
