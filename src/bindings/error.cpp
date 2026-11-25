#include "error.h"

#include <vips/vips.h>

namespace vips {

/**
 * Helper class to manage the lifetime of a copied libvips error buffer.
 */
class ErrorBuffer {
 public:
    ErrorBuffer() : buffer(vips_error_buffer_copy()) {}

    ErrorBuffer(const ErrorBuffer &) = delete;
    ErrorBuffer &operator=(const ErrorBuffer &) = delete;

    ~ErrorBuffer() {
        g_free(buffer);
    }

    // Note: valid only during this object's lifetime.
    const char *c_str() const {
        return buffer;
    }

 private:
    char *buffer;
};

Error::Error(const std::string &what)
    : std::runtime_error(what + "\n" + ErrorBuffer().c_str()) {}

}  // namespace vips
