'use strict';

import * as Helpers from './helpers.js';

describe('histogram', () => {
    afterEach(function () {
        cleanup();
    });

    it('histCum', function () {
        const im = vips.Image.identity();

        const sum = im.avg() * 256;

        const cum = im.histCum();

        let p = cum.getpoint(255, 0);
        expect(p[0]).to.equal(sum);
    });

    it('histEqual', function () {
        const im = vips.Image.newFromFile(Helpers.JPEG_FILE);

        const im2 = im.histEqual();

        expect(im.width).to.equal(im2.width);
        expect(im.height).to.equal(im2.height);

        expect(im.avg()).to.be.below(im2.avg());
        expect(im.deviate()).to.be.below(im2.deviate());
    });

    it('histIsmonotonic', function () {
        const im = vips.Image.identity();
        expect(im.histIsmonotonic()).to.be.true;
    });

    it('histLocal', function () {
        const im = vips.Image.newFromFile(Helpers.JPEG_FILE);

        const im2 = im.histLocal(10, 10);

        expect(im.width).to.equal(im2.width);
        expect(im.height).to.equal(im2.height);

        expect(im.avg()).to.be.below(im2.avg());
        expect(im.deviate()).to.be.below(im2.deviate());

        const im3 = im.histLocal(10, 10, {
            max_slope: 3
        });

        expect(im.width).to.equal(im3.width);
        expect(im.height).to.equal(im3.height);

        expect(im.deviate()).to.be.below(im3.deviate());
    });

    it('histMatch', function () {
        const im = vips.Image.identity();
        const im2 = vips.Image.identity();

        const matched = im.histMatch(im2);

        expect(im.subtract(matched).abs().max()).to.equal(0.0);
    });

    it('histNorm', function () {
        const im = vips.Image.identity();
        const im2 = im.histNorm();

        expect(im.subtract(im2).abs().max()).to.equal(0.0);
    });

    it('histPlot', function () {
        const im = vips.Image.identity();
        const im2 = im.histPlot();

        expect(im2.width).to.equal(256);
        expect(im2.height).to.equal(256);
        expect(im2.format).to.equal('uchar');
        expect(im2.bands).to.equal(1);
    });

    it('histMap', function () {
        const im = vips.Image.identity();
        const im2 = im.maplut(im);

        expect(im.subtract(im2).abs().max()).to.equal(0.0);
    });

    it('percent', function () {
        const im = vips.Image.newFromFile(Helpers.JPEG_FILE).extractBand(1);

        const pc = im.percent(90);

        const msk = im.lessEq(pc);
        const n_set = (msk.avg() * msk.width * msk.height) / 255.0;
        const pc_set = 100 * n_set / (msk.width * msk.height);

        expect(pc_set).to.be.closeTo(/*90*/91, /*0.5*/0.6);
    });

    it('histEntropy', function () {
        const im = vips.Image.newFromFile(Helpers.JPEG_FILE).extractBand(1);

        const ent = im.histFind().histEntropy();

        expect(ent).to.be.closeTo(/*6.67*/6.63, 0.01);
    });

    it('stdif', function () {
        const im = vips.Image.newFromFile(Helpers.JPEG_FILE);

        const im2 = im.stdif(10, 10);

        expect(im.width).to.equal(im2.width);
        expect(im.height).to.equal(im2.height);

        expect(Math.abs(im.avg() - 128)).to.be.above(Math.abs(im2.avg() - 128));
    });

    it('case', function () {
        // slice into two at 128, we should get 50% of pixels in each half
        const x = vips.Image.grey(256, 256, {
            uchar: true
        });
        let index = vips.Image.switch([x.less(128), x.moreEq(128)]);

        const y = index.case([10, 20]);
        expect(y.avg()).to.equal(15);

        // slice into four
        index = vips.Image.switch([
            x.less(64),
            x.moreEq(64).and(x.less(128)),
            x.moreEq(128).and(x.less(192)),
            x.moreEq(192)
        ]);
        expect(index.case([10, 20, 30, 40]).avg()).to.equal(25);

        // values over N should use the last value
        expect(index.case([10, 20, 30]).avg()).to.equal(22.5);
    });
});
