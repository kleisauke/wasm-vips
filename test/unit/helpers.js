'use strict';

export const JPEG_FILE = getPath('sample.jpg');
export const TRUNCATED_FILE = getPath('truncated.jpg');
export const PNG_FILE = getPath('sample.png');
export const TIF_FILE = getPath('sample.tif');
export const TIF1_FILE = getPath('1bit.tif');
export const TIF2_FILE = getPath('2bit.tif');
export const TIF4_FILE = getPath('4bit.tif');
export const OME_FILE = getPath('multi-channel-z-series.ome.tif');
export const ANALYZE_FILES = [getPath('t00740_tr1_segm.hdr'), getPath('t00740_tr1_segm.img')];
export const GIF_FILE = getPath('cramps.gif');
export const GIF_ANIM_FILE = getPath('cogs.gif');
export const WEBP_FILE = getPath('1.webp');
export const SRGB_FILE = getPath('sRGB.icm');
export const MOSAIC_FILES = [
    getPath('cd1.1.jpg'), getPath('cd1.2.jpg'),
    getPath('cd2.1.jpg'), getPath('cd2.2.jpg'),
    getPath('cd3.1.jpg'), getPath('cd3.2.jpg'),
    getPath('cd4.1.jpg'), getPath('cd4.2.jpg')
]
export const TEST_FILES = [
    JPEG_FILE,
    TRUNCATED_FILE,
    PNG_FILE,
    TIF_FILE,
    TIF1_FILE,
    TIF2_FILE,
    TIF4_FILE,
    OME_FILE,
    GIF_FILE,
    GIF_ANIM_FILE,
    WEBP_FILE,
    SRGB_FILE
].concat(ANALYZE_FILES).concat(MOSAIC_FILES);

export const MOSAIC_MARKS = [
    [489, 140], [66, 141],
    [453, 40], [15, 43],
    [500, 122], [65, 121],
    [495, 58], [40, 57]
]
export const MOSAIC_VERTICAL_MARKS = [
    [388, 44], [364, 346],
    [384, 17], [385, 629],
    [527, 42], [503, 959]
]

export const unsigned_formats = ['uchar', 'ushort', 'uint'];
export const signed_formats = ['char', 'short', 'int'];
export const float_formats = ['float', 'double'];
export const complex_formats = ['complex', 'dpcomplex'];
export const int_formats = unsigned_formats.concat(signed_formats);
export const noncomplex_formats = int_formats.concat(float_formats);
export const all_formats = noncomplex_formats.concat(complex_formats);

export const colour_colourspaces = ['xyz', 'lab', 'lch', 'cmc', 'labs', 'scrgb', 'hsv', 'srgb', 'yxy'];
export const cmyk_colourspaces = ['cmyk'];
export const coded_colourspaces = ['labq'];
export const mono_colourspaces = ['b-w'];
export const sixteenbit_colourspaces = ['grey16', 'rgb16'];
export const all_colourspaces = colour_colourspaces.concat(mono_colourspaces)
    .concat(coded_colourspaces)
    .concat(sixteenbit_colourspaces)
    .concat(cmyk_colourspaces);

export const max_value = {
    'uchar': 0xff,
    'ushort': 0xffff,
    'uint': 0xffffffff,
    'char': 0x7f,
    'short': 0x7fff,
    'int': 0x7fffffff,
    'float': 1.0,
    'double': 1.0,
    'complex': 1.0,
    'dpcomplex': 1.0
};
export const sizeof_format = {
    'uchar': 1,
    'ushort': 2,
    'uint': 4,
    'char': 1,
    'short': 2,
    'int': 4,
    'float': 4,
    'double': 8,
    'complex': 8,
    'dpcomplex': 16
};

export const rot45_angles = ['d0', 'd45', 'd90', 'd135', 'd180', 'd225', 'd270', 'd315'];
export const rot45_angle_bonds = ['d0'].concat(rot45_angles.slice(1).reverse());
export const rot_angles = ['d0', 'd90', 'd180', 'd270'];
export const rot_angle_bonds = ['d0'].concat(rot_angles.slice(1).reverse());

export function getPath(filename) {
    return typeof window === 'undefined' ?
        // Node.js
        path.join(path.dirname(url.fileURLToPath(import.meta.url)), 'images', filename) :
        // Browser
        'images/' + filename;
}

// a function that mimics Python's zip behaviour on edge cases
// where the arrays are not the same size.
export function zip() {
    const args = [].slice.call(arguments);
    const shortest = args.length === 0 ? [] : args.reduce((a, b) => a.length < b.length ? a : b);
    return shortest.map((_, i) => args.map(array => array[i]));
}

// an expanding zip ... if either of the args is a scalar or a one-element
// array, duplicate it down the other side
export function zip_expand(x, y) {
    // handle singleton array case
    if (Array.isArray(x) && x.length === 1)
        x = x[0];
    if (Array.isArray(y) && y.length === 1)
        y = y[0];

    if (Array.isArray(x) && Array.isArray(y))
        return zip(x, y);
    else if (Array.isArray(x))
        return x.map((value) => [value, y]);
    else if (Array.isArray(y))
        return y.map((value) => [x, value]);
    else
        return [[x, y]]
}

// run a 1-ary function on a thing -- loop over elements if the
// thing is a array or vector
export function run_fn(fn, x, y) {
    return Array.isArray(x) ? x.map(value => fn(value)) : fn(x);
}

// run a 2-ary function on two things -- loop over elements pairwise if the
// things are arrays or vectors
export function run_fn2(fn, x, y) {
    if (x instanceof vips.Image || y instanceof vips.Image)
        return fn(x, y);
    else if (x instanceof Array || y instanceof Array)
        return zip_expand(x, y).map(value => fn(value[0], value[1]));
    else
        return fn(x, y);
}

// test for an operator exists
export function have(name) {
    return vips.Utils.typeFind('VipsOperation', name) !== 0;
}

// test a pair of things for approx. equality
export function assert_almost_equal_objects(a, b, delta = 0.0001, msg = '') {
    zip_expand(a, b).forEach(value => {
        expect(value[0], msg).to.be.closeTo(value[1], delta)
    });
}

// test a pair of things for difference less than a threshold
export function assert_less_threshold(a, b, diff) {
    zip_expand(a, b).forEach(value => expect(Math.abs(value[0] - value[1])).to.be.below(diff));
}

// run a function on an image and on a single pixel, the results
// should match
export function run_cmp(message, im, x, y, fn) {
    const a = im.getpoint(x, y);
    const v1 = fn(a);
    const im2 = fn(im);
    const v2 = im2.getpoint(x, y);
    assert_almost_equal_objects(v1, v2, 0.0001, message);
}

// run a function on an image and on a single pixel, the results
// should match
export function run_image(message, im, fn) {
    run_cmp(message, im, 50, 50, fn);
    run_cmp(message, im, 10, 10, fn);
}

// run a function on (image, constant), and on (constant, image).
// 50,50 and 10,10 should have different values on the test image
export function run_const(message, fn, im, c) {
    run_cmp(message, im, 50, 50, (x) => run_fn2(fn, x, c));
    run_cmp(message, im, 50, 50, (x) => run_fn2(fn, c, x));
    run_cmp(message, im, 10, 10, (x) => run_fn2(fn, x, c));
    run_cmp(message, im, 10, 10, (x) => run_fn2(fn, c, x));
}

// run a function on a pair of images and on a pair of pixels, the results
// should match
export function run_cmp2(message, left, right, x, y, fn) {
    const a = left.getpoint(x, y);
    const b = right.getpoint(x, y);
    const v1 = fn(a, b);
    const after = fn(left, right);
    const v2 = after.getpoint(x, y);
    assert_almost_equal_objects(v1, v2, 0.0001, message);
}

// run a function on a pair of images
// 50,50 and 10,10 should have different values on the test image
export function run_image2(message, left, right, fn) {
    run_cmp2(message, left, right, 50, 50, (x, y) => run_fn2(fn, x, y));
    run_cmp2(message, left, right, 10, 10, (x, y) => run_fn2(fn, x, y));
}

// a string that represents the image
export function image_to_string(im) {
    return `<vips.Image ${im.width}x${im.height} ${im.format}, ${im.bands} bands, ${im.interpretation}>`;
}

export function make_repeated(arr, repeats) {
    return [].concat(...Array.from({length: repeats}, () => arr));
}
