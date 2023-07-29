# wasm-vips benchmarks

A test to benchmark the performance of this module relative to alternatives.

This benchmark is mostly derived from sharp.  
https://sharp.pixelplumbing.com/performance

## Environment

* AMD Ryzen 9 7900, 1 CPU, 24 logical and 12 physical cores
* Fedora 39
* Node v21.1.0

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
| jimp<sup>1</sup> | JPEG   | buffer | buffer |    1.92 |      1.0 |
| squoosh-cli      | JPEG   | file   | file   |    2.31 |      1.2 |
| squoosh-lib      | JPEG   | buffer | buffer |    3.26 |      1.7 |
| wasm-vips        | JPEG   | buffer | buffer |   16.98 |      8.8 |
| gm               | JPEG   | file   | file   |   18.05 |      9.4 |
| gm               | JPEG   | buffer | buffer |   18.06 |      9.4 |
| imagemagick      | JPEG   | file   | file   |   19.02 |      9.9 |
| sharp            | JPEG   | stream | stream |   64.48 |     33.6 |
| sharp            | JPEG   | file   | file   |   65.71 |     34.2 |
| sharp            | JPEG   | buffer | buffer |   66.06 |     34.4 |
|                  |        |        |        |         |          |
| squoosh-cli      | PNG    | file   | file   |    0.76 |      1.0 |
| squoosh-lib      | PNG    | buffer | buffer |    0.99 |      1.3 |
| jimp<sup>2</sup> | PNG    | buffer | buffer |    6.24 |      8.2 |
| gm               | PNG    | file   | file   |   12.62 |     16.6 |
| imagemagick      | PNG    | file   | file   |   13.03 |     17.1 |
| wasm-vips        | PNG    | buffer | buffer |   13.80 |     18.2 |
| sharp            | PNG    | buffer | buffer |   19.57 |     25.8 |
| sharp            | PNG    | file   | file   |   19.66 |     25.9 |
|                  |        |        |        |         |          |
| wasm-vips        | WebP   | buffer | buffer |   18.65 |      1.0 |
| sharp            | WebP   | file   | file   |   22.31 |      1.2 |
| sharp            | WebP   | buffer | buffer |   22.44 |      1.2 |

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
