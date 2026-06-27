import sharp from 'sharp';

// IMG_4929 is 3024x4032 portrait. The whole rider + bike spans approx y=70 (helmet) to y=2400 (wheels on trail).
// Crop a 4:3 frame (width 3024, height 2268) that captures helmet to wheels.
// Top start: y=80 (just at helmet top). 80 + 2268 = 2348 (just past wheels). Good.
await sharp('/tmp/IMG_4929.jpg')
  .extract({ left: 0, top: 80, width: 3024, height: 2268 })
  .resize({ width: 1400 })
  .jpeg({ quality: 82 })
  .toFile('/Users/ameliedrouin/anywhere-learning/public/images/resilience-hero-v4.jpeg');
console.log('Saved hero v4');
