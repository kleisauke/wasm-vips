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
        bindings/error.cpp
        bindings/image.cpp
        bindings/interpolate.cpp
        bindings/option.cpp
        bindings/utils.cpp
        vips-emscripten.cpp
        )

add_library(${PROJECT_NAME} OBJECT ${HEADERS} ${SOURCES})

target_compile_definitions(${PROJECT_NAME}
        PUBLIC
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
    add_executable(${PROJECT_NAME}-node-es6 $<TARGET_OBJECTS:${PROJECT_NAME}>)
    add_executable(${PROJECT_NAME}-node-commonjs $<TARGET_OBJECTS:${PROJECT_NAME}>)

    set_target_properties(${PROJECT_NAME}-node-es6
            PROPERTIES
                SUFFIX ".mjs"
                RUNTIME_OUTPUT_DIRECTORY "${CMAKE_RUNTIME_OUTPUT_DIRECTORY}/node-es6"
            )
    set_target_properties(${PROJECT_NAME}-node-commonjs
            PROPERTIES
                RUNTIME_OUTPUT_DIRECTORY "${CMAKE_RUNTIME_OUTPUT_DIRECTORY}/node-commonjs"
            )

    target_link_libraries(${PROJECT_NAME}-node-es6
            PRIVATE
                ${VIPS_STATIC_LDFLAGS}
            )
    target_link_libraries(${PROJECT_NAME}-node-commonjs
            PRIVATE
                ${VIPS_STATIC_LDFLAGS}
            )

    list(APPEND TARGETS ${PROJECT_NAME}-node-es6 ${PROJECT_NAME}-node-commonjs)
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
# --threadprofiler \
# -sSAFE_HEAP \
# -sSTACK_OVERFLOW_CHECK=2 \
# -sDISABLE_EXCEPTION_CATCHING=0 \
# -sASSERTIONS=2 \
# -sPTHREADS_DEBUG \
# -sLIBRARY_DEBUG \
# -sSYSCALL_DEBUG \
# -sDYLINK_DEBUG \

# note 1: `ALLOW_MEMORY_GROWTH` may run non-wasm code slowly. See: https://github.com/WebAssembly/design/issues/1271.
# note 2: Browsers appear to limit the maximum initial memory size to 1GB, set `INITIAL_MEMORY` accordingly.
# note 3: The browser might hang if the number of active threads exceed `PTHREAD_POOL_SIZE`. See:
#         https://github.com/emscripten-core/emscripten/issues/8988
# note 4: A potential deadlock may occur if the main thread spawns a thread and immediately waits for it. See:
#         https://github.com/emscripten-core/emscripten/issues/8969
#         https://github.com/libvips/libvips/blob/fc9edfe593be15fa241628b4e0fafa87bd544f7c/libvips/iofuncs/threadpool.c#L959-L961
# note 5: Build with `-sPTHREAD_POOL_SIZE="_emscripten_num_logical_cores() + 3"` since `vips_sink_disc` could run 3
#         additional background threads in the pool.
# note 6: Build with `-sALLOW_TABLE_GROWTH` so that we can store the read, seek, write and finish signals.
# note 7: To ensure the testsuite passes, increase (main-)thread's stack size from 64kb to 256kb. This should be
#         reasonable for image processing in Wasm, and given that libvips enforces a minimum thread stack size of 2mb
#         on other POSIX platforms.
set(MAIN_LINK_OPTIONS
        --closure=1
        --closure-args='--externs=${CMAKE_CURRENT_SOURCE_DIR}/closure-externs/wasm-vips.js'
        -lembind
        $<$<BOOL:${ENABLE_MODULES}>:-sMAIN_MODULE=2>
        $<$<BOOL:${ENABLE_MODULES}>:--pre-js=${CMAKE_CURRENT_SOURCE_DIR}/modules-pre.js>
        -sAUTOLOAD_DYLIBS=0
        -sMODULARIZE
        -sEXPORT_NAME='Vips'
        -sEXIT_RUNTIME
        -sPTHREAD_POOL_SIZE='_emscripten_num_logical_cores\(\)+3'
        -sINITIAL_MEMORY=1GB
        -sSTACK_SIZE=256KB
        -sDEFAULT_PTHREAD_STACK_SIZE=256KB
        -sALLOW_TABLE_GROWTH
        -sALLOW_BLOCKING_ON_MAIN_THREAD
        -sTEXTDECODER=2
        -sASSERTIONS=0
        -sFORCE_FILESYSTEM
        -sEXPORTED_RUNTIME_METHODS=FS,ENV,deletionQueue,addFunction,bigintToI53Checked
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
            -sNODERAWFS
            -sNODEJS_CATCH_EXIT=0
            -sNODEJS_CATCH_REJECTION=0
            )

    target_link_options(${PROJECT_NAME}-node-es6
            PUBLIC
                ${NODE_LINK_OPTIONS}
                -sEXPORT_ES6
            )
    target_link_options(${PROJECT_NAME}-node-commonjs
            PUBLIC
                ${NODE_LINK_OPTIONS}
            )
endif()

if ("web" IN_LIST ENVIRONMENT)
    set(WEB_CORS_WORKAROUND
            --pre-js=${CMAKE_CURRENT_SOURCE_DIR}/locatefile-cors-pre.js
            )
    set(WEB_MIN_TARGETS
            -sMIN_FIREFOX_VERSION=89
            -sMIN_EDGE_VERSION=91
            -sMIN_CHROME_VERSION=91
            )
    set(WEB_LINK_OPTIONS
            --use-preload-plugins
            -sENVIRONMENT=web,worker
            ${WEB_MIN_TARGETS}
            )

    target_link_options(${PROJECT_NAME}-web
            PUBLIC
                ${WEB_CORS_WORKAROUND}
                ${WEB_LINK_OPTIONS}
            )
    target_link_options(${PROJECT_NAME}-web-es6
            PUBLIC
                # Note: we don't apply the CORS workaround since module scripts don't support `importScripts()`.
                ${WEB_LINK_OPTIONS}
                -sEXPORT_ES6
            )
endif()
