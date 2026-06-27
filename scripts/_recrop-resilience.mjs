import sharp from 'sharp';

// IMG_4929 is 3024w x 4032h (portrait). Center-crop to landscape loses the rider's face.
// Crop a 16:9 frame anchored at the TOP THIRD where the rider's upper body sits.
// Width = 3024, height = 3024 * 9/16 ≈ 1701. Top = ~y=200 puts rider in frame.

const HERO_SRC = '/tmp/IMG_4929.jpg';
const HERO_OUT = '/Users/ameliedrouin/anywhere-learning/public/images/resilience-hero-v2.jpeg';

// For the hero: face must be high in frame so blog component crops don't lose it.
// Crop wider than 16:9 with the face anchored just below top.
await sharp(HERO_SRC)
  .extract({ left: 0, top: 0, width: 3024, height: 1701 })
  .resize({ width: 1600 })
  .jpeg({ quality: 82 })
  .toFile(HERO_OUT);
console.log('Saved hero:', HERO_OUT);

// IMG_4766 is also 3024x4032 portrait. The hikers + cliff need to fit in 16:9.
// For mid-post: capture cliff peak + hikers in bottom third.
// Crop 3024 x 1701, top y=1100 to center on hikers with cliff above.
const MID_SRC = '/tmp/IMG_4766.jpg';
const MID_OUT = '/Users/ameliedrouin/anywhere-learning/public/images/resilience-hike-v2.jpeg';

// Mid-post: wide letterbox crop so the rendered figure is shorter on page.
// Original 3024x4032. Take a 21:9 horizontal slice centered on the hiker.
// height = 3024 * 9/21 = 1296. top to center on hiker = 1450.
await sharp(MID_SRC)
  .extract({ left: 0, top: 1450, width: 3024, height: 1296 })
  .resize({ width: 1600 })
  .jpeg({ quality: 82 })
  .toFile(MID_OUT);
console.log('Saved hike:', MID_OUT);
