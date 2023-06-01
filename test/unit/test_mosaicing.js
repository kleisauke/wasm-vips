/* global vips, expect, cleanup */
'use strict';

import * as Helpers from './helpers.js';

describe('mosaicing', () => {
  afterEach(function () {
    cleanup();
  });

  it('lrmerge', function () {
    const left = vips.Image.newFromFile(Helpers.mosaicFiles[0]);
    const right = vips.Image.newFromFile(Helpers.mosaicFiles[1]);
    const join = left.merge(right, 'horizontal', 10 - left.width, 0);

    expect(join.width).to.equal(left.width + right.width - 10);
    expect(join.height).to.equal(Math.max(left.height, right.height));
    expect(join.bands).to.equal(1);
  });

  it('tbmerge', function () {
    const top = vips.Image.newFromFile(Helpers.mosaicFiles[0]);
    const bottom = vips.Image.newFromFile(Helpers.mosaicFiles[2]);
    const join = top.merge(bottom, 'vertical', 0, 10 - top.height);

    expect(join.width).to.equal(Math.max(top.width, bottom.width));
    expect(join.height).to.equal(top.height + bottom.height - 10);
    expect(join.bands).to.equal(1);
  });

  it('lrmosaic', function () {
    const left = vips.Image.newFromFile(Helpers.mosaicFiles[0]);
    const right = vips.Image.newFromFile(Helpers.mosaicFiles[1]);
    const join = left.mosaic(right, 'horizontal', left.width - 30, 0, 30, 0);

    expect(join.width).to.equal(1014);
    expect(join.height).to.equal(379);
    expect(join.bands).to.equal(1);
  });

  it('tbmosaic', function () {
    const top = vips.Image.newFromFile(Helpers.mosaicFiles[0]);
    const bottom = vips.Image.newFromFile(Helpers.mosaicFiles[2]);
    const join = top.mosaic(bottom, 'vertical', 0, top.height - 30, 0, 30);

    expect(join.width).to.equal(542);
    expect(join.height).to.equal(688);
    expect(join.bands).to.equal(1);
  });

  it('mosaic', function () {
    // ported from https://github.com/libvips/nip2/tree/master/share/nip2/data/examples/1_point_mosaic

    let mosaicedImage;

    for (let i = 0; i < Helpers.mosaicFiles.length; i += 2) {
      const files = Helpers.mosaicFiles.slice(i, i + 2);
      const marks = Helpers.mosaicMarks.slice(i, i + 2);

      const im = vips.Image.newFromFile(files[0]);
      const secIm = vips.Image.newFromFile(files[1]);

      const horizontalPart = im.mosaic(secIm, vips.Direction.horizontal,
        marks[0][0], marks[0][1], marks[1][0], marks[1][1]);

      if (mosaicedImage) {
        const verticalMarks = Helpers.mosaicVerticalMarks.slice(i - 2, i);
        mosaicedImage = mosaicedImage.mosaic(horizontalPart, vips.Direction.vertical,
          verticalMarks[1][0], verticalMarks[1][1],
          verticalMarks[0][0], verticalMarks[0][1]);
      } else {
        mosaicedImage = horizontalPart;
      }
    }

    // Uncomment to see the output
    // const outBuffer = mosaicedImage.writeToBuffer('.jpg');
    // const blob = new Blob([outBuffer], {type: 'image/jpeg'});
    // const blobURL = URL.createObjectURL(blob);
    // const img = document.createElement('img');
    // img.src = blobURL;
    // document.body.appendChild(img);

    // hard to test much more than this
    expect(mosaicedImage.width).to.equal(1005);
    expect(mosaicedImage.height).to.equal(1295);
    expect(mosaicedImage.interpretation).to.equal('b-w');
    expect(mosaicedImage.bands).to.equal(1);
  });

  it('globalbalance', function () {
    let mosaicedImage;

    for (let i = 0; i < Helpers.mosaicFiles.length; i += 2) {
      const files = Helpers.mosaicFiles.slice(i, i + 2);
      const marks = Helpers.mosaicMarks.slice(i, i + 2);

      const im = vips.Image.newFromFile(files[0]);
      const secIm = vips.Image.newFromFile(files[1]);

      const horizontalPart = im.mosaic(secIm, vips.Direction.horizontal,
        marks[0][0], marks[0][1], marks[1][0], marks[1][1]);

      if (mosaicedImage) {
        const verticalMarks = Helpers.mosaicVerticalMarks.slice(i - 2, i);
        mosaicedImage = mosaicedImage.mosaic(horizontalPart, vips.Direction.vertical,
          verticalMarks[1][0], verticalMarks[1][1],
          verticalMarks[0][0], verticalMarks[0][1]);
      } else {
        mosaicedImage = horizontalPart;
      }
    }

    mosaicedImage = mosaicedImage.globalbalance();

    // Uncomment to see the output
    // const outBuffer = mosaicedImage.writeToBuffer('.jpg');
    // const blob = new Blob([outBuffer], {type: 'image/jpeg'});
    // const blobURL = URL.createObjectURL(blob);
    // const img = document.createElement('img');
    // img.src = blobURL;
    // document.body.appendChild(img);

    // hard to test much more than this
    expect(mosaicedImage.width).to.equal(1005);
    expect(mosaicedImage.height).to.equal(1295);
    expect(mosaicedImage.interpretation).to.equal('b-w');
    expect(mosaicedImage.format).to.equal('float');
    expect(mosaicedImage.bands).to.equal(1);
  });
});
