// Load an image from a preloaded file
// Image source: https://flickr.com/photos/jasonidzerda/3987784466
let im = vips.Image.newFromFile('owl.jpg');

// A matrix for a sepia-like effect
const matrix = [
  [0.3588, 0.7044, 0.1368],
  [0.2990, 0.5870, 0.1140],
  [0.2392, 0.4696, 0.0912]
];

// Recomb the image with the specified matrix
im = im.recomb(matrix).cast(vips.BandFormat.uchar/* 'uchar' */);

// Finally, write the result to a blob
const t0 = performance.now();
const outBuffer = im.writeToBuffer('.jpg');
const t1 = performance.now();

console.log(`Call to writeToBuffer took ${t1 - t0} milliseconds.`);

const blob = new Blob([outBuffer], { type: 'image/jpeg' });
const blobURL = URL.createObjectURL(blob);
const img = document.createElement('img');
img.src = blobURL;
document.getElementById('output').appendChild(img);
