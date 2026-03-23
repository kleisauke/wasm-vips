var LibraryVips = {
  $VIPS__deps: [
    '$ENV',
    '$ClassHandle',
    '$Emval',
    '$deletionQueue',
    '$addOnPreRun',
    '$addOnPostCtor',
  ],
  $VIPS__postset: 'VIPS.init();',
  $VIPS: {
    init() {
      addOnPreRun(() => {
#if ENVIRONMENT_MAY_BE_WEB
        // On the web, raise VIPS_DISC_THRESHOLD (default: 100 MiB of uncompressed pixel data) to ensure large images
        // are processed in-memory. This avoids spilling to temporary `/tmp` files via MEMFS (JS-based filesystem or
        // WasmFS), which would otherwise incur costly Wasm <-> JS crossings or internal filesystem abstractions
        // (virtual calls, bounds checks and buffer resizing).
        ENV['VIPS_DISC_THRESHOLD'] = {{{ MAXIMUM_MEMORY }}};

        // Enforce a fixed thread pool by default on the web.
        ENV['VIPS_MAX_THREADS'] = {{{ PTHREAD_POOL_SIZE }}};

        // We cannot safely spawn dedicated workers on the web. Therefore, to avoid any potential deadlocks, we reduce
        // the concurrency to 1. For more details, see:
        // https://emscripten.org/docs/porting/pthreads.html#blocking-on-the-main-browser-thread
        ENV['VIPS_CONCURRENCY'] = 1;
#endif
#if ENVIRONMENT_MAY_BE_NODE
        // libvips stores temporary files by default in `/tmp`; set the TMPDIR env variable to override this directory.
        ENV['TMPDIR'] = require('node:os').tmpdir();
#endif
      });

      addOnPostCtor(() => {
        // SourceCustom.onRead marshaller 
        const sourceCustom = Object.getOwnPropertyDescriptor(Module['SourceCustom'].prototype, 'onRead');
        Object.defineProperty(Module['SourceCustom'].prototype, 'onRead', {
          set(cb) {
            return sourceCustom.set.call(this, (length) => Emval.toHandle(cb(length)));
          }
        });

        // TargetCustom.onWrite marshaller 
        const targetCustom = Object.getOwnPropertyDescriptor(Module['TargetCustom'].prototype, 'onWrite');
        Object.defineProperty(Module['TargetCustom'].prototype, 'onWrite', {
          set(cb) {
            return targetCustom.set.call(this, (data) => cb(Emval.toValue(data)));
          }
        });
      });

      // Add preventAutoDelete method to ClassHandle
      Object.assign(ClassHandle.prototype, {
        'preventAutoDelete'() {
          const index = deletionQueue.indexOf(this);
          if (index > -1) {
            deletionQueue.splice(index, 1);
          }
          this.$$.deleteScheduled = false;
          return this;
        }
      });
    }
  }
}

addToLibrary(LibraryVips);
extraLibraryFuncs.push('$VIPS');
