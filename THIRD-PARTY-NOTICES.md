# Third-party notices

This software contains third-party libraries
used under the terms of the following licences:

| Library       | Used under the terms of                                                                                   |
|---------------|-----------------------------------------------------------------------------------------------------------|
| aom           | BSD 2-Clause + [Alliance for Open Media Patent License 1.0](https://aomedia.org/license/patent-license/)  |
| brotli        | MIT Licence                                                                                               |
| cgif          | MIT Licence                                                                                               |
| emscripten    | [MIT Licence](https://github.com/emscripten-core/emscripten/blob/main/LICENSE)                            |
| expat         | MIT Licence                                                                                               |
| glib          | LGPLv3                                                                                                    |
| highway       | Apache-2.0 License, BSD 3-Clause                                                                          |
| lcms          | MIT Licence                                                                                               |
| libexif       | LGPLv3                                                                                                    |
| libffi        | MIT Licence                                                                                               |
| libheif       | LGPLv3                                                                                                    |
| libimagequant | [BSD 2-Clause](https://github.com/lovell/libimagequant/blob/main/COPYRIGHT)                               |
| libjxl        | BSD 3-Clause                                                                                              |
| libnsgif      | MIT Licence                                                                                               |
| libpng        | [libpng License](https://github.com/pnggroup/libpng/blob/master/LICENSE)                                  |
| libtiff       | [libtiff License](https://gitlab.com/libtiff/libtiff/blob/master/LICENSE.md) (BSD-like)                   |
| libultrahdr   | Apache-2.0 License                                                                                        |
| libvips       | LGPLv3                                                                                                    |
| libwebp       | New BSD License                                                                                           |
| mozjpeg       | [zlib License, IJG License, BSD-3-Clause](https://github.com/mozilla/mozjpeg/blob/master/LICENSE.md)      |
| resvg         | MIT Licence                                                                                               |
| zlib-ng       | [zlib Licence](https://github.com/zlib-ng/zlib-ng/blob/develop/LICENSE.md)                                |

Use of libraries under the terms of the LGPLv3 is via the
"any later version" clause of the LGPLv2 or LGPLv2.1.

## Optional Libraries

The following libraries are optional and can be disabled during build:

| Library       | Disable flag      | Notes                                         |
|---------------|-------------------|-----------------------------------------------|
| aom + libheif | `--disable-avif`  | Disables AVIF/HEIF image support              |
| libultrahdr   | `--disable-uhdr`  | Disables UltraHDR image support               |
| libexif       | `--disable-exif`  | Disables EXIF metadata support                |
| libjxl        | `--disable-jxl`   | Disables JPEG XL image support                |
| resvg         | `--disable-svg`   | Disables SVG image support                    |

For a GPLv2-compatible build, use: `./build.sh --disable-avif --disable-uhdr --disable-exif`

Please report any errors or omissions via
https://github.com/kleisauke/wasm-vips/issues/new
