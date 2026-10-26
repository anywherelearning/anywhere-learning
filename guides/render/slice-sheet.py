# Cut a 4x3 watercolour clipart sheet (Canva generate-image) into 12 square pieces.
# usage: python3 guides/render/slice-sheet.py <sheet.jpg> <prefix> name1 ... name12
import sys
from PIL import Image
src, prefix, names = sys.argv[1], sys.argv[2], sys.argv[3:]
assert len(names) == 12
im = Image.open(src).convert('RGB'); W, H = im.size
for i, n in enumerate(names):
    c, r = i % 4, i // 4
    cell = im.crop((c * W // 4 + 10, r * H // 3 + 10, (c + 1) * W // 4 - 10, (r + 1) * H // 3 - 10))
    cell = cell.crop(cell.convert('L').point(lambda v: 255 if v < 235 else 0).getbbox())
    w, h = cell.size; s = max(w, h) + 20
    sq = Image.new('RGB', (s, s), 'white'); sq.paste(cell, ((s - w) // 2, (s - h) // 2))
    sq.resize((360, 360), Image.LANCZOS).save(f'guides/clipart/wc/{prefix}-{n}.jpg', quality=90)
