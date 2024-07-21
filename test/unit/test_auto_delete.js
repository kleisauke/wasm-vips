/* global vips, expect, cleanup */
'use strict';

describe('auto delete', () => {
  after(function () {
    cleanup();
    expect(vips.deletionQueue.length).to.equal(0);
  });

  it('auto delete', function () {
    const im = vips.Image.black(100, 100);
    expect(vips.deletionQueue.length).to.equal(1);
    expect(() => im.clone()).to.throw(/Object already scheduled for deletion/);

    im.gaussblur(0.3); // creates new handle
    expect(vips.deletionQueue.length).to.equal(2);

    cleanup();
    expect(vips.deletionQueue.length).to.equal(0);
  });

  describe('preventAutoDelete', () => {
    it('all handles', function () {
      const handles = Object.entries(vips).filter(
        ([key, Handle]) =>
          key !== 'Object' && !!Handle?.prototype?.preventAutoDelete
      );
      expect(handles.length).to.equal(12);

      for (const [name] of handles) {
        const h = new vips[name]();
        expect(vips.deletionQueue.length).to.equal(1);

        h.preventAutoDelete();
        expect(vips.deletionQueue.length).to.equal(0);

        h.delete();
        expect(() => h.delete()).to.throw(new RegExp(`${name} instance already deleted`));
      }
    });

    it('cloned handle', function () {
      const im = new vips.Image();
      expect(vips.deletionQueue.length).to.equal(1);

      im.preventAutoDelete();
      expect(vips.deletionQueue.length).to.equal(0);

      // cloned objects do not retain prevent auto delete status
      const cloned = im.clone();
      expect(vips.deletionQueue.length).to.equal(1);

      cleanup();
      expect(vips.deletionQueue.length).to.equal(0);

      im.delete(); // should not fail
      expect(() => im.delete()).to.throw(/Image instance already deleted/);

      // already deleted by cleanup, should fail
      expect(() => cloned.delete()).to.throw(/Image instance already deleted/);
    });
  });
});
