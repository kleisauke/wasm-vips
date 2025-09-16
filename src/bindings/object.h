#pragma once

#include <vips/vips.h>

/*
#define VIPS_DEBUG
#define VIPS_DEBUG_VERBOSE
 */

namespace vips {

/**
 * A smart VipsObject pointer class ... use g_object_ref()/_unref() for
 * lifetime management.
 */
class Object {
 public:
    explicit Object(VipsObject *new_vobject = nullptr) : vobject(new_vobject) {
        // we allow NULL init, eg. "VImage a;"
        g_assert(new_vobject == nullptr || VIPS_IS_OBJECT(new_vobject));

#ifdef VIPS_DEBUG_VERBOSE
        printf("Object constructor, obj = %p\n", new_vobject);
        if (new_vobject) {
            printf("   obj ");
            vips_object_print_name(VIPS_OBJECT(new_vobject));
            printf("\n");
        }
#endif /*VIPS_DEBUG_VERBOSE*/
    }

    // copy constructor
    Object(const Object &a) : vobject(a.vobject) {
        g_assert(vobject == nullptr || VIPS_IS_OBJECT(a.vobject));

#ifdef VIPS_DEBUG_VERBOSE
        printf("Object copy constructor, obj = %p\n", vobject);
        printf("   reffing object\n");
#endif /*VIPS_DEBUG_VERBOSE*/

        reference();
    }

    // this mustn't be virtual: we want this class to only be a pointer,
    // no vtable allowed
    ~Object() {
#ifdef VIPS_DEBUG_VERBOSE
        printf("Object destructor\n");
        printf("   unreffing %p\n", vobject);
#endif /*VIPS_DEBUG_VERBOSE*/

        g_assert(vobject == nullptr || VIPS_IS_OBJECT(vobject));

        unreference();
    }

    // assignment ... we must delete the old ref
    Object &operator=(const Object &a) {

#ifdef VIPS_DEBUG_VERBOSE
        printf("Object assignment\n");
        printf("   reffing %p\n", a.vobject);
        printf("   unreffing %p\n", vobject);
#endif /*VIPS_DEBUG_VERBOSE*/

        g_assert(vobject == nullptr || VIPS_IS_OBJECT(vobject));
        g_assert(a.vobject == nullptr || VIPS_IS_OBJECT(a.vobject));

        // check whether we are already referencing this object -
        // if so make this a null op. This will also deal with
        // self-assignment.
        if (vobject != a.vobject) {
            unreference();

            vobject = a.vobject;

            reference();
        }

        return *this;
    }

    VipsObject *get_object() const {
        g_assert(vobject == nullptr || VIPS_IS_OBJECT(vobject));

        return vobject;
    }

 private:
    // can be NULL
    VipsObject *vobject;

    inline void unreference() {
        if (vobject)
            g_object_unref(vobject);
    }

    inline void reference() {
        if (vobject)
            g_object_ref(vobject);
    }
};

}  // namespace vips
