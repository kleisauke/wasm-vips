// Smart crop to 500x500 using the attention strategy
// (searches the image for features which might catch a human eye)
// Image source: https://flickr.com/photos/jasonidzerda/3987784466
const thumbnail = vips.Image.thumbnail('owl.jpg', 500, {
  height: 500,
  no_rotate: true,
  crop: vips.Interesting.attention // 'attention'
});

// Finally, write the result to a blob
const t0 = performance.now();
const outBuffer = thumbnail.writeToBuffer('.jpg');
const t1 = performance.now();

console.log(`Call to writeToBuffer took ${t1 - t0} milliseconds.`);

const blob = new Blob([outBuffer], { type: 'image/jpeg' });
const blobURL = URL.createObjectURL(blob);
const img = document.createElement('img');
img.src = blobURL;
document.getElementById('output').appendChild(img);
