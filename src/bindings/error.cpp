#include "error.h"

namespace vips {

EM_JS(void, throw_type_error_js, (const char *str), {
    throw new TypeError(UTF8ToString(str));
});

EM_JS(void, throw_vips_error_js, (const char *str), {
    var e = Module.Utils.errorBuffer();
    Module.Utils.clearError();
    throw new Error(UTF8ToString(str) + "\n" + e);
});

void throw_type_error(const std::string &str) {
    throw_type_error_js(str.c_str());
}

void throw_vips_error(const std::string &str) {
    throw_vips_error_js(str.c_str());
}

}  // namespace vips
