import sharp from 'sharp';
await sharp('/tmp/IMG_0571.jpg')
  .resize({ width: 1200 })
  .jpeg({ quality: 82 })
  .toFile('/Users/ameliedrouin/anywhere-learning/public/images/time-management-mid.jpeg');
console.log('saved mid');
