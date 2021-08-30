'use strict';

import * as Helpers from './helpers.js';

describe('mosaicing', () => {
  afterEach(function () {
    cleanup();
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

    mosaicedImage = mosaicedImage.globalbalance();

    // Uncomment to see the output
    // const outBuffer = new Uint8Array(mosaicedImage.writeToBuffer('.jpg'));
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
