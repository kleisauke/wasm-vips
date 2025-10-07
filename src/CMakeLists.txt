set(HEADERS
        bindings/connection.h
        bindings/error.h
        bindings/image.h
        bindings/interpolate.h
        bindings/object.h
        bindings/option.h
        bindings/utils.h
        )

set(SOURCES
        bindings/connection.cpp
        bindings/image.cpp
        bindings/interpolate.cpp
        bindings/option.cpp
        bindings/utils.cpp
        vips-emscripten.cpp
        )

add_library(${PROJECT_NAME} OBJECT ${HEADERS} ${SOURCES})

target_compile_definitions(${PROJECT_NAME}
        PUBLIC
            $<$<BOOL:${ENABLE_WASMFS}>:WASMFS>
            $<$<CONFIG:Release>:G_DISABLE_CAST_CHECKS G_DISABLE_CHECKS G_DISABLE_ASSERT>
        )

target_include_directories(${PROJECT_NAME}
        PRIVATE
            ${VIPS_INCLUDE_DIRS}
        )

target_link_libraries(${PROJECT_NAME}
        PUBLIC
            embind
        PRIVATE
            ${VIPS_STATIC_LDFLAGS}
        )

# List of targets
set(TARGETS "")

if ("node" IN_LIST ENVIRONMENT)
    add_executable(${PROJECT_NAME}-node $<TARGET_OBJECTS:${PROJECT_NAME}>)
    add_executable(${PROJECT_NAME}-node-es6 $<TARGET_OBJECTS:${PROJECT_NAME}>)

    set_target_properties(${PROJECT_NAME}-node
            PROPERTIES
                SUFFIX "-node.js"
                RUNTIME_OUTPUT_DIRECTORY "${CMAKE_RUNTIME_OUTPUT_DIRECTORY}"
            )
    set_target_properties(${PROJECT_NAME}-node-es6
            PROPERTIES
                SUFFIX "-node-es6.mjs"
                RUNTIME_OUTPUT_DIRECTORY "${CMAKE_RUNTIME_OUTPUT_DIRECTORY}"
            )

    target_link_libraries(${PROJECT_NAME}-node
            PRIVATE
                ${VIPS_STATIC_LDFLAGS}
            )
    target_link_libraries(${PROJECT_NAME}-node-es6
            PRIVATE
                ${VIPS_STATIC_LDFLAGS}
            )

    list(APPEND TARGETS ${PROJECT_NAME}-node ${PROJECT_NAME}-node-es6)
endif()

if ("web" IN_LIST ENVIRONMENT)
    add_executable(${PROJECT_NAME}-web $<TARGET_OBJECTS:${PROJECT_NAME}>)
    add_executable(${PROJECT_NAME}-web-es6 $<TARGET_OBJECTS:${PROJECT_NAME}>)

    set_target_properties(${PROJECT_NAME}-web
            PROPERTIES
                RUNTIME_OUTPUT_DIRECTORY "${CMAKE_RUNTIME_OUTPUT_DIRECTORY}"
            )
    set_target_properties(${PROJECT_NAME}-web-es6
            PROPERTIES
                SUFFIX "-es6.js"
                RUNTIME_OUTPUT_DIRECTORY "${CMAKE_RUNTIME_OUTPUT_DIRECTORY}"
            )

    target_link_libraries(${PROJECT_NAME}-web
            PRIVATE
                ${VIPS_STATIC_LDFLAGS}
            )
    target_link_libraries(${PROJECT_NAME}-web-es6
            PRIVATE
                ${VIPS_STATIC_LDFLAGS}
            )

    list(APPEND TARGETS ${PROJECT_NAME}-web ${PROJECT_NAME}-web-es6)
endif()

set(MAIN_COMPILE_OPTIONS
        $<$<BOOL:${ENABLE_MODULES}>:-sMAIN_MODULE=2>
        )

# Handy for debugging
# --threadprofiler
# -sSAFE_HEAP=2
# -sASSERTIONS=2
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
set(MAIN_LINK_OPTIONS
        --closure=1
        --closure-args='--externs=${CMAKE_CURRENT_SOURCE_DIR}/closure-externs/wasm-vips.js'
        -lembind
        $<$<BOOL:${ENABLE_WASMFS}>:-sWASMFS>
        $<$<BOOL:${ENABLE_MODULES}>:-sMAIN_MODULE=2>
        $<$<BOOL:${ENABLE_MODULES}>:--pre-js=${CMAKE_CURRENT_SOURCE_DIR}/modules-pre.js>
        --js-library=${CMAKE_CURRENT_SOURCE_DIR}/vips-library.js
        -sAUTOLOAD_DYLIBS=0
        -sABORTING_MALLOC=0
        # Note: mimalloc is incompatible with AddressSanitizer
        -sMALLOC=mimalloc
        -sMODULARIZE
        -sEXPORT_NAME='Vips'
        -sEXIT_RUNTIME
        -sINITIAL_MEMORY=1GB
        -sSTACK_SIZE=256KB
        -sALLOW_TABLE_GROWTH
        -sTEXTDECODER=2
        -sASSERTIONS=0
        -sFORCE_FILESYSTEM
        -sEXPORTED_RUNTIME_METHODS=FS,ENV,deletionQueue,addFunction,setAutoDeleteLater,setDelayFunction
        -sEXCEPTION_STACK_TRACES
        -sBINARYEN_EXTRA_PASSES=--emit-target-features
        )

set_target_properties(${TARGETS}
        PROPERTIES
            OUTPUT_NAME "vips"
            COMPILE_OPTIONS "${MAIN_COMPILE_OPTIONS}"
            LINK_OPTIONS "${MAIN_LINK_OPTIONS}"
        )

if ("node" IN_LIST ENVIRONMENT)
    set(NODE_LINK_OPTIONS
            -sENVIRONMENT=node,worker
            $<$<NOT:$<BOOL:${ENABLE_WASMFS}>>:-sNODERAWFS>
            -sMIN_NODE_VERSION=160400
            )

    target_link_options(${PROJECT_NAME}-node
            PUBLIC
                ${NODE_LINK_OPTIONS}
            )
    target_link_options(${PROJECT_NAME}-node-es6
            PUBLIC
                ${NODE_LINK_OPTIONS}
                -sEXPORT_ES6
            )
endif()

if ("web" IN_LIST ENVIRONMENT)
    set(WEB_CORS_WORKAROUND
            --pre-js=${CMAKE_CURRENT_SOURCE_DIR}/workaround-cors-pre.js
            )
    set(WEB_MIN_TARGETS
            -sMIN_CHROME_VERSION=91
            -sMIN_FIREFOX_VERSION=89
            -sMIN_SAFARI_VERSION=160400
            )

    # libvips requires spawning at least VIPS_CONCURRENCY threads synchronously, with a minimum of 3 threads per
    # pipeline. This count includes the two write-behind background threads used by `vips_sink_disc`. To support up to
    # two concurrent pipelines, we need to double that number. Therefore, build with:
    # `-sPTHREAD_POOL_SIZE='Math.max(navigator.hardwareConcurrency, 6)'`.
    # Only needed on the web, pthreads on Node.js can be spawned synchronously without waiting for an event loop tick.
    set(WEB_LINK_OPTIONS
            --use-preload-plugins
            -sPTHREAD_POOL_SIZE='navigator.hardwareConcurrency>6?navigator.hardwareConcurrency:6'
            ${WEB_MIN_TARGETS}
            )

    target_link_options(${PROJECT_NAME}-web
            PUBLIC
                ${WEB_CORS_WORKAROUND}
                ${WEB_LINK_OPTIONS}
                -sENVIRONMENT=web,worker
            )
    target_link_options(${PROJECT_NAME}-web-es6
            PUBLIC
                # Note: we don't apply the CORS workaround since module scripts don't support `importScripts()`.
                ${WEB_LINK_OPTIONS}
                -sEXPORT_ES6
                # new Worker() supports ECMAScript module only starting from Firefox 114
                -sMIN_FIREFOX_VERSION=114
                # Deno reuses the web ES6 module
                -sENVIRONMENT=web,deno,worker
            )
endif()
