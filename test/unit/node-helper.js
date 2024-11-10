'use strict';

import Vips from '../../lib/vips-node.mjs';

import { expect } from 'chai';

globalThis.expect = expect;

export async function mochaGlobalSetup () {
  const options = {
    // Uncomment to disable dynamic modules
    // dynamicLibraries: [],
    // Test all available dynamic modules
    dynamicLibraries: ['vips-jxl.wasm', 'vips-heif.wasm', 'vips-resvg.wasm'],
    preRun: (module) => {
      module.setAutoDeleteLater(true);
      module.setDelayFunction(fn => {
        globalThis.cleanup = fn;
      });

      // Handy for debugging
      // module.ENV.VIPS_INFO = 1;
      // module.ENV.VIPS_LEAK = 1;
      // module.ENV.VIPS_CONCURRENCY = 1;

      // Hide warning messages
      module.ENV.VIPS_WARNING = 0;
    }
  };
  globalThis.vips = await Vips(options);
}

export function mochaGlobalTeardown () {
  // We are done, shutdown libvips
  globalThis.vips.shutdown();
}
