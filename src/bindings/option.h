#pragma once

#include <list>
#include <string>
#include <vector>

#include <emscripten/val.h>
#include <vips/vips.h>

namespace vips {

// Need forward declarations, unfortunately.
class Image;
class Object;

class Option {
 public:
    Option() = default;

    virtual ~Option();

    template <typename T>
    inline Option *set(const std::string &name, T value) {
        options.emplace_back(new Pair(name, value));

        return this;
    }

    Option *set(const std::string &name, GType type, emscripten::val val,
                const Image *match_image = nullptr);

    Option *set(const std::string &name, GType type);

    static int to_enum(GType type, emscripten::val val);
    static int to_flag(GType type, emscripten::val val);

    void set_operation(VipsOperation *operation);
    void get_operation(VipsOperation *operation, emscripten::val kwargs);

 private:
    enum class Type { INPUT = 0, OUTPUT = 1, JS_OUTPUT = 2 };

    struct Pair {
        std::string name;

        // the thing we pass to and from our caller
        GValue value;

        // an input or (JS-)output parameter ... we guess the direction
        // from the arg to set()
        Type type;

        // the pointer we write output values to
        union {
            bool *vbool;
            int *vint;
            double *vdouble;
            Image *vimage;
            std::vector<double> *vvector;
            VipsBlob **vblob;
        };

        explicit Pair(std::string name);

        Pair(std::string name, bool vbool);
        Pair(std::string name, int vint);
        Pair(std::string name, double vdouble);
        Pair(std::string name, const char *vstring);
        Pair(std::string name, const std::string &vstring);
        Pair(std::string name, const Object &vobject);
        Pair(std::string name, const std::vector<double> &vvector);
        Pair(std::string name, const std::vector<int> &vvector);
        Pair(std::string name, const std::vector<Image> &vvector);
        Pair(std::string name, VipsBlob *vblob);

        Pair(std::string name, bool *vbool);
        Pair(std::string name, int *vint);
        Pair(std::string name, double *vdouble);
        Pair(std::string name, Image *vimage);
        Pair(std::string name, std::vector<double> *vvector);
        Pair(std::string name, VipsBlob **vblob);

        ~Pair() {
            g_value_unset(&value);
        }
    };

    std::list<Pair *> options;
};

}  // namespace vips
