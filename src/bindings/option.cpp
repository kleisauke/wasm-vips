#include "option.h"
#include "image.h"
#include "interpolate.h"
#include "connection.h"
#include "utils.h"

namespace vips {

Option::~Option() {
    for (Pair *option : options)
        delete option;
}

Option::Pair::Pair(std::string name)
    : name(std::move(name)), value(G_VALUE_INIT), type(Type::JS_OUTPUT),
      vimage(nullptr) {}

// input bool
Option::Pair::Pair(std::string name, bool vbool)
    : name(std::move(name)), value(G_VALUE_INIT), type(Type::INPUT) {
    g_value_init(&value, G_TYPE_BOOLEAN);
    g_value_set_boolean(&value, vbool ? 1 : 0);
}

// input int ... this path is used for enums as well
Option::Pair::Pair(std::string name, int vint)
    : name(std::move(name)), value(G_VALUE_INIT), type(Type::INPUT) {
    g_value_init(&value, G_TYPE_INT);
    g_value_set_int(&value, vint);
}

// input double
Option::Pair::Pair(std::string name, double vdouble)
    : name(std::move(name)), value(G_VALUE_INIT), type(Type::INPUT) {
    g_value_init(&value, G_TYPE_DOUBLE);
    g_value_set_double(&value, vdouble);
}

// input string
Option::Pair::Pair(std::string name, const char *vstring)
    : name(std::move(name)), value(G_VALUE_INIT), type(Type::INPUT) {
    g_value_init(&value, G_TYPE_STRING);
    g_value_set_string(&value, vstring);
}

// input std::string
Option::Pair::Pair(std::string name, const std::string &vstring)
    : name(std::move(name)), value(G_VALUE_INIT), type(Type::INPUT) {
    g_value_init(&value, G_TYPE_STRING);
    g_value_set_string(&value, vstring.c_str());
}

// input vips object (image, source, target, etc.)
Option::Pair::Pair(std::string name, const Object &vobject)
    : name(std::move(name)), value(G_VALUE_INIT), type(Type::INPUT) {
    VipsObject *object = vobject.get_object();
    g_value_init(&value, G_OBJECT_TYPE(object));
    g_value_set_object(&value, object);
}

// input double array
Option::Pair::Pair(std::string name, const std::vector<double> &vvector)
    : name(std::move(name)), value(G_VALUE_INIT), type(Type::INPUT) {
    g_value_init(&value, VIPS_TYPE_ARRAY_DOUBLE);
    vips_value_set_array_double(&value, nullptr,
                                static_cast<int>(vvector.size()));
    double *array = vips_value_get_array_double(&value, nullptr);
    std::copy(vvector.begin(), vvector.end(), array);
}

// input int array
Option::Pair::Pair(std::string name, const std::vector<int> &vvector)
    : name(std::move(name)), value(G_VALUE_INIT), type(Type::INPUT) {
    g_value_init(&value, VIPS_TYPE_ARRAY_INT);
    vips_value_set_array_int(&value, nullptr, static_cast<int>(vvector.size()));
    int *array = vips_value_get_array_int(&value, nullptr);
    std::copy(vvector.begin(), vvector.end(), array);
}

// input int array
Option::Pair::Pair(std::string name, const std::vector<Image> &vvector)
    : name(std::move(name)), value(G_VALUE_INIT), type(Type::INPUT) {
    VipsImage **array;

    g_value_init(&value, VIPS_TYPE_ARRAY_IMAGE);
    vips_value_set_array_image(&value, static_cast<int>(vvector.size()));
    array = vips_value_get_array_image(&value, nullptr);

    for (size_t i = 0; i < vvector.size(); ++i) {
        VipsImage *vips_image = vvector[i].get_image();

        array[i] = vips_image;
        g_object_ref(vips_image);
    }
}

// input blob
Option::Pair::Pair(std::string name, VipsBlob *vblob)
    : name(std::move(name)), value(G_VALUE_INIT), type(Type::INPUT) {
    g_value_init(&value, VIPS_TYPE_BLOB);
    g_value_set_boxed(&value, vblob);
}

// output bool
Option::Pair::Pair(std::string name, bool *vbool)
    : name(std::move(name)), value(G_VALUE_INIT), type(Type::OUTPUT),
      vbool(vbool) {
    g_value_init(&value, G_TYPE_BOOLEAN);
}

// output int
Option::Pair::Pair(std::string name, int *vint)
    : name(std::move(name)), value(G_VALUE_INIT), type(Type::OUTPUT),
      vint(vint) {
    g_value_init(&value, G_TYPE_INT);
}

// output double
Option::Pair::Pair(std::string name, double *vdouble)
    : name(std::move(name)), value(G_VALUE_INIT), type(Type::OUTPUT),
      vdouble(vdouble) {
    g_value_init(&value, G_TYPE_DOUBLE);
}

// output image
Option::Pair::Pair(std::string name, Image *vimage)
    : name(std::move(name)), value(G_VALUE_INIT), type(Type::OUTPUT),
      vimage(vimage) {
    g_value_init(&value, VIPS_TYPE_IMAGE);
}

// output doublearray
Option::Pair::Pair(std::string name, std::vector<double> *vvector)
    : name(std::move(name)), value(G_VALUE_INIT), type(Type::OUTPUT),
      vvector(vvector) {
    g_value_init(&value, VIPS_TYPE_ARRAY_DOUBLE);
}

// output blob
Option::Pair::Pair(std::string name, VipsBlob **vblob)
    : name(std::move(name)), value(G_VALUE_INIT), type(Type::OUTPUT),
      vblob(vblob) {
    g_value_init(&value, VIPS_TYPE_BLOB);
}

int Option::to_enum(GType type, emscripten::val val) {
    if (val.isString()) {
        std::string enum_str = val.as<std::string>();
        return vips_enum_from_nick("wasm-vips", type, enum_str.c_str());
    } else if (val.isNumber()) {
        return val.as<int>();
    } else if (val["value"].isNumber()) {
        return val["value"].as<int>();
    } else {
        throw_type_error("unsupported type for enum " +
                         val.typeOf().as<std::string>());
        return -1;
    }
}

int Option::to_flag(GType type, emscripten::val val) {
    if (val.isString()) {
        std::string flag_str = val.as<std::string>();
        return vips_flags_from_nick("wasm-vips", type, flag_str.c_str());
    } else if (val.isNumber()) {
        return val.as<int>();
    } else if (val["value"].isNumber()) {
        return val["value"].as<int>();
    } else {
        throw_type_error("unsupported type for flag " +
                         val.typeOf().as<std::string>());
        return -1;
    }
}

Option *Option::set(const std::string &name, GType type, emscripten::val val,
                    const Image *match_image) {
    GType fundamental = G_TYPE_FUNDAMENTAL(type);

    if (type == G_TYPE_BOOLEAN) {
        set(name, val.as<bool>());
    } else if (type == G_TYPE_INT) {
        set(name, val.as<int>());
    } else if (type == G_TYPE_DOUBLE) {
        set(name, val.as<double>());
    } else if (fundamental == G_TYPE_ENUM) {
        set(name, to_enum(type, val));
    } else if (fundamental == G_TYPE_FLAGS) {
        set(name, to_flag(type, val));
    } else if (type == G_TYPE_STRING) {
        set(name, val.as<std::string>());
    } else if (type == VIPS_TYPE_IMAGE) {
        set(name, Image::imageize(val, match_image));
    } else if (type == VIPS_TYPE_INTERPOLATE) {
        set(name, val.as<Interpolate>());
    } else if (type == VIPS_TYPE_ARRAY_INT) {
        set(name, to_vector<int>(val));
    } else if (type == VIPS_TYPE_ARRAY_DOUBLE) {
        set(name, to_vector<double>(val));
    } else if (type == VIPS_TYPE_ARRAY_IMAGE) {
        set(name, Image::imageize_vector(val, match_image));
    } else if (type == VIPS_TYPE_BLOB) {
        std::string buffer = val.as<std::string>();

        // We must take a copy of the data.
        VipsBlob *blob = vips_blob_copy(buffer.c_str(), buffer.size());
        set(name, blob);
        vips_area_unref(VIPS_AREA(blob));
    } else {
        throw_type_error("unsupported gtype for Option::set " +
                         std::string(g_type_name(type)) + ", value type " +
                         val.typeOf().as<std::string>());
    }

    return this;
}

Option *Option::set(const std::string &name, GType type) {
    GType fundamental = G_TYPE_FUNDAMENTAL(type);

    Pair *pair = new Pair(name);

    if (type == G_TYPE_BOOLEAN || type == G_TYPE_DOUBLE ||
        type == VIPS_TYPE_BLOB || fundamental == G_TYPE_OBJECT) {
        g_value_init(&pair->value, type);
    } else if (type == G_TYPE_INT || fundamental == G_TYPE_ENUM ||
               fundamental == G_TYPE_FLAGS) {
        // remap G_TYPE_{ENUM,FLAGS} to G_TYPE_INT
        g_value_init(&pair->value, G_TYPE_INT);
    } else if (type == VIPS_TYPE_ARRAY_INT || type == VIPS_TYPE_ARRAY_DOUBLE) {
        // remap VIPS_TYPE_ARRAY_INT to VIPS_TYPE_ARRAY_DOUBLE
        g_value_init(&pair->value, VIPS_TYPE_ARRAY_DOUBLE);
    } else {
        throw_type_error("unsupported gtype for Option::set " +
                         std::string(g_type_name(type)));
    }

    options.push_back(pair);

    return this;
}

// just g_object_set_property(), except we allow set enum from string
static void set_property(VipsObject *object, const std::string &name,
                         const GValue *value) {
    VipsObjectClass *object_class = VIPS_OBJECT_GET_CLASS(object);
    GType type = G_VALUE_TYPE(value);

    // Look up the GParamSpec
    GParamSpec *pspec = g_object_class_find_property(
        G_OBJECT_CLASS(object_class), name.c_str());
    if (pspec == nullptr) {
        throw_vips_error("property " + name + " not found");
    }

    if (G_IS_PARAM_SPEC_ENUM(pspec) && type == G_TYPE_STRING) {
        GType pspec_type = G_PARAM_SPEC_VALUE_TYPE(pspec);

        int enum_value = vips_enum_from_nick(object_class->nickname, pspec_type,
                                             g_value_get_string(value));

        if (enum_value < 0) {
            g_warning("%s", vips_error_buffer());
            vips_error_clear();
            return;
        }

        GValue value2 = G_VALUE_INIT;
        g_value_init(&value2, pspec_type);
        g_value_set_enum(&value2, enum_value);
        g_object_set_property(G_OBJECT(object), name.c_str(), &value2);
        g_value_unset(&value2);
    } else {
        g_object_set_property(G_OBJECT(object), name.c_str(), value);
    }
}

// walk the options and set props on the operation
void Option::set_operation(VipsOperation *operation) {
    for (Pair *option : options)
        if (option->type == Type::INPUT) {
#ifdef VIPS_DEBUG_VERBOSE
            printf("set_operation: ");
            vips_object_print_name(VIPS_OBJECT(operation));
            char *str_value = g_strdup_value_contents(&(*i)->value);
            printf(".%s = %s\n", (*i)->name, str_value);
            g_free(str_value);
#endif /*VIPS_DEBUG_VERBOSE*/

            set_property(VIPS_OBJECT(operation), option->name, &option->value);
        }
}

// walk the options and fetch any requested outputs
void Option::get_operation(VipsOperation *operation, emscripten::val kwargs) {
    for (Pair *option : options)
        if (option->type != Type::INPUT) {
            std::string name = option->name;

            g_object_get_property(G_OBJECT(operation), name.c_str(),
                                  &option->value);

#ifdef VIPS_DEBUG_VERBOSE
            printf("get_operation: ");
            vips_object_print_name(VIPS_OBJECT(operation));
            char *str_value = g_strdup_value_contents(&(*i)->value);
            printf(".%s = %s\n", name, str_value);
            g_free(str_value);
#endif /*VIPS_DEBUG_VERBOSE*/

            GValue *value = &option->value;
            GType type = G_VALUE_TYPE(value);

            if (type == VIPS_TYPE_IMAGE) {
                // rebox object
                VipsImage *image = VIPS_IMAGE(g_value_get_object(value));
                if (option->type == Type::JS_OUTPUT) {
                    kwargs.set(name, Image(image));
                } else {
                    *(option->vimage) = Image(image);
                }
            } else if (type == G_TYPE_INT) {
                if (option->type == Type::JS_OUTPUT) {
                    kwargs.set(name, g_value_get_int(value));
                } else {
                    *(option->vint) = g_value_get_int(value);
                }
            } else if (type == G_TYPE_BOOLEAN) {
                if (option->type == Type::JS_OUTPUT) {
                    kwargs.set(name, g_value_get_boolean(value) == 1);
                } else {
                    *(option->vbool) = g_value_get_boolean(value) == 1;
                }
            } else if (type == G_TYPE_DOUBLE) {
                if (option->type == Type::JS_OUTPUT) {
                    kwargs.set(name, g_value_get_double(value));
                } else {
                    *(option->vdouble) = g_value_get_double(value);
                }
            } else if (type == VIPS_TYPE_ARRAY_DOUBLE) {
                int length;
                double *array = vips_value_get_array_double(value, &length);

                if (option->type == Type::JS_OUTPUT) {
                    kwargs.set(name,
                               std::vector<double>(array, array + length));
                } else {
                    (option->vvector)->resize(length);
                    for (int j = 0; j < length; j++)
                        (*(option->vvector))[j] = array[j];
                }

            } else if (type == VIPS_TYPE_BLOB) {
                if (option->type == Type::JS_OUTPUT) {
                    VipsBlob *blob =
                        reinterpret_cast<VipsBlob *>(g_value_dup_boxed(value));
                    kwargs.set(name,
                               emscripten::val(emscripten::typed_memory_view(
                                   VIPS_AREA(blob)->length,
                                   reinterpret_cast<uint8_t *>(
                                       VIPS_AREA(blob)->data))));
                    VIPS_AREA(blob)->free_fn = nullptr;
                    vips_area_unref(VIPS_AREA(blob));
                } else {
                    // our caller gets a reference
                    *(option->vblob) =
                        reinterpret_cast<VipsBlob *>(g_value_dup_boxed(value));
                }
            }
        }
}

}  // namespace vips
