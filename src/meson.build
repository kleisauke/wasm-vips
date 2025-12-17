wasm_vips_sources = files(
    'bindings/connection.cpp',
    'bindings/image.cpp',
    'bindings/interpolate.cpp',
    'bindings/option.cpp',
    'bindings/utils.cpp',
    'vips-emscripten.cpp',
)

wasm_vips_headers = files(
    'bindings/connection.h',
    'bindings/error.h',
    'bindings/image.h',
    'bindings/interpolate.h',
    'bindings/object.h',
    'bindings/option.h',
    'bindings/utils.h',
)

source_dir = meson.current_source_dir()

wasm_vips_glue_lib = cpp.find_library('vips-library.js', dirs: source_dir)

wasm_vips_lib = static_library('wasm-vips',
    wasm_vips_sources,
    wasm_vips_headers,
    dependencies: [vips_dep, embind_dep],
    gnu_symbol_visibility: 'hidden',
)

wasm_vips_dep = declare_dependency(
    link_whole: wasm_vips_lib,
    dependencies: [vips_dep, embind_dep, wasm_vips_glue_lib],
)

# Handy for debugging
# --threadprofiler
# -sSAFE_HEAP=2
# -sPTHREADS_DEBUG
# -sLIBRARY_DEBUG
# -sEXCEPTION_DEBUG
# -sSYSCALL_DEBUG
# -sDYLINK_DEBUG

# AddressSanitizer 4GiB debug build
# 4GiB - 100MiB (ASan + pthreads extra increment) - 512MiB (shadow size, 1/8th of 4GiB) - 256KiB (stack size)
# -sINITIAL_MEMORY=3652976640

# note 1: `ALLOW_MEMORY_GROWTH` may run non-wasm code slowly. See: https://github.com/WebAssembly/design/issues/1271.
# note 2: Browsers appear to limit the maximum initial memory size to 1GB, set `INITIAL_MEMORY` accordingly.
# note 3: Build with `-sALLOW_TABLE_GROWTH` so that we can store the read, seek, write and finish signals.
# note 4: To ensure the testsuite passes, increase (main-)thread's stack size from 64kb to 256kb. This should be
#         reasonable for image processing in Wasm, and given that libvips enforces a minimum thread stack size of 2mb
#         on other POSIX platforms.
main_link_args = [
    '-sAUTOLOAD_DYLIBS=0',
    '-sABORTING_MALLOC=0',
    # Note: mimalloc is incompatible with AddressSanitizer
    '-sMALLOC=mimalloc',
    '-sMODULARIZE',
    '-sEXPORT_NAME=Vips',
    '-sEXIT_RUNTIME',
    '-sINITIAL_MEMORY=1GB',
    '-sSTACK_SIZE=256KB',
    '-sALLOW_TABLE_GROWTH',
    '-sTEXTDECODER=2',
    '-sASSERTIONS=@0@'.format(get_option('debug') ? '2' : '0'),
    '-sFORCE_FILESYSTEM',
    '-sEXPORTED_RUNTIME_METHODS=FS,ENV,deletionQueue,addFunction,setAutoDeleteLater,setDelayFunction',
    '-sEXCEPTION_STACK_TRACES',
    '-sBINARYEN_EXTRA_PASSES=--emit-target-features',
]

if get_option('optimization') not in ['0', 'g']
    main_link_args += [
        '--closure=1',
        '--closure-args=--externs=@0@'.format(source_dir / 'closure-externs' / 'wasm-vips.js'),
    ]
endif

if get_option('modules')
    main_link_args += [
        '-sMAIN_MODULE=2',
        '--pre-js=@0@'.format(source_dir / 'modules-pre.js'),
    ]
endif

if get_option('wasmfs')
    main_link_args += ['-sWASMFS']
endif

if 'web' in get_option('environments')
    # libvips requires spawning at least VIPS_CONCURRENCY threads synchronously, with a minimum of 3 threads per
    # pipeline. This count includes the two write-behind background threads used by `vips_sink_disc`. To support up to
    # two concurrent pipelines, we need to double that number. Therefore, build with:
    # `-sPTHREAD_POOL_SIZE='Math.max(navigator.hardwareConcurrency, 6)'`.
    # Only needed on the web, pthreads on Node.js can be spawned synchronously without waiting for an event loop tick.
    web_link_args = [
        '--use-preload-plugins',
        '-sPTHREAD_POOL_SIZE=navigator.hardwareConcurrency>6?navigator.hardwareConcurrency:6',
        '-sMIN_CHROME_VERSION=95',
        '-sMIN_FIREFOX_VERSION=100',
        '-sMIN_SAFARI_VERSION=160400',
    ]

    executable('vips',
        dependencies: wasm_vips_dep,
        link_args: [
            main_link_args,
            web_link_args,
            '--pre-js=@0@'.format(source_dir / 'workaround-cors-pre.js'),
            '-sENVIRONMENT=web',
        ],
        install: true,
    )

    executable('vips-es6',
        dependencies: wasm_vips_dep,
        link_args: [
            main_link_args,
            web_link_args,
            # Note: we don't apply the CORS workaround since module scripts don't support `importScripts()`
            '-sEXPORT_ES6',
            # new Worker() supports ECMAScript module only starting from Firefox 114
            '-sMIN_FIREFOX_VERSION=114',
            # Deno reuses the web ES6 module
            '-sENVIRONMENT=web,deno',
        ],
        install: true,
    )
endif

if 'node' in get_option('environments')
    node_link_args = ['-sENVIRONMENT=node', '-sMIN_NODE_VERSION=170000']
    if not get_option('wasmfs')
        node_link_args += ['-sNODERAWFS']
    endif

    executable('vips-node',
        dependencies: wasm_vips_dep,
        link_args: [main_link_args, node_link_args],
        install: true,
    )

    executable('vips-node-es6',
        dependencies: wasm_vips_dep,
        link_args: [main_link_args, node_link_args, '-sEXPORT_ES6'],
        install: true,
    )
endif
