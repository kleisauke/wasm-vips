// Brightness multiplier
const brightness = 1.5;

// Saturation multiplier
const saturation = 1.5;

// Degrees for hue rotation
let hue = 180;

// Normalize hue rotation to [0, 360]
hue %= 360;
if (hue < 0) {
  hue = 360 + hue;
}

// Load an image from a preloaded file
// Image source: https://flickr.com/photos/jasonidzerda/3987784466
let im = vips.Image.newFromFile('owl.jpg');

// Get original colorspace
const typeBeforeModulate = im.interpretation;

// Modulate brightness, saturation and hue
if (im.hasAlpha()) {
  // Separate alpha channel
  const withoutAlpha = im.extractBand(0, { n: im.bands - 1 });
  const alpha = im.extractBand(im.bands - 1);
  im = withoutAlpha.colourspace(vips.Interpretation.lch/* 'lch' */)
    .linear([brightness, saturation, 1], [0.0, 0.0, hue])
    .colourspace(typeBeforeModulate)
    .bandjoin(alpha);
} else {
  im = im.colourspace(vips.Interpretation.lch/* 'lch' */)
    .linear([brightness, saturation, 1], [0.0, 0.0, hue])
    .colourspace(typeBeforeModulate);
}

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
