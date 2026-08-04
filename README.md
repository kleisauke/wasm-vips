# @colorhythm/vips-wasm

[![npm version](https://img.shields.io/npm/v/%40colorhythm%2Fvips-wasm.svg)](https://www.npmjs.com/package/@colorhythm/vips-wasm)

[libvips](https://www.libvips.org/) compiled to WebAssembly for image
processing in browsers and Node.js. Colorhythm maintains this distribution for
applications that need a scoped npm package with a verifiable relationship to
the parent release.

This is a packaging and release-assurance fork of
[kleisauke/wasm-vips](https://github.com/kleisauke/wasm-vips), not a divergent
image-processing implementation.

## What Colorhythm adds

- A public package under the `@colorhythm/vips-wasm` name
- An exported `integrity.json` manifest containing the parent commit, npm
  archive integrity, and SHA-256 hash of every retained parent file
- A guarded release process with exact payload verification, CommonJS and ESM
  smoke tests on the minimum Node.js version, and npm provenance through trusted
  publishing

Colorhythm package versions correspond directly to parent `wasm-vips`
versions. The JavaScript, WebAssembly, declarations, version metadata,
`LICENSE`, and `THIRD-PARTY-NOTICES.md` files are copied unchanged from the
selected parent release. The integrity manifest enforces that relationship.

Supported distributions target browsers and Node.js. Colorhythm does not
publish or test a separate Deno build.

## Install

```sh
npm install @colorhythm/vips-wasm
```

Node.js 17 or later is required.

## Use in Node.js

```js
import Vips from "@colorhythm/vips-wasm";

const vips = await Vips();

try {
    const image = vips.Image.newFromFile("input.jpg");

    try {
        image.writeToFile("output.webp");
    } finally {
        image.delete();
    }
} finally {
    vips.shutdown();
}
```

CommonJS is also supported:

```js
const Vips = require("@colorhythm/vips-wasm");
```

The generated TypeScript declarations ship with the package. The API follows
[libvips operations](https://www.libvips.org/API/current/) while constructing
lazy pipelines that execute when an output is requested.

## Browser deployment

The browser build requires WebAssembly SIMD, WebAssembly exception handling,
`SharedArrayBuffer`, cross-origin isolation, and module workers when using the
ESM entry point. The ESM build targets Chrome and Edge 95 or later, Firefox 114
or later, and Safari 16.4 or later.

Serve `vips-es6.js` or `vips.js` from the same directory as `vips.wasm` and any
dynamic modules in use: `vips-heif.wasm`, `vips-jxl.wasm`, and
`vips-resvg.wasm`. The `.wasm` files are exported individually for custom asset
pipelines.

The main document and JavaScript responses must opt in to cross-origin
isolation:

```http
Cross-Origin-Embedder-Policy: require-corp
Cross-Origin-Opener-Policy: same-origin
```

HEIF and JPEG XL support load by default. Include resvg explicitly when SVG
decoding is required:

```js
import Vips from "./vips-es6.js";

const vips = await Vips({
    dynamicLibraries: [
        "vips-heif.wasm",
        "vips-jxl.wasm",
        "vips-resvg.wasm",
    ],
});
```

The parent project remains under early development. Track behavior and API
changes in the parent
[changelog](https://github.com/kleisauke/wasm-vips/blob/master/CHANGELOG.md)
and [development issue](https://github.com/kleisauke/wasm-vips/issues/1).

## Develop

Install dependencies and run the checks:

```sh
git clone https://github.com/colorhythm/vips-wasm.git
cd vips-wasm
npm ci
npm test
```

Rebuilding the WebAssembly payload requires Docker:

```sh
npm run build
```

The [release guide](https://github.com/colorhythm/vips-wasm/blob/master/RELEASING.md)
documents package verification, publication, promotion, and rollback.

## Lineage and thanks

This is Colorhythm's maintained npm distribution of
[wasm-vips](https://github.com/kleisauke/wasm-vips) by
[Kleis Auke Wolthuizen](https://github.com/kleisauke). Kleis's Emscripten build
and JavaScript bindings made libvips practical in browsers and Node.js. Thank
you, Kleis.

[libvips](https://github.com/libvips/libvips) is developed by the libvips
project and its contributors.

## License

The wasm-vips binding and wrapper code are available under the parent project's
[MIT License](https://github.com/colorhythm/vips-wasm/blob/master/LICENSE),
copyright 2020-present Kleis Auke Wolthuizen.

The compiled distribution also incorporates:

- `aom` under the BSD 2-Clause License and the [Alliance for Open Media Patent
  License 1.0](https://aomedia.org/license/patent-license/)
- `glib`, `libexif`, `libheif`, and `libvips` under LGPLv3 through their
  LGPLv2 or LGPLv2.1 "or later" terms
- `brotli`, `cgif`, `emscripten`, `expat`, `highway`, `lcms`, `libffi`,
  `libimagequant`, `libjxl`, `libnsgif`, `libpng`, `libtiff`, `libultrahdr`,
  `libwebp`, `mozjpeg`, `resvg`, and `zlib-ng` under their respective MIT, BSD,
  libpng, libtiff, IJG, and zlib-family terms

See the complete component-by-component
[third-party notices](https://github.com/colorhythm/vips-wasm/blob/master/THIRD-PARTY-NOTICES.md)
for the applicable license links. `LICENSE` and `THIRD-PARTY-NOTICES.md` both
ship in the npm package, and their hashes are recorded in the exported
`integrity.json` manifest.
