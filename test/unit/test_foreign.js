/* global vips, expect, cleanup */
'use strict';

import * as Helpers from './helpers.js';
import fs from 'fs';

describe('foreign', () => {
  let globalDeletionQueue;

  let colour;
  let rgba;
  let mono;
  let rad;
  let cmyk;
  let onebit;

  const fileLoaders = {
    jpegload: file => vips.Image.jpegload(file),
    jxlload: file => vips.Image.jxlload(file),
    heifload: file => vips.Image.heifload(file),
    svgload: file => vips.Image.svgload(file),
    pngload: file => vips.Image.pngload(file),
    webpload: file => vips.Image.webpload(file),
    tiffload: file => vips.Image.tiffload(file),
    analyzeload: file => vips.Image.analyzeload(file),
    gifload: file => vips.Image.gifload(file)
  };

  const bufferLoaders = {
    jpegload_buffer: buffer => vips.Image.jpegloadBuffer(buffer),
    jxlload_buffer: buffer => vips.Image.jxlloadBuffer(buffer),
    heifload_buffer: buffer => vips.Image.heifloadBuffer(buffer),
    svgload_buffer: buffer => vips.Image.svgloadBuffer(buffer),
    pngload_buffer: buffer => vips.Image.pngloadBuffer(buffer),
    webpload_buffer: buffer => vips.Image.webploadBuffer(buffer),
    tiffload_buffer: buffer => vips.Image.tiffloadBuffer(buffer),
    gifload_buffer: buffer => vips.Image.gifloadBuffer(buffer)
  };

  const bufferSavers = {
    jpegsave_buffer: (im, opts) => im.jpegsaveBuffer(opts),
    jxlsave_buffer: (im, opts) => im.jxlsaveBuffer(opts),
    heifsave_buffer: (im, opts) => im.heifsaveBuffer(opts),
    pngsave_buffer: (im, opts) => im.pngsaveBuffer(opts),
    tiffsave_buffer: (im, opts) => im.tiffsaveBuffer(opts),
    webpsave_buffer: (im, opts) => im.webpsaveBuffer(opts),
    gifsave_buffer: (im, opts) => im.gifsaveBuffer(opts),
    radsave_buffer: (im, opts) => im.radsaveBuffer(opts)
  };

  before(function () {
    colour = vips.Image.jpegload(Helpers.jpegFile);
    rgba = vips.Image.newFromFile(Helpers.rgbaFile);
    mono = colour.extractBand(1).copy();
    // we remove the ICC profile: the RGB one will no longer be appropriate
    mono.remove('icc-profile-data');
    rad = colour.float2rad().copy();
    rad.remove('icc-profile-data');
    cmyk = colour.bandjoin(mono);
    cmyk = cmyk.copy({ interpretation: vips.Interpretation.cmyk });
    cmyk.remove('icc-profile-data');

    const [file] = [
      Helpers.have('gifload') && Helpers.gifFile,
      Helpers.have('pngload') && Helpers.pngFile
    ].filter(Boolean);
    const im = vips.Image.newFromFile(file);
    onebit = im.extractBand(1).more(128);

    globalDeletionQueue = vips.deletionQueue.splice(0);
  });

  after(function () {
    vips.deletionQueue.push(...globalDeletionQueue);
    cleanup();
  });

  afterEach(function () {
    cleanup();
  });

  // we have test files for formats which have a clear standard
  function fileLoader (loader, testFile, validate) {
    let im = fileLoaders[loader](testFile);
    validate(im);
    im = vips.Image.newFromFile(testFile);
    validate(im);
  }

  function bufferLoader (loader, testFile, validate) {
    const buf = fs.readFileSync(testFile);

    let im = bufferLoaders[loader](buf);
    validate(im);
    im = vips.Image.newFromBuffer(buf);
    validate(im);
  }

  function saveLoad (format, im) {
    const x = vips.Image.newTempFile(format);
    im.write(x);

    expect(im.width).to.equal(x.width);
    expect(im.height).to.equal(x.height);
    expect(im.bands).to.equal(x.bands);

    const maxDiff = im.subtract(x).abs().max();
    expect(maxDiff).to.equal(0);
  }

  // we have test files for formats which have a clear standard
  function saveLoadFile (format, options, im, maxDiff = 0) {
    // yuk!
    // but we can't set format parameters for vips.Image.newTempFile()
    const filename = vips.Utils.tempName(format);

    im.writeToFile(filename + options);
    const x = vips.Image.newFromFile(filename);
    x.setDeleteOnClose(true);

    expect(im.width).to.equal(x.width);
    expect(im.height).to.equal(x.height);
    expect(im.bands).to.equal(x.bands);
    expect(im.subtract(x).abs().max()).to.be.at.most(maxDiff);
  }

  function saveLoadBuffer (saver, loader, im, maxDiff = 0, opts = {}) {
    const buf = bufferSavers[saver](im, opts);
    const x = bufferLoaders[loader](buf);

    expect(im.width).to.equal(x.width);
    expect(im.height).to.equal(x.height);
    expect(im.bands).to.equal(x.bands);
    expect(im.subtract(x).abs().max()).to.be.at.most(maxDiff);
  }

  function saveBufferTempfile (saver, suf, im, maxDiff = 0) {
    const filename = vips.Utils.tempName('%s' + suf);

    const buf = bufferSavers[saver](im, {});
    const stream = vips.FS.open(filename, 'w+');
    vips.FS.write(stream, buf, 0, buf.length, 0);
    vips.FS.close(stream);

    const x = vips.Image.newFromFile(filename);
    x.setDeleteOnClose(true);

    expect(im.width).to.equal(x.width);
    expect(im.height).to.equal(x.height);
    expect(im.bands).to.equal(x.bands);
    expect(im.subtract(x).abs().max()).to.be.at.most(maxDiff);
  }

  it('vips', function () {
    if (!vips.FS) {
      return this.skip();
    }
    // ftruncate() is not yet available in the Node backend of WasmFS.
    // https://github.com/emscripten-core/emscripten/blob/3.1.48/system/lib/wasmfs/backends/node_backend.cpp#L120-L122
    if (typeof vips.FS.statBufToObject === 'function') {
      return this.skip();
    }

    saveLoadFile('%s.v', '', colour, 0);

    // check we can save and restore metadata
    let filename = vips.Utils.tempName('%s.v');
    colour.writeToFile(filename);
    let x = vips.Image.newFromFile(filename);
    x.setDeleteOnClose(true);
    const beforeExif = colour.getBlob('exif-data');
    const afterExif = x.getBlob('exif-data');

    expect(beforeExif.byteLength).to.equal(afterExif.byteLength);
    expect(beforeExif).to.deep.equal(afterExif);

    // https://github.com/libvips/libvips/issues/1847
    filename = vips.Utils.tempName('%s.v');
    x = vips.Image.black(16, 16).add(128);
    x.writeToFile(filename);

    x = vips.Image.newFromFile(filename);
    x.setDeleteOnClose(true);
    expect(x.width).to.equal(16);
    expect(x.height).to.equal(16);
    expect(x.bands).to.equal(1);
    expect(x.avg()).to.equal(128);
  });

  it('jpeg', function () {
    // Needs JPEG support
    if (!Helpers.have('jpegload')) {
      return this.skip();
    }

    const jpegValid = (im) => {
      const a = im.getpoint(10, 10);
      // different versions of libjpeg decode have slightly different
      // rounding
      Helpers.assertAlmostEqualObjects(a, [141, 127, 90], 3);
      const profile = im.getBlob('icc-profile-data');
      expect(profile.byteLength).to.equal(564);
      expect(im.width).to.equal(290);
      expect(im.height).to.equal(442);
      expect(im.bands).to.equal(3);
    };

    fileLoader('jpegload', Helpers.jpegFile, jpegValid);
    saveLoad('%s.jpg', mono);
    saveLoad('%s.jpg', colour);

    bufferLoader('jpegload_buffer', Helpers.jpegFile, jpegValid);
    saveLoadBuffer('jpegsave_buffer', 'jpegload_buffer', colour, 80);

    // see if we have exif parsing: our test image has this field
    let x = vips.Image.newFromFile(Helpers.jpegFile);
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
      x = vips.Image.newFromFile(Helpers.jpegFile);
      x = x.copy();

      x.setInt('orientation', 6);

      filename = vips.Utils.tempName('%s.jpg');
      x.writeToFile(filename);

      const x1 = vips.Image.newFromFile(filename);
      x1.setDeleteOnClose(true);
      const x2 = vips.Image.newFromFile(filename, {
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
      x = vips.Image.newFromFile(Helpers.jpegFile);
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
      x = vips.Image.newFromFile(Helpers.jpegFile);
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

      // can set/save/load UserComment, a tag which has the
      // encoding in the first 8 bytes ... though libexif only supports
      // ASCII for this

      x = vips.Image.newFromFile(Helpers.jpegFile);
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

    const im = vips.Image.newFromFile(Helpers.jpegFile);

    const q10 = im.jpegsaveBuffer({ Q: 10 });
    const q10SubsampleAuto = im.jpegsaveBuffer({ Q: 10, subsample_mode: 'auto' });
    const q10SubsampleOn = im.jpegsaveBuffer({ Q: 10, subsample_mode: 'on' });
    const q10SubsampleOff = im.jpegsaveBuffer({ Q: 10, subsample_mode: 'off' });

    const q90 = im.jpegsaveBuffer({ Q: 90 });
    const q90SubsampleAuto = im.jpegsaveBuffer({ Q: 90, subsample_mode: 'auto' });
    const q90SubsampleOn = im.jpegsaveBuffer({ Q: 90, subsample_mode: 'on' });
    const q90SubsampleOff = im.jpegsaveBuffer({ Q: 90, subsample_mode: 'off' });

    // higher Q should mean a bigger buffer
    expect(q90.byteLength).to.be.above(q10.byteLength);

    expect(q10SubsampleAuto.byteLength).to.equal(q10.byteLength);
    expect(q10SubsampleOn.byteLength).to.equal(q10SubsampleAuto.byteLength);
    expect(q10SubsampleOff.byteLength).to.be.above(q10.byteLength);

    expect(q90SubsampleAuto.byteLength).to.equal(q90.byteLength);
    expect(q90SubsampleOn.byteLength).to.be.below(q90.byteLength);
    expect(q90SubsampleOff.byteLength).to.equal(q90SubsampleAuto.byteLength);

    // A non-zero restart_interval should result in a bigger file.
    // Otherwise, smaller restart intervals will have more restart markers
    // and therefore be larger
    const r0 = im.jpegsaveBuffer({ restart_interval: 0 });
    const r10 = im.jpegsaveBuffer({ restart_interval: 10 });
    const r2 = im.jpegsaveBuffer({ restart_interval: 2 });
    expect(r10.byteLength).to.be.above(r0.byteLength);
    expect(r2.byteLength).to.be.above(r10.byteLength);

    // we should be able to reload jpegs with extra MCU markers
    const im0 = vips.Image.jpegloadBuffer(r0);
    const im10 = vips.Image.jpegloadBuffer(r10);
    expect(im0.avg()).to.equal(im10.avg());
  });

  it('truncated', function () {
    // Needs JPEG support
    if (!Helpers.have('jpegload')) {
      return this.skip();
    }

    // This should open (there's enough there for the header)
    let im = vips.Image.newFromFile(Helpers.truncatedFile);

    // but this should fail with a warning, and knock TRUNCATED_FILE out of
    // the cache
    let x = im.avg();

    // now we should open again, but it won't come from cache, it'll reload
    im = vips.Image.newFromFile(Helpers.truncatedFile);

    // and this should fail with a warning once more
    x = im.avg(); // eslint-disable-line no-unused-vars
  });

  it('png', function () {
    // Needs PNG support
    if (!Helpers.have('pngload')) {
      return this.skip();
    }

    const pngValid = (im) => {
      const a = im.getpoint(10, 10);
      Helpers.assertAlmostEqualObjects(a, [38671.0, 33914.0, 26762.0]);
      expect(im.width).to.equal(290);
      expect(im.height).to.equal(442);
      expect(im.bands).to.equal(3);
      expect(im.getInt('bits-per-sample')).to.equal(16);
    };

    fileLoader('pngload', Helpers.pngFile, pngValid);
    bufferLoader('pngload_buffer', Helpers.pngFile, pngValid);
    saveLoadBuffer('pngsave_buffer', 'pngload_buffer', colour);
    saveLoad('%s.png', mono);
    saveLoad('%s.png', colour);
    saveLoadFile('%s.png', '[interlace]', colour, 0);
    saveLoadFile('%s.png', '[interlace]', mono, 0);

    // size of a regular mono PNG
    const lenMono = mono.writeToBuffer('.png').byteLength;

    // 4-bit should be smaller
    const lenMono4 = mono.writeToBuffer('.png', {
      bitdepth: 4
    }).byteLength;
    expect(lenMono4).to.be.below(lenMono);

    const lenMono2 = mono.writeToBuffer('.png', {
      bitdepth: 2
    }).byteLength;
    expect(lenMono2).to.be.below(lenMono4);

    const lenMono1 = mono.writeToBuffer('.png', {
      bitdepth: 1
    }).byteLength;
    expect(lenMono1).to.be.below(lenMono2);

    // take a 1-bit image to png and back
    const buf = onebit.writeToBuffer('.png', {
      bitdepth: 1
    });
    const after = vips.Image.newFromBuffer(buf, '');
    expect(onebit.subtract(after).abs().max()).to.equal(0);
    expect(after.getInt('bits-per-sample')).to.equal(1);

    // we can't test palette save since we can't be sure libimagequant is
    // available and there's no easy test for its presence

    // see if we have exif parsing: our test jpg image has this field
    const x = vips.Image.newFromFile(Helpers.jpegFile);
    if (x.getTypeof('exif-ifd0-Orientation') !== 0) {
      // we need a copy of the image to set the new metadata on
      // otherwise we get caching problems
      const x = colour.copy();

      // can set, save and load new orientation
      x.setInt('orientation', 2);

      const buf = x.pngsaveBuffer();
      const y = vips.Image.newFromBuffer(buf, '');
      expect(y.getInt('orientation')).to.equal(2);
    }

    // Add EXIF to new PNG
    const im1 = vips.Image.black(8, 8);
    im1.setString('exif-ifd0-ImageDescription', 'test description');
    const im2 = vips.Image.newFromBuffer(im1.pngsaveBuffer(), '');
    expect(im2.getString('exif-ifd0-ImageDescription')).to.satisfy(desc =>
      desc.startsWith('test description'));
  });

  it('tiff', function () {
    // Needs TIFF support
    if (!Helpers.have('tiffload')) {
      return this.skip();
    }

    const tiffValid = (im) => {
      const a = im.getpoint(10, 10);
      Helpers.assertAlmostEqualObjects(a, [38671.0, 33914.0, 26762.0]);
      expect(im.width).to.equal(290);
      expect(im.height).to.equal(442);
      expect(im.bands).to.equal(3);
      expect(im.getInt('bits-per-sample')).to.equal(16);
    };

    fileLoader('tiffload', Helpers.tifFile, tiffValid);
    bufferLoader('tiffload_buffer', Helpers.tifFile, tiffValid);

    const tiff1Valid = (im) => {
      let a = im.getpoint(127, 0);
      Helpers.assertAlmostEqualObjects(a, [0.0]);
      a = im.getpoint(128, 0);
      Helpers.assertAlmostEqualObjects(a, [255.0]);
      expect(im.width).to.equal(256);
      expect(im.height).to.equal(4);
      expect(im.bands).to.equal(1);
      expect(im.getInt('bits-per-sample')).to.equal(1);
    };

    fileLoader('tiffload', Helpers.tif1File, tiff1Valid);

    const tiff2Valid = (im) => {
      let a = im.getpoint(127, 0);
      Helpers.assertAlmostEqualObjects(a, [85.0]);
      a = im.getpoint(128, 0);
      Helpers.assertAlmostEqualObjects(a, [170.0]);
      expect(im.width).to.equal(256);
      expect(im.height).to.equal(4);
      expect(im.bands).to.equal(1);
      expect(im.getInt('bits-per-sample')).to.equal(2);
    };

    fileLoader('tiffload', Helpers.tif2File, tiff2Valid);

    const tiff4Valid = (im) => {
      let a = im.getpoint(127, 0);
      Helpers.assertAlmostEqualObjects(a, [119.0]);
      a = im.getpoint(128, 0);
      Helpers.assertAlmostEqualObjects(a, [136.0]);
      expect(im.width).to.equal(256);
      expect(im.height).to.equal(4);
      expect(im.bands).to.equal(1);
      expect(im.getInt('bits-per-sample')).to.equal(4);
    };

    fileLoader('tiffload', Helpers.tif4File, tiff4Valid);

    saveLoadBuffer('tiffsave_buffer', 'tiffload_buffer', colour);
    saveLoad('%s.tif', mono);
    saveLoad('%s.tif', colour);
    saveLoad('%s.tif', rgba);

    saveLoad('%s.tif', cmyk);
    saveLoad('%s.tif', onebit);
    saveLoadFile('%s.tif', '[bitdepth=1]', onebit, 0);
    saveLoadFile('%s.tif', '[miniswhite]', onebit, 0);
    saveLoadFile('%s.tif', '[bitdepth=1,miniswhite]', onebit, 0);

    saveLoadFile('%s.tif', `[profile=${Helpers.srgbFile}]`, colour, 0);
    saveLoadFile('%s.tif', '[tile]', colour, 0);
    saveLoadFile('%s.tif', '[tile,pyramid]', colour, 0);
    saveLoadFile('%s.tif', '[tile,pyramid,subifd]', colour, 0);
    saveLoadFile('%s.tif', '[tile,pyramid,compression=jpeg]', colour, 80);
    saveLoadFile('%s.tif', '[tile,pyramid,subifd,compression=jpeg]', colour, 80);
    saveLoadFile('%s.tif', '[bigtiff]', colour, 0);
    saveLoadFile('%s.tif', '[compression=jpeg]', colour, 80);
    saveLoadFile('%s.tif', '[tile,tile-width=256]', colour, 10);

    let im = vips.Image.newFromFile(Helpers.tif2File);
    saveLoadFile('%s.tif', '[bitdepth=2]', im, 0);
    im = vips.Image.newFromFile(Helpers.tif4File);
    saveLoadFile('%s.tif', '[bitdepth=4]', im, 0);

    let filename = vips.Utils.tempName('%s.tif');
    colour.writeToFile(filename, { pyramid: true, compression: 'jpeg' });
    let x = vips.Image.newFromFile(filename, { page: 2 });
    x.setDeleteOnClose(true);
    expect(x.width).to.equal(72);
    expect(Math.abs(x.avg() - 117.3)).to.be.below(1);

    filename = vips.Utils.tempName('%s.tif');
    colour.writeToFile(filename, { pyramid: true, subifd: true, compression: 'jpeg' });
    x = vips.Image.newFromFile(filename, { subifd: 1 });
    x.setDeleteOnClose(true);
    expect(x.width).to.equal(72);
    expect(Math.abs(x.avg() - 117.3)).to.be.below(1);

    filename = vips.Utils.tempName('%s.tif');
    x = vips.Image.newFromFile(Helpers.tifFile);
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
    x = vips.Image.newFromFile(Helpers.tifFile);
    x = x.copy();
    x.setInt('orientation', 6);
    x.writeToFile(filename);
    let x1 = vips.Image.newFromFile(filename);
    x1.setDeleteOnClose(true);
    const x2 = vips.Image.newFromFile(filename, { autorotate: true });
    expect(x1.width).to.equal(x2.height);
    expect(x1.height).to.equal(x2.width);

    filename = vips.Utils.tempName('%s.tif');
    x = vips.Image.newFromFile(Helpers.tifFile);
    x = x.copy();
    x.writeToFile(filename, { xres: 100, yres: 200, resunit: 'inch' });
    x1 = vips.Image.newFromFile(filename);
    x1.setDeleteOnClose(true);
    expect(x1.getString('resolution-unit')).to.equal('in');
    expect(x1.xres).to.equal(100);
    expect(x1.yres).to.equal(200);

    // OME support in 8.5
    x = vips.Image.newFromFile(Helpers.omeFile);
    expect(x.width).to.equal(439);
    expect(x.height).to.equal(167);
    const pageHeight = x.height;

    x = vips.Image.newFromFile(Helpers.omeFile, { n: -1 });
    expect(x.width).to.equal(439);
    expect(x.height).to.equal(pageHeight * 15);

    x = vips.Image.newFromFile(Helpers.omeFile, { page: 1, n: -1 });
    expect(x.width).to.equal(439);
    expect(x.height).to.equal(pageHeight * 14);

    x = vips.Image.newFromFile(Helpers.omeFile, { page: 1, n: 2 });
    expect(x.width).to.equal(439);
    expect(x.height).to.equal(pageHeight * 2);

    x = vips.Image.newFromFile(Helpers.omeFile, { n: -1 });
    expect(x.getpoint(0, 166)[0]).to.equal(96);
    expect(x.getpoint(0, 167)[0]).to.equal(0);
    expect(x.getpoint(0, 168)[0]).to.equal(1);

    filename = vips.Utils.tempName('%s.tif');
    x.writeToFile(filename);

    x = vips.Image.newFromFile(filename, { n: -1 });
    x.setDeleteOnClose(true);
    expect(x.width).to.equal(439);
    expect(x.height).to.equal(pageHeight * 15);
    expect(x.getpoint(0, 166)[0]).to.equal(96);
    expect(x.getpoint(0, 167)[0]).to.equal(0);
    expect(x.getpoint(0, 168)[0]).to.equal(1);

    // pyr save to buffer added in 8.6
    x = vips.Image.newFromFile(Helpers.tifFile);
    let buf = x.tiffsaveBuffer({ tile: true, pyramid: true });
    filename = vips.Utils.tempName('%s.tif');
    x.tiffsave(filename, { tile: true, pyramid: true });
    const buf2 = vips.FS.readFile(filename);
    expect(buf.byteLength).to.equal(buf2.byteLength);
    vips.FS.unlink(filename);

    filename = vips.Utils.tempName('%s.tif');
    rgba.writeToFile(filename, { premultiply: true });
    let a = vips.Image.newFromFile(filename);
    a.setDeleteOnClose(true);
    let b = rgba.premultiply().cast('uchar').unpremultiply().cast('uchar');
    expect(a.equal(b).min()).to.equal(255);

    a = vips.Image.newFromBuffer(buf, '', { page: 2 });
    b = vips.Image.newFromBuffer(buf2, '', { page: 2 });
    expect(a.width).to.equal(b.width);
    expect(a.height).to.equal(b.height);
    expect(a.equal(b).min()).to.equal(255);

    // just 0/255 in each band, shrink with mode and all pixels should be 0
    // or 255 in layer 1
    x = vips.Image.newFromFile(Helpers.tifFile).more(128);
    for (const shrink of ['mode', 'median', 'max', 'min']) {
      buf = x.tiffsaveBuffer({ pyramid: true, region_shrink: shrink });
      y = vips.Image.newFromBuffer(buf, '', { page: 1 });
      const z = y.histFind({ band: 0 });
      expect(z.getpoint(0, 0)[0] + z.getpoint(255, 0)[0]).to.equal(y.width * y.height);
    }
  });

  it('webp', function () {
    // Needs WebP support
    if (!Helpers.have('webpload')) {
      return this.skip();
    }

    const webpValid = (im) => {
      const a = im.getpoint(10, 10);
      // different webp versions use different rounding systems leading
      // to small variations
      Helpers.assertAlmostEqualObjects(a, [71, 166, 236], 2);
      expect(im.width).to.equal(550);
      expect(im.height).to.equal(368);
      expect(im.bands).to.equal(3);
    };

    fileLoader('webpload', Helpers.webpFile, webpValid);
    bufferLoader('webpload_buffer', Helpers.webpFile, webpValid);
    saveLoadBuffer('webpsave_buffer', 'webpload_buffer', colour, 60);
    saveLoad('%s.webp', colour);

    // test lossless mode
    let im = vips.Image.newFromFile(Helpers.webpFile);
    let buf = im.webpsaveBuffer({ lossless: true });
    const im2 = vips.Image.newFromBuffer(buf, '');
    expect(im.subtract(im2).abs().max()).to.be.below(1);

    // higher Q should mean a bigger buffer
    const b1 = im.webpsaveBuffer({ Q: 10 });
    const b2 = im.webpsaveBuffer({ Q: 90 });
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

      // add tests for exif, xmp, iptc
      // the exif test will need us to be able to walk the header,
      // we can't just check exif-data

      // we can test that exif changes the output of webpsave
      // first make sure we have exif support
      const z = vips.Image.newFromFile(Helpers.jpegFile);
      if (z.getTypeof('exif-ifd0-Orientation') !== 0) {
        const x = colour.copy();
        x.setInt('orientation', 6);
        buf = x.webpsaveBuffer();
        const y = vips.Image.newFromBuffer(buf, '');
        expect(y.getInt('orientation')).to.equal(6);
      }
    }

    // try converting an animated gif to webp
    if (Helpers.have('gifload')) {
      const x1 = vips.Image.newFromFile(Helpers.gifAnimFile, { n: -1 });
      const w1 = x1.webpsaveBuffer({ Q: 10 });

      // our test gif has delay 0 for the first frame set in error,
      // when converting to WebP this should result in a 100ms delay.
      const expectedDelay = x1.getArrayInt('delay');
      for (let i = 0; i < expectedDelay.length; i++) {
        expectedDelay[i] = expectedDelay[i] <= 10 ? 100 : expectedDelay[i];
      }

      const x2 = vips.Image.newFromBuffer(w1, '', { n: -1 });
      expect(x1.width).to.equal(x2.width);
      expect(x1.height).to.equal(x2.height);
      expect(expectedDelay).to.deep.equal(x2.getArrayInt('delay'));
      expect(x1.pageHeight).to.equal(x2.pageHeight);
      expect(x1.getInt('gif-loop')).to.equal(x2.getInt('gif-loop'));
    }

    // Animated WebP round trip
    im = vips.Image.newFromFile(Helpers.webpAnimFile, { n: -1 });
    expect(im.width).to.equal(13);
    expect(im.height).to.equal(16731);
    buf = im.webpsaveBuffer(); // eslint-disable-line no-unused-vars
  });

  it('gifload', function () {
    // Needs GIF load support
    if (!Helpers.have('gifload')) {
      return this.skip();
    }

    const gifValid = (im) => {
      const a = im.getpoint(10, 10);
      Helpers.assertAlmostEqualObjects(a, [33, 33, 33]);
      expect(im.width).to.equal(159);
      expect(im.height).to.equal(203);
      expect(im.bands).to.equal(3);
      expect(im.getInt('bits-per-sample')).to.equal(4);
    };

    fileLoader('gifload', Helpers.gifFile, gifValid);
    bufferLoader('gifload_buffer', Helpers.gifFile, gifValid);

    // test metadata
    let x1 = vips.Image.newFromFile(Helpers.gifFile, { n: -1 });
    expect(x1.getInt('n-pages')).to.equal(1);
    expect(x1.getArrayDouble('background')).to.deep.equal([81.0, 81.0, 81.0]);
    expect(x1.getInt('interlaced')).to.equal(1);

    x1 = vips.Image.newFromFile(Helpers.gifAnimFile, { n: -1 });
    // our test gif has delay 0 for the first frame set in error
    expect(x1.getArrayInt('delay')).to.deep.equal([0, 50, 50, 50, 50]);
    expect(x1.getInt('loop')).to.equal(32761);
    expect(x1.getArrayDouble('background')).to.deep.equal([255.0, 255.0, 255.0]);
    expect(x1.getTypeof('interlaced')).to.equal(0);
    // test deprecated fields too
    expect(x1.getInt('gif-loop')).to.equal(32760);
    expect(x1.getInt('gif-delay')).to.equal(0);

    // test page handling
    x1 = vips.Image.newFromFile(Helpers.gifAnimFile);
    let x2 = vips.Image.newFromFile(Helpers.gifAnimFile, { n: 2 });
    expect(x2.height).to.equal(2 * x1.height);
    expect(x2.pageHeight).to.equal(x1.height);

    x2 = vips.Image.newFromFile(Helpers.gifAnimFile, { n: -1 });
    expect(x2.height).to.equal(5 * x1.height);

    x2 = vips.Image.newFromFile(Helpers.gifAnimFile, { page: 1, n: -1 });
    expect(x2.height).to.equal(4 * x1.height);
  });

  it('gifsave', function () {
    // Needs GIF save support
    if (!Helpers.have('gifsave')) {
      return this.skip();
    }

    // Animated GIF round trip
    let x1 = vips.Image.newFromFile(Helpers.gifAnimFile, { n: -1 });
    let b1 = x1.gifsaveBuffer();
    let x2 = vips.Image.newFromBuffer(b1, '', { n: -1 });
    expect(x2.width).to.equal(x1.width);
    expect(x2.height).to.equal(x1.height);
    expect(x2.getInt('n-pages')).to.equal(x1.getInt('n-pages'));
    expect(x2.getArrayInt('delay')).to.deep.equal(x1.getArrayInt('delay'));
    expect(x2.pageHeight).to.equal(x1.pageHeight);
    expect(x2.getInt('loop')).to.equal(x1.getInt('loop'));

    // Interlaced GIFs are usually larger in file size
    b1 = colour.gifsaveBuffer({ interlace: false });
    const interlaced = colour.gifsaveBuffer({ interlace: true });
    expect(interlaced.byteLength).to.be.above(b1.byteLength);

    // Reducing dither will typically reduce file size (and quality)
    const littleDither = colour.gifsaveBuffer({ dither: 0.1, effort: 1 });
    const largeDither = colour.gifsaveBuffer({ dither: 0.9, effort: 1 });
    expect(littleDither.byteLength).to.be.below(largeDither.byteLength);

    // Reducing effort will typically increase file size (and reduce quality)
    const littleEffort = colour.gifsaveBuffer({ effort: 1 });
    const largeEffort = colour.gifsaveBuffer({ effort: 10 });
    expect(littleEffort.byteLength).to.be.above(largeEffort.byteLength);

    // Reducing bitdepth will typically reduce file size (and reduce quality)
    const bitdepth8 = colour.gifsaveBuffer({ bitdepth: 8, effort: 1 });
    const bitdepth7 = colour.gifsaveBuffer({ bitdepth: 7, effort: 1 });
    expect(bitdepth8.byteLength).to.be.above(bitdepth7.byteLength);

    // Animated WebP to GIF
    if (Helpers.have('webpload')) {
      x1 = vips.Image.newFromFile(Helpers.webpAnimFile, { n: -1 });
      b1 = x1.gifsaveBuffer();
      x2 = vips.Image.newFromBuffer(b1, '', { n: -1 });
      expect(x2.width).to.equal(x1.width);
      expect(x2.height).to.equal(x1.height);
      expect(x2.getInt('n-pages')).to.equal(x1.getInt('n-pages'));
      expect(x2.getArrayInt('delay')).to.deep.equal(x1.getArrayInt('delay'));
      expect(x2.pageHeight).to.equal(x1.pageHeight);
      expect(x2.getInt('loop')).to.equal(x1.getInt('loop'));
    }
  });

  it('analyzeload', function () {
    // Needs Analyze support
    if (!Helpers.have('analyzeload')) {
      return this.skip();
    }

    const analyzeValid = (im) => {
      const a = im.getpoint(10, 10);
      expect(a[0]).to.be.closeTo(3335, 1e-6);
      expect(im.width).to.equal(128);
      expect(im.height).to.equal(8064);
      expect(im.bands).to.equal(1);
    };

    fileLoader('analyzeload', Helpers.analyzeFiles[0], analyzeValid);
  });

  it('csv', function () {
    saveLoad('%s.csv', mono);
  });

  it('matrix', function () {
    saveLoad('%s.mat', mono);
  });

  it('ppm', function () {
    // Needs PPM support
    if (!Helpers.have('ppmload')) {
      return this.skip();
    }

    saveLoad('%s.ppm', mono);
    saveLoad('%s.ppm', colour);

    saveLoadFile('%s.ppm', '[ascii]', mono, 0);
    saveLoadFile('%s.ppm', '[ascii]', colour, 0);

    saveLoadFile('%s.ppm', '[ascii,bitdepth=1]', onebit, 0);

    const rgb16 = colour.colourspace('rgb16');
    const grey16 = mono.colourspace('rgb16');

    saveLoad('%s.ppm', grey16);
    saveLoad('%s.ppm', rgb16);

    saveLoadFile('%s.ppm', '[ascii]', grey16, 0);
    saveLoadFile('%s.ppm', '[ascii]', rgb16, 0);
  });

  it('radload', function () {
    // Needs Radiance support
    if (!Helpers.have('radload')) {
      return this.skip();
    }

    saveLoad('%s.hdr', colour);
    saveBufferTempfile('radsave_buffer', '.hdr', rad, 0);
  });

  it('svgload', function () {
    // Needs SVG load support
    if (!Helpers.have('svgload')) {
      return this.skip();
    }

    const svgValid = (im) => {
      const a = im.getpoint(10, 10);
      Helpers.assertAlmostEqualObjects(a, [0, 0, 0, 0]);
      expect(im.width).to.equal(736);
      expect(im.height).to.equal(552);
      expect(im.bands).to.equal(4);
    };

    fileLoader('svgload', Helpers.svgFile, svgValid);
    bufferLoader('svgload_buffer', Helpers.svgFile, svgValid);

    fileLoader('svgload', Helpers.svgzFile, svgValid);
    bufferLoader('svgload_buffer', Helpers.svgzFile, svgValid);

    fileLoader('svgload', Helpers.svgGzFile, svgValid);

    let im = vips.Image.newFromFile(Helpers.svgzFile);
    let x = vips.Image.newFromFile(Helpers.svgzFile, { scale: 2 });
    expect(Math.abs(im.width * 2 - x.width)).to.be.below(2);
    expect(Math.abs(im.height * 2 - x.height)).to.be.below(2);

    im = vips.Image.newFromFile(Helpers.svgzFile);
    x = vips.Image.newFromFile(Helpers.svgzFile, { dpi: 144 });
    expect(Math.abs(im.width * 2 - x.width)).to.be.below(2);
    expect(Math.abs(im.height * 2 - x.height)).to.be.below(2);

    expect(() => {
      const svg = '<svg xmlns="http://www.w3.org/2000/svg" width="0" height="0"></svg>';
      vips.Image.newFromBuffer(svg, '');
    }).to.throw(/SVG doesn't have a valid size/);

    // recognize dimensions for SVGs without width/height
    let svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"></svg>';
    im = vips.Image.newFromBuffer(svg, '');
    expect(im.width).to.equal(100);
    expect(im.height).to.equal(100);

    svg = '<svg xmlns="http://www.w3.org/2000/svg"><rect width="100" height="100" /></svg>';
    im = vips.Image.newFromBuffer(svg, '');
    expect(im.width).to.equal(100);
    expect(im.height).to.equal(100);

    // width and height of 0.5 is valid
    svg = '<svg xmlns="http://www.w3.org/2000/svg" width="0.5" height="0.5"></svg>';
    im = vips.Image.newFromBuffer(svg, '');
    expect(im.width).to.equal(1);
    expect(im.height).to.equal(1);
  });

  it('heifload', function () {
    // Needs AVIF load support
    if (!Helpers.have('heifload')) {
      return this.skip();
    }

    const heifValid = (im) => {
      const a = im.getpoint(10, 10);
      // different versions of libheif decode have slightly different
      // rounding
      Helpers.assertAlmostEqualObjects(a, [197, 181, 158], 2);
      expect(im.width).to.equal(3024);
      expect(im.height).to.equal(4032);
      expect(im.bands).to.equal(3);
      expect(im.getInt('bits-per-sample')).to.equal(8);
    };

    fileLoader('heifload', Helpers.avifFile, heifValid);
    bufferLoader('heifload_buffer', Helpers.avifFile, heifValid);

    expect(() => {
      const im = vips.Image.heifload(Helpers.avifFileHuge);
      im.avg();
    }).to.throw(/exceeds the maximum image size/);

    const im = vips.Image.heifload(Helpers.avifFileHuge, { unlimited: true });
    expect(im.avg()).to.equal(0);
  });

  describe('heifsave', () => {
    it('roundtrip', function () {
      // Needs AVIF save support
      if (!Helpers.have('heifsave')) {
        return this.skip();
      }

      // TODO(kleisauke): Remove `subsample_mode: 'off'` when libvips >= 8.16, see:
      // https://github.com/libvips/libvips/commit/dbd298cc8c9789dfc0fc6917b2492cb570406a7a
      saveLoadBuffer('heifsave_buffer', 'heifload_buffer',
        colour, 0, { compression: 'av1', lossless: true, subsample_mode: 'off' });
      saveLoad('%s.avif', colour);
    });

    it('quality', function () {
      // Needs AVIF save support
      if (!Helpers.have('heifsave')) {
        return this.skip();
      }

      // higher Q should mean a bigger buffer
      const b1 = mono.heifsaveBuffer({ Q: 10, compression: 'av1' });
      const b2 = mono.heifsaveBuffer({ Q: 90, compression: 'av1' });
      expect(b2.byteLength).to.be.above(b1.byteLength);
    });

    it('chroma', function () {
      // Needs AVIF save support
      if (!Helpers.have('heifsave')) {
        return this.skip();
      }

      // Chroma subsampling should produce smaller file size for same Q
      const b1 = mono.heifsaveBuffer({ compression: 'av1', subsample_mode: 'on' });
      const b2 = mono.heifsaveBuffer({ compression: 'av1', subsample_mode: 'off' });
      expect(b2.byteLength).to.be.above(b1.byteLength);
    });

    it('icc', function () {
      // Needs AVIF save support
      if (!Helpers.have('heifsave')) {
        return this.skip();
      }

      // try saving an image with an ICC profile and reading it back
      const buf = colour.heifsaveBuffer({ Q: 10, compression: 'av1' });
      const im = vips.Image.newFromBuffer(buf, '');
      if (im.getTypeof('icc-profile-data') !== 0) {
        // verify that the profile comes back unharmed
        const p1 = colour.getBlob('icc-profile-data');
        const p2 = im.getBlob('icc-profile-data');
        expect(p1.byteLength).to.equal(p2.byteLength);
        expect(p1).to.deep.equal(p2);

        // add tests for xmp, iptc
        // the exif test will need us to be able to walk the header,
        // we can't just check exif-data
      }
    });

    it('exif', function () {
      // Needs AVIF save support
      if (!Helpers.have('heifsave')) {
        return this.skip();
      }

      // first make sure we have exif support
      let x = vips.Image.newFromFile(Helpers.jpegFile);
      if (x.getTypeof('exif-ifd0-Orientation') !== 0) {
        x = x.copy();
        x.setString('exif-ifd0-XPComment', 'banana');
        const buf = x.heifsaveBuffer({ Q: 10, compression: 'av1' });
        const y = vips.Image.newFromBuffer(buf, '');
        expect(y.getString('exif-ifd0-XPComment')).to.satisfy(comment => comment.startsWith('banana'));
      }
    });
  });

  it('jxlload', function () {
    // Needs JPEG XL support
    if (!Helpers.have('jxlload')) {
      return this.skip();
    }

    const jxlValid = (im) => {
      const a = im.getpoint(10, 10);
      // the delta might need to be adjusted up as new
      // libjxl versions are released
      Helpers.assertAlmostEqualObjects(a, [156, 129, 90], 0);
      expect(im.width).to.equal(290);
      expect(im.height).to.equal(442);
      expect(im.bands).to.equal(4);
      expect(im.getInt('bits-per-sample')).to.equal(8);
    };

    fileLoader('jxlload', Helpers.jxlFile, jxlValid);
    bufferLoader('jxlload_buffer', Helpers.jxlFile, jxlValid);
  });

  it('jxlsave', function () {
    // Needs JPEG XL support
    if (!Helpers.have('jxlsave')) {
      return this.skip();
    }

    // save and load with an icc profile
    saveLoadBuffer('jxlsave_buffer', 'jxlload_buffer',
      colour, 130);

    // with no icc profile
    const noProfile = colour.copy();
    noProfile.remove('icc-profile-data');
    saveLoadBuffer('jxlsave_buffer', 'jxlload_buffer',
      noProfile, 120);

    // scrgb mode
    const scrgb = colour.colourspace('scrgb');
    saveLoadBuffer('jxlsave_buffer', 'jxlload_buffer',
      scrgb, 120);

    // scrgb mode, no profile
    const scrgbNoProfile = scrgb.copy();
    scrgbNoProfile.remove('icc-profile-data');
    saveLoadBuffer('jxlsave_buffer', 'jxlload_buffer',
      scrgbNoProfile, 120);

    // 16-bit mode
    const rgb16 = colour.colourspace('rgb16').copy();
    // remove the ICC profile: the RGB one will no longer be appropriate
    rgb16.remove('icc-profile-data');
    saveLoadBuffer('jxlsave_buffer', 'jxlload_buffer',
      rgb16, 12000);

    // repeat for lossless mode
    saveLoadBuffer('jxlsave_buffer', 'jxlload_buffer',
      colour, 0, { lossless: true });
    saveLoadBuffer('jxlsave_buffer', 'jxlload_buffer',
      noProfile, 0, { lossless: true });
    saveLoadBuffer('jxlsave_buffer', 'jxlload_buffer',
      scrgb, 0, { lossless: true });
    saveLoadBuffer('jxlsave_buffer', 'jxlload_buffer',
      scrgbNoProfile, 0, { lossless: true });

    // lossy should be much smaller than lossless
    const lossy = colour.jxlsaveBuffer();
    const lossless = colour.jxlsaveBuffer({ lossless: true });
    expect(lossy.byteLength).to.be.below(lossless.byteLength / 5);
  });

  it('fail_on', function () {
    // csvload should spot trunc correctly
    const target = vips.Target.newToMemory();
    mono.writeToTarget(target, '.csv');
    const buf = target.getBlob();

    let source = vips.Source.newFromMemory(buf);
    let im = vips.Image.csvloadSource(source);
    expect(im.avg()).to.be.above(0);

    // truncation should be OK by default
    const bufTrunc = buf.slice(0, -100);
    source = vips.Source.newFromMemory(bufTrunc);
    im = vips.Image.csvloadSource(source);
    expect(im.avg()).to.be.above(0);

    // set trunc should make it fail
    im = vips.Image.csvloadSource(source, { fail_on: 'truncated' });
    expect(() =>
      // this will now force parsing of the whole file, which should
      // trigger an error
      im.avg()
    ).to.throw(/unexpected end of file/);

    // warn should fail too, since trunc implies warn
    im = vips.Image.csvloadSource(source, { fail_on: 'warning' });
    expect(() => im.avg()).to.throw(/unexpected end of file/);
  });
});
