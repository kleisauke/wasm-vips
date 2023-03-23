#pragma once

#include <string>
#include <vector>

#include <emscripten/val.h>

namespace vips {

/**
 * JS helpers.
 */
thread_local const emscripten::val ObjectVal =
    emscripten::val::global("Object");
thread_local const emscripten::val BlobVal =
    emscripten::val::global("Uint8Array");

/**
 * Determines if a JS value is of the specified type.
 * If a property does not exist, we will see it as undefined.
 */
inline bool is_type(emscripten::val value, const std::string &type) {
    return value.typeOf().as<std::string>() == type;
}

inline bool is_image(emscripten::val value) {
    return is_type(value["isImage"], "function");
}

/**
 * Determines if a JS value is a rectangular array of something.
 */
inline bool is_2D(emscripten::val value) {
    if (!value.isArray())
        return false;

    unsigned l = value["length"].as<unsigned>();
    if (l == 0 || !value[0].isArray())
        return false;

    unsigned l_first = value[0]["length"].as<unsigned>();

    for (unsigned i = 1; i < l; ++i) {
        if (!value[i].isArray() ||
            value[i]["length"].as<unsigned>() != l_first) {
            return false;
        }
    }

    return true;
}

/**
 * Converts an arithmetic array or constant to a vector.
 */
template <typename T, typename = typename std::enable_if<
                          std::is_arithmetic<T>::value>::type>
std::vector<T> to_vector(emscripten::val v) {
    // Allow single pixels/images (for e.g. `vips.image.newFromImage(127.5)`)
    return v.isArray() ? emscripten::vecFromJSArray<T>(v)
                       : std::vector<T>{v.as<T>()};
}

/*
 * Modes are VipsBlendMode enums, but we have to pass as
 * array of int -- we need to map str->int by hand.
 */
std::vector<int> blend_modes_to_int(emscripten::val v);

std::vector<double> negate(const std::vector<double> &vector);

std::vector<double> invert(const std::vector<double> &vector);

}  // namespace vips
