/* global vips, expect */
'use strict';

export const jpegFile = getPath('sample.jpg');
export const jxlFile = getPath('sample.jxl');
export const truncatedFile = getPath('truncated.jpg');
export const pngFile = getPath('sample.png');
export const vipsFile = getPath('sample.vips');
export const tifFile = getPath('sample.tif');
export const tif1File = getPath('1bit.tif');
export const tif2File = getPath('2bit.tif');
export const tif4File = getPath('4bit.tif');
export const omeFile = getPath('multi-channel-z-series.ome.tif');
export const analyzeFiles = [getPath('t00740_tr1_segm.hdr'), getPath('t00740_tr1_segm.img')];
export const gifFile = getPath('cramps.gif');
export const gifAnimFile = getPath('cogs.gif');
export const webpFile = getPath('1.webp');
export const webpAnimFile = getPath('big-height.webp');
export const srgbFile = getPath('sRGB.icm');
export const avifFile = getPath('avif-orientation-6.avif');
export const avifFileHuge = getPath('17000x17000.avif');
export const rgbaFile = getPath('rgba.png');
export const rgbaCorrectFile = getPath('rgba-correct.ppm');
export const svgFile = getPath('logo.svg');
export const svgzFile = getPath('logo.svgz');
export const svgGzFile = getPath('logo.svg.gz');
export const mosaicFiles = [
  getPath('cd1.1.jpg'), getPath('cd1.2.jpg'),
  getPath('cd2.1.jpg'), getPath('cd2.2.jpg'),
  getPath('cd3.1.jpg'), getPath('cd3.2.jpg'),
  getPath('cd4.1.jpg'), getPath('cd4.2.jpg')
];
export const testFiles = [
  jpegFile,
  jxlFile,
  truncatedFile,
  pngFile,
  vipsFile,
  tifFile,
  tif1File,
  tif2File,
  tif4File,
  omeFile,
  gifFile,
  gifAnimFile,
  webpFile,
  webpAnimFile,
  avifFile,
  avifFileHuge,
  srgbFile,
  rgbaFile,
  rgbaCorrectFile,
  svgFile,
  svgzFile,
  svgGzFile
].concat(analyzeFiles).concat(mosaicFiles);

export const mosaicMarks = [
  [489, 140], [66, 141],
  [453, 40], [15, 43],
  [500, 122], [65, 121],
  [495, 58], [40, 57]
];
export const mosaicVerticalMarks = [
  [388, 44], [364, 346],
  [384, 17], [385, 629],
  [527, 42], [503, 959]
];

export const unsignedFormats = ['uchar', 'ushort', 'uint'];
export const signedFormats = ['char', 'short', 'int'];
export const floatFormats = ['float', 'double'];
export const complexFormats = ['complex', 'dpcomplex'];
export const intFormats = unsignedFormats.concat(signedFormats);
export const noncomplexFormats = intFormats.concat(floatFormats);
export const allFormats = noncomplexFormats.concat(complexFormats);

export const colourColourspaces = [
  'xyz', 'lab', 'lch', 'cmc', 'labs', 'scrgb',
  'hsv', 'srgb', 'yxy', 'oklab', 'oklch'
];
export const cmykColourspaces = ['cmyk'];
export const codedColourspaces = ['labq'];
export const monoColourspaces = ['b-w'];
export const sixteenbitColourspaces = ['grey16', 'rgb16'];
export const allColourspaces = colourColourspaces.concat(monoColourspaces)
  .concat(codedColourspaces)
  .concat(sixteenbitColourspaces)
  .concat(cmykColourspaces);

export const maxValue = {
  uchar: 0xff,
  ushort: 0xffff,
  uint: 0xffffffff,
  char: 0x7f,
  short: 0x7fff,
  int: 0x7fffffff,
  float: 1.0,
  double: 1.0,
  complex: 1.0,
  dpcomplex: 1.0
};
export const sizeofFormat = {
  uchar: 1,
  ushort: 2,
  uint: 4,
  char: 1,
  short: 2,
  int: 4,
  float: 4,
  double: 8,
  complex: 8,
  dpcomplex: 16
};

export const rot45Angles = ['d0', 'd45', 'd90', 'd135', 'd180', 'd225', 'd270', 'd315'];
export const rot45AngleBonds = ['d0'].concat(rot45Angles.slice(1).reverse());
export const rotAngles = ['d0', 'd90', 'd180', 'd270'];
export const rotAngleBonds = ['d0'].concat(rotAngles.slice(1).reverse());

export function getPath (filename) {
  return typeof window === 'undefined'
    // Node.js
    ? './images/' + filename
    // Browser
    : filename;
}

// a function that mimics Python's zip behaviour on edge cases
// where the arrays are not the same size.
export function zip () {
  const args = [].slice.call(arguments);
  const shortest = args.length === 0 ? [] : args.reduce((a, b) => a.length < b.length ? a : b);
  return shortest.map((_, i) => args.map(array => array[i]));
}

// an expanding zip ... if either of the args is a scalar or a one-element
// array, duplicate it down the other side
export function zipExpand (x, y) {
  // handle singleton array case
  if (Array.isArray(x) && x.length === 1) {
    x = x[0];
  }
  if (Array.isArray(y) && y.length === 1) {
    y = y[0];
  }

  if (Array.isArray(x) && Array.isArray(y)) {
    return zip(x, y);
  } else if (Array.isArray(x)) {
    return x.map((value) => [value, y]);
  } else if (Array.isArray(y)) {
    return y.map((value) => [x, value]);
  } else {
    return [[x, y]];
  }
}

// run a 1-ary function on a thing -- loop over elements if the
// thing is an array or vector
export function runFn (fn, x) {
  return Array.isArray(x) ? x.map(value => fn(value)) : fn(x);
}

// run a 2-ary function on two things -- loop over elements pairwise if the
// things are arrays or vectors
export function runFn2 (fn, x, y) {
  if (x instanceof vips.Image || y instanceof vips.Image) {
    return fn(x, y);
  } else if (x instanceof Array || y instanceof Array) {
    return zipExpand(x, y).map(value => fn(value[0], value[1]));
  } else {
    return fn(x, y);
  }
}

// test for an operator exists
export function have (name) {
  return vips.Utils.typeFind('VipsOperation', name) !== 0;
}

// test a pair of things for approx. equality
export function assertAlmostEqualObjects (a, b, delta = 0.0001, msg = '') {
  zipExpand(a, b).forEach(value => {
    expect(value[0], msg).to.be.closeTo(value[1], delta);
  });
}

// test a pair of things for difference less than a threshold
export function assertLessThreshold (a, b, diff) {
  zipExpand(a, b).forEach(value => expect(Math.abs(value[0] - value[1])).to.be.below(diff));
}

// run a function on an image and on a single pixel, the results
// should match
export function runCmp (message, im, x, y, fn) {
  const a = im.getpoint(x, y);
  const v1 = fn(a);
  const im2 = fn(im);
  const v2 = im2.getpoint(x, y);
  assertAlmostEqualObjects(v1, v2, 0.0001, message);
}

// run a function on an image and on a single pixel, the results
// should match
export function runImage (message, im, fn) {
  runCmp(message, im, 50, 50, fn);
  runCmp(message, im, 10, 10, fn);
}

// run a function on (image, constant), and on (constant, image).
// 50,50 and 10,10 should have different values on the test image
export function runConst (message, fn, im, c) {
  runCmp(message, im, 50, 50, (x) => runFn2(fn, x, c));
  runCmp(message, im, 50, 50, (x) => runFn2(fn, c, x));
  runCmp(message, im, 10, 10, (x) => runFn2(fn, x, c));
  runCmp(message, im, 10, 10, (x) => runFn2(fn, c, x));
}

// run a function on a pair of images and on a pair of pixels, the results
// should match
export function runCmp2 (message, left, right, x, y, fn) {
  const a = left.getpoint(x, y);
  const b = right.getpoint(x, y);
  const v1 = fn(a, b);
  const after = fn(left, right);
  const v2 = after.getpoint(x, y);
  assertAlmostEqualObjects(v1, v2, 0.0001, message);
}

// run a function on a pair of images
// 50,50 and 10,10 should have different values on the test image
export function runImage2 (message, left, right, fn) {
  runCmp2(message, left, right, 50, 50, (x, y) => runFn2(fn, x, y));
  runCmp2(message, left, right, 10, 10, (x, y) => runFn2(fn, x, y));
}

// a string that represents the image
export function imageToString (im) {
  return `<vips.Image ${im.width}x${im.height} ${im.format}, ${im.bands} bands, ${im.interpretation}>`;
}

export function makeRepeated (arr, repeats) {
  return [].concat(...Array.from({ length: repeats }, () => arr));
}
