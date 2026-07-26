// Load an image from a preloaded file
// Image source: https://flickr.com/photos/jasonidzerda/3987784466
const im = vips.Image.newFromFile('owl.jpg');

// Find image minimum
let minPos = {
  x: undefined, // Output horizontal position of minimum here
  y: undefined // Output vertical position of minimum here
};
const min = im.min(minPos);

document.getElementById('min').innerText =
    `image minimum: ${min} [${minPos.x}, ${minPos.y}]`;

// Find image maximum
let maxPos = {
  x: undefined, // Output horizontal position of maximum here
  y: undefined // Output vertical position of maximum here
};
const max = im.max(maxPos);

document.getElementById('max').innerText =
    `image maximum: ${max} [${maxPos.x}, ${maxPos.y}]`;

// The binding also defines a few extra useful utility functions, for e.g.
// the above can be written as:
minPos = im.minPos();
maxPos = im.maxPos();

console.log(JSON.stringify({
  min: minPos,
  max: maxPos
}));
