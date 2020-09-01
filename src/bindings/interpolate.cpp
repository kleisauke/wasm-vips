#include "interpolate.h"
#include "error.h"

namespace vips {

Interpolate Interpolate::new_from_name(const std::string &name) {
    VipsInterpolate *interp = vips_interpolate_new(name.c_str());

    if (interp == nullptr)
        throw_vips_error("unable to make interpolator from name");

    return Interpolate(interp);
}

}  // namespace vips
