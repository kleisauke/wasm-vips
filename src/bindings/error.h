#pragma once

#include <string>

#include <emscripten.h>

namespace vips {

/**
 * The libvips error class. It holds a single string containing an
 * internationalized error message in UTF-8 encoding.
 */
class Error : public std::exception {
    std::string _what;

 public:
    /**
     * Construct an error with a specified error message.
     */
    Error(const std::string &what) : _what(what + "\n" + vips_error_buffer()) {
        vips_error_clear();
    }

    virtual ~Error() throw() {}

    /**
     * Get a reference to the underlying C string.
     */
    virtual const char *what() const throw() {
        return _what.c_str();
    }
};

}  // namespace vips