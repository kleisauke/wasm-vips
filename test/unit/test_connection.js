/* global vips, expect, cleanup */
'use strict';

import * as Helpers from './helpers.js';

describe('connection', () => {
  let globalDeletionQueue;

  let colour;
  let mono;

  before(function () {
    colour = vips.Image.jpegload(Helpers.jpegFile);
    mono = colour.extractBand(1).copy();
    // we remove the ICC profile: the RGB one will no longer be appropriate
    mono.remove('icc-profile-data');

    globalDeletionQueue = vips.deletionQueue.splice(0);
  });

  after(function () {
    vips.deletionQueue.push(...globalDeletionQueue);
    cleanup();
  });

  afterEach(function () {
    cleanup();
  });

  describe('source', () => {
    it('newFromFile', function () {
      if (!vips.FS) {
        return this.skip();
      }
      const x = vips.Source.newFromFile(Helpers.jpegFile);

      expect(x.filename).to.equal(Helpers.jpegFile);
    });
    it('newFromMemory', function () {
      const data = colour.writeToBuffer('.jpg');
      const x = vips.Source.newFromMemory(data);

      expect(x.filename).to.equal('');
    });
  });

  describe('target', () => {
    it('newToFile', function () {
      if (!vips.FS) {
        return this.skip();
      }
      const filename = vips.Utils.tempName('%s.jpg');
      const x = vips.Target.newToFile(filename);

      expect(x.filename).to.equal(filename);

      vips.FS.unlink(filename);
    });
    it('newToMemory', function () {
      const x = vips.Target.newToMemory();

      expect(x.filename).to.equal('');
    });
  });

  describe('image', () => {
    describe('newFromSource', () => {
      it('file', function () {
        const x = vips.Source.newFromFile(Helpers.jpegFile);
        const y = vips.Image.newFromSource(x, '', {
          access: 'sequential'
        });

        expect(y.width).to.equal(290);
        expect(y.height).to.equal(442);
      });
      it('memory', function () {
        const data = colour.writeToBuffer('.jpg');
        const x = vips.Source.newFromMemory(data);
        const y = vips.Image.newFromSource(x, '', {
          access: 'sequential'
        });

        expect(y.width).to.equal(290);
        expect(y.height).to.equal(442);
      });
      it('custom', function () {
        if (!vips.FS) {
          return this.skip();
        }
        const stream = vips.FS.open(Helpers.jpegFile, 'r');

        const source = new vips.SourceCustom();
        source.onRead = (ptr, size) =>
          BigInt(vips.FS.read(stream, vips.HEAPU8, ptr, vips.bigintToI53Checked(size)));
        source.onSeek = (offset, whence) =>
          BigInt(vips.FS.llseek(stream, vips.bigintToI53Checked(offset), whence));

        const image = vips.Image.newFromSource(source, '', {
          access: 'sequential'
        });
        const image2 = vips.Image.newFromFile(Helpers.jpegFile, {
          access: 'sequential'
        });

        expect(image.subtract(image2).abs().max()).to.equal(0);

        vips.FS.close(stream);
      });
    });
    describe('writeToTarget', () => {
      it('file', function () {
        if (!vips.FS) {
          return this.skip();
        }
        const filename = vips.Utils.tempName('%s.jpg');

        const x = vips.Target.newToFile(filename);
        colour.writeToTarget(x, '.jpg');

        const data = vips.FS.readFile(filename);
        const data2 = colour.writeToBuffer('.jpg');

        expect(data.byteLength).to.equal(data2.byteLength);
        expect(data).to.deep.equal(data2);

        vips.FS.unlink(filename);
      });
      it('memory', function () {
        const x = vips.Target.newToMemory();
        colour.writeToTarget(x, '.jpg');
        const y = colour.writeToBuffer('.jpg');

        expect(x.getBlob()).to.deep.equal(y);
      });
      it('custom', function () {
        if (!vips.FS) {
          return this.skip();
        }
        const filename = vips.Utils.tempName('%s.png');
        const stream = vips.FS.open(filename, 'w');

        let onEndCalled = false;

        const target = new vips.TargetCustom();
        target.onWrite = (ptr, size) =>
          BigInt(vips.FS.write(stream, vips.HEAPU8, ptr, vips.bigintToI53Checked(size)));
        target.onEnd = () => {
          vips.FS.close(stream);
          onEndCalled = true;
          return 0;
        };

        let image = vips.Image.newFromFile(Helpers.jpegFile, {
          access: 'sequential'
        });
        image.writeToTarget(target, '.png');
        expect(onEndCalled).to.equal(true);

        image = vips.Image.newFromFile(Helpers.jpegFile, {
          access: 'sequential'
        });
        const image2 = vips.Image.newFromFile(filename, {
          access: 'sequential'
        });

        expect(image.subtract(image2).abs().max()).to.equal(0);

        vips.FS.unlink(filename);
      });
    });
  });

  it('matrix', function () {
    // Needs matrix connection support
    if (!Helpers.have('matrixload_source') ||
      !Helpers.have('matrixsave_target')) {
      return this.skip();
    }

    const x = vips.Target.newToMemory();
    mono.matrixsaveTarget(x);
    const y = vips.Source.newFromMemory(x.getBlob());
    const im = vips.Image.matrixloadSource(y);

    expect(im.subtract(mono).abs().max()).to.equal(0);
  });

  it('csv', function () {
    // Needs csv connection support
    if (!Helpers.have('csvload_source') ||
      !Helpers.have('csvsave_target')) {
      return this.skip();
    }

    const x = vips.Target.newToMemory();
    mono.csvsaveTarget(x);
    const y = vips.Source.newFromMemory(x.getBlob());
    const im = vips.Image.csvloadSource(y);

    expect(im.subtract(mono).abs().max()).to.equal(0);
  });

  it('ppm', function () {
    // Needs ppm connection support
    if (!Helpers.have('ppmload_source') ||
      !Helpers.have('ppmsave_target')) {
      return this.skip();
    }

    const x = vips.Target.newToMemory();
    mono.ppmsaveTarget(x);
    const y = vips.Source.newFromMemory(x.getBlob());
    const im = vips.Image.ppmloadSource(y);

    expect(im.subtract(mono).abs().max()).to.equal(0);
  });

  it('tiff', function () {
    // Needs tiff connection support
    if (!Helpers.have('tiffload_source') ||
      !Helpers.have('tiffsave_target')) {
      return this.skip();
    }

    const x = vips.Target.newToMemory();
    mono.tiffsaveTarget(x);
    const y = vips.Source.newFromMemory(x.getBlob());
    const im = vips.Image.tiffloadSource(y);

    expect(im.subtract(mono).abs().max()).to.equal(0);
  });
});
