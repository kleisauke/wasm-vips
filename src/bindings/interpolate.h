#pragma once

#include "object.h"

#include <string>

namespace vips {

class Interpolate : public Object {
 public:
    explicit Interpolate(VipsInterpolate *interpolate)
        : Object(VIPS_OBJECT(interpolate)) {}

    // an empty (NULL) Interpolate, eg. "Interpolate a;"
    Interpolate() : Object(nullptr) {}

    static Interpolate new_from_name(const std::string &name);

    VipsInterpolate *get_interpolate() const {
        return reinterpret_cast<VipsInterpolate *>(get_object());
    }
};

}  // namespace vips
