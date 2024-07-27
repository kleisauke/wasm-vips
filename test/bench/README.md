# wasm-vips benchmarks

A test to benchmark the performance of this module relative to alternatives.

This benchmark is mostly derived from sharp.  
https://sharp.pixelplumbing.com/performance

## Environment

* AMD Ryzen 9 7900, 1 CPU, 24 logical and 12 physical cores
* Fedora 40
* Node v22.5.1

## Images

| Image                                                                                   | Dimensions |
|:----------------------------------------------------------------------------------------|:----------:|
| [`2569067123_aca715a2ee_o.jpg`](images/2569067123_aca715a2ee_o.jpg)                     | 2725×2225  |
| [`alpha-premultiply-2048x1536-paper.png`](images/alpha-premultiply-2048x1536-paper.png) | 2048×1536  |
| [`4.webp`](images/4.webp)                                                               |  1024×772  |

## Task

Decompress the image, resize to 720 pixels wide (while preserving aspect ratio)
using Lanczos 3 resampling (where available), then save the image to the output
format that matches the input image.

Alpha channel images will be pre-multiplied before resize and un-premultiplied
afterwards.

During saving a "quality" setting of 80 is used for JPEG and WebP images.
PNG images are compressed with no filtering and run through zlib with a
"default" compression level of 6.

### Results

| Module           | Format | Input  | Output | Ops/sec | Speed-up |
|:-----------------|:-------|:-------|:-------|--------:|---------:|
| jimp<sup>1</sup> | JPEG   | buffer | buffer |    1.72 |      1.0 |
| squoosh-cli      | JPEG   | file   | file   |    2.41 |      1.4 |
| squoosh-lib      | JPEG   | buffer | buffer |    3.31 |      1.9 |
| gm               | JPEG   | buffer | buffer |   15.60 |      9.1 |
| gm               | JPEG   | file   | file   |   16.13 |      9.4 |
| imagemagick      | JPEG   | file   | file   |   16.83 |      9.8 |
| wasm-vips        | JPEG   | buffer | buffer |   20.12 |     11.7 |
| sharp            | JPEG   | stream | stream |   79.27 |     46.1 |
| sharp            | JPEG   | file   | file   |   81.25 |     47.2 |
| sharp            | JPEG   | buffer | buffer |   83.31 |     48.4 |
|                  |        |        |        |         |          |
| squoosh-cli      | PNG    | file   | file   |    0.75 |      1.0 |
| squoosh-lib      | PNG    | buffer | buffer |    0.99 |      1.3 |
| jimp<sup>2</sup> | PNG    | buffer | buffer |    6.43 |      8.6 |
| gm               | PNG    | file   | file   |   11.61 |     15.5 |
| imagemagick      | PNG    | file   | file   |   12.36 |     16.5 |
| wasm-vips        | PNG    | buffer | buffer |   14.52 |     19.4 |
| sharp            | PNG    | file   | file   |   33.68 |     44.9 |
| sharp            | PNG    | buffer | buffer |   34.27 |     45.7 |
|                  |        |        |        |         |          |
| wasm-vips        | WebP   | buffer | buffer |   19.42 |      1.0 |
| sharp            | WebP   | file   | file   |   19.54 |      1.0 |
| sharp            | WebP   | buffer | buffer |   19.66 |      1.0 |

<sup>1</sup>: jimp does not support Lanczos 3, bicubic resampling used instead.  
<sup>2</sup>: jimp does not support premultiply/unpremultiply.

## Running the wasm-vips benchmark

```console
$ npm run bench
```

## Running the sharp benchmark

Requires Docker.

```console
$ git clone https://github.com/lovell/sharp.git
$ cd sharp/test/bench
$ ./run-with-docker.sh
```
