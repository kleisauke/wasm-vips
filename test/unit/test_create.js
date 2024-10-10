/* global vips, expect, cleanup */
'use strict';

import * as Helpers from './helpers.js';

describe('create', () => {
  afterEach(function () {
    cleanup();
  });

  it('black', function () {
    let im = vips.Image.black(100, 100);

    expect(im.width).to.equal(100);
    expect(im.height).to.equal(100);
    expect(im.format).to.equal('uchar');
    expect(im.bands).to.equal(1);

    for (let i = 0; i < 100; i++) {
      const pixel = im.getpoint(i, i);
      expect(pixel.length).to.equal(1);
      expect(pixel[0]).to.equal(0);
    }

    im = vips.Image.black(100, 100, {
      bands: 3
    });

    expect(im.width).to.equal(100);
    expect(im.height).to.equal(100);
    expect(im.format).to.equal('uchar');
    expect(im.bands).to.equal(3);

    for (let i = 0; i < 100; i++) {
      const pixel = im.getpoint(i, i);
      expect(pixel.length).to.equal(3);
      Helpers.assertAlmostEqualObjects(pixel, [0, 0, 0]);
    }
  });

  it('buildlut', function () {
    let im = vips.Image.newFromArray([
      [0, 0],
      [255, 100]
    ]);

    let lut = im.buildlut();
    expect(lut.width).to.equal(256);
    expect(lut.height).to.equal(1);
    expect(lut.bands).to.equal(1);

    let p = lut.getpoint(0, 0);
    expect(p[0]).to.equal(0.0);

    p = lut.getpoint(255, 0);
    expect(p[0]).to.equal(100.0);

    p = lut.getpoint(10, 0);
    expect(p[0]).to.equal(100 * 10.0 / 255.0);

    im = vips.Image.newFromArray([
      [0, 0, 100],
      [255, 100, 0],
      [128, 10, 90]
    ]);

    lut = im.buildlut();
    expect(lut.width).to.equal(256);
    expect(lut.height).to.equal(1);
    expect(lut.bands).to.equal(2);

    p = lut.getpoint(0, 0);
    Helpers.assertAlmostEqualObjects(p, [0.0, 100.0]);

    p = lut.getpoint(64, 0);
    Helpers.assertAlmostEqualObjects(p, [5.0, 95.0]);
  });

  it('eye', function () {
    let im = vips.Image.eye(100, 90);
    expect(im.width).to.equal(100);
    expect(im.height).to.equal(90);
    expect(im.bands).to.equal(1);
    expect(im.format).to.equal('float');
    expect(im.max()).to.equal(1.0);
    expect(im.min()).to.equal(-1.0);

    im = vips.Image.eye(100, 90, {
      uchar: true
    });
    expect(im.width).to.equal(100);
    expect(im.height).to.equal(90);
    expect(im.bands).to.equal(1);
    expect(im.format).to.equal('uchar');
    expect(im.max()).to.equal(255.0);
    expect(im.min()).to.equal(0.0);
  });

  it('fractsurf', function () {
    // Needs FFTW support
    if (!Helpers.have('fwfft')) {
      return this.skip();
    }

    const im = vips.Image.fractsurf(100, 90, 2.5);
    expect(im.width).to.equal(100);
    expect(im.height).to.equal(90);
    expect(im.bands).to.equal(1);
    expect(im.format).to.equal('float');
  });

  it('gaussmat', function () {
    let im = vips.Image.gaussmat(1, 0.1);
    expect(im.width).to.equal(5);
    expect(im.height).to.equal(5);
    expect(im.bands).to.equal(1);
    expect(im.format).to.equal('double');
    expect(im.max()).to.equal(20);

    let total = im.avg() * im.width * im.height;
    let scale = im.getDouble('scale');
    expect(total).to.equal(scale);

    let p = im.getpoint(im.width / 2, im.height / 2);
    expect(p[0]).to.equal(20);

    im = vips.Image.gaussmat(1, 0.1, {
      separable: true,
      precision: vips.Precision.float
    });
    expect(im.width).to.equal(5);
    expect(im.height).to.equal(1);
    expect(im.bands).to.equal(1);
    expect(im.format).to.equal('double');
    expect(im.max()).to.equal(1.0);

    total = im.avg() * im.width * im.height;
    scale = im.getDouble('scale');
    expect(total).to.equal(scale);

    p = im.getpoint(im.width / 2, im.height / 2);
    expect(p[0]).to.equal(1.0);
  });

  it('gaussnoise', function () {
    let im = vips.Image.gaussnoise(100, 90);
    expect(im.width).to.equal(100);
    expect(im.height).to.equal(90);
    expect(im.bands).to.equal(1);
    expect(im.format).to.equal('float');

    im = vips.Image.gaussnoise(100, 90, {
      sigma: 10,
      mean: 100
    });
    expect(im.width).to.equal(100);
    expect(im.height).to.equal(90);
    expect(im.bands).to.equal(1);
    expect(im.format).to.equal('float');

    const sigma = im.deviate();
    const mean = im.avg();

    expect(sigma).to.be.closeTo(10, 0.4);
    expect(mean).to.be.closeTo(100, 0.4);
  });

  it('grey', function () {
    let im = vips.Image.grey(100, 90);
    expect(im.width).to.equal(100);
    expect(im.height).to.equal(90);
    expect(im.bands).to.equal(1);
    expect(im.format).to.equal('float');

    let p = im.getpoint(0, 0);
    expect(p[0]).to.equal(0.0);
    p = im.getpoint(99, 0);
    expect(p[0]).to.equal(1.0);
    p = im.getpoint(0, 89);
    expect(p[0]).to.equal(0.0);
    p = im.getpoint(99, 89);
    expect(p[0]).to.equal(1.0);

    im = vips.Image.grey(100, 90, {
      uchar: true
    });
    expect(im.width).to.equal(100);
    expect(im.height).to.equal(90);
    expect(im.bands).to.equal(1);
    expect(im.format).to.equal('uchar');

    p = im.getpoint(0, 0);
    expect(p[0]).to.equal(0);
    p = im.getpoint(99, 0);
    expect(p[0]).to.equal(255);
    p = im.getpoint(0, 89);
    expect(p[0]).to.equal(0);
    p = im.getpoint(99, 89);
    expect(p[0]).to.equal(255);
  });

  it('identity', function () {
    let im = vips.Image.identity();
    expect(im.width).to.equal(256);
    expect(im.height).to.equal(1);
    expect(im.bands).to.equal(1);
    expect(im.format).to.equal('uchar');

    let p = im.getpoint(0, 0);
    expect(p[0]).to.equal(0.0);
    p = im.getpoint(255, 0);
    expect(p[0]).to.equal(255.0);
    p = im.getpoint(128, 0);
    expect(p[0]).to.equal(128.0);

    im = vips.Image.identity({
      ushort: true
    });
    expect(im.width).to.equal(65536);
    expect(im.height).to.equal(1);
    expect(im.bands).to.equal(1);
    expect(im.format).to.equal('ushort');

    p = im.getpoint(0, 0);
    expect(p[0]).to.equal(0);
    p = im.getpoint(99, 0);
    expect(p[0]).to.equal(99);
    p = im.getpoint(65535, 0);
    expect(p[0]).to.equal(65535);
  });

  it('invertlut', function () {
    const lut = vips.Image.newFromArray([
      [0.1, 0.2, 0.3, 0.1],
      [0.2, 0.4, 0.4, 0.2],
      [0.7, 0.5, 0.6, 0.3]
    ]);

    const im = lut.invertlut();
    expect(im.width).to.equal(256);
    expect(im.height).to.equal(1);
    expect(im.bands).to.equal(3);
    expect(im.format).to.equal('double');

    let p = im.getpoint(0, 0);
    Helpers.assertAlmostEqualObjects(p, [0, 0, 0]);
    p = im.getpoint(255, 0);
    Helpers.assertAlmostEqualObjects(p, [1, 1, 1]);
    p = im.getpoint(0.2 * 255, 0);
    expect(p[0]).to.be.closeTo(0.1, 0.1);
    p = im.getpoint(0.3 * 255, 0);
    expect(p[1]).to.be.closeTo(0.1, 0.1);
    p = im.getpoint(0.1 * 255, 0);
    expect(p[2]).to.be.closeTo(0.1, 0.1);
  });

  it('matrixinvert', function () {
    // 4x4 matrix to check if PLU decomposition works
    const mat = vips.Image.newFromArray([
      [4, 0, 0, 0],
      [0, 0, 2, 0],
      [0, 1, 2, 0],
      [1, 0, 0, 1]
    ]);

    const im = mat.matrixinvert();
    expect(im.width).to.equal(4);
    expect(im.height).to.equal(4);
    expect(im.bands).to.equal(1);
    expect(im.format).to.equal('double');

    let p = im.getpoint(0, 0);
    expect(p[0]).to.equal(0.25);
    p = im.getpoint(3, 3);
    expect(p[0]).to.equal(1.0);
  });

  it('logmat', function () {
    let im = vips.Image.logmat(1, 0.1);
    expect(im.width).to.equal(7);
    expect(im.height).to.equal(7);
    expect(im.bands).to.equal(1);
    expect(im.format).to.equal('double');
    expect(im.max()).to.equal(20);

    let total = im.avg() * im.width * im.height;
    let scale = im.getDouble('scale');
    expect(total).to.equal(scale);

    let p = im.getpoint(im.width / 2, im.height / 2);
    expect(p[0]).to.equal(20);

    im = vips.Image.logmat(1, 0.1, {
      separable: true,
      precision: 'float'
    });
    expect(im.width).to.equal(7);
    expect(im.height).to.equal(1);
    expect(im.bands).to.equal(1);
    expect(im.format).to.equal('double');
    expect(im.max()).to.equal(1.0);

    total = im.avg() * im.width * im.height;
    scale = im.getDouble('scale');
    expect(total).to.equal(scale);

    p = im.getpoint(im.width / 2, im.height / 2);
    expect(p[0]).to.equal(1.0);
  });

  it('maskButterworthBand', function () {
    let im = vips.Image.maskButterworthBand(128, 128, 2,
      0.5, 0.5, 0.7, 0.1);
    expect(im.width).to.equal(128);
    expect(im.height).to.equal(128);
    expect(im.bands).to.equal(1);
    expect(im.format).to.equal('float');
    expect(im.max()).to.be.closeTo(1, 0.01);

    let p = im.getpoint(32, 32);
    expect(p[0]).to.equal(1.0);

    im = vips.Image.maskButterworthBand(128, 128, 2,
      0.5, 0.5, 0.7, 0.1,
      {
        uchar: true,
        optical: true
      });
    expect(im.width).to.equal(128);
    expect(im.height).to.equal(128);
    expect(im.bands).to.equal(1);
    expect(im.format).to.equal('uchar');
    expect(im.max()).to.equal(255);

    p = im.getpoint(32, 32);
    expect(p[0]).to.equal(255.0);
    p = im.getpoint(64, 64);
    expect(p[0]).to.equal(255.0);

    im = vips.Image.maskButterworthBand(128, 128, 2,
      0.5, 0.5, 0.7, 0.1, {
        uchar: true,
        optical: true,
        nodc: true
      });
    expect(im.width).to.equal(128);
    expect(im.height).to.equal(128);
    expect(im.bands).to.equal(1);
    expect(im.format).to.equal('uchar');
    expect(im.max()).to.equal(255);

    p = im.getpoint(32, 32);
    expect(p[0]).to.equal(255.0);
    p = im.getpoint(64, 64);
    expect(p[0]).to.not.equal(255.0);
  });

  it('maskButterworth', function () {
    let im = vips.Image.maskButterworth(128, 128, 2, 0.7, 0.1, {
      nodc: true
    });
    expect(im.width).to.equal(128);
    expect(im.height).to.equal(128);
    expect(im.bands).to.equal(1);
    expect(im.format).to.equal('float');
    expect(im.min()).to.be.closeTo(0, 0.01);

    let p = im.getpoint(0, 0);
    expect(p[0]).to.equal(0.0);

    const max = im.maxPos();
    const x = max[0];
    const y = max[1];
    expect(x).to.equal(64);
    expect(y).to.equal(64);

    im = vips.Image.maskButterworth(128, 128, 2, 0.7, 0.1, {
      optical: true,
      uchar: true
    });
    expect(im.width).to.equal(128);
    expect(im.height).to.equal(128);
    expect(im.bands).to.equal(1);
    expect(im.format).to.equal('uchar');
    expect(im.min()).to.be.closeTo(0, 0.01);

    p = im.getpoint(64, 64);
    expect(p[0]).to.equal(255);
  });

  it('maskButterworthRing', function () {
    const im = vips.Image.maskButterworthRing(128, 128, 2, 0.7, 0.1, 0.5, {
      nodc: true
    });
    expect(im.width).to.equal(128);
    expect(im.height).to.equal(128);
    expect(im.bands).to.equal(1);
    expect(im.format).to.equal('float');

    const p = im.getpoint(45, 0);
    expect(p[0]).to.be.closeTo(1.0, 0.0001);

    const min = im.minPos();
    const x = min[0];
    const y = min[1];
    expect(x).to.equal(64);
    expect(y).to.equal(64);
  });

  it('maskFractal', function () {
    const im = vips.Image.maskFractal(128, 128, 2.3);
    expect(im.width).to.equal(128);
    expect(im.height).to.equal(128);
    expect(im.bands).to.equal(1);
    expect(im.format).to.equal('float');
  });

  it('maskGaussian', function () {
    const im = vips.Image.maskGaussian(128, 128, 0.7, 0.1, {
      nodc: true
    });
    expect(im.width).to.equal(128);
    expect(im.height).to.equal(128);
    expect(im.bands).to.equal(1);
    expect(im.format).to.equal('float');
    expect(im.min()).to.be.closeTo(0, 0.01);

    const p = im.getpoint(0, 0);
    expect(p[0]).to.equal(0.0);
  });

  it('maskGaussianRing', function () {
    const im = vips.Image.maskGaussianRing(128, 128, 0.7, 0.1, 0.5, {
      nodc: true
    });
    expect(im.width).to.equal(128);
    expect(im.height).to.equal(128);
    expect(im.bands).to.equal(1);
    expect(im.format).to.equal('float');
    expect(im.min()).to.be.closeTo(0, 0.01);

    const p = im.getpoint(45, 0);
    expect(p[0]).to.be.closeTo(1.0, 0.001);
  });

  it('maskIdealBand', function () {
    const im = vips.Image.maskIdealBand(128, 128, 0.5, 0.5, 0.7);
    expect(im.width).to.equal(128);
    expect(im.height).to.equal(128);
    expect(im.bands).to.equal(1);
    expect(im.format).to.equal('float');
    expect(im.max()).to.be.closeTo(1, 0.01);

    const p = im.getpoint(32, 32);
    expect(p[0]).to.equal(1.0);
  });

  it('maskIdeal', function () {
    const im = vips.Image.maskIdeal(128, 128, 0.7, {
      nodc: true
    });
    expect(im.width).to.equal(128);
    expect(im.height).to.equal(128);
    expect(im.bands).to.equal(1);
    expect(im.format).to.equal('float');
    expect(im.min()).to.be.closeTo(0, 0.01);

    const p = im.getpoint(0, 0);
    expect(p[0]).to.equal(0.0);
  });

  it('maskIdealRing', function () {
    const im = vips.Image.maskIdealRing(128, 128, 0.7, 0.5, {
      nodc: true
    });
    expect(im.width).to.equal(128);
    expect(im.height).to.equal(128);
    expect(im.bands).to.equal(1);
    expect(im.format).to.equal('float');

    const p = im.getpoint(45, 0);
    expect(p[0]).to.be.closeTo(1.0, 0.001);
  });

  it('sines', function () {
    const im = vips.Image.sines(128, 128);
    expect(im.width).to.equal(128);
    expect(im.height).to.equal(128);
    expect(im.bands).to.equal(1);
    expect(im.format).to.equal('float');
  });

  it('text', function () {
    // Needs text support
    if (!Helpers.have('text')) {
      return this.skip();
    }

    let im = vips.Image.text('Hello, world!', {
      dpi: 300
    });
    expect(im.width).to.be.above(10);
    expect(im.height).to.be.above(10);
    expect(im.bands).to.equal(1);
    expect(im.format).to.equal('uchar');
    expect(im.max()).to.be.above(240);
    expect(im.min()).to.equal(0);

    // test autofit
    im = vips.Image.text('Hello, world!', {
      width: 500,
      height: 500
    });
    // quite a large threshold, since we need to work with a huge range of
    // text rendering systems
    expect(Math.abs(im.width - 500)).to.be.below(50);

    // test wrap
    const im1 = vips.Image.text('helloworld', {
      width: 100,
      dpi: 500
    });
    const im2 = vips.Image.text('helloworld', {
      width: 100,
      dpi: 500,
      wrap: vips.TextWrap.char
    });
    expect(im1.width).to.be.above(im2.width);
  });

  it('tonelut', function () {
    const im = vips.Image.tonelut();
    expect(im.bands).to.equal(1);
    expect(im.format).to.equal('ushort');
    expect(im.width).to.equal(32768);
    expect(im.height).to.equal(1);
    expect(im.histIsmonotonic()).to.equal(true);
  });

  it('xyz', function () {
    const im = vips.Image.xyz(128, 128);
    expect(im.bands).to.equal(2);
    expect(im.format).to.equal('uint');
    expect(im.width).to.equal(128);
    expect(im.height).to.equal(128);

    const p = im.getpoint(45, 35);
    Helpers.assertAlmostEqualObjects(p, [45, 35]);
  });

  it('sdf', function () {
    let im = vips.Image.sdf(128, 128, vips.SdfShape.circle, {
      a: [64, 64],
      r: 32
    });
    expect(im.bands).to.equal(1);
    expect(im.format).to.equal('float');
    expect(im.width).to.equal(128);
    expect(im.height).to.equal(128);
    let p = im.getpoint(45, 35);
    Helpers.assertAlmostEqualObjects(p, [2.670], 0.01);

    im = vips.Image.sdf(128, 128, vips.SdfShape.box, {
      a: [10, 10],
      b: [50, 40]
    });
    expect(im.bands).to.equal(1);
    expect(im.format).to.equal('float');
    expect(im.width).to.equal(128);
    expect(im.height).to.equal(128);
    p = im.getpoint(45, 35);
    Helpers.assertAlmostEqualObjects(p, [-5.0]);

    im = vips.Image.sdf(128, 128, vips.SdfShape.rounded_box, {
      a: [10, 10],
      b: [50, 40],
      corners: [50, 0, 0, 0]
    });
    expect(im.bands).to.equal(1);
    expect(im.format).to.equal('float');
    expect(im.width).to.equal(128);
    expect(im.height).to.equal(128);
    p = im.getpoint(45, 35);
    Helpers.assertAlmostEqualObjects(p, [13.640], 0.01);

    im = vips.Image.sdf(128, 128, vips.SdfShape.line, {
      a: [10, 10],
      b: [50, 40]
    });
    expect(im.bands).to.equal(1);
    expect(im.format).to.equal('float');
    expect(im.width).to.equal(128);
    expect(im.height).to.equal(128);
    p = im.getpoint(45, 35);
    Helpers.assertAlmostEqualObjects(p, [1.0]);
  });

  it('zone', function () {
    const im = vips.Image.zone(128, 128);
    expect(im.width).to.equal(128);
    expect(im.height).to.equal(128);
    expect(im.bands).to.equal(1);
    expect(im.format).to.equal('float');
  });

  it('worley', function () {
    // Needs worley support
    if (!Helpers.have('worley')) {
      return this.skip();
    }

    const im = vips.Image.worley(512, 512);
    expect(im.width).to.equal(512);
    expect(im.height).to.equal(512);
    expect(im.bands).to.equal(1);
    expect(im.format).to.equal('float');
  });

  it('perlin', function () {
    // Needs perlin support
    if (!Helpers.have('perlin')) {
      return this.skip();
    }

    const im = vips.Image.perlin(512, 512);
    expect(im.width).to.equal(512);
    expect(im.height).to.equal(512);
    expect(im.bands).to.equal(1);
    expect(im.format).to.equal('float');
  });
});
