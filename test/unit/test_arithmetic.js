/* global vips, expect, cleanup */
'use strict';

import * as Helpers from './helpers.js';

describe('arithmetic', () => {
  let globalDeletionQueue;

  let colour;
  let mono;
  let allImages;

  before(function () {
    const im = vips.Image.maskIdeal(100, 100, 0.5, {
      reject: true,
      optical: true
    });
    colour = im.multiply([1, 2, 3]).add([2, 3, 4]);
    mono = colour.extractBand(1);
    allImages = [mono, colour];

    globalDeletionQueue = vips.deletionQueue.splice(0);
  });

  after(function () {
    vips.deletionQueue.push(...globalDeletionQueue);
    cleanup();
  });

  afterEach(function () {
    cleanup();
  });

  function runArith (fn, fmt = Helpers.allFormats) {
    allImages.forEach(x => fmt.forEach(y => fmt.forEach(z =>
      Helpers.runImage2(
        `${fn.name} image ${Helpers.imageToString(x)} ${y} ${z}`,
        x.cast(y), x.cast(z), fn)
    )));
  }

  function runArithConst (fn, fmt = Helpers.allFormats) {
    allImages.forEach(x => fmt.forEach(y =>
      Helpers.runConst(
        `${fn.name} scalar ${Helpers.imageToString(x)} ${y}`,
        fn, x.cast(y), 2)
    ));
    fmt.forEach(y =>
      Helpers.runConst(
        `${fn.name} vector ${Helpers.imageToString(colour)} ${y}`,
        fn, colour.cast(y), [1, 2, 3])
    );
  }

  // run a function on an image,
  // 50,50 and 10,10 should have different values on the test image
  function runImageunary (message, im, fn) {
    Helpers.runCmp(message, im, 50, 50, (x) => Helpers.runFn(fn, x));
    Helpers.runCmp(message, im, 10, 10, (x) => Helpers.runFn(fn, x));
  }

  function runUnary (images, fn, fmt = Helpers.allFormats) {
    images.forEach(x => fmt.forEach(y => runImageunary(`${fn.name} image`, x.cast(y), fn)));
  }

  // run a function on a pair of images
  // 50,50 and 10,10 should have different values on the test image
  // don't loop over band elements
  function runImagebinary (message, left, right, fn) {
    Helpers.runCmp2(message, left, right, 50, 50, fn);
    Helpers.runCmp2(message, left, right, 10, 10, fn);
  }

  function runBinary (images, fn, fmt = Helpers.allFormats) {
    images.forEach(x => fmt.forEach(y => fmt.forEach(z =>
      runImagebinary(`${fn.name} ${y} ${z}`, x.cast(y), x.cast(z), fn)
    )));
  }

  // test all operator overloads we define

  it('add', function () {
    const add = (x, y) => {
      if (x instanceof vips.Image) {
        return x.add(y);
      }
      if (y instanceof vips.Image) {
        return y.add(x);
      }

      return x + y;
    };

    runArithConst(add);
    runArith(add);
  });

  it('sub', function () {
    const sub = (x, y) => {
      if (x instanceof vips.Image) {
        return x.subtract(y);
      }
      if (y instanceof vips.Image) {
        return y.linear(-1, x);
      }

      return x - y;
    };

    runArithConst(sub);
    runArith(sub);
  });

  it('mul', function () {
    const mul = (x, y) => {
      if (x instanceof vips.Image) {
        return x.multiply(y);
      }
      if (y instanceof vips.Image) {
        return y.multiply(x);
      }

      return x * y;
    };

    runArithConst(mul);
    runArith(mul);
  });

  it('div', function () {
    const div = (x, y) => {
      if (x instanceof vips.Image) {
        return x.divide(y);
      }
      if (y instanceof vips.Image) {
        return y.pow(-1).multiply(x);
      }

      return x / y;
    };

    // (const / image) needs (image ** -1), which won't work for complex
    runArithConst(div, Helpers.noncomplexFormats);
    runArith(div);
  });

  it('floordiv', function () {
    const floordiv = (x, y) => {
      if (x instanceof vips.Image) {
        return x.divide(y).floor();
      }
      if (y instanceof vips.Image) {
        return y.pow(-1).multiply(x).floor();
      }

      return Math.floor(x / y);
    };

    // (const / image) needs (image ** -1), which won't work for complex
    runArithConst(floordiv, Helpers.noncomplexFormats);
    runArith(floordiv);
  });

  it('pow', function () {
    const pow = (x, y) => {
      if (x instanceof vips.Image) {
        return x.pow(y);
      }
      if (y instanceof vips.Image) {
        return y.wop(x);
      }

      return x ** y;
    };

    // (image ** x) won't work for complex images ... just test non-complex
    runArithConst(pow, Helpers.noncomplexFormats);
    runArith(pow, Helpers.noncomplexFormats);
  });

  it('and', function () {
    const and = (x, y) => {
      if (x instanceof vips.Image) {
        return x.and(y);
      }
      if (y instanceof vips.Image) {
        return y.and(x);
      }

      return x & y;
    };

    runArithConst(and, Helpers.noncomplexFormats);
    runArith(and, Helpers.noncomplexFormats);
  });

  it('or', function () {
    const or = (x, y) => {
      if (x instanceof vips.Image) {
        return x.or(y);
      }
      if (y instanceof vips.Image) {
        return y.or(x);
      }

      return x | y;
    };

    runArithConst(or, Helpers.noncomplexFormats);
    runArith(or, Helpers.noncomplexFormats);
  });

  it('xor', function () {
    const xor = (x, y) => {
      if (x instanceof vips.Image) {
        return x.eor(y);
      }
      if (y instanceof vips.Image) {
        return y.eor(x);
      }

      return x ^ y;
    };

    runArithConst(xor, Helpers.noncomplexFormats);
    runArith(xor, Helpers.noncomplexFormats);
  });

  it('more', function () {
    const more = (x, y) => {
      if (x instanceof vips.Image) {
        return x.more(y);
      }
      if (y instanceof vips.Image) {
        return y.less(x);
      }

      return x > y ? 255 : 0;
    };

    runArithConst(more);
    runArith(more);
  });

  it('moreEq', function () {
    const moreEq = (x, y) => {
      if (x instanceof vips.Image) {
        return x.moreEq(y);
      }
      if (y instanceof vips.Image) {
        return y.lessEq(x);
      }

      return x >= y ? 255 : 0;
    };

    runArithConst(moreEq);
    runArith(moreEq);
  });

  it('less', function () {
    const less = (x, y) => {
      if (x instanceof vips.Image) {
        return x.less(y);
      }
      if (y instanceof vips.Image) {
        return y.more(x);
      }

      return x < y ? 255 : 0;
    };

    runArithConst(less);
    runArith(less);
  });

  it('lessEq', function () {
    const lessEq = (x, y) => {
      if (x instanceof vips.Image) {
        return x.lessEq(y);
      }
      if (y instanceof vips.Image) {
        return y.moreEq(x);
      }

      return x <= y ? 255 : 0;
    };

    runArithConst(lessEq);
    runArith(lessEq);
  });

  it('equal', function () {
    const equal = (x, y) => {
      if (x instanceof vips.Image) {
        return x.equal(y);
      }
      if (y instanceof vips.Image) {
        return y.equal(x);
      }

      return x === y ? 255 : 0;
    };

    runArithConst(equal);
    runArith(equal);
  });

  it('notEq', function () {
    const notEq = (x, y) => {
      if (x instanceof vips.Image) {
        return x.notEq(y);
      }
      if (y instanceof vips.Image) {
        return y.notEq(x);
      }

      return x !== y ? 255 : 0;
    };

    runArithConst(notEq);
    runArith(notEq);

    // comparisons against out of range values should always fail, and
    // comparisons to fractional values should always fail
    const x = vips.Image.grey(256, 256, {
      uchar: true
    });
    expect(x.equal(1000).max()).to.equal(0);
    expect(x.equal(12).max()).to.equal(255);
    expect(x.equal(12.5).max()).to.equal(0);
  });

  it('abs', function () {
    const abs = (x) => x instanceof vips.Image ? x.abs() : Math.abs(x);

    const im = colour.multiply(-1);
    runUnary([im], abs);
  });

  it('lshift', function () {
    const lshift = (x) => x instanceof vips.Image ? x.lshift(2) : x << 2;

    // we don't support constant << image, treat as a unary
    runUnary(allImages, lshift, Helpers.noncomplexFormats);
  });

  it('rshift', function () {
    const rshift = (x) => x instanceof vips.Image ? x.rshift(2) : x >> 2;

    // we don't support constant >> image, treat as a unary
    runUnary(allImages, rshift, Helpers.noncomplexFormats);
  });

  it('mod', function () {
    const mod = (x) => x instanceof vips.Image ? x.remainder(2) : x % 2;

    // we don't support constant % image, treat as a unary
    runUnary(allImages, mod, Helpers.noncomplexFormats);
  });

  it('pos', function () {
    const pos = (x) => x instanceof vips.Image ? x : +x;

    runUnary(allImages, pos);
  });

  it('neg', function () {
    const neg = (x) => x instanceof vips.Image ? x.multiply(-1) : -x;

    runUnary(allImages, neg);
  });

  it('invert', function () {
    const invert = (x) => x instanceof vips.Image ? x.invert() : (x ^ -1) & 0xff;

    // ~image is trimmed to image max, so it's hard to test for all formats
    // just test uchar
    runUnary(allImages, invert, ['uchar']);
  });

  // test the rest of VipsArithmetic

  it('avg', function () {
    const im = vips.Image.black(50, 100);
    const test = im.insert(im.add(100), 50, 0, {
      expand: true
    });

    for (const fmt of Helpers.allFormats) {
      expect(test.cast(fmt).avg()).to.be.closeTo(50, 1e-6);
    }
  });

  it('deviate', function () {
    const im = vips.Image.black(50, 100);
    const test = im.insert(im.add(100), 50, 0, {
      expand: true
    });

    for (const fmt of Helpers.noncomplexFormats) {
      expect(test.cast(fmt).deviate()).to.be.closeTo(50, 0.01);
    }
  });

  it('polar', function () {
    let im = vips.Image.black(100, 100).add(100);
    im = im.complexform(im);

    im = im.polar();

    expect(im.real().avg()).to.be.closeTo(100 * 2 ** 0.5, 1e-6);
    expect(im.imag().avg()).to.be.closeTo(45, 1e-6);
  });

  it('rect', function () {
    let im = vips.Image.black(100, 100);
    im = im.add(100 * 2 ** 0.5).complexform(im.add(45));

    im = im.rect();

    expect(im.real().avg()).to.be.closeTo(100, 1e-6);
    expect(im.imag().avg()).to.be.closeTo(100, 1e-6);
  });

  it('conjugate', function () {
    let im = vips.Image.black(100, 100).add(100);
    im = im.complexform(im);

    im = im.conj();

    expect(im.real().avg()).to.be.closeTo(100, 1e-6);
    expect(im.imag().avg()).to.be.closeTo(-100, 1e-6);
  });

  it('histFind', function () {
    const im = vips.Image.black(50, 100);
    let test = im.insert(im.add(10), 50, 0, {
      expand: true
    });

    for (const fmt of Helpers.allFormats) {
      const hist = test.cast(fmt).histFind();
      Helpers.assertAlmostEqualObjects(hist.getpoint(0, 0), [5000]);
      Helpers.assertAlmostEqualObjects(hist.getpoint(10, 0), [5000]);
      Helpers.assertAlmostEqualObjects(hist.getpoint(5, 0), [0]);
    }

    test = test.multiply([1, 2, 3]);

    for (const fmt of Helpers.allFormats) {
      let hist = test.cast(fmt).histFind({
        band: 0
      });
      Helpers.assertAlmostEqualObjects(hist.getpoint(0, 0), [5000]);
      Helpers.assertAlmostEqualObjects(hist.getpoint(10, 0), [5000]);
      Helpers.assertAlmostEqualObjects(hist.getpoint(5, 0), [0]);

      hist = test.cast(fmt).histFind({
        band: 1
      });
      Helpers.assertAlmostEqualObjects(hist.getpoint(0, 0), [5000]);
      Helpers.assertAlmostEqualObjects(hist.getpoint(20, 0), [5000]);
      Helpers.assertAlmostEqualObjects(hist.getpoint(5, 0), [0]);
    }
  });

  it('histFindIndexed', function () {
    const im = vips.Image.black(50, 100);
    const test = im.insert(im.add(10), 50, 0, {
      expand: true
    });
    const index = test.divide(10).floor();

    for (const x of Helpers.noncomplexFormats) {
      for (const y of ['uchar', 'ushort']) {
        const a = test.cast(x);
        const b = index.cast(y);
        const hist = a.histFindIndexed(b);

        Helpers.assertAlmostEqualObjects(hist.getpoint(0, 0), [0]);
        Helpers.assertAlmostEqualObjects(hist.getpoint(1, 0), [50000]);
      }
    }
  });

  it('histFindNdim', function () {
    const im = vips.Image.black(100, 100).add([1, 2, 3]);

    for (const fmt of Helpers.noncomplexFormats) {
      let hist = im.cast(fmt).histFindNdim();

      Helpers.assertAlmostEqualObjects(hist.getpoint(0, 0)[0], 10000);
      Helpers.assertAlmostEqualObjects(hist.getpoint(5, 5)[5], 0);

      hist = im.cast(fmt).histFindNdim({
        bins: 1
      });

      Helpers.assertAlmostEqualObjects(hist.getpoint(0, 0)[0], 10000);
      expect(hist.width).to.equal(1);
      expect(hist.height).to.equal(1);
      expect(hist.bands).to.equal(1);
    }
  });

  it('houghCircle', function () {
    const test = vips.Image.black(100, 100).copy();
    test.drawCircle(100, 50, 50, 40);

    for (const fmt of Helpers.allFormats) {
      const im = test.cast(fmt);
      const hough = im.houghCircle({
        min_radius: 35,
        max_radius: 45
      });

      const maxPos = {
        x: true,
        y: true
      };
      const v = hough.max(maxPos);
      const x = maxPos.x;
      const y = maxPos.y;
      const p = hough.getpoint(x, y);
      const r = p.indexOf(v) + 35;

      expect(x).to.be.closeTo(50, 1e-6);
      expect(y).to.be.closeTo(50, 1e-6);
      expect(r).to.be.closeTo(40, 1e-6);
    }
  });

  it('houghLine', function () {
    const test = vips.Image.black(100, 100).copy();
    test.drawLine(100, 10, 90, 90, 10);

    for (const fmt of Helpers.allFormats) {
      const im = test.cast(fmt);
      const hough = im.houghLine();

      const max = hough.maxPos();
      const x = max[0];
      const y = max[1];

      const angle = Math.floor(180.0 * x / hough.width);
      const distance = Math.floor(test.height * y / hough.height);

      expect(angle).to.be.closeTo(45, 1e-6);
      expect(distance).to.be.closeTo(70, 1e-6);
    }
  });

  it('sin', function () {
    const sin = (x) => x instanceof vips.Image ? x.sin() : Math.sin(x * (Math.PI / 180));

    runUnary(allImages, sin, Helpers.noncomplexFormats);
  });

  it('cos', function () {
    const cos = (x) => x instanceof vips.Image ? x.cos() : Math.cos(x * (Math.PI / 180));

    runUnary(allImages, cos, Helpers.noncomplexFormats);
  });

  it('tan', function () {
    const tan = (x) => x instanceof vips.Image ? x.tan() : Math.tan(x * (Math.PI / 180));

    runUnary(allImages, tan, Helpers.noncomplexFormats);
  });

  it('asin', function () {
    const asin = (x) => x instanceof vips.Image ? x.asin() : Math.asin(x) * (180 / Math.PI);

    const im = vips.Image.black(100, 100).add([1, 2, 3]).divide(3.0);
    runUnary([im], asin, Helpers.noncomplexFormats);
  });

  it('acos', function () {
    const acos = (x) => x instanceof vips.Image ? x.acos() : Math.acos(x) * (180 / Math.PI);

    const im = vips.Image.black(100, 100).add([1, 2, 3]).divide(3.0);
    runUnary([im], acos, Helpers.noncomplexFormats);
  });

  it('atan', function () {
    const atan = (x) => x instanceof vips.Image ? x.atan() : Math.atan(x) * (180 / Math.PI);

    const im = vips.Image.black(100, 100).add([1, 2, 3]).divide(3.0);
    runUnary([im], atan, Helpers.noncomplexFormats);
  });

  it('sinh', function () {
    const sinh = (x) => x instanceof vips.Image ? x.sinh() : Math.sinh(x);

    runUnary(allImages, sinh, Helpers.noncomplexFormats);
  });

  it('cosh', function () {
    const cosh = (x) => x instanceof vips.Image ? x.cosh() : Math.cosh(x);

    runUnary(allImages, cosh, Helpers.noncomplexFormats);
  });

  it('tanh', function () {
    const tanh = (x) => x instanceof vips.Image ? x.tanh() : Math.tanh(x);

    runUnary(allImages, tanh, Helpers.noncomplexFormats);
  });

  it('asinh', function () {
    const asinh = (x) => x instanceof vips.Image ? x.asinh() : Math.asinh(x);

    const im = vips.Image.black(100, 100).add([4, 5, 6]).divide(3.0);
    runUnary([im], asinh, Helpers.noncomplexFormats);
  });

  it('acosh', function () {
    const acosh = (x) => x instanceof vips.Image ? x.acosh() : Math.acosh(x);

    const im = vips.Image.black(100, 100).add([4, 5, 6]).divide(3.0);
    runUnary([im], acosh, Helpers.noncomplexFormats);
  });

  it('atanh', function () {
    const atanh = (x) => x instanceof vips.Image ? x.atanh() : Math.atanh(x);

    const im = vips.Image.black(100, 100).add([0, 1, 2]).divide(3.0);
    runUnary([im], atanh, Helpers.noncomplexFormats);
  });

  it('atan2', function () {
    const atan2 = (x, y) => x instanceof vips.Image ? x.atan2(y) : Math.atan2(x[0], y[0]) * (180 / Math.PI);

    const im = vips.Image.black(100, 100).add([1, 2, 3]).divide(3.0);
    const split = new Array(im.bands).fill(0).map((_, i) => im.extractBand(i)); // equivalent of bandsplit
    runBinary(split, atan2, Helpers.noncomplexFormats);
  });

  it('log', function () {
    const log = (x) => x instanceof vips.Image ? x.log() : Math.log(x);

    runUnary(allImages, log, Helpers.noncomplexFormats);
  });

  it('log10', function () {
    const log10 = (x) => x instanceof vips.Image ? x.log10() : Math.log10(x);

    runUnary(allImages, log10, Helpers.noncomplexFormats);
  });

  it('exp', function () {
    const exp = (x) => x instanceof vips.Image ? x.exp() : Math.exp(x);

    runUnary(allImages, exp, Helpers.noncomplexFormats);
  });

  it('exp10', function () {
    const exp10 = (x) => x instanceof vips.Image ? x.exp10() : Math.pow(10, x);

    runUnary(allImages, exp10, Helpers.noncomplexFormats);
  });

  it('floor', function () {
    const floor = (x) => x instanceof vips.Image ? x.floor() : Math.floor(x);

    runUnary(allImages, floor);
  });

  it('ceil', function () {
    const ceil = (x) => x instanceof vips.Image ? x.ceil() : Math.ceil(x);

    runUnary(allImages, ceil);
  });

  it('rint', function () {
    const rint = (x) => x instanceof vips.Image ? x.rint() : Math.round(x);

    runUnary(allImages, rint);
  });

  it('sign', function () {
    const sign = (x) => x instanceof vips.Image ? x.sign() : x > 0 ? 1 : x < 0 ? -1 : 0;

    runUnary(allImages, sign);
  });

  it('max', function () {
    const test = vips.Image.black(100, 100).copy();
    test.drawRect(100, 40, 50, 1, 1);

    for (const fmt of Helpers.allFormats) {
      const maxPos = {
        x: true,
        y: true
      };
      const v = test.cast(fmt).max(maxPos);
      const x = maxPos.x;
      const y = maxPos.y;

      expect(v).to.be.closeTo(100, 1e-6);
      expect(x).to.be.closeTo(40, 1e-6);
      expect(y).to.be.closeTo(50, 1e-6);
    }
  });

  it('min', function () {
    const test = vips.Image.black(100, 100).add(100).copy();
    test.drawRect(0, 40, 50, 1, 1);

    for (const fmt of Helpers.allFormats) {
      const minPos = {
        x: true,
        y: true
      };
      const v = test.cast(fmt).min(minPos);
      const x = minPos.x;
      const y = minPos.y;

      expect(v).to.be.closeTo(0, 1e-6);
      expect(x).to.be.closeTo(40, 1e-6);
      expect(y).to.be.closeTo(50, 1e-6);
    }
  });

  it('measure', function () {
    const im = vips.Image.black(50, 50);
    const test = im.insert(im.add(10), 50, 0, {
      expand: true
    });

    for (const fmt of Helpers.noncomplexFormats) {
      const a = test.cast(fmt);
      const matrix = a.measure(2, 1);
      const p1 = matrix.getpoint(0, 0)[0];
      const p2 = matrix.getpoint(0, 1)[0];

      expect(p1).to.be.closeTo(0, 1e-6);
      expect(p2).to.be.closeTo(10, 1e-6);
    }
  });

  it('findTrim', function () {
    const im = vips.Image.black(50, 60).add(100);
    const test = im.embed(10, 20, 200, 300, {
      extend: 'white'
    });

    for (const x of Helpers.unsignedFormats.concat(Helpers.floatFormats)) {
      const a = test.cast(x);
      const trim = a.findTrim();

      expect(trim.left).to.equal(10);
      expect(trim.top).to.equal(20);
      expect(trim.width).to.equal(50);
      expect(trim.height).to.equal(60);
    }

    const testRgb = test.bandjoin([test, test]);
    const trim = testRgb.findTrim({
      line_art: true,
      background: [255, 255, 255]
    });

    expect(trim.left).to.equal(10);
    expect(trim.top).to.equal(20);
    expect(trim.width).to.equal(50);
    expect(trim.height).to.equal(60);
  });

  it('profile', function () {
    const test = vips.Image.black(100, 100).copy();
    test.drawRect(100, 40, 50, 1, 1);

    for (const fmt of Helpers.noncomplexFormats) {
      const profile = test.cast(fmt).profile();
      const columns = profile.columns;
      const rows = profile.rows;

      let minPos = {
        x: true,
        y: true
      };
      let v = columns.min(minPos);
      let x = minPos.x;
      let y = minPos.y;
      expect(v).to.be.closeTo(50, 1e-6);
      expect(x).to.be.closeTo(40, 1e-6);
      expect(y).to.be.closeTo(0, 1e-6);

      minPos = {
        x: true,
        y: true
      };
      v = rows.min(minPos);
      x = minPos.x;
      y = minPos.y;
      expect(v).to.be.closeTo(40, 1e-6);
      expect(x).to.be.closeTo(0, 1e-6);
      expect(y).to.be.closeTo(50, 1e-6);
    }
  });

  it('project', function () {
    const im = vips.Image.black(50, 50);
    const test = im.insert(im.add(10), 50, 0, {
      expand: true
    });

    for (const x of Helpers.noncomplexFormats) {
      const a = test.cast(x);
      const matrix = a.stats();

      Helpers.assertAlmostEqualObjects(matrix.getpoint(0, 0), [a.min()]);
      Helpers.assertAlmostEqualObjects(matrix.getpoint(1, 0), [a.max()]);
      Helpers.assertAlmostEqualObjects(matrix.getpoint(2, 0), [50 * 50 * 10]);
      Helpers.assertAlmostEqualObjects(matrix.getpoint(3, 0), [50 * 50 * 100]);
      Helpers.assertAlmostEqualObjects(matrix.getpoint(4, 0), [a.avg()]);
      Helpers.assertAlmostEqualObjects(matrix.getpoint(5, 0), [a.deviate()]);

      Helpers.assertAlmostEqualObjects(matrix.getpoint(0, 1), [a.min()]);
      Helpers.assertAlmostEqualObjects(matrix.getpoint(1, 1), [a.max()]);
      Helpers.assertAlmostEqualObjects(matrix.getpoint(2, 1), [50 * 50 * 10]);
      Helpers.assertAlmostEqualObjects(matrix.getpoint(3, 1), [50 * 50 * 100]);
      Helpers.assertAlmostEqualObjects(matrix.getpoint(4, 1), [a.avg()]);
      Helpers.assertAlmostEqualObjects(matrix.getpoint(5, 1), [a.deviate()]);
    }
  });

  it('sum', function () {
    for (const fmt of Helpers.allFormats) {
      const im = vips.Image.black(50, 50);
      let sum = 0;
      const im2 = Array(10).fill(0).map((_, i) => {
        const add = (i + 1) * 10;
        sum += add;
        return im.add(add).cast(fmt);
      });
      const im3 = vips.Image.sum(im2);

      expect(im3.max()).to.be.closeTo(sum, 1e-6);
    }
  });

  it('clamp', function () {
    for (const fmt of Helpers.noncomplexFormats) {
      for (let x = 0; x < 100; x += 10) {
        const im2 = colour.add(x).cast(fmt);
        let im3 = im2.clamp();
        expect(im3.max()).to.be.at.most(1.0);
        expect(im3.min()).to.be.at.least(0.0);

        im3 = im2.clamp({ min: 14, max: 45 });
        expect(im3.max()).to.be.at.most(45);
        expect(im3.min()).to.be.at.least(14);
      }
    }
  });

  it('minpair', function () {
    for (const fmt of Helpers.noncomplexFormats) {
      for (let x = 0; x < 100; x += 10) {
        const im2 = colour.subtract(x).multiply(5).cast(fmt);
        const im3 = im2.minpair(colour);
        const im4 = im2.less(colour).ifthenelse(im2, colour);
        expect(im3.subtract(im4).abs().max()).to.equal(0.0);
      }
    }
  });

  it('maxpair', function () {
    for (const fmt of Helpers.noncomplexFormats) {
      for (let x = 0; x < 100; x += 10) {
        const im2 = colour.subtract(x).multiply(5).cast(fmt);
        const im3 = im2.maxpair(colour);
        const im4 = im2.more(colour).ifthenelse(im2, colour);
        expect(im3.subtract(im4).abs().max()).to.equal(0.0);
      }
    }
  });
});
