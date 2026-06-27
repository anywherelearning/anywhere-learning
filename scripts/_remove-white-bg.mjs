import sharp from 'sharp';

const IN = '/Users/ameliedrouin/anywhere-learning/public/library-hero.jpg';
const OUT = '/Users/ameliedrouin/anywhere-learning/public/library-hero-transparent.png';

const { data, info } = await sharp(IN)
  .ensureAlpha()
  .raw()
  .toBuffer({ resolveWithObject: true });

const { width, height, channels } = info;
const out = Buffer.from(data);

// Threshold: any pixel with R, G, B all >= 245 becomes fully transparent.
// Pixels with R, G, B all >= 230 get scaled alpha for soft edges.
for (let i = 0; i < out.length; i += channels) {
  const r = out[i], g = out[i + 1], b = out[i + 2];
  const min = Math.min(r, g, b);
  if (min >= 248) {
    out[i + 3] = 0; // fully transparent
  } else if (min >= 230) {
    // Linear ramp from alpha=255 at min=230 to alpha=0 at min=248
    const a = Math.round(((248 - min) / 18) * 255);
    out[i + 3] = Math.min(out[i + 3], a);
  }
}

await sharp(out, { raw: { width, height, channels } })
  .png({ compressionLevel: 9 })
  .toFile(OUT);

console.log('Saved', OUT, `${width}x${height}`);
