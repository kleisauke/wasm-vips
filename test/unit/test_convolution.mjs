'use strict';

import * as Helpers from './helpers.mjs';

describe('convolution', () => {
    let globalDeletionQueue;

    let colour;
    let mono;
    let all_images;
    let sharp;
    let blur;
    let line;
    let sobel;
    let all_masks;

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
        all_images = [mono, colour];
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
        all_masks = [sharp, blur, line, sobel];

        globalDeletionQueue = vips.deletionQueue.splice(0);
    });

    after(function () {
        while (globalDeletionQueue.length) {
            const obj = globalDeletionQueue.pop();
            obj.$$.deleteScheduled = false;
            obj.delete();
        }
    });

    afterEach(function () {
        cleanup();
    });

    // point convolution
    function conv(image, mask, x_position, y_position) {
        let s = 0.0;
        for (let x = 0; x < mask.width; x++) {
            for (let y = 0; y < mask.height; y++) {
                const m = mask.getpoint(x, y);
                const i = image.getpoint(x + x_position, y + y_position);
                const p = Helpers.run_fn2((a, b) => a * b, m, i);
                s = Helpers.run_fn2((a, b) => a + b, s, p);
            }
        }

        return Helpers.run_fn2((a, b) => a / b, s, mask.getDouble('scale'));
    }

    function compass(image, mask, x_position, y_position, n_rot, fn) {
        let acc = [];

        for (let i = 0; i < n_rot; i++) {
            let result = conv(image, mask, x_position, y_position);
            result = Helpers.run_fn(Math.abs, result);
            acc.push(result);
            mask = mask.rot45();
        }

        return acc.reduce((a, b) => Helpers.run_fn2(fn, a, b));
    }

    it('conv', function () {
        for (const im of all_images) {
            for (const msk of all_masks) {
                for (const prec of [vips.Precision.integer, vips.Precision.float]) {
                    const convolved = im.conv(msk, {
                        precision: prec
                    });

                    let result = convolved.getpoint(25, 50);
                    let predict = conv(im, msk, 24, 49);
                    Helpers.assert_almost_equal_objects(result, predict);

                    result = convolved.getpoint(50, 50);
                    predict = conv(im, msk, 49, 49);
                    Helpers.assert_almost_equal_objects(result, predict);
                }
            }
        }
    });

    it('conva', function () {
        // don't test conva, it's still not done
        return this.skip();

        for (const im of all_images) {
            for (const msk of all_masks) {
                console.log('msk:');
                msk.matrixprint();

                console.log(`im.bands = ${im.bands}`);

                const convolved = im.conv(msk, {
                    precision: 'approximate'
                });

                let result = convolved.getpoint(25, 50);
                let predict = conv(im, msk, 24, 49);
                console.log(`result = ${result}, predict = ${predict}`);
                Helpers.assert_less_threshold(result, predict, 5);

                result = convolved.getpoint(50, 50);
                predict = conv(im, msk, 49, 49);
                console.log(`result = ${result}, predict = ${predict}`);
                Helpers.assert_less_threshold(result, predict, 5);
            }
        }
    });

    it('compass', function () {
        for (const im of all_images) {
            for (const msk of all_masks) {
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
                        Helpers.assert_almost_equal_objects(result, predict);
                    }
                }
            }
        }

        for (const im of all_images) {
            for (const msk of all_masks) {
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
                        Helpers.assert_almost_equal_objects(result, predict);
                    }
                }
            }
        }
    });

    it('convsep', function () {
        for (const im of all_images) {
            for (const msk of all_masks) {
                for (const prec of [vips.Precision.integer, vips.Precision.float]) {
                    const gmask = vips.Image.gaussmat(2, 0.1, {
                        precision: prec
                    });
                    const gmask_sep = vips.Image.gaussmat(2, 0.1, {
                        separable: true,
                        precision: prec
                    });

                    expect(gmask.width).to.equal(gmask.height);
                    expect(gmask_sep.width).to.equal(gmask.width);
                    expect(gmask_sep.height).to.equal(1);

                    const a = im.conv(gmask, {
                        precision: prec
                    });
                    const b = im.convsep(gmask_sep, {
                        precision: prec
                    });

                    const a_point = a.getpoint(25, 50);
                    const b_point = b.getpoint(25, 50);

                    Helpers.assert_almost_equal_objects(a_point, b_point, 0.1);
                }
            }
        }
    });

    it('fastcor', function () {
        for (const im of all_images) {
            for (const fmt of Helpers.noncomplex_formats) {
                const small = im.crop(20, 45, 10, 10).cast(fmt);
                const cor = im.fastcor(small);

                let minPos = {
                    x: true,
                    y: true,
                };
                let v = cor.min(minPos);
                let x = minPos.x;
                let y = minPos.y;

                expect(v).to.equal(0);
                expect(x).to.equal(25);
                expect(y).to.equal(50);
            }
        }
    });

    it('spcor', function () {
        for (const im of all_images) {
            for (const fmt of Helpers.noncomplex_formats) {
                const small = im.crop(20, 45, 10, 10).cast(fmt);
                const cor = im.spcor(small);

                let maxPos = {
                    x: true,
                    y: true,
                };
                let v = cor.max(maxPos);
                let x = maxPos.x;
                let y = maxPos.y;

                expect(v).to.equal(1.0);
                expect(x).to.equal(25);
                expect(y).to.equal(50);
            }
        }
    });

    it('gaussblur', function () {
        for (const im of all_images) {
            for (const msk of all_masks) {
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

                        const a_point = a.getpoint(25, 50);
                        const b_point = b.getpoint(25, 50);

                        Helpers.assert_almost_equal_objects(a_point, b_point, 0.1);
                    }
                }
            }
        }
    });

    it('sharpen', function () {
        for (const im of all_images) {
            for (const fmt of Helpers.noncomplex_formats) {
                // old vipses used "radius", check that that still works
                sharp = im.sharpen({
                    radius: 5
                });

                for (const sigma of [0.5, 1, 1.5, 2]) {
                    const test = im.cast(fmt);
                    let sharp = test.sharpen({
                        sigma: sigma
                    });

                    // hard to test much more than this
                    expect(test.width).to.equal(sharp.width);
                    expect(test.height).to.equal(sharp.height);

                    // if m1 and m2 are zero, sharpen should do nothing
                    sharp = test.sharpen({
                        sigma: sigma,
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
