'use strict';

describe('resample', () => {
    afterEach(function () {
        cleanup();
    });

    // Run a function expecting a complex image on a two-band image
    function run_cmplx(fn, image) {
        let new_format;

        if (image.format === 'float') {
            new_format = 'complex';
        } else if (image.format === 'double') {
            new_format = 'dpcomplex'
        } else {
            throw new Error('run_cmplx: not float or double');
        }

        // tag as complex, run, revert tagging
        const cmplx = image.copy({
            bands: 1,
            format: new_format
        });
        const cmplx_result = fn(cmplx);

        return cmplx_result.copy({
            bands: 2,
            format: image.format
        });
    }

    // Transform image coordinates to polar.
    //
    // The image is transformed so that it is wrapped around a point in the
    // centre. Vertical straight lines become circles or segments of circles,
    // horizontal straight lines become radial spokes.
    function to_polar(image) {
        // xy image, zero in the centre, scaled to fit image to a circle
        let xy = vips.Image.xyz(image.width, image.height);
        xy = xy.subtract([image.width / 2.0, image.height / 2.0]);
        const scale = Math.min(image.width, image.height) / image.width;
        xy = xy.multiply(2.0 / scale);

        // to polar, scale vertical axis to 360 degrees
        let index = run_cmplx((x) => x.polar(), xy);
        index = index.multiply([1, image.height / 360.0]);

        return image.mapim(index);
    }

    // Transform image coordinates to rectangular.
    //
    // The image is transformed so that it is unwrapped from a point in the
    // centre. Circles or segments of circles become vertical straight lines,
    // radial lines become horizontal lines.
    function to_rectangular(image) {
        // xy image, vertical scaled to 360 degrees
        let xy = vips.Image.xyz(image.width, image.height);
        xy = xy.multiply([1, 360.0 / image.height]);

        // to rect, scale to image rect
        let index = run_cmplx((x) => x.rect(), xy);
        const scale = Math.min(image.width, image.height) / image.width;
        index = index.multiply(scale / 2.0);
        index = index.add([image.width / 2.0, image.height / 2.0]);

        return image.mapim(index);
    }

    it('affine', function () {
        const im = vips.Image.newFromFile(Helpers.JPEG_FILE);

        // vsqbs is non-interpolatory, don't test this way
        for (const name of ['nearest', 'bicubic', 'bilinear', 'nohalo', 'lbb']) {
            let x = im;
            const interpolate = vips.Interpolate.newFromName(name);
            for (let i = 0; i < 4; i++) {
                x = x.affine([0, 1, 1, 0], {
                    interpolate: interpolate
                });
            }

            expect(x.subtract(im).abs().max()).to.equal(0);
        }
    });

    it('reduce', function () {
        let im = vips.Image.newFromFile(Helpers.JPEG_FILE);
        // cast down to 0-127, the smallest range, so we aren't messed up by
        // clipping
        im = im.cast('char');

        for (const fac of [1, 1.1, 1.5, 1.999]) {
            for (const fmt of Helpers.all_formats) {
                for (const kernel of ['nearest', 'linear', 'cubic', 'lanczos2', 'lanczos3']) {
                    const x = im.cast(fmt);
                    const r = x.reduce(fac, fac, {
                        kernel: kernel
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
                //console.log(`testing kernel = ${kernel}`)
                //console.log(`testing const = ${constant}`)

                const shr = im.reduce(2, 2, {
                    kernel: kernel
                });
                const d = Math.abs(shr.avg() - im.avg());
                expect(d).to.equal(0);
            }
        }
    });

    it('resize', function () {
        let im = vips.Image.newFromFile(Helpers.JPEG_FILE);
        const im2 = im.resize(0.25);

        expect(im2.width).to.equal(Math.round(im.width / 4.0));
        expect(im2.height).to.equal(Math.round(im.height / 4.0));

        // test geometry rounding corner case
        im = vips.Image.black(100, 1);
        const x = im.resize(0.5);

        expect(x.width).to.equal(50);
        expect(x.height).to.equal(1);
    });

    it('shrink', function () {
        const im = vips.Image.newFromFile(Helpers.JPEG_FILE);
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
        if (!Helpers.have('thumbnail')) {
            return this.skip();
        }

        let im = vips.Image.thumbnail(Helpers.JPEG_FILE, 100);

        expect(im.height).to.equal(100);
        expect(im.bands).to.equal(3);

        // the average shouldn't move too much
        const im_orig = vips.Image.newFromFile(Helpers.JPEG_FILE);
        expect(Math.abs(im_orig.avg() - im.avg())).to.be.below(1);

        // make sure we always get the right height
        for (let height = 440; height >= 1; height -= 13) {
            const im = vips.Image.thumbnail(Helpers.JPEG_FILE, height);

            expect(im.height).to.equal(height);
        }

        // should fit one of width or height
        im = vips.Image.thumbnail(Helpers.JPEG_FILE, 100, {
            height: 300
        });
        expect(im.width).to.equal(100);
        expect(im.height).to.not.equal(300);

        im = vips.Image.thumbnail(Helpers.JPEG_FILE, 300, {
            height: 100
        });
        expect(im.width).to.not.equal(300);
        expect(im.height).to.equal(100);

        // with @crop, should fit both width and height
        im = vips.Image.thumbnail(Helpers.JPEG_FILE, 100, {
            height: 300,
            crop: 'centre'
        });
        expect(im.width).to.equal(100);
        expect(im.height).to.equal(300);

        let im1 = vips.Image.thumbnail(Helpers.JPEG_FILE, 100);
        const buf = vips.FS.readFile(Helpers.JPEG_FILE);
        let im2 = vips.Image.thumbnailBuffer(buf, 100);
        expect(Math.abs(im1.avg() - im2.avg())).to.be.below(1);

        // should be able to thumbnail many-page tiff
        im = vips.Image.thumbnail(Helpers.OME_FILE, 100)
        expect(im.width).to.equal(100);
        expect(im.height).to.equal(38);

        // should be able to thumbnail individual pages from many-page tiff
        im1 = vips.Image.thumbnail(Helpers.OME_FILE + '[page=0]', 100)
        expect(im.width).to.equal(100);
        expect(im.height).to.equal(38);
        im2 = vips.Image.thumbnail(Helpers.OME_FILE + '[page=1]', 100)
        expect(im.width).to.equal(100);
        expect(im.height).to.equal(38);
        expect(im1.subtract(im2).abs().max()).to.not.equal(0);

        // should be able to thumbnail entire many-page tiff as a toilet-roll
        // image
        im = vips.Image.thumbnail(Helpers.OME_FILE + '[n=-1]', 100)
        expect(im.width).to.equal(100);
        expect(im.height).to.equal(570);
    });

    it('similarity', function () {
        const im = vips.Image.newFromFile(Helpers.JPEG_FILE);
        const im2 = im.similarity({
            angle: 90
        });
        const im3 = im.affine([0, -1, 1, 0]);

        // rounding in calculating the affine transform from the angle stops
        // this being exactly true
        expect(im2.subtract(im3).abs().max()).to.be.below(50);
    });

    it('similarity scale', function () {
        const im = vips.Image.newFromFile(Helpers.JPEG_FILE);
        const im2 = im.similarity({
            scale: 2
        });
        const im3 = im.affine([2, 0, 0, 2]);

        expect(im2.subtract(im3).abs().max()).to.equal(0);
    });

    it('rotate', function () {
        // added in 8.7
        if (!Helpers.have('rotate')) {
            return this.skip();
        }

        const im = vips.Image.newFromFile(Helpers.JPEG_FILE);
        const im2 = im.rotate(90);
        const im3 = im.affine([0, -1, 1, 0]);

        // rounding in calculating the affine transform from the angle stops
        // this being exactly true
        expect(im2.subtract(im3).abs().max()).to.be.below(50);
    });

    it('mapim', function () {
        let im = vips.Image.newFromFile(Helpers.JPEG_FILE);

        const p = to_polar(im);
        const r = to_rectangular(p);

        // the left edge (which is squashed to the origin) will be badly
        // distorted, but the rest should not be too bad
        const a = r.crop(50, 0, im.width - 50, im.height).gaussblur(2);
        const b = im.crop(50, 0, im.width - 50, im.height).gaussblur(2);
        expect(a.subtract(b).abs().max()).to.be.below(40);

        // this was a bug at one point, strangely, if executed with debug
        // enabled
        const mp = vips.Image.xyz(im.width, im.height);
        const interp = vips.Interpolate.newFromName('bicubic');
        expect(im.mapim(mp, {interpolate: interp}).avg()).to.equal(im.avg());
    });
});
