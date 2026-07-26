// #FFA500 as CIELAB triple
const tint = [74.93, 23.94, 78.96];

// Load an image from a preloaded file
// Image source: https://flickr.com/photos/jasonidzerda/3987784466
const im = vips.Image.newFromFile('owl.jpg');

// Get original colorspace
const typeBeforeTint = im.interpretation;

// Extract luminance
const luminance = im.colourspace(vips.Interpretation.lab/* 'lab' */).extractBand(0);

// Create the tinted version by combining the L from the original and the
// chroma from the tint
const chroma = tint.slice(-2);

let tinted = luminance.bandjoin(chroma)
  .copy({
    interpretation: vips.Interpretation.lab // 'lab'
  })
  .colourspace(typeBeforeTint);

// Attach original alpha channel, if any
if (im.hasAlpha()) {
  // Extract original alpha channel
  const alpha = im.extractBand(im.bands - 1);

  // Join alpha channel to normalized image
  tinted = tinted.bandjoin(alpha);
}

// Finally, write the result to a blob
const t0 = performance.now();
const outBuffer = tinted.writeToBuffer('.jpg');
const t1 = performance.now();

console.log(`Call to writeToBuffer took ${t1 - t0} milliseconds.`);

const blob = new Blob([outBuffer], { type: 'image/jpeg' });
const blobURL = URL.createObjectURL(blob);
const img = document.createElement('img');
img.src = blobURL;
document.getElementById('output').appendChild(img);
