#include "image.h"

/*
#define VIPS_DEBUG
#define VIPS_DEBUG_VERBOSE
 */

namespace vips {

void Image::call(const char *operation_name, const char *option_string,
                 Option *args, emscripten::val kwargs,
                 const Image *match_image) {
    VipsOperation *operation = vips_operation_new(operation_name);

    if (operation == nullptr) {
        delete args;
        throw Error("no such operation " + std::string(operation_name));
    }

#ifdef VIPS_DEBUG_VERBOSE
    printf("call: starting for %s ...\n", operation_name);
#endif /*VIPS_DEBUG_VERBOSE*/

    // Set str options before kwargs options, so the user can't
    // override things we set deliberately.
    if (option_string &&
        vips_object_set_from_string(VIPS_OBJECT(operation), option_string)) {
        vips_object_unref_outputs(VIPS_OBJECT(operation));
        g_object_unref(operation);
        delete args;
        throw Error("unable to call " + std::string(operation_name));
    }

    // Set keyword args
    if (!kwargs.isNull()) {
        g_assert(is_type(kwargs, "object"));

        emscripten::val keys = ObjectKeysVal(kwargs);

        if (args == nullptr)
            args = new Option;

        int key_length = keys["length"].as<int>();
        for (int i = 0; i < key_length; ++i) {
            std::string key = keys[i].as<std::string>();
            emscripten::val value = kwargs[key];

            GParamSpec *pspec;
            VipsArgumentClass *argument_class;
            VipsArgumentInstance *argument_instance;

            if (vips_object_get_argument(VIPS_OBJECT(operation), key.c_str(),
                                         &pspec, &argument_class,
                                         &argument_instance)) {
                vips_object_unref_outputs(VIPS_OBJECT(operation));
                g_object_unref(operation);
                delete args;
                throw Error("unable to call " + std::string(operation_name));
            }

            args = (argument_class->flags & VIPS_ARGUMENT_OUTPUT) &&
                           !(argument_class->flags & VIPS_ARGUMENT_REQUIRED)
                       ? args->set(key, pspec->value_type)
                       : args->set(key, pspec->value_type, value, match_image);
        }
    }

    // Set args
    if (args)
        args->set_operation(operation);

    // Build from cache.
    if (vips_cache_operation_buildp(&operation)) {
        vips_object_unref_outputs(VIPS_OBJECT(operation));
        g_object_unref(operation);
        delete args;
        throw Error("unable to call " + std::string(operation_name));
    }

    // Walk args again, writing output.
    if (args)
        args->get_operation(operation, kwargs);

    // Unref all unassigned outputs.
    vips_object_unref_outputs(VIPS_OBJECT(operation));

    // The operation we have built should now have been reffed by
    // one of its arguments or have finished its work. Either
    // way, we can unref.
    g_object_unref(operation);

    // We're done with args!
    delete args;
}

void Image::call(const char *operation_name, Option *args,
                 emscripten::val kwargs) const {
    Image::call(operation_name, nullptr, args, kwargs, this);
}

void Image::eval_handler(VipsImage *image, VipsProgress *progress, void *user) {
    Image *self = static_cast<Image *>(user);
    if (self->progress_callback == nullptr)
        return;

    proxy_sync([&]() {
        self->progress_callback(progress->percent);
    });
}

void Image::set_progress_callback(emscripten::val js_func) {
    emscripten::val ptr = emscripten::val::module_property("addFunction")(
        js_func, emscripten::val("vi"));
    progress_callback = reinterpret_cast<void (*)(int)>(ptr.as<int>());

    vips_image_set_progress(get_image(), 1);
    g_signal_connect(get_image(), "eval", G_CALLBACK(eval_handler), this);
}

Image Image::new_memory() {
    return Image(vips_image_new_memory());
}

Image Image::new_temp_file(const std::string &file_format) {
    VipsImage *image = vips_image_new_temp_file(file_format.c_str());

    if (image == nullptr)
        throw Error("unable to make temp file");

    return Image(image);
}

Image Image::new_from_file(const std::string &name,
                           emscripten::val js_options) {
    char filename[VIPS_PATH_MAX];
    char option_string[VIPS_PATH_MAX];

    vips__filename_split8(name.c_str(), filename, option_string);

    const char *operation_name = vips_foreign_find_load(filename);

    if (operation_name == nullptr)
        throw Error("unable to load from file " + std::string(filename));

    Image out;

    Image::call(operation_name, option_string,
                (new Option)->set("filename", filename)->set("out", &out),
                js_options);

    return out;
}

Image Image::new_from_memory(emscripten::val data, int width, int height,
                             int bands, emscripten::val format) {
    VipsBandFormat band_format = static_cast<VipsBandFormat>(
        Option::to_enum(VIPS_TYPE_BAND_FORMAT, format));

    VipsImage *image;

    switch (band_format) {
        case VIPS_FORMAT_UCHAR: {
            std::vector<u_int8_t> v =
                emscripten::convertJSArrayToNumberVector<u_int8_t>(data);
            image = vips_image_new_from_memory_copy(
                v.data(), sizeof(u_int8_t) * v.size(), width, height, bands,
                band_format);
            break;
        }
        case VIPS_FORMAT_CHAR: {
            std::vector<int8_t> v =
                emscripten::convertJSArrayToNumberVector<int8_t>(data);
            image = vips_image_new_from_memory_copy(
                v.data(), sizeof(int8_t) * v.size(), width, height, bands,
                band_format);
            break;
        }
        case VIPS_FORMAT_USHORT: {
            std::vector<u_int16_t> v =
                emscripten::convertJSArrayToNumberVector<u_int16_t>(data);
            image = vips_image_new_from_memory_copy(
                v.data(), sizeof(u_int16_t) * v.size(), width, height, bands,
                band_format);
            break;
        }
        case VIPS_FORMAT_SHORT: {
            std::vector<int16_t> v =
                emscripten::convertJSArrayToNumberVector<int16_t>(data);
            image = vips_image_new_from_memory_copy(
                v.data(), sizeof(int16_t) * v.size(), width, height, bands,
                band_format);
            break;
        }
        case VIPS_FORMAT_UINT: {
            std::vector<u_int32_t> v =
                emscripten::convertJSArrayToNumberVector<u_int32_t>(data);
            image = vips_image_new_from_memory_copy(
                v.data(), sizeof(u_int32_t) * v.size(), width, height, bands,
                band_format);
            break;
        }
        case VIPS_FORMAT_INT: {
            std::vector<int32_t> v =
                emscripten::convertJSArrayToNumberVector<int32_t>(data);
            image = vips_image_new_from_memory_copy(
                v.data(), sizeof(int32_t) * v.size(), width, height, bands,
                band_format);
            break;
        }
        case VIPS_FORMAT_FLOAT: {
            std::vector<float> v =
                emscripten::convertJSArrayToNumberVector<float>(data);
            image = vips_image_new_from_memory_copy(
                v.data(), sizeof(float) * v.size(), width, height, bands,
                band_format);
            break;
        }
        case VIPS_FORMAT_DOUBLE: {
            std::vector<double> v =
                emscripten::convertJSArrayToNumberVector<double>(data);
            image = vips_image_new_from_memory_copy(
                v.data(), sizeof(double) * v.size(), width, height, bands,
                band_format);
            break;
        }
        default:
            throw std::invalid_argument("band format unsupported");
    }

    if (image == nullptr)
        throw Error("unable to make image from memory");

    return Image(image);
}

Image Image::new_from_memory(uintptr_t data, size_t size, int width, int height,
                             int bands, emscripten::val format) {
    // A non-copy alternative.
    VipsImage *image = vips_image_new_from_memory(
        reinterpret_cast<void *>(data), size, width, height, bands,
        static_cast<VipsBandFormat>(
            Option::to_enum(VIPS_TYPE_BAND_FORMAT, format)));

    if (image == nullptr)
        throw Error("unable to make image from memory");

    return Image(image);
}

Image Image::new_from_buffer(const std::string &buffer,
                             const std::string &option_string,
                             emscripten::val js_options) {
    const char *operation_name =
        vips_foreign_find_load_buffer(buffer.c_str(), buffer.size());

    if (operation_name == nullptr)
        throw Error("unable to load from buffer");

    Image out;

    // We must take a copy of the data.
    VipsBlob *blob = vips_blob_copy(buffer.c_str(), buffer.size());
    Option *options = (new Option)->set("buffer", blob)->set("out", &out);
    vips_area_unref(VIPS_AREA(blob));

    Image::call(operation_name, option_string.c_str(), options, js_options);

    return out;
}

Image Image::new_from_source(const Source &source,
                             const std::string &option_string,
                             emscripten::val js_options) {
    const char *operation_name =
        vips_foreign_find_load_source(source.get_source());

    if (operation_name == nullptr)
        throw Error("unable to load from source");

    Image out;

    Image::call(operation_name, option_string.c_str(),
                (new Option)->set("source", source)->set("out", &out),
                js_options);

    return out;
}

Image Image::new_matrix(int width, int height) {
    return Image(vips_image_new_matrix(width, height));
}

Image Image::new_matrix(int width, int height, emscripten::val array) {
    std::vector<double> v = to_vector<double>(array);

    VipsImage *image = vips_image_new_matrix_from_array(
        width, height, v.data(), static_cast<int>(v.size()));

    if (image == nullptr)
        throw Error("unable to make image from matrix");

    return Image(image);
}

Image Image::new_from_array(emscripten::val array, double scale,
                            double offset) {
    std::vector<double> v;

    int width;
    int height;

    if (is_2D(array)) {
        width = array[0]["length"].as<int>();
        height = array["length"].as<int>();

        v.resize(width * height);

        for (int y = 0; y < height; ++y)
            for (int x = 0; x < width; ++x)
                v[x + y * width] = array[y][x].as<double>();
    } else if (array.isArray()) {
        width = array["length"].as<int>();
        height = 1;

        v.reserve(width);

        for (int x = 0; x < width; ++x)
            v.push_back(array[x].as<double>());
    } else {
        // Allow single pixels/images (for e.g.
        // `vips.Image.newFromArray(127.5)`).
        v = {array.as<double>()};
        width = 1;
        height = 1;
    }

    VipsImage *image = vips_image_new_matrix_from_array(width, height, v.data(),
                                                        width * height);

    if (image == nullptr)
        throw Error("unable to make image from array");

    vips_image_set_double(image, "scale", scale);
    vips_image_set_double(image, "offset", offset);

    return Image(image);
}

Image Image::new_from_image(emscripten::val pixel) const {
    std::vector<double> v = to_vector<double>(pixel);

    VipsImage *image = vips_image_new_from_image(get_image(), v.data(),
                                                 static_cast<int>(v.size()));

    if (image == nullptr)
        throw Error("unable to make image from image");

    return Image(image);
}

Image Image::imageize(emscripten::val v, const Image *match_image) {
    if (match_image)
        return match_image->imageize(v);

    return is_image(v) ? v.as<Image>() : Image::new_from_array(v);
}

Image Image::imageize(emscripten::val v) const {
    if (is_image(v))
        return v.as<Image>();
    if (is_2D(v))
        return Image::new_from_array(v);

    return new_from_image(v);
}

std::vector<Image> Image::imageize_vector(emscripten::val v,
                                          const Image *match_image) {
    if (match_image)
        return match_image->imageize_vector(v);

    std::vector<Image> rv;

    if (v.isArray()) {
        unsigned l = v["length"].as<unsigned>();

        rv.reserve(l);

        for (unsigned i = 0; i < l; ++i)
            rv.push_back(is_image(v[i]) ? v[i].as<Image>()
                                        : Image::new_from_array(v[i]));
    } else {
        rv = {is_image(v) ? v.as<Image>() : Image::new_from_array(v)};
    }

    return rv;
}

std::vector<Image> Image::imageize_vector(emscripten::val v) const {
    std::vector<Image> images;

    if (v.isArray()) {
        unsigned l = v["length"].as<unsigned>();

        images.reserve(l);

        for (unsigned i = 0; i < l; ++i)
            images.push_back(imageize(v[i]));
    } else {
        images = {imageize(v)};
    }

    return images;
}

Image Image::copy_memory() const {
    VipsImage *image = vips_image_copy_memory(get_image());

    if (image == nullptr)
        throw Error("unable to copy to memory");

    return Image(image);
}

Image Image::write(Image out) const {
    if (vips_image_write(get_image(), out.get_image()))
        throw Error("unable to write to image");

    return out;
}

void Image::write_to_file(const std::string &name,
                          emscripten::val js_options) const {
    char filename[VIPS_PATH_MAX];
    char option_string[VIPS_PATH_MAX];

    vips__filename_split8(name.c_str(), filename, option_string);

    const char *operation_name = vips_foreign_find_save(filename);

    if (operation_name == nullptr)
        throw Error("unable to write to file " + std::string(filename));

    Image::call(operation_name, option_string,
                (new Option)->set("in", *this)->set("filename", filename),
                js_options);
}

emscripten::val Image::write_to_buffer(const std::string &suffix,
                                       emscripten::val js_options) const {
    char filename[VIPS_PATH_MAX];
    char option_string[VIPS_PATH_MAX];
    const char *operation_name;
    VipsBlob *blob;

    /* Save with the new target API if we can. Fall back to the older
     * mechanism in case the saver we need has not been converted yet.
     *
     * We need to hide any errors from this first phase.
     */
    vips__filename_split8(suffix.c_str(), filename, option_string);

    vips_error_freeze();
    operation_name = vips_foreign_find_save_target(filename);
    vips_error_thaw();

    if (operation_name) {
        Target target = Target::new_to_memory();

        Image::call(operation_name, option_string,
                    (new Option)->set("in", *this)->set("target", target),
                    js_options);

        g_object_get(target.get_target(), "blob", &blob, nullptr);
    } else if ((operation_name = vips_foreign_find_save_buffer(filename))) {
        Image::call(operation_name, option_string,
                    (new Option)->set("in", *this)->set("buffer", &blob),
                    js_options);
    } else {
        throw Error("unable to write to buffer");
    }

    emscripten::val result = BlobVal.new_(emscripten::typed_memory_view(
        VIPS_AREA(blob)->length,
        static_cast<uint8_t *>(VIPS_AREA(blob)->data)));
    vips_area_unref(VIPS_AREA(blob));

    return result;
}

void Image::write_to_target(const Target &target, const std::string &suffix,
                            emscripten::val js_options) const {
    char filename[VIPS_PATH_MAX];
    char option_string[VIPS_PATH_MAX];

    vips__filename_split8(suffix.c_str(), filename, option_string);

    const char *operation_name = vips_foreign_find_save_target(filename);

    if (operation_name == nullptr)
        throw Error("unable to write to target");

    Image::call(operation_name, option_string,
                (new Option)->set("in", *this)->set("target", target),
                js_options);
}

emscripten::val Image::write_to_memory() const {
    size_t size;
    void *mem = vips_image_write_to_memory(get_image(), &size);

    if (mem == nullptr)
        throw Error("unable to write to memory");

    emscripten::val result;

    switch (vips_image_get_format(get_image())) {
        case VIPS_FORMAT_UCHAR:
            result = BlobVal.new_(emscripten::typed_memory_view(
                size / sizeof(u_int8_t), static_cast<uint8_t *>(mem)));
            break;
        case VIPS_FORMAT_CHAR:
            result =
                emscripten::val::global("Int8Array")
                    .new_(emscripten::typed_memory_view(
                        size / sizeof(int8_t), static_cast<int8_t *>(mem)));
            break;
        case VIPS_FORMAT_USHORT:
            result = emscripten::val::global("Uint16Array")
                         .new_(emscripten::typed_memory_view(
                             size / sizeof(u_int16_t),
                             static_cast<u_int16_t *>(mem)));
            break;
        case VIPS_FORMAT_SHORT:
            result =
                emscripten::val::global("Int16Array")
                    .new_(emscripten::typed_memory_view(
                        size / sizeof(int16_t), static_cast<int16_t *>(mem)));
            break;

        case VIPS_FORMAT_UINT:
            result = emscripten::val::global("Uint32Array")
                         .new_(emscripten::typed_memory_view(
                             size / sizeof(u_int32_t),
                             static_cast<u_int32_t *>(mem)));
            break;

        case VIPS_FORMAT_INT:
            result =
                emscripten::val::global("Int32Array")
                    .new_(emscripten::typed_memory_view(
                        size / sizeof(int32_t), static_cast<int32_t *>(mem)));
            break;
        case VIPS_FORMAT_FLOAT:
            result = emscripten::val::global("Float32Array")
                         .new_(emscripten::typed_memory_view(
                             size / sizeof(float), static_cast<float *>(mem)));
            break;

        case VIPS_FORMAT_DOUBLE:
            result =
                emscripten::val::global("Float64Array")
                    .new_(emscripten::typed_memory_view(
                        size / sizeof(double), static_cast<double *>(mem)));
            break;
        default:
            g_free(mem);
            throw std::invalid_argument("band format unsupported");
    }

    g_free(mem);
    return result;
}

#include "vips-operators.cpp"

}  // namespace vips
