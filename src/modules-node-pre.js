// Load dynamic modules by default on Node.js
// FIXME(kleisauke): https://github.com/emscripten-core/emscripten/issues/16240#issuecomment-1308610797
Module['dynamicLibraries'] = Module['dynamicLibraries'] || ['vips-jxl.wasm', 'vips-heif.wasm'].map(m => locateFile(m));
