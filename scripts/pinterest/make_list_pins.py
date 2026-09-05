#!/usr/bin/env python3
"""Generate eye-catching Pinterest pins for Anywhere Learning ideas lists.

Design ported from the approved "Pin Template Refresh" canvas (Aug 2026):
big type, few words, phone-feed legible. Three families per list URL:
  A: cream checklist. Giant count numeral with gold offset shadow, tilted
     white card with washi tape, 6 short checklist lines, FREE badge.
  B: dark teaser. Forest-dark bg, ghost numeral, script + caps title,
     5 numbered ideas in gold/cream, tilted "more, all free" sticker.
  C: accent sampler. Category-accent bg, big lockup, tilted white card
     with 3 theme chips, one idea each.

Copy comes from pin-content.json (hand-curated short lines per list,
3 to 6 words each). ideas-data.json supplies count/accent/url.

Usage:
  python3 make_list_pins.py                       # all lists x 3 variants
  python3 make_list_pins.py --slug stem-ideas --variant b
  python3 make_list_pins.py --custom deck.json    # same schema, plus
      required keys: slug, count, url, accent, and the pin-content fields
  python3 make_list_pins.py --out "/some/dir"
"""

import argparse
import json
import math
import os
import sys

from PIL import Image, ImageDraw, ImageFilter, ImageFont

HERE = os.path.dirname(os.path.abspath(__file__))
FONT_DIR = os.path.join(HERE, "fonts")
DATA_FILE = os.path.join(HERE, "ideas-data.json")
CONTENT_FILE = os.path.join(HERE, "pin-content.json")
DEFAULT_OUT = os.path.expanduser(
    "~/Desktop/Anywhere Learning/Pinterest/Generated List Pins"
)

W, H = 1000, 1500

CREAM = (250, 249, 246, 255)
WHITE = (255, 255, 255, 255)
FOREST = (88, 129, 87, 255)
FOREST_DARK = (61, 92, 59, 255)
GOLD = (212, 163, 115, 255)
GOLD_LIGHT = (232, 201, 154, 255)
GOLD_DARK = (166, 124, 82, 255)
TERRA = (176, 96, 63, 255)  # accent for script phrases / arrows
INK = (52, 58, 51, 255)


def hex_rgb(s):
    s = s.lstrip("#")
    return tuple(int(s[i : i + 2], 16) for i in (0, 2, 4)) + (255,)


def blend(bg, fg, t):
    return tuple(int(bg[i] * (1 - t) + fg[i] * t) for i in range(3)) + (255,)


def darken(c, f=0.6):
    return (int(c[0] * f), int(c[1] * f), int(c[2] * f), 255)


def luminance(c):
    return 0.299 * c[0] + 0.587 * c[1] + 0.114 * c[2]


def dm(size, weight, opsz=40):
    f = ImageFont.truetype(os.path.join(FONT_DIR, "DMSans.ttf"), size)
    f.set_variation_by_axes([opsz, weight])
    return f


def dancing(size, weight=700):
    f = ImageFont.truetype(os.path.join(FONT_DIR, "DancingScript.ttf"), size)
    f.set_variation_by_axes([weight])
    return f


def tsize(d, text, font):
    b = d.textbbox((0, 0), text, font=font)
    return b[2] - b[0], b[3] - b[1]


def fit_dm(d, text, size, weight, max_w, min_size=24):
    while size > min_size:
        f = dm(size, weight)
        if d.textlength(text, font=f) <= max_w:
            return f, size
        size -= 2
    return dm(min_size, weight), min_size


def text_layer(text, font, fill, pad=24):
    probe = ImageDraw.Draw(Image.new("RGBA", (8, 8)))
    b = probe.textbbox((0, 0), text, font=font)
    w, h = b[2] - b[0], b[3] - b[1]
    layer = Image.new("RGBA", (w + 2 * pad, h + 2 * pad), (0, 0, 0, 0))
    ImageDraw.Draw(layer).text((pad - b[0], pad - b[1]), text, font=font, fill=fill)
    return layer


def rot_paste(base, layer, angle, center_xy):
    r = layer.rotate(angle, expand=True, resample=Image.BICUBIC)
    base.alpha_composite(r, (int(center_xy[0] - r.width / 2), int(center_xy[1] - r.height / 2)))


def quad_points(p0, p1, p2, n=28):
    pts = []
    for i in range(n + 1):
        t = i / n
        x = (1 - t) ** 2 * p0[0] + 2 * (1 - t) * t * p1[0] + t**2 * p2[0]
        y = (1 - t) ** 2 * p0[1] + 2 * (1 - t) * t * p1[1] + t**2 * p2[1]
        pts.append((x, y))
    return pts


def draw_arrow(d, x, y, w=52, color=TERRA, stroke=4):
    """Curved hand-drawn arrow pointing right, top-left at (x, y)."""
    h = int(w * 0.65)
    pts = quad_points((x, y + h * 0.55), (x + w * 0.55, y - h * 0.15), (x + w * 0.86, y + h * 0.45))
    d.line(pts, fill=color, width=stroke, joint="curve")
    tip = pts[-1]
    d.line([(tip[0] - w * 0.18, tip[1] - h * 0.35), tip], fill=color, width=stroke)
    d.line([(tip[0] - w * 0.24, tip[1] + h * 0.22), tip], fill=color, width=stroke)
    return h


def draw_check(d, x, y, box, color=CREAM):
    s = box / 48.0
    d.line(
        [(x + 11 * s, y + 25 * s), (x + 20 * s, y + 34 * s), (x + 37 * s, y + 13 * s)],
        fill=color, width=max(3, int(5 * s)), joint="curve",
    )


def wordmark(base, d, y, fill):
    f = dancing(44)
    w = d.textlength("Anywhere Learning", font=f)
    d.text(((W - w) / 2, y), "Anywhere Learning", font=f, fill=fill)


def footer(d, bg, line1, c1, line2, c2, rule=None):
    top = H - 118
    if rule:
        d.rectangle([0, top - 6, W, top], fill=rule)
    d.rectangle([0, top, W, H], fill=bg)
    f1, f2 = dm(33, 900), dm(27, 700)
    d.text(((W - d.textlength(line1, font=f1)) / 2, top + 22), line1, font=f1, fill=c1)
    d.text(((W - d.textlength(line2, font=f2)) / 2, top + 66), line2, font=f2, fill=c2)


def card_with_shadow(w, h, radius=18, margin=70, shadow_dy=26, blur=18, alpha=75):
    """RGBA layer: white rounded card with soft shadow, content origin (margin, margin)."""
    layer = Image.new("RGBA", (w + 2 * margin, h + 2 * margin), (0, 0, 0, 0))
    sh = Image.new("RGBA", layer.size, (0, 0, 0, 0))
    ImageDraw.Draw(sh).rounded_rectangle(
        [margin, margin + shadow_dy, margin + w, margin + h + shadow_dy],
        radius=radius, fill=(20, 35, 20, alpha),
    )
    layer.alpha_composite(sh.filter(ImageFilter.GaussianBlur(blur)))
    ImageDraw.Draw(layer).rounded_rectangle(
        [margin, margin, margin + w, margin + h], radius=radius, fill=WHITE
    )
    return layer, margin


# ---------------------------------------------------------------- variant A

def render_a(entry, content, out_dir):
    accent = hex_rgb(entry["accent"])
    count = str(entry["count"])
    base = Image.new("RGBA", (W, H), CREAM)
    d = ImageDraw.Draw(base)

    d.ellipse([640, -180, 1160, 340], fill=blend(CREAM, GOLD_LIGHT, 0.35))
    d.ellipse([-220, 300, 220, 740], fill=blend(CREAM, FOREST, 0.08))

    wordmark(base, d, 30, GOLD_DARK)

    # giant numeral with offset shadow
    num_f = dm(300, 1000)
    nx, ny = 64, 148
    d.text((nx + 10, ny + 10), count, font=num_f, fill=GOLD_LIGHT)
    d.text((nx, ny), count, font=num_f, fill=FOREST_DARK)
    num_w = d.textlength(count, font=num_f)

    # kicker caps + script phrase
    kx = nx + num_w + 22
    avail = 775 - kx
    ky = 188
    for line in content["kicker"]:
        f, size = fit_dm(d, line, 80, 1000, max(avail, 220))
        d.text((kx, ky), line, font=f, fill=FOREST_DARK)
        ky += int(size * 1.02)
    script_layer = text_layer(content["script"], dancing(64), TERRA)
    rot = script_layer.rotate(0, expand=True, resample=Image.BICUBIC)
    base.alpha_composite(rot, (int(kx - 14), int(ky + 2)))

    # FREE badge
    badge = Image.new("RGBA", (240, 240), (0, 0, 0, 0))
    bd = ImageDraw.Draw(badge)
    bd.ellipse([35, 35, 205, 205], fill=GOLD)
    f = dm(46, 1000)
    bd.text(((240 - bd.textlength("FREE", font=f)) / 2, 78), "FREE", font=f, fill=CREAM)
    f2 = dm(22, 700)
    bd.text(((240 - bd.textlength("printable", font=f2)) / 2, 132), "printable", font=f2, fill=FOREST_DARK)
    rot_paste(base, badge, -10, (880, 230))

    # tilted checklist card
    items = content["items_a"][:6]
    cw = 832
    row_h, gap = 54, 46
    inner_top, inner_bottom, inner_x = 70, 50, 58
    body_h = len(items) * row_h + (len(items) - 1) * gap
    more_h = 76
    ch = inner_top + body_h + 44 + more_h + inner_bottom - 20
    card, m = card_with_shadow(cw, ch)
    cd = ImageDraw.Draw(card)

    # washi tape
    tape = Image.new("RGBA", (200, 52), (0, 0, 0, 0))
    ImageDraw.Draw(tape).rectangle([0, 0, 200, 52], fill=(232, 201, 154, 210))
    trot = tape.rotate(-4, expand=True, resample=Image.BICUBIC)
    card.alpha_composite(trot, (m + 316, m - 24))

    y = m + inner_top
    for i, item in enumerate(items):
        bx = m + inner_x
        box = 48
        if i < 2:
            cd.rounded_rectangle([bx, y, bx + box, y + box], radius=12, fill=FOREST)
            draw_check(cd, bx, y, box)
        else:
            cd.rounded_rectangle([bx, y, bx + box, y + box], radius=12, outline=FOREST, width=4)
        f, size = fit_dm(cd, item, 43, 800, cw - inner_x * 2 - box - 22, min_size=32)
        th = tsize(cd, item, f)[1]
        cd.text((bx + box + 22, y + (box - th) / 2 - 6), item, font=f, fill=INK)
        y += row_h + gap

    y += 8
    ah = draw_arrow(cd, m + inner_x, y + 14, w=56)
    more = content.get("more_text", f"plus {entry['count'] - len(items)} more, all free")
    cd.text((m + inner_x + 70, y - 8), more, font=dancing(50), fill=TERRA)

    rot_card = card.rotate(0, expand=True, resample=Image.BICUBIC)
    base.alpha_composite(rot_card, (int((W - rot_card.width) / 2), 452))

    footer(d, FOREST_DARK, content.get("footer1", "Free printable checklist."), CREAM,
           content.get("footer2", "anywherelearning.co"), GOLD_LIGHT)

    return save(base, out_dir, content.get("name", f"list-pin-{entry['slug']}-a"))


# ---------------------------------------------------------------- variant B

def render_b(entry, content, out_dir):
    count = str(entry["count"])
    base = Image.new("RGBA", (W, H), FOREST_DARK)
    d = ImageDraw.Draw(base)

    # ghost numeral + soft circle
    ghost = text_layer(count, dm(700, 1000), (250, 249, 246, 14), pad=0)
    base.alpha_composite(ghost, (W - ghost.width + 140, 340))
    d.ellipse([-180, 1160, 380, 1720], fill=blend(FOREST_DARK, FOREST, 0.45))

    wordmark(base, d, 36, GOLD)

    # title: script + caps + pill
    script_layer = text_layer(content["b_script"], dancing(118), GOLD_LIGHT)
    rot = script_layer.rotate(0, expand=True, resample=Image.BICUBIC)
    base.alpha_composite(rot, (int((W - rot.width) / 2), 112))
    y = 112 + rot.height - 26
    caps_f, caps_size = fit_dm(d, content["b_caps"], 96, 1000, 880)
    cw = d.textlength(content["b_caps"], font=caps_f)
    d.text(((W - cw) / 2, y), content["b_caps"], font=caps_f, fill=CREAM)
    y += int(caps_size * 1.1) + 20

    pill_f = dm(34, 900)
    pw = d.textlength(content["pill_b"], font=pill_f)
    pill = Image.new("RGBA", (int(pw) + 72, 66), (0, 0, 0, 0))
    pd = ImageDraw.Draw(pill)
    pd.rounded_rectangle([0, 0, pill.width, 62], radius=31, fill=GOLD)
    pd.text((36, 10), content["pill_b"], font=pill_f, fill=FOREST_DARK)
    rot_paste(base, pill, -1, (W / 2, y + 30))

    # numbered rows
    items = content["items_b"][:5]
    top = 496
    row_block, gap = 104, 44
    num_f = dm(100, 1000)
    for i, item in enumerate(items):
        ry = top + i * (row_block + gap)
        num = str(i + 1)
        nw = d.textlength(num, font=num_f)
        d.text((90 + 112 - nw, ry - 10), num, font=num_f, fill=GOLD)
        f, size = fit_dm(d, item, 47, 800, 910 - 232, min_size=36)
        th = tsize(d, item, f)[1]
        d.text((232, ry + (84 - th) / 2 - 4), item, font=f, fill=CREAM)
        d.line([(232, ry + row_block - 8), (910, ry + row_block - 8)], fill=(212, 163, 115, 90), width=3)

    # sticker
    stick_f = dancing(52)
    text = content.get("sticker_text", f"{entry['count'] - len(items)} more, all free")
    stw = ImageDraw.Draw(Image.new("RGBA", (8, 8))).textlength(text, font=stick_f)
    sticker = Image.new("RGBA", (int(stw) + 160, 104), (0, 0, 0, 0))
    sd = ImageDraw.Draw(sticker)
    sd.rounded_rectangle([0, 6, sticker.width - 8, 98], radius=14, fill=CREAM)
    sd.text((44, 16), text, font=stick_f, fill=FOREST_DARK)
    draw_arrow(sd, int(stw) + 68, 36, w=54)
    rot_paste(base, sticker, 0, (W / 2, 1288))

    footer(d, GOLD, content.get("footer1", "Free printable checklist."), FOREST_DARK,
           content.get("footer2", "anywherelearning.co"), CREAM)

    return save(base, out_dir, content.get("name", f"list-pin-{entry['slug']}-b"))


# ---------------------------------------------------------------- variant C

def render_c(entry, content, out_dir):
    accent = hex_rgb(entry["accent"])
    dark_bg = luminance(accent) < 110
    count = str(entry["count"])
    base = Image.new("RGBA", (W, H), accent)
    d = ImageDraw.Draw(base)

    ring = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    ImageDraw.Draw(ring).ellipse([-200, -260, 440, 380], outline=(250, 249, 246, 46), width=44)
    base.alpha_composite(ring)
    d.ellipse([520, 1180, 1180, 1840], fill=blend(accent[:3] + (255,), FOREST_DARK, 0.15))

    wordmark(base, d, 32, CREAM)

    # lockup: numeral + caps + script, centered as a block
    num_f = dm(210, 1000)
    num_w = d.textlength(count, font=num_f)
    caps_fill = GOLD_LIGHT if dark_bg else FOREST_DARK
    caps_f, caps_size = fit_dm(d, content["c_caps"], 70, 1000, 520)
    caps_w = d.textlength(content["c_caps"], font=caps_f)
    script_layer = text_layer(content["c_script"], dancing(94), CREAM)
    script_rot = script_layer.rotate(0, expand=True, resample=Image.BICUBIC)
    right_w = max(caps_w, script_rot.width - 40)
    block_w = num_w + 26 + right_w
    x0 = (W - block_w) / 2
    ny = 108
    d.text((x0 + 8, ny + 8), count, font=num_f, fill=blend(accent[:3] + (255,), FOREST_DARK, 0.3))
    d.text((x0, ny), count, font=num_f, fill=CREAM if not dark_bg else GOLD_LIGHT)
    cx = x0 + num_w + 26
    d.text((cx, ny + 42), content["c_caps"], font=caps_f, fill=caps_fill)
    base.alpha_composite(script_rot, (int(cx - 16), int(ny + 42 + caps_size * 1.05)))

    pill_bg = GOLD if dark_bg else FOREST_DARK
    pill_fg = FOREST_DARK if dark_bg else CREAM
    pill_f = dm(32, 900)
    pw = d.textlength(content["pill_c"], font=pill_f)
    pill = Image.new("RGBA", (int(pw) + 68, 64), (0, 0, 0, 0))
    pd = ImageDraw.Draw(pill)
    pd.rounded_rectangle([0, 0, pill.width, 60], radius=30, fill=pill_bg)
    pd.text((34, 10), content["pill_c"], font=pill_f, fill=pill_fg)
    rot_paste(base, pill, 1, (W / 2, 442))

    # tilted sampler card
    groups = content["sampler"][:3]
    cw = 848
    inner_x, inner_top, inner_bottom = 58, 62, 52
    chip_h, chip_gap, item_h, group_gap = 50, 20, 70, 86
    body = len(groups) * (chip_h + chip_gap + item_h) + (len(groups) - 1) * group_gap
    ch = inner_top + body + 34 + 70 + inner_bottom
    card, m = card_with_shadow(cw, ch, radius=20)
    cd = ImageDraw.Draw(card)

    chip_bg = blend(WHITE, accent, 0.16)
    chip_fg = darken(accent, 0.62)
    y = m + inner_top
    for g in groups:
        chip_f = dm(27, 900)
        cw2 = cd.textlength(g["chip"], font=chip_f)
        cd.rounded_rectangle([m + inner_x, y, m + inner_x + cw2 + 48, y + chip_h], radius=25, fill=chip_bg)
        cd.text((m + inner_x + 24, y + 9), g["chip"], font=chip_f, fill=chip_fg)
        y += chip_h + chip_gap
        f, size = fit_dm(cd, g["item"], 44, 800, cw - 2 * inner_x - 12, min_size=34)
        cd.text((m + inner_x + 6, y), g["item"], font=f, fill=INK)
        y += item_h + group_gap
    y -= group_gap
    y += 34
    draw_arrow(cd, m + inner_x, y + 14, w=56)
    cd.text((m + inner_x + 70, y - 8), f"and {entry['count'] - len(groups)} more inside", font=dancing(50), fill=TERRA)

    rot_card = card.rotate(0, expand=True, resample=Image.BICUBIC)
    base.alpha_composite(rot_card, (int((W - rot_card.width) / 2), 460))

    footer(d, FOREST_DARK, "Free printable list.", CREAM, "anywherelearning.co", GOLD if dark_bg else None)

    return save(base, out_dir, content.get("name", f"list-pin-{entry['slug']}-c"))


# ------------------------------------------------------- statement (blog)

def render_statement(spec, out_dir):
    dark = spec.get("bg", "dark") == "dark"
    base = Image.new("RGBA", (W, H), FOREST_DARK if dark else CREAM)
    d = ImageDraw.Draw(base)

    if dark:
        d.ellipse([600, -240, 1220, 380], fill=blend(FOREST_DARK, FOREST, 0.4))
        ring = Image.new("RGBA", (W, H), (0, 0, 0, 0))
        ImageDraw.Draw(ring).ellipse([-160, 1000, 340, 1500], outline=(212, 163, 115, 46), width=40)
        base.alpha_composite(ring)
    else:
        d.ellipse([640, -180, 1160, 340], fill=blend(CREAM, GOLD_LIGHT, 0.35))
        d.ellipse([-220, 320, 220, 760], fill=blend(CREAM, FOREST, 0.08))

    wordmark(base, d, 36, GOLD if dark else GOLD_DARK)

    # kicker pill (outlined)
    kick = spec["kicker"]
    kf = dm(27, 900)
    kw = d.textlength(kick, font=kf)
    px0 = (W - kw - 60) / 2
    d.rounded_rectangle([px0, 128, px0 + kw + 60, 128 + 54], radius=27,
                        outline=(232, 201, 154, 160) if dark else FOREST, width=3)
    d.text((px0 + 30, 128 + 11), kick, font=kf, fill=GOLD_LIGHT if dark else darken(FOREST, 0.8))

    # stacked statement lines
    caps_fill = CREAM if dark else FOREST_DARK
    script_fill = GOLD if dark else TERRA
    y = 246
    for style, text in spec["lines"]:
        if style == "caps":
            f, size = fit_dm(d, text, 112, 1000, 880, min_size=64)
            d.text(((W - d.textlength(text, font=f)) / 2, y), text, font=f, fill=caps_fill)
            y += int(size * 1.08)
        else:
            size = 200
            while size > 90:
                if ImageDraw.Draw(Image.new("RGBA", (8, 8))).textlength(text, font=dancing(size)) <= 840:
                    break
                size -= 10
            layer = text_layer(text, dancing(size), script_fill)
            rot = layer.rotate(0, expand=True, resample=Image.BICUBIC)
            base.alpha_composite(rot, (int((W - rot.width) / 2), y - 10))
            y += rot.height - 44

    # sub line in a soft box
    sub = spec.get("sub")
    content_bottom = y
    if sub:
        sf, _ = fit_dm(d, sub, 38, 700, 820, min_size=28)
        sw = d.textlength(sub, font=sf)
        bx0 = (W - sw - 80) / 2
        by = y + 34
        if dark:
            d.rounded_rectangle([bx0, by, bx0 + sw + 80, by + 74], radius=16, fill=(90, 120, 89, 255))
            d.text((bx0 + 40, by + 15), sub, font=sf, fill=GOLD_LIGHT)
        else:
            d.rounded_rectangle([bx0, by, bx0 + sw + 80, by + 74], radius=16, fill=blend(CREAM, GOLD_LIGHT, 0.45))
            d.text((bx0 + 40, by + 15), sub, font=sf, fill=FOREST_DARK)
        content_bottom = by + 74

    # CTA sticker
    cta = spec.get("cta")
    if cta:
        stick_f = dancing(50)
        stw = ImageDraw.Draw(Image.new("RGBA", (8, 8))).textlength(cta, font=stick_f)
        sticker = Image.new("RGBA", (int(stw) + 160, 104), (0, 0, 0, 0))
        sd = ImageDraw.Draw(sticker)
        s_bg = CREAM if dark else FOREST
        s_fg = FOREST_DARK if dark else CREAM
        sd.rounded_rectangle([0, 6, sticker.width - 8, 98], radius=14, fill=s_bg)
        sd.text((44, 16), cta, font=stick_f, fill=s_fg)
        draw_arrow(sd, int(stw) + 68, 36, w=54, color=TERRA if dark else GOLD_LIGHT)
        cta_y = min(1270, (content_bottom + H - 118) / 2)
        rot_paste(base, sticker, 0, (W / 2, cta_y))

    if dark:
        footer(d, GOLD, spec.get("footer1", "Read it free. No email needed."), FOREST_DARK,
               spec.get("footer2", "anywherelearning.co"), CREAM)
    else:
        footer(d, FOREST_DARK, spec.get("footer1", "Read it free. No email needed."), CREAM,
               spec.get("footer2", "anywherelearning.co"), GOLD_LIGHT)

    return save(base, out_dir, spec["name"])


# ----------------------------------------------------- age/day chips (blog)

def render_chips(spec, out_dir):
    base = Image.new("RGBA", (W, H), CREAM)
    d = ImageDraw.Draw(base)

    d.ellipse([640, -180, 1160, 340], fill=blend(CREAM, GOLD_LIGHT, 0.35))
    d.ellipse([-220, 320, 220, 760], fill=blend(CREAM, FOREST, 0.08))

    wordmark(base, d, 30, GOLD_DARK)

    # lockup: big text + caps + script, centered as a block
    big_f = dm(175, 1000)
    big_w = d.textlength(spec["big"], font=big_f)
    caps_f, caps_size = fit_dm(d, spec["caps"], 66, 1000, 460)
    caps_w = d.textlength(spec["caps"], font=caps_f)
    script_layer = text_layer(spec["script"], dancing(84), TERRA)
    script_rot = script_layer.rotate(0, expand=True, resample=Image.BICUBIC)
    right_w = max(caps_w, script_rot.width - 48)
    block_w = big_w + 26 + right_w
    x0 = (W - block_w) / 2
    ny = 104
    d.text((x0 + 9, ny + 9), spec["big"], font=big_f, fill=GOLD_LIGHT)
    d.text((x0, ny), spec["big"], font=big_f, fill=FOREST_DARK)
    cx = x0 + big_w + 26
    d.text((cx, ny + 30), spec["caps"], font=caps_f, fill=FOREST_DARK)
    base.alpha_composite(script_rot, (int(cx - 24), int(ny + 30 + caps_size * 1.0)))

    pill_f = dm(30, 900)
    pw = d.textlength(spec["pill"], font=pill_f)
    pill = Image.new("RGBA", (int(pw) + 64, 62), (0, 0, 0, 0))
    pd = ImageDraw.Draw(pill)
    pd.rounded_rectangle([0, 0, pill.width, 58], radius=29, fill=FOREST)
    pd.text((32, 9), spec["pill"], font=pill_f, fill=CREAM)
    rot_paste(base, pill, -1, (W / 2, 396))

    # tilted chips card
    groups = spec["chips"]
    cw = 848
    inner_x, inner_top, inner_bottom = 58, 56, 48
    chip_h, chip_gap, item_h, group_gap = 48, 16, 54, 42
    body = len(groups) * (chip_h + chip_gap + item_h) + (len(groups) - 1) * group_gap
    ch = inner_top + body + 30 + 68 + inner_bottom
    card, m = card_with_shadow(cw, ch, radius=20)
    cd = ImageDraw.Draw(card)

    chip_bg = blend(WHITE, FOREST, 0.14)
    y = m + inner_top
    for g in groups:
        chip_f = dm(27, 900)
        gw = cd.textlength(g["chip"], font=chip_f)
        cd.rounded_rectangle([m + inner_x, y, m + inner_x + gw + 44, y + chip_h], radius=24, fill=chip_bg)
        cd.text((m + inner_x + 22, y + 8), g["chip"], font=chip_f, fill=FOREST_DARK)
        y += chip_h + chip_gap
        f, size = fit_dm(cd, g["item"], 42, 800, cw - 2 * inner_x - 12, min_size=32)
        cd.text((m + inner_x + 6, y), g["item"], font=f, fill=INK)
        y += item_h + group_gap
    y -= group_gap
    y += 30
    draw_arrow(cd, m + inner_x, y + 14, w=56)
    cd.text((m + inner_x + 70, y - 8), spec["cta"], font=dancing(48), fill=TERRA)

    rot_card = card.rotate(0, expand=True, resample=Image.BICUBIC)
    base.alpha_composite(rot_card, (int((W - rot_card.width) / 2), 400))

    footer(d, FOREST_DARK, spec.get("footer1", "Read it free. No email needed."), CREAM,
           spec.get("footer2", "anywherelearning.co"), GOLD_LIGHT)

    return save(base, out_dir, spec["name"])


# ---------------------------------------------------------------- driver

def save(base, out_dir, name):
    os.makedirs(out_dir, exist_ok=True)
    path = os.path.join(out_dir, f"{name}.jpg")
    base.convert("RGB").save(path, "JPEG", quality=88)
    return path


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--slug", help="only this ideas-list slug")
    ap.add_argument("--custom", help="path to a custom JSON entry file")
    ap.add_argument("--out", default=DEFAULT_OUT)
    ap.add_argument("--variant", default="all", choices=["all", "a", "b", "c"])
    ap.add_argument("--covers", help="JSON file of cover specs (family: statement|chips|checklist|teaser)")
    args = ap.parse_args()

    if args.covers:
        for spec in json.load(open(args.covers)):
            fam = spec["family"]
            if fam == "statement":
                path = render_statement(spec, args.out)
            elif fam == "chips":
                path = render_chips(spec, args.out)
            elif fam == "checklist":
                entry = {"slug": spec["name"], "count": spec["count"], "accent": spec.get("accent", "#588157")}
                path = render_a(entry, spec, args.out)
            elif fam == "teaser":
                entry = {"slug": spec["name"], "count": spec["count"], "accent": spec.get("accent", "#588157")}
                path = render_b(entry, spec, args.out)
            else:
                sys.exit(f"unknown family {fam}")
            print(os.path.basename(path))
        return

    content_all = json.load(open(CONTENT_FILE))

    if args.custom:
        raw = json.load(open(args.custom))
        raw = raw if isinstance(raw, list) else [raw]
        jobs = [(e, e) for e in raw]  # custom entries carry their own content
    else:
        data = {e["slug"]: e for e in json.load(open(DATA_FILE))}
        slugs = [args.slug] if args.slug else list(content_all)
        jobs = []
        for s in slugs:
            if s not in data or s not in content_all:
                sys.exit(f"no data/content for slug {s}")
            entry = {"slug": s, "count": data[s]["total"], "accent": data[s]["accent"]}
            jobs.append((entry, content_all[s]))

    renderers = {"a": render_a, "b": render_b, "c": render_c}
    which = ["a", "b", "c"] if args.variant == "all" else [args.variant]
    for entry, content in jobs:
        for v in which:
            print(os.path.basename(renderers[v](entry, content, args.out)))


if __name__ == "__main__":
    main()
