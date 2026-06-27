import sharp from 'sharp';
await sharp('/tmp/IMG_0558.jpg')
  .resize({ width: 1600 })
  .jpeg({ quality: 82 })
  .toFile('/Users/ameliedrouin/anywhere-learning/public/images/time-management-hero.jpeg');
console.log('saved hero');
