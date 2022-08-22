#pragma once

namespace vips {

void block_untrusted_set(bool block_untrusted) {
    vips_block_untrusted_set(block_untrusted ? 1 : 0);
}

}  // namespace vips
