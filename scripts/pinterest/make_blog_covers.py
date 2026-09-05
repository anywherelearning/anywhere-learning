#!/usr/bin/env python3
"""Bespoke covers for the Sep 2026 batch blog/lead-magnet pins.

Ten one-off compositions, one visual concept per cover, all in the brand
system. Each has a save or click hook (self-check quiz, calendar, countdown,
trail map). Reuses the helpers in make_list_pins.py.

Usage: python3 make_blog_covers.py [--only pin-18b-burnout] [--out DIR]
"""

import argparse
import math
import os

from PIL import Image, ImageDraw

from make_list_pins import (
    W, H, CREAM, WHITE, FOREST, FOREST_DARK, GOLD, GOLD_LIGHT, GOLD_DARK,
    TERRA, INK, blend, dm, dancing, fit_dm, text_layer, rot_paste,
    quad_points, draw_arrow, draw_check, wordmark, footer, card_with_shadow,
    save, tsize,
)

DEFAULT_OUT = os.path.expanduser(
    "~/Desktop/Anywhere Learning/Pinterest/Sep2026 Batch Redesign"
)


def kicker_pill(base, d, text, y, dark):
    f = dm(27, 900)
    w = d.textlength(text, font=f)
    x0 = (W - w - 60) / 2
    d.rounded_rectangle([x0, y, x0 + w + 60, y + 54], radius=27,
                        outline=(232, 201, 154, 170) if dark else FOREST, width=3)
    d.text((x0 + 30, y + 11), text, font=f,
           fill=GOLD_LIGHT if dark else (61, 92, 59, 255))


def sticker(base, text, center, dark_page, angle=0):
    f = dancing(50)
    probe = ImageDraw.Draw(Image.new("RGBA", (8, 8)))
    tw = probe.textlength(text, font=f)
    lay = Image.new("RGBA", (int(tw) + 160, 104), (0, 0, 0, 0))
    sd = ImageDraw.Draw(lay)
    bg = CREAM if dark_page else FOREST
    fg = FOREST_DARK if dark_page else CREAM
    sd.rounded_rectangle([0, 6, lay.width - 8, 98], radius=14, fill=bg)
    sd.text((44, 16), text, font=f, fill=fg)
    draw_arrow(sd, int(tw) + 68, 36, w=54, color=TERRA if dark_page else GOLD_LIGHT)
    rot_paste(base, lay, angle, center)


def cream_base():
    base = Image.new("RGBA", (W, H), CREAM)
    d = ImageDraw.Draw(base)
    d.ellipse([640, -180, 1160, 340], fill=blend(CREAM, GOLD_LIGHT, 0.35))
    d.ellipse([-220, 320, 220, 760], fill=blend(CREAM, FOREST, 0.08))
    wordmark(base, d, 30, GOLD_DARK)
    return base, d


def dark_base():
    base = Image.new("RGBA", (W, H), FOREST_DARK)
    d = ImageDraw.Draw(base)
    d.ellipse([600, -240, 1220, 380], fill=blend(FOREST_DARK, FOREST, 0.4))
    ring = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    ImageDraw.Draw(ring).ellipse([-160, 1040, 340, 1540], outline=(212, 163, 115, 46), width=40)
    base.alpha_composite(ring)
    wordmark(base, d, 36, GOLD)
    return base, d


def caps_center(d, text, y, size, fill, max_w=880):
    f, s = fit_dm(d, text, size, 1000, max_w, min_size=54)
    d.text(((W - d.textlength(text, font=f)) / 2, y), text, font=f, fill=fill)
    return y + int(s * 1.08)


def script_center(base, text, y, size, fill, angle=0, max_w=860):
    probe = ImageDraw.Draw(Image.new("RGBA", (8, 8)))
    while size > 36 and probe.textlength(text, font=dancing(size)) > max_w:
        size -= 6
    lay = text_layer(text, dancing(size), fill)
    rot = lay.rotate(angle, expand=True, resample=Image.BICUBIC)
    base.alpha_composite(rot, (int((W - rot.width) / 2), int(y)))
    return y + rot.height - 44


# 16a — deschooling, month-one calendar ------------------------------------

def pin_16a(out):
    base, d = cream_base()
    kicker_pill(base, d, "DESCHOOLING", 126, dark=False)
    y = caps_center(d, "THE FIRST MONTH", 176, 88, FOREST_DARK)
    y = script_center(base, "out of school", y - 4, 128, TERRA)

    cell, gap, cols = 80, 10, 7
    grid_w = cols * cell + (cols - 1) * gap
    cw = grid_w + 100
    ch = 60 + 5 * cell + 4 * gap + 118
    card, m = card_with_shadow(cw, ch)
    cd = ImageDraw.Draw(card)
    nf = dm(26, 800)
    for i in range(30):
        r, c = divmod(i, cols)
        x0 = m + 50 + c * (cell + gap)
        y0 = m + 40 + r * (cell + gap)
        if i < 7:
            cd.rounded_rectangle([x0, y0, x0 + cell, y0 + cell], radius=14, fill=blend(WHITE, GOLD_LIGHT, 0.85))
            draw_check(cd, x0 + 24, y0 + 22, 44, color=FOREST)
        else:
            cd.rounded_rectangle([x0, y0, x0 + cell, y0 + cell], radius=14, outline=blend(WHITE, FOREST, 0.35), width=3)
        cd.text((x0 + 10, y0 + 6), str(i + 1), font=nf,
                fill=FOREST_DARK if i < 7 else blend(WHITE, INK, 0.45))
    cap = "one tiny activity a day, that's it"
    cf = dancing(46)
    cd.text((m + (cw - cd.textlength(cap, font=cf)) / 2, m + ch - 92), cap, font=cf, fill=TERRA)
    rot = card.rotate(0, expand=True, resample=Image.BICUBIC)
    base.alpha_composite(rot, (int((W - rot.width) / 2), 441))

    sticker(base, "save this for week one", (W / 2, 1288), dark_page=False)
    footer(d, FOREST_DARK, "The 30-day plan is free.", CREAM, "anywherelearning.co", GOLD_LIGHT)
    return save(base, out, "pin-16a-deschooling")


# 16b — deschooling, speech bubbles ----------------------------------------

def pin_16b(out):
    base, d = dark_base()
    y = caps_center(d, "DESCHOOLING", 148, 112, CREAM)
    y = script_center(base, "the first weeks sound like this", y + 2, 92, GOLD, angle=0)

    bubbles = [("What do I do now?", -120, -3), ("What's next?", 150, 2), ("Can I just play?", -60, -2)]
    by = y + 106
    for text, dx, ang in bubbles:
        f = dm(46, 800)
        probe = ImageDraw.Draw(Image.new("RGBA", (8, 8)))
        tw = probe.textlength(text, font=f)
        lay = Image.new("RGBA", (int(tw) + 130, 140), (0, 0, 0, 0))
        ld = ImageDraw.Draw(lay)
        ld.rounded_rectangle([8, 8, lay.width - 8, 104], radius=48, fill=CREAM)
        ld.polygon([(76, 98), (120, 98), (72, 132)], fill=CREAM)
        ld.text((56, 30), text, font=f, fill=INK)
        rot_paste(base, lay, ang, (W / 2 + dx, by))
        by += 176

    sub = "Not laziness. Recovery. Totally normal."
    sf, _ = fit_dm(d, sub, 38, 700, 840)
    sw = d.textlength(sub, font=sf)
    bx = (W - sw - 80) / 2
    sy = by + 20
    d.rounded_rectangle([bx, sy, bx + sw + 80, sy + 78], radius=16, fill=(90, 120, 89, 255))
    d.text((bx + 40, sy + 17), sub, font=sf, fill=GOLD_LIGHT)

    sticker(base, "the fix list is free", (W / 2, 1268), dark_page=True)
    footer(d, GOLD, "Read it free. No email needed.", FOREST_DARK, "anywherelearning.co", CREAM)
    return save(base, out, "pin-16b-deschooling")


# 18a — burnout, dead battery ----------------------------------------------

def pin_18a(out):
    base, d = cream_base()
    y = caps_center(d, "HOMESCHOOL", 160, 96, FOREST_DARK)
    y = caps_center(d, "BURNOUT", y - 6, 150, FOREST_DARK)

    bw, bh = 620, 250
    bx, by = (W - bw) / 2, y + 150
    d.rounded_rectangle([bx, by, bx + bw, by + bh], radius=38, outline=FOREST_DARK, width=11)
    d.rounded_rectangle([bx + bw, by + 82, bx + bw + 38, by + bh - 82], radius=10, fill=FOREST_DARK)
    seg_w = int((bw - 48) * 0.12)
    d.rounded_rectangle([bx + 24, by + 24, bx + 24 + seg_w, by + bh - 24], radius=20, fill=TERRA)
    pf = dm(92, 1000)
    d.text((bx + bw / 2 - d.textlength("12%", font=pf) / 2 + 34, by + bh / 2 - 58), "12%", font=pf, fill=blend(CREAM, FOREST_DARK, 0.85))

    y = script_center(base, "running on empty?", by + bh + 52, 124, TERRA, angle=0)

    sub = "The fix is subtraction, not a new curriculum"
    sf, _ = fit_dm(d, sub, 36, 700, 820)
    sw = d.textlength(sub, font=sf)
    bx2 = (W - sw - 80) / 2
    d.rounded_rectangle([bx2, y + 30, bx2 + sw + 80, y + 104], radius=16, fill=blend(CREAM, GOLD_LIGHT, 0.45))
    d.text((bx2 + 40, y + 45), sub, font=sf, fill=FOREST_DARK)

    sticker(base, "the reset plan is free", (W / 2, 1276), dark_page=False)
    footer(d, FOREST_DARK, "Read it free. No email needed.", CREAM, "anywherelearning.co", GOLD_LIGHT)
    return save(base, out, "pin-18a-burnout")


# 18b — burnout, self-check quiz -------------------------------------------

def pin_18b(out):
    base, d = dark_base()
    kicker_pill(base, d, "CHECK ALL THAT APPLY", 130, dark=True)
    y0_ = caps_center(d, "BURNOUT", 172, 112, CREAM)
    caps_center(d, "SELF-CHECK", y0_ + 2, 112, CREAM)

    rows = [
        "Dreading Monday by Sunday lunch",
        "Snapping before 10 am",
        "Fantasizing about the school bus",
        "Every subject is a battle",
        "The fun stuff stopped",
    ]
    cw = 832
    inner_x, row_h, gap = 54, 52, 34
    ch = 64 + len(rows) * (row_h + gap) - gap + 128
    card, m = card_with_shadow(cw, ch)
    cd = ImageDraw.Draw(card)
    y = m + 60
    for r in rows:
        box = 48
        cd.rounded_rectangle([m + inner_x, y, m + inner_x + box, y + box], radius=12, fill=blend(WHITE, GOLD_LIGHT, 0.9))
        draw_check(cd, m + inner_x, y, box, color=TERRA)
        f, _ = fit_dm(cd, r, 36, 700, cw - inner_x * 2 - box - 22, min_size=28)
        th = tsize(cd, r, f)[1]
        cd.text((m + inner_x + box + 22, y + (box - th) / 2 - 5), r, font=f, fill=INK)
        y += row_h + gap
    verdict = "3 or more? that's burnout."
    vf = dancing(52)
    cd.text((m + (cw - cd.textlength(verdict, font=vf)) / 2, y + 8), verdict, font=vf, fill=TERRA)
    rot = card.rotate(0, expand=True, resample=Image.BICUBIC)
    base.alpha_composite(rot, (int((W - rot.width) / 2), 452))

    sticker(base, "the reset plan is free", (W / 2, 1268), dark_page=True)
    footer(d, GOLD, "Save this for the hard week.", FOREST_DARK, "anywherelearning.co", CREAM)
    return save(base, out, "pin-18b-burnout")


# 19a — free guide, 7-day trail map ----------------------------------------

def pin_19a(out):
    base, d = cream_base()

    num_f = dm(170, 1000)
    nx = 200
    d.text((nx + 9, 108 + 9), "7", font=num_f, fill=GOLD_LIGHT)
    d.text((nx, 108), "7", font=num_f, fill=FOREST_DARK)
    nw = d.textlength("7", font=num_f)
    cf, cs = fit_dm(d, "DAYS OF", 64, 1000, 440)
    d.text((nx + nw + 26, 136), "DAYS OF", font=cf, fill=FOREST_DARK)
    lay = text_layer("real-world learning", dancing(76), TERRA)
    rot = lay.rotate(0, expand=True, resample=Image.BICUBIC)
    base.alpha_composite(rot, (int(nx + nw - 4), int(140 + cs * 1.02)))

    # winding dotted trail with 7 stops
    p0, p1, p2 = (170, 470), (1050, 640), (240, 950)
    q0, q1, q2 = (240, 950), (-140, 1230), (760, 1270)
    pts = quad_points(p0, p1, p2, 60) + quad_points(q0, q1, q2, 60)[1:]
    for i in range(0, len(pts), 4):
        x, yy = pts[i]
        d.ellipse([x - 5, yy - 5, x + 5, yy + 5], fill=blend(CREAM, FOREST, 0.4))
    stops = [0, 20, 40, 60, 80, 100, 119]
    labels = {0: "Square Foot Safari", 3: "Three AIs, One Question", 6: "Plan a Mini Adventure"}
    sides = {0: 1, 3: 1, 6: -1}
    nf = dm(34, 1000)
    for i, si in enumerate(stops):
        x, yy = pts[si]
        d.ellipse([x - 34, yy - 34, x + 34, yy + 34], fill=FOREST)
        n = str(i + 1)
        d.text((x - d.textlength(n, font=nf) / 2, yy - 24), n, font=nf, fill=CREAM)
        if i in labels:
            lf = dm(30, 800)
            lw = d.textlength(labels[i], font=lf)
            lx = x + 52 if sides[i] > 0 else x - 52 - lw - 48
            lx = max(28, min(lx, W - lw - 76))
            d.rounded_rectangle([lx, yy - 28, lx + lw + 48, yy + 28], radius=28, fill=WHITE,
                                outline=blend(WHITE, FOREST, 0.25), width=2)
            d.text((lx + 24, yy - 19), labels[i], font=lf, fill=INK)
    badges = {1: ("dollar", 74, 0), 2: ("note", 74, 0), 4: ("bulb", 70, 0), 5: ("speech", 70, -18)}
    for i, (kind, dx, dy) in badges.items():
        x, yy = pts[stops[i]]
        bxc, byc = x + dx, yy + dy
        d.ellipse([bxc - 34, byc - 34, bxc + 34, byc + 34], fill=WHITE, outline=blend(WHITE, FOREST, 0.35), width=3)
        if kind == "dollar":
            f2 = dm(38, 1000)
            d.text((bxc - d.textlength("$", font=f2) / 2, byc - 25), "$", font=f2, fill=FOREST)
        elif kind == "note":
            d.ellipse([bxc - 17, byc + 3, bxc - 2, byc + 16], fill=FOREST)
            d.line([(bxc - 4, byc + 9), (bxc - 4, byc - 16)], fill=FOREST, width=4)
            d.line([(bxc - 4, byc - 16), (bxc + 14, byc - 10)], fill=FOREST, width=4)
        elif kind == "bulb":
            d.ellipse([bxc - 13, byc - 19, bxc + 13, byc + 7], outline=TERRA, width=4)
            d.rectangle([bxc - 7, byc + 11, bxc + 7, byc + 19], fill=TERRA)
        elif kind == "speech":
            d.rounded_rectangle([bxc - 17, byc - 15, bxc + 17, byc + 7], radius=10, outline=FOREST, width=4)
            d.line([(bxc - 6, byc + 7), (bxc - 10, byc + 17)], fill=FOREST, width=4)

    # finish flag
    fx, fy = pts[-1]
    d.line([(fx + 10, fy - 96), (fx + 10, fy - 10)], fill=FOREST_DARK, width=8)
    d.polygon([(fx + 14, fy - 96), (fx + 118, fy - 74), (fx + 14, fy - 50)], fill=GOLD)

    sticker(base, "start tonight, it's free", (680, 398), dark_page=False, angle=0)
    footer(d, FOREST_DARK, "The 7-day guide is free.", CREAM, "anywherelearning.co/free-guide", GOLD_LIGHT)
    return save(base, out, "pin-19a-free-guide")


# 19b — free guide, $0 stat poster -----------------------------------------

def pin_19b(out):
    base, d = dark_base()
    zf = dm(300, 1000)
    zw = d.textlength("$0", font=zf)
    d.text(((W - zw) / 2 + 10, 150 + 10), "$0", font=zf, fill=blend(FOREST_DARK, FOREST, 0.9))
    d.text(((W - zw) / 2, 150), "$0", font=zf, fill=GOLD)
    y = caps_center(d, "NO CURRICULUM.", 500, 84, CREAM)
    y = caps_center(d, "NO PREP.", y + 4, 84, CREAM)
    sf = dm(120, 1000)
    sw = d.textlength("7 DAYS", font=sf)
    d.text(((W - sw) / 2, y + 26), "7 DAYS", font=sf, fill=GOLD_LIGHT)
    y = script_center(base, "one real-world mission a day", y + 26 + 140, 84, GOLD, angle=0)

    chips = ["a $20 budget", "a backyard safari", "a family adventure"]
    chf = dm(29, 800)
    total = sum(d.textlength(c, font=chf) + 56 for c in chips) + 2 * 18
    x = (W - total) / 2
    cy = y + 30
    for c in chips:
        cw2 = d.textlength(c, font=chf)
        d.rounded_rectangle([x, cy, x + cw2 + 56, cy + 58], radius=29, fill=(90, 120, 89, 255))
        d.text((x + 28, cy + 11), c, font=chf, fill=GOLD_LIGHT)
        x += cw2 + 56 + 18

    sticker(base, "grab the free guide", (W / 2, 1272), dark_page=True)
    footer(d, GOLD, "Get the free 7-day guide.", FOREST_DARK, "anywherelearning.co/free-guide", CREAM)
    return save(base, out, "pin-19b-free-guide")


# 21a — life skills before 12, age timeline --------------------------------

def pin_21a(out):
    base, d = cream_base()
    kicker_pill(base, d, "LIFE SKILLS BY AGE", 126, dark=False)
    y = caps_center(d, "10 LIFE SKILLS", 176, 92, FOREST_DARK)
    y = script_center(base, "before they turn 12", y - 4, 116, TERRA)

    nodes = [("6", "cook a real breakfast"), ("8", "laundry, start to finish"),
             ("10", "manage real money"), ("12", "plan a family outing")]
    cw = 820
    ch = 96 + len(nodes) * 128 + 14
    card, m = card_with_shadow(cw, ch)
    cd = ImageDraw.Draw(card)
    lx = m + 185
    cd.line([(lx, m + 76), (lx, m + 76 + (len(nodes) - 1) * 128)], fill=blend(WHITE, FOREST, 0.3), width=6)
    af = dm(34, 1000)
    tf = dm(38, 800)
    yy = m + 76
    for age, skill in nodes:
        cd.ellipse([lx - 40, yy - 40, lx + 40, yy + 40], fill=GOLD)
        cd.text((lx - cd.textlength(age, font=af) / 2, yy - 25), age, font=af, fill=FOREST_DARK)
        f, _ = fit_dm(cd, skill, 38, 800, cw - 220, min_size=30)
        th = tsize(cd, skill, f)[1]
        cd.text((lx + 72, yy - th / 2 - 5), skill, font=f, fill=INK)
        yy += 128
    tail = "10 skills mapped inside"
    tlf = dancing(48)
    cd.text((m + (cw - cd.textlength(tail, font=tlf)) / 2, yy - 62), tail, font=tlf, fill=TERRA)
    rot = card.rotate(0, expand=True, resample=Image.BICUBIC)
    base.alpha_composite(rot, (int((W - rot.width) / 2), 452))

    sticker(base, "save one for each birthday", (W / 2, 1292), dark_page=False)
    footer(d, FOREST_DARK, "Read it free. No email needed.", CREAM, "anywherelearning.co", GOLD_LIGHT)
    return save(base, out, "pin-21a-life-skills-before-12")


# 21b — life skills, summers-left countdown --------------------------------

def pin_21b(out):
    base, d = dark_base()
    kicker_pill(base, d, "THE MATH NOBODY DOES", 134, dark=True)
    nf = dm(340, 1000)
    nw = d.textlength("8", font=nf)
    d.text(((W - nw) / 2 + 12, 170 + 12), "8", font=nf, fill=blend(FOREST_DARK, FOREST, 0.9))
    d.text(((W - nw) / 2, 170), "8", font=nf, fill=GOLD)
    y = caps_center(d, "SUMMERS LEFT", 570, 100, CREAM)
    sub = "if your kid is 10 today"
    sf = dm(36, 700)
    sw = d.textlength(sub, font=sf)
    bx = (W - sw - 80) / 2
    d.rounded_rectangle([bx, y + 18, bx + sw + 80, y + 92], radius=16, fill=(90, 120, 89, 255))
    d.text((bx + 40, y + 33), sub, font=sf, fill=GOLD_LIGHT)
    script_center(base, "teach the life skills now", y + 130, 92, GOLD)

    sticker(base, "the before-12 list is free", (W / 2, 1268), dark_page=True)
    footer(d, GOLD, "Read it free. No email needed.", FOREST_DARK, "anywherelearning.co", CREAM)
    return save(base, out, "pin-21b-life-skills-before-12")


# 23a — STEM by age, staircase ---------------------------------------------

def pin_23a(out):
    base, d = cream_base()
    kicker_pill(base, d, "STEM BY AGE", 126, dark=False)
    y = caps_center(d, "STEM, BY AGE:", 176, 92, FOREST_DARK)
    y = script_center(base, "meet them on their step", y - 2, 104, TERRA, angle=0)

    steps = [("5-7", "sensory builds", blend(CREAM, GOLD_LIGHT, 0.9), FOREST_DARK),
             ("8-10", "hands-on engineering", GOLD, FOREST_DARK),
             ("11-13", "multi-week projects", FOREST, CREAM),
             ("14+", "apprentice deep dives", FOREST_DARK, CREAM)]
    baseline = 1200
    sw_, gap = 208, 8
    x = (W - (sw_ * 4 + gap * 3)) / 2
    hf = dm(40, 1000)
    for i, (age, label, fill, fg) in enumerate(steps):
        h = 265 + i * 152
        d.rounded_rectangle([x, baseline - h, x + sw_, baseline], radius=14, fill=fill)
        d.text((x + (sw_ - d.textlength(age, font=hf)) / 2, baseline - h + 22), age, font=hf, fill=fg)
        lf, _ = fit_dm(d, label, 27, 800, sw_ - 28, min_size=22)
        words = label.split()
        ly = baseline - h + 84
        line = ""
        for w_ in words:
            trial = (line + " " + w_).strip()
            if d.textlength(trial, font=lf) <= sw_ - 28:
                line = trial
            else:
                d.text((x + (sw_ - d.textlength(line, font=lf)) / 2, ly), line, font=lf, fill=fg)
                ly += 34
                line = w_
        d.text((x + (sw_ - d.textlength(line, font=lf)) / 2, ly), line, font=lf, fill=fg)
        x += sw_ + gap

    sticker(base, "find your kid's step, free", (W / 2, 1300), dark_page=False)
    footer(d, FOREST_DARK, "Read it free. No email needed.", CREAM, "anywherelearning.co", GOLD_LIGHT)
    return save(base, out, "pin-23a-stem-by-age")


# 23b — STEM by age, wrong vs right ----------------------------------------

def pin_23b(out):
    base, d = dark_base()
    kicker_pill(base, d, "STEM BY AGE", 130, dark=True)
    y = caps_center(d, "THE PROJECT ISN'T", 180, 76, CREAM)
    y = script_center(base, "the problem", y - 2, 120, GOLD, angle=0)
    y = caps_center(d, "THE AGE MATCH IS", y + 8, 62, GOLD_LIGHT)

    rows = [
        ("x", TERRA, "Wrong match: tears, quitting,", '\"I\'m bad at this\"'),
        ("check", FOREST, "Right match: focus, pride,", '\"can I do one more?\"'),
    ]
    cw = 860
    ch = 74 + 2 * 198 + 6
    card, m = card_with_shadow(cw, ch, radius=22)
    cd = ImageDraw.Draw(card)
    yy = m + 66
    for kind, color, l1, l2 in rows:
        gx = m + 66
        if kind == "x":
            cd.line([(gx, yy + 6), (gx + 58, yy + 64)], fill=color, width=14)
            cd.line([(gx + 58, yy + 6), (gx, yy + 64)], fill=color, width=14)
        else:
            cd.line([(gx, yy + 36), (gx + 22, yy + 60), (gx + 62, yy + 4)], fill=color, width=14, joint="curve")
        f = dm(40, 800)
        cd.text((gx + 106, yy - 6), l1, font=f, fill=INK)
        cd.text((gx + 106, yy + 50), l2, font=f, fill=color)
        yy += 198
    rot = card.rotate(0, expand=True, resample=Image.BICUBIC)
    base.alpha_composite(rot, (int((W - rot.width) / 2), 552))

    sticker(base, "match it right, guide is free", (W / 2, 1262), dark_page=True)
    footer(d, GOLD, "Ages 5 to 14, sorted.", FOREST_DARK, "anywherelearning.co", CREAM)
    return save(base, out, "pin-23b-stem-by-age")


def gold_base():
    base = Image.new("RGBA", (W, H), GOLD)
    d = ImageDraw.Draw(base)
    d.ellipse([660, -200, 1180, 320], fill=blend(GOLD, CREAM, 0.3))
    ring = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    ImageDraw.Draw(ring).ellipse([-180, 1060, 320, 1560], outline=(61, 92, 59, 50), width=40)
    base.alpha_composite(ring)
    wordmark(base, d, 30, CREAM)
    return base, d


# 01a — first year, mapped by season ---------------------------------------

def pin_01a(out):
    base, d = cream_base()
    kicker_pill(base, d, "NEW TO HOMESCHOOLING?", 126, dark=False)
    y = caps_center(d, "HOMESCHOOL", 176, 92, FOREST_DARK)
    y = caps_center(d, "YEAR ONE,", y + 2, 92, FOREST_DARK)
    y = script_center(base, "mapped by season", y - 2, 112, TERRA)

    seasons = [("FALL", GOLD, "deschool, explore, breathe"),
               ("WINTER", FOREST_DARK, "find your rhythm"),
               ("SPRING", FOREST, "follow the rabbit holes"),
               ("SUMMER", TERRA, "look how far you came")]
    cw2, chh, gap = 404, 252, 26
    gx = (W - 2 * cw2 - gap) / 2
    gy = 560
    for i, (name, color, line) in enumerate(seasons):
        r, c = divmod(i, 2)
        x0, y0 = gx + c * (cw2 + gap), gy + r * (chh + gap)
        card, m = card_with_shadow(cw2, chh, radius=18, margin=44, shadow_dy=16, blur=12, alpha=60)
        cd = ImageDraw.Draw(card)
        cd.rounded_rectangle([m, m, m + cw2, m + 62], radius=18, fill=color)
        cd.rectangle([m, m + 34, m + cw2, m + 62], fill=color)
        hf = dm(32, 1000)
        cd.text((m + (cw2 - cd.textlength(name, font=hf)) / 2, m + 12), name, font=hf, fill=CREAM)
        lf, _ = fit_dm(cd, line, 33, 800, cw2 - 60, min_size=26)
        words, lines_, cur = line.split(), [], ""
        for w_ in words:
            t = (cur + " " + w_).strip()
            if cd.textlength(t, font=lf) <= cw2 - 70:
                cur = t
            else:
                lines_.append(cur); cur = w_
        lines_.append(cur)
        ly = m + 62 + (chh - 62 - len(lines_) * 42) / 2
        for ln in lines_:
            cd.text((m + (cw2 - cd.textlength(ln, font=lf)) / 2, ly), ln, font=lf, fill=INK)
            ly += 42
        base.alpha_composite(card, (int(x0 - m), int(y0 - m)))

    sticker(base, "save for the wobbly weeks", (W / 2, 1268), dark_page=False)
    footer(d, FOREST_DARK, "The year-one guide is free.", CREAM, "anywherelearning.co", GOLD_LIGHT)
    return save(base, out, "pin-01a-first-year")


# 01b — first year survival kit tag ----------------------------------------

def pin_01b(out):
    base, d = dark_base()
    y = caps_center(d, "YOUR FIRST YEAR", 148, 96, CREAM)
    y = script_center(base, "of homeschooling", y - 2, 116, GOLD)

    tw2, th2 = 640, 700
    tag = Image.new("RGBA", (tw2 + 120, th2 + 120), (0, 0, 0, 0))
    td = ImageDraw.Draw(tag)
    td.rounded_rectangle([60, 66, 60 + tw2, 60 + th2], radius=30, fill=(20, 35, 20, 70))
    td.rounded_rectangle([60, 60, 60 + tw2, 60 + th2], radius=30, fill=CREAM)
    td.ellipse([60 + tw2 / 2 - 26, 88, 60 + tw2 / 2 + 26, 140], fill=FOREST_DARK)
    lay = text_layer("the year one kit", dancing(60), TERRA)
    tag.alpha_composite(lay, (int(60 + (tw2 - lay.width) / 2), 138))
    items = ["Deschool first", "Rhythm, not schedule", "One subject at a time", "Find your people", "Review in spring"]
    iy = 268
    for it in items:
        box = 40
        td.rounded_rectangle([120, iy, 120 + box, iy + box], radius=10, fill=FOREST)
        draw_check(td, 120, iy, box)
        f, _ = fit_dm(td, it, 37, 800, tw2 - 160, min_size=30)
        th_ = tsize(td, it, f)[1]
        td.text((120 + box + 20, iy + (box - th_) / 2 - 5), it, font=f, fill=INK)
        iy += 88
    rot = tag.rotate(0, expand=True, resample=Image.BICUBIC)
    base.alpha_composite(rot, (int((W - rot.width) / 2), int(y + 14)))
    # string from tag hole up toward the title
    pts = quad_points((W / 2, y + 88), (W / 2 + 200, y + 10), (W / 2 + 70, y - 60), 30)
    d.line(pts, fill=GOLD, width=6, joint="curve")

    sticker(base, "packed for you, free", (W / 2, 1258), dark_page=True)
    footer(d, GOLD, "The year-one guide is free.", FOREST_DARK, "anywherelearning.co", CREAM)
    return save(base, out, "pin-01b-first-year")


# 03a — a morning that actually happens ------------------------------------

def pin_03a(out):
    base, d = cream_base()
    kicker_pill(base, d, "REAL HOMESCHOOL ROUTINES", 126, dark=False)
    y = caps_center(d, "A HOMESCHOOL", 176, 88, FOREST_DARK)
    y = caps_center(d, "MORNING THAT", y + 2, 88, FOREST_DARK)
    y = script_center(base, "actually happens", y - 2, 116, TERRA)

    rows = [("8:00", "slow breakfast, no rush"), ("8:40", "math on the couch"),
            ("9:15", "dog walk counts as PE"), ("10:00", "deep-dive project time"),
            ("11:30", "done before lunch")]
    cw2 = 820
    ch2 = 70 + len(rows) * 108 + 20
    card, m = card_with_shadow(cw2, ch2)
    cd = ImageDraw.Draw(card)
    tf = dm(40, 1000)
    xf = dm(37, 800)
    yy = m + 56
    for t, label in rows:
        cd.text((m + 56, yy), t, font=tf, fill=GOLD_DARK)
        cd.text((m + 220, yy + 2), label, font=xf, fill=INK)
        if t != rows[-1][0]:
            cd.line([(m + 56, yy + 72), (m + cw2 - 56, yy + 72)], fill=blend(WHITE, FOREST, 0.18), width=3)
        yy += 108
    rot = card.rotate(0, expand=True, resample=Image.BICUBIC)
    base.alpha_composite(rot, (int((W - rot.width) / 2), 494))

    sticker(base, "steal this rhythm", (W / 2, 1288), dark_page=False)
    footer(d, FOREST_DARK, "Real routines, free to read.", CREAM, "anywherelearning.co", GOLD_LIGHT)
    return save(base, out, "pin-03a-routines")


# 03b — three anchors, not a schedule --------------------------------------

def pin_03b(out):
    base, d = dark_base()
    kicker_pill(base, d, "ROUTINES OVER SCHEDULES", 130, dark=True)
    y = caps_center(d, "SKIP THE COLOR-", 190, 82, CREAM)
    y = caps_center(d, "CODED SCHEDULE", y + 2, 82, CREAM)
    y = script_center(base, "keep three anchors", y + 4, 108, GOLD)

    anchors = [("MORNING", "start it together"), ("MIDDAY", "make something"), ("AFTERNOON", "get outside")]
    ay = y + 40
    for label, line in anchors:
        lay = Image.new("RGBA", (760, 120), (0, 0, 0, 0))
        ld = ImageDraw.Draw(lay)
        ld.rounded_rectangle([0, 8, 752, 112], radius=20, fill=CREAM)
        lf = dm(30, 1000)
        ld.rounded_rectangle([28, 32, 28 + ld.textlength(label, font=lf) + 40, 88], radius=16, fill=GOLD)
        ld.text((48, 42), label, font=lf, fill=FOREST_DARK)
        vf = dm(36, 800)
        ld.text((28 + ld.textlength(label, font=lf) + 66, 42), line, font=vf, fill=INK)
        rot_paste(base, lay, -1 if label == "MIDDAY" else 1, (W / 2, ay + 56))
        ay += 156

    script_center(base, "that's the whole schedule", ay + 8, 84, GOLD, angle=0)

    sticker(base, "the anchor plan is free", (W / 2, 1262), dark_page=True)
    footer(d, GOLD, "Read it free. No email needed.", FOREST_DARK, "anywherelearning.co", CREAM)
    return save(base, out, "pin-03b-routines")


# 05a — free guide, fanned week cards --------------------------------------

def pin_05a(out):
    base, d = dark_base()
    y = caps_center(d, "A WEEK OF LEARNING,", 130, 78, CREAM)
    y = script_center(base, "already planned", y + 2, 116, GOLD)

    days = [("DAY 1", "backyard safari"), ("DAY 2", "the $20 mission"), ("DAY 3", "household orchestra"),
            ("DAY 4", "catch the AI bluffing"), ("DAY 5", "invent a product"), ("DAY 6", "two-minute story"),
            ("DAY 7", "plan the adventure")]
    cy = y + 80
    for i, (dl, word) in enumerate(days):
        lay = Image.new("RGBA", (620, 104), (0, 0, 0, 0))
        ld = ImageDraw.Draw(lay)
        ld.rounded_rectangle([0, 8, 612, 98], radius=16, fill=CREAM if i % 2 == 0 else GOLD_LIGHT)
        lf = dm(27, 1000)
        ld.text((30, 36), dl, font=lf, fill=TERRA)
        vf = dm(33, 800)
        ld.text((150, 32), word, font=vf, fill=INK)
        ang = -4 + (i % 3) * 3
        rot_paste(base, lay, ang, (W / 2 + (-90 if i % 2 == 0 else 90), cy + 52))
        cy += 92

    sticker(base, "grab the whole week, free", (W / 2, 1268), dark_page=True)
    footer(d, GOLD, "Get the free 7-day guide.", FOREST_DARK, "anywherelearning.co/free-guide", CREAM)
    return save(base, out, "pin-05a-free-guide-week")


# 05b — free guide, one-week outcomes --------------------------------------

def pin_05b(out):
    base, d = cream_base()
    kicker_pill(base, d, "THE FREE 7-DAY GUIDE", 126, dark=False)
    y = caps_center(d, "ONE WEEK.", 182, 110, FOREST_DARK)
    y = script_center(base, "that's all it takes", y - 4, 116, TERRA)

    rows = ["They ran a real budget", "They caught an AI bluffing", "They told a two-minute story", "They planned a family adventure"]
    ry = y + 60
    for r in rows:
        box = 56
        bx = 150
        d.rounded_rectangle([bx, ry, bx + box, ry + box], radius=14, fill=GOLD)
        draw_check(d, bx, ry, box, color=FOREST_DARK)
        f, _ = fit_dm(d, r, 42, 800, W - bx - box - 200, min_size=32)
        th_ = tsize(d, r, f)[1]
        d.text((bx + box + 26, ry + (box - th_) / 2 - 6), r, font=f, fill=INK)
        ry += 132

    sub = "one 20-minute mission a day, that's the plan"
    sf, _ = fit_dm(d, sub, 34, 700, 820)
    sw = d.textlength(sub, font=sf)
    bx2 = (W - sw - 80) / 2
    d.rounded_rectangle([bx2, ry + 26, bx2 + sw + 80, ry + 98], radius=16, fill=blend(CREAM, GOLD_LIGHT, 0.45))
    d.text((bx2 + 40, ry + 40), sub, font=sf, fill=FOREST_DARK)

    sticker(base, "start tonight, it's free", (W / 2, 1268), dark_page=False)
    footer(d, FOREST_DARK, "Get the free 7-day guide.", CREAM, "anywherelearning.co/free-guide", GOLD_LIGHT)
    return save(base, out, "pin-05b-free-guide-week")


# 06a — first day photo-prop sign ------------------------------------------

def pin_06a(out):
    base, d = gold_base()
    # confetti
    import random
    rnd = random.Random(7)
    for _ in range(26):
        x, yy = rnd.randint(30, 970), rnd.randint(120, 1330)
        r = rnd.randint(5, 10)
        d.ellipse([x - r, yy - r, x + r, yy + r], fill=CREAM if rnd.random() < 0.6 else TERRA)

    sw2, sh2 = 800, 950
    sign = Image.new("RGBA", (sw2 + 100, sh2 + 100), (0, 0, 0, 0))
    sd = ImageDraw.Draw(sign)
    sd.rounded_rectangle([50, 56, 50 + sw2, 50 + sh2], radius=26, fill=(20, 35, 20, 80))
    sd.rounded_rectangle([50, 50, 50 + sw2, 50 + sh2], radius=26, fill=FOREST_DARK)
    sd.rounded_rectangle([82, 82, 50 + sw2 - 32, 50 + sh2 - 32], radius=18, outline=CREAM, width=4)
    lay = text_layer("First Day of", dancing(102), GOLD_LIGHT)
    sign.alpha_composite(lay, (int(50 + (sw2 - lay.width) / 2), 128))
    hf = dm(90, 1000)
    sd.text((50 + (sw2 - sd.textlength("HOMESCHOOL", font=hf)) / 2, 300), "HOMESCHOOL", font=hf, fill=CREAM)
    rows = [("GRADE:", "adventure"), ("TEACHER:", "us"), ("CLASSROOM:", "everywhere")]
    ry = 490
    lf = dm(38, 1000)
    vfont = dancing(64)
    for k, v in rows:
        sd.text((150, ry + 12), k, font=lf, fill=GOLD)
        sd.text((150 + sd.textlength(k, font=lf) + 28, ry - 10), v, font=vfont, fill=CREAM)
        sd.line([(150, ry + 78), (50 + sw2 - 100, ry + 78)], fill=(232, 201, 154, 90), width=3)
        ry += 132
    rot = sign.rotate(0, expand=True, resample=Image.BICUBIC)
    base.alpha_composite(rot, (int((W - rot.width) / 2), 106))

    sticker(base, "save for the first-day photo", (W / 2, 1254), dark_page=True, angle=0)
    footer(d, FOREST_DARK, "15 first-day ideas, free.", CREAM, "anywherelearning.co", GOLD_LIGHT)
    return save(base, out, "pin-06a-first-day")


# 06b — first day admission ticket -----------------------------------------

def pin_06b(out):
    base, d = cream_base()
    kicker_pill(base, d, "FIRST DAY OF HOMESCHOOL", 126, dark=False)
    y = caps_center(d, "HOMESCHOOL DAY 1:", 182, 84, FOREST_DARK)
    y = script_center(base, "make it mean something", y + 4, 108, TERRA, angle=0)

    tw2, th2 = 880, 540
    tick = Image.new("RGBA", (tw2 + 100, th2 + 100), (0, 0, 0, 0))
    td = ImageDraw.Draw(tick)
    td.rounded_rectangle([50, 58, 50 + tw2, 50 + th2], radius=26, fill=(20, 35, 20, 70))
    td.rounded_rectangle([50, 50, 50 + tw2, 50 + th2], radius=26, fill=GOLD)
    stub_x = 50 + tw2 - 250
    # inner ticket border on the main section
    td.rounded_rectangle([76, 76, stub_x - 32, 50 + th2 - 26], radius=16,
                         outline=(61, 92, 59, 140), width=3)
    for py in range(70, th2 + 30, 36):
        td.ellipse([stub_x - 6, 50 + py, stub_x + 6, 62 + py], fill=CREAM)
    td.ellipse([stub_x - 30, 20, stub_x + 30, 80], fill=CREAM)
    td.ellipse([stub_x - 30, 50 + th2 - 30, stub_x + 30, 50 + th2 + 30], fill=CREAM)
    hf = dm(82, 1000)
    td.text((112, 116), "ADMIT ONE", font=hf, fill=FOREST_DARK)
    lay = text_layer("to the good kind of school", dancing(53), CREAM)
    tick.alpha_composite(lay, (98, 226))
    sf2 = dm(31, 800)
    td.text((112, 348), "adventures start 9:00 am,", font=sf2, fill=(61, 92, 59, 255))
    td.text((112, 392), "location: the kitchen table", font=sf2, fill=(61, 92, 59, 255))
    # barcode strip along the bottom of the main section
    bx2 = 112
    import random
    rnd = random.Random(3)
    while bx2 < stub_x - 120:
        wdt = rnd.choice((3, 3, 5, 8))
        td.rectangle([bx2, 462, bx2 + wdt, 50 + th2 - 44], fill=(61, 92, 59, 200))
        bx2 += wdt + rnd.choice((5, 7, 9))
    nf2 = dm(26, 900)
    td.text((stub_x - 108, 468), "NO. 001", font=nf2, fill=FOREST_DARK)
    lay2 = text_layer("DAY", dm(52, 1000), FOREST_DARK)
    lay3 = text_layer("ONE", dm(52, 1000), FOREST_DARK)
    tick.alpha_composite(lay2.rotate(90, expand=True), (stub_x + 66, 170))
    tick.alpha_composite(lay3.rotate(90, expand=True), (stub_x + 136, 170))
    rot = tick.rotate(0, expand=True, resample=Image.BICUBIC)
    base.alpha_composite(rot, (int((W - rot.width) / 2), 520))

    sticker(base, "15 first-day ideas, free", (W / 2, 1268), dark_page=False)
    footer(d, FOREST_DARK, "Read it free. No email needed.", CREAM, "anywherelearning.co", GOLD_LIGHT)
    return save(base, out, "pin-06b-first-day")


# 07a — kindergarten PLAY blocks -------------------------------------------

def pin_07a(out):
    base, d = cream_base()
    kicker_pill(base, d, "KINDERGARTEN AT HOME", 126, dark=False)
    y = caps_center(d, "KINDERGARTEN'S", 182, 84, FOREST_DARK)
    y = script_center(base, "whole curriculum", y - 4, 120, TERRA)

    blocks = [("P", GOLD, -4), ("L", FOREST, 3), ("A", TERRA, -2), ("Y", FOREST_DARK, 4)]
    size = 206
    bx = (W - 4 * size - 3 * 18) / 2
    by = y + 128
    lf = dm(122, 1000)
    for i, (ch, color, ang) in enumerate(blocks):
        lay = Image.new("RGBA", (size + 60, size + 60), (0, 0, 0, 0))
        ld = ImageDraw.Draw(lay)
        ld.rounded_rectangle([30, 36, 30 + size, 36 + size], radius=26, fill=(20, 35, 20, 60))
        ld.rounded_rectangle([30, 30, 30 + size, 30 + size], radius=26, fill=color)
        ld.rounded_rectangle([48, 48, 12 + size, 12 + size], radius=18, outline=blend(color, CREAM, 0.5), width=4)
        fg = FOREST_DARK if color in (GOLD,) else CREAM
        ld.text((30 + (size - ld.textlength(ch, font=lf)) / 2, 30 + 28), ch, font=lf, fill=fg)
        rot_paste(base, lay, ang, (bx + size / 2 + i * (size + 18), by + size / 2))

    sub = "no boxed curriculum required at five"
    sf, _ = fit_dm(d, sub, 34, 700, 820)
    sw = d.textlength(sub, font=sf)
    bx2 = (W - sw - 80) / 2
    d.rounded_rectangle([bx2, by + size + 96, bx2 + sw + 80, by + size + 168], radius=16, fill=blend(CREAM, GOLD_LIGHT, 0.45))
    d.text((bx2 + 40, by + size + 110), sub, font=sf, fill=FOREST_DARK)
    sy2 = script_center(base, "math, science, and grit are hiding in there", by + size + 210, 72, GOLD_DARK, angle=0)

    sticker(base, "the k-guide is free", (W / 2, 1276), dark_page=False)
    footer(d, FOREST_DARK, "Read it free. No email needed.", CREAM, "anywherelearning.co", GOLD_LIGHT)
    return save(base, out, "pin-07a-kindergarten")


# 07b — kindergarten, it already counts ------------------------------------

def pin_07b(out):
    base, d = dark_base()
    kicker_pill(base, d, "NO CURRICULUM NEEDED", 130, dark=True)
    y = caps_center(d, "KINDERGARTEN", 172, 108, CREAM)
    y = script_center(base, "already counts", y + 2, 110, GOLD, angle=0)

    rows = [("counted acorns on a walk", "MATH"), ("made up a bedtime story", "LITERACY"),
            ("dug for worms all morning", "SCIENCE"), ("helped make lunch", "LIFE SKILLS")]
    ry = y + 84
    cf = dm(27, 1000)
    for text, chip in rows:
        f, _ = fit_dm(d, text, 38, 800, 560, min_size=30)
        d.text((90, ry + 10), text, font=f, fill=CREAM)
        cw2 = d.textlength(chip, font=cf)
        d.rounded_rectangle([910 - cw2 - 44, ry, 910, ry + 54], radius=27, fill=GOLD)
        d.text((910 - cw2 - 22, ry + 11), chip, font=cf, fill=FOREST_DARK)
        d.line([(90, ry + 78), (910, ry + 78)], fill=(212, 163, 115, 70), width=3)
        ry += 112
    sy2 = script_center(base, "school was happening all along", ry + 14, 84, GOLD)

    sticker(base, "see what counts, free", (W / 2, 1276), dark_page=True)
    footer(d, GOLD, "Read it free. No email needed.", FOREST_DARK, "anywherelearning.co", CREAM)
    return save(base, out, "pin-07b-kindergarten")


# 10a — project-based learning loop ----------------------------------------

def pin_10a(out):
    base, d = cream_base()
    kicker_pill(base, d, "PROJECT-BASED LEARNING", 126, dark=False)
    y = caps_center(d, "THE LOOP THAT", 176, 84, FOREST_DARK)
    y = script_center(base, "teaches everything", y - 6, 116, TERRA)

    cxx, cyy, r = W / 2, 845, 265
    nodes = [("THEY ASK", FOREST, (cxx, cyy - r)), ("THEY PLAN", GOLD, (cxx + r, cyy)),
             ("THEY BUILD", TERRA, (cxx, cyy + r)), ("THEY SHOW", FOREST_DARK, (cxx - r, cyy))]
    # ring arrows
    arc = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    ad = ImageDraw.Draw(arc)
    ad.arc([cxx - r, cyy - r, cxx + r, cyy + r], start=0, end=360, fill=blend(CREAM, FOREST, 0.35), width=7)
    base.alpha_composite(arc)
    for i in range(4):
        ang = math.radians(45 + i * 90)
        ax, ay = cxx + r * math.cos(ang), cyy + r * math.sin(ang)
        # arrowhead tangent
        tx, ty = -math.sin(ang), math.cos(ang)
        tip = (ax + 16 * tx, ay + 16 * ty)
        d.polygon([tip, (ax - 12 * tx + 10 * math.cos(ang), ay - 12 * ty + 10 * math.sin(ang)),
                   (ax - 12 * tx - 10 * math.cos(ang), ay - 12 * ty - 10 * math.sin(ang))],
                  fill=blend(CREAM, FOREST, 0.5))
    nf = dm(30, 1000)
    for label, color, (nx, ny) in nodes:
        tw_ = d.textlength(label, font=nf)
        d.rounded_rectangle([nx - tw_ / 2 - 34, ny - 40, nx + tw_ / 2 + 34, ny + 40], radius=40, fill=color)
        d.text((nx - tw_ / 2, ny - 18), label, font=nf, fill=CREAM if color != GOLD else FOREST_DARK)
    size = 52
    probe = ImageDraw.Draw(Image.new("RGBA", (8, 8)))
    while size > 30 and probe.textlength("no worksheets", font=dancing(size)) > 2 * (r - 110):
        size -= 4
    lay = text_layer("no worksheets", dancing(size), GOLD_DARK)
    base.alpha_composite(lay, (int(cxx - lay.width / 2), int(cyy - 70)))
    lay2 = text_layer("involved", dancing(size), GOLD_DARK)
    base.alpha_composite(lay2, (int(cxx - lay2.width / 2), int(cyy + 2)))

    sticker(base, "see a real one, free", (W / 2, 1300), dark_page=False)
    footer(d, FOREST_DARK, "Read it free. No email needed.", CREAM, "anywherelearning.co", GOLD_LIGHT)
    return save(base, out, "pin-10a-pbl")


# 10b — the kid's plan ------------------------------------------------------

def pin_10b(out):
    base, d = dark_base()
    kicker_pill(base, d, "PROJECT-BASED LEARNING", 130, dark=True)
    y = caps_center(d, "STOP PLANNING", 190, 88, CREAM)
    y = script_center(base, "their projects", y - 2, 124, GOLD, angle=0)

    cw2, ch2 = 820, 560
    card, m = card_with_shadow(cw2, ch2)
    cd = ImageDraw.Draw(card)
    cd.line([(m + 92, m + 24), (m + 92, m + ch2 - 24)], fill=(196, 131, 106, 120), width=4)
    hf = dm(32, 1000)
    cd.text((m + (cw2 - cd.textlength("THE KID'S PLAN:", font=hf)) / 2, m + 42), "THE KID'S PLAN:", font=hf, fill=(140, 140, 135, 255))
    plan = ["build a museum in the hallway", "make tickets", "charge grandma admission"]
    py = m + 122
    nf = dm(30, 1000)
    for i, line in enumerate(plan):
        cd.ellipse([m + 118, py + 12, m + 162, py + 56], fill=GOLD)
        num = str(i + 1)
        cd.text((m + 140 - cd.textlength(num, font=nf) / 2, py + 19), num, font=nf, fill=FOREST_DARK)
        lay = text_layer(line, dancing(54), INK)
        card.alpha_composite(lay, (m + 168, py - 8))
        cd.line([(m + 118, py + 76), (m + cw2 - 60, py + 76)], fill=blend(WHITE, FOREST, 0.16), width=3)
        py += 112
    tail = "this teaches more than any kit"
    tf2 = dm(31, 800)
    cd.text((m + (cw2 - cd.textlength(tail, font=tf2)) / 2, py + 14), tail, font=tf2, fill=TERRA)
    for tx, ang in ((m + 50, -16), (m + cw2 - 210, 14)):
        tape = Image.new("RGBA", (190, 48), (0, 0, 0, 0))
        ImageDraw.Draw(tape).rectangle([0, 0, 190, 48], fill=(232, 201, 154, 205))
        trot = tape.rotate(ang, expand=True, resample=Image.BICUBIC)
        card.alpha_composite(trot, (tx, m - 26))
    rot = card.rotate(0, expand=True, resample=Image.BICUBIC)
    base.alpha_composite(rot, (int((W - rot.width) / 2), 498))

    sticker(base, "let them plan it, guide free", (W / 2, 1272), dark_page=True)
    footer(d, GOLD, "Read it free. No email needed.", FOREST_DARK, "anywherelearning.co", CREAM)
    return save(base, out, "pin-10b-pbl")


# 12a — what a day really looks like (donut) -------------------------------

def pin_12a(out):
    base, d = cream_base()
    kicker_pill(base, d, "SAMPLE HOMESCHOOL SCHEDULES", 126, dark=False)
    y = caps_center(d, "A HOMESCHOOL DAY,", 176, 84, FOREST_DARK)
    y = script_center(base, "the honest version", y - 2, 116, TERRA)

    segs = [("seat work", 2, GOLD), ("outside", 2, FOREST), ("free play", 3, GOLD_LIGHT),
            ("real-life jobs", 2, TERRA), ("together time", 3, FOREST_DARK)]
    total = sum(x[1] for x in segs)
    cxx, cyy, r = 500, 748, 240
    start = -90
    for _, hours, color in segs:
        sweep = 360 * hours / total
        d.pieslice([cxx - r, cyy - r, cxx + r, cyy + r], start, start + sweep, fill=color)
        start += sweep
    d.ellipse([cxx - 126, cyy - 126, cxx + 126, cyy + 126], fill=CREAM)
    lay = text_layer("a real day", dancing(48), GOLD_DARK)
    base.alpha_composite(lay, (int(cxx - lay.width / 2), int(cyy - 42)))

    lf = dm(29, 800)
    ly = 1036
    for row in (segs[:3], segs[3:]):
        widths = [26 + 14 + d.textlength(f"{n} {h}h", font=lf) for n, h, c in row]
        total_w = sum(widths) + (len(row) - 1) * 44
        x = (W - total_w) / 2
        for (name, hours, color), wd in zip(row, widths):
            d.rounded_rectangle([x, ly + 2, x + 26, ly + 28], radius=8, fill=color)
            d.text((x + 40, ly - 2), f"{name} {hours}h", font=lf, fill=INK)
            x += wd + 44
        ly += 58
    sub = "yes, two hours of seat work is plenty"
    sf, _ = fit_dm(d, sub, 32, 700, 800)
    sw = d.textlength(sub, font=sf)
    bx2 = (W - sw - 80) / 2
    d.rounded_rectangle([bx2, ly + 14, bx2 + sw + 80, ly + 82], radius=16, fill=blend(CREAM, GOLD_LIGHT, 0.45))
    d.text((bx2 + 40, ly + 26), sub, font=sf, fill=FOREST_DARK)

    sticker(base, "the honest breakdown, free", (W / 2, 1300), dark_page=False)
    footer(d, FOREST_DARK, "Real schedules, free to read.", CREAM, "anywherelearning.co", GOLD_LIGHT)
    return save(base, out, "pin-12a-schedules")


# 12b — two clocks ----------------------------------------------------------

def clock(d, cx, cy, r, face, hand_color, hour_angle, minute_angle):
    d.ellipse([cx - r - 10, cy - r - 4, cx + r + 10, cy + r + 16], fill=(20, 35, 20, 60))
    d.ellipse([cx - r, cy - r, cx + r, cy + r], fill=face)
    for i in range(12):
        a = math.radians(i * 30)
        x1, y1 = cx + (r - 22) * math.sin(a), cy - (r - 22) * math.cos(a)
        x2, y2 = cx + (r - 40) * math.sin(a), cy - (r - 40) * math.cos(a)
        d.line([(x1, y1), (x2, y2)], fill=hand_color, width=5)
    ha = math.radians(hour_angle)
    d.line([(cx, cy), (cx + (r - 95) * math.sin(ha), cy - (r - 95) * math.cos(ha))], fill=hand_color, width=13)
    ma = math.radians(minute_angle)
    d.line([(cx, cy), (cx + (r - 55) * math.sin(ma), cy - (r - 55) * math.cos(ma))], fill=hand_color, width=8)
    d.ellipse([cx - 12, cy - 12, cx + 12, cy + 12], fill=hand_color)


def pin_12b(out):
    base, d = dark_base()
    kicker_pill(base, d, "THE SCHEDULE MYTH", 130, dark=True)
    y = caps_center(d, "SAME LEARNING.", 190, 90, CREAM)
    y = script_center(base, "half the day", y - 2, 128, GOLD)

    cy2 = y + 334
    clock(d, 258, cy2, 228, CREAM, (61, 92, 59, 255), 90, 0)
    clock(d, 742, cy2, 228, GOLD_LIGHT, (176, 96, 63, 255), 0, 0)
    lf = dm(32, 900)
    for cx, label in ((258, "school: 9 to 3"), (742, "home: done by 12")):
        tw_ = d.textlength(label, font=lf)
        d.rounded_rectangle([cx - tw_ / 2 - 26, cy2 + 262, cx + tw_ / 2 + 26, cy2 + 318], radius=16,
                            fill=(90, 120, 89, 255))
        d.text((cx - tw_ / 2, cy2 + 272), label, font=lf, fill=GOLD_LIGHT if cx == 258 else CREAM)

    sticker(base, "real schedules inside, free", (W / 2, 1288), dark_page=True)
    footer(d, GOLD, "Read it free. No email needed.", FOREST_DARK, "anywherelearning.co", CREAM)
    return save(base, out, "pin-12b-schedules")


COVERS = {
    "pin-01a-first-year": pin_01a,
    "pin-01b-first-year": pin_01b,
    "pin-03a-routines": pin_03a,
    "pin-03b-routines": pin_03b,
    "pin-05a-free-guide-week": pin_05a,
    "pin-05b-free-guide-week": pin_05b,
    "pin-06a-first-day": pin_06a,
    "pin-06b-first-day": pin_06b,
    "pin-07a-kindergarten": pin_07a,
    "pin-07b-kindergarten": pin_07b,
    "pin-10a-pbl": pin_10a,
    "pin-10b-pbl": pin_10b,
    "pin-12a-schedules": pin_12a,
    "pin-12b-schedules": pin_12b,
    "pin-16a-deschooling": pin_16a,
    "pin-16b-deschooling": pin_16b,
    "pin-18a-burnout": pin_18a,
    "pin-18b-burnout": pin_18b,
    "pin-19a-free-guide": pin_19a,
    "pin-19b-free-guide": pin_19b,
    "pin-21a-life-skills-before-12": pin_21a,
    "pin-21b-life-skills-before-12": pin_21b,
    "pin-23a-stem-by-age": pin_23a,
    "pin-23b-stem-by-age": pin_23b,
}


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--only")
    ap.add_argument("--out", default=DEFAULT_OUT)
    args = ap.parse_args()
    names = [args.only] if args.only else list(COVERS)
    for n in names:
        print(os.path.basename(COVERS[n](args.out)))


if __name__ == "__main__":
    main()
