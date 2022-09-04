'use strict';

import * as Helpers from './helpers.js';

describe('block', () => {
  it('blockUntrusted', function () {
    // Needs VIPS file load support
    if (!Helpers.have('vipsload')) {
      return this.skip();
    }

    // Some operations can be cached, which means they can return a result despite
    // being blocked, if they were run previously. Disabling the cache fixes this issue.
    Helpers.disableCache();

    // vipsload is an untrusted operation, and should be blocked when blockUntrusted is true

    vips.blockUntrusted(true);
    expect(() => vips.Image.vipsload(Helpers.vipsFile)).to.throw(/operation is blocked/);

    vips.blockUntrusted(false);
    expect(() => vips.Image.vipsload(Helpers.vipsFile)).to.not.throw();

    vips.blockUntrusted(true);
    expect(() => vips.Image.vipsload(Helpers.vipsFile)).to.throw(/operation is blocked/);

    // make sure no operations are blocked when the rest of the tests run
    vips.blockUntrusted(false);
    Helpers.enableCache();
  });

  it('operation_block', function () {
    // Needs JPEG and PNG file load support
    if (!Helpers.have('jpegload') || !Helpers.have('pngload')) {
      return this.skip();
    }

    // Some operations can be cached, which means they can return a result despite
    // being blocked, if they were run previously. Disabling the cache fixes this issue.
    Helpers.disableCache();

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

    // make sure no operations are blocked when the rest of the tests run
    vips.operationBlock('VipsForeignLoad', false);
    Helpers.enableCache();
  });
});
