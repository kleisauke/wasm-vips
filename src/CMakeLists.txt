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

set_target_properties(${PROJECT_NAME}
        PROPERTIES
            COMPILE_FLAGS "-pthread -DEMSCRIPTEN_HAS_UNBOUND_TYPE_NAMES=0"
            LINK_FLAGS "--bind"
        )

target_include_directories(${PROJECT_NAME}
        PRIVATE
            ${VIPS_INCLUDE_DIRS}
        )

target_link_libraries(${PROJECT_NAME}
        PRIVATE
            ${VIPS_STATIC_LDFLAGS}
        )

# List of targets
set(TARGETS "")

if("node" IN_LIST ENVIRONMENT)
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

if("web" IN_LIST ENVIRONMENT)
    add_executable(${PROJECT_NAME}-web $<TARGET_OBJECTS:${PROJECT_NAME}>)

    set_target_properties(${PROJECT_NAME}-web
            PROPERTIES
                 RUNTIME_OUTPUT_DIRECTORY "${CMAKE_RUNTIME_OUTPUT_DIRECTORY}/web"
            )

    target_link_libraries(${PROJECT_NAME}-web
            PRIVATE
                ${VIPS_STATIC_LDFLAGS}
            )

    list(APPEND TARGETS ${PROJECT_NAME}-web)
endif()

# Handy for debugging
# --threadprofiler \
# -sSAFE_HEAP \
# -sSTACK_OVERFLOW_CHECK=2 \
# -sDISABLE_EXCEPTION_CATCHING=0 \
# -sASSERTIONS=2 \
# -sPTHREADS_DEBUG \
# -sLIBRARY_DEBUG \
# -sSYSCALL_DEBUG \

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
set_target_properties(${TARGETS}
        PROPERTIES
            OUTPUT_NAME "vips"
            LINK_FLAGS "\
--closure=1 \
--closure-args=\"--externs ${CMAKE_CURRENT_SOURCE_DIR}/closure-externs/wasm-vips.js\" \
--bind \
-sMODULARIZE \
-sEXPORT_NAME='Vips' \
-sEXIT_RUNTIME \
-sPTHREAD_POOL_SIZE=\"_emscripten_num_logical_cores() + 3\" \
-sINITIAL_MEMORY=1GB \
-sALLOW_TABLE_GROWTH \
-sALLOW_BLOCKING_ON_MAIN_THREAD \
-sTEXTDECODER=2 \
-sASSERTIONS=0 \
-sDEFAULT_LIBRARY_FUNCS_TO_INCLUDE=emscripten_num_logical_cores \
-sEXPORTED_RUNTIME_METHODS=FS,ENV,deletionQueue,addFunction"
        )

if("node" IN_LIST ENVIRONMENT)
    set(NODE_LINK_FLAGS " -sENVIRONMENT=node,worker -sNODERAWFS -sNODEJS_CATCH_EXIT=0 -sNODEJS_CATCH_REJECTION=0")
    set_property(
            TARGET ${PROJECT_NAME}-node-es6
            APPEND_STRING PROPERTY
            LINK_FLAGS "${NODE_LINK_FLAGS} -sEXPORT_ES6"
    )
    set_property(
            TARGET ${PROJECT_NAME}-node-commonjs
            APPEND_STRING PROPERTY
            LINK_FLAGS "${NODE_LINK_FLAGS}"
            )
endif()

if("web" IN_LIST ENVIRONMENT)
    set(WEB_MIN_TARGETS "-sMIN_FIREFOX_VERSION=89 -sMIN_EDGE_VERSION=91 -sMIN_CHROME_VERSION=91")
    set_property(
            TARGET ${PROJECT_NAME}-web
            APPEND_STRING PROPERTY
            LINK_FLAGS " \
--pre-js=${CMAKE_CURRENT_SOURCE_DIR}/locatefile-cors-pre.js \
-sENVIRONMENT=web,worker \
-sDEFAULT_LIBRARY_FUNCS_TO_INCLUDE=$Browser \
${WEB_MIN_TARGETS}"
            )
endif()
