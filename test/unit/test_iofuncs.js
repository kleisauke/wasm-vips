/* global vips, expect, cleanup */
'use strict';

describe('iofuncs', () => {
  afterEach(function () {
    cleanup();
  });

  it('newFromImage', function () {
    const im = vips.Image.maskIdeal(100, 100, 0.5, {
      reject: true,
      optical: true
    });

    let im2 = im.newFromImage(12);

    expect(im2.width).to.equal(im.width);
    expect(im2.height).to.equal(im.height);
    expect(im2.interpretation).to.equal(im.interpretation);
    expect(im2.format).to.equal(im.format);
    expect(im2.xres).to.equal(im.xres);
    expect(im2.yres).to.equal(im.yres);
    expect(im2.xoffset).to.equal(im.xoffset);
    expect(im2.yoffset).to.equal(im.yoffset);
    expect(im2.bands).to.equal(1);
    expect(im2.avg()).to.equal(12);

    im2 = im.newFromImage([1, 2, 3]);

    expect(im2.bands).to.equal(3);
    expect(im2.avg()).to.equal(2);
  });

  it('newFromMemory', function () {
    const s = new Uint8Array(200);
    const im = vips.Image.newFromMemory(s, 20, 10, 1, 'uchar');

    expect(im.width).to.equal(20);
    expect(im.height).to.equal(10);
    expect(im.format).to.equal('uchar');
    expect(im.bands).to.equal(1);
    expect(im.avg()).to.equal(0);

    const im2 = im.add(10);

    expect(im2.avg()).to.equal(10);
  });

  it('getFields', function () {
    const im = vips.Image.black(10, 10);
    const fields = im.getFields();

    // we might add more fields later
    expect(fields.size()).to.be.above(10);
    expect(fields.get(0)).to.equal('width');
  });

  it('writeToMemory', function () {
    const s = new Uint8Array(200);
    const im = vips.Image.newFromMemory(s, 20, 10, 1, 'uchar');
    const t = im.writeToMemory();

    expect(s).to.deep.equal(t);
  });

  it('revalidate', function () {
    if (!vips.FS) {
      return this.skip();
    }
    // ftruncate() is not yet available in the Node backend of WasmFS.
    // https://github.com/emscripten-core/emscripten/blob/3.1.48/system/lib/wasmfs/backends/node_backend.cpp#L120-L122
    if (typeof vips.FS.statBufToObject === 'function') {
      return this.skip();
    }

    const filename = vips.Utils.tempName('%s.v');

    const im1 = vips.Image.black(10, 10);
    im1.writeToFile(filename);

    const load1 = vips.Image.newFromFile(filename);
    expect(load1.width).to.equal(im1.width);

    const im2 = vips.Image.black(20, 20);
    im2.writeToFile(filename);

    // this will use the old, cached load
    let load2 = vips.Image.newFromFile(filename);
    expect(load2.width).to.equal(im1.width);

    // load again with 'revalidate' and we should see the new image
    load2 = vips.Image.newFromFile(filename, {
      revalidate: true
    });
    expect(load2.width).to.equal(im2.width);

    // load once more without revalidate and we should see the cached
    // new image
    load2 = vips.Image.newFromFile(filename);
    load2.setDeleteOnClose(true);
    expect(load2.width).to.equal(im2.width);
  });
});
