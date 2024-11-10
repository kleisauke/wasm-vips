'use strict';

import Benchmark from 'benchmark';

import Vips from '../../lib/vips-node.mjs';
import { inputJpg, inputPng, inputWebP, getPath } from './images.js';

const width = 720;

// `vips_thumbnail` resize behavior is based on a square bounding box.
// To resize along a specific axis, pass a huge value to the opposite axis.
// See: https://github.com/libvips/libvips/pull/1639
const height = 10000000; // = VIPS_MAX_COORD

const jpegOut = getPath('output.jpg');
const pngOut = getPath('output.png');
const webpOut = getPath('output.webp');

const vips = await Vips({
  // Disable dynamic modules
  dynamicLibraries: []
});

// Disable libvips cache to ensure tests are as fair as they can be
vips.Cache.max(0);

const inputJpgBuffer = vips.FS.readFile(inputJpg);
const defaultJpegSaveOptions = {
  keep: vips.ForeignKeep.none,
  Q: 80
};
const inputPngBuffer = vips.FS.readFile(inputPng);
const defaultPngSaveOptions = {
  keep: vips.ForeignKeep.none,
  compression: 6,
  filter: vips.ForeignPngFilter.none
};
const inputWebPBuffer = vips.FS.readFile(inputWebP);
const defaultWebPSaveOptions = {
  keep: vips.ForeignKeep.none,
  Q: 80
};

const runSuites = suites => {
  if (suites.length === 0) {
    // We are done, shutdown libvips
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
      height
    });
    im.jpegsave(jpegOut, defaultJpegSaveOptions);
    im.delete();
    deferred.resolve();
  }
}).add('wasm-vips-buffer-buffer', {
  defer: true,
  fn: function (deferred) {
    const im = vips.Image.thumbnailBuffer(inputJpgBuffer, width, {
      height
    });
    im.jpegsaveBuffer(defaultJpegSaveOptions);
    im.delete();
    deferred.resolve();
  }
}).add('wasm-vips-file-file', {
  defer: true,
  fn: function (deferred) {
    const im = vips.Image.thumbnail(inputJpg, width, {
      height
    });
    im.jpegsave(jpegOut, defaultJpegSaveOptions);
    im.delete();
    deferred.resolve();
  }
}).add('wasm-vips-stream-stream', {
  defer: true,
  fn: function (deferred) {
    const source = vips.Source.newFromFile(inputJpg);
    const target = vips.Target.newToFile(jpegOut);
    const im = vips.Image.thumbnailSource(source, width, {
      height
    });
    im.jpegsaveTarget(target, defaultJpegSaveOptions);
    im.delete();
    target.delete();
    source.delete();
    deferred.resolve();
  }
}).add('wasm-vips-file-buffer', {
  defer: true,
  fn: function (deferred) {
    const im = vips.Image.thumbnail(inputJpg, width, {
      height
    });
    im.jpegsaveBuffer(defaultJpegSaveOptions);
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
      height
    });
    // Fast, mild sharpen
    const sharpen = vips.Image.newFromArray([
      -1.0, -1.0, -1.0,
      -1.0, 32.0, -1.0,
      -1.0, -1.0, -1.0
    ], 24);
    const conv = im.conv(sharpen);
    conv.jpegsaveBuffer(defaultJpegSaveOptions);
    conv.delete();
    sharpen.delete();
    im.delete();
    deferred.resolve();
  }
}).add('wasm-vips-sharpen-radius', {
  defer: true,
  fn: function (deferred) {
    const im = vips.Image.thumbnailBuffer(inputJpgBuffer, width, {
      height
    });
    // Slow, accurate sharpen in LAB colour space, with control over flat vs jagged areas
    const sharpen = im.sharpen({ sigma: 3, m1: 1, m2: 3 });
    sharpen.jpegsaveBuffer(defaultJpegSaveOptions);
    sharpen.delete();
    im.delete();
    deferred.resolve();
  }
}).add('wasm-vips-blur-mild', {
  defer: true,
  fn: function (deferred) {
    const im = vips.Image.thumbnailBuffer(inputJpgBuffer, width, {
      height
    });
    // Fast, mild blur - averages neighbouring pixel
    const blur = vips.Image.newFromArray([
      1.0, 1.0, 1.0,
      1.0, 1.0, 1.0,
      1.0, 1.0, 1.0
    ], 9);
    const conv = im.conv(blur);
    conv.jpegsaveBuffer(defaultJpegSaveOptions);
    conv.delete();
    blur.delete();
    im.delete();
    deferred.resolve();
  }
}).add('wasm-vips-blur-radius', {
  defer: true,
  fn: function (deferred) {
    const im = vips.Image.thumbnailBuffer(inputJpgBuffer, width, {
      height
    });
    // Slower, accurate Gaussian blur
    const blur = im.gaussblur(3);
    blur.jpegsaveBuffer(defaultJpegSaveOptions);
    blur.delete();
    im.delete();
    deferred.resolve();
  }
}).add('wasm-vips-gamma', {
  defer: true,
  fn: function (deferred) {
    const im = vips.Image.thumbnailBuffer(inputJpgBuffer, width, {
      height
    });
    const gamma = im.gamma({ exponent: 2.2 });
    gamma.jpegsaveBuffer(defaultJpegSaveOptions);
    gamma.delete();
    im.delete();
    deferred.resolve();
  }
}).add('wasm-vips-greyscale', {
  defer: true,
  fn: function (deferred) {
    const im = vips.Image.thumbnailBuffer(inputJpgBuffer, width, {
      height
    });
    const greyscale = im.colourspace(vips.Interpretation.b_w);
    greyscale.jpegsaveBuffer(defaultJpegSaveOptions);
    greyscale.delete();
    im.delete();
    deferred.resolve();
  }
}).add('wasm-vips-greyscale-gamma', {
  defer: true,
  fn: function (deferred) {
    const im = vips.Image.thumbnailBuffer(inputJpgBuffer, width, {
      height
    });
    const gamma = im.gamma({ exponent: 2.2 });
    const greyscale = gamma.colourspace(vips.Interpretation.b_w);
    greyscale.jpegsaveBuffer(defaultJpegSaveOptions);
    greyscale.delete();
    gamma.delete();
    im.delete();
    deferred.resolve();
  }
}).add('wasm-vips-progressive', {
  defer: true,
  fn: function (deferred) {
    const im = vips.Image.thumbnailBuffer(inputJpgBuffer, width, {
      height
    });
    im.jpegsaveBuffer({ ...defaultJpegSaveOptions, interlace: true });
    im.delete();
    deferred.resolve();
  }
}).add('wasm-vips-without-chroma-subsampling', {
  defer: true,
  fn: function (deferred) {
    const im = vips.Image.thumbnailBuffer(inputJpgBuffer, width, {
      height
    });
    im.jpegsaveBuffer({
      ...defaultJpegSaveOptions,
      subsample_mode: vips.ForeignSubsample.off
    });
    im.delete();
    deferred.resolve();
  }
}).add('wasm-vips-rotate', {
  defer: true,
  fn: function (deferred) {
    const im = vips.Image.thumbnailBuffer(inputJpgBuffer, width, {
      height
    });
    // Need to copy to memory, we have to stay seq
    const mem = im.copyMemory();
    const rot90 = mem.rot90();
    rot90.jpegsaveBuffer(defaultJpegSaveOptions);
    rot90.delete();
    mem.delete();
    im.delete();
    deferred.resolve();
  }
}).add('wasm-vips-crop-entropy', {
  defer: true,
  fn: function (deferred) {
    const im = vips.Image.thumbnailBuffer(inputJpgBuffer, width, {
      height: 588,
      crop: vips.Interesting.entropy
    });
    im.jpegsaveBuffer(defaultJpegSaveOptions);
    im.delete();
    deferred.resolve();
  }
}).add('wasm-vips-crop-attention', {
  defer: true,
  fn: function (deferred) {
    const im = vips.Image.thumbnailBuffer(inputJpgBuffer, width, {
      height: 588,
      crop: vips.Interesting.attention
    });
    im.jpegsaveBuffer(defaultJpegSaveOptions);
    im.delete();
    deferred.resolve();
  }
}).on('cycle', function (event) {
  console.log('operations ' + String(event.target));
});

// PNG
const pngSuite = new Benchmark.Suite('png').add('wasm-vips-buffer-file', {
  defer: true,
  fn: function (deferred) {
    const im = vips.Image.thumbnailBuffer(inputPngBuffer, width, {
      height
    });
    im.pngsave(pngOut, defaultPngSaveOptions);
    im.delete();
    deferred.resolve();
  }
}).add('wasm-vips-buffer-buffer', {
  defer: true,
  fn: function (deferred) {
    const im = vips.Image.thumbnailBuffer(inputPngBuffer, width, {
      height
    });
    im.pngsaveBuffer(defaultPngSaveOptions);
    im.delete();
    deferred.resolve();
  }
}).add('wasm-vips-file-file', {
  defer: true,
  fn: function (deferred) {
    const im = vips.Image.thumbnail(inputPng, width, {
      height
    });
    im.pngsave(pngOut, defaultPngSaveOptions);
    im.delete();
    deferred.resolve();
  }
}).add('wasm-vips-file-buffer', {
  defer: true,
  fn: function (deferred) {
    const im = vips.Image.thumbnail(inputPng, width, {
      height
    });
    im.pngsaveBuffer(defaultPngSaveOptions);
    im.delete();
    deferred.resolve();
  }
}).add('wasm-vips-progressive', {
  defer: true,
  fn: function (deferred) {
    const im = vips.Image.thumbnailBuffer(inputPngBuffer, width, {
      height
    });
    im.pngsaveBuffer({ ...defaultPngSaveOptions, interlace: true });
    im.delete();
    deferred.resolve();
  }
}).add('wasm-vips-adaptive-filtering', {
  defer: true,
  fn: function (deferred) {
    const im = vips.Image.thumbnailBuffer(inputPngBuffer, width, {
      height
    });
    im.pngsaveBuffer({ ...defaultPngSaveOptions, filter: vips.ForeignPngFilter.all });
    im.delete();
    deferred.resolve();
  }
}).add('wasm-vips-zlib-compression-9', {
  defer: true,
  fn: function (deferred) {
    const im = vips.Image.thumbnailBuffer(inputPngBuffer, width, {
      height
    });
    im.pngsaveBuffer({ ...defaultPngSaveOptions, compression: 9 });
    im.delete();
    deferred.resolve();
  }
}).on('cycle', function (event) {
  console.log('png ' + String(event.target));
});

// WebP
const webpSuite = new Benchmark.Suite('webp').add('wasm-vips-buffer-file', {
  defer: true,
  fn: function (deferred) {
    const im = vips.Image.thumbnailBuffer(inputWebPBuffer, width, {
      height
    });
    im.webpsave(webpOut, defaultWebPSaveOptions);
    im.delete();
    deferred.resolve();
  }
}).add('wasm-vips-buffer-buffer', {
  defer: true,
  fn: function (deferred) {
    const im = vips.Image.thumbnailBuffer(inputWebPBuffer, width, {
      height
    });
    im.webpsaveBuffer(defaultWebPSaveOptions);
    im.delete();
    deferred.resolve();
  }
}).add('wasm-vips-file-file', {
  defer: true,
  fn: function (deferred) {
    const im = vips.Image.thumbnail(inputWebP, width, {
      height
    });
    im.webpsave(webpOut, defaultWebPSaveOptions);
    im.delete();
    deferred.resolve();
  }
}).add('wasm-vips-file-buffer', {
  defer: true,
  fn: function (deferred) {
    const im = vips.Image.thumbnail(inputWebP, width, {
      height
    });
    im.webpsaveBuffer(defaultWebPSaveOptions);
    im.delete();
    deferred.resolve();
  }
}).on('cycle', function (event) {
  console.log('webp ' + String(event.target));
});

runSuites([jpegSuite, operationsSuite, pngSuite, webpSuite]);
