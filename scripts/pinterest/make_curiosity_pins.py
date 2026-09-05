#!/usr/bin/env python3
"""Curiosity-mechanic pins for the ideas-page URLs (Sep 2026 batch).

Six hook formats, ported from the approved "Curiosity Pin Concepts" canvas.
Each opens a question the pin does not answer, so the click is the answer:
  dare     - "can your 9-year-old cook dinner?" + unchecked boxes
  hidden   - a numbered list with one item blacked out
  bingo    - 3x3 grid, some squares already marked
  unlock   - age-gated progression, last row highlighted
  versus   - kit vs household, two columns
  whichkid - A/B/C quiz, each pointing at a different starting activity

Assignment lives in curiosity-content.json (each mechanic used twice, matched
to lists whose content actually fits the hook) so engagement can be compared.

Usage:
  python3 make_curiosity_pins.py                       # all 12
  python3 make_curiosity_pins.py --only nature-walk-ideas
  python3 make_curiosity_pins.py --mechanic bingo
"""

import argparse
import json
import os

from PIL import Image, ImageDraw

from make_list_pins import (
    W, H, CREAM, WHITE, FOREST, FOREST_DARK, GOLD, GOLD_LIGHT, GOLD_DARK,
    TERRA, INK, hex_rgb, blend, darken, luminance, dm, dancing, fit_dm,
    text_layer, draw_arrow, draw_check, wordmark, footer, card_with_shadow,
    save, tsize,
)
from make_blog_covers import cream_base, dark_base, caps_center, script_center

HERE = os.path.dirname(os.path.abspath(__file__))
CONTENT = os.path.join(HERE, "curiosity-content.json")
DEFAULT_OUT = os.path.expanduser(
    "~/Desktop/Anywhere Learning/Pinterest/Curiosity Pins"
)


def accent_base(spec):
    """Category-accent background with a soft ring."""
    accent = hex_rgb(spec["accent"])
    base = Image.new("RGBA", (W, H), accent)
    d = ImageDraw.Draw(base)
    ring = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    ImageDraw.Draw(ring).ellipse([-200, -260, 440, 380], outline=(250, 249, 246, 46), width=44)
    base.alpha_composite(ring)
    d.ellipse([520, 1180, 1180, 1840], fill=blend(accent, FOREST_DARK, 0.16))
    wordmark(base, d, 32, CREAM)
    return base, d


def flat_sticker(base, d, text, y, bg, fg):
    """Straight (never rotated) CTA chip, centered."""
    f = dancing(50)
    tw = d.textlength(text, font=f)
    x0 = (W - tw - 92) / 2
    d.rounded_rectangle([x0, y, x0 + tw + 92, y + 88], radius=14, fill=bg)
    d.text((x0 + 46, y + 12), text, font=f, fill=fg)


CTA_Y = H - 118 - 60 - 88          # CTA chip top, so its bottom clears the footer
TAIL_H = 76                        # approx height of a Dancing Script tail line


def centered_start(title_bottom, block_h, bottom=CTA_Y, pad=30):
    """Top y that centers a block between the title and the CTA."""
    avail = bottom - pad - (title_bottom + pad)
    return title_bottom + pad + max(0, (avail - block_h) / 2)


def tail_script(base, text, y, fill, size=52):
    return script_center(base, text, y, size, fill, angle=0)


# ------------------------------------------------------------------ dare

def render_dare(spec, out_dir):
    base, d = cream_base()

    y = caps_center(d, "CAN YOUR", 118, 84, FOREST_DARK)
    num_f = dm(150, 1000)
    noun_f, noun_s = fit_dm(d, spec["noun"], 84, 1000, 560)
    nw = d.textlength(spec["age"], font=num_f)
    ow = d.textlength(spec["noun"], font=noun_f)
    x0 = (W - (nw + 18 + ow)) / 2
    d.text((x0, y - 30), spec["age"], font=num_f, fill=TERRA)
    d.text((x0 + nw + 18, y + 26), spec["noun"], font=noun_f, fill=FOREST_DARK)
    y = y + 132
    y = tail_script(base, spec["verb"], y, TERRA, size=106)

    items = spec["items"][:3]
    cw = 832
    row_h, gap = 62, 34
    inner_x, inner_top = 58, 52
    body = len(items) * row_h + (len(items) - 1) * gap
    ch = inner_top + body + 30 + 76 + 44
    card, m = card_with_shadow(cw, ch, radius=20)
    cd = ImageDraw.Draw(card)
    cy = m + inner_top
    for item in items:
        box = 52
        cd.rounded_rectangle([m + inner_x, cy, m + inner_x + box, cy + box], radius=13,
                             outline=FOREST, width=4)
        f, _ = fit_dm(cd, item, 44, 800, cw - inner_x * 2 - box - 24, min_size=34)
        th = tsize(cd, item, f)[1]
        cd.text((m + inner_x + box + 24, cy + (box - th) / 2 - 6), item, font=f, fill=INK)
        cy += row_h + gap
    cy += 4
    cd.line([(m + inner_x, cy), (m + cw - inner_x, cy)], fill=blend(WHITE, FOREST, 0.2), width=3)
    kf = dancing(48)
    cd.text((m + inner_x, cy + 20), spec["kicker"], font=kf, fill=TERRA)

    start = centered_start(y, ch)
    base.alpha_composite(card, (int((W - card.width) / 2), int(start - m)))
    flat_sticker(base, d, spec["cta"], CTA_Y, FOREST, CREAM)
    footer(d, FOREST_DARK, spec["footer1"], CREAM, "anywherelearning.co", GOLD_LIGHT)
    return save(base, out_dir, f"pin-{spec['pin']}-{spec['slug']}-dare")


# ---------------------------------------------------------------- hidden

def render_hidden(spec, out_dir):
    base, d = dark_base()

    y = caps_center(d, spec["title1"], 125, 78, CREAM)
    y = caps_center(d, spec["title2"], y + 2, 78, CREAM)
    y = tail_script(base, spec["script"], y + 4, GOLD, size=104)

    rows = spec["rows"]
    hid = spec["hidden_n"]
    seq = sorted(rows + [[hid, None]], key=lambda r: r[0])
    row_h, hid_h, gap = 100, 122, 18
    block = sum(hid_h if t is None else row_h for _, t in seq) + gap * (len(seq) - 1)
    ry = centered_start(y, block)
    row_tint = blend(FOREST_DARK, CREAM, 0.11)
    for n, text in seq:
        if text is None:
            card = Image.new("RGBA", (872, hid_h + 26), (0, 0, 0, 0))
            cd = ImageDraw.Draw(card)
            cd.rounded_rectangle([20, 20, 852, hid_h + 12], radius=18, fill=(0, 0, 0, 80))
            cd.rounded_rectangle([20, 12, 852, hid_h + 4], radius=18, fill=CREAM)
            cd.text((56, 36), str(n), font=dm(46, 1000), fill=TERRA)
            cd.rounded_rectangle([160, 44, 700, 68], radius=12, fill=(214, 209, 199, 255))
            cd.rounded_rectangle([160, 80, 540, 104], radius=12, fill=(214, 209, 199, 255))
            base.alpha_composite(card, (int((W - 872) / 2), int(ry - 8)))
            bf = dm(26, 900)
            bw = d.textlength("HIDDEN", font=bf)
            bx = 790 - bw
            d.rounded_rectangle([bx, ry - 22, bx + bw + 48, ry + 24], radius=23, fill=TERRA)
            d.text((bx + 24, ry - 11), "HIDDEN", font=bf, fill=CREAM)
            ry += hid_h + gap
        else:
            d.rounded_rectangle([64, ry, 936, ry + row_h], radius=16, fill=row_tint)
            d.text((110, ry + 27), str(n), font=dm(40, 1000), fill=GOLD)
            f, _ = fit_dm(d, text, 38, 700, 690, min_size=30)
            th = tsize(d, text, f)[1]
            d.text((222, ry + (row_h - th) / 2 - 6), text, font=f, fill=CREAM)
            ry += row_h + gap
    flat_sticker(base, d, spec["cta"], CTA_Y, CREAM, FOREST_DARK)
    footer(d, GOLD, spec["footer1"], FOREST_DARK, "anywherelearning.co", CREAM)
    return save(base, out_dir, f"pin-{spec['pin']}-{spec['slug']}-hidden")


# ----------------------------------------------------------------- bingo

def render_bingo(spec, out_dir):
    base, d = accent_base(spec)
    accent = hex_rgb(spec["accent"])
    dark_bg = luminance(accent) < 120

    y = caps_center(d, spec["title1"], 104, 88, CREAM if dark_bg else CREAM)
    y = caps_center(d, spec["title2"], y + 2, 88, CREAM)
    pf = dm(34, 900)
    pw = d.textlength(spec["pill"], font=pf)
    px = (W - pw - 68) / 2
    d.rounded_rectangle([px, y + 18, px + pw + 68, y + 84], radius=33, fill=FOREST_DARK)
    d.text((px + 34, y + 33), spec["pill"], font=pf, fill=CREAM)
    y += 108

    cells = spec["cells"][:9]
    marked = set(spec.get("marked", []))
    cw = 848
    cell = 228
    gap = 16
    grid = 3 * cell + 2 * gap
    pad = (cw - grid) // 2
    ch = pad * 2 + grid + 72
    card, m = card_with_shadow(cw, ch, radius=22)
    cd = ImageDraw.Draw(card)
    fills = [GOLD, FOREST, blend(WHITE, accent, 0.5)]
    for i, text in enumerate(cells):
        r, c = divmod(i, 3)
        x0 = m + pad + c * (cell + gap)
        y0 = m + pad + r * (cell + gap)
        if i in marked:
            fill = fills[i % 3]
            fg = FOREST_DARK if luminance(fill) > 140 else CREAM
        else:
            fill, fg = blend(WHITE, (242, 237, 228, 255), 1.0), INK
        cd.rounded_rectangle([x0, y0, x0 + cell, y0 + cell], radius=16, fill=fill)
        f, _ = fit_dm(cd, text, 30, 800, cell - 26, min_size=20)
        words, lines, cur = text.split(), [], ""
        for w_ in words:
            t = (cur + " " + w_).strip()
            if cd.textlength(t, font=f) <= cell - 30:
                cur = t
            else:
                lines.append(cur)
                cur = w_
        lines.append(cur)
        ly = y0 + (cell - len(lines) * 38) / 2
        for ln in lines:
            cd.text((x0 + (cell - cd.textlength(ln, font=f)) / 2, ly), ln, font=f, fill=fg)
            ly += 38
    tf = dancing(46)
    cd.text((m + (cw - cd.textlength(spec["tail"], font=tf)) / 2, m + pad + grid + 16),
            spec["tail"], font=tf, fill=TERRA)

    card_y = int(centered_start(y, ch, bottom=H - 118))
    base.alpha_composite(card, (int((W - card.width) / 2), card_y - m))
    footer(d, FOREST_DARK, spec["footer1"], CREAM, "anywherelearning.co", GOLD_LIGHT)
    return save(base, out_dir, f"pin-{spec['pin']}-{spec['slug']}-bingo")


# ---------------------------------------------------------------- unlock

def render_unlock(spec, out_dir):
    base, d = cream_base()
    y = caps_center(d, spec["title1"], 121, 82, FOREST_DARK)
    y = tail_script(base, spec["script"], y + 2, TERRA, size=124)

    rows = spec["rows"]
    ry = centered_start(y, len(spec["rows"]) * 152 - 4 + 14 + TAIL_H)
    for i, (age, text, chip_hex, chip_fg) in enumerate(rows):
        last = i == len(rows) - 1
        bg = FOREST_DARK if last else WHITE
        fg = CREAM if last else INK
        card = Image.new("RGBA", (872, 148), (0, 0, 0, 0))
        cd = ImageDraw.Draw(card)
        cd.rounded_rectangle([20, 18, 852, 136], radius=18, fill=(20, 35, 20, 40))
        cd.rounded_rectangle([20, 10, 852, 128], radius=18, fill=bg)
        cd.ellipse([48, 24, 148, 124], fill=hex_rgb(chip_hex))
        af, _ = fit_dm(cd, age, 34, 1000, 88)
        cd.text((98 - cd.textlength(age, font=af) / 2, 52), age, font=af, fill=hex_rgb(chip_fg))
        f, _ = fit_dm(cd, text, 38, 800, 660, min_size=30)
        th = tsize(cd, text, f)[1]
        cd.text((180, 69 - th / 2), text, font=f, fill=fg)
        base.alpha_composite(card, (64, int(ry)))
        ry += 152

    tail_script(base, spec["tail"], ry + 14, TERRA, size=50)
    flat_sticker(base, d, spec["cta"], CTA_Y, FOREST, CREAM)
    footer(d, FOREST_DARK, spec["footer1"], CREAM, "anywherelearning.co", GOLD_LIGHT)
    return save(base, out_dir, f"pin-{spec['pin']}-{spec['slug']}-unlock")


# ---------------------------------------------------------------- versus

def render_versus(spec, out_dir):
    base, d = dark_base()
    y = caps_center(d, spec["title1"], 123, 90, CREAM)
    y = caps_center(d, spec["title2"], y + 2, 90, CREAM)
    y = tail_script(base, spec["script"], y + 6, GOLD, size=94)

    col_w, gap = 411, 26
    x0 = (W - (col_w * 2 + gap)) / 2
    col_h = 486
    top = centered_start(y, col_h + 34 + TAIL_H)
    for idx, (label, lines, good) in enumerate([
        (spec["left_label"], spec["left_lines"], False),
        (spec["right_label"], spec["right_lines"], True),
    ]):
        cx = x0 + idx * (col_w + gap)
        if good:
            card = Image.new("RGBA", (col_w + 80, col_h + 80), (0, 0, 0, 0))
            cd = ImageDraw.Draw(card)
            cd.rounded_rectangle([40, 48, 40 + col_w, 40 + col_h], radius=20, fill=(0, 0, 0, 70))
            cd.rounded_rectangle([40, 40, 40 + col_w, 40 + col_h], radius=20, fill=CREAM)
            icon_bg, icon_fg, lbl_fg, txt_fg = FOREST, CREAM, FOREST_DARK, INK
            ox, oy = 40, 40
            target = card
        else:
            card = Image.new("RGBA", (col_w + 80, col_h + 80), (0, 0, 0, 0))
            cd = ImageDraw.Draw(card)
            cd.rounded_rectangle([40, 40, 40 + col_w, 40 + col_h], radius=20,
                                 fill=(250, 249, 246, 24), outline=(176, 96, 63, 150), width=3)
            icon_bg, icon_fg, lbl_fg, txt_fg = TERRA, CREAM, GOLD_LIGHT, CREAM
            ox, oy = 40, 40
            target = card
        cd.ellipse([ox + col_w / 2 - 46, oy + 38, ox + col_w / 2 + 46, oy + 130], fill=icon_bg)
        icx, icy = ox + col_w / 2, oy + 84
        if good:
            cd.line([(icx - 23, icy), (icx - 7, icy + 18), (icx + 24, icy - 18)],
                    fill=icon_fg, width=9, joint="curve")
        else:
            cd.line([(icx - 19, icy - 19), (icx + 19, icy + 19)], fill=icon_fg, width=9)
            cd.line([(icx + 19, icy - 19), (icx - 19, icy + 19)], fill=icon_fg, width=9)
        lf = dm(36, 1000)
        cd.text((ox + (col_w - cd.textlength(label, font=lf)) / 2, oy + 158), label,
                font=lf, fill=lbl_fg)
        tf = dm(33, 700)
        ly = oy + 232
        for ln in lines:
            cd.text((ox + (col_w - cd.textlength(ln, font=tf)) / 2, ly), ln, font=tf, fill=txt_fg)
            ly += 58
        base.alpha_composite(target, (int(cx - 40), int(top - 40)))

    tail_script(base, spec["tail"], top + col_h + 34, GOLD, size=54)
    flat_sticker(base, d, spec["cta"], CTA_Y, CREAM, FOREST_DARK)
    footer(d, GOLD, spec["footer1"], FOREST_DARK, "anywherelearning.co", CREAM)
    return save(base, out_dir, f"pin-{spec['pin']}-{spec['slug']}-versus")


# -------------------------------------------------------------- whichkid

def render_whichkid(spec, out_dir):
    base, d = cream_base()
    y = caps_center(d, spec["title1"], 121, 86, FOREST_DARK)
    y = tail_script(base, spec["script"], y + 2, TERRA, size=128)

    chips = [GOLD_LIGHT, GOLD, FOREST]
    chip_fg = [FOREST_DARK, FOREST_DARK, CREAM]
    ry = centered_start(y, len(spec["options"]) * 180 - 28 + 12 + TAIL_H)
    for i, (letter, line, sub) in enumerate(spec["options"]):
        card = Image.new("RGBA", (912, 176), (0, 0, 0, 0))
        cd = ImageDraw.Draw(card)
        cd.rounded_rectangle([40, 24, 872, 160], radius=20, fill=(20, 35, 20, 38))
        cd.rounded_rectangle([40, 16, 872, 152], radius=20, fill=WHITE)
        cd.ellipse([76, 52, 156, 132], fill=chips[i])
        lf = dm(34, 1000)
        cd.text((116 - cd.textlength(letter, font=lf) / 2, 74), letter, font=lf, fill=chip_fg[i])
        f, _ = fit_dm(cd, line, 38, 900, 660, min_size=30)
        cd.text((190, 52), line, font=f, fill=INK)
        sf, _ = fit_dm(cd, sub, 29, 600, 660, min_size=24)
        cd.text((190, 100), sub, font=sf, fill=(138, 138, 128, 255))
        base.alpha_composite(card, (44, int(ry)))
        ry += 180

    tail_script(base, spec["tail"], ry + 12, TERRA, size=50)
    flat_sticker(base, d, spec["cta"], CTA_Y, FOREST, CREAM)
    footer(d, FOREST_DARK, spec["footer1"], CREAM, "anywherelearning.co", GOLD_LIGHT)
    return save(base, out_dir, f"pin-{spec['pin']}-{spec['slug']}-whichkid")


RENDERERS = {
    "dare": render_dare, "hidden": render_hidden, "bingo": render_bingo,
    "unlock": render_unlock, "versus": render_versus, "whichkid": render_whichkid,
}


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--only", help="one ideas-list slug")
    ap.add_argument("--mechanic", choices=list(RENDERERS))
    ap.add_argument("--out", default=DEFAULT_OUT)
    args = ap.parse_args()

    specs = json.load(open(CONTENT))
    if args.only:
        specs = [s for s in specs if s["slug"] == args.only]
    if args.mechanic:
        specs = [s for s in specs if s["mechanic"] == args.mechanic]
    for spec in specs:
        print(os.path.basename(RENDERERS[spec["mechanic"]](spec, args.out)))


if __name__ == "__main__":
    main()
