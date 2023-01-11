#include "connection.h"
#include "error.h"

#include <emscripten/threading.h>

namespace vips {

Source Source::new_from_file(const std::string &filename) {
    VipsSource *input = vips_source_new_from_file(filename.c_str());

    if (input == nullptr)
        throw Error("unable to make source from file " + filename);

    return Source(input);
}

Source Source::new_from_memory(const std::string &memory) {
    // We must take a copy of the data.
    VipsBlob *blob = vips_blob_copy(memory.c_str(), memory.size());
    VipsSource *input = vips_source_new_from_blob(blob);
    vips_area_unref(VIPS_AREA(blob));

    if (input == nullptr)
        throw Error("unable to make source from memory");

    return Source(input);
}

int64_t SourceCustom::read_handler(VipsSourceCustom *source, void *buffer,
                                   int64_t length, void *user) {
    if (length <= 0)
        return 0;

    SourceCustom *self = reinterpret_cast<SourceCustom *>(user);
    if (self->read_callback == nullptr)
        return -1;

    // Ensure that we call the JS function on the main thread, see:
    // https://github.com/emscripten-core/emscripten/issues/11317
    int64_t bytes_read = emscripten_sync_run_in_main_runtime_thread(
        EM_FUNC_SIG_JPJ, self->read_callback, buffer, length);
    return bytes_read;
}

int64_t SourceCustom::seek_handler(VipsSourceCustom *source, int64_t offset,
                                   int whence, void *user) {
    SourceCustom *self = reinterpret_cast<SourceCustom *>(user);
    if (self->seek_callback == nullptr)
        return -1;

    int64_t new_pos = emscripten_sync_run_in_main_runtime_thread(
        EM_FUNC_SIG_JJI, self->seek_callback, offset, whence);
    return new_pos;
}

void SourceCustom::set_read_callback(emscripten::val js_func) {
    emscripten::val ptr = emscripten::val::module_property("addFunction")(
        js_func, emscripten::val("jpj"));
    read_callback =
        reinterpret_cast<int64_t (*)(void *, int64_t)>(ptr.as<int>());
}

void SourceCustom::set_seek_callback(emscripten::val js_func) {
    emscripten::val ptr = emscripten::val::module_property("addFunction")(
        js_func, emscripten::val("jji"));
    seek_callback = reinterpret_cast<int64_t (*)(int64_t, int)>(ptr.as<int>());
}

Target Target::new_to_file(const std::string &filename) {
    VipsTarget *output = vips_target_new_to_file(filename.c_str());

    if (output == nullptr)
        throw Error("unable to output to file " + filename);

    return Target(output);
}

Target Target::new_to_memory() {
    VipsTarget *output = vips_target_new_to_memory();

    if (output == nullptr)
        throw Error("unable to output to memory");

    return Target(output);
}

int64_t TargetCustom::write_handler(VipsTargetCustom *target,
                                    const void *buffer, int64_t length,
                                    void *user) {
    TargetCustom *self = reinterpret_cast<TargetCustom *>(user);
    if (self->write_callback == nullptr)
        return -1;

    int64_t bytes_written = emscripten_sync_run_in_main_runtime_thread(
        EM_FUNC_SIG_JPJ, self->write_callback, buffer, length);
    return bytes_written;
}

int64_t TargetCustom::read_handler(VipsTargetCustom *target, void *buffer,
                                   int64_t length, void *user) {
    if (length <= 0)
        return 0;

    TargetCustom *self = reinterpret_cast<TargetCustom *>(user);
    if (self->read_callback == nullptr)
        return -1;

    int64_t bytes_read = emscripten_sync_run_in_main_runtime_thread(
        EM_FUNC_SIG_JPJ, self->read_callback, buffer, length);
    return bytes_read;
}

int64_t TargetCustom::seek_handler(VipsTargetCustom *target, int64_t offset,
                                   int whence, void *user) {
    TargetCustom *self = reinterpret_cast<TargetCustom *>(user);
    if (self->seek_callback == nullptr)
        return -1;

    int64_t new_pos = emscripten_sync_run_in_main_runtime_thread(
        EM_FUNC_SIG_JJI, self->seek_callback, offset, whence);
    return new_pos;
}

int TargetCustom::end_handler(VipsTargetCustom *target, void *user) {
    TargetCustom *self = reinterpret_cast<TargetCustom *>(user);
    if (self->end_callback == nullptr)
        return 0;

    return emscripten_sync_run_in_main_runtime_thread(EM_FUNC_SIG_I,
                                                      self->end_callback);
}
void TargetCustom::set_write_callback(emscripten::val js_func) {
    emscripten::val ptr = emscripten::val::module_property("addFunction")(
        js_func, emscripten::val("jpj"));
    write_callback =
        reinterpret_cast<int64_t (*)(const void *, int64_t)>(ptr.as<int>());
}

void TargetCustom::set_read_callback(emscripten::val js_func) {
    emscripten::val ptr = emscripten::val::module_property("addFunction")(
        js_func, emscripten::val("jpj"));
    read_callback =
        reinterpret_cast<int64_t (*)(void *, int64_t)>(ptr.as<int>());
}

void TargetCustom::set_seek_callback(emscripten::val js_func) {
    emscripten::val ptr = emscripten::val::module_property("addFunction")(
        js_func, emscripten::val("jji"));
    seek_callback = reinterpret_cast<int64_t (*)(int64_t, int)>(ptr.as<int>());
}

void TargetCustom::set_end_callback(emscripten::val js_func) {
    emscripten::val ptr = emscripten::val::module_property("addFunction")(
        js_func, emscripten::val("i"));
    end_callback = reinterpret_cast<int (*)()>(ptr.as<int>());
}

}  // namespace vips
