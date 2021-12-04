// [n=-1] means render until the end of the document
// Image source: https://storage.googleapis.com/downloads.webmproject.org/webp/images/dancing_banana2.lossless.webp
let thumbnail = vips.Image.thumbnail('banana.webp[n=-1]', 500, {
  height: 500
});

const delays = thumbnail.getArrayInt('delay');
console.log(`delays: [${delays}]`);

// Slow down the animation by 50% for each frame
thumbnail = thumbnail.copy();
thumbnail.setArrayInt('delay', delays.map(d => d * 1.5));

// Write the result to a blob
const t0 = performance.now();
const outBuffer = new Uint8Array(thumbnail.writeToBuffer('.gif'));
const t1 = performance.now();

console.log(`Call to writeToBuffer took ${t1 - t0} milliseconds.`);

const blob = new Blob([outBuffer], { type: 'image/gif' });
const blobURL = URL.createObjectURL(blob);
const img = document.createElement('img');
img.src = blobURL;
document.getElementById('output').appendChild(img);
