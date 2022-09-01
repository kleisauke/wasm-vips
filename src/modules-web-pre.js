// Load vips-jxl.wasm by default
Module['dynamicLibraries'] = Module['dynamicLibraries'] || ['vips-jxl.wasm'].map(m => {
  var scriptDir = new URL('.', _scriptDir).pathname; // Includes trailing slash
  return Module['locateFile'] ? Module['locateFile'](m, scriptDir) : scriptDir + m;
});
