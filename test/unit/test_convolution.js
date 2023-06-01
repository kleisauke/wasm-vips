/* global vips, expect, cleanup */
'use strict';

import * as Helpers from './helpers.js';

describe('convolution', () => {
  let globalDeletionQueue;

  let colour;
  let mono;
  let allImages;
  let sharp;
  let blur;
  let line;
  let sobel;
  let allMasks;

  before(function () {
    const im = vips.Image.maskIdeal(100, 100, 0.5, {
      reject: true,
      optical: true
    });
    colour = im.multiply([1, 2, 3]).add([2, 3, 4]).copy({
      interpretation: 'srgb'
    });
    mono = colour.extractBand(1).copy({
      interpretation: 'b-w'
    });
    allImages = [mono, colour];
    sharp = vips.Image.newFromArray([
      [-1, -1, -1],
      [-1, 16, -1],
      [-1, -1, -1]
    ], 8);
    blur = vips.Image.newFromArray([
      [1, 1, 1],
      [1, 1, 1],
      [1, 1, 1]
    ], 9);
    line = vips.Image.newFromArray([
      [1, 1, 1],
      [-2, -2, -2],
      [1, 1, 1]
    ]);
    sobel = vips.Image.newFromArray([
      [1, 2, 1],
      [0, 0, 0],
      [-1, -2, -1]
    ]);
    allMasks = [sharp, blur, line, sobel];

    globalDeletionQueue = vips.deletionQueue.splice(0);
  });

  after(function () {
    vips.deletionQueue.push(...globalDeletionQueue);
    cleanup();
  });

  afterEach(function () {
    cleanup();
  });

  // point convolution
  function conv (image, mask, xPosition, yPosition) {
    let s = 0.0;
    for (let x = 0; x < mask.width; x++) {
      for (let y = 0; y < mask.height; y++) {
        const m = mask.getpoint(x, y);
        const i = image.getpoint(x + xPosition, y + yPosition);
        const p = Helpers.runFn2((a, b) => a * b, m, i);
        s = Helpers.runFn2((a, b) => a + b, s, p);
      }
    }

    return Helpers.runFn2((a, b) => a / b, s, mask.getDouble('scale'));
  }

  function compass (image, mask, xPosition, yPosition, nRot, fn) {
    const acc = [];

    for (let i = 0; i < nRot; i++) {
      let result = conv(image, mask, xPosition, yPosition);
      result = Helpers.runFn(Math.abs, result);
      acc.push(result);
      mask = mask.rot45();
    }

    return acc.reduce((a, b) => Helpers.runFn2(fn, a, b));
  }

  it('conv', function () {
    for (const im of allImages) {
      for (const msk of allMasks) {
        for (const prec of [vips.Precision.integer, vips.Precision.float]) {
          const convolved = im.conv(msk, {
            precision: prec
          });

          let result = convolved.getpoint(25, 50);
          let predict = conv(im, msk, 24, 49);
          Helpers.assertAlmostEqualObjects(result, predict);

          result = convolved.getpoint(50, 50);
          predict = conv(im, msk, 49, 49);
          Helpers.assertAlmostEqualObjects(result, predict);
        }
      }
    }
  });

  it('conva', function () {
    // don't test conva, it's still not done
    return this.skip();

    for (const im of allImages) { // eslint-disable-line no-unreachable
      for (const msk of allMasks) {
        console.log('msk:');
        msk.matrixprint();

        console.log(`im.bands = ${im.bands}`);

        const convolved = im.conv(msk, {
          precision: 'approximate'
        });

        let result = convolved.getpoint(25, 50);
        let predict = conv(im, msk, 24, 49);
        console.log(`result = ${result}, predict = ${predict}`);
        Helpers.assertLessThreshold(result, predict, 5);

        result = convolved.getpoint(50, 50);
        predict = conv(im, msk, 49, 49);
        console.log(`result = ${result}, predict = ${predict}`);
        Helpers.assertLessThreshold(result, predict, 5);
      }
    }
  });

  it('compass', function () {
    for (const im of allImages) {
      for (const msk of allMasks) {
        for (const prec of [vips.Precision.integer, vips.Precision.float]) {
          for (let i = 1; i < 4; i++) {
            const convolved = im.compass(msk, {
              times: i,
              angle: vips.Angle45.d45,
              combine: vips.Combine.max,
              precision: prec
            });

            const result = convolved.getpoint(25, 50);
            const predict = compass(im, msk, 24, 49, i, Math.max);
            Helpers.assertAlmostEqualObjects(result, predict);
          }
        }
      }
    }

    for (const im of allImages) {
      for (const msk of allMasks) {
        for (const prec of [vips.Precision.integer, vips.Precision.float]) {
          for (let i = 1; i < 4; i++) {
            const convolved = im.compass(msk, {
              times: i,
              angle: vips.Angle45.d45,
              combine: vips.Combine.sum,
              precision: prec
            });

            const result = convolved.getpoint(25, 50);
            const predict = compass(im, msk, 24, 49, i, (a, b) => a + b);
            Helpers.assertAlmostEqualObjects(result, predict);
          }
        }
      }
    }
  });

  it('convsep', function () {
    for (const im of allImages) {
      for (const prec of [vips.Precision.integer, vips.Precision.float]) {
        const gmask = vips.Image.gaussmat(2, 0.1, {
          precision: prec
        });
        const gmaskSep = vips.Image.gaussmat(2, 0.1, {
          separable: true,
          precision: prec
        });

        expect(gmask.width).to.equal(gmask.height);
        expect(gmaskSep.width).to.equal(gmask.width);
        expect(gmaskSep.height).to.equal(1);

        const a = im.conv(gmask, {
          precision: prec
        });
        const b = im.convsep(gmaskSep, {
          precision: prec
        });

        const aPoint = a.getpoint(25, 50);
        const bPoint = b.getpoint(25, 50);

        Helpers.assertAlmostEqualObjects(aPoint, bPoint, 0.1);
      }
    }
  });

  it('fastcor', function () {
    for (const im of allImages) {
      for (const fmt of Helpers.noncomplexFormats) {
        const small = im.crop(20, 45, 10, 10).cast(fmt);
        const cor = im.fastcor(small);

        const minPos = {
          x: true,
          y: true
        };
        const v = cor.min(minPos);
        const x = minPos.x;
        const y = minPos.y;

        expect(v).to.equal(0);
        expect(x).to.equal(25);
        expect(y).to.equal(50);
      }
    }
  });

  it('spcor', function () {
    for (const im of allImages) {
      for (const fmt of Helpers.noncomplexFormats) {
        const small = im.crop(20, 45, 10, 10).cast(fmt);
        const cor = im.spcor(small);

        const maxPos = {
          x: true,
          y: true
        };
        const v = cor.max(maxPos);
        const x = maxPos.x;
        const y = maxPos.y;

        expect(v).to.equal(1.0);
        expect(x).to.equal(25);
        expect(y).to.equal(50);
      }
    }
  });

  it('gaussblur', function () {
    for (const im of allImages) {
      for (const prec of [vips.Precision.integer, vips.Precision.float]) {
        for (let i = 5; i < 10; i++) {
          const sigma = i / 5.0;
          const gmask = vips.Image.gaussmat(sigma, 0.2, {
            precision: prec
          });

          const a = im.conv(gmask, {
            precision: prec
          });
          const b = im.gaussblur(sigma, {
            min_ampl: 0.2,
            precision: prec
          });

          const aPoint = a.getpoint(25, 50);
          const bPoint = b.getpoint(25, 50);

          Helpers.assertAlmostEqualObjects(aPoint, bPoint, 0.1);
        }
      }
    }
  });

  it('sharpen', function () {
    for (const im of allImages) {
      for (const fmt of Helpers.noncomplexFormats) {
        // old vipses used "radius", check that that still works
        sharp = im.sharpen({
          radius: 5
        });

        for (const sigma of [0.5, 1, 1.5, 2]) {
          const test = im.cast(fmt);
          let sharp = test.sharpen({
            sigma
          });

          // hard to test much more than this
          expect(test.width).to.equal(sharp.width);
          expect(test.height).to.equal(sharp.height);

          // if m1 and m2 are zero, sharpen should do nothing
          sharp = test.sharpen({
            sigma,
            m1: 0,
            m2: 0
          });
          sharp = sharp.colourspace(test.interpretation);

          // console.log(`testing sig = ${sigma}`);
          // console.log(`testing fmt = ${fmt}`);
          // console.log(`max diff = = ${test.subtract(sharp).abs().max()}`);
          expect(test.subtract(sharp).abs().max()).to.equal(0);
        }
      }
    }
  });
});
