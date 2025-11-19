#pragma once

#include "connection.h"
#include "error.h"
#include "object.h"
#include "option.h"
#include "utils.h"

#include <stdexcept>
#include <string>
#include <vector>

#include <emscripten/val.h>

namespace vips {

class Image : public Object {
 public:
    explicit Image(VipsImage *image) : Object(VIPS_OBJECT(image)) {}

    // an empty (NULL) Image, eg. "Image a;"
    Image() : Object(nullptr) {}

    VipsImage *get_image() const {
        return reinterpret_cast<VipsImage *>(get_object());
    }

    int width() const {
        return vips_image_get_width(get_image());
    }

    int height() const {
        return vips_image_get_height(get_image());
    }

    int bands() const {
        return vips_image_get_bands(get_image());
    }

    std::string format() const {
        return vips_enum_nick(VIPS_TYPE_BAND_FORMAT,
                              vips_image_get_format(get_image()));
    }

    std::string coding() const {
        return vips_enum_nick(VIPS_TYPE_CODING,
                              vips_image_get_coding(get_image()));
    }

    std::string interpretation() const {
        return vips_enum_nick(VIPS_TYPE_INTERPRETATION,
                              vips_image_get_interpretation(get_image()));
    }

    std::string guess_interpretation() const {
        return vips_enum_nick(VIPS_TYPE_INTERPRETATION,
                              vips_image_guess_interpretation(get_image()));
    }

    double xres() const {
        return vips_image_get_xres(get_image());
    }

    double yres() const {
        return vips_image_get_yres(get_image());
    }

    int xoffset() const {
        return vips_image_get_xoffset(get_image());
    }

    int yoffset() const {
        return vips_image_get_yoffset(get_image());
    }

    bool has_alpha() const {
        return vips_image_hasalpha(get_image());
    }

    emscripten::val filename() const {
        const char *filename = vips_image_get_filename(get_image());
        if (filename == nullptr)
            return emscripten::val::null();

        return emscripten::val::u8string(filename);
    }

    int page_height() const {
        return vips_image_get_page_height(get_image());
    }

    bool is_killed() const {
        return vips_image_iskilled(get_image());
    }

    void set_kill(bool kill) {
        vips_image_set_kill(get_image(), kill);
    }

    static void eval_handler(VipsImage *image, VipsProgress *progress,
                             void *user);

    void set_progress_callback(emscripten::val js_func);

    emscripten::val stub_getter() const {
        return emscripten::val::null();
    }

    const void *data() const {
        return vips_image_get_data(get_image());
    }

    void set(const std::string &field, int value) const {
        vips_image_set_int(get_image(), field.c_str(), value);
    }

    void set(const std::string &field, const std::vector<int> &values) const {
        vips_image_set_array_int(get_image(), field.c_str(), values.data(),
                                 static_cast<int>(values.size()));
    }

    void set(const std::string &field,
             const std::vector<double> &values) const {
        vips_image_set_array_double(get_image(), field.c_str(), values.data(),
                                    static_cast<int>(values.size()));
    }

    void set(const std::string &field, double value) const {
        vips_image_set_double(get_image(), field.c_str(), value);
    }

    void set(const std::string &field, const std::string &value) const {
        vips_image_set_string(get_image(), field.c_str(), value.c_str());
    }

    void set_blob(const std::string &field, const std::string &data) const {
        // We must take a copy of the data.
        vips_image_set_blob_copy(get_image(), field.c_str(), data.c_str(),
                                 data.size());
    }

    void set_blob(const std::string &field, uintptr_t data, size_t size) const {
        // A non-copy alternative.
        vips_image_set_blob(get_image(), field.c_str(), nullptr,
                            reinterpret_cast<void *>(data), size);
    }

    void set_delete_on_close(bool delete_on_close) const {
        vips_image_set_delete_on_close(get_image(), delete_on_close);
    }

    GType get_typeof(const std::string &field) const {
        return vips_image_get_typeof(get_image(), field.c_str());
    }

    int get_int(const std::string &field) const {
        int value;

        if (vips_image_get_int(get_image(), field.c_str(), &value))
            throw Error("unable to get " + field);

        return value;
    }

    std::vector<int> get_array_int(const std::string &field) const {
        int length;
        int *array;

        if (vips_image_get_array_int(get_image(), field.c_str(), &array,
                                     &length))
            throw Error("unable to get " + field);

        return std::vector<int>(array, array + length);
    }

    std::vector<double> get_array_double(const std::string &field) const {
        int length;
        double *array;

        if (vips_image_get_array_double(get_image(), field.c_str(), &array,
                                        &length))
            throw Error("unable to get " + field);

        return std::vector<double>(array, array + length);
    }

    double get_double(const std::string &field) const {
        double value;

        if (vips_image_get_double(get_image(), field.c_str(), &value))
            throw Error("unable to get " + field);

        return value;
    }

    std::string get_string(const std::string &field) const {
        const char *value;

        if (vips_image_get_string(get_image(), field.c_str(), &value))
            throw Error("unable to get " + field);

        return value;
    }

    emscripten::val get_blob(const std::string &field) const {
        size_t length;
        const void *value;

        if (vips_image_get_blob(get_image(), field.c_str(), &value, &length))
            throw Error("unable to get " + field);

        return emscripten::val(emscripten::typed_memory_view(
            length, static_cast<const uint8_t *>(value)));
    }

    std::vector<std::string> get_fields() const {
        char **fields = vips_image_get_fields(get_image());

        if (fields == nullptr)
            throw Error("unable to get fields");

        std::vector<std::string> v;

        for (int i = 0; fields[i]; ++i) {
            v.emplace_back(fields[i]);
            g_free(fields[i]);
        }
        g_free(fields);

        return v;
    }

    bool remove(const std::string &name) const {
        return vips_image_remove(get_image(), name.c_str());
    }

    static void call(const char *operation_name, const char *option_string,
                     Option *args = nullptr,
                     emscripten::val kwargs = emscripten::val::null(),
                     const Image *match_image = nullptr);

    void call(const char *operation_name, Option *args = nullptr,
              emscripten::val kwargs = emscripten::val::null()) const;

    static Image new_memory();

    static Image new_temp_file(const std::string &file_format = "%s.v");

    static Image
    new_from_file(const std::string &name,
                  emscripten::val js_options = emscripten::val::null());

    static Image new_from_memory(emscripten::val data, int width, int height,
                                 int bands, emscripten::val format);

    static Image new_from_memory(uintptr_t data, size_t size, int width,
                                 int height, int bands, emscripten::val format);

    static Image
    new_from_buffer(const std::string &buffer,
                    const std::string &option_string = "",
                    emscripten::val js_options = emscripten::val::null());

    static Image
    new_from_source(const Source &source, const std::string &option_string = "",
                    emscripten::val js_options = emscripten::val::null());

    static Image new_matrix(int width, int height);

    static Image new_matrix(int width, int height, emscripten::val array);

    static Image new_from_array(emscripten::val array, double scale = 1.0,
                                double offset = 0.0);

    Image new_from_image(emscripten::val pixel) const;

    static Image imageize(emscripten::val v, const Image *match_image);

    Image imageize(emscripten::val v) const;

    static std::vector<Image> imageize_vector(emscripten::val v,
                                              const Image *match_image);

    std::vector<Image> imageize_vector(emscripten::val v) const;

    Image copy_memory() const;

    Image write(Image out) const;

    void
    write_to_file(const std::string &name,
                  emscripten::val js_options = emscripten::val::null()) const;

    emscripten::val
    write_to_buffer(const std::string &suffix,
                    emscripten::val js_options = emscripten::val::null()) const;

    void
    write_to_target(const Target &target, const std::string &suffix,
                    emscripten::val js_options = emscripten::val::null()) const;

    emscripten::val write_to_memory() const;

#include "vips-operators.h"

    // a few useful things

    Image
    composite(emscripten::val in, emscripten::val mode,
              emscripten::val js_options = emscripten::val::null()) const {
        std::vector<Image> v = imageize_vector(in);
        v.insert(v.begin(), *this);

        Image out;

        Image::call("composite", nullptr,
                    (new Option)
                        ->set("out", &out)
                        ->set("in", v)
                        ->set("mode", blend_modes_to_int(mode)),
                    js_options);

        return out;
    }

    Image
    ifthenelse(emscripten::val th, emscripten::val el,
               emscripten::val js_options = emscripten::val::null()) const {
        Image _then;
        Image _else;

        bool th_image = vips::is_image(th);
        bool el_image = vips::is_image(el);

        if (th_image)
            _then = th.as<Image>();
        if (el_image)
            _else = el.as<Image>();

        // we need `then` and `else` to match each other first,
        // and only if they are both constants do we match
        // to `image`.
        if (!th_image)
            _then = (el_image ? _else : *this).imageize(th);
        if (!el_image)
            _else = (th_image ? _then : *this).imageize(el);

        Image out;

        this->call("ifthenelse",
                   (new Option)
                       ->set("cond", *this)
                       ->set("out", &out)
                       ->set("in1", _then)
                       ->set("in2", _else),
                   js_options);

        return out;
    }

    Image linear(emscripten::val a, emscripten::val b,
                 emscripten::val js_options = emscripten::val::null()) const {
        Image out;

        this->call("linear",
                   (new Option)
                       ->set("in", *this)
                       ->set("out", &out)
                       ->set("a", VIPS_TYPE_ARRAY_DOUBLE, a)
                       ->set("b", VIPS_TYPE_ARRAY_DOUBLE, b),
                   js_options);

        return out;
    }

    Image linear(emscripten::val a, const std::vector<double> &b) const {
        Image out;

        this->call("linear", (new Option)
                                 ->set("in", *this)
                                 ->set("out", &out)
                                 ->set("a", VIPS_TYPE_ARRAY_DOUBLE, a)
                                 ->set("b", b));

        return out;
    }

    Image linear(const std::vector<double> &a, emscripten::val b) const {
        Image out;

        this->call("linear", (new Option)
                                 ->set("in", *this)
                                 ->set("out", &out)
                                 ->set("a", a)
                                 ->set("b", VIPS_TYPE_ARRAY_DOUBLE, b));

        return out;
    }

    Image linear(const std::vector<double> &a, double b) const {
        return linear(a, std::vector<double>{b}, emscripten::val::null());
    }

    Image linear(double a, const std::vector<double> &b) const {
        return linear(std::vector<double>{a}, b, emscripten::val::null());
    }

    Image add(const Image &right) const {
        Image out;

        this->call("add", (new Option)
                              ->set("left", *this)
                              ->set("out", &out)
                              ->set("right", right));

        return out;
    }

    Image subtract(const Image &right) const {
        Image out;

        this->call("subtract", (new Option)
                                   ->set("left", *this)
                                   ->set("out", &out)
                                   ->set("right", right));

        return out;
    }

    Image multiply(const Image &right) const {
        Image out;

        this->call("multiply", (new Option)
                                   ->set("left", *this)
                                   ->set("out", &out)
                                   ->set("right", right));

        return out;
    }

    Image divide(const Image &right) const {
        Image out;

        this->call("divide", (new Option)
                                 ->set("left", *this)
                                 ->set("out", &out)
                                 ->set("right", right));

        return out;
    }

    Image remainder(const Image &right) const {
        Image out;

        this->call("remainder", (new Option)
                                    ->set("left", *this)
                                    ->set("out", &out)
                                    ->set("right", right));

        return out;
    }

    Image flip(VipsDirection direction) const {
        Image out;

        this->call("flip", (new Option)
                               ->set("in", *this)
                               ->set("out", &out)
                               ->set("direction", direction));

        return out;
    }

    Image rot(VipsAngle angle) const {
        Image out;

        this->call("rot", (new Option)
                              ->set("in", *this)
                              ->set("out", &out)
                              ->set("angle", angle));

        return out;
    }

    Image morph(const Image &mask, VipsOperationMorphology morph) const {
        Image out;

        this->call("morph", (new Option)
                                ->set("in", *this)
                                ->set("out", &out)
                                ->set("mask", mask)
                                ->set("morph", morph));

        return out;
    }

    Image morph_const(VipsOperationMorphology morph,
                      emscripten::val mask) const {
        Image out;

        this->call("morph", (new Option)
                                ->set("in", *this)
                                ->set("out", &out)
                                ->set("mask", VIPS_TYPE_IMAGE, mask, this)
                                ->set("morph", morph));

        return out;
    }

    Image round(VipsOperationRound round) const {
        Image out;

        this->call("round", (new Option)
                                ->set("in", *this)
                                ->set("out", &out)
                                ->set("round", round));

        return out;
    }

    Image bandbool(VipsOperationBoolean boolean) const {
        Image out;

        this->call("bandbool", (new Option)
                                   ->set("in", *this)
                                   ->set("out", &out)
                                   ->set("boolean", boolean));

        return out;
    }

    Image complexget(VipsOperationComplexget get) const {
        Image out;

        this->call(
            "complexget",
            (new Option)->set("in", *this)->set("out", &out)->set("get", get));

        return out;
    }

    Image complex(VipsOperationComplex cmplx) const {
        Image out;

        this->call("complex", (new Option)
                                  ->set("in", *this)
                                  ->set("out", &out)
                                  ->set("cmplx", cmplx));

        return out;
    }

    Image math(VipsOperationMath math) const {
        Image out;

        this->call("math", (new Option)
                               ->set("in", *this)
                               ->set("out", &out)
                               ->set("math", math));

        return out;
    }

    Image math2(const Image &right, VipsOperationMath2 math2) const {
        Image out;

        this->call("math2", (new Option)
                                ->set("left", *this)
                                ->set("out", &out)
                                ->set("right", right)
                                ->set("math2", math2));

        return out;
    }

    Image math2_const(VipsOperationMath2 math2,
                      const std::vector<double> &c) const {
        Image out;

        this->call("math2_const", (new Option)
                                      ->set("in", *this)
                                      ->set("out", &out)
                                      ->set("math2", math2)
                                      ->set("c", c));

        return out;
    }

    Image boolean(const Image &right, VipsOperationBoolean boolean) const {
        Image out;

        this->call("boolean", (new Option)
                                  ->set("left", *this)
                                  ->set("out", &out)
                                  ->set("right", right)
                                  ->set("boolean", boolean));

        return out;
    }

    Image boolean_const(VipsOperationBoolean boolean,
                        const std::vector<double> &c) const {
        Image out;

        this->call("boolean_const", (new Option)
                                        ->set("in", *this)
                                        ->set("out", &out)
                                        ->set("boolean", boolean)
                                        ->set("c", c));

        return out;
    }

    Image relational(const Image &right,
                     VipsOperationRelational relational) const {
        Image out;

        this->call("relational", (new Option)
                                     ->set("left", *this)
                                     ->set("out", &out)
                                     ->set("right", right)
                                     ->set("relational", relational));

        return out;
    }

    Image relational_const(VipsOperationRelational relational,
                           const std::vector<double> &c) const {
        Image out;

        this->call("relational_const", (new Option)
                                           ->set("in", *this)
                                           ->set("out", &out)
                                           ->set("relational", relational)
                                           ->set("c", c));

        return out;
    }

 private:
    // sig = vi
    void (*progress_callback)(int percent) = nullptr;
};

}  // namespace vips
