// Load an image from a preloaded file
// Image source: https://flickr.com/photos/jasonidzerda/3987784466
let im = vips.Image.newFromFile('owl.jpg');

// The four primary emboss kernels
// Offset the pixel values by 128 to achieve the emboss effect
const kernel1 = vips.Image.newFromArray([
  [0, 1, 0],
  [0, 0, 0],
  [0, -1, 0]
], 1.0, 128);
const kernel2 = vips.Image.newFromArray([
  [1, 0, 0],
  [0, 0, 0],
  [0, 0, -1]
], 1.0, 128);
const kernel3 = kernel1.rot270();
const kernel4 = kernel2.rot90();

// Apply the emboss kernels
const images = [
  im.conv(kernel1, {
    precision: vips.Precision.integer // 'integer'
  }),
  im.conv(kernel2, {
    precision: vips.Precision.integer // 'integer'
  }),
  im.conv(kernel3, {
    precision: vips.Precision.integer // 'integer'
  }),
  im.conv(kernel4, {
    precision: vips.Precision.integer // 'integer'
  })
];

// Join the embossed images
im = vips.Image.arrayjoin(images, {
  across: 2, // number of images per row
  shim: 10, // space between images, in pixels
  background: [255, 255, 255] // background colour
});

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
