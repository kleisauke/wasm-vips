'use strict';

const path = require('path');

// Helpers
const getPath = function (filename) {
  return path.join(__dirname, filename);
};

module.exports = {
  inputJpg: getPath('2569067123_aca715a2ee_o.jpg'), // https://www.flickr.com/photos/grizdave/2569067123/
  inputPng: getPath('alpha-premultiply-2048x1536-paper.png'), // https://gist.github.com/gasi/769cfb9f2359a1fbedc5
  inputWebP: getPath('4.webp'), // https://www.gstatic.com/webp/gallery/4.webp

  // Path for tests requiring human inspection
  path: getPath
};
