# wasm-vips benchmarks

A test to benchmark the performance of this module relative to alternatives.

This benchmark is mostly derived from sharp.  
https://sharp.pixelplumbing.com/performance

## Test environment

* Intel Core i5-8600K CPU 3.60GHz (Coffee Lake), 1 CPU, 6 logical and 6 physical cores
* Fedora 33
* Node v15.7.0

## Test images

| Image                                                                                   | Dimensions |
| :-------------------------------------------------------------------------------------- | :--------: |
| [`2569067123_aca715a2ee_o.jpg`](images/2569067123_aca715a2ee_o.jpg)                     | 2725×2225  |
| [`alpha-premultiply-2048x1536-paper.png`](images/alpha-premultiply-2048x1536-paper.png) | 2048×1536  |
| [`4.webp`](images/4.webp)                                                               |  1024×772  |

## The task

Decompress the image, resize to 720x588 using Lanczos 3 resampling
(where available), then save the image to the output format that
matches the input image.

During saving a "quality" setting of 80 is used for JPEG and WebP
images. For PNG images a zlib compression level of 6 is used.

## Results

| Module             | Format | Input  | Output | Ops/sec | Speed-up |
| :----------------- | :----- | :----- | :----- | ------: | -------: |
| jimp               | JPEG   | buffer | buffer |    0.91 |      1.0 |
| mapnik             | JPEG   | buffer | buffer |    4.08 |      4.5 |
| wasm-vips          | JPEG   | buffer | buffer |    6.23 |      6.8 |
| imagemagick        | JPEG   | file   | file   |   12.68 |     13.9 |
| gm                 | JPEG   | file   | file   |   13.00 |     14.3 |
| sharp (w/o liborc) | JPEG   | stream | stream |   38.84 |     42.7 |
| sharp (w/o liborc) | JPEG   | file   | file   |   40.48 |     44.5 |
| sharp (w/o liborc) | JPEG   | buffer | buffer |   41.14 |     45.2 |
| sharp              | JPEG   | stream | stream |   41.63 |     45.7 |
| sharp              | JPEG   | file   | file   |   43.36 |     47.6 |
| sharp              | JPEG   | buffer | buffer |   44.33 |     48.7 |
|                    |        |        |        |         |          |
| jimp               | PNG    | buffer | buffer |    3.87 |      1.0 |
| wasm-vips          | PNG    | buffer | buffer |    5.42 |      1.4 |
| mapnik             | PNG    | buffer | buffer |    6.56 |      1.7 |
| gm                 | PNG    | file   | file   |    8.46 |      2.2 |
| imagemagick        | PNG    | file   | file   |    8.55 |      2.2 |
| sharp (w/o liborc) | PNG    | buffer | buffer |   17.42 |      4.5 |
| sharp (w/o liborc) | PNG    | file   | file   |   17.59 |      4.5 |
| sharp              | PNG    | file   | file   |   17.74 |      4.6 |
| sharp              | PNG    | buffer | buffer |   17.81 |      4.6 |
|                    |        |        |        |         |          |
| wasm-vips          | WebP   | buffer | buffer |    7.84 |      1.0 |
| sharp (w/o liborc) | WebP   | file   | file   |   14.46 |      1.8 |
| sharp              | WebP   | file   | file   |   14.54 |      1.9 |
| sharp (w/o liborc) | WebP   | buffer | buffer |   14.57 |      1.9 |
| sharp              | WebP   | buffer | buffer |   14.58 |      1.9 |

## Running the wasm-vips benchmark

```bash
npm run test
```

## Running the sharp benchmark

Ensure that the prerequisites have been installed.  
https://sharp.pixelplumbing.com/performance#running-the-benchmark-test

```bash
git clone https://github.com/lovell/sharp.git
cd sharp
npm install
cd test/bench
npm install

# With liborc
npm test

# Without liborc
sed -i '/^sharp.cache(false);/a sharp.simd(false);' perf.js
npm test
```
