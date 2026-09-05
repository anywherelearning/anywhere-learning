#!/usr/bin/env python3
"""October 2026 batch pin covers: high-contrast, click-and-save oriented.

Deliberately OFF-BRAND in palette and layout, on Amelie's instruction. The
existing list pins are cream, warm and soft, which is lovely and quiet; these
are built to win a scroll instead. What stays: the Dancing Script wordmark and
the anywherelearning.co footer, so 60 new pins still ladder back to the brand.

Three families, each mapped to a hook shape that actually reaches on Pinterest:

  BLACKOUT  near-black ground, one enormous white headline, a single warm
            accent word. The pure "curiosity gap" shape. For blog pins whose
            title is a question or a provocation.

  REDACTED  light ground, numbered reference list with one row blacked out and
            tagged. Combines the two mechanics that already work on this
            account: the list-on-the-pin (drives saves) and a withheld item
            (drives the click). For ideas/list URLs.

  SPLIT     hard two-tone split, the "this not that" shape, trending per
            Canva's 2026 report. For pins built on a foil (kit vs junk drawer,
            worksheet vs real life).

Every keyword is set in DM Sans, never Dancing Script: Pinterest runs OCR on
pin images and its visual search cannot read script faces, so a keyword in
script is invisible to search. Script is used only for the wordmark, which
carries no search weight.

1000x1500 exactly. Pinterest penalises other ratios.

Usage:
  python3 make_october_pins.py --samples          # one of each family
  python3 make_october_pins.py --id 30B
  python3 make_october_pins.py                    # everything in the content file
  python3 make_october_pins.py --out "/some/dir"
"""

import argparse
import json
import os

from PIL import Image, ImageDraw, ImageFilter, ImageFont

HERE = os.path.dirname(os.path.abspath(__file__))
FONT_DIR = os.path.join(HERE, "fonts")
CONTENT_FILE = os.path.join(HERE, "october-content.json")
DEFAULT_OUT = os.path.expanduser(
    "~/Desktop/Anywhere Learning/Pinterest/Oct2026 Batch"
)

W, H = 1000, 1500
FOOTER_H = 118

# ── off-brand palette: high chroma, high contrast ──
NEAR_BLACK = (17, 19, 17, 255)
OFF_WHITE = (250, 250, 248, 255)
WHITE = (255, 255, 255, 255)
AMBER = (255, 176, 46, 255)
CORAL = (240, 92, 62, 255)
RED = (222, 48, 40, 255)
TEAL = (14, 58, 64, 255)
INK = (24, 26, 24, 255)
MUTED = (140, 146, 140, 255)


def dm(size, weight, opsz=40):
    f = ImageFont.truetype(os.path.join(FONT_DIR, "DMSans.ttf"), size)
    f.set_variation_by_axes([opsz, weight])
    return f


def dancing(size, weight=700):
    f = ImageFont.truetype(os.path.join(FONT_DIR, "DancingScript.ttf"), size)
    f.set_variation_by_axes([weight])
    return f


def wrap(d, text, font, max_w):
    """Greedy wrap on spaces, then on hyphens for tokens that still overflow.
    Without the hyphen pass a word like "Real-world" runs off the edge, because
    there is no space to break at."""
    words = []
    for w in text.split():
        if d.textlength(w, font=font) <= max_w or "-" not in w:
            words.append(w)
        else:
            parts = w.split("-")
            words += [pt + "-" for pt in parts[:-1]] + [parts[-1]]
    lines, cur = [], ""
    for word in words:
        trial = (cur + word) if cur.endswith("-") else f"{cur} {word}".strip()
        if d.textlength(trial, font=font) <= max_w or not cur:
            cur = trial
        else:
            lines.append(cur)
            cur = word
    if cur:
        lines.append(cur)
    return lines


def fit_block(d, text, max_w, max_h, weight=900, start=150, min_size=44, leading=1.02):
    """Largest size at which `text` wraps inside (max_w, max_h). Returns (font, lines, line_h)."""
    size = start
    while size >= min_size:
        f = dm(size, weight)
        lines = wrap(d, text, f, max_w)
        line_h = int(size * leading)
        widest = max((d.textlength(l, font=f) for l in lines), default=0)
        if len(lines) * line_h <= max_h and widest <= max_w:
            return f, lines, line_h
        size -= 3
    f = dm(min_size, weight)
    return f, wrap(d, text, f, max_w), int(min_size * leading)


def ink_metrics(d, lines, font, line_h):
    """Real ink extents of a wrapped block. Centring on the em box reads low,
    because glyphs sit below the box top by a variable amount; a one-line block
    is skewed far more than a three-line one, so a fixed fudge cannot fix both."""
    top = d.textbbox((0, 0), lines[0], font=font)[1]
    bottom = d.textbbox((0, 0), lines[-1], font=font)[3]
    return top, (len(lines) - 1) * line_h + (bottom - top)


def draw_lines(d, lines, x, y, font, line_h, fill, align="left", max_w=None):
    for i, ln in enumerate(lines):
        lx = x
        if align == "center" and max_w:
            lx = x + (max_w - d.textlength(ln, font=font)) / 2
        d.text((lx, y + i * line_h), ln, font=font, fill=fill)
    return y + len(lines) * line_h


def footer(base, d, bg, line1, c1, c2):
    """Footer bar: the free-claim line plus the domain. Never mentions email:
    the printables are free, they just ask for an address."""
    top = H - FOOTER_H
    d.rectangle([0, top, W, H], fill=bg)
    f1, f2 = dm(33, 900), dm(27, 700)
    d.text(((W - d.textlength(line1, font=f1)) / 2, top + 20), line1, font=f1, fill=c1)
    d.text(((W - d.textlength(line2 := "anywherelearning.co", font=f2)) / 2, top + 64),
           line2, font=f2, fill=c2)


def wordmark(d, y, fill):
    f = dancing(42)
    d.text(((W - d.textlength("Anywhere Learning", font=f)) / 2, y),
           "Anywhere Learning", font=f, fill=fill)


def kicker(d, text, y, fill, size=28):
    """Small all-caps eyebrow with wide tracking, drawn char by char."""
    f = dm(size, 800)
    tracking = 6
    total = sum(d.textlength(c, font=f) + tracking for c in text) - tracking
    x = (W - total) / 2
    for c in text:
        d.text((x, y), c, font=f, fill=fill)
        x += d.textlength(c, font=f) + tracking
    return y + size + 10


# ────────────────────────────────────────────────────────── BLACKOUT

def render_blackout(spec, out_dir):
    """`invert` flips it to a light ground. Used where a URL needs a third
    distinct look but has no list to redact, so two blackouts would otherwise
    look like the same pin twice."""
    inv = spec.get("invert", False)
    ground = OFF_WHITE if inv else NEAR_BLACK
    ink = INK if inv else WHITE
    base = Image.new("RGBA", (W, H), ground)
    d = ImageDraw.Draw(base)

    accent = tuple(spec.get("accent_rgb", AMBER))
    wordmark(d, 54, MUTED if inv else (255, 255, 255, 110))

    # The WHOLE stack (kicker, headline, accent, sub) is centred between the
    # wordmark and the footer. Centring only the headline left the kicker
    # stranded at the top and ~150px of dead ground above the footer, which is
    # what check_balance.py flags.
    KICK_H, KICK_GAP = 38, 26
    band_top, band_bottom = 112, H - FOOTER_H
    max_w = W - 130
    fs = dm(34, 600)
    sub_lines = wrap(d, spec["sub"], fs, max_w) if spec.get("sub") else []
    sub_h = len(sub_lines) * 44 + 34 if sub_lines else 0

    size = 210
    while size > 46:
        f = dm(size, 900)
        lh = int(size * 1.03)
        lines = wrap(d, spec["title"], f, max_w)
        acc = wrap(d, spec["accent_line"], f, max_w) if spec.get("accent_line") else []
        head_h = (len(lines) + len(acc)) * lh + (14 if acc else 0)
        total = KICK_H + KICK_GAP + head_h + sub_h
        widest = max((d.textlength(l, font=f) for l in lines + acc), default=0)
        if total <= (band_bottom - band_top) - 60 and widest <= max_w:
            break
        size -= 3

    y = band_top + ((band_bottom - band_top) - total) / 2
    kicker(d, spec["kicker"].upper(), y, accent)
    y += KICK_H + KICK_GAP
    y = draw_lines(d, lines, 65, y, f, lh, ink)
    if acc:
        y = draw_lines(d, acc, 65, y + 14, f, lh, accent)
    for i, ln in enumerate(sub_lines):
        d.text((65, y + 34 + i * 44), ln, font=fs,
               fill=(90, 96, 90, 255) if inv else (255, 255, 255, 175))

    footer(base, d, INK if inv else accent, spec["footer"],
           OFF_WHITE if inv else NEAR_BLACK,
           (250, 250, 248, 160) if inv else (17, 19, 17, 200))
    return save(base, out_dir, spec["file"])


# ────────────────────────────────────────────────────────── REDACTED

def render_redacted(spec, out_dir):
    base = Image.new("RGBA", (W, H), OFF_WHITE)
    d = ImageDraw.Draw(base)

    accent = tuple(spec.get("accent_rgb", RED))
    wordmark(d, 48, MUTED)

    # Whole stack (kicker, title, list) centred between wordmark and footer.
    KICK_H, KICK_GAP, TITLE_GAP = 38, 22, 34
    band_top, band_bottom = 112, H - FOOTER_H
    items = spec["items"]
    hidden_idx = spec.get("hidden_index", len(items) - 1)

    f, lines, lh = fit_block(d, spec["title"], W - 130, 340,
                             weight=900, start=124, min_size=52, leading=1.04)
    title_h = len(lines) * lh
    fixed = KICK_H + KICK_GAP + title_h + TITLE_GAP
    # Cap the row height: a 4-item list would otherwise stretch to ~200px rows
    # and leave the last one floating, which reads as dead space.
    row_h = min(int(((band_bottom - band_top) - fixed - 18) / len(items)), 132)
    stack = fixed + row_h * len(items)

    y = band_top + ((band_bottom - band_top) - stack) / 2
    kicker(d, spec["kicker"].upper(), y, accent)
    y += KICK_H + KICK_GAP
    y = draw_lines(d, lines, 65, y, f, lh, INK)
    top = y + TITLE_GAP
    chip = min(76, int(row_h * 0.62))
    fn = dm(min(40, int(chip * 0.56)), 900)
    # Longest item decides the size. Without this, items like "Complete theme
    # park design project guide" are simply clipped at the pin edge.
    text_x = 65 + chip + 26
    avail_w = W - text_x - 44
    isize = min(52, int(row_h * 0.44))
    while isize > 22 and max(d.textlength(i, font=dm(isize, 800)) for i in items) > avail_w:
        isize -= 2
    fi = dm(isize, 800)

    for i, item in enumerate(items):
        ry = top + i * row_h
        cy = ry + (row_h - chip) / 2
        d.rounded_rectangle([65, cy, 65 + chip, cy + chip], radius=16, fill=INK)
        num = str(i + 1)
        d.text((65 + (chip - d.textlength(num, font=fn)) / 2, cy + (chip - fn.size) / 2 - 3),
               num, font=fn, fill=OFF_WHITE)
        tx = text_x
        if i == hidden_idx:
            bar_w = min(int(d.textlength(item, font=fi)) + 34, W - tx - 120)
            d.rounded_rectangle([tx, cy, tx + bar_w, cy + chip], radius=12, fill=accent)
            tag = dm(int(chip * 0.6), 900)
            d.text((tx + bar_w + 20, cy + (chip - tag.size) / 2 - 3), "?", font=tag, fill=accent)
        else:
            d.text((tx, cy + (chip - fi.size) / 2 - 5), item, font=fi, fill=INK)

    footer(base, d, INK, spec["footer"], OFF_WHITE, (250, 250, 248, 160))
    return save(base, out_dir, spec["file"])


# ────────────────────────────────────────────────────────── SPLIT

def render_split(spec, out_dir):
    base = Image.new("RGBA", (W, H), OFF_WHITE)
    d = ImageDraw.Draw(base)

    left = tuple(spec.get("left_rgb", TEAL))
    right = tuple(spec.get("right_rgb", CORAL))
    split_y = spec.get("split_y", 410)

    d.rectangle([0, 0, W, split_y], fill=left)
    d.rectangle([0, split_y, W, H - FOOTER_H], fill=right)

    wordmark(d, 44, (255, 255, 255, 120))

    # top half: the thing you are told to skip, struck through
    # Box stops 84px short of the seam so the pivot pill never lands on the text.
    top_box_t, top_box_b = 118, split_y - 46
    fa, la, lha = fit_block(d, spec["top_text"], W - 160, top_box_b - top_box_t,
                            weight=900, start=100, min_size=44)
    ink_t, ink_h = ink_metrics(d, la, fa, lha)
    ty = top_box_t + ((top_box_b - top_box_t) - ink_h) / 2 - ink_t
    end_y = draw_lines(d, la, 70, ty, fa, lha, (255, 255, 255, 235), "center", W - 140)
    if spec.get("strike", True):
        for i, ln in enumerate(la):
            w = d.textlength(ln, font=fa)
            ly = ty + i * lha + lha * 0.52
            d.line([(W - w) / 2 - 14, ly, (W + w) / 2 + 14, ly], fill=right, width=9)

    # the pivot word sitting on the seam
    pv = spec.get("pivot", "instead")
    fp = dm(34, 900)
    pw = d.textlength(pv.upper(), font=fp)
    d.rounded_rectangle([(W - pw) / 2 - 30, split_y - 32, (W + pw) / 2 + 30, split_y + 32],
                        radius=32, fill=OFF_WHITE)
    d.text(((W - pw) / 2, split_y - 20), pv.upper(), font=fp, fill=INK)

    # bottom half: what to do instead
    # Symmetric padding top and bottom so the block lands in the band's middle,
    # and a bigger start size so the lower half is filled rather than floating.
    bot_top, bot_bottom = split_y + 70, H - FOOTER_H - 70
    sub_h = 90 if spec.get("sub") else 0
    fb, lb, lhb = fit_block(d, spec["bottom_text"], W - 140,
                            (bot_bottom - bot_top) - sub_h,
                            weight=900, start=200, min_size=50)
    ink_bt, ink_bh = ink_metrics(d, lb, fb, lhb)
    by = bot_top + ((bot_bottom - bot_top) - sub_h - ink_bh) / 2 - ink_bt
    y = draw_lines(d, lb, 70, by, fb, lhb, WHITE, "center", W - 140)

    if spec.get("sub"):
        fs = dm(34, 700)
        for i, ln in enumerate(wrap(d, spec["sub"], fs, W - 200)):
            d.text(((W - d.textlength(ln, font=fs)) / 2, y + 30 + i * 44),
                   ln, font=fs, fill=(255, 255, 255, 210))

    footer(base, d, INK, spec["footer"], OFF_WHITE, (250, 250, 248, 160))
    return save(base, out_dir, spec["file"])


RENDERERS = {"blackout": render_blackout, "redacted": render_redacted, "split": render_split}


def save(base, out_dir, name):
    os.makedirs(out_dir, exist_ok=True)
    path = os.path.join(out_dir, f"{name}.jpg")
    base.convert("RGB").save(path, "JPEG", quality=90)
    return path


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--id", help="single pin id, e.g. 30B")
    ap.add_argument("--samples", action="store_true", help="one pin per family")
    ap.add_argument("--out", default=DEFAULT_OUT)
    a = ap.parse_args()

    specs = json.load(open(CONTENT_FILE))
    if a.id:
        specs = [s for s in specs if s["id"] == a.id]
    elif a.samples:
        seen, picked = set(), []
        for s in specs:
            if s["family"] not in seen:
                seen.add(s["family"])
                picked.append(s)
        specs = picked

    for s in specs:
        print(RENDERERS[s["family"]](s, a.out))


if __name__ == "__main__":
    main()
