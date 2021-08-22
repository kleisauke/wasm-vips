function bandStats(hist, val) {
    const mask = vips.Image.identity().more(val).divide(255);
    return hist.multiply(mask).avg() * 256;
}

// Load an image from a preloaded file
// Image source: https://upload.wikimedia.org/wikipedia/commons/4/47/PNG_transparency_demonstration_1.png
const im = vips.Image.newFromFile('transparency_demo.png');
const hist = im.extractBand(3).histFind();

const total = im.width * im.height;
const alpha0 = bandStats(hist, 0);
const alpha1 = bandStats(hist, 254);

// Metrics on how many pixels are opaque (no alpha),
// translucent (some alpha), and transparent (100% alpha)
document.getElementById('stats').innerText = JSON.stringify({
    opaque: alpha1,
    translucent: alpha0 - alpha1,
    transparent: total - alpha0
});

// Finally, write the result to a blob
const t0 = performance.now();
const outBuffer = new Uint8Array(im.writeToBuffer('.png'));
const t1 = performance.now();

console.log(`Call to writeToBuffer took ${t1 - t0} milliseconds.`);

const blob = new Blob([outBuffer], {type: 'image/png'});
const blobURL = URL.createObjectURL(blob);
const img = document.createElement('img');
img.src = blobURL;
document.getElementById('output').appendChild(img);
