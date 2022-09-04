// Load vips-jxl.wasm by default
Module['dynamicLibraries'] = Module['dynamicLibraries'] || ['vips-jxl.wasm'].map(m => {
  var scriptDir = __dirname + '/';
  return Module['locateFile'] ? Module['locateFile'](m, scriptDir) : scriptDir + m;
});
