#pragma once

#include <stdexcept>
#include <string>

#include <vips/vips.h>

namespace vips {

/**
 * The libvips error class. It holds a single string containing an
 * internationalized error message in UTF-8 encoding.
 */
class Error : public std::runtime_error {
 public:
    /**
     * Construct an error with a specified error message.
     */
    explicit Error(const std::string &what)
        : std::runtime_error(what + "\n" + vips_error_buffer()) {
        vips_error_clear();
    }
};

}  // namespace vips
