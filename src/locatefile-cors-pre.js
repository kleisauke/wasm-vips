var workerObjectURL;

// https://stackoverflow.com/q/25458104
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
