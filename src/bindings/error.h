#pragma once

#include <stdexcept>
#include <string>

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
    explicit Error(const std::string &what);
};

}  // namespace vips
