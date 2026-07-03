#preprocess

// https://stackoverflow.com/q/25458104
if (Module['workaroundCors']) {
  Module['mainScriptUrlOrBlob'] ||=
    URL.createObjectURL(new Blob(
#if EXPORT_ES6
      [`import '${import.meta.url}';`],
#else
      [`importScripts('${_scriptName}');`],
#endif
      {'type': 'application/javascript'}));
}
