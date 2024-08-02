// #C83658 as CIELAB triple
const start = [46.479, 58.976, 15.052];

// #D8E74F as CIELAB triple
const stop = [88.12, -23.952, 69.178];

// Makes a lut which is a smooth gradient from start colour to stop colour,
// with start and stop in CIELAB
// let lut = vips.Image.identity() / 255;
let lut = vips.Image.identity().divide(255);

// lut = lut * stop + (1 - lut) * start;
lut = lut.multiply(stop).add(lut.multiply(-1).add(1).multiply(start));

lut = lut.colourspace(vips.Interpretation.srgb/* 'srgb' */, {
  source_space: vips.Interpretation.lab // 'lab'
});

// Load an image from a preloaded file
// Image source: https://flickr.com/photos/jasonidzerda/3987784466
let im = vips.Image.newFromFile('owl.jpg');
// let im = vips.Image.newFromFile('owl.tif');
// let im = vips.Image.newFromFile('owl.jxl');
// let im = vips.Image.newFromFile('owl.avif');
// let im = vips.Image.newFromFile('alphachannel.svg');
// let im = vips.Image.newFromFile('transparency_demo.png');
// let im = vips.Image.newFromFile('banana.webp', { n: -1 });
// let im = vips.Image.newFromFile('banana.gif', { n: -1 });

// Or to load a formatted image from buffer
// const buffer = await fetch('assets/images/owl.webp').then(resp => resp.arrayBuffer());
// let im = vips.Image.newFromBuffer(buffer);

// The first step to implement a duotone filter is to convert the
// image to greyscale. The image is then mapped through the lut.
// Mapping is done by looping over the image and looking up each
// pixel value in the lut and replacing it with the pre-calculated
// result.
if (im.hasAlpha()) {
  // Separate alpha channel
  const withoutAlpha = im.extractBand(0, { n: im.bands - 1 });
  const alpha = im.extractBand(im.bands - 1);
  im = withoutAlpha.colourspace(vips.Interpretation.b_w/* 'b-w' */)
    .maplut(lut)
    .bandjoin(alpha);
} else {
  im = im.colourspace(vips.Interpretation.b_w/* 'b-w' */).maplut(lut);
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
