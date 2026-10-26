# Cut a 4x3 watercolour clipart sheet (Canva generate-image) into 12 square pieces.
# usage: python3 guides/render/slice-sheet.py <sheet.jpg> <prefix> name1 ... name12
import sys
from PIL import Image
src, prefix, names = sys.argv[1], sys.argv[2], sys.argv[3:]
assert len(names) == 12

def main_run(counts, gap=10):
    # Group inked rows/columns into runs split by blank gaps; keep the heaviest run,
    # which drops slivers that bleed in from a neighbouring cell.
    runs, start, blank = [], None, 0
    for i, v in enumerate(counts):
        if v:
            if start is None: start = i
            blank, end = 0, i
        elif start is not None:
            blank += 1
            if blank >= gap: runs.append((start, end)); start = None
    if start is not None: runs.append((start, end))
    return max(runs, key=lambda r: sum(counts[r[0]:r[1] + 1]))

im = Image.open(src).convert('RGB'); W, H = im.size
for i, n in enumerate(names):
    c, r = i % 4, i // 4
    cell = im.crop((c * W // 4 + 4, r * H // 3 + 4, (c + 1) * W // 4 - 4, (r + 1) * H // 3 - 4))
    m = cell.convert('L').point(lambda v: 1 if v < 235 else 0)
    w, h = m.size; px = m.load()
    cols = [sum(px[x, y] for y in range(0, h, 2)) for x in range(w)]
    rows = [sum(px[x, y] for x in range(0, w, 2)) for y in range(h)]
    x0, x1 = main_run(cols); y0, y1 = main_run(rows)
    cell = cell.crop((x0, y0, x1 + 1, y1 + 1))
    w, h = cell.size; s = max(w, h) + 20
    sq = Image.new('RGB', (s, s), 'white'); sq.paste(cell, ((s - w) // 2, (s - h) // 2))
    sq.resize((360, 360), Image.LANCZOS).save(f'guides/clipart/wc/{prefix}-{n}.jpg', quality=90)
