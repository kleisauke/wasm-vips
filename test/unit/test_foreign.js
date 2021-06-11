'use strict';

describe('foreign', () => {
    let globalDeletionQueue;

    let colour;
    let mono;
    let rad;
    let cmyk;
    let onebit;

    const fileLoaders = {
        'jpegload': file => vips.Image.jpegload(file),
        'pngload': file => vips.Image.pngload(file),
        'webpload': file => vips.Image.webpload(file),
        'tiffload': file => vips.Image.tiffload(file),
        'analyzeload': file => vips.Image.analyzeload(file),
        'gifload': file => vips.Image.gifload(file),
    };

    const bufferLoaders = {
        'jpegload_buffer': buffer => vips.Image.jpegloadBuffer(buffer),
        'pngload_buffer': buffer => vips.Image.pngloadBuffer(buffer),
        'webpload_buffer': buffer => vips.Image.webploadBuffer(buffer),
        'tiffload_buffer': buffer => vips.Image.tiffloadBuffer(buffer),
        'gifload_buffer': buffer => vips.Image.gifloadBuffer(buffer)
    };

    const bufferSavers = {
        'jpegsave_buffer': (im, opts) => im.jpegsaveBuffer(opts),
        'pngsave_buffer': (im, opts) => im.pngsaveBuffer(opts),
        'tiffsave_buffer': (im, opts) => im.tiffsaveBuffer(opts),
        'webpsave_buffer': (im, opts) => im.webpsaveBuffer(opts),
        'radsave_buffer': (im, opts) => im.radsaveBuffer(opts),
    };

    before(function () {
        colour = vips.Image.jpegload(Helpers.JPEG_FILE);
        mono = colour.extractBand(1).copy();
        // we remove the ICC profile: the RGB one will no longer be appropriate
        mono.remove('icc-profile-data');
        rad = colour.float2rad().copy();
        rad.remove('icc-profile-data');
        cmyk = colour.bandjoin(mono);
        cmyk = cmyk.copy({interpretation: vips.Interpretation.cmyk});
        cmyk.remove('icc-profile-data');

        const im = vips.Image.newFromFile(Helpers.GIF_FILE);
        onebit = im.extractBand(1).more(128);

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

    // we have test files for formats which have a clear standard
    function file_loader(loader, test_file, validate) {
        let im = fileLoaders[loader](test_file);
        validate(im);
        im = vips.Image.newFromFile(test_file);
        validate(im);
    }

    function buffer_loader(loader, test_file, validate) {
        const buf = vips.FS.readFile(test_file);

        let im = bufferLoaders[loader](buf);
        validate(im);
        im = vips.Image.newFromBuffer(buf);
        validate(im);
    }

    function save_load(format, im) {
        const x = vips.Image.newTempFile(format);
        im.write(x);

        expect(im.width).to.equal(x.width);
        expect(im.height).to.equal(x.height);
        expect(im.bands).to.equal(x.bands);

        const max_diff = im.subtract(x).abs().max();
        expect(max_diff).to.equal(0);
    }

    // we have test files for formats which have a clear standard
    function save_load_file(format, options, im, max_diff = 0) {
        // yuk!
        // but we can't set format parameters for vips.Image.newTempFile()
        const filename = vips.Utils.tempName(format);

        im.writeToFile(filename + options);
        const x = vips.Image.newFromFile(filename);
        x.setDeleteOnClose(true);

        expect(im.width).to.equal(x.width);
        expect(im.height).to.equal(x.height);
        expect(im.bands).to.equal(x.bands);
        expect(im.subtract(x).abs().max()).to.be.at.most(max_diff);
    }

    function save_load_buffer(saver, loader, im, max_diff = 0, opts = {}) {
        const buf = bufferSavers[saver](im, opts);
        const x = bufferLoaders[loader](buf);

        expect(im.width).to.equal(x.width);
        expect(im.height).to.equal(x.height);
        expect(im.bands).to.equal(x.bands);
        expect(im.subtract(x).abs().max()).to.be.at.most(max_diff);
    }

    function save_buffer_tempfile(saver, suf, im, max_diff = 0) {
        const filename = vips.Utils.tempName('%s' + suf);

        const buf = new Uint8Array(bufferSavers[saver](im, {}));
        const stream = vips.FS.open(filename, 'w+');
        vips.FS.write(stream, buf, 0, buf.length, 0);
        vips.FS.close(stream);

        const x = vips.Image.newFromFile(filename);
        x.setDeleteOnClose(true);

        expect(im.width).to.equal(x.width);
        expect(im.height).to.equal(x.height);
        expect(im.bands).to.equal(x.bands);
        expect(im.subtract(x).abs().max()).to.be.at.most(max_diff);
    }

    it('vips', function () {
        save_load_file('%s.v', '', colour, 0);

        // check we can save and restore metadata
        const filename = vips.Utils.tempName('%s.v');
        colour.writeToFile(filename);
        const x = vips.Image.newFromFile(filename);
        x.setDeleteOnClose(true);
        const before_exif = colour.getBlob('exif-data');
        const after_exif = x.getBlob('exif-data');

        expect(before_exif.byteLength).to.equal(after_exif.byteLength);
        expect(before_exif).to.deep.equal(after_exif);
    });

    it('jpeg', function () {
        // Needs JPEG support
        if (!Helpers.have('jpegload')) {
            return this.skip();
        }

        const jpeg_valid = (im) => {
            const a = im.getpoint(10, 10);
            // different versions of libjpeg decode have slightly different
            // rounding
            Helpers.assert_almost_equal_objects(a, [141, 127, 90], 3);
            const profile = im.getBlob('icc-profile-data');
            expect(profile.byteLength).to.equal(564);
            expect(im.width).to.equal(290);
            expect(im.height).to.equal(442);
            expect(im.bands).to.equal(3);
        };

        file_loader('jpegload', Helpers.JPEG_FILE, jpeg_valid);
        save_load('%s.jpg', mono);
        save_load('%s.jpg', colour);

        buffer_loader('jpegload_buffer', Helpers.JPEG_FILE, jpeg_valid);
        save_load_buffer('jpegsave_buffer', 'jpegload_buffer', colour, 80);

        // see if we have exif parsing: our test image has this field
        let x = vips.Image.newFromFile(Helpers.JPEG_FILE);
        if (x.getTypeof('exif-ifd0-Orientation') !== 0) {
            // we need a copy of the image to set the new metadata on
            // otherwise we get caching problems

            // can set, save and load new orientation
            x = x.copy();

            x.setInt('orientation', 2);

            let filename = vips.Utils.tempName('%s.jpg');
            x.writeToFile(filename);

            x = vips.Image.newFromFile(filename);
            x.setDeleteOnClose(true);
            let y = x.getInt('orientation');
            expect(y).to.equal(2);

            // can remove orientation, save, load again, orientation
            // has reset
            x = x.copy();
            x.remove('orientation');

            filename = vips.Utils.tempName('%s.jpg');
            x.writeToFile(filename);

            x = vips.Image.newFromFile(filename);
            x.setDeleteOnClose(true);
            y = x.getInt('orientation');
            expect(y).to.equal(1);

            // autorotate load works
            x = vips.Image.newFromFile(Helpers.JPEG_FILE);
            x = x.copy();

            x.setInt('orientation', 6);

            filename = vips.Utils.tempName('%s.jpg');
            x.writeToFile(filename);

            let x1 = vips.Image.newFromFile(filename);
            x1.setDeleteOnClose(true);
            let x2 = vips.Image.newFromFile(filename, {
                autorotate: true
            });
            expect(x1.width).to.equal(x2.height);
            expect(x1.height).to.equal(x2.width);

            // sets incorrect orientation, save, load again, orientation
            // has reset to 1
            x = x.copy();
            x.setInt('orientation', 256);

            filename = vips.Utils.tempName('%s.jpg');
            x.writeToFile(filename);

            x = vips.Image.newFromFile(filename);
            x.setDeleteOnClose(true);
            y = x.getInt('orientation');
            expect(y).to.equal(1);

            // can set, save and reload ASCII string fields
            x = vips.Image.newFromFile(Helpers.JPEG_FILE);
            x = x.copy();

            x.setString('exif-ifd0-ImageDescription', 'hello world');

            filename = vips.Utils.tempName('%s.jpg');
            x.writeToFile(filename);

            x = vips.Image.newFromFile(filename);
            x.setDeleteOnClose(true);
            y = x.getString('exif-ifd0-ImageDescription');

            // can't use to.equal since the string will have an extra " (xx, yy, zz)"
            // format area at the end
            expect(y).to.satisfy(desc => desc.startsWith('hello world'));

            // can set, save and reload UTF16 string fields ... vips is
            // utf8, but it will be coded as utf16 and back for the XP* fields
            x = vips.Image.newFromFile(Helpers.JPEG_FILE);
            x = x.copy();

            x.setString('exif-ifd0-XPComment', 'йцук');

            filename = vips.Utils.tempName('%s.jpg');
            x.writeToFile(filename);

            x = vips.Image.newFromFile(filename);
            x.setDeleteOnClose(true);
            y = x.getString('exif-ifd0-XPComment');

            // can't use to.equal since the string will have an extra " (xx, yy, zz)"
            // format area at the end
            expect(y).to.satisfy(comment => comment.startsWith('йцук'));

            //can set/save/load UserComment, a tag which has the
            // encoding in the first 8 bytes ... though libexif only supports
            // ASCII for this

            x = vips.Image.newFromFile(Helpers.JPEG_FILE);
            x = x.copy();

            x.setString('exif-ifd2-UserComment', 'hello world');

            filename = vips.Utils.tempName('%s.jpg');
            x.writeToFile(filename);

            x = vips.Image.newFromFile(filename);
            x.setDeleteOnClose(true);
            y = x.getString('exif-ifd2-UserComment');

            // can't use to.equal since the string will have an extra " (xx, yy, zz)"
            // format area at the end
            expect(y).to.satisfy(comment => comment.startsWith('hello world'));
        }
    });

    it('jpegsave', function () {
        // Needs JPEG support
        if (!Helpers.have('jpegload')) {
            return this.skip();
        }

        const im = vips.Image.newFromFile(Helpers.JPEG_FILE);

        const q10 = im.jpegsaveBuffer({Q: 10});
        const q10_subsample_auto = im.jpegsaveBuffer({Q: 10, subsample_mode: 'auto'});
        const q10_subsample_on = im.jpegsaveBuffer({Q: 10, subsample_mode: 'on'});
        const q10_subsample_off = im.jpegsaveBuffer({Q: 10, subsample_mode: 'off'});

        const q90 = im.jpegsaveBuffer({Q: 90});
        const q90_subsample_auto = im.jpegsaveBuffer({Q: 90, subsample_mode: 'auto'});
        const q90_subsample_on = im.jpegsaveBuffer({Q: 90, subsample_mode: 'on'});
        const q90_subsample_off = im.jpegsaveBuffer({Q: 90, subsample_mode: 'off'});

        // higher Q should mean a bigger buffer
        expect(q90.byteLength).to.be.above(q10.byteLength);

        expect(q10_subsample_auto.byteLength).to.equal(q10.byteLength);
        expect(q10_subsample_on.byteLength).to.equal(q10_subsample_auto.byteLength);
        expect(q10_subsample_off.byteLength).to.be.above(q10.byteLength);

        expect(q90_subsample_auto.byteLength).to.equal(q90.byteLength);
        expect(q90_subsample_on.byteLength).to.be.below(q90.byteLength);
        expect(q90_subsample_off.byteLength).to.equal(q90_subsample_auto.byteLength);
    });

    it('truncated', function () {
        // Needs JPEG support
        if (!Helpers.have('jpegload')) {
            return this.skip();
        }

        // This should open (there's enough there for the header)
        let im = vips.Image.newFromFile(Helpers.TRUNCATED_FILE);

        // but this should fail with a warning, and knock TRUNCATED_FILE out of
        // the cache
        let x = im.avg();

        // now we should open again, but it won't come from cache, it'll reload
        im = vips.Image.newFromFile(Helpers.TRUNCATED_FILE);

        // and this should fail with a warning once more
        x = im.avg()
    });

    it('png', function () {
        // Needs PNG support
        if (!Helpers.have('pngload')) {
            return this.skip();
        }

        const png_valid = (im) => {
            const a = im.getpoint(10, 10);
            Helpers.assert_almost_equal_objects(a, [38671.0, 33914.0, 26762.0]);
            expect(im.width).to.equal(290);
            expect(im.height).to.equal(442);
            expect(im.bands).to.equal(3);
        };

        file_loader('pngload', Helpers.PNG_FILE, png_valid);
        buffer_loader('pngload_buffer', Helpers.PNG_FILE, png_valid);
        save_load_buffer('pngsave_buffer', 'pngload_buffer', colour);
        save_load('%s.png', mono);
        save_load('%s.png', colour);
        save_load_file('%s.png', '[interlace]', colour, 0);
        save_load_file('%s.png', '[interlace]', mono, 0);

        // size of a regular mono PNG
        const len_mono = mono.writeToBuffer('.png').byteLength

        // 4-bit should be smaller
        const len_mono4 = mono.writeToBuffer('.png', {
            bitdepth: 4,
        }).byteLength
        expect(len_mono4).to.be.below(len_mono);

        const len_mono2 = mono.writeToBuffer('.png', {
            bitdepth: 2,
        }).byteLength
        expect(len_mono2).to.be.below(len_mono4);

        const len_mono1 = mono.writeToBuffer('.png', {
            bitdepth: 1,
        }).byteLength
        expect(len_mono1).to.be.below(len_mono2);

        // we can't test palette save since we can't be sure libimagequant is
        // available and there's no easy test for its presence
    });

    it('tiff', function () {
        // Needs TIFF support
        if (!Helpers.have('tiffload')) {
            return this.skip();
        }

        const tiff_valid = (im) => {
            const a = im.getpoint(10, 10);
            Helpers.assert_almost_equal_objects(a, [38671.0, 33914.0, 26762.0]);
            expect(im.width).to.equal(290);
            expect(im.height).to.equal(442);
            expect(im.bands).to.equal(3);
        };

        file_loader('tiffload', Helpers.TIF_FILE, tiff_valid);
        buffer_loader('tiffload_buffer', Helpers.TIF_FILE, tiff_valid);

        const tiff1_valid = (im) => {
            let a = im.getpoint(127, 0);
            Helpers.assert_almost_equal_objects(a, [0.0]);
            a = im.getpoint(128, 0);
            Helpers.assert_almost_equal_objects(a, [255.0]);
            expect(im.width).to.equal(256);
            expect(im.height).to.equal(4);
            expect(im.bands).to.equal(1);
        };

        file_loader('tiffload', Helpers.TIF1_FILE, tiff1_valid);

        const tiff2_valid = (im) => {
            let a = im.getpoint(127, 0);
            Helpers.assert_almost_equal_objects(a, [85.0]);
            a = im.getpoint(128, 0);
            Helpers.assert_almost_equal_objects(a, [170.0]);
            expect(im.width).to.equal(256);
            expect(im.height).to.equal(4);
            expect(im.bands).to.equal(1);
        };

        file_loader('tiffload', Helpers.TIF2_FILE, tiff2_valid);

        const tiff4_valid = (im) => {
            let a = im.getpoint(127, 0);
            Helpers.assert_almost_equal_objects(a, [119.0]);
            a = im.getpoint(128, 0);
            Helpers.assert_almost_equal_objects(a, [136.0]);
            expect(im.width).to.equal(256);
            expect(im.height).to.equal(4);
            expect(im.bands).to.equal(1);
        };

        file_loader('tiffload', Helpers.TIF4_FILE, tiff4_valid);

        save_load_buffer('tiffsave_buffer', 'tiffload_buffer', colour);
        save_load('%s.tif', mono);
        save_load('%s.tif', colour);
        save_load('%s.tif', cmyk);

        save_load('%s.tif', onebit);
        save_load_file('%s.tif', '[bitdepth=1]', onebit, 0);
        save_load_file('%s.tif', '[miniswhite]', onebit, 0);
        save_load_file('%s.tif', '[bitdepth=1,miniswhite]', onebit, 0);

        save_load_file('%s.tif', `[profile=${Helpers.SRGB_FILE}]`, colour, 0);
        save_load_file('%s.tif', '[tile]', colour, 0);
        save_load_file('%s.tif', '[tile,pyramid]', colour, 0);
        save_load_file('%s.tif', '[tile,pyramid,subifd]', colour, 0)
        save_load_file('%s.tif', '[tile,pyramid,compression=jpeg]', colour, 80);
        save_load_file('%s.tif', '[tile,pyramid,subifd,compression=jpeg]', colour, 80)
        save_load_file('%s.tif', '[bigtiff]', colour, 0);
        save_load_file('%s.tif', '[compression=jpeg]', colour, 80);
        save_load_file('%s.tif', '[tile,tile-width=256]', colour, 10);

        let im = vips.Image.newFromFile(Helpers.TIF2_FILE);
        save_load_file('%s.tif', '[bitdepth=2]', im, 0);
        im = vips.Image.newFromFile(Helpers.TIF4_FILE);
        save_load_file('%s.tif', '[bitdepth=4]', im, 0);

        let filename = vips.Utils.tempName('%s.tif');
        let x = vips.Image.newFromFile(Helpers.TIF_FILE);
        x = x.copy();
        x.setInt('orientation', 2);
        x.writeToFile(filename);
        x = vips.Image.newFromFile(filename);
        x.setDeleteOnClose(true);
        let y = x.getInt('orientation');
        expect(y).to.equal(2);

        x = x.copy();
        x.remove('orientation');

        filename = vips.Utils.tempName('%s.tif');
        x.writeToFile(filename);
        x = vips.Image.newFromFile(filename);
        x.setDeleteOnClose(true);
        y = x.getInt('orientation');
        expect(y).to.equal(1);

        filename = vips.Utils.tempName('%s.tif');
        x = vips.Image.newFromFile(Helpers.TIF_FILE);
        x = x.copy();
        x.setInt('orientation', 6);
        x.writeToFile(filename);
        let x1 = vips.Image.newFromFile(filename);
        x1.setDeleteOnClose(true);
        let x2 = vips.Image.newFromFile(filename, {autorotate: true});
        expect(x1.width).to.equal(x2.height);
        expect(x1.height).to.equal(x2.width);

        filename = vips.Utils.tempName('%s.tif');
        x = vips.Image.newFromFile(Helpers.TIF_FILE);
        x = x.copy();
        x.writeToFile(filename, {xres: 100, yres: 200, resunit: 'inch'});
        x1 = vips.Image.newFromFile(filename);
        x1.setDeleteOnClose(true);
        expect(x1.getString('resolution-unit')).to.equal('in');
        expect(x1.xres).to.equal(100);
        expect(x1.yres).to.equal(200);

        // OME support in 8.5
        x = vips.Image.newFromFile(Helpers.OME_FILE);
        expect(x.width).to.equal(439);
        expect(x.height).to.equal(167);
        const page_height = x.height;

        x = vips.Image.newFromFile(Helpers.OME_FILE, {n: -1});
        expect(x.width).to.equal(439);
        expect(x.height).to.equal(page_height * 15);

        x = vips.Image.newFromFile(Helpers.OME_FILE, {page: 1, n: -1});
        expect(x.width).to.equal(439);
        expect(x.height).to.equal(page_height * 14);

        x = vips.Image.newFromFile(Helpers.OME_FILE, {page: 1, n: 2});
        expect(x.width).to.equal(439);
        expect(x.height).to.equal(page_height * 2);

        x = vips.Image.newFromFile(Helpers.OME_FILE, {n: -1});
        expect(x.getpoint(0, 166)[0]).to.equal(96);
        expect(x.getpoint(0, 167)[0]).to.equal(0);
        expect(x.getpoint(0, 168)[0]).to.equal(1);

        filename = vips.Utils.tempName('%s.tif');
        x.writeToFile(filename);

        x = vips.Image.newFromFile(filename, {n: -1});
        x.setDeleteOnClose(true);
        expect(x.width).to.equal(439);
        expect(x.height).to.equal(page_height * 15);
        expect(x.getpoint(0, 166)[0]).to.equal(96);
        expect(x.getpoint(0, 167)[0]).to.equal(0);
        expect(x.getpoint(0, 168)[0]).to.equal(1);

        // pyr save to buffer added in 8.6
        x = vips.Image.newFromFile(Helpers.TIF_FILE);
        let buf = x.tiffsaveBuffer({tile: true, pyramid: true});
        filename = vips.Utils.tempName('%s.tif');
        x.tiffsave(filename, {tile: true, pyramid: true});
        const buf2 = vips.FS.readFile(filename);
        expect(buf.byteLength).to.equal(buf2.byteLength);
        vips.FS.unlink(filename);

        const a = vips.Image.newFromBuffer(buf, '', {page: 2});
        const b = vips.Image.newFromBuffer(buf2, '', {page: 2});
        expect(a.width).to.equal(b.width);
        expect(a.height).to.equal(b.height);
        expect(a.avg()).to.equal(b.avg());

        x = vips.Image.newFromFile(Helpers.TIF_FILE);
        buf = x.tiffsaveBuffer({tile: true, pyramid: true, region_shrink: 'mean'});
        buf = x.tiffsaveBuffer({tile: true, pyramid: true, region_shrink: 'mode'});
        buf = x.tiffsaveBuffer({tile: true, pyramid: true, region_shrink: 'median'});
        buf = x.tiffsaveBuffer({tile: true, pyramid: true, region_shrink: 'max'});
        buf = x.tiffsaveBuffer({tile: true, pyramid: true, region_shrink: 'min'});
        buf = x.tiffsaveBuffer({tile: true, pyramid: true, region_shrink: 'nearest'});
    });

    it('webp', function () {
        // Needs WebP support
        if (!Helpers.have('webpload')) {
            return this.skip();
        }

        const webp_valid = (im) => {
            const a = im.getpoint(10, 10);
            // different webp versions use different rounding systems leading
            // to small variations
            Helpers.assert_almost_equal_objects(a, [71, 166, 236], 2);
            expect(im.width).to.equal(550);
            expect(im.height).to.equal(368);
            expect(im.bands).to.equal(3);
        };

        file_loader('webpload', Helpers.WEBP_FILE, webp_valid);
        buffer_loader('webpload_buffer', Helpers.WEBP_FILE, webp_valid);
        save_load_buffer('webpsave_buffer', 'webpload_buffer', colour, 60);
        save_load('%s.webp', colour);

        // test lossless mode
        let im = vips.Image.newFromFile(Helpers.WEBP_FILE);
        let buf = im.webpsaveBuffer({lossless: true});
        let im2 = vips.Image.newFromBuffer(buf, '');
        expect(Math.abs(im.avg() - im2.avg())).to.be.below(1);

        // higher Q should mean a bigger buffer
        const b1 = im.webpsaveBuffer({Q: 10});
        const b2 = im.webpsaveBuffer({Q: 90});
        expect(b2.byteLength).to.be.above(b1.byteLength);

        // try saving an image with an ICC profile and reading it back ... if we
        // can do it, our webp supports metadata load/save
        buf = colour.webpsaveBuffer();
        im = vips.Image.newFromBuffer(buf, '');
        if (im.getTypeof('icc-profile-data') !== 0) {
            // verify that the profile comes back unharmed
            const p1 = colour.getBlob('icc-profile-data');
            const p2 = im.getBlob('icc-profile-data');
            expect(p1.byteLength).to.equal(p2.byteLength);
            expect(p1).to.deep.equal(p2);

            // add tests for exif, xmp, ipct
            // the exif test will need us to be able to walk the header,
            // we can't just check exif-data

            // we can test that exif changes change the output of webpsave
            // first make sure we have exif support
            const z = vips.Image.newFromFile(Helpers.JPEG_FILE);
            if (z.getTypeof('exif-ifd0-Orientation') !== 0) {
                const x = colour.copy();
                x.setInt('orientation', 6);
                buf = x.webpsaveBuffer();
                const y = vips.Image.newFromBuffer(buf, '');
                expect(y.getInt('orientation')).to.equal(6);
            }
        }

        // try converting an animated gif to webp ... can't do back to gif
        // again without IM support
        if (Helpers.have('gifload')) {
            const x1 = vips.Image.newFromFile(Helpers.GIF_ANIM_FILE, {n: -1});
            const w1 = x1.webpsaveBuffer({Q: 10});

            // our test gif has delay 0 for the first frame set in error,
            // when converting to WebP this should result in a 100ms delay.
            const expectedDelay = x1.getArrayInt("delay");
            for (let i = 0; i < expectedDelay.length; i++) {
                expectedDelay[i] = expectedDelay[i] <= 10 ? 100 : expectedDelay[i];
            }

            const x2 = vips.Image.newFromBuffer(w1, '', {n: -1});
            expect(x1.width).to.equal(x2.width);
            expect(x1.height).to.equal(x2.height);
            expect(expectedDelay).to.deep.equal(x2.getArrayInt('delay'));
            expect(x1.getInt('page-height')).to.equal(x2.getInt('page-height'));
            expect(x1.getInt('gif-loop')).to.equal(x2.getInt('gif-loop'));
        }
    });

    it('gif', function () {
        // Needs GIF support
        if (!Helpers.have('gifload')) {
            return this.skip();
        }

        const gif_valid = (im) => {
            const a = im.getpoint(10, 10);
            Helpers.assert_almost_equal_objects(a, [33, 33, 33]);
            expect(im.width).to.equal(159);
            expect(im.height).to.equal(203);
            expect(im.bands).to.equal(3);
        };

        file_loader('gifload', Helpers.GIF_FILE, gif_valid);
        buffer_loader('gifload_buffer', Helpers.GIF_FILE, gif_valid);

        // test metadata
        let x1 = vips.Image.newFromFile(Helpers.GIF_ANIM_FILE, {n: -1})
        // our test gif has delay 0 for the first frame set in error
        expect(x1.getArrayInt('delay')).to.deep.equal([0, 50, 50, 50, 50]);
        expect(x1.getInt('loop')).to.equal(32760);
        expect(x1.getArrayDouble('background')).to.deep.equal([255.0, 255.0, 255.0]);
        // test deprecated fields too
        expect(x1.getInt('gif-loop')).to.equal(32759);
        expect(x1.getInt('gif-delay')).to.equal(0);

        // test page handling
        x1 = vips.Image.newFromFile(Helpers.GIF_ANIM_FILE)
        let x2 = vips.Image.newFromFile(Helpers.GIF_ANIM_FILE, {n: 2});
        expect(x2.height).to.equal(2 * x1.height);
        let page_height = x2.getInt('page-height');
        expect(page_height).to.equal(x1.height);

        x2 = vips.Image.newFromFile(Helpers.GIF_ANIM_FILE, {n: -1});
        expect(x2.height).to.equal(5 * x1.height);

        x2 = vips.Image.newFromFile(Helpers.GIF_ANIM_FILE, {page: 1, n: -1});
        expect(x2.height).to.equal(4 * x1.height);
    });

    it('analyzeload', function () {
        // Needs Analyze support
        if (!Helpers.have('analyzeload')) {
            return this.skip();
        }

        const analyze_valid = (im) => {
            const a = im.getpoint(10, 10);
            expect(a[0]).to.be.closeTo(3335, 1e-6);
            expect(im.width).to.equal(128);
            expect(im.height).to.equal(8064);
            expect(im.bands).to.equal(1);
        };

        file_loader('analyzeload', Helpers.ANALYZE_FILES[0], analyze_valid);
    });

    it('csv', function () {
        save_load('%s.csv', mono);
    });

    it('matrix', function () {
        save_load('%s.mat', mono);
    });

    it('ppm', function () {
        // Needs PPM support
        if (!Helpers.have('ppmload')) {
            return this.skip();
        }

        save_load('%s.ppm', mono);
        save_load('%s.ppm', colour);
    });

    it('radload', function () {
        // Needs Radiance support
        if (!Helpers.have('radload')) {
            return this.skip();
        }

        save_load('%s.hdr', colour);
        save_buffer_tempfile('radsave_buffer', '.hdr', rad, 0);
    });
});
