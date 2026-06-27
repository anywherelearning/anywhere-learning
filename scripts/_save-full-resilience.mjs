import sharp from 'sharp';
await sharp('/tmp/IMG_4929.jpg').resize({ width: 1400 }).jpeg({ quality: 82 }).toFile('/Users/ameliedrouin/anywhere-learning/public/images/resilience-hero-v3.jpeg');
await sharp('/tmp/IMG_4766.jpg').resize({ width: 1400 }).jpeg({ quality: 82 }).toFile('/Users/ameliedrouin/anywhere-learning/public/images/resilience-hike-v3.jpeg');
console.log('done');
