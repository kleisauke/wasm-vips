/* global vips, expect, cleanup */
'use strict';

import * as Helpers from './helpers.js';

describe('resample', () => {
  afterEach(function () {
    cleanup();
  });

  // Run a function expecting a complex image on a two-band image
  function runCmplx (fn, image) {
    let newFormat;

    if (image.format === 'float') {
      newFormat = 'complex';
    } else if (image.format === 'double') {
      newFormat = 'dpcomplex';
    } else {
      throw new Error('runCmplx: not float or double');
    }

    // tag as complex, run, revert tagging
    const cmplx = image.copy({
      bands: 1,
      format: newFormat
    });
    const cmplxResult = fn(cmplx);

    return cmplxResult.copy({
      bands: 2,
      format: image.format
    });
  }

  // Transform image coordinates to polar.
  //
  // The image is transformed so that it is wrapped around a point in the
  // centre. Vertical straight lines become circles or segments of circles,
  // horizontal straight lines become radial spokes.
  function toPolar (image) {
    // xy image, zero in the centre, scaled to fit image to a circle
    let xy = vips.Image.xyz(image.width, image.height);
    xy = xy.subtract([image.width / 2.0, image.height / 2.0]);
    const scale = Math.min(image.width, image.height) / image.width;
    xy = xy.multiply(2.0 / scale);

    // to polar, scale vertical axis to 360 degrees
    let index = runCmplx((x) => x.polar(), xy);
    index = index.multiply([1, image.height / 360.0]);

    return image.mapim(index);
  }

  // Transform image coordinates to rectangular.
  //
  // The image is transformed so that it is unwrapped from a point in the
  // centre. Circles or segments of circles become vertical straight lines,
  // radial lines become horizontal lines.
  function toRectangular (image) {
    // xy image, vertical scaled to 360 degrees
    let xy = vips.Image.xyz(image.width, image.height);
    xy = xy.multiply([1, 360.0 / image.height]);

    // to rect, scale to image rect
    let index = runCmplx((x) => x.rect(), xy);
    const scale = Math.min(image.width, image.height) / image.width;
    index = index.multiply(scale / 2.0);
    index = index.add([image.width / 2.0, image.height / 2.0]);

    return image.mapim(index);
  }

  it('affine', function () {
    const im = vips.Image.newFromFile(Helpers.jpegFile);

    // vsqbs is non-interpolatory, don't test this way
    for (const name of ['nearest', 'bicubic', 'bilinear', 'nohalo', 'lbb']) {
      let x = im;
      const interpolate = vips.Interpolate.newFromName(name);
      for (let i = 0; i < 4; i++) {
        x = x.affine([0, 1, 1, 0], {
          interpolate
        });
      }

      expect(x.subtract(im).abs().max()).to.equal(0);
    }
  });

  it('reduce', function () {
    let im = vips.Image.newFromFile(Helpers.jpegFile);
    // cast down to 0-127, the smallest range, so we aren't messed up by
    // clipping
    im = im.cast('char');

    for (const fac of [1, 1.1, 1.5, 1.999]) {
      for (const fmt of Helpers.allFormats) {
        for (const kernel of ['nearest', 'linear', 'cubic', 'lanczos2', 'lanczos3']) {
          const x = im.cast(fmt);
          const r = x.reduce(fac, fac, {
            kernel
          });
          const d = Math.abs(r.avg() - im.avg());

          expect(d).to.be.below(2);
        }
      }
    }

    // try constant images ... should not change the constant
    for (const constant of [0, 1, 2, 254, 255]) {
      const im = vips.Image.black(10, 10).add(constant).cast('uchar');

      for (const kernel of ['nearest', 'linear', 'cubic', 'lanczos2', 'lanczos3']) {
        // console.log(`testing kernel = ${kernel}`);
        // console.log(`testing const = ${constant}`);

        const shr = im.reduce(2, 2, {
          kernel
        });
        const d = Math.abs(shr.avg() - im.avg());
        expect(d).to.equal(0);
      }
    }
  });

  it('resize', function () {
    let im = vips.Image.newFromFile(Helpers.jpegFile);
    const im2 = im.resize(0.25);

    expect(im2.width).to.equal(Math.round(im.width / 4.0));
    expect(im2.height).to.equal(Math.round(im.height / 4.0));

    // test geometry rounding corner case
    im = vips.Image.black(100, 1);
    let x = im.resize(0.5);

    expect(x.width).to.equal(50);
    expect(x.height).to.equal(1);

    // test whether we use double-precision calculations in reduce{h,v}
    im = vips.Image.black(1600, 1000);
    x = im.resize(10.0 / im.width);
    expect(x.width).to.equal(10);
    expect(x.height).to.equal(6);

    // test round-up option of shrink
    im = vips.Image.black(2049 - 2, 2047 - 2, {
      bands: 3
    });
    im = im.embed(1, 1, 2049, 2047, {
      extend: vips.Extend.background,
      background: [255, 0, 0]
    });

    for (const scale of [8, 9.4, 16]) {
      x = im.resize(1 / scale, {
        vscale: 1 / scale
      });

      const points = [
        [Math.round(x.width / 2), 0],
        [x.width - 1, Math.round(x.height / 2)],
        [Math.round(x.width / 2), x.height - 1],
        [0, Math.round(x.height / 2)]
      ];

      for (const point of points) {
        const y = x.getpoint(point[0], point[1])[0];
        expect(y).to.not.equal(0);
      }
    }
  });

  it('shrink', function () {
    const im = vips.Image.newFromFile(Helpers.jpegFile);
    let im2 = im.shrink(4, 4);

    expect(im2.width).to.equal(Math.round(im.width / 4.0));
    expect(im2.height).to.equal(Math.round(im.height / 4.0));
    expect(Math.abs(im.avg() - im2.avg())).to.be.below(1);

    im2 = im.shrink(2.5, 2.5);

    expect(im2.width).to.equal(Math.round(im.width / 2.5));
    expect(im2.height).to.equal(Math.round(im.height / 2.5));
    expect(Math.abs(im.avg() - im2.avg())).to.be.below(1);
  });

  it('thumbnail', function () {
    // added in 8.5
    let im = vips.Image.thumbnail(Helpers.jpegFile, 100);

    expect(im.height).to.equal(100);
    expect(im.bands).to.equal(3);

    // the average shouldn't move too much
    const imOrig = vips.Image.newFromFile(Helpers.jpegFile);
    expect(Math.abs(imOrig.avg() - im.avg())).to.be.below(1);

    // make sure we always get the right height
    for (let height = 440; height >= 1; height -= 13) {
      const im = vips.Image.thumbnail(Helpers.jpegFile, height);

      expect(im.height).to.equal(height);
    }

    // should fit one of width or height
    im = vips.Image.thumbnail(Helpers.jpegFile, 100, {
      height: 300
    });
    expect(im.width).to.equal(100);
    expect(im.height).to.not.equal(300);

    im = vips.Image.thumbnail(Helpers.jpegFile, 300, {
      height: 100
    });
    expect(im.width).to.not.equal(300);
    expect(im.height).to.equal(100);

    // with @crop, should fit both width and height
    im = vips.Image.thumbnail(Helpers.jpegFile, 100, {
      height: 300,
      crop: 'centre'
    });
    expect(im.width).to.equal(100);
    expect(im.height).to.equal(300);

    let im1;
    let buf;
    let im2;
    if (vips.FS) {
      im1 = vips.Image.thumbnail(Helpers.jpegFile, 100);
      buf = vips.FS.readFile(Helpers.jpegFile);
      im2 = vips.Image.thumbnailBuffer(buf, 100);
      expect(Math.abs(im1.avg() - im2.avg())).to.be.below(1);
    }

    // Needs TIFF support
    if (Helpers.have('tiffload')) {
      // should be able to thumbnail many-page tiff
      im = vips.Image.thumbnail(Helpers.omeFile, 100);
      expect(im.width).to.equal(100);
      expect(im.height).to.equal(38);

      // should be able to thumbnail individual pages from many-page tiff
      im1 = vips.Image.thumbnail(Helpers.omeFile + '[page=0]', 100);
      expect(im.width).to.equal(100);
      expect(im.height).to.equal(38);
      im2 = vips.Image.thumbnail(Helpers.omeFile + '[page=1]', 100);
      expect(im.width).to.equal(100);
      expect(im.height).to.equal(38);
      expect(im1.subtract(im2).abs().max()).to.not.equal(0);

      // should be able to thumbnail entire many-page tiff as a toilet-roll
      // image
      im = vips.Image.thumbnail(Helpers.omeFile + '[n=-1]', 100);
      expect(im.width).to.equal(100);
      expect(im.height).to.equal(570);

      // should be able to thumbnail a single-page tiff in a buffer
      im1 = vips.Image.thumbnail(Helpers.tifFile, 100);
      buf = vips.FS.readFile(Helpers.tifFile);
      im2 = vips.Image.thumbnailBuffer(buf, 100);
      expect(Math.abs(im1.avg() - im2.avg())).to.be.below(1);
    }

    // Needs PPM support
    if (Helpers.have('ppmload')) {
      // linear shrink should work on rgba images
      im1 = vips.Image.thumbnail(Helpers.rgbaFile, 64, { linear: true });
      im2 = vips.Image.newFromFile(Helpers.rgbaCorrectFile);
      expect(Math.abs(im1.flatten({ background: 255 }).avg() - im2.avg())).to.be.below(1);
    }
  });

  describe('similarity', () => {
    it('angle', function () {
      const im = vips.Image.newFromFile(Helpers.jpegFile);
      const im2 = im.similarity({
        angle: 90
      });
      const im3 = im.affine([0, -1, 1, 0]);

      // rounding in calculating the affine transform from the angle stops
      // this being exactly true
      expect(im2.subtract(im3).abs().max()).to.be.below(50);
    });

    it('scale', function () {
      const im = vips.Image.newFromFile(Helpers.jpegFile);
      const im2 = im.similarity({
        scale: 2
      });
      const im3 = im.affine([2, 0, 0, 2]);

      expect(im2.subtract(im3).abs().max()).to.equal(0);
    });
  });

  it('rotate', function () {
    // added in 8.7
    const im = vips.Image.newFromFile(Helpers.jpegFile);
    const im2 = im.rotate(90);
    const im3 = im.affine([0, -1, 1, 0]);

    // rounding in calculating the affine transform from the angle stops
    // this being exactly true
    expect(im2.subtract(im3).abs().max()).to.be.below(50);
  });

  it('mapim', function () {
    const im = vips.Image.newFromFile(Helpers.jpegFile);

    const p = toPolar(im);
    const r = toRectangular(p);

    // the left edge (which is squashed to the origin) will be badly
    // distorted, but the rest should not be too bad
    const a = r.crop(50, 0, im.width - 50, im.height).gaussblur(2);
    const b = im.crop(50, 0, im.width - 50, im.height).gaussblur(2);
    expect(a.subtract(b).abs().max()).to.be.below(50);

    // this was a bug at one point, strangely, if executed with debug
    // enabled
    const mp = vips.Image.xyz(im.width, im.height);
    const interp = vips.Interpolate.newFromName('bicubic');
    expect(im.mapim(mp, { interpolate: interp }).avg()).to.equal(im.avg());
  });
});
