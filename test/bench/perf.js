'use strict';

const assert = require('assert');
const Benchmark = require('benchmark');

const Vips = require('../../lib/node/vips.js');

const images = require('./images');

const width = 720;
const height = 588;

const benchmark = async () => {
  const JPEG_OUT = images.path('output.jpg');
  const PNG_OUT = images.path('output.png');
  const WEBP_OUT = images.path('output.webp');

  const vips = await Vips();

  // Disable libvips cache to ensure tests are as fair as they can be
  vips.Cache.max(0);

  const inputJpgBuffer = vips.FS.readFile(images.inputJpg);
  const defaultJpegSaveOptions = {
    strip: true,
    Q: 80
  }
  const inputPngBuffer = vips.FS.readFile(images.inputPng);
  const defaultPngSaveOptions = {
    strip: true,
    compression: 6,
    filter: vips.ForeignPngFilter.none
  }
  const inputWebPBuffer = vips.FS.readFile(images.inputWebP);
  const defaultWebPSaveOptions = {
    strip: true,
    Q: 80
  }

  const runSuites = suites => {
    if (suites.length === 0) {
      // We are done, shutdown libvips and the runtime of Emscripten
      vips.shutdown();
      return;
    }

    const suite = suites[0];
    const remainingSuites = suites.slice(1);

    suite.on('complete', function () {
      // Recurse to run remaining suites.
      runSuites(remainingSuites);
    }).run();
  };

  // JPEG
  const jpegSuite = new Benchmark.Suite('jpeg').add('wasm-vips-buffer-file', {
    defer: true,
    fn: function (deferred) {
      const im = vips.Image.thumbnailBuffer(inputJpgBuffer, width, {
        height: height
      });
      im.jpegsave(JPEG_OUT, defaultJpegSaveOptions);
      im.delete();
      deferred.resolve();
    }
  }).add('wasm-vips-buffer-buffer', {
    defer: true,
    fn: function (deferred) {
      const im = vips.Image.thumbnailBuffer(inputJpgBuffer, width, {
        height: height
      });
      const buffer = im.jpegsaveBuffer(defaultJpegSaveOptions);
      assert.notStrictEqual(null, buffer);
      im.delete();
      deferred.resolve();
    }
  }).add('wasm-vips-file-file', {
    defer: true,
    fn: function (deferred) {
      const im = vips.Image.thumbnail(images.inputJpg, width, {
        height: height
      });
      im.jpegsave(JPEG_OUT, defaultJpegSaveOptions);
      im.delete();
      deferred.resolve();
    }
  }).add('wasm-vips-stream-stream', {
    defer: true,
    fn: function (deferred) {
      const source = vips.Source.newFromFile(images.inputJpg);
      const target = vips.Target.newToFile(JPEG_OUT);
      const im = vips.Image.thumbnailSource(source, width, {
        height: height
      })
      im.jpegsaveTarget(target, defaultJpegSaveOptions);
      im.delete();
      target.delete();
      source.delete();
      deferred.resolve();
    }
  }).add('wasm-vips-file-buffer', {
    defer: true,
    fn: function (deferred) {
      const im = vips.Image.thumbnail(images.inputJpg, width, {
        height: height
      });
      const buffer = im.jpegsaveBuffer(defaultJpegSaveOptions);
      assert.notStrictEqual(null, buffer);
      im.delete();
      deferred.resolve();
    }
  }).on('cycle', function (event) {
    console.log('jpeg ' + String(event.target));
  });

  // Effect of applying operations
  const operationsSuite = new Benchmark.Suite('operations').add('wasm-vips-sharpen-mild', {
    defer: true,
    fn: function (deferred) {
      const im = vips.Image.thumbnailBuffer(inputJpgBuffer, width, {
        height: height
      });
      // Fast, mild sharpen
      const sharpen = vips.Image.newFromArray([
        -1.0, -1.0, -1.0,
        -1.0, 32.0, -1.0,
        -1.0, -1.0, -1.0
      ], 24);
      const conv = im.conv(sharpen);
      const buffer = conv.jpegsaveBuffer(defaultJpegSaveOptions);
      assert.notStrictEqual(null, buffer);
      conv.delete();
      sharpen.delete();
      im.delete();
      deferred.resolve();
    }
  }).add('wasm-vips-sharpen-radius', {
    defer: true,
    fn: function (deferred) {
      const im = vips.Image.thumbnailBuffer(inputJpgBuffer, width, {
        height: height
      });
      // Slow, accurate sharpen in LAB colour space, with control over flat vs jagged areas
      const sharpen = im.sharpen({sigma: 3, m1: 1, m2: 3});
      const buffer = sharpen.jpegsaveBuffer(defaultJpegSaveOptions);
      assert.notStrictEqual(null, buffer);
      sharpen.delete();
      im.delete();
      deferred.resolve();
    }
  }).add('wasm-vips-blur-mild', {
    defer: true,
    fn: function (deferred) {
      const im = vips.Image.thumbnailBuffer(inputJpgBuffer, width, {
        height: height
      });
      // Fast, mild blur - averages neighbouring pixel
      const blur = vips.Image.newFromArray([
        1.0, 1.0, 1.0,
        1.0, 1.0, 1.0,
        1.0, 1.0, 1.0
      ], 9);
      const conv = im.conv(blur);
      const buffer = conv.jpegsaveBuffer(defaultJpegSaveOptions);
      assert.notStrictEqual(null, buffer);
      conv.delete();
      blur.delete();
      im.delete();
      deferred.resolve();
    }
  }).add('wasm-vips-blur-radius', {
    defer: true,
    fn: function (deferred) {
      const im = vips.Image.thumbnailBuffer(inputJpgBuffer, width, {
        height: height
      });
      // Slower, accurate Gaussian blur
      const blur = im.gaussblur(3);
      const buffer = blur.jpegsaveBuffer(defaultJpegSaveOptions);
      assert.notStrictEqual(null, buffer);
      blur.delete();
      im.delete();
      deferred.resolve();
    }
  }).add('wasm-vips-gamma', {
    defer: true,
    fn: function (deferred) {
      const im = vips.Image.thumbnailBuffer(inputJpgBuffer, width, {
        height: height
      });
      const gamma = im.gamma({exponent: 2.2});
      const buffer = gamma.jpegsaveBuffer(defaultJpegSaveOptions);
      assert.notStrictEqual(null, buffer);
      gamma.delete();
      im.delete();
      deferred.resolve();
    }
  }).add('wasm-vips-greyscale', {
    defer: true,
    fn: function (deferred) {
      const im = vips.Image.thumbnailBuffer(inputJpgBuffer, width, {
        height: height
      });
      const greyscale = im.colourspace(vips.Interpretation.b_w);
      const buffer = greyscale.jpegsaveBuffer(defaultJpegSaveOptions);
      assert.notStrictEqual(null, buffer);
      greyscale.delete();
      im.delete();
      deferred.resolve();
    }
  }).add('wasm-vips-greyscale-gamma', {
    defer: true,
    fn: function (deferred) {
      const im = vips.Image.thumbnailBuffer(inputJpgBuffer, width, {
        height: height
      });
      const gamma = im.gamma({exponent: 2.2});
      const greyscale = gamma.colourspace(vips.Interpretation.b_w);
      const buffer = greyscale.jpegsaveBuffer(defaultJpegSaveOptions);
      assert.notStrictEqual(null, buffer);
      greyscale.delete();
      gamma.delete();
      im.delete();
      deferred.resolve();
    }
  }).add('wasm-vips-progressive', {
    defer: true,
    fn: function (deferred) {
      const im = vips.Image.thumbnailBuffer(inputJpgBuffer, width, {
        height: height
      });
      const buffer = im.jpegsaveBuffer({...defaultJpegSaveOptions, interlace: true});
      assert.notStrictEqual(null, buffer);
      im.delete();
      deferred.resolve();
    }
  }).add('wasm-vips-without-chroma-subsampling', {
    defer: true,
    fn: function (deferred) {
      const im = vips.Image.thumbnailBuffer(inputJpgBuffer, width, {
        height: height
      });
      const buffer = im.jpegsaveBuffer({
        ...defaultJpegSaveOptions,
        subsample_mode: vips.ForeignSubsample.off
      });
      assert.notStrictEqual(null, buffer);
      im.delete();
      deferred.resolve();
    }
  }).add('wasm-vips-rotate', {
    defer: true,
    fn: function (deferred) {
      const im = vips.Image.thumbnailBuffer(inputJpgBuffer, width, {
        height: height
      });
      // Need to copy to memory, we have to stay seq
      const mem = im.copyMemory();
      const rot90 = mem.rot90();
      const buffer = rot90.jpegsaveBuffer(defaultJpegSaveOptions);
      assert.notStrictEqual(null, buffer);
      rot90.delete();
      mem.delete();
      im.delete();
      deferred.resolve();
    }
  }).add('wasm-vips-crop-entropy', {
    defer: true,
    fn: function (deferred) {
      const im = vips.Image.thumbnailBuffer(inputJpgBuffer, width, {
        height: height,
        crop: vips.Interesting.entropy
      });
      const buffer = im.jpegsaveBuffer(defaultJpegSaveOptions);
      assert.notStrictEqual(null, buffer);
      im.delete();
      deferred.resolve();
    }
  }).add('wasm-vips-crop-attention', {
    defer: true,
    fn: function (deferred) {
      const im = vips.Image.thumbnailBuffer(inputJpgBuffer, width, {
        height: height,
        crop: vips.Interesting.attention
      });
      const buffer = im.jpegsaveBuffer(defaultJpegSaveOptions);
      assert.notStrictEqual(null, buffer);
      im.delete();
      deferred.resolve();
    }
  }).on('cycle', function (event) {
    console.log('operations ' + String(event.target));
  })

  // PNG
  const pngSuite = new Benchmark.Suite('png').add('wasm-vips-buffer-file', {
    defer: true,
    fn: function (deferred) {
      const im = vips.Image.thumbnailBuffer(inputPngBuffer, width, {
        height: height
      });
      im.pngsave(PNG_OUT, defaultPngSaveOptions);
      im.delete();
      deferred.resolve();
    }
  }).add('wasm-vips-buffer-buffer', {
    defer: true,
    fn: function (deferred) {
      const im = vips.Image.thumbnailBuffer(inputPngBuffer, width, {
        height: height
      });
      const buffer = im.pngsaveBuffer(defaultPngSaveOptions);
      assert.notStrictEqual(null, buffer);
      im.delete();
      deferred.resolve();
    }
  }).add('wasm-vips-file-file', {
    defer: true,
    fn: function (deferred) {
      const im = vips.Image.thumbnail(images.inputPng, width, {
        height: height
      });
      im.pngsave(PNG_OUT, defaultPngSaveOptions);
      im.delete();
      deferred.resolve();
    }
  }).add('wasm-vips-file-buffer', {
    defer: true,
    fn: function (deferred) {
      const im = vips.Image.thumbnail(images.inputPng, width, {
        height: height
      });
      const buffer = im.pngsaveBuffer(defaultPngSaveOptions);
      assert.notStrictEqual(null, buffer);
      im.delete();
      deferred.resolve();
    }
  }).add('wasm-vips-progressive', {
    defer: true,
    fn: function (deferred) {
      const im = vips.Image.thumbnailBuffer(inputPngBuffer, width, {
        height: height
      });
      const buffer = im.pngsaveBuffer({...defaultPngSaveOptions, interlace: true});
      assert.notStrictEqual(null, buffer);
      im.delete();
      deferred.resolve();
    }
  }).add('wasm-vips-adaptive-filtering', {
    defer: true,
    fn: function (deferred) {
      const im = vips.Image.thumbnailBuffer(inputPngBuffer, width, {
        height: height
      });
      const buffer = im.pngsaveBuffer({...defaultPngSaveOptions, filter: vips.ForeignPngFilter.all});
      assert.notStrictEqual(null, buffer);
      im.delete();
      deferred.resolve();
    }
  }).add('wasm-vips-zlib-compression-9', {
    defer: true,
    fn: function (deferred) {
      const im = vips.Image.thumbnailBuffer(inputPngBuffer, width, {
        height: height
      });
      const buffer = im.pngsaveBuffer({...defaultPngSaveOptions, compression: 9});
      assert.notStrictEqual(null, buffer);
      im.delete();
      deferred.resolve();
    }
  }).on('cycle', function (event) {
    console.log('png ' + String(event.target));
  })

  // WebP
  const webpSuite = new Benchmark.Suite('webp').add('wasm-vips-file', {
    defer: true,
    fn: function (deferred) {
      const im = vips.Image.thumbnailBuffer(inputWebPBuffer, width, {
        height: height
      });
      im.webpsave(WEBP_OUT, defaultWebPSaveOptions);
      im.delete();
      deferred.resolve();
    }
  }).add('wasm-vips-buffer-buffer', {
    defer: true,
    fn: function (deferred) {
      const im = vips.Image.thumbnailBuffer(inputWebPBuffer, width, {
        height: height
      });
      const buffer = im.webpsaveBuffer(defaultWebPSaveOptions);
      assert.notStrictEqual(null, buffer);
      im.delete();
      deferred.resolve();
    }
  }).add('wasm-vips-file-file', {
    defer: true,
    fn: function (deferred) {
      const im = vips.Image.thumbnail(images.inputWebP, width, {
        height: height
      });
      im.webpsave(WEBP_OUT, defaultWebPSaveOptions);
      im.delete();
      deferred.resolve();
    }
  }).add('wasm-vips-file-buffer', {
    defer: true,
    fn: function (deferred) {
      const im = vips.Image.thumbnail(images.inputWebP, width, {
        height: height
      });
      const buffer = im.webpsaveBuffer(defaultWebPSaveOptions);
      assert.notStrictEqual(null, buffer);
      im.delete();
      deferred.resolve();
    }
  }).on('cycle', function (event) {
    console.log('webp ' + String(event.target));
  });

  runSuites([jpegSuite, operationsSuite, pngSuite, webpSuite]);
};

benchmark();
