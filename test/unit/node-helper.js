'use strict';

import Vips from '../../lib/node-es6/vips.mjs';

import { tmpdir } from 'os';
import { expect } from 'chai';

globalThis.expect = expect;

export async function mochaGlobalSetup () {
  const options = {
    preRun: (module) => {
      module.setAutoDeleteLater(true);
      module.setDelayFunction(fn => {
        globalThis.cleanup = fn;
      });

      // Handy for debugging
      // module.ENV.VIPS_INFO = '1';
      // module.ENV.VIPS_LEAK = '1';

      // Hide warning messages
      module.ENV.VIPS_WARNING = '0';

      // libvips stores temporary files by default in `/tmp`;
      // set the TMPDIR env variable to override this directory
      module.ENV.TMPDIR = tmpdir();
    }
  };
  globalThis.vips = await Vips(options);
}

export function mochaGlobalTeardown () {
  // We are done, shutdown libvips and the runtime of Emscripten
  globalThis.vips.shutdown();
}
