'use strict';

import Vips from '../../lib/node-es6/vips.mjs';

import url from 'url';
import path from 'path';
import { expect } from 'chai';

globalThis.url = url;
globalThis.path = path;
globalThis.expect = expect;

export async function mochaGlobalSetup () {
  const options = {
    preRun: (module) => {
      module.EMBIND_AUTOMATIC_DELETELATER = true;
      module.setDelayFunction(fn => {
        globalThis.cleanup = fn;
      });

      // Handy for debugging
      // module.ENV.VIPS_INFO = '1';
      // module.ENV.VIPS_LEAK = '1';

      // Hide warning messages
      module.ENV.VIPS_WARNING = '0';
    }
  };
  globalThis.vips = await Vips(options);
}

export function mochaGlobalTeardown () {
  // We are done, shutdown libvips and the runtime of Emscripten
  globalThis.vips.shutdown();
}
