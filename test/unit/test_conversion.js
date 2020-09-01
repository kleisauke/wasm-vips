'use strict';

describe('conversion', () => {
    let globalDeletionQueue;

    let colour;
    let mono;
    let all_images;
    let image;

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
        image = vips.Image.jpegload(Helpers.JPEG_FILE);

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

    // run a function on a pair of images
    // 50,50 and 10,10 should have different values on the test image
    // don't loop over band elements
    function run_image_pixels2(message, left, right, fn) {
        Helpers.run_cmp2(message, left, right, 50, 50, fn);
        Helpers.run_cmp2(message, left, right, 10, 10, fn);
    }

    function run_unary(images, fn, fmt = Helpers.all_formats) {
        images.forEach(x => fmt.forEach(y =>
            Helpers.run_image(`${fn.name} ${y}`, x.cast(y), fn)
        ));
    }

    function run_binary(images, fn, fmt = Helpers.all_formats) {
        images.forEach(x => fmt.forEach(y => fmt.forEach(z =>
            run_image_pixels2(`${fn.name} ${y} ${z}`, x.cast(y), x.cast(z), fn)
        )));
    }

    it('bandand', function () {
        const bandand = (x) => x instanceof vips.Image ? x.bandand() : x.reduce((a, b) => a & b);

        run_unary(all_images, bandand, Helpers.int_formats);
    });

    it('bandor', function () {
        const bandor = (x) => x instanceof vips.Image ? x.bandor() : x.reduce((a, b) => a | b);

        run_unary(all_images, bandor, Helpers.int_formats);
    });

    it('bandeor', function () {
        const bandeor = (x) => x instanceof vips.Image ? x.bandeor() : x.reduce((a, b) => a ^ b);

        run_unary(all_images, bandeor, Helpers.int_formats);
    });

    it('bandjoin', function () {
        const bandjoin = (x, y) => x instanceof vips.Image && y instanceof vips.Image ? x.bandjoin(y) : x.concat(y);

        run_binary(all_images, bandjoin);
    });

    it('bandjoinConst', function () {
        let x = colour.bandjoin(1);
        expect(x.bands).to.equal(4);
        expect(x.extractBand(3).avg()).to.equal(1);

        x = colour.bandjoin([1, 2]);
        expect(x.bands).to.equal(5);
        expect(x.extractBand(3).avg()).to.equal(1);
        expect(x.extractBand(4).avg()).to.equal(2);
    });

    it('bandmean', function () {
        const bandmean = (x) => x instanceof vips.Image ? x.bandmean()
            : Math.floor(x.reduce((a, b) => a + b) / x.length);

        run_unary(all_images, bandmean, Helpers.noncomplex_formats);
    });

    it('bandrank', function () {
        const median = (x, y) => Helpers.zip(x, y).map(z => z.sort()[Math.floor(z.length / 2)]);
        const bandrank = (x, y) => x instanceof vips.Image && y instanceof vips.Image ? x.bandrank([y]) : median(x, y);

        run_binary(all_images, bandrank, Helpers.noncomplex_formats);

        // we can mix images and constants, and set the index arg
        const a = mono.bandrank([2], {
            index: 0
        });
        const b = mono.less(2).ifthenelse(mono, 2);

        expect(a.subtract(b).abs().min()).to.equal(0);
    });

    it('cache', function () {
        const cache = (x) => x instanceof vips.Image ? x.cache() : x;

        run_unary(all_images, cache);
    });

    it('copy', function () {
        let x = colour.copy({interpretation: 'lab'});
        expect(x.interpretation).to.equal('lab');
        x = colour.copy({xres: 42});
        expect(x.xres).to.equal(42);
        x = colour.copy({yres: 42});
        expect(x.yres).to.equal(42);
        x = colour.copy({xoffset: 42});
        expect(x.xoffset).to.equal(42);
        x = colour.copy({yoffset: 42});
        expect(x.yoffset).to.equal(42);
        x = colour.copy({coding: 'none'});
        expect(x.coding).to.equal('none');
    });

    it('bandfold', function () {
        let x = mono.bandfold();
        expect(x.width).to.equal(1);
        expect(x.bands).to.equal(mono.width);

        let y = x.bandunfold();
        expect(y.width).to.equal(mono.width);
        expect(y.bands).to.equal(1);
        expect(y.avg()).to.equal(mono.avg());

        x = mono.bandfold({factor: 2});
        expect(x.width).to.equal(mono.width / 2);
        expect(x.bands).to.equal(2);

        y = x.bandunfold({factor: 2});
        expect(y.width).to.equal(mono.width);
        expect(y.bands).to.equal(1);
        expect(y.avg()).to.equal(mono.avg());
    });

    it('byteswap', function () {
        const x = mono.cast('ushort');
        const y = x.byteswap().byteswap();
        expect(x.width).to.equal(y.width);
        expect(x.height).to.equal(y.height);
        expect(x.bands).to.equal(y.bands);
        expect(x.avg()).to.equal(y.avg());
    });

    it('embed', function () {
        for (const fmt of Helpers.all_formats) {
            const test = colour.cast(fmt);

            let im = test.embed(20, 20,
                colour.width + 40, colour.height + 40);

            let pixel = im.getpoint(10, 10);
            Helpers.assert_almost_equal_objects(pixel, [0, 0, 0]);
            pixel = im.getpoint(30, 30);
            Helpers.assert_almost_equal_objects(pixel, [2, 3, 4]);
            pixel = im.getpoint(im.width - 10, im.height - 10);
            Helpers.assert_almost_equal_objects(pixel, [0, 0, 0]);

            im = test.embed(20, 20, colour.width + 40, colour.height + 40, {
                extend: 'copy'
            });

            pixel = im.getpoint(10, 10);
            Helpers.assert_almost_equal_objects(pixel, [2, 3, 4]);
            pixel = im.getpoint(im.width - 10, im.height - 10);
            Helpers.assert_almost_equal_objects(pixel, [2, 3, 4]);

            im = test.embed(20, 20, colour.width + 40, colour.height + 40, {
                extend: 'background',
                background: [7, 8, 9]
            });

            pixel = im.getpoint(10, 10);
            Helpers.assert_almost_equal_objects(pixel, [7, 8, 9]);
            pixel = im.getpoint(im.width - 10, im.height - 10);
            Helpers.assert_almost_equal_objects(pixel, [7, 8, 9]);

            im = test.embed(20, 20, colour.width + 40, colour.height + 40, {
                extend: 'white'
            });

            pixel = im.getpoint(10, 10);
            // uses 255 in all bytes of ints, 255.0 for float
            pixel = pixel.map(x => x & 0xff);
            Helpers.assert_almost_equal_objects(pixel, [255, 255, 255]);
            pixel = im.getpoint(im.width - 10, im.height - 10);
            pixel = pixel.map(x => x & 0xff);
            Helpers.assert_almost_equal_objects(pixel, [255, 255, 255]);
        }
    });

    it('gravity', function () {
        const im = vips.Image.black(1, 1).add(255);

        const positions = {
            'centre': [1, 1],
            'north': [1, 0],
            'south': [1, 2],
            'east': [2, 1],
            'west': [0, 1],
            'north-east': [2, 0],
            'south-east': [2, 2],
            'south-west': [0, 2],
            'north-west': [0, 0]
        };

        for (const direction in positions) {
            const im2 = im.gravity(direction, 3, 3);
            Helpers.assert_almost_equal_objects(im2.getpoint(...positions[direction]), [255]);
            Helpers.assert_almost_equal_objects(im2.avg(), 255.0 / 9.0);
        }
    });

    it('extract', function () {
        for (const fmt of Helpers.all_formats) {
            const test = colour.cast(fmt);

            let pixel = test.getpoint(30, 30);
            Helpers.assert_almost_equal_objects(pixel, [2, 3, 4]);

            let sub = test.extractArea(25, 25, 10, 10);

            pixel = sub.getpoint(5, 5);
            Helpers.assert_almost_equal_objects(pixel, [2, 3, 4]);

            sub = test.extractBand(1, {
                n: 2
            });

            pixel = sub.getpoint(30, 30);
            Helpers.assert_almost_equal_objects(pixel, [3, 4]);
        }
    });

    it('slice', function () {
        const test = colour;
        const split = test.bandsplit();
        const bands = new Array(split.size()).fill(0).map((_, i) => split.get(i).avg());
        const average = arr => arr.reduce((p, c) => p + c, 0) / arr.length;

        let x = test.extractBand(0).avg();
        expect(x).to.equal(bands[0]);

        // [-1]
        x = test.extractBand(test.bands - 1).avg();
        expect(x).to.equal(bands[test.bands - 1]);

        // [1:3]
        x = test.extractBand(1, {
            n: 2
        }).avg();
        expect(x).to.equal(average(bands.slice(1, 3)));

        // [1:-1]
        x = test.extractBand(1, {
            n: test.bands - 2
        }).avg();
        expect(x).to.equal(average(bands.slice(1, -1)));

        // [:2]
        x = test.extractBand(0, {
            n: 2
        }).avg();
        expect(x).to.equal(average(bands.slice(0, 2)));

        // [1:]
        x = test.extractBand(1, {
            n: test.bands - 1
        }).avg();
        expect(x).to.equal(average(bands.slice(1)));

        // [-1]
        x = test.extractBand(test.bands - 1).avg();
        expect(x).to.equal(bands[test.bands - 1]);
    });

    it('crop', function () {
        for (const fmt of Helpers.all_formats) {
            const test = colour.cast(fmt);

            let pixel = test.getpoint(30, 30);
            Helpers.assert_almost_equal_objects(pixel, [2, 3, 4]);

            let sub = test.crop(25, 25, 10, 10);

            pixel = sub.getpoint(5, 5);
            Helpers.assert_almost_equal_objects(pixel, [2, 3, 4]);
        }
    });

    it('smartcrop', function () {
        const test = image.smartcrop(100, 100);
        expect(test.width).to.equal(100);
        expect(test.height).to.equal(100);
    });

    it('falsecolour', function () {
        for (const fmt of Helpers.all_formats) {
            const test = colour.cast(fmt);

            const im = test.falsecolour();
            expect(im.width).to.equal(test.width);
            expect(im.height).to.equal(test.width);
            expect(im.bands).to.equal(3);

            const pixel = im.getpoint(30, 30);
            Helpers.assert_almost_equal_objects(pixel, [20, 0, 41]);
        }
    });

    it('flatten', function () {
        for (const fmt of Helpers.unsigned_formats.concat(['short', 'int']).concat(Helpers.float_formats)) {
            const mx = 255;
            const alpha = mx / 2.0;
            const nalpha = mx - alpha;
            const test = colour.bandjoin(alpha).cast(fmt);

            let pixel = test.getpoint(30, 30);

            let predict = pixel
                .slice(0, -1)
                .map(x => (x | 0) * alpha / mx);

            let im = test.flatten();

            expect(im.bands).to.equal(3);
            pixel = im.getpoint(30, 30);
            for (const xy of Helpers.zip(pixel, predict))
                // we use float arithmetic for int and uint, so the rounding
                // differs ... don't require huge accuracy
                expect(Math.abs(xy[0] - xy[1])).to.be.below(2);

            im = test.flatten({background: [100, 100, 100]});

            pixel = test.getpoint(30, 30);
            predict = pixel
                .slice(0, -1)
                .map(x => (x | 0) * alpha / mx + (100 * nalpha) / mx);

            expect(im.bands).to.equal(3);
            pixel = im.getpoint(30, 30);
            for (const xy of Helpers.zip(pixel, predict))
                expect(Math.abs(xy[0] - xy[1])).to.be.below(2);
        }
    });

    it('premultiply', function () {
        for (const fmt of Helpers.unsigned_formats.concat(['short', 'int']).concat(Helpers.float_formats)) {
            const mx = 255;
            const alpha = mx / 2.0;
            const test = colour.bandjoin(alpha).cast(fmt);
            let pixel = test.getpoint(30, 30);

            let predict = pixel
                .slice(0, -1)
                .map(x => (x | 0) * alpha / mx)
                .concat([alpha]);

            let im = test.premultiply();

            expect(im.bands).to.equal(test.bands);
            pixel = im.getpoint(30, 30);
            for (const xy of Helpers.zip(pixel, predict))
                // we use float arithmetic for int and uint, so the rounding
                // differs ... don't require huge accuracy
                expect(Math.abs(xy[0] - xy[1])).to.be.below(2);
        }
    });

    it('composite', function () {
        // 50% transparent image
        const overlay = colour.bandjoin(128);
        const base = colour.add(100);
        const comp = base.composite(overlay, 'overlay');

        Helpers.assert_almost_equal_objects(comp.getpoint(0, 0), [51.2, 51.9, 52.6, 255], 0.1);
    });

    it('unpremultiply', function () {
        for (const fmt of Helpers.unsigned_formats.concat(['short', 'int']).concat(Helpers.float_formats)) {
            const mx = 255;
            const alpha = mx / 2.0;
            const test = colour.bandjoin(alpha).cast(fmt);
            let pixel = test.getpoint(30, 30);

            let predict = pixel
                .slice(0, -1)
                .map(x => (x | 0) / (alpha / mx))
                .concat([alpha]);

            let im = test.unpremultiply();

            expect(im.bands).to.equal(test.bands);
            pixel = im.getpoint(30, 30);
            for (const xy of Helpers.zip(pixel, predict))
                // we use float arithmetic for int and uint, so the rounding
                // differs ... don't require huge accuracy
                expect(Math.abs(xy[0] - xy[1])).to.be.below(2);
        }
    });

    it('flip', function () {
        for (const fmt of Helpers.all_formats) {
            const test = colour.cast(fmt);

            let result = test.flipHor();
            result = result.flipVer();
            result = result.flipHor();
            result = result.flipVer();

            const diff = test.subtract(result).abs().max();

            expect(diff).to.equal(0);
        }
    });

    it('gamma', function () {
        let exponent = 2.4;

        for (const fmt of Helpers.noncomplex_formats) {
            const mx = Helpers.max_value[fmt];
            const test = colour.add(mx / 2.0).cast(fmt);

            const norm = mx ** exponent / mx;
            const result = test.gamma();
            const before = test.getpoint(30, 30);
            const after = result.getpoint(30, 30);
            const predict = before.map(x => x ** exponent / norm);
            for (const ab of Helpers.zip(after, predict))
                // ie. less than 1% error, rounding on 7-bit image
                // means this is all we can expect
                expect(Math.abs(ab[0] - ab[1])).to.be.below(mx / 100.0);
        }

        exponent = 1.2;
        for (const fmt of Helpers.noncomplex_formats) {
            const mx = Helpers.max_value[fmt];
            const test = colour.add(mx / 2.0).cast(fmt);

            const norm = mx ** exponent / mx;
            const result = test.gamma({
                exponent: 1.0 / exponent,
            });
            const before = test.getpoint(30, 30);
            const after = result.getpoint(30, 30);
            const predict = before.map(x => x ** exponent / norm);
            for (const ab of Helpers.zip(after, predict))
                // ie. less than 1% error, rounding on 7-bit image
                // means this is all we can expect
                expect(Math.abs(ab[0] - ab[1])).to.be.below(mx / 100.0);
        }
    });

    it('grid', function () {
        const test = colour.replicate(1, 12);
        expect(test.width).to.equal(colour.width);
        expect(test.height).to.equal(colour.height * 12);

        for (const fmt of Helpers.all_formats) {
            const im = test.cast(fmt);
            const result = im.grid(test.width, 3, 4);
            expect(result.width).to.equal(colour.width * 3);
            expect(result.height).to.equal(colour.height * 4);

            let before = test.getpoint(10, 10);
            let after = result.getpoint(10 + test.width * 2, 10 + test.width * 2);
            Helpers.assert_almost_equal_objects(before, after);

            before = test.getpoint(50, 50);
            after = result.getpoint(50 + test.width * 2, 50 + test.width * 2);
            Helpers.assert_almost_equal_objects(before, after);
        }
    });

    it('ifthenelse', function () {
        let test = mono.more(3);

        for (const x of Helpers.all_formats) {
            for (const y of Helpers.all_formats) {
                const t = colour.add(10).cast(x);
                const e = colour.cast(y);
                const r = test.ifthenelse(t, e);

                expect(r.width).to.equal(colour.width);
                expect(r.height).to.equal(colour.height);
                expect(r.bands).to.equal(colour.bands);

                let predict = e.getpoint(10, 10);
                let result = r.getpoint(10, 10);
                Helpers.assert_almost_equal_objects(result, predict);

                predict = t.getpoint(50, 50);
                result = r.getpoint(50, 50);
                Helpers.assert_almost_equal_objects(result, predict);
            }
        }

        test = colour.more(3);

        for (const x of Helpers.all_formats) {
            for (const y of Helpers.all_formats) {
                const t = mono.add(10).cast(x);
                const e = mono.cast(y);
                const r = test.ifthenelse(t, e);

                expect(r.width).to.equal(colour.width);
                expect(r.height).to.equal(colour.height);
                expect(r.bands).to.equal(colour.bands);

                let cp = test.getpoint(10, 10);
                let tp = Helpers.make_repeated(t.getpoint(10, 10), 3);
                let ep = Helpers.make_repeated(e.getpoint(10, 10), 3);
                let predict = Helpers.zip(cp, tp, ep).map(x => x[0] !== 0 ? x[1] : x[2]);
                let result = r.getpoint(10, 10);
                Helpers.assert_almost_equal_objects(result, predict);

                cp = test.getpoint(50, 50);
                tp = Helpers.make_repeated(t.getpoint(50, 50), 3);
                ep = Helpers.make_repeated(e.getpoint(50, 50), 3);
                predict = Helpers.zip(cp, tp, ep).map(x => x[0] !== 0 ? x[1] : x[2]);
                result = r.getpoint(50, 50);
                Helpers.assert_almost_equal_objects(result, predict);
            }
        }

        test = colour.more(3);

        for (const x of Helpers.all_formats) {
            for (const y of Helpers.all_formats) {
                const t = mono.add(10).cast(x);
                const e = mono.cast(y);
                const r = test.ifthenelse(t, e, {
                    blend: true
                });

                expect(r.width).to.equal(colour.width);
                expect(r.height).to.equal(colour.height);
                expect(r.bands).to.equal(colour.bands);

                const result = r.getpoint(10, 10);
                Helpers.assert_almost_equal_objects(result, [3, 3, 13]);
            }
        }

        test = mono.more(3);
        let r = test.ifthenelse([1, 2, 3], colour);
        expect(r.width).to.equal(colour.width);
        expect(r.height).to.equal(colour.height);
        expect(r.bands).to.equal(colour.bands);
        expect(r.format).to.equal(colour.format);
        expect(r.interpretation).to.equal(colour.interpretation);

        let result = r.getpoint(10, 10);
        Helpers.assert_almost_equal_objects(result, [2, 3, 4]);

        result = r.getpoint(50, 50);
        Helpers.assert_almost_equal_objects(result, [1, 2, 3]);

        test = mono;
        r = test.ifthenelse([1, 2, 3], colour, {
            blend: true,
        });
        expect(r.width).to.equal(colour.width);
        expect(r.height).to.equal(colour.height);
        expect(r.bands).to.equal(colour.bands);
        expect(r.format).to.equal(colour.format);
        expect(r.interpretation).to.equal(colour.interpretation);

        result = r.getpoint(10, 10);
        Helpers.assert_almost_equal_objects(result, [2, 3, 4], 0.1);

        result = r.getpoint(50, 50);
        Helpers.assert_almost_equal_objects(result, [3.0, 4.9, 6.9], 0.1);
    });

    it('switch', function () {
        const x = vips.Image.grey(256, 256, {
            uchar: true
        });

        // slice into two at 128, we should get 50% of pixels in each half
        let index = vips.Image.switch([x.less(128), x.moreEq(128)]);
        expect(index.avg()).to.equal(0.5);

        // slice into four
        index = vips.Image.switch([
            x.less(64),
            x.moreEq(64).and(x.less(128)),
            x.moreEq(128).and(x.less(192)),
            x.moreEq(192)
        ]);
        expect(index.avg()).to.equal(1.5);

        // no match should return n + 1
        index = vips.Image.switch([x.equal(1000), x.equal(2000)]);
        expect(index.avg()).to.equal(2);
    });

    it('insert', function () {
        for (const x of Helpers.all_formats) {
            for (const y of Helpers.all_formats) {
                const main = mono.cast(x);
                const sub = colour.cast(y);
                const r = main.insert(sub, 10, 10);

                expect(r.width).to.equal(main.width);
                expect(r.height).to.equal(main.height);
                expect(r.bands).to.equal(sub.bands);

                let a = r.getpoint(10, 10);
                let b = Helpers.make_repeated(sub.getpoint(0, 0), 3);
                Helpers.assert_almost_equal_objects(a, b);
            }
        }

        for (const x of Helpers.all_formats) {
            for (const y of Helpers.all_formats) {
                const main = mono.cast(x);
                const sub = colour.cast(y);
                const r = main.insert(sub, 10, 10, {
                    expand: true,
                    background: 100
                });

                expect(r.width).to.equal(main.width + 10);
                expect(r.height).to.equal(main.height + 10);
                expect(r.bands).to.equal(sub.bands);

                let a = r.getpoint(r.width - 5, 5);
                Helpers.assert_almost_equal_objects(a, [100, 100, 100]);
            }
        }
    });

    it('arrayjoin', function () {
        let max_width = 0;
        let max_height = 0;
        let max_bands = 0;

        for (const image of all_images) {
            if (image.width > max_width)
                max_width = image.width;
            if (image.height > max_height)
                max_height = image.height;
            if (image.bands > max_bands)
                max_bands = image.bands;
        }

        let im = vips.Image.arrayjoin(all_images);
        expect(im.width).to.equal(max_width * all_images.length);
        expect(im.height).to.equal(max_height);
        expect(im.bands).to.equal(max_bands);

        im = vips.Image.arrayjoin(all_images, {
            across: 1
        });
        expect(im.width).to.equal(max_width);
        expect(im.height).to.equal(max_height * all_images.length);
        expect(im.bands).to.equal(max_bands);

        im = vips.Image.arrayjoin(all_images, {
            shim: 10
        });
        expect(im.width).to.equal(max_width * all_images.length + 10 * (all_images.length - 1));
        expect(im.height).to.equal(max_height);
        expect(im.bands).to.equal(max_bands);
    });

    it('msb', function () {
        for (const fmt of Helpers.unsigned_formats) {
            const mx = Helpers.max_value[fmt];
            const size = Helpers.sizeof_format[fmt];
            const test = colour.add(mx / 8.0).cast(fmt);
            const im = test.msb();

            let before = test.getpoint(10, 10);
            let predict = before.map(x => (x | 0) >> ((size - 1) * 8));
            let result = im.getpoint(10, 10);
            Helpers.assert_almost_equal_objects(result, predict);

            before = test.getpoint(50, 50);
            predict = before.map(x => (x | 0) >> ((size - 1) * 8));
            result = im.getpoint(50, 50);
            Helpers.assert_almost_equal_objects(result, predict);
        }

        for (const fmt of Helpers.signed_formats) {
            const mx = Helpers.max_value[fmt];
            const size = Helpers.sizeof_format[fmt];
            const test = colour.add(mx / 8.0).cast(fmt);
            const im = test.msb();

            let before = test.getpoint(10, 10);
            let predict = before.map(x => 128 + ((x | 0) >> ((size - 1) * 8)));
            let result = im.getpoint(10, 10);
            Helpers.assert_almost_equal_objects(result, predict);

            before = test.getpoint(50, 50);
            predict = before.map(x => 128 + ((x | 0) >> ((size - 1) * 8)));
            result = im.getpoint(50, 50);
            Helpers.assert_almost_equal_objects(result, predict);
        }

        for (const fmt of Helpers.unsigned_formats) {
            const mx = Helpers.max_value[fmt];
            const size = Helpers.sizeof_format[fmt];
            const test = colour.add(mx / 8.0).cast(fmt);
            const im = test.msb({
                band: 1
            });

            let before = [test.getpoint(10, 10)[1]];
            let predict = before.map(x => (x | 0) >> ((size - 1) * 8));
            let result = im.getpoint(10, 10);
            Helpers.assert_almost_equal_objects(result, predict);

            before = [test.getpoint(50, 50)[1]];
            predict = before.map(x => (x | 0) >> ((size - 1) * 8));
            result = im.getpoint(50, 50);
            Helpers.assert_almost_equal_objects(result, predict);
        }
    });

    it('recomb', function () {
        const array = [[0.2, 0.5, 0.3]];

        const recomb = (x) => {
            if (x instanceof vips.Image) {
                return x.recomb(array);
            } else {
                let sum = 0;
                for (const ic of Helpers.zip(array[0], x))
                    sum += ic[0] * ic[1];

                return [sum];
            }
        };

        run_unary([colour], recomb, Helpers.noncomplex_formats)
    });

    it('replicate', function () {
        for (const fmt of Helpers.all_formats) {
            const im = colour.cast(fmt);

            const test = im.replicate(10, 10);
            expect(test.width).to.equal(colour.width * 10);
            expect(test.height).to.equal(colour.height * 10);

            let before = im.getpoint(10, 10);
            let after = test.getpoint(10 + im.width * 2, 10 + im.width * 2);
            Helpers.assert_almost_equal_objects(before, after);

            before = im.getpoint(50, 50);
            after = test.getpoint(50 + im.width * 2, 50 + im.width * 2);
            Helpers.assert_almost_equal_objects(before, after);
        }
    });

    it('rot45', function () {
        // test has a quarter-circle in the bottom right
        const test = colour.crop(0, 0, 51, 51);
        for (const fmt of Helpers.all_formats) {
            const im = test.cast(fmt);

            let im2 = im.rot45();
            let before = im.getpoint(50, 50);
            let after = im2.getpoint(25, 50);
            Helpers.assert_almost_equal_objects(before, after);

            for (const ab of Helpers.zip(Helpers.rot45_angles, Helpers.rot45_angle_bonds)) {
                const im2 = im.rot45({
                    angle: ab[0]
                });
                const after = im2.rot45({
                    angle: ab[1]
                });
                const diff = after.subtract(im).abs().max();
                expect(diff).to.equal(0);
            }
        }
    });

    it('rot', function () {
        // test has a quarter-circle in the bottom right
        const test = colour.crop(0, 0, 51, 51);
        for (const fmt of Helpers.all_formats) {
            const im = test.cast(fmt);

            let im2 = im.rot(vips.Angle.d90);
            let before = im.getpoint(50, 50);
            let after = im2.getpoint(0, 50);
            Helpers.assert_almost_equal_objects(before, after);

            for (const ab of Helpers.zip(Helpers.rot_angles, Helpers.rot_angle_bonds)) {
                const im2 = im.rot(ab[0]);
                const after = im2.rot(ab[1]);
                const diff = after.subtract(im).abs().max();
                expect(diff).to.equal(0);
            }
        }
    });

    it('scale', function () {
        for (const fmt of Helpers.noncomplex_formats) {
            const test = colour.cast(fmt);

            let im = test.scale();
            expect(im.max()).to.equal(255);
            expect(im.min()).to.equal(0);

            im = test.scale({
                log: true
            });
            expect(im.max()).to.equal(255);
        }
    });

    it('subsample', function () {
        for (const fmt of Helpers.all_formats) {
            const test = colour.cast(fmt);

            const im = test.subsample(3, 3);
            expect(im.width).to.equal(Math.floor(test.width / 3));
            expect(im.height).to.equal(Math.floor(test.height / 3));

            const before = test.getpoint(60, 60);
            const after = im.getpoint(20, 20);
            Helpers.assert_almost_equal_objects(before, after);
        }
    });

    it('zoom', function () {
        for (const fmt of Helpers.all_formats) {
            const test = colour.cast(fmt);

            const im = test.zoom(3, 3);
            expect(im.width).to.equal(test.width * 3);
            expect(im.height).to.equal(test.height * 3);

            const before = test.getpoint(50, 50);
            const after = im.getpoint(150, 150);
            Helpers.assert_almost_equal_objects(before, after);
        }
    });

    it('wrap', function () {
        for (const fmt of Helpers.all_formats) {
            const test = colour.cast(fmt);

            const im = test.wrap();
            expect(im.width).to.equal(test.width);
            expect(im.height).to.equal(test.height);

            let before = test.getpoint(0, 0);
            let after = im.getpoint(50, 50);
            Helpers.assert_almost_equal_objects(before, after);

            before = test.getpoint(50, 50);
            after = im.getpoint(0, 0);
            Helpers.assert_almost_equal_objects(before, after);
        }
    });
});
