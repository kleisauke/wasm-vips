'use strict';

import * as Helpers from './helpers.js';

describe('morphology', () => {
    afterEach(function () {
        cleanup();
    });

    it('countlines', function () {
        const im = vips.Image.black(100, 100).copy();
        im.drawLine(255, 0, 50, 100, 50);
        const n_lines = im.countlines('horizontal');

        expect(n_lines).to.equal(1);
    });

    it('labelregions', function () {
        const im = vips.Image.black(100, 100).copy();
        im.drawCircle(255, 50, 50, 25, {
            fill: true
        });
        const opts = {
            segments: true
        };
        const mask = im.labelregions(opts);

        expect(opts.segments).to.equal(3);
        expect(mask.max()).to.equal(2);
    });

    it('erode', function () {
        const im = vips.Image.black(100, 100).copy();
        im.drawCircle(255, 50, 50, 25, {
            fill: true
        });
        const im2 = im.erode([
            [128, 255, 128],
            [255, 255, 255],
            [128, 255, 128]
        ]);

        expect(im.width).to.equal(im2.width);
        expect(im.height).to.equal(im2.width);
        expect(im.bands).to.equal(im2.bands);
        expect(im.avg()).to.be.above(im2.avg());
    });

    it('dilate', function () {
        const im = vips.Image.black(100, 100).copy();
        im.drawCircle(255, 50, 50, 25, {
            fill: true
        });
        const im2 = im.dilate([
            [128, 255, 128],
            [255, 255, 255],
            [128, 255, 128]
        ]);

        expect(im.width).to.equal(im2.width);
        expect(im.height).to.equal(im2.width);
        expect(im.bands).to.equal(im2.bands);
        expect(im2.avg()).to.be.above(im.avg());
    });

    it('rank', function () {
        const im = vips.Image.black(100, 100).copy();
        im.drawCircle(255, 50, 50, 25, {
            fill: true
        });
        const im2 = im.rank(3, 3, 8);

        expect(im.width).to.equal(im2.width);
        expect(im.height).to.equal(im2.width);
        expect(im.bands).to.equal(im2.bands);
        expect(im2.avg()).to.be.above(im.avg());
    });
});
