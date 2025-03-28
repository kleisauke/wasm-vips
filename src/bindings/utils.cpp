#include "utils.h"

#include "option.h"

#include <emscripten/proxying.h>
#include <emscripten/threading.h>

namespace vips {

std::vector<int> blend_modes_to_int(emscripten::val v) {
    std::vector<int> int_modes;

    if (v.isArray()) {
        unsigned l = v["length"].as<unsigned>();

        int_modes.reserve(l);

        for (unsigned i = 0; i < l; ++i)
            int_modes.push_back(Option::to_enum(VIPS_TYPE_BLEND_MODE, v[i]));
    } else {
        int_modes = {Option::to_enum(VIPS_TYPE_BLEND_MODE, v)};
    }

    return int_modes;
}

std::vector<double> negate(const std::vector<double> &vector) {
    std::vector<double> new_vector(vector.size());

    for (unsigned long i = 0; i < vector.size(); ++i)
        new_vector[i] = vector[i] * -1;

    return new_vector;
}

std::vector<double> invert(const std::vector<double> &vector) {
    std::vector<double> new_vector(vector.size());

    for (unsigned long i = 0; i < vector.size(); ++i)
        new_vector[i] = 1.0 / vector[i];

    return new_vector;
}

static void run(void *arg) {
    std::function<void()> *f = static_cast<std::function<void()> *>(arg);
    (*f)();
}

bool proxy_sync(const std::function<void()> &func) {
    em_proxying_queue *q = emscripten_proxy_get_system_queue();
    return emscripten_proxy_sync(q, emscripten_main_runtime_thread_id(), run,
                                 (void *)&func);
}

}  // namespace vips
