#pragma once

#include "object.h"
#include "utils.h"

#include <string>

#include <emscripten/val.h>

namespace vips {

// sig = ii
using ReadCallback = emscripten::EM_VAL (*)(int length);
using WriteCallback = int (*)(emscripten::EM_VAL data);
// sig = iii
using SeekCallback = int (*)(int offset, int whence);
// sig = i
using EndCallback = int (*)();

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

    static int64_t read_handler(VipsSourceCustom *source, void *buffer,
                                int64_t length, void *user);

    static int64_t seek_handler(VipsSourceCustom *source, int64_t offset,
                                int whence, void *user);

    void set_read_callback(emscripten::val js_func);

    void set_seek_callback(emscripten::val js_func);

    emscripten::val stub_getter() const {
        return emscripten::val::null();
    }

    VipsSourceCustom *get_source_custom() const {
        return reinterpret_cast<VipsSourceCustom *>(get_object());
    }

 private:
    ReadCallback read_callback = nullptr;
    SeekCallback seek_callback = nullptr;
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
        g_signal_connect(get_target_custom(), "read", G_CALLBACK(read_handler),
                         this);
        g_signal_connect(get_target_custom(), "seek", G_CALLBACK(seek_handler),
                         this);
        g_signal_connect(get_target_custom(), "end", G_CALLBACK(end_handler),
                         this);
    }

    static int64_t write_handler(VipsTargetCustom *target, const void *buffer,
                                 int64_t length, void *user);

    static int64_t read_handler(VipsTargetCustom *target, void *buffer,
                                int64_t length, void *user);

    static int64_t seek_handler(VipsTargetCustom *target, int64_t offset,
                                int whence, void *user);

    static int end_handler(VipsTargetCustom *target, void *user);

    void set_write_callback(emscripten::val js_func);

    void set_read_callback(emscripten::val js_func);

    void set_seek_callback(emscripten::val js_func);

    void set_end_callback(emscripten::val js_func);

    emscripten::val stub_getter() const {
        return emscripten::val::null();
    }

    VipsTargetCustom *get_target_custom() const {
        return reinterpret_cast<VipsTargetCustom *>(get_object());
    }

 private:
    WriteCallback write_callback = nullptr;
    ReadCallback read_callback = nullptr;
    SeekCallback seek_callback = nullptr;
    EndCallback end_callback = nullptr;
};

}  // namespace vips
