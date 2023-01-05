// https://stackoverflow.com/q/25458104
if (Module['workaroundCors']) {
  var workerObjectURL;

  Module['locateFile'] = Module['locateFile'] || function (fileName, scriptDirectory) {
    var url = scriptDirectory + fileName;
    if (url.endsWith('.worker.js')) {
      if (workerObjectURL) return workerObjectURL;
      workerObjectURL = URL.createObjectURL(new Blob(
        [`importScripts('${url}');`],
        {'type': 'application/javascript'}));
      return workerObjectURL;
    }
    return url;
  }
}
