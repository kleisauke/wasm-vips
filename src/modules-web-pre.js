// Load dynamic modules by default on Web
// FIXME(kleisauke): https://github.com/emscripten-core/emscripten/issues/16240#issuecomment-1308610797
Module['dynamicLibraries'] = Module['dynamicLibraries'] || ['vips-jxl.wasm', 'vips-heif.wasm'].map(m => new URL(locateFile(m)).pathname);
