// Load an image from a preloaded file
// Image source: https://flickr.com/photos/jasonidzerda/3987784466
const im = vips.Image.newFromFile('owl.jpg');

document.getElementById('json').innerText = JSON.stringify({
  loader: im.getString('vips-loader'), // The loader which was used to load the image
  width: im.width,
  height: im.height,
  space: im.interpretation,
  channels: im.bands,
  depth: im.format
});
