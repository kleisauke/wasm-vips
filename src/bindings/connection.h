#pragma once

#include "object.h"
#include "utils.h"

#include <string>

#include <emscripten/val.h>

namespace vips {

class Connection : public Object {
 public:
    explicit Connection(VipsConnection *connection)
        : Object(VIPS_OBJECT(connection)) {}

    // an empty (NULL) Connection, eg. "Connection a;"
    Connection() : Object(nullptr) {}

    std::string filename() const {
        return vips_connection_filename(get_connection());
    }

    std::string nick() const {
        return vips_connection_nick(get_connection());
    }

    VipsConnection *get_connection() const {
        return reinterpret_cast<VipsConnection *>(get_object());
    }
};

class Source : public Connection {
 public:
    explicit Source(VipsSource *input) : Connection(VIPS_CONNECTION(input)) {}

    // an empty (NULL) Source, eg. "Source a;"
    Source() : Connection(nullptr) {}

    static Source new_from_file(const std::string &filename);

    static Source new_from_memory(const std::string &memory);

    VipsSource *get_source() const {
        return reinterpret_cast<VipsSource *>(get_object());
    }
};

class SourceCustom : public Source {
 public:
    explicit SourceCustom() : Source(VIPS_SOURCE(vips_source_custom_new())) {
        g_signal_connect(get_source_custom(), "read", G_CALLBACK(read_handler),
                         this);
        g_signal_connect(get_source_custom(), "seek", G_CALLBACK(seek_handler),
                         this);
    }

    static gint64 read_handler(VipsSourceCustom *source, void *buffer,
                               gint64 length, void *user);

    static gint64 seek_handler(VipsSourceCustom *source, gint64 pos, int whence,
                               void *user);

    void set_read_callback(emscripten::val js_func);

    void set_seek_callback(emscripten::val js_func);

    emscripten::val stub_getter() const {
        return emscripten::val::null();
    }

    VipsSourceCustom *get_source_custom() const {
        return reinterpret_cast<VipsSourceCustom *>(get_object());
    }

 private:
    int (*read_callback)(void *data, int length) = nullptr;
    int (*seek_callback)(int offset, int whence) = nullptr;
};

class Target : public Connection {
 public:
    explicit Target(VipsTarget *input) : Connection(VIPS_CONNECTION(input)) {}

    // an empty (NULL) Target, eg. "Target a;"
    Target() : Connection(nullptr) {}

    static Target new_to_file(const std::string &filename);

    static Target new_to_memory();

    emscripten::val get_blob() const {
        VipsBlob *blob;
        g_object_get(get_target(), "blob", &blob, nullptr);

        emscripten::val result = BlobVal.new_(emscripten::typed_memory_view(
            VIPS_AREA(blob)->length,
            reinterpret_cast<uint8_t *>(VIPS_AREA(blob)->data)));
        vips_area_unref(VIPS_AREA(blob));

        return result;
    }

    VipsTarget *get_target() const {
        return reinterpret_cast<VipsTarget *>(get_object());
    }
};

class TargetCustom : public Target {
 public:
    explicit TargetCustom() : Target(VIPS_TARGET(vips_target_custom_new())) {
        g_signal_connect(get_target_custom(), "write",
                         G_CALLBACK(write_handler), this);
        g_signal_connect(get_target_custom(), "finish",
                         G_CALLBACK(finish_handler), this);
    }

    static gint64 write_handler(VipsTargetCustom *target, const void *buffer,
                                gint64 length, void *user);

    static void finish_handler(VipsTargetCustom *target, void *user);

    void set_write_callback(emscripten::val js_func);

    void set_finish_callback(emscripten::val js_func);

    emscripten::val stub_getter() const {
        return emscripten::val::null();
    }

    VipsTargetCustom *get_target_custom() const {
        return reinterpret_cast<VipsTargetCustom *>(get_object());
    }

 private:
    int (*write_callback)(const void *data, int length) = nullptr;
    void (*finish_callback)() = nullptr;
};

}  // namespace vips
