/* global vips, expect, cleanup */
'use strict';

describe('draw', () => {
  afterEach(function () {
    cleanup();
  });

  it('drawCircle', function () {
    let im = vips.Image.black(100, 100).copy();
    im.drawCircle(100, 50, 50, 25);

    let pixel = im.getpoint(25, 50);
    expect(pixel.length).to.equal(1);
    expect(pixel[0]).to.equal(100);

    pixel = im.getpoint(26, 50);
    expect(pixel.length).to.equal(1);
    expect(pixel[0]).to.equal(0);

    im = vips.Image.black(100, 100).copy();
    im.drawCircle(100, 50, 50, 25, {
      fill: true
    });

    pixel = im.getpoint(25, 50);
    expect(pixel.length).to.equal(1);
    expect(pixel[0]).to.equal(100);

    pixel = im.getpoint(26, 50);
    expect(pixel[0]).to.equal(100);

    pixel = im.getpoint(24, 50);
    expect(pixel[0]).to.equal(0);
  });

  it('drawFlood', function () {
    const im = vips.Image.black(100, 100).copy();
    im.drawCircle(100, 50, 50, 25);
    im.drawFlood(100, 50, 50);

    const im2 = vips.Image.black(100, 100).copy();
    im2.drawCircle(100, 50, 50, 25, {
      fill: true
    });

    const diff = im.subtract(im2).abs().max();
    expect(diff).to.equal(0);
  });

  it('drawImage', function () {
    const im = vips.Image.black(51, 51).copy();
    im.drawCircle(100, 25, 25, 25, {
      fill: true
    });

    const im2 = vips.Image.black(100, 100).copy();
    im2.drawImage(im, 25, 25);

    const im3 = vips.Image.black(100, 100).copy();
    im3.drawCircle(100, 50, 50, 25, {
      fill: true
    });

    const diff = im2.subtract(im3).abs().max();
    expect(diff).to.equal(0);
  });

  it('drawLine', function () {
    const im = vips.Image.black(100, 100).copy();
    im.drawLine(100, 0, 0, 100, 0);

    let pixel = im.getpoint(0, 0);
    expect(pixel.length).to.equal(1);
    expect(pixel[0]).to.equal(100);

    pixel = im.getpoint(0, 1);
    expect(pixel.length).to.equal(1);
    expect(pixel[0]).to.equal(0);
  });

  it('drawMask', function () {
    const mask = vips.Image.black(51, 51).copy();
    mask.drawCircle(128, 25, 25, 25, {
      fill: true
    });

    const im = vips.Image.black(100, 100).copy();
    im.drawMask(200, mask, 25, 25);

    const im2 = vips.Image.black(100, 100).copy();
    im2.drawCircle(100, 50, 50, 25, {
      fill: true
    });

    const diff = im.subtract(im2).abs().max();
    expect(diff).to.equal(0);
  });

  it('drawRect', function () {
    const im = vips.Image.black(100, 100).copy();
    im.drawRect(100, 25, 25, 50, 50, {
      fill: true
    });

    const im2 = vips.Image.black(100, 100).copy();
    for (let y = 25; y < 75; y++) {
      im2.drawLine(100, 25, y, 74, y);
    }

    const diff = im.subtract(im2).abs().max();
    expect(diff).to.equal(0);
  });

  it('drawSmudge', function () {
    const im = vips.Image.black(100, 100).copy();
    im.drawCircle(100, 50, 50, 25, {
      fill: true
    });

    const im2 = im.crop(10, 10, 50, 50).copy();

    const im3 = vips.Image.black(100, 100).copy();
    im3.drawCircle(100, 50, 50, 25, {
      fill: true
    });
    im3.drawSmudge(10, 10, 50, 50);
    im3.drawImage(im2, 10, 10);

    const diff = im3.subtract(im).abs().max();
    expect(diff).to.equal(0);
  });
});
