# Changelog
All notable changes to wasm-vips will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [v0.0.17] - TBD

Uses libvips v8.18.0, compiled with Emscripten v4.0.21.

### Added

- Support all typed array variants in `Image.newFromMemory()` and
  `image.writeToMemory()`.
- Support for UltraHDR images.
- Add `image.gainmap` property to retrieve the gainmap from
  Ultra HDR images.
- Add `image.setImage()` method to attach an image as metadata.
- Add `vips.Utils.typeFromName()` helper.
- Add Deno export condition in `package.json`.
  [#109](https://github.com/kleisauke/wasm-vips/issues/109)

### Changed

- Switch from spng to libpng.
  [#105](https://github.com/kleisauke/wasm-vips/pull/105)
- Make `filename` properties optional.
- Update methods/enums for libvips 8.18.

## [v0.0.16] - 2025-11-07

Uses libvips v8.17.3, compiled with Emscripten v4.0.19.

### Changed

- Reduce main module binary size by ~2%.
  [emscripten-core/emscripten#25522](https://github.com/emscripten-core/emscripten/pull/25522)

## [v0.0.15] - 2025-09-17

Uses libvips v8.17.2, compiled with Emscripten v4.0.15.

### Fixed

- Fix a reference leak in `image.fillNearest()`.

### Removed

- Remove redundant `revalidate` flag from type definitions.
- Remove unsupported operations from public API.

## [v0.0.14] - 2025-07-10

Uses libvips v8.17.1, compiled with Emscripten v4.0.10.

### Fixed

- Ensure compatibility with TypeScript versions below ESNext.
- Allow omitting the `strOptions` argument in `Image.newFromBuffer()`
  and `Image.newFromSource()` constructors.
  [#96](https://github.com/kleisauke/wasm-vips/issues/96)

### Changed

- Update methods/enums for libvips 8.17.
- Update mimalloc to v3.1.5.
  [#97](https://github.com/kleisauke/wasm-vips/issues/97)

## [v0.0.13] - 2025-04-16

Uses libvips v8.16.1, compiled with Emscripten v4.0.7.

### Added

- Add type definition for the [explicit resource management proposal](
https://github.com/tc39/proposal-explicit-resource-management).

### Fixed

- Fix possible thread oversubscription with some pipelines.
  [#92](https://github.com/kleisauke/wasm-vips/issues/92)
- Silence bundler warnings related to `new URL('./', import.meta.url)`.
  [#94](https://github.com/kleisauke/wasm-vips/issues/94)

## [v0.0.12] - 2025-03-16

Uses libvips v8.16.1, compiled with Emscripten v4.0.5.

### Fixed

- Prevent use of the `/tmp` directory for Node.js on Windows.
  [#84](https://github.com/kleisauke/wasm-vips/issues/84)

## [v0.0.11] - 2024-10-31

Uses libvips v8.16.0, compiled with Emscripten v3.1.70.

### Changed

- Avoid pointer arguments in `SourceCustom.onRead` and
  `TargetCustom.onWrite` callbacks.
  [#74](https://github.com/kleisauke/wasm-vips/issues/74)
- Update methods/enums for libvips 8.16.

### Fixed

- Fix Deno compatibility (regression in 0.0.9).
  [#81](https://github.com/kleisauke/wasm-vips/issues/81)

### Removed

- Remove redundant `vips.bigintToI53Checked()` helper.

## [v0.0.10] - 2024-08-14

Uses libvips v8.15.3, compiled with Emscripten v3.1.64.

### Added

- Add `preventAutoDelete()` method to ensure an object is not
  automatically deleted when `setAutoDeleteLater(true)` is used.
  [#70](https://github.com/kleisauke/wasm-vips/pull/70)
  [@marcosc90](https://github.com/marcosc90)
- Add `*.wasm` files to the `exports` section of `package.json`.

### Changed

- Reduce concurrency by default to 1 on the web.
  [#69](https://github.com/kleisauke/wasm-vips/issues/69)
  [#71](https://github.com/kleisauke/wasm-vips/issues/71)

## [v0.0.9] - 2024-06-01

Uses libvips v8.15.2, compiled with Emscripten v3.1.60.

### Added

- Add `image.pageHeight` property for retrieving the page height in
  multi-page images.

### Changed

- Inline worker script (`.worker.js`) into the main output file.
  [emscripten-core/emscripten#21701](https://github.com/emscripten-core/emscripten/pull/21701)

## [v0.0.8] - 2024-03-17

Uses libvips v8.15.2, compiled with Emscripten v3.1.56.

### Added

- Add `image.onProgress` callback for progress feedback.
  [#63](https://github.com/kleisauke/wasm-vips/issues/63)
- Add `image.kill` property accessor to block evaluation.

### Changed

- Switch memory allocator from dlmalloc to mimalloc.

## [v0.0.7] - 2023-11-12

Uses libvips v8.15.0, compiled with Emscripten v3.1.48.

### Fixed

- Avoid linking to libc++ in side modules (regression in 0.0.6).

## [v0.0.6] - 2023-11-11

Uses libvips v8.15.0, compiled with Emscripten v3.1.48.

### Added

- Enable optimized SIMD paths in libvips (using Highway).

### Changed

- Update methods/enums for libvips 8.15.

## [v0.0.5] - 2023-04-27

Uses libvips v8.14.2, compiled with Emscripten v3.1.37.

### Added

- Support for AVIF images.
  [#36](https://github.com/kleisauke/wasm-vips/pull/36)
  [@RReverser](https://github.com/RReverser)
- Support for dynamic modules on Deno.
- Support for loading SVG images.
  [#40](https://github.com/kleisauke/wasm-vips/pull/40)
  [@RReverser](https://github.com/RReverser)

### Fixed

- Make `vips.shutdown()` optional on Node.js.
  [#29](https://github.com/kleisauke/wasm-vips/pull/29)
  [@RReverser](https://github.com/RReverser)
- Make CORS workaround opt-in.
  [#35](https://github.com/kleisauke/wasm-vips/issues/35)
- Allow overriding the `print` and `printErr` callbacks on Node.js.
  [#23](https://github.com/kleisauke/wasm-vips/issues/23)

### Changed

- Use a stack size of 256kb for both main and newly created threads.
  Previously, this was configured at 5mb and 2mb, respectively.
- Update methods/enums for libvips 8.14.

## [v0.0.4] - 2022-11-03

Uses libvips v8.13.3, compiled with Emscripten v3.1.24.

### Added

- Support for JPEG XL images.
  [#21](https://github.com/kleisauke/wasm-vips/pull/21)
  [@atjn](https://github.com/atjn)
- Add `vips.blockUntrusted()` and `vips.operationBlock()` for blocking
  operations at runtime.
  [#24](https://github.com/kleisauke/wasm-vips/pull/24)
  [@atjn](https://github.com/atjn)

### Changed

- Switch from libjpeg-turbo to mozjpeg.
  [#20](https://github.com/kleisauke/wasm-vips/pull/20)
  [@atjn](https://github.com/atjn)

## [v0.0.3] - 2022-07-25

Uses libvips v8.13.0, compiled with Emscripten v3.1.17.

### Added

- Add type definition for `mainScriptUrlOrBlob` setting.
  [#16](https://github.com/kleisauke/wasm-vips/pull/16)
  [@bentron2000](https://github.com/bentron2000)
- Add type definitions for Embind methods.
- Add type definition for `instantiateWasm` callback.

### Fixed

- Include web-specific package exports in `package.json`.
- Ensure type definitions are exported.
  [#14](https://github.com/kleisauke/wasm-vips/issues/14)

### Changed

- Update methods/enums for libvips 8.13.

## [v0.0.2] - 2022-04-04

Uses libvips v8.12.2, compiled with Emscripten v3.1.8.

### Added

- Add `vips.shutdown()` helper for Node.js.
- Add `vips.emscriptenVersion()` for identifying the Emscripten version.
- Support for loading GIF images with vendored `libnsgif`.
- Support for saving GIF images with `cgif` and `libimagequant`.
- Add support for Deno.

### Fixed

- Don't intercept errors in Node.js.
- Distribute the web variant within the NPM package.
  [#4](https://github.com/kleisauke/wasm-vips/issues/4)
- Ensure that deprecated args are not listed in `vips.d.ts`.
- Workaround CORS issue for externally hosted JS.
  [#12](https://github.com/kleisauke/wasm-vips/issues/12)
- Fix memory leak during buffer/memory write.
  [#13](https://github.com/kleisauke/wasm-vips/issues/13)

### Changed

- Split utilities to separate classes/functions.
- Enable shipped WebAssembly features by default (i.e. the
  [fixed-width SIMD](https://github.com/WebAssembly/simd) and
  [JS-BigInt-integration](https://github.com/WebAssembly/JS-BigInt-integration)
  proposals).
- Build a dual CommonJS/ES6 module package for Node.js.
- Enable Closure Compiler to minify Emscripten-generated code.
- Update methods/enums for libvips 8.12.
- `image.writeToBuffer()` tries to use the new target API first.

## [v0.0.1] - 2020-09-01

Uses libvips v8.10.0, compiled with Emscripten v2.0.0.

### Added

- Initial release.

[v0.0.17]: https://github.com/kleisauke/wasm-vips/compare/v0.0.16...v0.0.17
[v0.0.16]: https://github.com/kleisauke/wasm-vips/compare/v0.0.15...v0.0.16
[v0.0.15]: https://github.com/kleisauke/wasm-vips/compare/v0.0.14...v0.0.15
[v0.0.14]: https://github.com/kleisauke/wasm-vips/compare/v0.0.13...v0.0.14
[v0.0.13]: https://github.com/kleisauke/wasm-vips/compare/v0.0.12...v0.0.13
[v0.0.12]: https://github.com/kleisauke/wasm-vips/compare/v0.0.11...v0.0.12
[v0.0.11]: https://github.com/kleisauke/wasm-vips/compare/v0.0.10...v0.0.11
[v0.0.10]: https://github.com/kleisauke/wasm-vips/compare/v0.0.9...v0.0.10
[v0.0.9]: https://github.com/kleisauke/wasm-vips/compare/v0.0.8...v0.0.9
[v0.0.8]: https://github.com/kleisauke/wasm-vips/compare/v0.0.7...v0.0.8
[v0.0.7]: https://github.com/kleisauke/wasm-vips/compare/v0.0.6...v0.0.7
[v0.0.6]: https://github.com/kleisauke/wasm-vips/compare/v0.0.5...v0.0.6
[v0.0.5]: https://github.com/kleisauke/wasm-vips/compare/v0.0.4...v0.0.5
[v0.0.4]: https://github.com/kleisauke/wasm-vips/compare/v0.0.3...v0.0.4
[v0.0.3]: https://github.com/kleisauke/wasm-vips/compare/v0.0.2...v0.0.3
[v0.0.2]: https://github.com/kleisauke/wasm-vips/compare/v0.0.1...v0.0.2
[v0.0.1]: https://github.com/kleisauke/wasm-vips/releases/tag/v0.0.1
