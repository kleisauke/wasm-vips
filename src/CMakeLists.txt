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
        vector-types.cpp
        vips-emscripten.cpp
        )

add_library(${PROJECT_NAME} STATIC ${HEADERS} ${SOURCES})

set_target_properties(${PROJECT_NAME}
        PROPERTIES
            COMPILE_OPTIONS "-DEMSCRIPTEN_HAS_UNBOUND_TYPE_NAMES=0"
            LINK_FLAGS "--bind --js-library ${CMAKE_CURRENT_SOURCE_DIR}/vector-types.js"
        )

target_include_directories(${PROJECT_NAME}
        PRIVATE
            ${VIPS_INCLUDE_DIRS}
            ${CMAKE_CURRENT_SOURCE_DIR}
        )

target_link_libraries(${PROJECT_NAME}
        PRIVATE
            ${VIPS_STATIC_LDFLAGS}
        )

# List of targets
set(TARGETS "")

if("node" IN_LIST ENVIRONMENT)
    add_executable(${PROJECT_NAME}-node $<TARGET_OBJECTS:${PROJECT_NAME}>)

    set_target_properties(${PROJECT_NAME}-node
            PROPERTIES
                RUNTIME_OUTPUT_DIRECTORY "${CMAKE_RUNTIME_OUTPUT_DIRECTORY}/node"
            )

    target_link_libraries(${PROJECT_NAME}-node
            PRIVATE
                ${PROJECT_NAME}
            )

    list(APPEND TARGETS ${PROJECT_NAME}-node)
endif()

if("web" IN_LIST ENVIRONMENT)
    add_executable(${PROJECT_NAME}-web $<TARGET_OBJECTS:${PROJECT_NAME}>)

    set_target_properties(${PROJECT_NAME}-web
            PROPERTIES
                 RUNTIME_OUTPUT_DIRECTORY "${CMAKE_RUNTIME_OUTPUT_DIRECTORY}/web"
            )

    target_link_libraries(${PROJECT_NAME}-web
            PRIVATE
                ${PROJECT_NAME}
            )

    list(APPEND TARGETS ${PROJECT_NAME}-web)
endif()

# Handy for debugging
# --threadprofiler \
# -s SAFE_HEAP=1 \
# -s STACK_OVERFLOW_CHECK=2 \
# -s DISABLE_EXCEPTION_CATCHING=0 \
# -s NODEJS_CATCH_EXIT=0 \
# -s ASSERTIONS=2 \
# -s PTHREADS_DEBUG=1 \

# note 1: `ALLOW_MEMORY_GROWTH` may run non-wasm code slowly. See: https://github.com/WebAssembly/design/issues/1271.
# note 2: Browsers appear to limit the maximum initial memory size to 1GB, set `INITIAL_MEMORY` accordingly.
# note 3: The browser might hang if the number of active threads exceed `PTHREAD_POOL_SIZE`. See:
#         https://github.com/emscripten-core/emscripten/issues/8988
# note 4: A potential deadlock may occur if the main thread spawns a thread and immediately waits for it. See:
#         https://github.com/emscripten-core/emscripten/issues/8969
#         https://github.com/libvips/libvips/blob/fc9edfe593be15fa241628b4e0fafa87bd544f7c/libvips/iofuncs/threadpool.c#L959-L961
# note 5: Build with `-s PTHREAD_POOL_SIZE="_emscripten_num_logical_cores() + 3"` since `vips_sink_disc` could run 3
#         additional background threads in the pool.
# note 6: Build with `-s ALLOW_TABLE_GROWTH=1` so that we can store the read, seek, write and finish signals.
set_target_properties(${TARGETS}
        PROPERTIES
            OUTPUT_NAME "vips"
            COMPILE_OPTIONS "-DEMSCRIPTEN_HAS_UNBOUND_TYPE_NAMES=0"
            LINK_FLAGS "\
--bind \
--js-library ${CMAKE_CURRENT_SOURCE_DIR}/vector-types.js \
-s MODULARIZE=1 \
-s EXPORT_NAME='Vips' \
-s EXIT_RUNTIME=0 \
-s PTHREAD_POOL_SIZE=\"_emscripten_num_logical_cores() + 3\" \
-s INITIAL_MEMORY=1GB \
-s ALLOW_TABLE_GROWTH=1 \
-s ALLOW_BLOCKING_ON_MAIN_THREAD=1 \
-s ASSERTIONS=0 \
-s EXPORTED_FUNCTIONS='[\"_main\", \"_exit\", \"_abort\"]' \
-s EXTRA_EXPORTED_RUNTIME_METHODS='[\"FS\", \"ENV\", \"deletionQueue\", \"addFunction\"]'"
        )

# TODO(kleisauke): Add -s EXPORT_ES6=1, see:
# https://github.com/emscripten-core/emscripten/issues/11792.
if("node" IN_LIST ENVIRONMENT)
    set_property(
            TARGET ${PROJECT_NAME}-node
            APPEND_STRING PROPERTY
            LINK_FLAGS " -s ENVIRONMENT=node,worker -s NODERAWFS=1"
            )
endif()

if("web" IN_LIST ENVIRONMENT)
    set_property(
            TARGET ${PROJECT_NAME}-web
            APPEND_STRING PROPERTY
            LINK_FLAGS " -s ENVIRONMENT=web,worker -s DEFAULT_LIBRARY_FUNCS_TO_INCLUDE='[\"$Browser\"]'"
            )
endif()
