# wasm-vips

[libvips](https://libvips.github.io/libvips) for the browser and Node.js,
compiled to WebAssembly with Emscripten.

Programs that use wasm-vips don't manipulate images directly, instead
they create pipelines of image processing operations building on a source
image. When the end of the pipe is connected to a destination, the whole
pipeline executes at once, streaming the image in parallel from source to
destination a section at a time. Because wasm-vips is parallel, it's quick,
and because it doesn't need to keep entire images in memory, it's light.

> Note: This library is still under early development. See: [#1](https://github.com/kleisauke/wasm-vips/issues/1).

## Engine support

An engine that [supports WebAssembly SIMD](https://webassembly.org/roadmap/).
This is present on most major browser engines. Node.js >= 16.4.0 is required
to match the final SIMD opcodes.

| ![Chrome](https://raw.githubusercontent.com/alrra/browser-logos/main/src/chrome/chrome_32x32.png)<br>Chrome | ![Firefox](https://raw.githubusercontent.com/alrra/browser-logos/main/src/firefox/firefox_32x32.png)<br>Firefox | ![Edge](https://raw.githubusercontent.com/alrra/browser-logos/main/src/edge/edge_32x32.png)<br>Edge | ![Node.js](https://raw.githubusercontent.com/nodejs/nodejs.org/master/static/images/favicons/favicon-32x32.png)<br>Node.js
|:---:|:---:|:---:|:---:|
| :heavy_check_mark:<br>[version 91+](https://www.chromestatus.com/feature/6533147810332672) | :heavy_check_mark:<br>[version 89+](https://bugzilla.mozilla.org/show_bug.cgi?id=1695585) | :heavy_check_mark:<br>[version 91+](https://www.chromestatus.com/feature/6533147810332672) | :heavy_check_mark:<br>[version 16.4+](https://github.com/nodejs/node/pull/38273) |

## Installation

wasm-vips can be installed with your favorite package manager.

```shell
npm install wasm-vips
```

```shell
yarn add wasm-vips
```

## Usage

### Browser

Requires `vips.js`, `vips.wasm` and `vips.worker.js` to be served from
the same directory.

Since wasm-vips requires [the `SharedArrayBuffer` API](
https://caniuse.com/sharedarraybuffer), the website needs to opt-in to
a cross-origin isolated state, by serving the following HTTP headers on
the main document:

```http
Cross-Origin-Embedder-Policy: require-corp
Cross-Origin-Opener-Policy: same-origin
```
<sup>See [here](https://web.dev/coop-coep/) for more information.</sup>

After that, wasm-vips can be imported and initialized like this:

```html
<script src="vips.js"></script>
<script type="module">
    const vips = await Vips();
</script>
```

### Node.js

On Node.js, wasm-vips is published as [a dual-package](
https://nodejs.org/api/packages.html#packages_conditional_exports), so it
can be imported as both CommonJS and ES6 module:

```js
// ES6 module
import Vips from 'wasm-vips';

// CommonJS module
const Vips = require('wasm-vips');
```

Then, wasm-vips can be initialized like this:

```js
// Usage with top-level await
const vips = await Vips();

// Usage with .then
Vips().then(vips => {
    // Code here
});
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
