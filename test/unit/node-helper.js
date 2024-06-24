'use strict';

import { tmpdir } from 'node:os';
import { expect } from 'chai';

globalThis.expect = expect;

const variant = process.argv
  .find(arg => arg.startsWith('--variant='))
  ?.split('=')?.[1];
const pkg = variant ? `../../lib/${variant}/vips-node.mjs` : '../../lib/vips-node.mjs';

const { default: Vips } = await import(pkg);

export async function mochaGlobalSetup () {
  // Test all available dynamic modules for non lowmem/slim builds
  const dynamicLibraries = /(lowmem|slim)$/.test(variant) ? [] : ['vips-jxl.wasm', 'vips-heif.wasm', 'vips-resvg.wasm'];

  const options = {
    dynamicLibraries,
    preRun: (module) => {
      module.setAutoDeleteLater(true);
      module.setDelayFunction(fn => {
        globalThis.cleanup = fn;
      });

      // Handy for debugging
      // module.ENV.VIPS_INFO = 1;
      // module.ENV.VIPS_LEAK = 1;

      // Hide warning messages
      module.ENV.VIPS_WARNING = 0;

      // libvips stores temporary files by default in `/tmp`;
      // set the TMPDIR env variable to override this directory
      module.ENV.TMPDIR = tmpdir();
    }
  };
  globalThis.vips = await Vips(options);
}

export function mochaGlobalTeardown () {
  // We are done, shutdown libvips
  globalThis.vips.shutdown();
}
