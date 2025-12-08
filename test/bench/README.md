# wasm-vips benchmarks

A test to benchmark the performance of this module relative to alternatives.

This benchmark is mostly derived from sharp.  
https://sharp.pixelplumbing.com/performance

## Environment

* AMD Ryzen 9 7900, 1 CPU, 24 logical and 12 physical cores
* Fedora 43
* Node v25.2.1

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
PNG images are compressed with a "default" zlib compression level of 6 and
without adaptive filtering.

### Results

| Module      | Format | Input  | Output | Ops/sec | Speed-up |
|:------------|:-------|:-------|:-------|--------:|---------:|
| jimp[^1]    | JPEG   | buffer | buffer |    3.64 |      1.0 |
| imagemagick | JPEG   | file   | file   |   15.12 |      4.2 |
| gm          | JPEG   | buffer | buffer |   17.81 |      4.9 |
| gm          | JPEG   | file   | file   |   17.86 |      4.9 |
| wasm-vips   | JPEG   | buffer | buffer |   21.30 |      5.9 |
| sharp       | JPEG   | stream | stream |   80.18 |     22.0 |
| sharp       | JPEG   | file   | file   |   81.71 |     22.4 |
| sharp       | JPEG   | buffer | buffer |   84.10 |     23.1 |
|             |        |        |        |         |          |
| imagemagick | PNG    | file   | file   |    9.06 |      1.0 |
| gm          | PNG    | file   | file   |   12.12 |      1.3 |
| jimp[^2]    | PNG    | buffer | buffer |   16.15 |      1.8 |
| wasm-vips   | PNG    | buffer | buffer |   16.31 |      1.8 |
| sharp       | PNG    | file   | file   |   31.39 |      3.5 |
| sharp       | PNG    | buffer | buffer |   31.76 |      3.5 |
|             |        |        |        |         |          |
| wasm-vips   | WebP   | buffer | buffer |   21.26 |      1.0 |
| sharp       | WebP   | file   | file   |   21.30 |      1.0 |
| sharp       | WebP   | buffer | buffer |   21.63 |      1.0 |

[^1]: jimp does not support Lanczos 3, bicubic resampling used instead.
[^2]: jimp does not support premultiply/unpremultiply.

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
