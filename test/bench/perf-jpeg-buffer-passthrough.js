'use strict';

import Vips from '../../lib/node-es6/vips.mjs';

import { inputJpg } from './images.js';

// Options
const defaultJpegSaveOptions = {
  strip: true,
  Q: 80
}

const vips = await Vips({
  // Disable dynamic modules
  dynamicLibraries: [],
  preRun: (module) => {
    // Enable SIMD usage in libjpeg-turbo
    module.ENV.JSIMD_FORCENEON = '1';
  }
});

// Disable libvips cache
vips.Cache.max(0);

const inputJpgBuffer = vips.FS.readFile(inputJpg);

const t0 = performance.now();

const im = vips.Image.jpegloadBuffer(inputJpgBuffer, {
  access: vips.Access.sequential
});
const buffer = im.jpegsaveBuffer(defaultJpegSaveOptions);
im.delete();

const t1 = performance.now();
console.log("Processing time: " + (t1 - t0) + " milliseconds.")

// We are done, shutdown libvips and the runtime of Emscripten
vips.shutdown();
