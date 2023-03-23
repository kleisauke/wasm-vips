'use strict';

import * as Helpers from './helpers.js';

describe('block', () => {
  afterEach(function () {
    // Not really necessary, but helps debugging ref leaks and ensures that the images are properly
    // cleaned up after every test
    cleanup();
  });

  it('blockUntrusted', function () {
    // Needs VIPS file load support
    if (!Helpers.have('vipsload')) {
      return this.skip();
    }

    // By default, libvips doesn't block untrusted operations
    expect(() => vips.Image.vipsload(Helpers.vipsFile)).to.not.throw();

    // However, if the environment variable `VIPS_BLOCK_UNTRUSTED` is set,
    // or `vips_block_untrusted_set(TRUE);` is called, any operations
    // that are tagged as untrusted will be prevented from running
    vips.blockUntrusted(true);

    // For example, `vipsload` is an untrusted operation, and would throw
    // an error when untrusted operations are blocked
    expect(() => vips.Image.vipsload(Helpers.vipsFile)).to.throw(/operation is blocked/);

    // Ensure no operations are blocked when the rest of the tests are run
    vips.blockUntrusted(false);
  });

  it('operationBlock', function () {
    // Needs JPEG and PNG file load support
    if (!Helpers.have('jpegload') || !Helpers.have('pngload')) {
      return this.skip();
    }

    vips.operationBlock('VipsForeignLoadJpeg', true);
    expect(() => vips.Image.jpegload(Helpers.jpegFile)).to.throw(/operation is blocked/);

    vips.operationBlock('VipsForeignLoad', false);
    vips.operationBlock('VipsForeignLoadPng', true);
    expect(() => vips.Image.jpegload(Helpers.jpegFile)).to.not.throw();
    expect(() => vips.Image.pngload(Helpers.pngFile)).to.throw(/operation is blocked/);

    vips.operationBlock('VipsForeignLoadJpeg', true);
    expect(() => vips.Image.jpegload(Helpers.jpegFile)).to.throw(/operation is blocked/);

    vips.operationBlock('VipsForeignLoadPng', false);
    expect(() => vips.Image.pngload(Helpers.pngFile)).to.not.throw();

    // Ensure no operations are blocked when the rest of the tests are run
    vips.operationBlock('VipsForeignLoad', false);
  });
});
