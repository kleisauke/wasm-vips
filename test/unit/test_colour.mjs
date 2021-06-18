'use strict';

import * as Helpers from './helpers.mjs';

describe('colour', () => {
    afterEach(function () {
        cleanup();
    });

    it('colourspace', function () {
        // mid-grey in Lab ... put 42 in the extra band, it should be copied
        // unmodified
        let test = vips.Image.black(100, 100).add([50, 0, 0, 42]);
        test = test.copy({
            interpretation: vips.Interpretation.lab
        });

        // a long series should come in a circle
        let im = test;
        for (const col of Helpers.colour_colourspaces.concat('lab')) {
            im = im.colourspace(col);
            expect(im.interpretation).to.equal(col);

            for (let i = 0; i < 4; i++) {
                const min_l = im.extractBand(i).min();
                const max_h = im.extractBand(i).max();
                expect(min_l).to.be.closeTo(max_h, 1e-6);
            }

            const pixel = im.getpoint(10, 10);
            expect(pixel[3]).to.be.closeTo(42, 0.01);
        }

        // alpha won't be equal for RGB16, but it should be preserved if we go
        // there and back
        im = im.colourspace(vips.Interpretation.rgb16);
        im = im.colourspace(vips.Interpretation.lab);

        let before = test.getpoint(10, 10);
        let after = im.getpoint(10, 10);
        Helpers.assert_almost_equal_objects(before, after, 0.1);

        // go between every pair of colour spaces
        for (const start of Helpers.colour_colourspaces) {
            for (const end of Helpers.colour_colourspaces) {
                im = test.colourspace(start);
                const im2 = im.colourspace(end);
                const im3 = im2.colourspace(vips.Interpretation.lab);

                before = test.getpoint(10, 10);
                after = im3.getpoint(10, 10);

                Helpers.assert_almost_equal_objects(before, after, 0.1);
            }
        }

        // test Lab->XYZ on mid-grey
        // checked against http://www.brucelindbloom.com
        im = test.colourspace(vips.Interpretation.xyz);
        after = im.getpoint(10, 10);
        Helpers.assert_almost_equal_objects(after, [17.5064, 18.4187, 20.0547, 42]);

        // grey->colour->grey should be equal
        for (const mono_fmt of Helpers.mono_colourspaces) {
            const test_grey = test.colourspace(mono_fmt);
            im = test_grey;
            for (const col of Helpers.colour_colourspaces.concat([mono_fmt])) {
                im = im.colourspace(col);
                expect(im.interpretation).to.equal(col);
            }
            let pixel = test_grey.getpoint(10, 10);
            before = pixel[0];
            const alpha_before = pixel[1];
            pixel = im.getpoint(10, 10);
            after = pixel[0];
            const alpha_after = pixel[1];
            expect(Math.abs(alpha_after - alpha_before)).to.be.below(1);

            // GREY16 can wind up rather different due to rounding
            // but 8-bit we should hit exactly
            expect(Math.abs(after - before)).to.be.below(mono_fmt === 'grey16' ? 30 : 1);
        }

        // we should be able to go from cmyk to any 3-band space and back again,
        // approximately
        const cmyk = test.colourspace(vips.Interpretation.cmyk);
        for (const end of Helpers.colour_colourspaces) {
            im = cmyk.colourspace(end);
            const im2 = im.colourspace(vips.Interpretation.cmyk);

            before = cmyk.getpoint(10, 10);
            after = im2.getpoint(10, 10);

            Helpers.assert_almost_equal_objects(before, after, 10);
        }
    });

    // test results from Bruce Lindbloom's calculator:
    // http://www.brucelindbloom.com
    it('dE00', function () {
        // put 42 in the extra band, it should be copied unmodified
        let reference = vips.Image.black(100, 100).add([50, 10, 20, 42]);
        reference = reference.copy({
            interpretation: vips.Interpretation.lab
        });
        let sample = vips.Image.black(100, 100).add([40, -20, 10]);
        sample = sample.copy({
            interpretation: vips.Interpretation.lab
        });

        const difference = reference.dE00(sample);
        const pixel = difference.getpoint(10, 10);
        const result = pixel[0];
        const alpha = pixel[1];
        expect(result).to.be.closeTo(30.238, 0.001);
        expect(alpha).to.be.closeTo(42.0, 0.001);
    });

    it('dE76', function () {
        // put 42 in the extra band, it should be copied unmodified
        let reference = vips.Image.black(100, 100).add([50, 10, 20, 42]);
        reference = reference.copy({
            interpretation: vips.Interpretation.lab
        });
        let sample = vips.Image.black(100, 100).add([40, -20, 10]);
        sample = sample.copy({
            interpretation: vips.Interpretation.lab
        });

        const difference = reference.dE76(sample);
        const pixel = difference.getpoint(10, 10);
        const result = pixel[0];
        const alpha = pixel[1];
        expect(result).to.be.closeTo(33.166, 0.001);
        expect(alpha).to.be.closeTo(42.0, 0.001);
    });

    // the vips CMC calculation is based on distance in a colorspace
    // derived from the CMC formula, so it won't match exactly ...
    // see vips_LCh2CMC() for details
    it('dECMC', function () {
        let reference = vips.Image.black(100, 100).add([50, 10, 20, 42]);
        reference = reference.copy({
            interpretation: vips.Interpretation.lab
        });
        let sample = vips.Image.black(100, 100).add([55, 11, 23]);
        sample = sample.copy({
            interpretation: vips.Interpretation.lab
        });

        const difference = reference.dECMC(sample);
        const pixel = difference.getpoint(10, 10);
        const result = pixel[0];
        const alpha = pixel[1];
        expect(Math.abs(result - 4.97)).to.be.below(0.5);
        expect(alpha).to.be.closeTo(42.0, 0.001);
    });

    it('icc', function () {
        if (!Helpers.have('icc_import')) {
            return this.skip();
        }

        const test = vips.Image.newFromFile(Helpers.JPEG_FILE);

        let im = test.iccImport().iccExport();
        expect(im.dE76(test).max()).to.be.below(6);

        im = test.iccImport();
        let im2 = im.iccExport({
            depth: 16
        });
        expect(im2.format).to.equal('ushort');
        let im3 = im2.iccImport();
        expect(im.subtract(im3).abs().max()).to.be.below(3);

        im = test.iccImport({
            intent: vips.Intent.absolute
        });
        im2 = im.iccExport({
            intent: vips.Intent.absolute
        });
        expect(im2.dE76(test).max()).to.be.below(6);

        const before_profile = test.getBlob('icc-profile-data');
        im = test.iccTransform(Helpers.SRGB_FILE);
        const after_profile = im.getBlob('icc-profile-data');
        im2 = test.iccImport();
        im3 = im2.colourspace(vips.Interpretation.srgb);
        expect(im.dE76(im3).max()).to.be.below(6);
        expect(before_profile.byteLength).to.not.equal(after_profile.byteLength);

        im = test.iccImport({
            input_profile: Helpers.SRGB_FILE
        });
        im2 = test.iccImport();
        expect(im.dE76(im2).max()).to.be.above(6);

        im = test.iccImport({
            pcs: vips.PCS.xyz
        });
        expect(im.interpretation).to.equal('xyz');

        im = test.iccImport();
        expect(im.interpretation).to.equal('lab');
    });

    // even without lcms, we should have a working approximation
    it('cmyk', function () {
        const test = vips.Image.newFromFile(Helpers.JPEG_FILE);

        const im = test.colourspace('cmyk').colourspace('srgb');
        const before = test.getpoint(150, 210);
        const after = im.getpoint(150, 210);

        Helpers.assert_almost_equal_objects(before, after, 10);
    });
});
