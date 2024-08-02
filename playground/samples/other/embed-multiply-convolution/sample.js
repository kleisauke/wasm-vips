// Load an image from a preloaded file
// Image source: https://flickr.com/photos/jasonidzerda/3987784466
let im = vips.Image.newFromFile('owl.jpg');

// Put im at position (im.width, im.height) in a (im.width * 2) * (im.height * 2) pixel
// image, make the other pixels in the image by mirroring im up / down / left / right, see
// https://libvips.github.io/libvips/API/current/libvips-conversion.html#vips-embed
im = im.embed(im.width, im.height, im.width * 2, im.height * 2, {
  extend: vips.Extend.mirror // 'mirror'
});

// Multiply the green (middle) band by 2, leave the other two alone
im = im.multiply([1, 2, 1]);

// Make an image from an array constant, convolve with it
const mask = vips.Image.newFromArray([
  [-1, -1, -1],
  [-1, 16, -1],
  [-1, -1, -1]
], 8.0);

im = im.conv(mask, {
  precision: vips.Precision.integer // 'integer'
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
