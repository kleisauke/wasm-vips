#include "connection.h"
#include "error.h"

#include <emscripten/threading.h>

namespace vips {

Source Source::new_from_file(const std::string &filename) {
    VipsSource *input = vips_source_new_from_file(filename.c_str());

    if (input == nullptr)
        throw_vips_error("unable to make source from file " + filename);

    return Source(input);
}

Source Source::new_from_memory(const std::string &memory) {
    // We must take a copy of the data.
    VipsBlob *blob = vips_blob_copy(memory.c_str(), memory.size());
    VipsSource *input = vips_source_new_from_blob(blob);
    vips_area_unref(VIPS_AREA(blob));

    if (input == nullptr)
        throw_vips_error("unable to make source from memory");

    return Source(input);
}

gint64 SourceCustom::read_handler(VipsSourceCustom *source, void *buffer,
                                  gint64 length, void *user) {
    if (length <= 0)
        return 0;

    SourceCustom *self = reinterpret_cast<SourceCustom *>(user);
    if (self->read_callback == nullptr)
        return -1;

    // Ensure that we call the JS function on the main thread, see:
    // https://github.com/emscripten-core/emscripten/issues/11317
    int bytes_read = emscripten_sync_run_in_main_runtime_thread(
        EM_FUNC_SIG_III, self->read_callback, buffer, static_cast<int>(length));
    return static_cast<gint64>(bytes_read);
}

gint64 SourceCustom::seek_handler(VipsSourceCustom *source, gint64 pos,
                                  int whence, void *user) {
    SourceCustom *self = reinterpret_cast<SourceCustom *>(user);
    if (self->seek_callback == nullptr)
        return -1;

    int new_pos = emscripten_sync_run_in_main_runtime_thread(
        EM_FUNC_SIG_III, self->seek_callback, static_cast<int>(pos), whence);
    return static_cast<gint64>(new_pos);
}

void SourceCustom::set_read_callback(emscripten::val js_func) {
    emscripten::val ptr = emscripten::val::module_property("addFunction")(
        js_func, emscripten::val("iii"));
    read_callback = reinterpret_cast<int (*)(void *, int)>(ptr.as<int>());
}

void SourceCustom::set_seek_callback(emscripten::val js_func) {
    emscripten::val ptr = emscripten::val::module_property("addFunction")(
        js_func, emscripten::val("iii"));
    seek_callback = reinterpret_cast<int (*)(int, int)>(ptr.as<int>());
}

Target Target::new_to_file(const std::string &filename) {
    VipsTarget *output = vips_target_new_to_file(filename.c_str());

    if (output == nullptr)
        throw_vips_error("unable to output to file " + filename);

    return Target(output);
}

Target Target::new_to_memory() {
    VipsTarget *output = vips_target_new_to_memory();

    if (output == nullptr)
        throw_vips_error("unable to output to memory");

    return Target(output);
}

gint64 TargetCustom::write_handler(VipsTargetCustom *target, const void *buffer,
                                   gint64 length, void *user) {
    TargetCustom *self = reinterpret_cast<TargetCustom *>(user);
    if (self->write_callback == nullptr)
        return -1;

    int bytes_written = emscripten_sync_run_in_main_runtime_thread(
        EM_FUNC_SIG_III, self->write_callback, buffer,
        static_cast<int>(length));
    return static_cast<gint64>(bytes_written);
}

void TargetCustom::finish_handler(VipsTargetCustom *target, void *user) {
    TargetCustom *self = reinterpret_cast<TargetCustom *>(user);
    if (self->finish_callback != nullptr)
        emscripten_sync_run_in_main_runtime_thread(EM_FUNC_SIG_V,
                                                   self->finish_callback);
}

void TargetCustom::set_write_callback(emscripten::val js_func) {
    emscripten::val ptr = emscripten::val::module_property("addFunction")(
        js_func, emscripten::val("iii"));
    write_callback =
        reinterpret_cast<int (*)(const void *, int)>(ptr.as<int>());
}

void TargetCustom::set_finish_callback(emscripten::val js_func) {
    emscripten::val ptr = emscripten::val::module_property("addFunction")(
        js_func, emscripten::val("v"));
    finish_callback = reinterpret_cast<void (*)()>(ptr.as<int>());
}

}  // namespace vips
