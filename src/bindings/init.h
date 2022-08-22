#pragma once

namespace vips {

void block_untrusted_set(bool state) {
    vips_block_untrusted_set(state ? 1 : 0);
}

}  // namespace vips
