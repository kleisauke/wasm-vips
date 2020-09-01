#pragma once

#include <string>

#include <emscripten.h>

namespace vips {

void throw_type_error(const std::string &str);

void throw_vips_error(const std::string &str);

}  // namespace vips