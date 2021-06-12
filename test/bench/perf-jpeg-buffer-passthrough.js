'use strict';

const Vips = require('../../lib/node/vips.js');

const images = require('./images');

// Options
const defaultJpegSaveOptions = {
  strip: true,
  Q: 80
}

const benchmark = async () => {
    const vips = await Vips({
      preRun: (module) => {
        // Enable SIMD usage in libjpeg-turbo
        module.ENV.JSIMD_FORCENEON = '1';
      }
    });

    // Disable libvips cache
    vips.Cache.max(0);

    const inputJpgBuffer = vips.FS.readFile(images.inputJpg);

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
};

benchmark();
