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
};

}  // namespace vips
