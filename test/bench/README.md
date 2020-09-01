# wasm-vips benchmarks

A test to benchmark the performance of this module relative to alternatives.

This benchmark is mostly derived from sharp.  
https://sharp.pixelplumbing.com/performance

## Test environment

* Intel Core i5-8600K CPU 3.60GHz (Coffee Lake), 1 CPU, 6 logical and 6 physical cores
* Fedora 32
* Node v14.8.0

## Test images

| Image                                                                                   | Dimensions |
| :-------------------------------------------------------------------------------------- | :--------: |
| [`2569067123_aca715a2ee_o.jpg`](images/2569067123_aca715a2ee_o.jpg)                     | 2725×2225  |
| [`alpha-premultiply-2048x1536-paper.png`](images/alpha-premultiply-2048x1536-paper.png) | 2048×1536  |
| [`4.webp`](images/4.webp)                                                               |  1024×772  |

# The task

Decompress the image, resize to 720x588 using Lanczos 3 resampling
(where available), then save the image to the output format that
matches the input image.

During saving a "quality" setting of 80 is used for JPEG and WebP
images. For PNG images a zlib compression level of 6 is used.

## Results

| Module             | Format | Input  | Output | Ops/sec | Speed-up |
| :----------------- | :----- | :----- | :----- | ------: | -------: |
| jimp               | JPEG   | buffer | buffer |    0.91 |      1.0 |
| mapnik             | JPEG   | buffer | buffer |    3.86 |      4.2 |
| wasm-vips          | JPEG   | buffer | buffer |    5.36 |      5.9 |
| imagemagick        | JPEG   | file   | file   |   13.42 |     14.7 |
| gm                 | JPEG   | file   | file   |   13.71 |     15.1 |
| sharp              | JPEG   | stream | stream |   41.65 |     45.8 |
| sharp              | JPEG   | file   | file   |   43.66 |     48.0 |
| sharp              | JPEG   | buffer | buffer |   44.35 |     48.7 |
|                    |        |        |        |         |          |
| jimp               | PNG    | buffer | buffer |    5.20 |      1.0 |
| wasm-vips          | PNG    | buffer | buffer |    5.63 |      1.1 |
| mapnik             | PNG    | buffer | buffer |    6.44 |      1.2 |
| gm                 | PNG    | file   | file   |    8.86 |      1.7 |
| imagemagick        | PNG    | file   | file   |    8.94 |      1.7 |
| sharp              | PNG    | file   | file   |   20.22 |      3.9 |
| sharp              | PNG    | buffer | buffer |   20.30 |      3.9 |
|                    |        |        |        |         |          |
| wasm-vips          | WebP   | buffer | buffer |    6.20 |      1.0 |
| sharp              | WebP   | file   | file   |   13.76 |      2.2 |
| sharp              | WebP   | buffer | buffer |   13.81 |      2.2 |

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
npm test
```
