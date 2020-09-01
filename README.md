# wasm-vips

[libvips](https://libvips.github.io/libvips) for the browser and Node.js,
compiled to WebAssembly with Emscripten.

Programs that use `wasm-vips` don't manipulate images directly, instead
they create pipelines of image processing operations building on a source
image. When the end of the pipe is connected to a destination, the whole
pipeline executes at once, streaming the image in parallel from source to
destination a section at a time.  Because `wasm-vips` is parallel, it's quick,
and because it doesn't need to keep entire images in memory, it's light.

> Note: This library is still under early development. See: [#1](https://github.com/kleisauke/wasm-vips/issues/1).

## Browser support

A browser that [supports the SharedArrayBuffer API](https://caniuse.com/#feat=sharedarraybuffer).

| ![Chrome](https://raw.githubusercontent.com/alrra/browser-logos/main/src/chrome/chrome_24x24.png)<br/>Chrome | ![Firefox](https://raw.githubusercontent.com/alrra/browser-logos/main/src/firefox/firefox_24x24.png)<br/>Firefox | ![Edge](https://raw.githubusercontent.com/alrra/browser-logos/main/src/edge/edge_24x24.png)<br/>Edge |
| ----------- | ----------- | ----------- | 
| [version 74+](https://www.chromestatus.com/feature/5724132452859904) | [version 79+](https://developer.mozilla.org/en-US/docs/Mozilla/Firefox/Releases/79#WebAssembly) | [version 79+](https://developer.microsoft.com/en-us/microsoft-edge/status/sharedmemoryandatomics/) |

## Installation

```bash
npm install wasm-vips
```

## Usage

### Browser

Requires `vips.js`, `vips.wasm` and `vips.worker.js` to be served from
the same directory.

```html
<script src="vips.js"></script>
<script>
const vips = await Vips();
</script>
```

### Node.js

Since `wasm-vips` uses the latest experimental features of WebAssembly,
you need to add these extra flags to run in Node.js.

```bash
node --experimental-wasm-threads --experimental-wasm-simd --experimental-wasm-bulk-memory demo.js
```

## Example

```js
// Load an image from a file
let im = vips.Image.newFromFile('owl.jpg');

// Put im at position (100, 100) in a 3000 x 3000 pixel image,
// make the other pixels in the image by mirroring im up / down /
// left / right, see
// https://libvips.github.io/libvips/API/current/libvips-conversion.html#vips-embed
im = im.embed(100, 100, 3000, 3000, {
    extend: 'mirror'
});

// Multiply the green (middle) band by 2, leave the other two alone
im = im.multiply([1, 2, 1]);

// Make an image from an array constant, convolve with it
const mask = vips.Image.newFromArray([
    [-1, -1, -1],
    [-1, 16, -1],
    [-1, -1, -1]
], 8.0);

im = im.conv(mask, {
    precision: 'integer'
});

// Finally, write the result to a buffer
const outBuffer = im.writeToBuffer('.jpg');
```
