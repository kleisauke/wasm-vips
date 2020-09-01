#include <emscripten.h>
#include <emscripten/bind.h>

#include <string>
#include <type_traits>
#include <vector>

// Need for SFINAE-based specialization testing.
template <typename T>
struct IsVector : std::false_type {};
template <typename... Ts>
struct IsVector<std::vector<Ts...>> : public std::true_type {};

// Specify custom (un)marshalling for all types satisfying std::vector
namespace emscripten {
namespace internal {
// remove_cv/remove_reference is required for TypeID, see:
// https://github.com/emscripten-core/emscripten/issues/7292
template <typename T>
struct TypeID<T, typename std::enable_if<
                     IsVector<typename std::remove_cv<
                         typename std::remove_reference<T>::type>::type>::value,
                     void>::type> {
    static constexpr TYPEID get() {
        return LightTypeID<T>::get();
    }
};
}  // namespace internal
}  // namespace emscripten

// Implemented in JavaScript.
extern "C" void
_embind_register_arithmetic_vector(emscripten::internal::TYPEID vectorType,
                                   const char *name, size_t size, bool isFloat,
                                   bool isSigned);

EMSCRIPTEN_BINDINGS(vector_types) {
    // Register arithmetic vector bindings
    _embind_register_arithmetic_vector(
        emscripten::internal::TypeID<std::vector<int>>::get(), "VectorInt",
        sizeof(int), false, true);
    _embind_register_arithmetic_vector(
        emscripten::internal::TypeID<std::vector<double>>::get(),
        "VectorDouble", sizeof(double), true, true);
    // TODO(kleisauke): std::vector<std::string> <--> ['string'] ?
    /*_embind_register_vector(
        emscripten::internal::TypeID<std::vector<std::string>>::get(),
        sizeof(char), "VectorString");*/
    // TODO(kleisauke): std::vector<Image> <--> [Image] ?
    /*_embind_register_vector(
        emscripten::internal::TypeID<std::vector<Image>>::get(),
        sizeof(Image), "VectorImage");*/
}
