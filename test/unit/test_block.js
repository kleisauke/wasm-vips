'use strict';

import * as Helpers from './helpers.js';

let cachePreviousMax;

before(function () {
  // Temporarily disable the operation cache of libvips to avoid caching blocked operations
  cachePreviousMax = vips.Cache.max();
  vips.Cache.max(0);
});

after(function () {
  // Re-enable the operation cache of libvips
  vips.Cache.max(cachePreviousMax);
});

afterEach(function () {
  // Not really necessary, but helps in debugging ref leaks and ensures that the images are properly cleaned up after every test
  cleanup();
});

describe('block', () => {
  it('blockUntrusted', function () {
    // Needs VIPS file load support
    if (!Helpers.have('vipsload')) {
      return this.skip();
    }

    // vipsload is an untrusted operation, and should be blocked when blockUntrusted is true

    vips.blockUntrusted(true);
    expect(() => vips.Image.vipsload(Helpers.vipsFile)).to.throw(/operation is blocked/);

    vips.blockUntrusted(false);
    expect(() => vips.Image.vipsload(Helpers.vipsFile)).to.not.throw();

    vips.blockUntrusted(true);
    expect(() => vips.Image.vipsload(Helpers.vipsFile)).to.throw(/operation is blocked/);

    // make sure no operations are blocked when the rest of the tests run
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

    // make sure no operations are blocked when the rest of the tests run
    vips.operationBlock('VipsForeignLoad', false);
  });
});
