export const dynamicModules = [
  {
    name: 'JPEG XL save/load',
    id: 'jxl',
    file: 'vips-jxl.wasm',
    default: true
  },
  {
    name: 'AVIF save/load',
    id: 'heif',
    file: 'vips-heif.wasm',
    default: true
  },
  {
    name: 'SVG load (no text support)',
    id: 'resvg',
    file: 'vips-resvg.wasm',
    default: false
  }
];

export const playSamples = [
  {
    chapter: 'Filter',
    name: 'Duotone',
    id: 'duotone',
    path: 'filter/duotone'
  },
  {
    chapter: 'Filter',
    name: 'Modulate',
    id: 'modulate',
    path: 'filter/modulate'
  },
  {
    chapter: 'Filter',
    name: 'Tint',
    id: 'tint',
    path: 'filter/tint'
  },
  {
    chapter: 'Filter',
    name: 'Sepia',
    id: 'sepia',
    path: 'filter/sepia'
  },
  {
    chapter: 'Filter',
    name: 'Emboss',
    id: 'emboss',
    path: 'filter/emboss'
  },
  {
    chapter: 'Filter',
    name: 'Gaussian blur',
    id: 'gaussian-blur',
    path: 'filter/gaussian-blur'
  },
  {
    chapter: 'Filter',
    name: 'Sharpen',
    id: 'sharpen',
    path: 'filter/sharpen'
  },
  {
    chapter: 'Edge detection',
    name: 'Canny',
    id: 'canny',
    path: 'edge-detection/canny'
  },
  {
    chapter: 'Edge detection',
    name: 'Sobel',
    id: 'sobel',
    path: 'edge-detection/sobel'
  },
  {
    chapter: 'Other',
    name: 'Embed / Multiply / Convolution',
    id: 'embed-multiply-convolution',
    path: 'other/embed-multiply-convolution'
  },
  {
    chapter: 'Other',
    name: 'Smartcrop',
    id: 'smartcrop',
    path: 'other/smartcrop'
  },
  {
    chapter: 'Other',
    name: 'Watermark',
    id: 'watermark',
    path: 'other/watermark'
  },
  {
    chapter: 'Other',
    name: 'Animated WebP/GIF',
    id: 'animated-image',
    path: 'other/animated-image'
  },
  {
    chapter: 'Other',
    name: 'Histogram',
    id: 'histogram',
    path: 'other/histogram'
  },
  {
    chapter: 'Other',
    name: 'Optional output',
    id: 'optional-output',
    path: 'other/optional-output'
  },
  {
    chapter: 'Other',
    name: 'JSON output',
    id: 'json-output',
    path: 'other/json-output'
  }
];
