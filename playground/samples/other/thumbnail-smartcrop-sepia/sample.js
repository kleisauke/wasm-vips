// Smart crop to 500x500 using the attention strategy
// (searches the image for features which might catch a human eye)
// Image source: https://www.flickr.com/photos/jasonidzerda/3987784466
let thumbnail = vips.Image.thumbnail('owl.jpg', 500, {
    height: 500,
    no_rotate: true,
    crop: vips.Interesting.attention /*'attention'*/
});

// The loader which was used to load the image
console.log(thumbnail.getString('vips-loader'));

// The minimum / maximum pixel position
const minPos = thumbnail.minPos();
const maxPos = thumbnail.maxPos();
console.log(JSON.stringify({
    min: minPos,
    max: maxPos
}));

// A matrix for a sepia-like effect
const matrix = [
    [0.3588, 0.7044, 0.1368],
    [0.2990, 0.5870, 0.1140],
    [0.2392, 0.4696, 0.0912]
];

// Recomb the image with the specified matrix
const sepia = thumbnail.recomb(matrix).cast(vips.BandFormat.uchar/*'uchar'*/);

// Join an array of images
thumbnail = vips.Image.arrayjoin([thumbnail, sepia], {
    across: 2, // number of images per row
    shim: 10, // space between images, in pixels
    background: [255, 255, 255] // background colour
});

console.log(JSON.stringify({
    width: thumbnail.width,
    height: thumbnail.height,
    space: thumbnail.interpretation,
    channels: thumbnail.bands,
    depth: thumbnail.format
}));

// Finally, write the result to a blob
const t0 = performance.now();
const outBuffer = new Uint8Array(thumbnail.writeToBuffer('.jpg'));
const t1 = performance.now();

console.log(`Call to writeToBuffer took ${t1 - t0} milliseconds.`);

const blob = new Blob([outBuffer], {type: 'image/jpeg'});
const blobURL = URL.createObjectURL(blob);
const img = document.createElement('img');
img.src = blobURL;
document.getElementById('output').appendChild(img);
