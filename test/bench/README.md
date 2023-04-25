# wasm-vips benchmarks

A test to benchmark the performance of this module relative to alternatives.

This benchmark is mostly derived from sharp.  
https://sharp.pixelplumbing.com/performance

## Environment

* Intel Core i5-8600K CPU 3.60GHz (Coffee Lake), 1 CPU, 6 logical and 6 physical cores
* Fedora 38
* Node v18.16.0

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
| jimp<sup>1</sup> | JPEG   | buffer | buffer |    0.99 |      1.0 |
| squoosh-cli      | JPEG   | file   | file   |    1.36 |      1.4 |
| squoosh-lib      | JPEG   | buffer | buffer |    2.23 |      2.3 |
| wasm-vips        | JPEG   | buffer | buffer |    6.54 |      6.6 |
| imagemagick      | JPEG   | file   | file   |    9.78 |      9.9 |
| gm               | JPEG   | buffer | buffer |    9.78 |      9.9 |
| gm               | JPEG   | file   | file   |    9.81 |      9.9 |
| sharp            | JPEG   | stream | stream |   43.00 |     43.4 |
| sharp            | JPEG   | file   | file   |   45.02 |     45.5 |
| sharp            | JPEG   | buffer | buffer |   46.64 |     47.1 |
|                  |        |        |        |         |          |
| squoosh-cli      | PNG    | file   | file   |    0.47 |      1.0 |
| squoosh-lib      | PNG    | buffer | buffer |    0.55 |      1.2 |
| jimp<sup>2</sup> | PNG    | buffer | buffer |    5.71 |     12.1 |
| wasm-vips        | PNG    | buffer | buffer |    6.98 |     14.9 |
| gm               | PNG    | file   | file   |    7.85 |     16.7 |
| imagemagick      | PNG    | file   | file   |    8.55 |     18.2 |
| sharp            | PNG    | file   | file   |   21.43 |     45.6 |
| sharp            | PNG    | buffer | buffer |   21.72 |     46.2 |
|                  |        |        |        |         |          |
| wasm-vips        | WebP   | buffer | buffer |   11.84 |      1.0 |
| sharp            | WebP   | file   | file   |   14.31 |      1.2 |
| sharp            | WebP   | buffer | buffer |   14.39 |      1.2 |

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
