# wasm-vips

[libvips](https://www.libvips.org/) for the browser and Node.js, compiled
to WebAssembly with Emscripten.

Programs that use wasm-vips don't manipulate images directly, instead
they create pipelines of image processing operations building on a source
image. When the end of the pipe is connected to a destination, the whole
pipeline executes at once, streaming the image in parallel from source to
destination a section at a time. Because wasm-vips is parallel, it's quick,
and because it doesn't need to keep entire images in memory, it's light.

> [!NOTE]
> This library is still under early development. See: [#1](
https://github.com/kleisauke/wasm-vips/issues/1).

## Engine support

An engine that supports [WebAssembly SIMD](https://caniuse.com/wasm-simd)
and [WebAssembly Exception Handling](
https://caniuse.com/wf-wasm-exception-handling). This is present on most
major browser engines and is part of [Baseline 2023](
https://web.dev/baseline/2023).

For V8-based engines, at least version 9.5 is required, this corresponds
to Chrome 95, Node.js 17.0.0 and Deno 1.16.0.

For Spidermonkey-based engines, the JavaScript engine used in Mozilla Firefox
and whose version numbers are aligned, at least version 100 is required.

For JavaScriptCore-based engines, the built-in JavaScript engine for WebKit,
at least version 615.1.17 is required. This corresponds to Safari 16.4.

| ![Chrome](https://github.com/alrra/browser-logos/raw/main/src/chrome/chrome_32x32.png)<br>Chrome | ![Firefox](https://github.com/alrra/browser-logos/raw/main/src/firefox/firefox_32x32.png)<br>Firefox | ![Safari](https://github.com/alrra/browser-logos/raw/main/src/safari/safari_32x32.png)<br>Safari | ![Edge](https://github.com/alrra/browser-logos/raw/main/src/edge/edge_32x32.png)<br>Edge | ![Node.js](https://github.com/alrra/browser-logos/raw/main/src/node.js/node.js_32x32.png)<br>Node.js | ![Deno](https://github.com/alrra/browser-logos/raw/main/src/deno/deno_32x32.png)<br>Deno |
|:---:|:---:|:---:|:---:|:---:|:---:|
| :heavy_check_mark:<br>[version 95+](https://chromestatus.com/feature/4756734233018368) | :heavy_check_mark:<br>[version 100+](https://bugzil.la/1335652) | :heavy_check_mark:<br>[version 16.4+](https://webkit.org/blog/13966/webkit-features-in-safari-16-4/#javascript-and-webassembly) | :heavy_check_mark:<br>[version 95+](https://chromestatus.com/feature/4756734233018368) | :heavy_check_mark:<br>[version 17.0+](https://github.com/nodejs/node/pull/40178) | :heavy_check_mark:<br>[version 1.16+](https://github.com/denoland/deno/pull/12564) |

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

Requires `vips.js` (or `vips-es6.js`) and `vips.wasm` to be served from
the same directory.

Since wasm-vips requires [the `SharedArrayBuffer` API](
https://caniuse.com/sharedarraybuffer), the website needs to opt-in to
a cross-origin isolated state, by serving the following HTTP headers on
both the main document and `vips*.js` script:

```http
Cross-Origin-Embedder-Policy: require-corp
Cross-Origin-Opener-Policy: same-origin
```
<sup>See <https://web.dev/coop-coep/> for more information.</sup>

After that, wasm-vips can be imported and initialized like this:

```html
<script src="vips.js"></script>
<script type="module">
  const vips = await Vips();
</script>
```

Or, if you prefer to use ES6 modules:

```html
<script type="module">
  import Vips from './vips-es6.js';
  const vips = await Vips();
</script>
```
<sup>This requires support for [ES6 modules in workers](https://caniuse.com/mdn-api_worker_worker_ecmascript_modules).</sup>

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

### Deno

On Deno, the web ES6 module can be reused and imported from a CDN such as
[jsDelivr](https://www.jsdelivr.com/):

```js
import Vips from 'https://cdn.jsdelivr.net/npm/wasm-vips/lib/vips-es6.js';

const vips = await Vips();
```

## Example

```ts
// Load an image from a file
using im = vips.Image.newFromFile('owl.jpg');

// Put im at position (100, 100) in a 3000 x 3000 pixel image,
// make the other pixels in the image by mirroring im up / down /
// left / right, see
// https://www.libvips.org/API/current/method.Image.embed.html
using embed = im.embed(100, 100, 3000, 3000, {
  extend: 'mirror'
});

// Multiply the green (middle) band by 2, leave the other two alone
using multiply = embed.multiply([1, 2, 1]);

// Make an image from an array constant, convolve with it
using mask = vips.Image.newFromArray([
  [-1, -1, -1],
  [-1, 16, -1],
  [-1, -1, -1]
], 8.0);

using convolve = multiply.conv(mask, {
  precision: 'integer'
});

// Finally, write the result to a buffer
const outBuffer = convolve.writeToBuffer('.jpg');
```
<sup>If not transpiling, this requires support for the [`using`](
https://caniuse.com/mdn-javascript_statements_using) keyword. On Node.js,
you can enable it with the `--js-explicit-resource-management` CLI flag.
</sup>
