// Image source: https://flickr.com/photos/jasonidzerda/3987784466
let im = vips.Image.newFromFile('owl.jpg', {
  access: vips.Access.sequential // 'sequential'
});

// Image source: https://upload.wikimedia.org/wikipedia/commons/4/47/PNG_transparency_demonstration_1.png
let watermark = vips.Image.thumbnail('transparency_demo.png', 500);

// Set the watermark alpha to 20%
// (multiply A of RGBA by 0.2)
watermark = watermark.multiply([1, 1, 1, 0.2]);

// Overlay the watermark at the bottom left,
// with a 10 pixel margin
im = im.composite(watermark, vips.BlendMode.over/* 'over' */, {
  x: 10,
  y: im.height - watermark.height - 10
});

// Finally, write the result to a blob
const t0 = performance.now();
const outBuffer = im.writeToBuffer('.jpg');
const t1 = performance.now();

console.log(`Call to writeToBuffer took ${t1 - t0} milliseconds.`);

const blob = new Blob([outBuffer], { type: 'image/jpg' });
const blobURL = URL.createObjectURL(blob);
const img = document.createElement('img');
img.src = blobURL;
document.getElementById('output').appendChild(img);
