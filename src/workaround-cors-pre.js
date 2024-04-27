// https://stackoverflow.com/q/25458104
if (Module['workaroundCors']) {
  Module['mainScriptUrlOrBlob'] = Module['mainScriptUrlOrBlob'] ||
    URL.createObjectURL(new Blob(
      [`importScripts('${_scriptName}');`],
      {'type': 'application/javascript'}));
}
