#pragma once

namespace vips {

void block_untrusted_set(bool state) {
    vips_block_untrusted_set(state ? 1 : 0);
}

void operation_block_set(const std::string &name, bool state) {
    vips_operation_block_set(name.c_str(), state ? 1 : 0);
}

}  // namespace vips
