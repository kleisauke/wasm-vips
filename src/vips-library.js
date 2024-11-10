var LibraryVips = {
  $VIPS__deps: [
#if ENVIRONMENT_MAY_BE_WEB
    '$ENV',
#endif
    '$ClassHandle',
    '$Emval',
    '$deletionQueue',
  ],
  $VIPS__postset: 'VIPS.init();',
  $VIPS: {
    init() {
      addOnPreRun(() => {
#if ENVIRONMENT_MAY_BE_WEB
        // Enforce a fixed thread pool by default on web
        ENV['VIPS_MAX_THREADS'] = {{{ PTHREAD_POOL_SIZE }}};

        // We cannot safely spawn dedicated workers on the web. Therefore, to avoid any potential deadlocks, we reduce
        // the concurrency to 1. For more details, see:
        // https://emscripten.org/docs/porting/pthreads.html#blocking-on-the-main-browser-thread
        ENV['VIPS_CONCURRENCY'] = 1;
#endif
#if ENVIRONMENT_MAY_BE_NODE
        // libvips stores temporary files by default in `/tmp`;
        // set the TMPDIR env variable to override this directory
        ENV['TMPDIR'] = require('os').tmpdir();
#endif
      });

      addOnInit(() => {
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
DEFAULT_LIBRARY_FUNCS_TO_INCLUDE.push('$VIPS');
