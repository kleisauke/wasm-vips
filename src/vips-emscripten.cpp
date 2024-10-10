#include "bindings/connection.h"
#include "bindings/image.h"
#include "bindings/interpolate.h"
#include "bindings/object.h"
#include "bindings/utils.h"

#include <emscripten/bind.h>
#include <emscripten/emscripten.h>
#include <emscripten/val.h>
#include <emscripten/version.h>
#ifdef WASMFS
#include <emscripten/wasmfs.h>
#endif

#include <vips/vips.h>

using namespace emscripten;

using vips::Connection;
using vips::Image;
using vips::Interpolate;
using vips::Object;
using vips::Option;
using vips::Source;
using vips::SourceCustom;
using vips::Target;
using vips::TargetCustom;

#ifdef WASMFS
EM_JS(bool, is_node, (), { return ENVIRONMENT_IS_NODE; });

namespace wasmfs {

backend_t wasmfs_create_root_dir() {
    return is_node() ? wasmfs_create_node_backend(".")
                     : wasmfs_create_memory_backend();
}

}  // namespace wasmfs
#endif

int main() {
    if (vips_init("wasm-vips") != 0)
        vips_error_exit("unable to start up libvips");

    // By default, libvips' operation cache will (at its maximum):
    //  - cache 100 operations;
    //  - spend 100mb of memory;
    //  - hold 100 files open;
    // We need to lower these numbers for Wasm a bit.
    vips_cache_set_max_mem(50 * 1024 * 1024);  // = 50mb
    vips_cache_set_max_files(20);

    // Handy for debugging.
    // vips_leak_set(1);

    emscripten_exit_with_live_runtime();

    return 0;
}

struct TrimResult {
    int left;
    int top;
    int width;
    int height;
};

struct ColumnsRowsResult {
    Image columns;
    Image rows;
};

struct Cache {};
struct Stats {};
struct Utils {};

/**
 * Note: this was partially generated automatically.
 */
EMSCRIPTEN_BINDINGS(my_module) {
    // Auto-generated enums
    enum_<VipsBandFormat>("BandFormat")
        .value("notset", VIPS_FORMAT_NOTSET)
        .value("uchar", VIPS_FORMAT_UCHAR)
        .value("char", VIPS_FORMAT_CHAR)
        .value("ushort", VIPS_FORMAT_USHORT)
        .value("short", VIPS_FORMAT_SHORT)
        .value("uint", VIPS_FORMAT_UINT)
        .value("int", VIPS_FORMAT_INT)
        .value("float", VIPS_FORMAT_FLOAT)
        .value("complex", VIPS_FORMAT_COMPLEX)
        .value("double", VIPS_FORMAT_DOUBLE)
        .value("dpcomplex", VIPS_FORMAT_DPCOMPLEX);

    enum_<VipsBlendMode>("BlendMode")
        .value("clear", VIPS_BLEND_MODE_CLEAR)
        .value("source", VIPS_BLEND_MODE_SOURCE)
        .value("over", VIPS_BLEND_MODE_OVER)
        .value("in", VIPS_BLEND_MODE_IN)
        .value("out", VIPS_BLEND_MODE_OUT)
        .value("atop", VIPS_BLEND_MODE_ATOP)
        .value("dest", VIPS_BLEND_MODE_DEST)
        .value("dest_over", VIPS_BLEND_MODE_DEST_OVER)
        .value("dest_in", VIPS_BLEND_MODE_DEST_IN)
        .value("dest_out", VIPS_BLEND_MODE_DEST_OUT)
        .value("dest_atop", VIPS_BLEND_MODE_DEST_ATOP)
        .value("xor", VIPS_BLEND_MODE_XOR)
        .value("add", VIPS_BLEND_MODE_ADD)
        .value("saturate", VIPS_BLEND_MODE_SATURATE)
        .value("multiply", VIPS_BLEND_MODE_MULTIPLY)
        .value("screen", VIPS_BLEND_MODE_SCREEN)
        .value("overlay", VIPS_BLEND_MODE_OVERLAY)
        .value("darken", VIPS_BLEND_MODE_DARKEN)
        .value("lighten", VIPS_BLEND_MODE_LIGHTEN)
        .value("colour_dodge", VIPS_BLEND_MODE_COLOUR_DODGE)
        .value("colour_burn", VIPS_BLEND_MODE_COLOUR_BURN)
        .value("hard_light", VIPS_BLEND_MODE_HARD_LIGHT)
        .value("soft_light", VIPS_BLEND_MODE_SOFT_LIGHT)
        .value("difference", VIPS_BLEND_MODE_DIFFERENCE)
        .value("exclusion", VIPS_BLEND_MODE_EXCLUSION);

    enum_<VipsCoding>("Coding")
        .value("error", VIPS_CODING_ERROR)
        .value("none", VIPS_CODING_NONE)
        .value("labq", VIPS_CODING_LABQ)
        .value("rad", VIPS_CODING_RAD);

    enum_<VipsInterpretation>("Interpretation")
        .value("error", VIPS_INTERPRETATION_ERROR)
        .value("multiband", VIPS_INTERPRETATION_MULTIBAND)
        .value("b_w", VIPS_INTERPRETATION_B_W)
        .value("histogram", VIPS_INTERPRETATION_HISTOGRAM)
        .value("xyz", VIPS_INTERPRETATION_XYZ)
        .value("lab", VIPS_INTERPRETATION_LAB)
        .value("cmyk", VIPS_INTERPRETATION_CMYK)
        .value("labq", VIPS_INTERPRETATION_LABQ)
        .value("rgb", VIPS_INTERPRETATION_RGB)
        .value("cmc", VIPS_INTERPRETATION_CMC)
        .value("lch", VIPS_INTERPRETATION_LCH)
        .value("labs", VIPS_INTERPRETATION_LABS)
        .value("srgb", VIPS_INTERPRETATION_sRGB)
        .value("yxy", VIPS_INTERPRETATION_YXY)
        .value("fourier", VIPS_INTERPRETATION_FOURIER)
        .value("rgb16", VIPS_INTERPRETATION_RGB16)
        .value("grey16", VIPS_INTERPRETATION_GREY16)
        .value("matrix", VIPS_INTERPRETATION_MATRIX)
        .value("scrgb", VIPS_INTERPRETATION_scRGB)
        .value("hsv", VIPS_INTERPRETATION_HSV);

    enum_<VipsDemandStyle>("DemandStyle")
        .value("error", VIPS_DEMAND_STYLE_ERROR)
        .value("smalltile", VIPS_DEMAND_STYLE_SMALLTILE)
        .value("fatstrip", VIPS_DEMAND_STYLE_FATSTRIP)
        .value("thinstrip", VIPS_DEMAND_STYLE_THINSTRIP);

    enum_<VipsOperationRelational>("OperationRelational")
        .value("equal", VIPS_OPERATION_RELATIONAL_EQUAL)
        .value("noteq", VIPS_OPERATION_RELATIONAL_NOTEQ)
        .value("less", VIPS_OPERATION_RELATIONAL_LESS)
        .value("lesseq", VIPS_OPERATION_RELATIONAL_LESSEQ)
        .value("more", VIPS_OPERATION_RELATIONAL_MORE)
        .value("moreeq", VIPS_OPERATION_RELATIONAL_MOREEQ);

    enum_<VipsOperationBoolean>("OperationBoolean")
        .value("and", VIPS_OPERATION_BOOLEAN_AND)
        .value("or", VIPS_OPERATION_BOOLEAN_OR)
        .value("eor", VIPS_OPERATION_BOOLEAN_EOR)
        .value("lshift", VIPS_OPERATION_BOOLEAN_LSHIFT)
        .value("rshift", VIPS_OPERATION_BOOLEAN_RSHIFT);

    enum_<VipsOperationMath2>("OperationMath2")
        .value("pow", VIPS_OPERATION_MATH2_POW)
        .value("wop", VIPS_OPERATION_MATH2_WOP)
        .value("atan2", VIPS_OPERATION_MATH2_ATAN2);

    enum_<VipsOperationComplex2>("OperationComplex2")
        .value("cross_phase", VIPS_OPERATION_COMPLEX2_CROSS_PHASE);

    enum_<VipsOperationMath>("OperationMath")
        .value("sin", VIPS_OPERATION_MATH_SIN)
        .value("cos", VIPS_OPERATION_MATH_COS)
        .value("tan", VIPS_OPERATION_MATH_TAN)
        .value("asin", VIPS_OPERATION_MATH_ASIN)
        .value("acos", VIPS_OPERATION_MATH_ACOS)
        .value("atan", VIPS_OPERATION_MATH_ATAN)
        .value("log", VIPS_OPERATION_MATH_LOG)
        .value("log10", VIPS_OPERATION_MATH_LOG10)
        .value("exp", VIPS_OPERATION_MATH_EXP)
        .value("exp10", VIPS_OPERATION_MATH_EXP10)
        .value("sinh", VIPS_OPERATION_MATH_SINH)
        .value("cosh", VIPS_OPERATION_MATH_COSH)
        .value("tanh", VIPS_OPERATION_MATH_TANH)
        .value("asinh", VIPS_OPERATION_MATH_ASINH)
        .value("acosh", VIPS_OPERATION_MATH_ACOSH)
        .value("atanh", VIPS_OPERATION_MATH_ATANH);

    enum_<VipsOperationRound>("OperationRound")
        .value("rint", VIPS_OPERATION_ROUND_RINT)
        .value("ceil", VIPS_OPERATION_ROUND_CEIL)
        .value("floor", VIPS_OPERATION_ROUND_FLOOR);

    enum_<VipsOperationComplex>("OperationComplex")
        .value("polar", VIPS_OPERATION_COMPLEX_POLAR)
        .value("rect", VIPS_OPERATION_COMPLEX_RECT)
        .value("conj", VIPS_OPERATION_COMPLEX_CONJ);

    enum_<VipsOperationComplexget>("OperationComplexget")
        .value("real", VIPS_OPERATION_COMPLEXGET_REAL)
        .value("imag", VIPS_OPERATION_COMPLEXGET_IMAG);

    enum_<VipsCombine>("Combine")
        .value("max", VIPS_COMBINE_MAX)
        .value("sum", VIPS_COMBINE_SUM)
        .value("min", VIPS_COMBINE_MIN);

    enum_<VipsAccess>("Access")
        .value("random", VIPS_ACCESS_RANDOM)
        .value("sequential", VIPS_ACCESS_SEQUENTIAL)
        .value("sequential_unbuffered", VIPS_ACCESS_SEQUENTIAL_UNBUFFERED);

    enum_<VipsExtend>("Extend")
        .value("black", VIPS_EXTEND_BLACK)
        .value("copy", VIPS_EXTEND_COPY)
        .value("repeat", VIPS_EXTEND_REPEAT)
        .value("mirror", VIPS_EXTEND_MIRROR)
        .value("white", VIPS_EXTEND_WHITE)
        .value("background", VIPS_EXTEND_BACKGROUND);

    enum_<VipsCompassDirection>("CompassDirection")
        .value("centre", VIPS_COMPASS_DIRECTION_CENTRE)
        .value("north", VIPS_COMPASS_DIRECTION_NORTH)
        .value("east", VIPS_COMPASS_DIRECTION_EAST)
        .value("south", VIPS_COMPASS_DIRECTION_SOUTH)
        .value("west", VIPS_COMPASS_DIRECTION_WEST)
        .value("north_east", VIPS_COMPASS_DIRECTION_NORTH_EAST)
        .value("south_east", VIPS_COMPASS_DIRECTION_SOUTH_EAST)
        .value("south_west", VIPS_COMPASS_DIRECTION_SOUTH_WEST)
        .value("north_west", VIPS_COMPASS_DIRECTION_NORTH_WEST);

    enum_<VipsDirection>("Direction")
        .value("horizontal", VIPS_DIRECTION_HORIZONTAL)
        .value("vertical", VIPS_DIRECTION_VERTICAL);

    enum_<VipsAlign>("Align")
        .value("low", VIPS_ALIGN_LOW)
        .value("centre", VIPS_ALIGN_CENTRE)
        .value("high", VIPS_ALIGN_HIGH);

    enum_<VipsInteresting>("Interesting")
        .value("none", VIPS_INTERESTING_NONE)
        .value("centre", VIPS_INTERESTING_CENTRE)
        .value("entropy", VIPS_INTERESTING_ENTROPY)
        .value("attention", VIPS_INTERESTING_ATTENTION)
        .value("low", VIPS_INTERESTING_LOW)
        .value("high", VIPS_INTERESTING_HIGH)
        .value("all", VIPS_INTERESTING_ALL);

    enum_<VipsAngle>("Angle")
        .value("d0", VIPS_ANGLE_D0)
        .value("d90", VIPS_ANGLE_D90)
        .value("d180", VIPS_ANGLE_D180)
        .value("d270", VIPS_ANGLE_D270);

    enum_<VipsAngle45>("Angle45")
        .value("d0", VIPS_ANGLE45_D0)
        .value("d45", VIPS_ANGLE45_D45)
        .value("d90", VIPS_ANGLE45_D90)
        .value("d135", VIPS_ANGLE45_D135)
        .value("d180", VIPS_ANGLE45_D180)
        .value("d225", VIPS_ANGLE45_D225)
        .value("d270", VIPS_ANGLE45_D270)
        .value("d315", VIPS_ANGLE45_D315);

    enum_<VipsPrecision>("Precision")
        .value("integer", VIPS_PRECISION_INTEGER)
        .value("float", VIPS_PRECISION_FLOAT)
        .value("approximate", VIPS_PRECISION_APPROXIMATE);

    enum_<VipsTextWrap>("TextWrap")
        .value("word", VIPS_TEXT_WRAP_WORD)
        .value("char", VIPS_TEXT_WRAP_CHAR)
        .value("word_char", VIPS_TEXT_WRAP_WORD_CHAR)
        .value("none", VIPS_TEXT_WRAP_NONE);

    enum_<VipsSdfShape>("SdfShape")
        .value("circle", VIPS_SDF_SHAPE_CIRCLE)
        .value("box", VIPS_SDF_SHAPE_BOX)
        .value("rounded_box", VIPS_SDF_SHAPE_ROUNDED_BOX)
        .value("line", VIPS_SDF_SHAPE_LINE);

    enum_<VipsFailOn>("FailOn")
        .value("none", VIPS_FAIL_ON_NONE)
        .value("truncated", VIPS_FAIL_ON_TRUNCATED)
        .value("error", VIPS_FAIL_ON_ERROR)
        .value("warning", VIPS_FAIL_ON_WARNING);

    enum_<VipsForeignPpmFormat>("ForeignPpmFormat")
        .value("pbm", VIPS_FOREIGN_PPM_FORMAT_PBM)
        .value("pgm", VIPS_FOREIGN_PPM_FORMAT_PGM)
        .value("ppm", VIPS_FOREIGN_PPM_FORMAT_PPM)
        .value("pfm", VIPS_FOREIGN_PPM_FORMAT_PFM)
        .value("pnm", VIPS_FOREIGN_PPM_FORMAT_PNM);

    enum_<VipsForeignSubsample>("ForeignSubsample")
        .value("auto", VIPS_FOREIGN_SUBSAMPLE_AUTO)
        .value("on", VIPS_FOREIGN_SUBSAMPLE_ON)
        .value("off", VIPS_FOREIGN_SUBSAMPLE_OFF);

    enum_<VipsForeignDzLayout>("ForeignDzLayout")
        .value("dz", VIPS_FOREIGN_DZ_LAYOUT_DZ)
        .value("zoomify", VIPS_FOREIGN_DZ_LAYOUT_ZOOMIFY)
        .value("google", VIPS_FOREIGN_DZ_LAYOUT_GOOGLE)
        .value("iiif", VIPS_FOREIGN_DZ_LAYOUT_IIIF)
        .value("iiif3", VIPS_FOREIGN_DZ_LAYOUT_IIIF3);

    enum_<VipsForeignDzDepth>("ForeignDzDepth")
        .value("onepixel", VIPS_FOREIGN_DZ_DEPTH_ONEPIXEL)
        .value("onetile", VIPS_FOREIGN_DZ_DEPTH_ONETILE)
        .value("one", VIPS_FOREIGN_DZ_DEPTH_ONE);

    enum_<VipsForeignDzContainer>("ForeignDzContainer")
        .value("fs", VIPS_FOREIGN_DZ_CONTAINER_FS)
        .value("zip", VIPS_FOREIGN_DZ_CONTAINER_ZIP)
        .value("szi", VIPS_FOREIGN_DZ_CONTAINER_SZI);

    enum_<VipsRegionShrink>("RegionShrink")
        .value("mean", VIPS_REGION_SHRINK_MEAN)
        .value("median", VIPS_REGION_SHRINK_MEDIAN)
        .value("mode", VIPS_REGION_SHRINK_MODE)
        .value("max", VIPS_REGION_SHRINK_MAX)
        .value("min", VIPS_REGION_SHRINK_MIN)
        .value("nearest", VIPS_REGION_SHRINK_NEAREST);

    enum_<VipsForeignWebpPreset>("ForeignWebpPreset")
        .value("default", VIPS_FOREIGN_WEBP_PRESET_DEFAULT)
        .value("picture", VIPS_FOREIGN_WEBP_PRESET_PICTURE)
        .value("photo", VIPS_FOREIGN_WEBP_PRESET_PHOTO)
        .value("drawing", VIPS_FOREIGN_WEBP_PRESET_DRAWING)
        .value("icon", VIPS_FOREIGN_WEBP_PRESET_ICON)
        .value("text", VIPS_FOREIGN_WEBP_PRESET_TEXT);

    enum_<VipsForeignTiffCompression>("ForeignTiffCompression")
        .value("none", VIPS_FOREIGN_TIFF_COMPRESSION_NONE)
        .value("jpeg", VIPS_FOREIGN_TIFF_COMPRESSION_JPEG)
        .value("deflate", VIPS_FOREIGN_TIFF_COMPRESSION_DEFLATE)
        .value("packbits", VIPS_FOREIGN_TIFF_COMPRESSION_PACKBITS)
        .value("ccittfax4", VIPS_FOREIGN_TIFF_COMPRESSION_CCITTFAX4)
        .value("lzw", VIPS_FOREIGN_TIFF_COMPRESSION_LZW)
        .value("webp", VIPS_FOREIGN_TIFF_COMPRESSION_WEBP)
        .value("zstd", VIPS_FOREIGN_TIFF_COMPRESSION_ZSTD)
        .value("jp2k", VIPS_FOREIGN_TIFF_COMPRESSION_JP2K);

    enum_<VipsForeignTiffPredictor>("ForeignTiffPredictor")
        .value("none", VIPS_FOREIGN_TIFF_PREDICTOR_NONE)
        .value("horizontal", VIPS_FOREIGN_TIFF_PREDICTOR_HORIZONTAL)
        .value("float", VIPS_FOREIGN_TIFF_PREDICTOR_FLOAT);

    enum_<VipsForeignTiffResunit>("ForeignTiffResunit")
        .value("cm", VIPS_FOREIGN_TIFF_RESUNIT_CM)
        .value("inch", VIPS_FOREIGN_TIFF_RESUNIT_INCH);

    enum_<VipsForeignHeifCompression>("ForeignHeifCompression")
        .value("hevc", VIPS_FOREIGN_HEIF_COMPRESSION_HEVC)
        .value("avc", VIPS_FOREIGN_HEIF_COMPRESSION_AVC)
        .value("jpeg", VIPS_FOREIGN_HEIF_COMPRESSION_JPEG)
        .value("av1", VIPS_FOREIGN_HEIF_COMPRESSION_AV1);

    enum_<VipsForeignHeifEncoder>("ForeignHeifEncoder")
        .value("auto", VIPS_FOREIGN_HEIF_ENCODER_AUTO)
        .value("aom", VIPS_FOREIGN_HEIF_ENCODER_AOM)
        .value("rav1e", VIPS_FOREIGN_HEIF_ENCODER_RAV1E)
        .value("svt", VIPS_FOREIGN_HEIF_ENCODER_SVT)
        .value("x265", VIPS_FOREIGN_HEIF_ENCODER_X265);

    enum_<VipsSize>("Size")
        .value("both", VIPS_SIZE_BOTH)
        .value("up", VIPS_SIZE_UP)
        .value("down", VIPS_SIZE_DOWN)
        .value("force", VIPS_SIZE_FORCE);

    enum_<VipsIntent>("Intent")
        .value("perceptual", VIPS_INTENT_PERCEPTUAL)
        .value("relative", VIPS_INTENT_RELATIVE)
        .value("saturation", VIPS_INTENT_SATURATION)
        .value("absolute", VIPS_INTENT_ABSOLUTE);

    enum_<VipsKernel>("Kernel")
        .value("nearest", VIPS_KERNEL_NEAREST)
        .value("linear", VIPS_KERNEL_LINEAR)
        .value("cubic", VIPS_KERNEL_CUBIC)
        .value("mitchell", VIPS_KERNEL_MITCHELL)
        .value("lanczos2", VIPS_KERNEL_LANCZOS2)
        .value("lanczos3", VIPS_KERNEL_LANCZOS3);

    enum_<VipsPCS>("PCS")
        .value("lab", VIPS_PCS_LAB)
        .value("xyz", VIPS_PCS_XYZ);

    enum_<VipsOperationMorphology>("OperationMorphology")
        .value("erode", VIPS_OPERATION_MORPHOLOGY_ERODE)
        .value("dilate", VIPS_OPERATION_MORPHOLOGY_DILATE);

    enum_<VipsCombineMode>("CombineMode")
        .value("set", VIPS_COMBINE_MODE_SET)
        .value("add", VIPS_COMBINE_MODE_ADD);

    enum_<VipsForeignKeep>("ForeignKeep")
        .value("none", VIPS_FOREIGN_KEEP_NONE)
        .value("exif", VIPS_FOREIGN_KEEP_EXIF)
        .value("xmp", VIPS_FOREIGN_KEEP_XMP)
        .value("iptc", VIPS_FOREIGN_KEEP_IPTC)
        .value("icc", VIPS_FOREIGN_KEEP_ICC)
        .value("other", VIPS_FOREIGN_KEEP_OTHER)
        .value("all", VIPS_FOREIGN_KEEP_ALL);

    enum_<VipsForeignPngFilter>("ForeignPngFilter")
        .value("none", VIPS_FOREIGN_PNG_FILTER_NONE)
        .value("sub", VIPS_FOREIGN_PNG_FILTER_SUB)
        .value("up", VIPS_FOREIGN_PNG_FILTER_UP)
        .value("avg", VIPS_FOREIGN_PNG_FILTER_AVG)
        .value("paeth", VIPS_FOREIGN_PNG_FILTER_PAETH)
        .value("all", VIPS_FOREIGN_PNG_FILTER_ALL);

    // Handwritten value objects
    value_object<TrimResult>("trimResult")
        .field("left", &TrimResult::left)
        .field("top", &TrimResult::top)
        .field("width", &TrimResult::width)
        .field("height", &TrimResult::height);

    value_object<ColumnsRowsResult>("columnsRowsResult")
        .field("columns", &ColumnsRowsResult::columns)
        .field("rows", &ColumnsRowsResult::rows);

    // Register non-arithmetic vector bindings
    register_vector<Image>("VectorImage");
    register_vector<std::string>("VectorString");

    // Register arithmetic vector bindings
    register_vector<int>("VectorInt");
    register_vector<double>("VectorDouble");

    function("concurrency", &vips_concurrency_set);
    function("concurrency", &vips_concurrency_get);
    function("version", &vips_version);
    function("version", optional_override([]() {
                 return std::string(VIPS_VERSION);
             }));
    function("emscriptenVersion", optional_override([]() {
                 std::string major = std::to_string(__EMSCRIPTEN_major__);
                 std::string minor = std::to_string(__EMSCRIPTEN_minor__);
                 std::string patch = std::to_string(__EMSCRIPTEN_tiny__);

                 return major + "." + minor + "." + patch;
             }));
    function("config", optional_override([]() {
                 return std::string(VIPS_CONFIG);
             }));
    function("blockUntrusted", optional_override([](bool state) {
                 vips_block_untrusted_set(state ? 1 : 0);
             }));
    function("operationBlock",
             optional_override([](const std::string &name, bool state) {
                 vips_operation_block_set(name.c_str(), state ? 1 : 0);
             }));

    // Helper to shutdown libvips
    function("shutdown", &vips_shutdown);

    // Cache class
    class_<Cache>("Cache")
        .constructor<>()
        .class_function("max", &vips_cache_set_max)
        .class_function("max", &vips_cache_get_max)
        .class_function("maxMem", &vips_cache_set_max_mem)
        .class_function("maxMem", &vips_cache_get_max_mem)
        .class_function("maxFiles", &vips_cache_set_max_files)
        .class_function("maxFiles", &vips_cache_get_max_files)
        .class_function("size", &vips_cache_get_size);

    // Stats class
    class_<Stats>("Stats")
        .constructor<>()
        .class_function("allocations", &vips_tracked_get_allocs)
        .class_function("mem", &vips_tracked_get_mem)
        .class_function("memHighwater", &vips_tracked_get_mem_highwater)
        .class_function("files", &vips_tracked_get_files);

    // Utils class
    class_<Utils>("Utils")
        .constructor<>()
        .class_function(
            "typeFind", optional_override([](const std::string &basename,
                                             const std::string &nickname) {
                return vips_type_find(basename.c_str(), nickname.c_str());
            }))
        .class_function("tempName",
                        optional_override([](const std::string &format) {
                            char *name = vips__temp_name(format.c_str());
                            std::string result(name);
                            g_free(name);
                            return result;
                        }));

    // Base class
    class_<Object>("Object");

    // Interpolate class
    class_<Interpolate, base<Object>>("Interpolate")
        .constructor<>()
        // Handwritten class functions
        .class_function("newFromName", &Interpolate::new_from_name);

    // Connection class
    class_<Connection, base<Object>>("Connection")
        .constructor<>()
        // Handwritten properties
        .property("filename", &Connection::filename)
        .property("nick", &Connection::nick);

    // Source class
    class_<Source, base<Connection>>("Source")
        .constructor<>()
        // Handwritten class functions
        .class_function("newFromFile", &Source::new_from_file)
        .class_function("newFromMemory", &Source::new_from_memory);

    // SourceCustom class
    class_<SourceCustom, base<Source>>("SourceCustom")
        .constructor<>()
        // Handwritten setters
        .property("onRead", &SourceCustom::stub_getter,
                  &SourceCustom::set_read_callback)
        .property("onSeek", &SourceCustom::stub_getter,
                  &SourceCustom::set_seek_callback);

    // Target class
    class_<Target, base<Connection>>("Target")
        .constructor<>()
        // Handwritten class functions
        .class_function("newToFile", &Target::new_to_file)
        .class_function("newToMemory", &Target::new_to_memory)
        // Handwritten functions
        .function("getBlob", &Target::get_blob);

    // TargetCustom class
    class_<TargetCustom, base<Target>>("TargetCustom")
        .constructor<>()
        // Handwritten setters
        .property("onWrite", &TargetCustom::stub_getter,
                  &TargetCustom::set_write_callback)
        .property("onRead", &TargetCustom::stub_getter,
                  &TargetCustom::set_read_callback)
        .property("onSeek", &TargetCustom::stub_getter,
                  &TargetCustom::set_seek_callback)
        .property("onEnd", &TargetCustom::stub_getter,
                  &TargetCustom::set_end_callback);

    // Image class
    class_<Image, base<Object>>("Image")
        .constructor<>()
        // Handwritten class functions
        .class_function("newMemory", &Image::new_memory)
        .class_function("newTempFile", &Image::new_temp_file)
        .class_function("newTempFile", optional_override([]() {
                            return Image::new_temp_file("%s.v");
                        }))
        .class_function("newFromFile", &Image::new_from_file)
        .class_function("newFromFile",
                        optional_override([](const std::string &name) {
                            return Image::new_from_file(name);
                        }))
        .class_function(
            "newFromMemory",
            select_overload<Image(const std::string &, int, int, int,
                                  emscripten::val)>(&Image::new_from_memory))
        .class_function(
            "newFromMemory",
            select_overload<Image(uintptr_t, size_t, int, int, int,
                                  emscripten::val)>(&Image::new_from_memory))
        .class_function("newFromBuffer", &Image::new_from_buffer)
        .class_function("newFromBuffer",
                        optional_override([](const std::string &buffer,
                                             const std::string &option_string) {
                            return Image::new_from_buffer(buffer,
                                                          option_string);
                        }))
        .class_function("newFromBuffer",
                        optional_override([](const std::string &buffer) {
                            return Image::new_from_buffer(buffer);
                        }))
        .class_function("newFromSource", &Image::new_from_source)
        .class_function("newFromSource",
                        optional_override([](const Source &source,
                                             const std::string &option_string) {
                            return Image::new_from_source(source,
                                                          option_string);
                        }))
        .class_function("newFromSource",
                        optional_override([](const Source &source) {
                            return Image::new_from_source(source);
                        }))
        .class_function("newMatrix",
                        select_overload<Image(int, int)>(&Image::new_matrix))
        .class_function("newMatrix",
                        select_overload<Image(int, int, emscripten::val)>(
                            &Image::new_matrix))
        .class_function("newFromArray", &Image::new_from_array)
        .class_function(
            "newFromArray",
            optional_override([](emscripten::val array, double scale) {
                return Image::new_from_array(array, scale);
            }))
        .class_function("newFromArray",
                        optional_override([](emscripten::val array) {
                            return Image::new_from_array(array);
                        }))
        .class_function(
            "composite",
            optional_override([](emscripten::val in, emscripten::val mode,
                                 emscripten::val js_options) {
                Image out;

                Image::call("composite", nullptr,
                            (new Option)
                                ->set("out", &out)
                                ->set("in", VIPS_TYPE_ARRAY_IMAGE, in)
                                ->set("mode", vips::blend_modes_to_int(mode)),
                            js_options);

                return out;
            }))
        .class_function(
            "composite",
            optional_override([](emscripten::val in, emscripten::val mode) {
                Image out;

                Image::call("composite", nullptr,
                            (new Option)
                                ->set("out", &out)
                                ->set("in", VIPS_TYPE_ARRAY_IMAGE, in)
                                ->set("mode", vips::blend_modes_to_int(mode)));

                return out;
            }))
        // Handwritten functions
        .function("isImage",
                  optional_override([](const Image &image) { return true; }))
        .function(
            "setInt",
            select_overload<void(const std::string &, int) const>(&Image::set))
        .function(
            "setArrayInt",
            select_overload<void(const std::string &, const std::vector<int> &)
                                const>(&Image::set))
        .function("setArrayDouble",
                  select_overload<void(const std::string &,
                                       const std::vector<double> &) const>(
                      &Image::set))
        .function("setDouble",
                  select_overload<void(const std::string &, double) const>(
                      &Image::set))
        .function("setString",
                  select_overload<void(const std::string &, const std::string &)
                                      const>(&Image::set))
        .function("setBlob",
                  select_overload<void(const std::string &, const std::string &)
                                      const>(&Image::set_blob))
        .function(
            "setBlob",
            select_overload<void(const std::string &, uintptr_t, size_t) const>(
                &Image::set_blob))
        .function("getTypeof", &Image::get_typeof)
        .function("getInt", &Image::get_int)
        .function("getArrayInt", &Image::get_array_int)
        .function("getArrayDouble", &Image::get_array_double)
        .function("getDouble", &Image::get_double)
        .function("getString", &Image::get_string)
        .function("getBlob", &Image::get_blob)
        .function("getFields", &Image::get_fields)
        .function("remove", &Image::remove)
        .function("hasAlpha", &Image::has_alpha)
        .function("setDeleteOnClose", &Image::set_delete_on_close)
        .function("newFromImage", &Image::new_from_image)
        .function("copyMemory", &Image::copy_memory)
        .function("write", &Image::write)
        .function("writeToFile", &Image::write_to_file)
        .function("writeToFile", optional_override([](const Image &image,
                                                      const std::string &name) {
                      return image.write_to_file(name);
                  }))
        .function("writeToBuffer", &Image::write_to_buffer)
        .function("writeToBuffer",
                  optional_override(
                      [](const Image &image, const std::string &suffix) {
                          return image.write_to_buffer(suffix);
                      }))
        .function("writeToTarget", &Image::write_to_target)
        .function("writeToTarget",
                  optional_override([](const Image &image, const Target &target,
                                       const std::string &suffix) {
                      return image.write_to_target(target, suffix);
                  }))
        .function("writeToMemory", &Image::write_to_memory)
        .function("findTrim", optional_override([](const Image &image,
                                                   emscripten::val js_options) {
                      int left, top, width, height;
                      left = image.find_trim(&top, &width, &height, js_options);

                      return TrimResult{left, top, width, height};
                  }))
        .function("findTrim", optional_override([](const Image &image) {
                      int left, top, width, height;
                      left = image.find_trim(&top, &width, &height);

                      return TrimResult{left, top, width, height};
                  }))
        .function("profile", optional_override([](const Image &image) {
                      Image columns, rows;
                      columns = image.profile(&rows);

                      return ColumnsRowsResult{columns, rows};
                  }))
        .function("project", optional_override([](const Image &image) {
                      Image columns, rows;
                      columns = image.project(&rows);

                      return ColumnsRowsResult{columns, rows};
                  }))
        .function("bandsplit", optional_override([](const Image &image) {
                      std::vector<Image> b(image.bands());

                      for (int i = 0; i < image.bands(); ++i)
                          b[i] = image.extract_band(i);

                      return b;
                  }))
        // bandjoin, bandrank and composite will appear as a class functions,
        // but using them as instance method is more convenient.
        .function("bandjoin",
                  optional_override([](const Image &image, emscripten::val in) {
                      std::vector<Image> v = image.imageize_vector(in);
                      v.insert(v.begin(), image);

                      Image out;

                      Image::call("bandjoin", nullptr,
                                  (new Option)->set("out", &out)->set("in", v));

                      return out;
                  }))
        .function("bandrank",
                  optional_override([](const Image &image, emscripten::val in,
                                       emscripten::val js_options) {
                      std::vector<Image> v = image.imageize_vector(in);
                      v.insert(v.begin(), image);

                      Image out;

                      Image::call("bandrank", nullptr,
                                  (new Option)->set("out", &out)->set("in", v),
                                  js_options);

                      return out;
                  }))
        .function("bandrank",
                  optional_override([](const Image &image, emscripten::val in) {
                      std::vector<Image> v = image.imageize_vector(in);
                      v.insert(v.begin(), image);

                      Image out;

                      Image::call("bandrank", nullptr,
                                  (new Option)->set("out", &out)->set("in", v));

                      return out;
                  }))
        .function("composite", &Image::composite)
        .function("composite",
                  optional_override([](const Image &image, emscripten::val in,
                                       emscripten::val mode) {
                      return image.composite(in, mode);
                  }))
        // extra useful utility functions.
        .function("minPos", optional_override([](const Image &image) {
                      std::vector<double> xy(2);

                      image.call("min", (new Option)
                                            ->set("in", image)
                                            ->set("x", &xy[0])
                                            ->set("y", &xy[1]));

                      return xy;
                  }))
        .function("maxPos", optional_override([](const Image &image) {
                      std::vector<double> xy(2);

                      image.call("max", (new Option)
                                            ->set("in", image)
                                            ->set("x", &xy[0])
                                            ->set("y", &xy[1]));

                      return xy;
                  }))
        .function("linear",
                  select_overload<Image(emscripten::val, emscripten::val,
                                        emscripten::val) const>(&Image::linear))
        .function("linear",
                  optional_override(
                      [](const Image &image, emscripten::val a,
                         emscripten::val b) { return image.linear(a, b); }))
        // enum functions
        .function("flip",
                  select_overload<Image(emscripten::val) const>(&Image::flip))
        .function("flip", optional_override([](const Image &image,
                                               emscripten::val direction) {
                      return image.flip(direction);
                  }))
        .function("flipHor", optional_override([](const Image &image) {
                      return image.flip(VIPS_DIRECTION_HORIZONTAL);
                  }))
        .function("flipVer", optional_override([](const Image &image) {
                      return image.flip(VIPS_DIRECTION_VERTICAL);
                  }))
        .function("rot",
                  select_overload<Image(emscripten::val) const>(&Image::rot))
        .function("rot90", optional_override([](const Image &image) {
                      return image.rot(VIPS_ANGLE_D90);
                  }))
        .function("rot180", optional_override([](const Image &image) {
                      return image.rot(VIPS_ANGLE_D180);
                  }))
        .function("rot270", optional_override([](const Image &image) {
                      return image.rot(VIPS_ANGLE_D270);
                  }))
        .function(
            "morph",
            select_overload<Image(emscripten::val, emscripten::val) const>(
                &Image::morph))
        .function("median", optional_override([](const Image &image) {
                      return image.rank(3, 3, (3 * 3) / 2);
                  }))
        .function("median", optional_override([](const Image &image, int size) {
                      return image.rank(size, size, (size * size) / size);
                  }))
        .function("round",
                  select_overload<Image(emscripten::val) const>(&Image::round))
        .function("floor", optional_override([](const Image &image) {
                      return image.round(VIPS_OPERATION_ROUND_FLOOR);
                  }))
        .function("ceil", optional_override([](const Image &image) {
                      return image.round(VIPS_OPERATION_ROUND_CEIL);
                  }))
        .function("rint", optional_override([](const Image &image) {
                      return image.round(VIPS_OPERATION_ROUND_RINT);
                  }))
        .function("bandbool", select_overload<Image(emscripten::val) const>(
                                  &Image::bandbool))
        .function("bandand", optional_override([](const Image &image) {
                      return image.bandbool(VIPS_OPERATION_BOOLEAN_AND);
                  }))
        .function("bandor", optional_override([](const Image &image) {
                      return image.bandbool(VIPS_OPERATION_BOOLEAN_OR);
                  }))
        .function("bandeor", optional_override([](const Image &image) {
                      return image.bandbool(VIPS_OPERATION_BOOLEAN_EOR);
                  }))
        .function("complexget", select_overload<Image(emscripten::val) const>(
                                    &Image::complexget))
        .function("real", optional_override([](const Image &image) {
                      return image.complexget(VIPS_OPERATION_COMPLEXGET_REAL);
                  }))
        .function("imag", optional_override([](const Image &image) {
                      return image.complexget(VIPS_OPERATION_COMPLEXGET_IMAG);
                  }))
        .function("complex", select_overload<Image(emscripten::val) const>(
                                 &Image::complex))
        .function("polar", optional_override([](const Image &image) {
                      // TODO(kleisauke): Port `_run_cmplx` from pyvips?
                      return image.complex(VIPS_OPERATION_COMPLEX_POLAR);
                  }))
        .function("rect", optional_override([](const Image &image) {
                      return image.complex(VIPS_OPERATION_COMPLEX_RECT);
                  }))
        .function("conj", optional_override([](const Image &image) {
                      return image.complex(VIPS_OPERATION_COMPLEX_CONJ);
                  }))
        .function("math",
                  select_overload<Image(emscripten::val) const>(&Image::math))
        .function("sin", optional_override([](const Image &image) {
                      return image.math(VIPS_OPERATION_MATH_SIN);
                  }))
        .function("cos", optional_override([](const Image &image) {
                      return image.math(VIPS_OPERATION_MATH_COS);
                  }))
        .function("tan", optional_override([](const Image &image) {
                      return image.math(VIPS_OPERATION_MATH_TAN);
                  }))
        .function("asin", optional_override([](const Image &image) {
                      return image.math(VIPS_OPERATION_MATH_ASIN);
                  }))
        .function("acos", optional_override([](const Image &image) {
                      return image.math(VIPS_OPERATION_MATH_ACOS);
                  }))
        .function("atan", optional_override([](const Image &image) {
                      return image.math(VIPS_OPERATION_MATH_ATAN);
                  }))
        .function("sinh", optional_override([](const Image &image) {
                      return image.math(VIPS_OPERATION_MATH_SINH);
                  }))
        .function("cosh", optional_override([](const Image &image) {
                      return image.math(VIPS_OPERATION_MATH_COSH);
                  }))
        .function("tanh", optional_override([](const Image &image) {
                      return image.math(VIPS_OPERATION_MATH_TANH);
                  }))
        .function("asinh", optional_override([](const Image &image) {
                      return image.math(VIPS_OPERATION_MATH_ASINH);
                  }))
        .function("acosh", optional_override([](const Image &image) {
                      return image.math(VIPS_OPERATION_MATH_ACOSH);
                  }))
        .function("atanh", optional_override([](const Image &image) {
                      return image.math(VIPS_OPERATION_MATH_ATANH);
                  }))
        .function("log", optional_override([](const Image &image) {
                      return image.math(VIPS_OPERATION_MATH_LOG);
                  }))
        .function("log10", optional_override([](const Image &image) {
                      return image.math(VIPS_OPERATION_MATH_LOG10);
                  }))
        .function("exp", optional_override([](const Image &image) {
                      return image.math(VIPS_OPERATION_MATH_EXP);
                  }))
        .function("exp10", optional_override([](const Image &image) {
                      return image.math(VIPS_OPERATION_MATH_EXP10);
                  }))
        // need to call different functions for constants and single images
        .function("erode", optional_override([](const Image &image,
                                                emscripten::val mask) {
                      return vips::is_image(mask)
                                 ? image.morph(mask.as<Image>(),
                                               VIPS_OPERATION_MORPHOLOGY_ERODE)
                                 : image.morph_const(
                                       VIPS_OPERATION_MORPHOLOGY_ERODE, mask);
                  }))
        .function("dilate", optional_override([](const Image &image,
                                                 emscripten::val mask) {
                      return vips::is_image(mask)
                                 ? image.morph(mask.as<Image>(),
                                               VIPS_OPERATION_MORPHOLOGY_DILATE)
                                 : image.morph_const(
                                       VIPS_OPERATION_MORPHOLOGY_DILATE, mask);
                  }))
        .function(
            "pow", optional_override([](const Image &a, emscripten::val b) {
                return vips::is_image(b)
                           ? a.math2(b.as<Image>(), VIPS_OPERATION_MATH2_POW)
                           : a.math2_const(VIPS_OPERATION_MATH2_POW,
                                           vips::to_vector<double>(b));
            }))
        .function(
            "wop", optional_override([](const Image &a, emscripten::val b) {
                return vips::is_image(b)
                           ? a.math2(b.as<Image>(), VIPS_OPERATION_MATH2_WOP)
                           : a.math2_const(VIPS_OPERATION_MATH2_WOP,
                                           vips::to_vector<double>(b));
            }))
        .function(
            "atan2", optional_override([](const Image &a, emscripten::val b) {
                return vips::is_image(b)
                           ? a.math2(b.as<Image>(), VIPS_OPERATION_MATH2_ATAN2)
                           : a.math2_const(VIPS_OPERATION_MATH2_ATAN2,
                                           vips::to_vector<double>(b));
            }))
        .function("add",
                  optional_override([](const Image &a, emscripten::val b) {
                      return vips::is_image(b)
                                 ? a.add(b.as<Image>())
                                 : a.linear(1.0, vips::to_vector<double>(b));
                  }))
        .function(
            "subtract",
            optional_override([](const Image &a, emscripten::val b) {
                return vips::is_image(b)
                           ? a.subtract(b.as<Image>())
                           : a.linear(1.0,
                                      vips::negate(vips::to_vector<double>(b)));
            }))
        .function("multiply",
                  optional_override([](const Image &a, emscripten::val b) {
                      return vips::is_image(b)
                                 ? a.multiply(b.as<Image>())
                                 : a.linear(vips::to_vector<double>(b), 0.0);
                  }))
        .function(
            "divide", optional_override([](const Image &a, emscripten::val b) {
                return vips::is_image(b)
                           ? a.divide(b.as<Image>())
                           : a.linear(vips::invert(vips::to_vector<double>(b)),
                                      0.0);
            }))
        .function("remainder",
                  optional_override([](const Image &a, emscripten::val b) {
                      return vips::is_image(b)
                                 ? a.remainder(b.as<Image>())
                                 : a.remainder_const(
                                       vips::to_vector<double>(b));
                  }))
        .function(
            "lshift", optional_override([](const Image &a, emscripten::val b) {
                return vips::is_image(b)
                           ? a.boolean(b.as<Image>(),
                                       VIPS_OPERATION_BOOLEAN_LSHIFT)
                           : a.boolean_const(VIPS_OPERATION_BOOLEAN_LSHIFT,
                                             vips::to_vector<double>(b));
            }))
        .function(
            "rshift", optional_override([](const Image &a, emscripten::val b) {
                return vips::is_image(b)
                           ? a.boolean(b.as<Image>(),
                                       VIPS_OPERATION_BOOLEAN_RSHIFT)
                           : a.boolean_const(VIPS_OPERATION_BOOLEAN_RSHIFT,
                                             vips::to_vector<double>(b));
            }))
        .function("and",
                  optional_override([](const Image &a, emscripten::val b) {
                      return vips::is_image(b)
                                 ? a.boolean(b.as<Image>(),
                                             VIPS_OPERATION_BOOLEAN_AND)
                                 : a.boolean_const(VIPS_OPERATION_BOOLEAN_AND,
                                                   vips::to_vector<double>(b));
                  }))
        .function("or",
                  optional_override([](const Image &a, emscripten::val b) {
                      return vips::is_image(b)
                                 ? a.boolean(b.as<Image>(),
                                             VIPS_OPERATION_BOOLEAN_OR)
                                 : a.boolean_const(VIPS_OPERATION_BOOLEAN_OR,
                                                   vips::to_vector<double>(b));
                  }))
        .function("eor",
                  optional_override([](const Image &a, emscripten::val b) {
                      return vips::is_image(b)
                                 ? a.boolean(b.as<Image>(),
                                             VIPS_OPERATION_BOOLEAN_EOR)
                                 : a.boolean_const(VIPS_OPERATION_BOOLEAN_EOR,
                                                   vips::to_vector<double>(b));
                  }))
        .function(
            "more", optional_override([](const Image &a, emscripten::val b) {
                return vips::is_image(b)
                           ? a.relational(b.as<Image>(),
                                          VIPS_OPERATION_RELATIONAL_MORE)
                           : a.relational_const(VIPS_OPERATION_RELATIONAL_MORE,
                                                vips::to_vector<double>(b));
            }))
        .function(
            "moreEq", optional_override([](const Image &a, emscripten::val b) {
                return vips::is_image(b)
                           ? a.relational(b.as<Image>(),
                                          VIPS_OPERATION_RELATIONAL_MOREEQ)
                           : a.relational_const(
                                 VIPS_OPERATION_RELATIONAL_MOREEQ,
                                 vips::to_vector<double>(b));
            }))
        .function(
            "less", optional_override([](const Image &a, emscripten::val b) {
                return vips::is_image(b)
                           ? a.relational(b.as<Image>(),
                                          VIPS_OPERATION_RELATIONAL_LESS)
                           : a.relational_const(VIPS_OPERATION_RELATIONAL_LESS,
                                                vips::to_vector<double>(b));
            }))
        .function(
            "lessEq", optional_override([](const Image &a, emscripten::val b) {
                return vips::is_image(b)
                           ? a.relational(b.as<Image>(),
                                          VIPS_OPERATION_RELATIONAL_LESSEQ)
                           : a.relational_const(
                                 VIPS_OPERATION_RELATIONAL_LESSEQ,
                                 vips::to_vector<double>(b));
            }))
        .function(
            "equal", optional_override([](const Image &a, emscripten::val b) {
                return vips::is_image(b)
                           ? a.relational(b.as<Image>(),
                                          VIPS_OPERATION_RELATIONAL_EQUAL)
                           : a.relational_const(VIPS_OPERATION_RELATIONAL_EQUAL,
                                                vips::to_vector<double>(b));
            }))
        .function(
            "notEq", optional_override([](const Image &a, emscripten::val b) {
                return vips::is_image(b)
                           ? a.relational(b.as<Image>(),
                                          VIPS_OPERATION_RELATIONAL_NOTEQ)
                           : a.relational_const(VIPS_OPERATION_RELATIONAL_NOTEQ,
                                                vips::to_vector<double>(b));
            }))
        // Auto-generated properties
        .property("width", &Image::width)
        .property("height", &Image::height)
        .property("bands", &Image::bands)
        .property("format", &Image::format)
        .property("coding", &Image::coding)
        .property("interpretation", &Image::interpretation)
        .property("xoffset", &Image::xoffset)
        .property("yoffset", &Image::yoffset)
        .property("xres", &Image::xres)
        .property("yres", &Image::yres)
        .property("filename", &Image::filename)
        // Handwritten properties
        .property("pageHeight", &Image::page_height)
        // Handwritten setters
        .property("kill", &Image::is_killed, &Image::set_kill)
        .property("onProgress", &Image::stub_getter,
                  &Image::set_progress_callback)
        // Auto-generated (class-)functions
        .class_function("analyzeload", &Image::analyzeload)
        .class_function("analyzeload", optional_override([](const std::string &filename) {
                            return Image::analyzeload(filename);
                        }))
        .class_function("arrayjoin", &Image::arrayjoin)
        .class_function("arrayjoin", optional_override([](emscripten::val in) {
                            return Image::arrayjoin(in);
                        }))
        .class_function("bandjoin", &Image::bandjoin)
        .class_function("bandrank", &Image::bandrank)
        .class_function("bandrank", optional_override([](emscripten::val in) {
                            return Image::bandrank(in);
                        }))
        .class_function("black", &Image::black)
        .class_function("black", optional_override([](int width, int height) {
                            return Image::black(width, height);
                        }))
        .class_function("csvload", &Image::csvload)
        .class_function("csvload", optional_override([](const std::string &filename) {
                            return Image::csvload(filename);
                        }))
        .class_function("csvloadSource", &Image::csvload_source)
        .class_function("csvloadSource", optional_override([](const Source &source) {
                            return Image::csvload_source(source);
                        }))
        .class_function("eye", &Image::eye)
        .class_function("eye", optional_override([](int width, int height) {
                            return Image::eye(width, height);
                        }))
        .class_function("fitsload", &Image::fitsload)
        .class_function("fitsload", optional_override([](const std::string &filename) {
                            return Image::fitsload(filename);
                        }))
        .class_function("fitsloadSource", &Image::fitsload_source)
        .class_function("fitsloadSource", optional_override([](const Source &source) {
                            return Image::fitsload_source(source);
                        }))
        .class_function("fractsurf", &Image::fractsurf)
        .class_function("gaussmat", &Image::gaussmat)
        .class_function("gaussmat", optional_override([](double sigma, double min_ampl) {
                            return Image::gaussmat(sigma, min_ampl);
                        }))
        .class_function("gaussnoise", &Image::gaussnoise)
        .class_function("gaussnoise", optional_override([](int width, int height) {
                            return Image::gaussnoise(width, height);
                        }))
        .class_function("gifload", &Image::gifload)
        .class_function("gifload", optional_override([](const std::string &filename) {
                            return Image::gifload(filename);
                        }))
        .class_function("gifloadBuffer", &Image::gifload_buffer)
        .class_function("gifloadBuffer", optional_override([](const std::string &buffer) {
                            return Image::gifload_buffer(buffer);
                        }))
        .class_function("gifloadSource", &Image::gifload_source)
        .class_function("gifloadSource", optional_override([](const Source &source) {
                            return Image::gifload_source(source);
                        }))
        .class_function("grey", &Image::grey)
        .class_function("grey", optional_override([](int width, int height) {
                            return Image::grey(width, height);
                        }))
        .class_function("heifload", &Image::heifload)
        .class_function("heifload", optional_override([](const std::string &filename) {
                            return Image::heifload(filename);
                        }))
        .class_function("heifloadBuffer", &Image::heifload_buffer)
        .class_function("heifloadBuffer", optional_override([](const std::string &buffer) {
                            return Image::heifload_buffer(buffer);
                        }))
        .class_function("heifloadSource", &Image::heifload_source)
        .class_function("heifloadSource", optional_override([](const Source &source) {
                            return Image::heifload_source(source);
                        }))
        .class_function("identity", &Image::identity)
        .class_function("identity", optional_override([]() {
                            return Image::identity();
                        }))
        .class_function("jp2kload", &Image::jp2kload)
        .class_function("jp2kload", optional_override([](const std::string &filename) {
                            return Image::jp2kload(filename);
                        }))
        .class_function("jp2kloadBuffer", &Image::jp2kload_buffer)
        .class_function("jp2kloadBuffer", optional_override([](const std::string &buffer) {
                            return Image::jp2kload_buffer(buffer);
                        }))
        .class_function("jp2kloadSource", &Image::jp2kload_source)
        .class_function("jp2kloadSource", optional_override([](const Source &source) {
                            return Image::jp2kload_source(source);
                        }))
        .class_function("jpegload", &Image::jpegload)
        .class_function("jpegload", optional_override([](const std::string &filename) {
                            return Image::jpegload(filename);
                        }))
        .class_function("jpegloadBuffer", &Image::jpegload_buffer)
        .class_function("jpegloadBuffer", optional_override([](const std::string &buffer) {
                            return Image::jpegload_buffer(buffer);
                        }))
        .class_function("jpegloadSource", &Image::jpegload_source)
        .class_function("jpegloadSource", optional_override([](const Source &source) {
                            return Image::jpegload_source(source);
                        }))
        .class_function("jxlload", &Image::jxlload)
        .class_function("jxlload", optional_override([](const std::string &filename) {
                            return Image::jxlload(filename);
                        }))
        .class_function("jxlloadBuffer", &Image::jxlload_buffer)
        .class_function("jxlloadBuffer", optional_override([](const std::string &buffer) {
                            return Image::jxlload_buffer(buffer);
                        }))
        .class_function("jxlloadSource", &Image::jxlload_source)
        .class_function("jxlloadSource", optional_override([](const Source &source) {
                            return Image::jxlload_source(source);
                        }))
        .class_function("logmat", &Image::logmat)
        .class_function("logmat", optional_override([](double sigma, double min_ampl) {
                            return Image::logmat(sigma, min_ampl);
                        }))
        .class_function("magickload", &Image::magickload)
        .class_function("magickload", optional_override([](const std::string &filename) {
                            return Image::magickload(filename);
                        }))
        .class_function("magickloadBuffer", &Image::magickload_buffer)
        .class_function("magickloadBuffer", optional_override([](const std::string &buffer) {
                            return Image::magickload_buffer(buffer);
                        }))
        .class_function("maskButterworth", &Image::mask_butterworth)
        .class_function("maskButterworth", optional_override([](int width, int height, double order, double frequency_cutoff, double amplitude_cutoff) {
                            return Image::mask_butterworth(width, height, order, frequency_cutoff, amplitude_cutoff);
                        }))
        .class_function("maskButterworthBand", &Image::mask_butterworth_band)
        .class_function("maskButterworthBand", optional_override([](int width, int height, double order, double frequency_cutoff_x, double frequency_cutoff_y, double radius, double amplitude_cutoff) {
                            return Image::mask_butterworth_band(width, height, order, frequency_cutoff_x, frequency_cutoff_y, radius, amplitude_cutoff);
                        }))
        .class_function("maskButterworthRing", &Image::mask_butterworth_ring)
        .class_function("maskButterworthRing", optional_override([](int width, int height, double order, double frequency_cutoff, double amplitude_cutoff, double ringwidth) {
                            return Image::mask_butterworth_ring(width, height, order, frequency_cutoff, amplitude_cutoff, ringwidth);
                        }))
        .class_function("maskFractal", &Image::mask_fractal)
        .class_function("maskFractal", optional_override([](int width, int height, double fractal_dimension) {
                            return Image::mask_fractal(width, height, fractal_dimension);
                        }))
        .class_function("maskGaussian", &Image::mask_gaussian)
        .class_function("maskGaussian", optional_override([](int width, int height, double frequency_cutoff, double amplitude_cutoff) {
                            return Image::mask_gaussian(width, height, frequency_cutoff, amplitude_cutoff);
                        }))
        .class_function("maskGaussianBand", &Image::mask_gaussian_band)
        .class_function("maskGaussianBand", optional_override([](int width, int height, double frequency_cutoff_x, double frequency_cutoff_y, double radius, double amplitude_cutoff) {
                            return Image::mask_gaussian_band(width, height, frequency_cutoff_x, frequency_cutoff_y, radius, amplitude_cutoff);
                        }))
        .class_function("maskGaussianRing", &Image::mask_gaussian_ring)
        .class_function("maskGaussianRing", optional_override([](int width, int height, double frequency_cutoff, double amplitude_cutoff, double ringwidth) {
                            return Image::mask_gaussian_ring(width, height, frequency_cutoff, amplitude_cutoff, ringwidth);
                        }))
        .class_function("maskIdeal", &Image::mask_ideal)
        .class_function("maskIdeal", optional_override([](int width, int height, double frequency_cutoff) {
                            return Image::mask_ideal(width, height, frequency_cutoff);
                        }))
        .class_function("maskIdealBand", &Image::mask_ideal_band)
        .class_function("maskIdealBand", optional_override([](int width, int height, double frequency_cutoff_x, double frequency_cutoff_y, double radius) {
                            return Image::mask_ideal_band(width, height, frequency_cutoff_x, frequency_cutoff_y, radius);
                        }))
        .class_function("maskIdealRing", &Image::mask_ideal_ring)
        .class_function("maskIdealRing", optional_override([](int width, int height, double frequency_cutoff, double ringwidth) {
                            return Image::mask_ideal_ring(width, height, frequency_cutoff, ringwidth);
                        }))
        .class_function("matload", &Image::matload)
        .class_function("matload", optional_override([](const std::string &filename) {
                            return Image::matload(filename);
                        }))
        .class_function("matrixload", &Image::matrixload)
        .class_function("matrixload", optional_override([](const std::string &filename) {
                            return Image::matrixload(filename);
                        }))
        .class_function("matrixloadSource", &Image::matrixload_source)
        .class_function("matrixloadSource", optional_override([](const Source &source) {
                            return Image::matrixload_source(source);
                        }))
        .class_function("niftiload", &Image::niftiload)
        .class_function("niftiload", optional_override([](const std::string &filename) {
                            return Image::niftiload(filename);
                        }))
        .class_function("niftiloadSource", &Image::niftiload_source)
        .class_function("niftiloadSource", optional_override([](const Source &source) {
                            return Image::niftiload_source(source);
                        }))
        .class_function("openexrload", &Image::openexrload)
        .class_function("openexrload", optional_override([](const std::string &filename) {
                            return Image::openexrload(filename);
                        }))
        .class_function("openslideload", &Image::openslideload)
        .class_function("openslideload", optional_override([](const std::string &filename) {
                            return Image::openslideload(filename);
                        }))
        .class_function("openslideloadSource", &Image::openslideload_source)
        .class_function("openslideloadSource", optional_override([](const Source &source) {
                            return Image::openslideload_source(source);
                        }))
        .class_function("pdfload", &Image::pdfload)
        .class_function("pdfload", optional_override([](const std::string &filename) {
                            return Image::pdfload(filename);
                        }))
        .class_function("pdfloadBuffer", &Image::pdfload_buffer)
        .class_function("pdfloadBuffer", optional_override([](const std::string &buffer) {
                            return Image::pdfload_buffer(buffer);
                        }))
        .class_function("pdfloadSource", &Image::pdfload_source)
        .class_function("pdfloadSource", optional_override([](const Source &source) {
                            return Image::pdfload_source(source);
                        }))
        .class_function("perlin", &Image::perlin)
        .class_function("perlin", optional_override([](int width, int height) {
                            return Image::perlin(width, height);
                        }))
        .class_function("pngload", &Image::pngload)
        .class_function("pngload", optional_override([](const std::string &filename) {
                            return Image::pngload(filename);
                        }))
        .class_function("pngloadBuffer", &Image::pngload_buffer)
        .class_function("pngloadBuffer", optional_override([](const std::string &buffer) {
                            return Image::pngload_buffer(buffer);
                        }))
        .class_function("pngloadSource", &Image::pngload_source)
        .class_function("pngloadSource", optional_override([](const Source &source) {
                            return Image::pngload_source(source);
                        }))
        .class_function("ppmload", &Image::ppmload)
        .class_function("ppmload", optional_override([](const std::string &filename) {
                            return Image::ppmload(filename);
                        }))
        .class_function("ppmloadSource", &Image::ppmload_source)
        .class_function("ppmloadSource", optional_override([](const Source &source) {
                            return Image::ppmload_source(source);
                        }))
        .class_function("profileLoad", &Image::profile_load)
        .class_function("radload", &Image::radload)
        .class_function("radload", optional_override([](const std::string &filename) {
                            return Image::radload(filename);
                        }))
        .class_function("radloadBuffer", &Image::radload_buffer)
        .class_function("radloadBuffer", optional_override([](const std::string &buffer) {
                            return Image::radload_buffer(buffer);
                        }))
        .class_function("radloadSource", &Image::radload_source)
        .class_function("radloadSource", optional_override([](const Source &source) {
                            return Image::radload_source(source);
                        }))
        .class_function("rawload", &Image::rawload)
        .class_function("rawload", optional_override([](const std::string &filename, int width, int height, int bands) {
                            return Image::rawload(filename, width, height, bands);
                        }))
        .class_function("sdf", &Image::sdf)
        .class_function("sdf", optional_override([](int width, int height, emscripten::val shape) {
                            return Image::sdf(width, height, shape);
                        }))
        .class_function("sines", &Image::sines)
        .class_function("sines", optional_override([](int width, int height) {
                            return Image::sines(width, height);
                        }))
        .class_function("sum", &Image::sum)
        .class_function("svgload", &Image::svgload)
        .class_function("svgload", optional_override([](const std::string &filename) {
                            return Image::svgload(filename);
                        }))
        .class_function("svgloadBuffer", &Image::svgload_buffer)
        .class_function("svgloadBuffer", optional_override([](const std::string &buffer) {
                            return Image::svgload_buffer(buffer);
                        }))
        .class_function("svgloadSource", &Image::svgload_source)
        .class_function("svgloadSource", optional_override([](const Source &source) {
                            return Image::svgload_source(source);
                        }))
        .class_function("switch", &Image::switch_image)
        .class_function("system", &Image::system)
        .class_function("system", optional_override([](const std::string &cmd_format) {
                            Image::system(cmd_format);
                        }))
        .class_function("text", &Image::text)
        .class_function("text", optional_override([](const std::string &text) {
                            return Image::text(text);
                        }))
        .class_function("thumbnail", &Image::thumbnail)
        .class_function("thumbnail", optional_override([](const std::string &filename, int width) {
                            return Image::thumbnail(filename, width);
                        }))
        .class_function("thumbnailBuffer", &Image::thumbnail_buffer)
        .class_function("thumbnailBuffer", optional_override([](const std::string &buffer, int width) {
                            return Image::thumbnail_buffer(buffer, width);
                        }))
        .class_function("thumbnailSource", &Image::thumbnail_source)
        .class_function("thumbnailSource", optional_override([](const Source &source, int width) {
                            return Image::thumbnail_source(source, width);
                        }))
        .class_function("tiffload", &Image::tiffload)
        .class_function("tiffload", optional_override([](const std::string &filename) {
                            return Image::tiffload(filename);
                        }))
        .class_function("tiffloadBuffer", &Image::tiffload_buffer)
        .class_function("tiffloadBuffer", optional_override([](const std::string &buffer) {
                            return Image::tiffload_buffer(buffer);
                        }))
        .class_function("tiffloadSource", &Image::tiffload_source)
        .class_function("tiffloadSource", optional_override([](const Source &source) {
                            return Image::tiffload_source(source);
                        }))
        .class_function("tonelut", &Image::tonelut)
        .class_function("tonelut", optional_override([]() {
                            return Image::tonelut();
                        }))
        .class_function("vipsload", &Image::vipsload)
        .class_function("vipsload", optional_override([](const std::string &filename) {
                            return Image::vipsload(filename);
                        }))
        .class_function("vipsloadSource", &Image::vipsload_source)
        .class_function("vipsloadSource", optional_override([](const Source &source) {
                            return Image::vipsload_source(source);
                        }))
        .class_function("webpload", &Image::webpload)
        .class_function("webpload", optional_override([](const std::string &filename) {
                            return Image::webpload(filename);
                        }))
        .class_function("webploadBuffer", &Image::webpload_buffer)
        .class_function("webploadBuffer", optional_override([](const std::string &buffer) {
                            return Image::webpload_buffer(buffer);
                        }))
        .class_function("webploadSource", &Image::webpload_source)
        .class_function("webploadSource", optional_override([](const Source &source) {
                            return Image::webpload_source(source);
                        }))
        .class_function("worley", &Image::worley)
        .class_function("worley", optional_override([](int width, int height) {
                            return Image::worley(width, height);
                        }))
        .class_function("xyz", &Image::xyz)
        .class_function("xyz", optional_override([](int width, int height) {
                            return Image::xyz(width, height);
                        }))
        .class_function("zone", &Image::zone)
        .class_function("zone", optional_override([](int width, int height) {
                            return Image::zone(width, height);
                        }))
        .function("CMC2LCh", &Image::CMC2LCh)
        .function("CMYK2XYZ", &Image::CMYK2XYZ)
        .function("HSV2sRGB", &Image::HSV2sRGB)
        .function("LCh2CMC", &Image::LCh2CMC)
        .function("LCh2Lab", &Image::LCh2Lab)
        .function("Lab2LCh", &Image::Lab2LCh)
        .function("Lab2LabQ", &Image::Lab2LabQ)
        .function("Lab2LabS", &Image::Lab2LabS)
        .function("Lab2XYZ", &Image::Lab2XYZ)
        .function("Lab2XYZ", optional_override([](const Image &image) {
                      return image.Lab2XYZ();
                  }))
        .function("LabQ2Lab", &Image::LabQ2Lab)
        .function("LabQ2LabS", &Image::LabQ2LabS)
        .function("LabQ2sRGB", &Image::LabQ2sRGB)
        .function("LabS2Lab", &Image::LabS2Lab)
        .function("LabS2LabQ", &Image::LabS2LabQ)
        .function("XYZ2CMYK", &Image::XYZ2CMYK)
        .function("XYZ2Lab", &Image::XYZ2Lab)
        .function("XYZ2Lab", optional_override([](const Image &image) {
                      return image.XYZ2Lab();
                  }))
        .function("XYZ2Yxy", &Image::XYZ2Yxy)
        .function("XYZ2scRGB", &Image::XYZ2scRGB)
        .function("Yxy2XYZ", &Image::Yxy2XYZ)
        .function("abs", &Image::abs)
        .function("addalpha", &Image::addalpha)
        .function("affine", &Image::affine)
        .function("affine", optional_override([](const Image &image, const std::vector<double> &matrix) {
                      return image.affine(matrix);
                  }))
        .function("autorot", &Image::autorot)
        .function("autorot", optional_override([](const Image &image) {
                      return image.autorot();
                  }))
        .function("avg", &Image::avg)
        .function("bandfold", &Image::bandfold)
        .function("bandfold", optional_override([](const Image &image) {
                      return image.bandfold();
                  }))
        .function("bandmean", &Image::bandmean)
        .function("bandunfold", &Image::bandunfold)
        .function("bandunfold", optional_override([](const Image &image) {
                      return image.bandunfold();
                  }))
        .function("buildlut", &Image::buildlut)
        .function("byteswap", &Image::byteswap)
        .function("canny", &Image::canny)
        .function("canny", optional_override([](const Image &image) {
                      return image.canny();
                  }))
        .function("case", &Image::case_image)
        .function("cast", &Image::cast)
        .function("cast", optional_override([](const Image &image, emscripten::val format) {
                      return image.cast(format);
                  }))
        .function("clamp", &Image::clamp)
        .function("clamp", optional_override([](const Image &image) {
                      return image.clamp();
                  }))
        .function("colourspace", &Image::colourspace)
        .function("colourspace", optional_override([](const Image &image, emscripten::val space) {
                      return image.colourspace(space);
                  }))
        .function("compass", &Image::compass)
        .function("compass", optional_override([](const Image &image, emscripten::val mask) {
                      return image.compass(mask);
                  }))
        .function("complex2", &Image::complex2)
        .function("complexform", &Image::complexform)
        .function("composite2", &Image::composite2)
        .function("composite2", optional_override([](const Image &image, emscripten::val overlay, emscripten::val mode) {
                      return image.composite2(overlay, mode);
                  }))
        .function("conv", &Image::conv)
        .function("conv", optional_override([](const Image &image, emscripten::val mask) {
                      return image.conv(mask);
                  }))
        .function("conva", &Image::conva)
        .function("conva", optional_override([](const Image &image, emscripten::val mask) {
                      return image.conva(mask);
                  }))
        .function("convasep", &Image::convasep)
        .function("convasep", optional_override([](const Image &image, emscripten::val mask) {
                      return image.convasep(mask);
                  }))
        .function("convf", &Image::convf)
        .function("convi", &Image::convi)
        .function("convsep", &Image::convsep)
        .function("convsep", optional_override([](const Image &image, emscripten::val mask) {
                      return image.convsep(mask);
                  }))
        .function("copy", &Image::copy)
        .function("copy", optional_override([](const Image &image) {
                      return image.copy();
                  }))
        .function("countlines", &Image::countlines)
        .function("crop", &Image::crop)
        .function("csvsave", &Image::csvsave)
        .function("csvsave", optional_override([](const Image &image, const std::string &filename) {
                      image.csvsave(filename);
                  }))
        .function("csvsaveTarget", &Image::csvsave_target)
        .function("csvsaveTarget", optional_override([](const Image &image, const Target &target) {
                      image.csvsave_target(target);
                  }))
        .function("dE00", &Image::dE00)
        .function("dE76", &Image::dE76)
        .function("dECMC", &Image::dECMC)
        .function("deviate", &Image::deviate)
        .function("drawCircle", &Image::draw_circle)
        .function("drawCircle", optional_override([](const Image &image, const std::vector<double> &ink, int cx, int cy, int radius) {
                      image.draw_circle(ink, cx, cy, radius);
                  }))
        .function("drawFlood", &Image::draw_flood)
        .function("drawFlood", optional_override([](const Image &image, const std::vector<double> &ink, int x, int y) {
                      image.draw_flood(ink, x, y);
                  }))
        .function("drawImage", &Image::draw_image)
        .function("drawImage", optional_override([](const Image &image, emscripten::val sub, int x, int y) {
                      image.draw_image(sub, x, y);
                  }))
        .function("drawLine", &Image::draw_line)
        .function("drawMask", &Image::draw_mask)
        .function("drawRect", &Image::draw_rect)
        .function("drawRect", optional_override([](const Image &image, const std::vector<double> &ink, int left, int top, int width, int height) {
                      image.draw_rect(ink, left, top, width, height);
                  }))
        .function("drawSmudge", &Image::draw_smudge)
        .function("dzsave", &Image::dzsave)
        .function("dzsave", optional_override([](const Image &image, const std::string &filename) {
                      image.dzsave(filename);
                  }))
        .function("dzsaveBuffer", &Image::dzsave_buffer)
        .function("dzsaveBuffer", optional_override([](const Image &image) {
                      return image.dzsave_buffer();
                  }))
        .function("dzsaveTarget", &Image::dzsave_target)
        .function("dzsaveTarget", optional_override([](const Image &image, const Target &target) {
                      image.dzsave_target(target);
                  }))
        .function("embed", &Image::embed)
        .function("embed", optional_override([](const Image &image, int x, int y, int width, int height) {
                      return image.embed(x, y, width, height);
                  }))
        .function("extractArea", &Image::extract_area)
        .function("extractBand", &Image::extract_band)
        .function("extractBand", optional_override([](const Image &image, int band) {
                      return image.extract_band(band);
                  }))
        .function("falsecolour", &Image::falsecolour)
        .function("fastcor", &Image::fastcor)
        .function("fillNearest", &Image::fill_nearest)
        .function("fillNearest", optional_override([](const Image &image) {
                      return image.fill_nearest();
                  }))
        .function("fitssave", &Image::fitssave)
        .function("fitssave", optional_override([](const Image &image, const std::string &filename) {
                      image.fitssave(filename);
                  }))
        .function("flatten", &Image::flatten)
        .function("flatten", optional_override([](const Image &image) {
                      return image.flatten();
                  }))
        .function("float2rad", &Image::float2rad)
        .function("freqmult", &Image::freqmult)
        .function("fwfft", &Image::fwfft)
        .function("gamma", &Image::gamma)
        .function("gamma", optional_override([](const Image &image) {
                      return image.gamma();
                  }))
        .function("gaussblur", &Image::gaussblur)
        .function("gaussblur", optional_override([](const Image &image, double sigma) {
                      return image.gaussblur(sigma);
                  }))
        .function("getpoint", &Image::getpoint)
        .function("getpoint", optional_override([](const Image &image, int x, int y) {
                      return image.getpoint(x, y);
                  }))
        .function("gifsave", &Image::gifsave)
        .function("gifsave", optional_override([](const Image &image, const std::string &filename) {
                      image.gifsave(filename);
                  }))
        .function("gifsaveBuffer", &Image::gifsave_buffer)
        .function("gifsaveBuffer", optional_override([](const Image &image) {
                      return image.gifsave_buffer();
                  }))
        .function("gifsaveTarget", &Image::gifsave_target)
        .function("gifsaveTarget", optional_override([](const Image &image, const Target &target) {
                      image.gifsave_target(target);
                  }))
        .function("globalbalance", &Image::globalbalance)
        .function("globalbalance", optional_override([](const Image &image) {
                      return image.globalbalance();
                  }))
        .function("gravity", &Image::gravity)
        .function("gravity", optional_override([](const Image &image, emscripten::val direction, int width, int height) {
                      return image.gravity(direction, width, height);
                  }))
        .function("grid", &Image::grid)
        .function("heifsave", &Image::heifsave)
        .function("heifsave", optional_override([](const Image &image, const std::string &filename) {
                      image.heifsave(filename);
                  }))
        .function("heifsaveBuffer", &Image::heifsave_buffer)
        .function("heifsaveBuffer", optional_override([](const Image &image) {
                      return image.heifsave_buffer();
                  }))
        .function("heifsaveTarget", &Image::heifsave_target)
        .function("heifsaveTarget", optional_override([](const Image &image, const Target &target) {
                      image.heifsave_target(target);
                  }))
        .function("histCum", &Image::hist_cum)
        .function("histEntropy", &Image::hist_entropy)
        .function("histEqual", &Image::hist_equal)
        .function("histEqual", optional_override([](const Image &image) {
                      return image.hist_equal();
                  }))
        .function("histFind", &Image::hist_find)
        .function("histFind", optional_override([](const Image &image) {
                      return image.hist_find();
                  }))
        .function("histFindIndexed", &Image::hist_find_indexed)
        .function("histFindIndexed", optional_override([](const Image &image, emscripten::val index) {
                      return image.hist_find_indexed(index);
                  }))
        .function("histFindNdim", &Image::hist_find_ndim)
        .function("histFindNdim", optional_override([](const Image &image) {
                      return image.hist_find_ndim();
                  }))
        .function("histIsmonotonic", &Image::hist_ismonotonic)
        .function("histLocal", &Image::hist_local)
        .function("histLocal", optional_override([](const Image &image, int width, int height) {
                      return image.hist_local(width, height);
                  }))
        .function("histMatch", &Image::hist_match)
        .function("histNorm", &Image::hist_norm)
        .function("histPlot", &Image::hist_plot)
        .function("houghCircle", &Image::hough_circle)
        .function("houghCircle", optional_override([](const Image &image) {
                      return image.hough_circle();
                  }))
        .function("houghLine", &Image::hough_line)
        .function("houghLine", optional_override([](const Image &image) {
                      return image.hough_line();
                  }))
        .function("iccExport", &Image::icc_export)
        .function("iccExport", optional_override([](const Image &image) {
                      return image.icc_export();
                  }))
        .function("iccImport", &Image::icc_import)
        .function("iccImport", optional_override([](const Image &image) {
                      return image.icc_import();
                  }))
        .function("iccTransform", &Image::icc_transform)
        .function("iccTransform", optional_override([](const Image &image, const std::string &output_profile) {
                      return image.icc_transform(output_profile);
                  }))
        .function("ifthenelse", &Image::ifthenelse)
        .function("ifthenelse", optional_override([](const Image &image, emscripten::val in1, emscripten::val in2) {
                      return image.ifthenelse(in1, in2);
                  }))
        .function("insert", &Image::insert)
        .function("insert", optional_override([](const Image &image, emscripten::val sub, int x, int y) {
                      return image.insert(sub, x, y);
                  }))
        .function("invert", &Image::invert)
        .function("invertlut", &Image::invertlut)
        .function("invertlut", optional_override([](const Image &image) {
                      return image.invertlut();
                  }))
        .function("invfft", &Image::invfft)
        .function("invfft", optional_override([](const Image &image) {
                      return image.invfft();
                  }))
        .function("join", &Image::join)
        .function("join", optional_override([](const Image &image, emscripten::val in2, emscripten::val direction) {
                      return image.join(in2, direction);
                  }))
        .function("jp2ksave", &Image::jp2ksave)
        .function("jp2ksave", optional_override([](const Image &image, const std::string &filename) {
                      image.jp2ksave(filename);
                  }))
        .function("jp2ksaveBuffer", &Image::jp2ksave_buffer)
        .function("jp2ksaveBuffer", optional_override([](const Image &image) {
                      return image.jp2ksave_buffer();
                  }))
        .function("jp2ksaveTarget", &Image::jp2ksave_target)
        .function("jp2ksaveTarget", optional_override([](const Image &image, const Target &target) {
                      image.jp2ksave_target(target);
                  }))
        .function("jpegsave", &Image::jpegsave)
        .function("jpegsave", optional_override([](const Image &image, const std::string &filename) {
                      image.jpegsave(filename);
                  }))
        .function("jpegsaveBuffer", &Image::jpegsave_buffer)
        .function("jpegsaveBuffer", optional_override([](const Image &image) {
                      return image.jpegsave_buffer();
                  }))
        .function("jpegsaveMime", &Image::jpegsave_mime)
        .function("jpegsaveMime", optional_override([](const Image &image) {
                      image.jpegsave_mime();
                  }))
        .function("jpegsaveTarget", &Image::jpegsave_target)
        .function("jpegsaveTarget", optional_override([](const Image &image, const Target &target) {
                      image.jpegsave_target(target);
                  }))
        .function("jxlsave", &Image::jxlsave)
        .function("jxlsave", optional_override([](const Image &image, const std::string &filename) {
                      image.jxlsave(filename);
                  }))
        .function("jxlsaveBuffer", &Image::jxlsave_buffer)
        .function("jxlsaveBuffer", optional_override([](const Image &image) {
                      return image.jxlsave_buffer();
                  }))
        .function("jxlsaveTarget", &Image::jxlsave_target)
        .function("jxlsaveTarget", optional_override([](const Image &image, const Target &target) {
                      image.jxlsave_target(target);
                  }))
        .function("labelregions", &Image::labelregions)
        .function("labelregions", optional_override([](const Image &image) {
                      return image.labelregions();
                  }))
        .function("linecache", &Image::linecache)
        .function("linecache", optional_override([](const Image &image) {
                      return image.linecache();
                  }))
        .function("magicksave", &Image::magicksave)
        .function("magicksave", optional_override([](const Image &image, const std::string &filename) {
                      image.magicksave(filename);
                  }))
        .function("magicksaveBuffer", &Image::magicksave_buffer)
        .function("magicksaveBuffer", optional_override([](const Image &image) {
                      return image.magicksave_buffer();
                  }))
        .function("mapim", &Image::mapim)
        .function("mapim", optional_override([](const Image &image, emscripten::val index) {
                      return image.mapim(index);
                  }))
        .function("maplut", &Image::maplut)
        .function("maplut", optional_override([](const Image &image, emscripten::val lut) {
                      return image.maplut(lut);
                  }))
        .function("match", &Image::match)
        .function("match", optional_override([](const Image &image, emscripten::val sec, int xr1, int yr1, int xs1, int ys1, int xr2, int yr2, int xs2, int ys2) {
                      return image.match(sec, xr1, yr1, xs1, ys1, xr2, yr2, xs2, ys2);
                  }))
        .function("matrixinvert", &Image::matrixinvert)
        .function("matrixprint", &Image::matrixprint)
        .function("matrixprint", optional_override([](const Image &image) {
                      image.matrixprint();
                  }))
        .function("matrixsave", &Image::matrixsave)
        .function("matrixsave", optional_override([](const Image &image, const std::string &filename) {
                      image.matrixsave(filename);
                  }))
        .function("matrixsaveTarget", &Image::matrixsave_target)
        .function("matrixsaveTarget", optional_override([](const Image &image, const Target &target) {
                      image.matrixsave_target(target);
                  }))
        .function("max", &Image::max)
        .function("max", optional_override([](const Image &image) {
                      return image.max();
                  }))
        .function("maxpair", &Image::maxpair)
        .function("measure", &Image::measure)
        .function("measure", optional_override([](const Image &image, int h, int v) {
                      return image.measure(h, v);
                  }))
        .function("merge", &Image::merge)
        .function("merge", optional_override([](const Image &image, emscripten::val sec, emscripten::val direction, int dx, int dy) {
                      return image.merge(sec, direction, dx, dy);
                  }))
        .function("min", &Image::min)
        .function("min", optional_override([](const Image &image) {
                      return image.min();
                  }))
        .function("minpair", &Image::minpair)
        .function("mosaic", &Image::mosaic)
        .function("mosaic", optional_override([](const Image &image, emscripten::val sec, emscripten::val direction, int xref, int yref, int xsec, int ysec) {
                      return image.mosaic(sec, direction, xref, yref, xsec, ysec);
                  }))
        .function("mosaic1", &Image::mosaic1)
        .function("mosaic1", optional_override([](const Image &image, emscripten::val sec, emscripten::val direction, int xr1, int yr1, int xs1, int ys1, int xr2, int yr2, int xs2, int ys2) {
                      return image.mosaic1(sec, direction, xr1, yr1, xs1, ys1, xr2, yr2, xs2, ys2);
                  }))
        .function("msb", &Image::msb)
        .function("msb", optional_override([](const Image &image) {
                      return image.msb();
                  }))
        .function("niftisave", &Image::niftisave)
        .function("niftisave", optional_override([](const Image &image, const std::string &filename) {
                      image.niftisave(filename);
                  }))
        .function("percent", &Image::percent)
        .function("phasecor", &Image::phasecor)
        .function("pngsave", &Image::pngsave)
        .function("pngsave", optional_override([](const Image &image, const std::string &filename) {
                      image.pngsave(filename);
                  }))
        .function("pngsaveBuffer", &Image::pngsave_buffer)
        .function("pngsaveBuffer", optional_override([](const Image &image) {
                      return image.pngsave_buffer();
                  }))
        .function("pngsaveTarget", &Image::pngsave_target)
        .function("pngsaveTarget", optional_override([](const Image &image, const Target &target) {
                      image.pngsave_target(target);
                  }))
        .function("ppmsave", &Image::ppmsave)
        .function("ppmsave", optional_override([](const Image &image, const std::string &filename) {
                      image.ppmsave(filename);
                  }))
        .function("ppmsaveTarget", &Image::ppmsave_target)
        .function("ppmsaveTarget", optional_override([](const Image &image, const Target &target) {
                      image.ppmsave_target(target);
                  }))
        .function("premultiply", &Image::premultiply)
        .function("premultiply", optional_override([](const Image &image) {
                      return image.premultiply();
                  }))
        .function("prewitt", &Image::prewitt)
        .function("quadratic", &Image::quadratic)
        .function("quadratic", optional_override([](const Image &image, emscripten::val coeff) {
                      return image.quadratic(coeff);
                  }))
        .function("rad2float", &Image::rad2float)
        .function("radsave", &Image::radsave)
        .function("radsave", optional_override([](const Image &image, const std::string &filename) {
                      image.radsave(filename);
                  }))
        .function("radsaveBuffer", &Image::radsave_buffer)
        .function("radsaveBuffer", optional_override([](const Image &image) {
                      return image.radsave_buffer();
                  }))
        .function("radsaveTarget", &Image::radsave_target)
        .function("radsaveTarget", optional_override([](const Image &image, const Target &target) {
                      image.radsave_target(target);
                  }))
        .function("rank", &Image::rank)
        .function("rawsave", &Image::rawsave)
        .function("rawsave", optional_override([](const Image &image, const std::string &filename) {
                      image.rawsave(filename);
                  }))
        .function("rawsaveBuffer", &Image::rawsave_buffer)
        .function("rawsaveBuffer", optional_override([](const Image &image) {
                      return image.rawsave_buffer();
                  }))
        .function("rawsaveTarget", &Image::rawsave_target)
        .function("rawsaveTarget", optional_override([](const Image &image, const Target &target) {
                      image.rawsave_target(target);
                  }))
        .function("recomb", &Image::recomb)
        .function("reduce", &Image::reduce)
        .function("reduce", optional_override([](const Image &image, double hshrink, double vshrink) {
                      return image.reduce(hshrink, vshrink);
                  }))
        .function("reduceh", &Image::reduceh)
        .function("reduceh", optional_override([](const Image &image, double hshrink) {
                      return image.reduceh(hshrink);
                  }))
        .function("reducev", &Image::reducev)
        .function("reducev", optional_override([](const Image &image, double vshrink) {
                      return image.reducev(vshrink);
                  }))
        .function("replicate", &Image::replicate)
        .function("resize", &Image::resize)
        .function("resize", optional_override([](const Image &image, double scale) {
                      return image.resize(scale);
                  }))
        .function("rot45", &Image::rot45)
        .function("rot45", optional_override([](const Image &image) {
                      return image.rot45();
                  }))
        .function("rotate", &Image::rotate)
        .function("rotate", optional_override([](const Image &image, double angle) {
                      return image.rotate(angle);
                  }))
        .function("sRGB2HSV", &Image::sRGB2HSV)
        .function("sRGB2scRGB", &Image::sRGB2scRGB)
        .function("scRGB2BW", &Image::scRGB2BW)
        .function("scRGB2BW", optional_override([](const Image &image) {
                      return image.scRGB2BW();
                  }))
        .function("scRGB2XYZ", &Image::scRGB2XYZ)
        .function("scRGB2sRGB", &Image::scRGB2sRGB)
        .function("scRGB2sRGB", optional_override([](const Image &image) {
                      return image.scRGB2sRGB();
                  }))
        .function("scale", &Image::scale)
        .function("scale", optional_override([](const Image &image) {
                      return image.scale();
                  }))
        .function("scharr", &Image::scharr)
        .function("sequential", &Image::sequential)
        .function("sequential", optional_override([](const Image &image) {
                      return image.sequential();
                  }))
        .function("sharpen", &Image::sharpen)
        .function("sharpen", optional_override([](const Image &image) {
                      return image.sharpen();
                  }))
        .function("shrink", &Image::shrink)
        .function("shrink", optional_override([](const Image &image, double hshrink, double vshrink) {
                      return image.shrink(hshrink, vshrink);
                  }))
        .function("shrinkh", &Image::shrinkh)
        .function("shrinkh", optional_override([](const Image &image, int hshrink) {
                      return image.shrinkh(hshrink);
                  }))
        .function("shrinkv", &Image::shrinkv)
        .function("shrinkv", optional_override([](const Image &image, int vshrink) {
                      return image.shrinkv(vshrink);
                  }))
        .function("sign", &Image::sign)
        .function("similarity", &Image::similarity)
        .function("similarity", optional_override([](const Image &image) {
                      return image.similarity();
                  }))
        .function("smartcrop", &Image::smartcrop)
        .function("smartcrop", optional_override([](const Image &image, int width, int height) {
                      return image.smartcrop(width, height);
                  }))
        .function("sobel", &Image::sobel)
        .function("spcor", &Image::spcor)
        .function("spectrum", &Image::spectrum)
        .function("stats", &Image::stats)
        .function("stdif", &Image::stdif)
        .function("stdif", optional_override([](const Image &image, int width, int height) {
                      return image.stdif(width, height);
                  }))
        .function("subsample", &Image::subsample)
        .function("subsample", optional_override([](const Image &image, int xfac, int yfac) {
                      return image.subsample(xfac, yfac);
                  }))
        .function("thumbnailImage", &Image::thumbnail_image)
        .function("thumbnailImage", optional_override([](const Image &image, int width) {
                      return image.thumbnail_image(width);
                  }))
        .function("tiffsave", &Image::tiffsave)
        .function("tiffsave", optional_override([](const Image &image, const std::string &filename) {
                      image.tiffsave(filename);
                  }))
        .function("tiffsaveBuffer", &Image::tiffsave_buffer)
        .function("tiffsaveBuffer", optional_override([](const Image &image) {
                      return image.tiffsave_buffer();
                  }))
        .function("tiffsaveTarget", &Image::tiffsave_target)
        .function("tiffsaveTarget", optional_override([](const Image &image, const Target &target) {
                      image.tiffsave_target(target);
                  }))
        .function("tilecache", &Image::tilecache)
        .function("tilecache", optional_override([](const Image &image) {
                      return image.tilecache();
                  }))
        .function("transpose3d", &Image::transpose3d)
        .function("transpose3d", optional_override([](const Image &image) {
                      return image.transpose3d();
                  }))
        .function("unpremultiply", &Image::unpremultiply)
        .function("unpremultiply", optional_override([](const Image &image) {
                      return image.unpremultiply();
                  }))
        .function("vipssave", &Image::vipssave)
        .function("vipssave", optional_override([](const Image &image, const std::string &filename) {
                      image.vipssave(filename);
                  }))
        .function("vipssaveTarget", &Image::vipssave_target)
        .function("vipssaveTarget", optional_override([](const Image &image, const Target &target) {
                      image.vipssave_target(target);
                  }))
        .function("webpsave", &Image::webpsave)
        .function("webpsave", optional_override([](const Image &image, const std::string &filename) {
                      image.webpsave(filename);
                  }))
        .function("webpsaveBuffer", &Image::webpsave_buffer)
        .function("webpsaveBuffer", optional_override([](const Image &image) {
                      return image.webpsave_buffer();
                  }))
        .function("webpsaveMime", &Image::webpsave_mime)
        .function("webpsaveMime", optional_override([](const Image &image) {
                      image.webpsave_mime();
                  }))
        .function("webpsaveTarget", &Image::webpsave_target)
        .function("webpsaveTarget", optional_override([](const Image &image, const Target &target) {
                      image.webpsave_target(target);
                  }))
        .function("wrap", &Image::wrap)
        .function("wrap", optional_override([](const Image &image) {
                      return image.wrap();
                  }))
        .function("zoom", &Image::zoom);
}
