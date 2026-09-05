#!/usr/bin/env python3
"""Report vertical balance of generated pins.

For each pin, measures the content bounding box between the wordmark and the
footer and prints the gap above vs below. `shift` is how far content should
move down (+) or up (-) to be centred. Flags anything off by more than 70px.

Usage: python3 check_balance.py "<folder of .jpg pins>"
"""
import os, sys
from PIL import Image

TOP, BOT = 116, 1382
def analyze(path):
    im = Image.open(path).convert("RGB")
    px = im.load()
    bg = px[8, 8]
    top = bot = None
    for y in range(TOP, BOT):
        n = 0
        for x in range(0, 1000, 3):          # sample every 3rd column
            p = px[x, y]
            if abs(p[0]-bg[0]) + abs(p[1]-bg[1]) + abs(p[2]-bg[2]) > 150:
                n += 1
                if n > 4: break
        if n > 4:
            if top is None: top = y
            bot = y
    return top, bot

d = sys.argv[1]
for fn in sorted(os.listdir(d)):
    if not fn.endswith(".jpg"): continue
    top, bot = analyze(os.path.join(d, fn))
    if top is None:
        print(f"{fn:52s} no content"); continue
    ga, gb = top - TOP, BOT - bot
    flag = "  <-- OFF" if abs(ga - gb) > 70 else ""
    print(f"{fn:52s} above={ga:4d} below={gb:4d} shift={(gb-ga)//2:+4d}{flag}")
