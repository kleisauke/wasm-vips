// Load an image from a preloaded file
// Image source: https://flickr.com/photos/jasonidzerda/3987784466
let im = vips.Image.newFromFile('owl.jpg', {
  access: vips.Access.sequential // 'sequential'
});

// Optionally, convert to greyscale
// im = im.colourspace(vips.Interpretation.b_w/* 'b-w' */);

// Apply sobel operator
im = im.sobel();

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
