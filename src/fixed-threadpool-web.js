addToLibrary({
  $VIPS__deps: ['$ENV'],
  $VIPS__postset: 'VIPS.enforce_fixed_threadpool();',
  $VIPS: {
    enforce_fixed_threadpool: () => {
      addOnPreRun(() => {
        // Enforce a fixed thread pool by default on web
        ENV['VIPS_MAX_THREADS'] = {{{ PTHREAD_POOL_SIZE }}};
      });
    }
  }
});

DEFAULT_LIBRARY_FUNCS_TO_INCLUDE.push('$VIPS');
