cmake_minimum_required(VERSION 3.10)

project(wasm-vips
        VERSION 0.0.1
        DESCRIPTION "libvips for the browser and Node.js, compiled to WebAssembly with Emscripten"
        LANGUAGES
            CXX
        )

# Set a default build type if none was specified
if (NOT CMAKE_BUILD_TYPE AND NOT CMAKE_CONFIGURATION_TYPES)
    message(STATUS "Setting build type to 'Release' as none was specified.")
    set(CMAKE_BUILD_TYPE Release CACHE STRING "Choose the type of build." FORCE)
endif()

set(ENVIRONMENT "environment" CACHE STRING "Specifies the environment(s) to target.")
set(ENVIRONMENT_VALUES "web;node" CACHE INTERNAL "List of possible environments.")

set_property(CACHE ENVIRONMENT PROPERTY STRINGS ${ENVIRONMENT_VALUES})

# Let's enable C++11
set(CMAKE_CXX_STANDARD 11)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

# Find libvips (required)
find_package(PkgConfig)
pkg_check_modules(VIPS vips>=8.12 REQUIRED)

add_subdirectory(src)
