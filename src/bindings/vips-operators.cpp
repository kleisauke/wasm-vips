/**
 * This file was generated automatically. Do not edit!
 */


Image Image::analyzeload(const std::string &filename, emscripten::val js_options)
{
    Image out;

    Image::call("analyzeload", nullptr,
                (new Option)
                    ->set("out", &out)
                    ->set("filename", filename),
                js_options);

    return out;
}

Image Image::arrayjoin(emscripten::val in, emscripten::val js_options)
{
    Image out;

    Image::call("arrayjoin", nullptr,
                (new Option)
                    ->set("out", &out)
                    ->set("in", VIPS_TYPE_ARRAY_IMAGE, in),
                js_options);

    return out;
}

Image Image::bandjoin(emscripten::val in)
{
    Image out;

    Image::call("bandjoin", nullptr,
                (new Option)
                    ->set("out", &out)
                    ->set("in", VIPS_TYPE_ARRAY_IMAGE, in));

    return out;
}

Image Image::bandrank(emscripten::val in, emscripten::val js_options)
{
    Image out;

    Image::call("bandrank", nullptr,
                (new Option)
                    ->set("out", &out)
                    ->set("in", VIPS_TYPE_ARRAY_IMAGE, in),
                js_options);

    return out;
}

Image Image::black(int width, int height, emscripten::val js_options)
{
    Image out;

    Image::call("black", nullptr,
                (new Option)
                    ->set("out", &out)
                    ->set("width", width)
                    ->set("height", height),
                js_options);

    return out;
}

Image Image::csvload(const std::string &filename, emscripten::val js_options)
{
    Image out;

    Image::call("csvload", nullptr,
                (new Option)
                    ->set("out", &out)
                    ->set("filename", filename),
                js_options);

    return out;
}

Image Image::csvload_source(const Source &source, emscripten::val js_options)
{
    Image out;

    Image::call("csvload_source", nullptr,
                (new Option)
                    ->set("out", &out)
                    ->set("source", source),
                js_options);

    return out;
}

Image Image::eye(int width, int height, emscripten::val js_options)
{
    Image out;

    Image::call("eye", nullptr,
                (new Option)
                    ->set("out", &out)
                    ->set("width", width)
                    ->set("height", height),
                js_options);

    return out;
}

Image Image::fitsload(const std::string &filename, emscripten::val js_options)
{
    Image out;

    Image::call("fitsload", nullptr,
                (new Option)
                    ->set("out", &out)
                    ->set("filename", filename),
                js_options);

    return out;
}

Image Image::fitsload_source(const Source &source, emscripten::val js_options)
{
    Image out;

    Image::call("fitsload_source", nullptr,
                (new Option)
                    ->set("out", &out)
                    ->set("source", source),
                js_options);

    return out;
}

Image Image::fractsurf(int width, int height, double fractal_dimension)
{
    Image out;

    Image::call("fractsurf", nullptr,
                (new Option)
                    ->set("out", &out)
                    ->set("width", width)
                    ->set("height", height)
                    ->set("fractal_dimension", fractal_dimension));

    return out;
}

Image Image::gaussmat(double sigma, double min_ampl, emscripten::val js_options)
{
    Image out;

    Image::call("gaussmat", nullptr,
                (new Option)
                    ->set("out", &out)
                    ->set("sigma", sigma)
                    ->set("min_ampl", min_ampl),
                js_options);

    return out;
}

Image Image::gaussnoise(int width, int height, emscripten::val js_options)
{
    Image out;

    Image::call("gaussnoise", nullptr,
                (new Option)
                    ->set("out", &out)
                    ->set("width", width)
                    ->set("height", height),
                js_options);

    return out;
}

Image Image::gifload(const std::string &filename, emscripten::val js_options)
{
    Image out;

    Image::call("gifload", nullptr,
                (new Option)
                    ->set("out", &out)
                    ->set("filename", filename),
                js_options);

    return out;
}

Image Image::gifload_buffer(const std::string &buffer, emscripten::val js_options)
{
    Image out;

    VipsBlob *blob = vips_blob_copy(buffer.c_str(), buffer.size());
    Option *options = (new Option)
                          ->set("out", &out)
                          ->set("buffer", blob);
    vips_area_unref(VIPS_AREA(blob));

    Image::call("gifload_buffer", nullptr, options, js_options);

    return out;
}

Image Image::gifload_source(const Source &source, emscripten::val js_options)
{
    Image out;

    Image::call("gifload_source", nullptr,
                (new Option)
                    ->set("out", &out)
                    ->set("source", source),
                js_options);

    return out;
}

Image Image::grey(int width, int height, emscripten::val js_options)
{
    Image out;

    Image::call("grey", nullptr,
                (new Option)
                    ->set("out", &out)
                    ->set("width", width)
                    ->set("height", height),
                js_options);

    return out;
}

Image Image::heifload(const std::string &filename, emscripten::val js_options)
{
    Image out;

    Image::call("heifload", nullptr,
                (new Option)
                    ->set("out", &out)
                    ->set("filename", filename),
                js_options);

    return out;
}

Image Image::heifload_buffer(const std::string &buffer, emscripten::val js_options)
{
    Image out;

    VipsBlob *blob = vips_blob_copy(buffer.c_str(), buffer.size());
    Option *options = (new Option)
                          ->set("out", &out)
                          ->set("buffer", blob);
    vips_area_unref(VIPS_AREA(blob));

    Image::call("heifload_buffer", nullptr, options, js_options);

    return out;
}

Image Image::heifload_source(const Source &source, emscripten::val js_options)
{
    Image out;

    Image::call("heifload_source", nullptr,
                (new Option)
                    ->set("out", &out)
                    ->set("source", source),
                js_options);

    return out;
}

Image Image::identity(emscripten::val js_options)
{
    Image out;

    Image::call("identity", nullptr,
                (new Option)
                    ->set("out", &out),
                js_options);

    return out;
}

Image Image::jp2kload(const std::string &filename, emscripten::val js_options)
{
    Image out;

    Image::call("jp2kload", nullptr,
                (new Option)
                    ->set("out", &out)
                    ->set("filename", filename),
                js_options);

    return out;
}

Image Image::jp2kload_buffer(const std::string &buffer, emscripten::val js_options)
{
    Image out;

    VipsBlob *blob = vips_blob_copy(buffer.c_str(), buffer.size());
    Option *options = (new Option)
                          ->set("out", &out)
                          ->set("buffer", blob);
    vips_area_unref(VIPS_AREA(blob));

    Image::call("jp2kload_buffer", nullptr, options, js_options);

    return out;
}

Image Image::jp2kload_source(const Source &source, emscripten::val js_options)
{
    Image out;

    Image::call("jp2kload_source", nullptr,
                (new Option)
                    ->set("out", &out)
                    ->set("source", source),
                js_options);

    return out;
}

Image Image::jpegload(const std::string &filename, emscripten::val js_options)
{
    Image out;

    Image::call("jpegload", nullptr,
                (new Option)
                    ->set("out", &out)
                    ->set("filename", filename),
                js_options);

    return out;
}

Image Image::jpegload_buffer(const std::string &buffer, emscripten::val js_options)
{
    Image out;

    VipsBlob *blob = vips_blob_copy(buffer.c_str(), buffer.size());
    Option *options = (new Option)
                          ->set("out", &out)
                          ->set("buffer", blob);
    vips_area_unref(VIPS_AREA(blob));

    Image::call("jpegload_buffer", nullptr, options, js_options);

    return out;
}

Image Image::jpegload_source(const Source &source, emscripten::val js_options)
{
    Image out;

    Image::call("jpegload_source", nullptr,
                (new Option)
                    ->set("out", &out)
                    ->set("source", source),
                js_options);

    return out;
}

Image Image::jxlload(const std::string &filename, emscripten::val js_options)
{
    Image out;

    Image::call("jxlload", nullptr,
                (new Option)
                    ->set("out", &out)
                    ->set("filename", filename),
                js_options);

    return out;
}

Image Image::jxlload_buffer(const std::string &buffer, emscripten::val js_options)
{
    Image out;

    VipsBlob *blob = vips_blob_copy(buffer.c_str(), buffer.size());
    Option *options = (new Option)
                          ->set("out", &out)
                          ->set("buffer", blob);
    vips_area_unref(VIPS_AREA(blob));

    Image::call("jxlload_buffer", nullptr, options, js_options);

    return out;
}

Image Image::jxlload_source(const Source &source, emscripten::val js_options)
{
    Image out;

    Image::call("jxlload_source", nullptr,
                (new Option)
                    ->set("out", &out)
                    ->set("source", source),
                js_options);

    return out;
}

Image Image::logmat(double sigma, double min_ampl, emscripten::val js_options)
{
    Image out;

    Image::call("logmat", nullptr,
                (new Option)
                    ->set("out", &out)
                    ->set("sigma", sigma)
                    ->set("min_ampl", min_ampl),
                js_options);

    return out;
}

Image Image::magickload(const std::string &filename, emscripten::val js_options)
{
    Image out;

    Image::call("magickload", nullptr,
                (new Option)
                    ->set("out", &out)
                    ->set("filename", filename),
                js_options);

    return out;
}

Image Image::magickload_buffer(const std::string &buffer, emscripten::val js_options)
{
    Image out;

    VipsBlob *blob = vips_blob_copy(buffer.c_str(), buffer.size());
    Option *options = (new Option)
                          ->set("out", &out)
                          ->set("buffer", blob);
    vips_area_unref(VIPS_AREA(blob));

    Image::call("magickload_buffer", nullptr, options, js_options);

    return out;
}

Image Image::mask_butterworth(int width, int height, double order, double frequency_cutoff, double amplitude_cutoff, emscripten::val js_options)
{
    Image out;

    Image::call("mask_butterworth", nullptr,
                (new Option)
                    ->set("out", &out)
                    ->set("width", width)
                    ->set("height", height)
                    ->set("order", order)
                    ->set("frequency_cutoff", frequency_cutoff)
                    ->set("amplitude_cutoff", amplitude_cutoff),
                js_options);

    return out;
}

Image Image::mask_butterworth_band(int width, int height, double order, double frequency_cutoff_x, double frequency_cutoff_y, double radius, double amplitude_cutoff, emscripten::val js_options)
{
    Image out;

    Image::call("mask_butterworth_band", nullptr,
                (new Option)
                    ->set("out", &out)
                    ->set("width", width)
                    ->set("height", height)
                    ->set("order", order)
                    ->set("frequency_cutoff_x", frequency_cutoff_x)
                    ->set("frequency_cutoff_y", frequency_cutoff_y)
                    ->set("radius", radius)
                    ->set("amplitude_cutoff", amplitude_cutoff),
                js_options);

    return out;
}

Image Image::mask_butterworth_ring(int width, int height, double order, double frequency_cutoff, double amplitude_cutoff, double ringwidth, emscripten::val js_options)
{
    Image out;

    Image::call("mask_butterworth_ring", nullptr,
                (new Option)
                    ->set("out", &out)
                    ->set("width", width)
                    ->set("height", height)
                    ->set("order", order)
                    ->set("frequency_cutoff", frequency_cutoff)
                    ->set("amplitude_cutoff", amplitude_cutoff)
                    ->set("ringwidth", ringwidth),
                js_options);

    return out;
}

Image Image::mask_fractal(int width, int height, double fractal_dimension, emscripten::val js_options)
{
    Image out;

    Image::call("mask_fractal", nullptr,
                (new Option)
                    ->set("out", &out)
                    ->set("width", width)
                    ->set("height", height)
                    ->set("fractal_dimension", fractal_dimension),
                js_options);

    return out;
}

Image Image::mask_gaussian(int width, int height, double frequency_cutoff, double amplitude_cutoff, emscripten::val js_options)
{
    Image out;

    Image::call("mask_gaussian", nullptr,
                (new Option)
                    ->set("out", &out)
                    ->set("width", width)
                    ->set("height", height)
                    ->set("frequency_cutoff", frequency_cutoff)
                    ->set("amplitude_cutoff", amplitude_cutoff),
                js_options);

    return out;
}

Image Image::mask_gaussian_band(int width, int height, double frequency_cutoff_x, double frequency_cutoff_y, double radius, double amplitude_cutoff, emscripten::val js_options)
{
    Image out;

    Image::call("mask_gaussian_band", nullptr,
                (new Option)
                    ->set("out", &out)
                    ->set("width", width)
                    ->set("height", height)
                    ->set("frequency_cutoff_x", frequency_cutoff_x)
                    ->set("frequency_cutoff_y", frequency_cutoff_y)
                    ->set("radius", radius)
                    ->set("amplitude_cutoff", amplitude_cutoff),
                js_options);

    return out;
}

Image Image::mask_gaussian_ring(int width, int height, double frequency_cutoff, double amplitude_cutoff, double ringwidth, emscripten::val js_options)
{
    Image out;

    Image::call("mask_gaussian_ring", nullptr,
                (new Option)
                    ->set("out", &out)
                    ->set("width", width)
                    ->set("height", height)
                    ->set("frequency_cutoff", frequency_cutoff)
                    ->set("amplitude_cutoff", amplitude_cutoff)
                    ->set("ringwidth", ringwidth),
                js_options);

    return out;
}

Image Image::mask_ideal(int width, int height, double frequency_cutoff, emscripten::val js_options)
{
    Image out;

    Image::call("mask_ideal", nullptr,
                (new Option)
                    ->set("out", &out)
                    ->set("width", width)
                    ->set("height", height)
                    ->set("frequency_cutoff", frequency_cutoff),
                js_options);

    return out;
}

Image Image::mask_ideal_band(int width, int height, double frequency_cutoff_x, double frequency_cutoff_y, double radius, emscripten::val js_options)
{
    Image out;

    Image::call("mask_ideal_band", nullptr,
                (new Option)
                    ->set("out", &out)
                    ->set("width", width)
                    ->set("height", height)
                    ->set("frequency_cutoff_x", frequency_cutoff_x)
                    ->set("frequency_cutoff_y", frequency_cutoff_y)
                    ->set("radius", radius),
                js_options);

    return out;
}

Image Image::mask_ideal_ring(int width, int height, double frequency_cutoff, double ringwidth, emscripten::val js_options)
{
    Image out;

    Image::call("mask_ideal_ring", nullptr,
                (new Option)
                    ->set("out", &out)
                    ->set("width", width)
                    ->set("height", height)
                    ->set("frequency_cutoff", frequency_cutoff)
                    ->set("ringwidth", ringwidth),
                js_options);

    return out;
}

Image Image::matload(const std::string &filename, emscripten::val js_options)
{
    Image out;

    Image::call("matload", nullptr,
                (new Option)
                    ->set("out", &out)
                    ->set("filename", filename),
                js_options);

    return out;
}

Image Image::matrixload(const std::string &filename, emscripten::val js_options)
{
    Image out;

    Image::call("matrixload", nullptr,
                (new Option)
                    ->set("out", &out)
                    ->set("filename", filename),
                js_options);

    return out;
}

Image Image::matrixload_source(const Source &source, emscripten::val js_options)
{
    Image out;

    Image::call("matrixload_source", nullptr,
                (new Option)
                    ->set("out", &out)
                    ->set("source", source),
                js_options);

    return out;
}

Image Image::niftiload(const std::string &filename, emscripten::val js_options)
{
    Image out;

    Image::call("niftiload", nullptr,
                (new Option)
                    ->set("out", &out)
                    ->set("filename", filename),
                js_options);

    return out;
}

Image Image::niftiload_source(const Source &source, emscripten::val js_options)
{
    Image out;

    Image::call("niftiload_source", nullptr,
                (new Option)
                    ->set("out", &out)
                    ->set("source", source),
                js_options);

    return out;
}

Image Image::openexrload(const std::string &filename, emscripten::val js_options)
{
    Image out;

    Image::call("openexrload", nullptr,
                (new Option)
                    ->set("out", &out)
                    ->set("filename", filename),
                js_options);

    return out;
}

Image Image::openslideload(const std::string &filename, emscripten::val js_options)
{
    Image out;

    Image::call("openslideload", nullptr,
                (new Option)
                    ->set("out", &out)
                    ->set("filename", filename),
                js_options);

    return out;
}

Image Image::openslideload_source(const Source &source, emscripten::val js_options)
{
    Image out;

    Image::call("openslideload_source", nullptr,
                (new Option)
                    ->set("out", &out)
                    ->set("source", source),
                js_options);

    return out;
}

Image Image::pdfload(const std::string &filename, emscripten::val js_options)
{
    Image out;

    Image::call("pdfload", nullptr,
                (new Option)
                    ->set("out", &out)
                    ->set("filename", filename),
                js_options);

    return out;
}

Image Image::pdfload_buffer(const std::string &buffer, emscripten::val js_options)
{
    Image out;

    VipsBlob *blob = vips_blob_copy(buffer.c_str(), buffer.size());
    Option *options = (new Option)
                          ->set("out", &out)
                          ->set("buffer", blob);
    vips_area_unref(VIPS_AREA(blob));

    Image::call("pdfload_buffer", nullptr, options, js_options);

    return out;
}

Image Image::pdfload_source(const Source &source, emscripten::val js_options)
{
    Image out;

    Image::call("pdfload_source", nullptr,
                (new Option)
                    ->set("out", &out)
                    ->set("source", source),
                js_options);

    return out;
}

Image Image::perlin(int width, int height, emscripten::val js_options)
{
    Image out;

    Image::call("perlin", nullptr,
                (new Option)
                    ->set("out", &out)
                    ->set("width", width)
                    ->set("height", height),
                js_options);

    return out;
}

Image Image::pngload(const std::string &filename, emscripten::val js_options)
{
    Image out;

    Image::call("pngload", nullptr,
                (new Option)
                    ->set("out", &out)
                    ->set("filename", filename),
                js_options);

    return out;
}

Image Image::pngload_buffer(const std::string &buffer, emscripten::val js_options)
{
    Image out;

    VipsBlob *blob = vips_blob_copy(buffer.c_str(), buffer.size());
    Option *options = (new Option)
                          ->set("out", &out)
                          ->set("buffer", blob);
    vips_area_unref(VIPS_AREA(blob));

    Image::call("pngload_buffer", nullptr, options, js_options);

    return out;
}

Image Image::pngload_source(const Source &source, emscripten::val js_options)
{
    Image out;

    Image::call("pngload_source", nullptr,
                (new Option)
                    ->set("out", &out)
                    ->set("source", source),
                js_options);

    return out;
}

Image Image::ppmload(const std::string &filename, emscripten::val js_options)
{
    Image out;

    Image::call("ppmload", nullptr,
                (new Option)
                    ->set("out", &out)
                    ->set("filename", filename),
                js_options);

    return out;
}

Image Image::ppmload_source(const Source &source, emscripten::val js_options)
{
    Image out;

    Image::call("ppmload_source", nullptr,
                (new Option)
                    ->set("out", &out)
                    ->set("source", source),
                js_options);

    return out;
}

emscripten::val Image::profile_load(const std::string &name)
{
    VipsBlob *profile;

    Image::call("profile_load", nullptr,
                (new Option)
                    ->set("profile", &profile)
                    ->set("name", name));

    emscripten::val result = BlobVal.new_(emscripten::typed_memory_view(
        VIPS_AREA(profile)->length,
        reinterpret_cast<uint8_t *>(VIPS_AREA(profile)->data)));
    vips_area_unref(VIPS_AREA(profile));

    return result;
}

Image Image::radload(const std::string &filename, emscripten::val js_options)
{
    Image out;

    Image::call("radload", nullptr,
                (new Option)
                    ->set("out", &out)
                    ->set("filename", filename),
                js_options);

    return out;
}

Image Image::radload_buffer(const std::string &buffer, emscripten::val js_options)
{
    Image out;

    VipsBlob *blob = vips_blob_copy(buffer.c_str(), buffer.size());
    Option *options = (new Option)
                          ->set("out", &out)
                          ->set("buffer", blob);
    vips_area_unref(VIPS_AREA(blob));

    Image::call("radload_buffer", nullptr, options, js_options);

    return out;
}

Image Image::radload_source(const Source &source, emscripten::val js_options)
{
    Image out;

    Image::call("radload_source", nullptr,
                (new Option)
                    ->set("out", &out)
                    ->set("source", source),
                js_options);

    return out;
}

Image Image::rawload(const std::string &filename, int width, int height, int bands, emscripten::val js_options)
{
    Image out;

    Image::call("rawload", nullptr,
                (new Option)
                    ->set("out", &out)
                    ->set("filename", filename)
                    ->set("width", width)
                    ->set("height", height)
                    ->set("bands", bands),
                js_options);

    return out;
}

Image Image::sdf(int width, int height, emscripten::val shape, emscripten::val js_options)
{
    Image out;

    Image::call("sdf", nullptr,
                (new Option)
                    ->set("out", &out)
                    ->set("width", width)
                    ->set("height", height)
                    ->set("shape", VIPS_TYPE_SDF_SHAPE, shape),
                js_options);

    return out;
}

Image Image::sines(int width, int height, emscripten::val js_options)
{
    Image out;

    Image::call("sines", nullptr,
                (new Option)
                    ->set("out", &out)
                    ->set("width", width)
                    ->set("height", height),
                js_options);

    return out;
}

Image Image::sum(emscripten::val in)
{
    Image out;

    Image::call("sum", nullptr,
                (new Option)
                    ->set("out", &out)
                    ->set("in", VIPS_TYPE_ARRAY_IMAGE, in));

    return out;
}

Image Image::svgload(const std::string &filename, emscripten::val js_options)
{
    Image out;

    Image::call("svgload", nullptr,
                (new Option)
                    ->set("out", &out)
                    ->set("filename", filename),
                js_options);

    return out;
}

Image Image::svgload_buffer(const std::string &buffer, emscripten::val js_options)
{
    Image out;

    VipsBlob *blob = vips_blob_copy(buffer.c_str(), buffer.size());
    Option *options = (new Option)
                          ->set("out", &out)
                          ->set("buffer", blob);
    vips_area_unref(VIPS_AREA(blob));

    Image::call("svgload_buffer", nullptr, options, js_options);

    return out;
}

Image Image::svgload_source(const Source &source, emscripten::val js_options)
{
    Image out;

    Image::call("svgload_source", nullptr,
                (new Option)
                    ->set("out", &out)
                    ->set("source", source),
                js_options);

    return out;
}

Image Image::switch_image(emscripten::val tests)
{
    Image out;

    Image::call("switch", nullptr,
                (new Option)
                    ->set("out", &out)
                    ->set("tests", VIPS_TYPE_ARRAY_IMAGE, tests));

    return out;
}

void Image::system(const std::string &cmd_format, emscripten::val js_options)
{
    Image::call("system", nullptr,
                (new Option)
                    ->set("cmd_format", cmd_format),
                js_options);
}

Image Image::text(const std::string &text, emscripten::val js_options)
{
    Image out;

    Image::call("text", nullptr,
                (new Option)
                    ->set("out", &out)
                    ->set("text", text),
                js_options);

    return out;
}

Image Image::thumbnail(const std::string &filename, int width, emscripten::val js_options)
{
    Image out;

    Image::call("thumbnail", nullptr,
                (new Option)
                    ->set("out", &out)
                    ->set("filename", filename)
                    ->set("width", width),
                js_options);

    return out;
}

Image Image::thumbnail_buffer(const std::string &buffer, int width, emscripten::val js_options)
{
    Image out;

    VipsBlob *blob = vips_blob_copy(buffer.c_str(), buffer.size());
    Option *options = (new Option)
                          ->set("out", &out)
                          ->set("buffer", blob)
                          ->set("width", width);
    vips_area_unref(VIPS_AREA(blob));

    Image::call("thumbnail_buffer", nullptr, options, js_options);

    return out;
}

Image Image::thumbnail_source(const Source &source, int width, emscripten::val js_options)
{
    Image out;

    Image::call("thumbnail_source", nullptr,
                (new Option)
                    ->set("out", &out)
                    ->set("source", source)
                    ->set("width", width),
                js_options);

    return out;
}

Image Image::tiffload(const std::string &filename, emscripten::val js_options)
{
    Image out;

    Image::call("tiffload", nullptr,
                (new Option)
                    ->set("out", &out)
                    ->set("filename", filename),
                js_options);

    return out;
}

Image Image::tiffload_buffer(const std::string &buffer, emscripten::val js_options)
{
    Image out;

    VipsBlob *blob = vips_blob_copy(buffer.c_str(), buffer.size());
    Option *options = (new Option)
                          ->set("out", &out)
                          ->set("buffer", blob);
    vips_area_unref(VIPS_AREA(blob));

    Image::call("tiffload_buffer", nullptr, options, js_options);

    return out;
}

Image Image::tiffload_source(const Source &source, emscripten::val js_options)
{
    Image out;

    Image::call("tiffload_source", nullptr,
                (new Option)
                    ->set("out", &out)
                    ->set("source", source),
                js_options);

    return out;
}

Image Image::tonelut(emscripten::val js_options)
{
    Image out;

    Image::call("tonelut", nullptr,
                (new Option)
                    ->set("out", &out),
                js_options);

    return out;
}

Image Image::vipsload(const std::string &filename, emscripten::val js_options)
{
    Image out;

    Image::call("vipsload", nullptr,
                (new Option)
                    ->set("out", &out)
                    ->set("filename", filename),
                js_options);

    return out;
}

Image Image::vipsload_source(const Source &source, emscripten::val js_options)
{
    Image out;

    Image::call("vipsload_source", nullptr,
                (new Option)
                    ->set("out", &out)
                    ->set("source", source),
                js_options);

    return out;
}

Image Image::webpload(const std::string &filename, emscripten::val js_options)
{
    Image out;

    Image::call("webpload", nullptr,
                (new Option)
                    ->set("out", &out)
                    ->set("filename", filename),
                js_options);

    return out;
}

Image Image::webpload_buffer(const std::string &buffer, emscripten::val js_options)
{
    Image out;

    VipsBlob *blob = vips_blob_copy(buffer.c_str(), buffer.size());
    Option *options = (new Option)
                          ->set("out", &out)
                          ->set("buffer", blob);
    vips_area_unref(VIPS_AREA(blob));

    Image::call("webpload_buffer", nullptr, options, js_options);

    return out;
}

Image Image::webpload_source(const Source &source, emscripten::val js_options)
{
    Image out;

    Image::call("webpload_source", nullptr,
                (new Option)
                    ->set("out", &out)
                    ->set("source", source),
                js_options);

    return out;
}

Image Image::worley(int width, int height, emscripten::val js_options)
{
    Image out;

    Image::call("worley", nullptr,
                (new Option)
                    ->set("out", &out)
                    ->set("width", width)
                    ->set("height", height),
                js_options);

    return out;
}

Image Image::xyz(int width, int height, emscripten::val js_options)
{
    Image out;

    Image::call("xyz", nullptr,
                (new Option)
                    ->set("out", &out)
                    ->set("width", width)
                    ->set("height", height),
                js_options);

    return out;
}

Image Image::zone(int width, int height, emscripten::val js_options)
{
    Image out;

    Image::call("zone", nullptr,
                (new Option)
                    ->set("out", &out)
                    ->set("width", width)
                    ->set("height", height),
                js_options);

    return out;
}

Image Image::CMC2LCh() const
{
    Image out;

    this->call("CMC2LCh",
               (new Option)
                   ->set("in", *this)
                   ->set("out", &out));

    return out;
}

Image Image::CMYK2XYZ() const
{
    Image out;

    this->call("CMYK2XYZ",
               (new Option)
                   ->set("in", *this)
                   ->set("out", &out));

    return out;
}

Image Image::HSV2sRGB() const
{
    Image out;

    this->call("HSV2sRGB",
               (new Option)
                   ->set("in", *this)
                   ->set("out", &out));

    return out;
}

Image Image::LCh2CMC() const
{
    Image out;

    this->call("LCh2CMC",
               (new Option)
                   ->set("in", *this)
                   ->set("out", &out));

    return out;
}

Image Image::LCh2Lab() const
{
    Image out;

    this->call("LCh2Lab",
               (new Option)
                   ->set("in", *this)
                   ->set("out", &out));

    return out;
}

Image Image::Lab2LCh() const
{
    Image out;

    this->call("Lab2LCh",
               (new Option)
                   ->set("in", *this)
                   ->set("out", &out));

    return out;
}

Image Image::Lab2LabQ() const
{
    Image out;

    this->call("Lab2LabQ",
               (new Option)
                   ->set("in", *this)
                   ->set("out", &out));

    return out;
}

Image Image::Lab2LabS() const
{
    Image out;

    this->call("Lab2LabS",
               (new Option)
                   ->set("in", *this)
                   ->set("out", &out));

    return out;
}

Image Image::Lab2XYZ(emscripten::val js_options) const
{
    Image out;

    this->call("Lab2XYZ",
               (new Option)
                   ->set("in", *this)
                   ->set("out", &out),
               js_options);

    return out;
}

Image Image::LabQ2Lab() const
{
    Image out;

    this->call("LabQ2Lab",
               (new Option)
                   ->set("in", *this)
                   ->set("out", &out));

    return out;
}

Image Image::LabQ2LabS() const
{
    Image out;

    this->call("LabQ2LabS",
               (new Option)
                   ->set("in", *this)
                   ->set("out", &out));

    return out;
}

Image Image::LabQ2sRGB() const
{
    Image out;

    this->call("LabQ2sRGB",
               (new Option)
                   ->set("in", *this)
                   ->set("out", &out));

    return out;
}

Image Image::LabS2Lab() const
{
    Image out;

    this->call("LabS2Lab",
               (new Option)
                   ->set("in", *this)
                   ->set("out", &out));

    return out;
}

Image Image::LabS2LabQ() const
{
    Image out;

    this->call("LabS2LabQ",
               (new Option)
                   ->set("in", *this)
                   ->set("out", &out));

    return out;
}

Image Image::XYZ2CMYK() const
{
    Image out;

    this->call("XYZ2CMYK",
               (new Option)
                   ->set("in", *this)
                   ->set("out", &out));

    return out;
}

Image Image::XYZ2Lab(emscripten::val js_options) const
{
    Image out;

    this->call("XYZ2Lab",
               (new Option)
                   ->set("in", *this)
                   ->set("out", &out),
               js_options);

    return out;
}

Image Image::XYZ2Yxy() const
{
    Image out;

    this->call("XYZ2Yxy",
               (new Option)
                   ->set("in", *this)
                   ->set("out", &out));

    return out;
}

Image Image::XYZ2scRGB() const
{
    Image out;

    this->call("XYZ2scRGB",
               (new Option)
                   ->set("in", *this)
                   ->set("out", &out));

    return out;
}

Image Image::Yxy2XYZ() const
{
    Image out;

    this->call("Yxy2XYZ",
               (new Option)
                   ->set("in", *this)
                   ->set("out", &out));

    return out;
}

Image Image::abs() const
{
    Image out;

    this->call("abs",
               (new Option)
                   ->set("in", *this)
                   ->set("out", &out));

    return out;
}

Image Image::addalpha() const
{
    Image out;

    this->call("addalpha",
               (new Option)
                   ->set("in", *this)
                   ->set("out", &out));

    return out;
}

Image Image::affine(const std::vector<double> &matrix, emscripten::val js_options) const
{
    Image out;

    this->call("affine",
               (new Option)
                   ->set("in", *this)
                   ->set("out", &out)
                   ->set("matrix", matrix),
               js_options);

    return out;
}

Image Image::autorot(emscripten::val js_options) const
{
    Image out;

    this->call("autorot",
               (new Option)
                   ->set("in", *this)
                   ->set("out", &out),
               js_options);

    return out;
}

double Image::avg() const
{
    double out;

    this->call("avg",
               (new Option)
                   ->set("in", *this)
                   ->set("out", &out));

    return out;
}

Image Image::bandbool(emscripten::val boolean) const
{
    Image out;

    this->call("bandbool",
               (new Option)
                   ->set("in", *this)
                   ->set("out", &out)
                   ->set("boolean", VIPS_TYPE_OPERATION_BOOLEAN, boolean));

    return out;
}

Image Image::bandfold(emscripten::val js_options) const
{
    Image out;

    this->call("bandfold",
               (new Option)
                   ->set("in", *this)
                   ->set("out", &out),
               js_options);

    return out;
}

Image Image::bandmean() const
{
    Image out;

    this->call("bandmean",
               (new Option)
                   ->set("in", *this)
                   ->set("out", &out));

    return out;
}

Image Image::bandunfold(emscripten::val js_options) const
{
    Image out;

    this->call("bandunfold",
               (new Option)
                   ->set("in", *this)
                   ->set("out", &out),
               js_options);

    return out;
}

Image Image::boolean_const(emscripten::val boolean, const std::vector<double> &c) const
{
    Image out;

    this->call("boolean_const",
               (new Option)
                   ->set("in", *this)
                   ->set("out", &out)
                   ->set("boolean", VIPS_TYPE_OPERATION_BOOLEAN, boolean)
                   ->set("c", c));

    return out;
}

Image Image::buildlut() const
{
    Image out;

    this->call("buildlut",
               (new Option)
                   ->set("in", *this)
                   ->set("out", &out));

    return out;
}

Image Image::byteswap() const
{
    Image out;

    this->call("byteswap",
               (new Option)
                   ->set("in", *this)
                   ->set("out", &out));

    return out;
}

Image Image::canny(emscripten::val js_options) const
{
    Image out;

    this->call("canny",
               (new Option)
                   ->set("in", *this)
                   ->set("out", &out),
               js_options);

    return out;
}

Image Image::case_image(emscripten::val cases) const
{
    Image out;

    this->call("case",
               (new Option)
                   ->set("index", *this)
                   ->set("out", &out)
                   ->set("cases", VIPS_TYPE_ARRAY_IMAGE, cases, this));

    return out;
}

Image Image::cast(emscripten::val format, emscripten::val js_options) const
{
    Image out;

    this->call("cast",
               (new Option)
                   ->set("in", *this)
                   ->set("out", &out)
                   ->set("format", VIPS_TYPE_BAND_FORMAT, format),
               js_options);

    return out;
}

Image Image::clamp(emscripten::val js_options) const
{
    Image out;

    this->call("clamp",
               (new Option)
                   ->set("in", *this)
                   ->set("out", &out),
               js_options);

    return out;
}

Image Image::colourspace(emscripten::val space, emscripten::val js_options) const
{
    Image out;

    this->call("colourspace",
               (new Option)
                   ->set("in", *this)
                   ->set("out", &out)
                   ->set("space", VIPS_TYPE_INTERPRETATION, space),
               js_options);

    return out;
}

Image Image::compass(emscripten::val mask, emscripten::val js_options) const
{
    Image out;

    this->call("compass",
               (new Option)
                   ->set("in", *this)
                   ->set("out", &out)
                   ->set("mask", VIPS_TYPE_IMAGE, mask, this),
               js_options);

    return out;
}

Image Image::complex(emscripten::val cmplx) const
{
    Image out;

    this->call("complex",
               (new Option)
                   ->set("in", *this)
                   ->set("out", &out)
                   ->set("cmplx", VIPS_TYPE_OPERATION_COMPLEX, cmplx));

    return out;
}

Image Image::complex2(emscripten::val right, emscripten::val cmplx) const
{
    Image out;

    this->call("complex2",
               (new Option)
                   ->set("left", *this)
                   ->set("out", &out)
                   ->set("right", VIPS_TYPE_IMAGE, right, this)
                   ->set("cmplx", VIPS_TYPE_OPERATION_COMPLEX2, cmplx));

    return out;
}

Image Image::complexform(emscripten::val right) const
{
    Image out;

    this->call("complexform",
               (new Option)
                   ->set("left", *this)
                   ->set("out", &out)
                   ->set("right", VIPS_TYPE_IMAGE, right, this));

    return out;
}

Image Image::complexget(emscripten::val get) const
{
    Image out;

    this->call("complexget",
               (new Option)
                   ->set("in", *this)
                   ->set("out", &out)
                   ->set("get", VIPS_TYPE_OPERATION_COMPLEXGET, get));

    return out;
}

Image Image::composite2(emscripten::val overlay, emscripten::val mode, emscripten::val js_options) const
{
    Image out;

    this->call("composite2",
               (new Option)
                   ->set("base", *this)
                   ->set("out", &out)
                   ->set("overlay", VIPS_TYPE_IMAGE, overlay, this)
                   ->set("mode", VIPS_TYPE_BLEND_MODE, mode),
               js_options);

    return out;
}

Image Image::conv(emscripten::val mask, emscripten::val js_options) const
{
    Image out;

    this->call("conv",
               (new Option)
                   ->set("in", *this)
                   ->set("out", &out)
                   ->set("mask", VIPS_TYPE_IMAGE, mask, this),
               js_options);

    return out;
}

Image Image::conva(emscripten::val mask, emscripten::val js_options) const
{
    Image out;

    this->call("conva",
               (new Option)
                   ->set("in", *this)
                   ->set("out", &out)
                   ->set("mask", VIPS_TYPE_IMAGE, mask, this),
               js_options);

    return out;
}

Image Image::convasep(emscripten::val mask, emscripten::val js_options) const
{
    Image out;

    this->call("convasep",
               (new Option)
                   ->set("in", *this)
                   ->set("out", &out)
                   ->set("mask", VIPS_TYPE_IMAGE, mask, this),
               js_options);

    return out;
}

Image Image::convf(emscripten::val mask) const
{
    Image out;

    this->call("convf",
               (new Option)
                   ->set("in", *this)
                   ->set("out", &out)
                   ->set("mask", VIPS_TYPE_IMAGE, mask, this));

    return out;
}

Image Image::convi(emscripten::val mask) const
{
    Image out;

    this->call("convi",
               (new Option)
                   ->set("in", *this)
                   ->set("out", &out)
                   ->set("mask", VIPS_TYPE_IMAGE, mask, this));

    return out;
}

Image Image::convsep(emscripten::val mask, emscripten::val js_options) const
{
    Image out;

    this->call("convsep",
               (new Option)
                   ->set("in", *this)
                   ->set("out", &out)
                   ->set("mask", VIPS_TYPE_IMAGE, mask, this),
               js_options);

    return out;
}

Image Image::copy(emscripten::val js_options) const
{
    Image out;

    this->call("copy",
               (new Option)
                   ->set("in", *this)
                   ->set("out", &out),
               js_options);

    return out;
}

double Image::countlines(emscripten::val direction) const
{
    double nolines;

    this->call("countlines",
               (new Option)
                   ->set("in", *this)
                   ->set("nolines", &nolines)
                   ->set("direction", VIPS_TYPE_DIRECTION, direction));

    return nolines;
}

Image Image::crop(int left, int top, int width, int height) const
{
    Image out;

    this->call("crop",
               (new Option)
                   ->set("input", *this)
                   ->set("out", &out)
                   ->set("left", left)
                   ->set("top", top)
                   ->set("width", width)
                   ->set("height", height));

    return out;
}

void Image::csvsave(const std::string &filename, emscripten::val js_options) const
{
    this->call("csvsave",
               (new Option)
                   ->set("in", *this)
                   ->set("filename", filename),
               js_options);
}

void Image::csvsave_target(const Target &target, emscripten::val js_options) const
{
    this->call("csvsave_target",
               (new Option)
                   ->set("in", *this)
                   ->set("target", target),
               js_options);
}

Image Image::dE00(emscripten::val right) const
{
    Image out;

    this->call("dE00",
               (new Option)
                   ->set("left", *this)
                   ->set("out", &out)
                   ->set("right", VIPS_TYPE_IMAGE, right, this));

    return out;
}

Image Image::dE76(emscripten::val right) const
{
    Image out;

    this->call("dE76",
               (new Option)
                   ->set("left", *this)
                   ->set("out", &out)
                   ->set("right", VIPS_TYPE_IMAGE, right, this));

    return out;
}

Image Image::dECMC(emscripten::val right) const
{
    Image out;

    this->call("dECMC",
               (new Option)
                   ->set("left", *this)
                   ->set("out", &out)
                   ->set("right", VIPS_TYPE_IMAGE, right, this));

    return out;
}

double Image::deviate() const
{
    double out;

    this->call("deviate",
               (new Option)
                   ->set("in", *this)
                   ->set("out", &out));

    return out;
}

void Image::draw_circle(const std::vector<double> &ink, int cx, int cy, int radius, emscripten::val js_options) const
{
    this->call("draw_circle",
               (new Option)
                   ->set("image", *this)
                   ->set("ink", ink)
                   ->set("cx", cx)
                   ->set("cy", cy)
                   ->set("radius", radius),
               js_options);
}

void Image::draw_flood(const std::vector<double> &ink, int x, int y, emscripten::val js_options) const
{
    this->call("draw_flood",
               (new Option)
                   ->set("image", *this)
                   ->set("ink", ink)
                   ->set("x", x)
                   ->set("y", y),
               js_options);
}

void Image::draw_image(emscripten::val sub, int x, int y, emscripten::val js_options) const
{
    this->call("draw_image",
               (new Option)
                   ->set("image", *this)
                   ->set("sub", VIPS_TYPE_IMAGE, sub, this)
                   ->set("x", x)
                   ->set("y", y),
               js_options);
}

void Image::draw_line(const std::vector<double> &ink, int x1, int y1, int x2, int y2) const
{
    this->call("draw_line",
               (new Option)
                   ->set("image", *this)
                   ->set("ink", ink)
                   ->set("x1", x1)
                   ->set("y1", y1)
                   ->set("x2", x2)
                   ->set("y2", y2));
}

void Image::draw_mask(const std::vector<double> &ink, emscripten::val mask, int x, int y) const
{
    this->call("draw_mask",
               (new Option)
                   ->set("image", *this)
                   ->set("ink", ink)
                   ->set("mask", VIPS_TYPE_IMAGE, mask, this)
                   ->set("x", x)
                   ->set("y", y));
}

void Image::draw_rect(const std::vector<double> &ink, int left, int top, int width, int height, emscripten::val js_options) const
{
    this->call("draw_rect",
               (new Option)
                   ->set("image", *this)
                   ->set("ink", ink)
                   ->set("left", left)
                   ->set("top", top)
                   ->set("width", width)
                   ->set("height", height),
               js_options);
}

void Image::draw_smudge(int left, int top, int width, int height) const
{
    this->call("draw_smudge",
               (new Option)
                   ->set("image", *this)
                   ->set("left", left)
                   ->set("top", top)
                   ->set("width", width)
                   ->set("height", height));
}

void Image::dzsave(const std::string &filename, emscripten::val js_options) const
{
    this->call("dzsave",
               (new Option)
                   ->set("in", *this)
                   ->set("filename", filename),
               js_options);
}

emscripten::val Image::dzsave_buffer(emscripten::val js_options) const
{
    VipsBlob *buffer;

    this->call("dzsave_buffer",
               (new Option)
                   ->set("in", *this)
                   ->set("buffer", &buffer),
               js_options);

    emscripten::val result = BlobVal.new_(emscripten::typed_memory_view(
        VIPS_AREA(buffer)->length,
        reinterpret_cast<uint8_t *>(VIPS_AREA(buffer)->data)));
    vips_area_unref(VIPS_AREA(buffer));

    return result;
}

void Image::dzsave_target(const Target &target, emscripten::val js_options) const
{
    this->call("dzsave_target",
               (new Option)
                   ->set("in", *this)
                   ->set("target", target),
               js_options);
}

Image Image::embed(int x, int y, int width, int height, emscripten::val js_options) const
{
    Image out;

    this->call("embed",
               (new Option)
                   ->set("in", *this)
                   ->set("out", &out)
                   ->set("x", x)
                   ->set("y", y)
                   ->set("width", width)
                   ->set("height", height),
               js_options);

    return out;
}

Image Image::extract_area(int left, int top, int width, int height) const
{
    Image out;

    this->call("extract_area",
               (new Option)
                   ->set("input", *this)
                   ->set("out", &out)
                   ->set("left", left)
                   ->set("top", top)
                   ->set("width", width)
                   ->set("height", height));

    return out;
}

Image Image::extract_band(int band, emscripten::val js_options) const
{
    Image out;

    this->call("extract_band",
               (new Option)
                   ->set("in", *this)
                   ->set("out", &out)
                   ->set("band", band),
               js_options);

    return out;
}

Image Image::falsecolour() const
{
    Image out;

    this->call("falsecolour",
               (new Option)
                   ->set("in", *this)
                   ->set("out", &out));

    return out;
}

Image Image::fastcor(emscripten::val ref) const
{
    Image out;

    this->call("fastcor",
               (new Option)
                   ->set("in", *this)
                   ->set("out", &out)
                   ->set("ref", VIPS_TYPE_IMAGE, ref, this));

    return out;
}

Image Image::fill_nearest(emscripten::val js_options) const
{
    Image out;

    this->call("fill_nearest",
               (new Option)
                   ->set("in", *this)
                   ->set("out", &out),
               js_options);

    return out;
}

int Image::find_trim(int *top, int *width, int *height, emscripten::val js_options) const
{
    int left;

    this->call("find_trim",
               (new Option)
                   ->set("in", *this)
                   ->set("left", &left)
                   ->set("top", top)
                   ->set("width", width)
                   ->set("height", height),
               js_options);

    return left;
}

void Image::fitssave(const std::string &filename, emscripten::val js_options) const
{
    this->call("fitssave",
               (new Option)
                   ->set("in", *this)
                   ->set("filename", filename),
               js_options);
}

Image Image::flatten(emscripten::val js_options) const
{
    Image out;

    this->call("flatten",
               (new Option)
                   ->set("in", *this)
                   ->set("out", &out),
               js_options);

    return out;
}

Image Image::flip(emscripten::val direction) const
{
    Image out;

    this->call("flip",
               (new Option)
                   ->set("in", *this)
                   ->set("out", &out)
                   ->set("direction", VIPS_TYPE_DIRECTION, direction));

    return out;
}

Image Image::float2rad() const
{
    Image out;

    this->call("float2rad",
               (new Option)
                   ->set("in", *this)
                   ->set("out", &out));

    return out;
}

Image Image::freqmult(emscripten::val mask) const
{
    Image out;

    this->call("freqmult",
               (new Option)
                   ->set("in", *this)
                   ->set("out", &out)
                   ->set("mask", VIPS_TYPE_IMAGE, mask, this));

    return out;
}

Image Image::fwfft() const
{
    Image out;

    this->call("fwfft",
               (new Option)
                   ->set("in", *this)
                   ->set("out", &out));

    return out;
}

Image Image::gamma(emscripten::val js_options) const
{
    Image out;

    this->call("gamma",
               (new Option)
                   ->set("in", *this)
                   ->set("out", &out),
               js_options);

    return out;
}

Image Image::gaussblur(double sigma, emscripten::val js_options) const
{
    Image out;

    this->call("gaussblur",
               (new Option)
                   ->set("in", *this)
                   ->set("out", &out)
                   ->set("sigma", sigma),
               js_options);

    return out;
}

std::vector<double> Image::getpoint(int x, int y, emscripten::val js_options) const
{
    std::vector<double> out_array;

    this->call("getpoint",
               (new Option)
                   ->set("in", *this)
                   ->set("out_array", &out_array)
                   ->set("x", x)
                   ->set("y", y),
               js_options);

    return out_array;
}

void Image::gifsave(const std::string &filename, emscripten::val js_options) const
{
    this->call("gifsave",
               (new Option)
                   ->set("in", *this)
                   ->set("filename", filename),
               js_options);
}

emscripten::val Image::gifsave_buffer(emscripten::val js_options) const
{
    VipsBlob *buffer;

    this->call("gifsave_buffer",
               (new Option)
                   ->set("in", *this)
                   ->set("buffer", &buffer),
               js_options);

    emscripten::val result = BlobVal.new_(emscripten::typed_memory_view(
        VIPS_AREA(buffer)->length,
        reinterpret_cast<uint8_t *>(VIPS_AREA(buffer)->data)));
    vips_area_unref(VIPS_AREA(buffer));

    return result;
}

void Image::gifsave_target(const Target &target, emscripten::val js_options) const
{
    this->call("gifsave_target",
               (new Option)
                   ->set("in", *this)
                   ->set("target", target),
               js_options);
}

Image Image::globalbalance(emscripten::val js_options) const
{
    Image out;

    this->call("globalbalance",
               (new Option)
                   ->set("in", *this)
                   ->set("out", &out),
               js_options);

    return out;
}

Image Image::gravity(emscripten::val direction, int width, int height, emscripten::val js_options) const
{
    Image out;

    this->call("gravity",
               (new Option)
                   ->set("in", *this)
                   ->set("out", &out)
                   ->set("direction", VIPS_TYPE_COMPASS_DIRECTION, direction)
                   ->set("width", width)
                   ->set("height", height),
               js_options);

    return out;
}

Image Image::grid(int tile_height, int across, int down) const
{
    Image out;

    this->call("grid",
               (new Option)
                   ->set("in", *this)
                   ->set("out", &out)
                   ->set("tile_height", tile_height)
                   ->set("across", across)
                   ->set("down", down));

    return out;
}

void Image::heifsave(const std::string &filename, emscripten::val js_options) const
{
    this->call("heifsave",
               (new Option)
                   ->set("in", *this)
                   ->set("filename", filename),
               js_options);
}

emscripten::val Image::heifsave_buffer(emscripten::val js_options) const
{
    VipsBlob *buffer;

    this->call("heifsave_buffer",
               (new Option)
                   ->set("in", *this)
                   ->set("buffer", &buffer),
               js_options);

    emscripten::val result = BlobVal.new_(emscripten::typed_memory_view(
        VIPS_AREA(buffer)->length,
        reinterpret_cast<uint8_t *>(VIPS_AREA(buffer)->data)));
    vips_area_unref(VIPS_AREA(buffer));

    return result;
}

void Image::heifsave_target(const Target &target, emscripten::val js_options) const
{
    this->call("heifsave_target",
               (new Option)
                   ->set("in", *this)
                   ->set("target", target),
               js_options);
}

Image Image::hist_cum() const
{
    Image out;

    this->call("hist_cum",
               (new Option)
                   ->set("in", *this)
                   ->set("out", &out));

    return out;
}

double Image::hist_entropy() const
{
    double out;

    this->call("hist_entropy",
               (new Option)
                   ->set("in", *this)
                   ->set("out", &out));

    return out;
}

Image Image::hist_equal(emscripten::val js_options) const
{
    Image out;

    this->call("hist_equal",
               (new Option)
                   ->set("in", *this)
                   ->set("out", &out),
               js_options);

    return out;
}

Image Image::hist_find(emscripten::val js_options) const
{
    Image out;

    this->call("hist_find",
               (new Option)
                   ->set("in", *this)
                   ->set("out", &out),
               js_options);

    return out;
}

Image Image::hist_find_indexed(emscripten::val index, emscripten::val js_options) const
{
    Image out;

    this->call("hist_find_indexed",
               (new Option)
                   ->set("in", *this)
                   ->set("out", &out)
                   ->set("index", VIPS_TYPE_IMAGE, index, this),
               js_options);

    return out;
}

Image Image::hist_find_ndim(emscripten::val js_options) const
{
    Image out;

    this->call("hist_find_ndim",
               (new Option)
                   ->set("in", *this)
                   ->set("out", &out),
               js_options);

    return out;
}

bool Image::hist_ismonotonic() const
{
    bool monotonic;

    this->call("hist_ismonotonic",
               (new Option)
                   ->set("in", *this)
                   ->set("monotonic", &monotonic));

    return monotonic;
}

Image Image::hist_local(int width, int height, emscripten::val js_options) const
{
    Image out;

    this->call("hist_local",
               (new Option)
                   ->set("in", *this)
                   ->set("out", &out)
                   ->set("width", width)
                   ->set("height", height),
               js_options);

    return out;
}

Image Image::hist_match(emscripten::val ref) const
{
    Image out;

    this->call("hist_match",
               (new Option)
                   ->set("in", *this)
                   ->set("out", &out)
                   ->set("ref", VIPS_TYPE_IMAGE, ref, this));

    return out;
}

Image Image::hist_norm() const
{
    Image out;

    this->call("hist_norm",
               (new Option)
                   ->set("in", *this)
                   ->set("out", &out));

    return out;
}

Image Image::hist_plot() const
{
    Image out;

    this->call("hist_plot",
               (new Option)
                   ->set("in", *this)
                   ->set("out", &out));

    return out;
}

Image Image::hough_circle(emscripten::val js_options) const
{
    Image out;

    this->call("hough_circle",
               (new Option)
                   ->set("in", *this)
                   ->set("out", &out),
               js_options);

    return out;
}

Image Image::hough_line(emscripten::val js_options) const
{
    Image out;

    this->call("hough_line",
               (new Option)
                   ->set("in", *this)
                   ->set("out", &out),
               js_options);

    return out;
}

Image Image::icc_export(emscripten::val js_options) const
{
    Image out;

    this->call("icc_export",
               (new Option)
                   ->set("in", *this)
                   ->set("out", &out),
               js_options);

    return out;
}

Image Image::icc_import(emscripten::val js_options) const
{
    Image out;

    this->call("icc_import",
               (new Option)
                   ->set("in", *this)
                   ->set("out", &out),
               js_options);

    return out;
}

Image Image::icc_transform(const std::string &output_profile, emscripten::val js_options) const
{
    Image out;

    this->call("icc_transform",
               (new Option)
                   ->set("in", *this)
                   ->set("out", &out)
                   ->set("output_profile", output_profile),
               js_options);

    return out;
}

Image Image::insert(emscripten::val sub, int x, int y, emscripten::val js_options) const
{
    Image out;

    this->call("insert",
               (new Option)
                   ->set("main", *this)
                   ->set("out", &out)
                   ->set("sub", VIPS_TYPE_IMAGE, sub, this)
                   ->set("x", x)
                   ->set("y", y),
               js_options);

    return out;
}

Image Image::invert() const
{
    Image out;

    this->call("invert",
               (new Option)
                   ->set("in", *this)
                   ->set("out", &out));

    return out;
}

Image Image::invertlut(emscripten::val js_options) const
{
    Image out;

    this->call("invertlut",
               (new Option)
                   ->set("in", *this)
                   ->set("out", &out),
               js_options);

    return out;
}

Image Image::invfft(emscripten::val js_options) const
{
    Image out;

    this->call("invfft",
               (new Option)
                   ->set("in", *this)
                   ->set("out", &out),
               js_options);

    return out;
}

Image Image::join(emscripten::val in2, emscripten::val direction, emscripten::val js_options) const
{
    Image out;

    this->call("join",
               (new Option)
                   ->set("in1", *this)
                   ->set("out", &out)
                   ->set("in2", VIPS_TYPE_IMAGE, in2, this)
                   ->set("direction", VIPS_TYPE_DIRECTION, direction),
               js_options);

    return out;
}

void Image::jp2ksave(const std::string &filename, emscripten::val js_options) const
{
    this->call("jp2ksave",
               (new Option)
                   ->set("in", *this)
                   ->set("filename", filename),
               js_options);
}

emscripten::val Image::jp2ksave_buffer(emscripten::val js_options) const
{
    VipsBlob *buffer;

    this->call("jp2ksave_buffer",
               (new Option)
                   ->set("in", *this)
                   ->set("buffer", &buffer),
               js_options);

    emscripten::val result = BlobVal.new_(emscripten::typed_memory_view(
        VIPS_AREA(buffer)->length,
        reinterpret_cast<uint8_t *>(VIPS_AREA(buffer)->data)));
    vips_area_unref(VIPS_AREA(buffer));

    return result;
}

void Image::jp2ksave_target(const Target &target, emscripten::val js_options) const
{
    this->call("jp2ksave_target",
               (new Option)
                   ->set("in", *this)
                   ->set("target", target),
               js_options);
}

void Image::jpegsave(const std::string &filename, emscripten::val js_options) const
{
    this->call("jpegsave",
               (new Option)
                   ->set("in", *this)
                   ->set("filename", filename),
               js_options);
}

emscripten::val Image::jpegsave_buffer(emscripten::val js_options) const
{
    VipsBlob *buffer;

    this->call("jpegsave_buffer",
               (new Option)
                   ->set("in", *this)
                   ->set("buffer", &buffer),
               js_options);

    emscripten::val result = BlobVal.new_(emscripten::typed_memory_view(
        VIPS_AREA(buffer)->length,
        reinterpret_cast<uint8_t *>(VIPS_AREA(buffer)->data)));
    vips_area_unref(VIPS_AREA(buffer));

    return result;
}

void Image::jpegsave_mime(emscripten::val js_options) const
{
    this->call("jpegsave_mime",
               (new Option)
                   ->set("in", *this),
               js_options);
}

void Image::jpegsave_target(const Target &target, emscripten::val js_options) const
{
    this->call("jpegsave_target",
               (new Option)
                   ->set("in", *this)
                   ->set("target", target),
               js_options);
}

void Image::jxlsave(const std::string &filename, emscripten::val js_options) const
{
    this->call("jxlsave",
               (new Option)
                   ->set("in", *this)
                   ->set("filename", filename),
               js_options);
}

emscripten::val Image::jxlsave_buffer(emscripten::val js_options) const
{
    VipsBlob *buffer;

    this->call("jxlsave_buffer",
               (new Option)
                   ->set("in", *this)
                   ->set("buffer", &buffer),
               js_options);

    emscripten::val result = BlobVal.new_(emscripten::typed_memory_view(
        VIPS_AREA(buffer)->length,
        reinterpret_cast<uint8_t *>(VIPS_AREA(buffer)->data)));
    vips_area_unref(VIPS_AREA(buffer));

    return result;
}

void Image::jxlsave_target(const Target &target, emscripten::val js_options) const
{
    this->call("jxlsave_target",
               (new Option)
                   ->set("in", *this)
                   ->set("target", target),
               js_options);
}

Image Image::labelregions(emscripten::val js_options) const
{
    Image mask;

    this->call("labelregions",
               (new Option)
                   ->set("in", *this)
                   ->set("mask", &mask),
               js_options);

    return mask;
}

Image Image::linear(const std::vector<double> &a, const std::vector<double> &b, emscripten::val js_options) const
{
    Image out;

    this->call("linear",
               (new Option)
                   ->set("in", *this)
                   ->set("out", &out)
                   ->set("a", a)
                   ->set("b", b),
               js_options);

    return out;
}

Image Image::linecache(emscripten::val js_options) const
{
    Image out;

    this->call("linecache",
               (new Option)
                   ->set("in", *this)
                   ->set("out", &out),
               js_options);

    return out;
}

void Image::magicksave(const std::string &filename, emscripten::val js_options) const
{
    this->call("magicksave",
               (new Option)
                   ->set("in", *this)
                   ->set("filename", filename),
               js_options);
}

emscripten::val Image::magicksave_buffer(emscripten::val js_options) const
{
    VipsBlob *buffer;

    this->call("magicksave_buffer",
               (new Option)
                   ->set("in", *this)
                   ->set("buffer", &buffer),
               js_options);

    emscripten::val result = BlobVal.new_(emscripten::typed_memory_view(
        VIPS_AREA(buffer)->length,
        reinterpret_cast<uint8_t *>(VIPS_AREA(buffer)->data)));
    vips_area_unref(VIPS_AREA(buffer));

    return result;
}

Image Image::mapim(emscripten::val index, emscripten::val js_options) const
{
    Image out;

    this->call("mapim",
               (new Option)
                   ->set("in", *this)
                   ->set("out", &out)
                   ->set("index", VIPS_TYPE_IMAGE, index, this),
               js_options);

    return out;
}

Image Image::maplut(emscripten::val lut, emscripten::val js_options) const
{
    Image out;

    this->call("maplut",
               (new Option)
                   ->set("in", *this)
                   ->set("out", &out)
                   ->set("lut", VIPS_TYPE_IMAGE, lut, this),
               js_options);

    return out;
}

Image Image::match(emscripten::val sec, int xr1, int yr1, int xs1, int ys1, int xr2, int yr2, int xs2, int ys2, emscripten::val js_options) const
{
    Image out;

    this->call("match",
               (new Option)
                   ->set("ref", *this)
                   ->set("out", &out)
                   ->set("sec", VIPS_TYPE_IMAGE, sec, this)
                   ->set("xr1", xr1)
                   ->set("yr1", yr1)
                   ->set("xs1", xs1)
                   ->set("ys1", ys1)
                   ->set("xr2", xr2)
                   ->set("yr2", yr2)
                   ->set("xs2", xs2)
                   ->set("ys2", ys2),
               js_options);

    return out;
}

Image Image::math(emscripten::val math) const
{
    Image out;

    this->call("math",
               (new Option)
                   ->set("in", *this)
                   ->set("out", &out)
                   ->set("math", VIPS_TYPE_OPERATION_MATH, math));

    return out;
}

Image Image::math2_const(emscripten::val math2, const std::vector<double> &c) const
{
    Image out;

    this->call("math2_const",
               (new Option)
                   ->set("in", *this)
                   ->set("out", &out)
                   ->set("math2", VIPS_TYPE_OPERATION_MATH2, math2)
                   ->set("c", c));

    return out;
}

Image Image::matrixinvert() const
{
    Image out;

    this->call("matrixinvert",
               (new Option)
                   ->set("in", *this)
                   ->set("out", &out));

    return out;
}

void Image::matrixprint(emscripten::val js_options) const
{
    this->call("matrixprint",
               (new Option)
                   ->set("in", *this),
               js_options);
}

void Image::matrixsave(const std::string &filename, emscripten::val js_options) const
{
    this->call("matrixsave",
               (new Option)
                   ->set("in", *this)
                   ->set("filename", filename),
               js_options);
}

void Image::matrixsave_target(const Target &target, emscripten::val js_options) const
{
    this->call("matrixsave_target",
               (new Option)
                   ->set("in", *this)
                   ->set("target", target),
               js_options);
}

double Image::max(emscripten::val js_options) const
{
    double out;

    this->call("max",
               (new Option)
                   ->set("in", *this)
                   ->set("out", &out),
               js_options);

    return out;
}

Image Image::maxpair(emscripten::val right) const
{
    Image out;

    this->call("maxpair",
               (new Option)
                   ->set("left", *this)
                   ->set("out", &out)
                   ->set("right", VIPS_TYPE_IMAGE, right, this));

    return out;
}

Image Image::measure(int h, int v, emscripten::val js_options) const
{
    Image out;

    this->call("measure",
               (new Option)
                   ->set("in", *this)
                   ->set("out", &out)
                   ->set("h", h)
                   ->set("v", v),
               js_options);

    return out;
}

Image Image::merge(emscripten::val sec, emscripten::val direction, int dx, int dy, emscripten::val js_options) const
{
    Image out;

    this->call("merge",
               (new Option)
                   ->set("ref", *this)
                   ->set("out", &out)
                   ->set("sec", VIPS_TYPE_IMAGE, sec, this)
                   ->set("direction", VIPS_TYPE_DIRECTION, direction)
                   ->set("dx", dx)
                   ->set("dy", dy),
               js_options);

    return out;
}

double Image::min(emscripten::val js_options) const
{
    double out;

    this->call("min",
               (new Option)
                   ->set("in", *this)
                   ->set("out", &out),
               js_options);

    return out;
}

Image Image::minpair(emscripten::val right) const
{
    Image out;

    this->call("minpair",
               (new Option)
                   ->set("left", *this)
                   ->set("out", &out)
                   ->set("right", VIPS_TYPE_IMAGE, right, this));

    return out;
}

Image Image::morph(emscripten::val mask, emscripten::val morph) const
{
    Image out;

    this->call("morph",
               (new Option)
                   ->set("in", *this)
                   ->set("out", &out)
                   ->set("mask", VIPS_TYPE_IMAGE, mask, this)
                   ->set("morph", VIPS_TYPE_OPERATION_MORPHOLOGY, morph));

    return out;
}

Image Image::mosaic(emscripten::val sec, emscripten::val direction, int xref, int yref, int xsec, int ysec, emscripten::val js_options) const
{
    Image out;

    this->call("mosaic",
               (new Option)
                   ->set("ref", *this)
                   ->set("out", &out)
                   ->set("sec", VIPS_TYPE_IMAGE, sec, this)
                   ->set("direction", VIPS_TYPE_DIRECTION, direction)
                   ->set("xref", xref)
                   ->set("yref", yref)
                   ->set("xsec", xsec)
                   ->set("ysec", ysec),
               js_options);

    return out;
}

Image Image::mosaic1(emscripten::val sec, emscripten::val direction, int xr1, int yr1, int xs1, int ys1, int xr2, int yr2, int xs2, int ys2, emscripten::val js_options) const
{
    Image out;

    this->call("mosaic1",
               (new Option)
                   ->set("ref", *this)
                   ->set("out", &out)
                   ->set("sec", VIPS_TYPE_IMAGE, sec, this)
                   ->set("direction", VIPS_TYPE_DIRECTION, direction)
                   ->set("xr1", xr1)
                   ->set("yr1", yr1)
                   ->set("xs1", xs1)
                   ->set("ys1", ys1)
                   ->set("xr2", xr2)
                   ->set("yr2", yr2)
                   ->set("xs2", xs2)
                   ->set("ys2", ys2),
               js_options);

    return out;
}

Image Image::msb(emscripten::val js_options) const
{
    Image out;

    this->call("msb",
               (new Option)
                   ->set("in", *this)
                   ->set("out", &out),
               js_options);

    return out;
}

void Image::niftisave(const std::string &filename, emscripten::val js_options) const
{
    this->call("niftisave",
               (new Option)
                   ->set("in", *this)
                   ->set("filename", filename),
               js_options);
}

int Image::percent(double percent) const
{
    int threshold;

    this->call("percent",
               (new Option)
                   ->set("in", *this)
                   ->set("threshold", &threshold)
                   ->set("percent", percent));

    return threshold;
}

Image Image::phasecor(emscripten::val in2) const
{
    Image out;

    this->call("phasecor",
               (new Option)
                   ->set("in", *this)
                   ->set("out", &out)
                   ->set("in2", VIPS_TYPE_IMAGE, in2, this));

    return out;
}

void Image::pngsave(const std::string &filename, emscripten::val js_options) const
{
    this->call("pngsave",
               (new Option)
                   ->set("in", *this)
                   ->set("filename", filename),
               js_options);
}

emscripten::val Image::pngsave_buffer(emscripten::val js_options) const
{
    VipsBlob *buffer;

    this->call("pngsave_buffer",
               (new Option)
                   ->set("in", *this)
                   ->set("buffer", &buffer),
               js_options);

    emscripten::val result = BlobVal.new_(emscripten::typed_memory_view(
        VIPS_AREA(buffer)->length,
        reinterpret_cast<uint8_t *>(VIPS_AREA(buffer)->data)));
    vips_area_unref(VIPS_AREA(buffer));

    return result;
}

void Image::pngsave_target(const Target &target, emscripten::val js_options) const
{
    this->call("pngsave_target",
               (new Option)
                   ->set("in", *this)
                   ->set("target", target),
               js_options);
}

void Image::ppmsave(const std::string &filename, emscripten::val js_options) const
{
    this->call("ppmsave",
               (new Option)
                   ->set("in", *this)
                   ->set("filename", filename),
               js_options);
}

void Image::ppmsave_target(const Target &target, emscripten::val js_options) const
{
    this->call("ppmsave_target",
               (new Option)
                   ->set("in", *this)
                   ->set("target", target),
               js_options);
}

Image Image::premultiply(emscripten::val js_options) const
{
    Image out;

    this->call("premultiply",
               (new Option)
                   ->set("in", *this)
                   ->set("out", &out),
               js_options);

    return out;
}

Image Image::prewitt() const
{
    Image out;

    this->call("prewitt",
               (new Option)
                   ->set("in", *this)
                   ->set("out", &out));

    return out;
}

Image Image::profile(Image *rows) const
{
    Image columns;

    this->call("profile",
               (new Option)
                   ->set("in", *this)
                   ->set("columns", &columns)
                   ->set("rows", rows));

    return columns;
}

Image Image::project(Image *rows) const
{
    Image columns;

    this->call("project",
               (new Option)
                   ->set("in", *this)
                   ->set("columns", &columns)
                   ->set("rows", rows));

    return columns;
}

Image Image::quadratic(emscripten::val coeff, emscripten::val js_options) const
{
    Image out;

    this->call("quadratic",
               (new Option)
                   ->set("in", *this)
                   ->set("out", &out)
                   ->set("coeff", VIPS_TYPE_IMAGE, coeff, this),
               js_options);

    return out;
}

Image Image::rad2float() const
{
    Image out;

    this->call("rad2float",
               (new Option)
                   ->set("in", *this)
                   ->set("out", &out));

    return out;
}

void Image::radsave(const std::string &filename, emscripten::val js_options) const
{
    this->call("radsave",
               (new Option)
                   ->set("in", *this)
                   ->set("filename", filename),
               js_options);
}

emscripten::val Image::radsave_buffer(emscripten::val js_options) const
{
    VipsBlob *buffer;

    this->call("radsave_buffer",
               (new Option)
                   ->set("in", *this)
                   ->set("buffer", &buffer),
               js_options);

    emscripten::val result = BlobVal.new_(emscripten::typed_memory_view(
        VIPS_AREA(buffer)->length,
        reinterpret_cast<uint8_t *>(VIPS_AREA(buffer)->data)));
    vips_area_unref(VIPS_AREA(buffer));

    return result;
}

void Image::radsave_target(const Target &target, emscripten::val js_options) const
{
    this->call("radsave_target",
               (new Option)
                   ->set("in", *this)
                   ->set("target", target),
               js_options);
}

Image Image::rank(int width, int height, int index) const
{
    Image out;

    this->call("rank",
               (new Option)
                   ->set("in", *this)
                   ->set("out", &out)
                   ->set("width", width)
                   ->set("height", height)
                   ->set("index", index));

    return out;
}

void Image::rawsave(const std::string &filename, emscripten::val js_options) const
{
    this->call("rawsave",
               (new Option)
                   ->set("in", *this)
                   ->set("filename", filename),
               js_options);
}

emscripten::val Image::rawsave_buffer(emscripten::val js_options) const
{
    VipsBlob *buffer;

    this->call("rawsave_buffer",
               (new Option)
                   ->set("in", *this)
                   ->set("buffer", &buffer),
               js_options);

    emscripten::val result = BlobVal.new_(emscripten::typed_memory_view(
        VIPS_AREA(buffer)->length,
        reinterpret_cast<uint8_t *>(VIPS_AREA(buffer)->data)));
    vips_area_unref(VIPS_AREA(buffer));

    return result;
}

void Image::rawsave_target(const Target &target, emscripten::val js_options) const
{
    this->call("rawsave_target",
               (new Option)
                   ->set("in", *this)
                   ->set("target", target),
               js_options);
}

Image Image::recomb(emscripten::val m) const
{
    Image out;

    this->call("recomb",
               (new Option)
                   ->set("in", *this)
                   ->set("out", &out)
                   ->set("m", VIPS_TYPE_IMAGE, m, this));

    return out;
}

Image Image::reduce(double hshrink, double vshrink, emscripten::val js_options) const
{
    Image out;

    this->call("reduce",
               (new Option)
                   ->set("in", *this)
                   ->set("out", &out)
                   ->set("hshrink", hshrink)
                   ->set("vshrink", vshrink),
               js_options);

    return out;
}

Image Image::reduceh(double hshrink, emscripten::val js_options) const
{
    Image out;

    this->call("reduceh",
               (new Option)
                   ->set("in", *this)
                   ->set("out", &out)
                   ->set("hshrink", hshrink),
               js_options);

    return out;
}

Image Image::reducev(double vshrink, emscripten::val js_options) const
{
    Image out;

    this->call("reducev",
               (new Option)
                   ->set("in", *this)
                   ->set("out", &out)
                   ->set("vshrink", vshrink),
               js_options);

    return out;
}

Image Image::relational_const(emscripten::val relational, const std::vector<double> &c) const
{
    Image out;

    this->call("relational_const",
               (new Option)
                   ->set("in", *this)
                   ->set("out", &out)
                   ->set("relational", VIPS_TYPE_OPERATION_RELATIONAL, relational)
                   ->set("c", c));

    return out;
}

Image Image::remainder_const(const std::vector<double> &c) const
{
    Image out;

    this->call("remainder_const",
               (new Option)
                   ->set("in", *this)
                   ->set("out", &out)
                   ->set("c", c));

    return out;
}

Image Image::replicate(int across, int down) const
{
    Image out;

    this->call("replicate",
               (new Option)
                   ->set("in", *this)
                   ->set("out", &out)
                   ->set("across", across)
                   ->set("down", down));

    return out;
}

Image Image::resize(double scale, emscripten::val js_options) const
{
    Image out;

    this->call("resize",
               (new Option)
                   ->set("in", *this)
                   ->set("out", &out)
                   ->set("scale", scale),
               js_options);

    return out;
}

Image Image::rot(emscripten::val angle) const
{
    Image out;

    this->call("rot",
               (new Option)
                   ->set("in", *this)
                   ->set("out", &out)
                   ->set("angle", VIPS_TYPE_ANGLE, angle));

    return out;
}

Image Image::rot45(emscripten::val js_options) const
{
    Image out;

    this->call("rot45",
               (new Option)
                   ->set("in", *this)
                   ->set("out", &out),
               js_options);

    return out;
}

Image Image::rotate(double angle, emscripten::val js_options) const
{
    Image out;

    this->call("rotate",
               (new Option)
                   ->set("in", *this)
                   ->set("out", &out)
                   ->set("angle", angle),
               js_options);

    return out;
}

Image Image::round(emscripten::val round) const
{
    Image out;

    this->call("round",
               (new Option)
                   ->set("in", *this)
                   ->set("out", &out)
                   ->set("round", VIPS_TYPE_OPERATION_ROUND, round));

    return out;
}

Image Image::sRGB2HSV() const
{
    Image out;

    this->call("sRGB2HSV",
               (new Option)
                   ->set("in", *this)
                   ->set("out", &out));

    return out;
}

Image Image::sRGB2scRGB() const
{
    Image out;

    this->call("sRGB2scRGB",
               (new Option)
                   ->set("in", *this)
                   ->set("out", &out));

    return out;
}

Image Image::scRGB2BW(emscripten::val js_options) const
{
    Image out;

    this->call("scRGB2BW",
               (new Option)
                   ->set("in", *this)
                   ->set("out", &out),
               js_options);

    return out;
}

Image Image::scRGB2XYZ() const
{
    Image out;

    this->call("scRGB2XYZ",
               (new Option)
                   ->set("in", *this)
                   ->set("out", &out));

    return out;
}

Image Image::scRGB2sRGB(emscripten::val js_options) const
{
    Image out;

    this->call("scRGB2sRGB",
               (new Option)
                   ->set("in", *this)
                   ->set("out", &out),
               js_options);

    return out;
}

Image Image::scale(emscripten::val js_options) const
{
    Image out;

    this->call("scale",
               (new Option)
                   ->set("in", *this)
                   ->set("out", &out),
               js_options);

    return out;
}

Image Image::scharr() const
{
    Image out;

    this->call("scharr",
               (new Option)
                   ->set("in", *this)
                   ->set("out", &out));

    return out;
}

Image Image::sequential(emscripten::val js_options) const
{
    Image out;

    this->call("sequential",
               (new Option)
                   ->set("in", *this)
                   ->set("out", &out),
               js_options);

    return out;
}

Image Image::sharpen(emscripten::val js_options) const
{
    Image out;

    this->call("sharpen",
               (new Option)
                   ->set("in", *this)
                   ->set("out", &out),
               js_options);

    return out;
}

Image Image::shrink(double hshrink, double vshrink, emscripten::val js_options) const
{
    Image out;

    this->call("shrink",
               (new Option)
                   ->set("in", *this)
                   ->set("out", &out)
                   ->set("hshrink", hshrink)
                   ->set("vshrink", vshrink),
               js_options);

    return out;
}

Image Image::shrinkh(int hshrink, emscripten::val js_options) const
{
    Image out;

    this->call("shrinkh",
               (new Option)
                   ->set("in", *this)
                   ->set("out", &out)
                   ->set("hshrink", hshrink),
               js_options);

    return out;
}

Image Image::shrinkv(int vshrink, emscripten::val js_options) const
{
    Image out;

    this->call("shrinkv",
               (new Option)
                   ->set("in", *this)
                   ->set("out", &out)
                   ->set("vshrink", vshrink),
               js_options);

    return out;
}

Image Image::sign() const
{
    Image out;

    this->call("sign",
               (new Option)
                   ->set("in", *this)
                   ->set("out", &out));

    return out;
}

Image Image::similarity(emscripten::val js_options) const
{
    Image out;

    this->call("similarity",
               (new Option)
                   ->set("in", *this)
                   ->set("out", &out),
               js_options);

    return out;
}

Image Image::smartcrop(int width, int height, emscripten::val js_options) const
{
    Image out;

    this->call("smartcrop",
               (new Option)
                   ->set("input", *this)
                   ->set("out", &out)
                   ->set("width", width)
                   ->set("height", height),
               js_options);

    return out;
}

Image Image::sobel() const
{
    Image out;

    this->call("sobel",
               (new Option)
                   ->set("in", *this)
                   ->set("out", &out));

    return out;
}

Image Image::spcor(emscripten::val ref) const
{
    Image out;

    this->call("spcor",
               (new Option)
                   ->set("in", *this)
                   ->set("out", &out)
                   ->set("ref", VIPS_TYPE_IMAGE, ref, this));

    return out;
}

Image Image::spectrum() const
{
    Image out;

    this->call("spectrum",
               (new Option)
                   ->set("in", *this)
                   ->set("out", &out));

    return out;
}

Image Image::stats() const
{
    Image out;

    this->call("stats",
               (new Option)
                   ->set("in", *this)
                   ->set("out", &out));

    return out;
}

Image Image::stdif(int width, int height, emscripten::val js_options) const
{
    Image out;

    this->call("stdif",
               (new Option)
                   ->set("in", *this)
                   ->set("out", &out)
                   ->set("width", width)
                   ->set("height", height),
               js_options);

    return out;
}

Image Image::subsample(int xfac, int yfac, emscripten::val js_options) const
{
    Image out;

    this->call("subsample",
               (new Option)
                   ->set("input", *this)
                   ->set("out", &out)
                   ->set("xfac", xfac)
                   ->set("yfac", yfac),
               js_options);

    return out;
}

Image Image::thumbnail_image(int width, emscripten::val js_options) const
{
    Image out;

    this->call("thumbnail_image",
               (new Option)
                   ->set("in", *this)
                   ->set("out", &out)
                   ->set("width", width),
               js_options);

    return out;
}

void Image::tiffsave(const std::string &filename, emscripten::val js_options) const
{
    this->call("tiffsave",
               (new Option)
                   ->set("in", *this)
                   ->set("filename", filename),
               js_options);
}

emscripten::val Image::tiffsave_buffer(emscripten::val js_options) const
{
    VipsBlob *buffer;

    this->call("tiffsave_buffer",
               (new Option)
                   ->set("in", *this)
                   ->set("buffer", &buffer),
               js_options);

    emscripten::val result = BlobVal.new_(emscripten::typed_memory_view(
        VIPS_AREA(buffer)->length,
        reinterpret_cast<uint8_t *>(VIPS_AREA(buffer)->data)));
    vips_area_unref(VIPS_AREA(buffer));

    return result;
}

void Image::tiffsave_target(const Target &target, emscripten::val js_options) const
{
    this->call("tiffsave_target",
               (new Option)
                   ->set("in", *this)
                   ->set("target", target),
               js_options);
}

Image Image::tilecache(emscripten::val js_options) const
{
    Image out;

    this->call("tilecache",
               (new Option)
                   ->set("in", *this)
                   ->set("out", &out),
               js_options);

    return out;
}

Image Image::transpose3d(emscripten::val js_options) const
{
    Image out;

    this->call("transpose3d",
               (new Option)
                   ->set("in", *this)
                   ->set("out", &out),
               js_options);

    return out;
}

Image Image::unpremultiply(emscripten::val js_options) const
{
    Image out;

    this->call("unpremultiply",
               (new Option)
                   ->set("in", *this)
                   ->set("out", &out),
               js_options);

    return out;
}

void Image::vipssave(const std::string &filename, emscripten::val js_options) const
{
    this->call("vipssave",
               (new Option)
                   ->set("in", *this)
                   ->set("filename", filename),
               js_options);
}

void Image::vipssave_target(const Target &target, emscripten::val js_options) const
{
    this->call("vipssave_target",
               (new Option)
                   ->set("in", *this)
                   ->set("target", target),
               js_options);
}

void Image::webpsave(const std::string &filename, emscripten::val js_options) const
{
    this->call("webpsave",
               (new Option)
                   ->set("in", *this)
                   ->set("filename", filename),
               js_options);
}

emscripten::val Image::webpsave_buffer(emscripten::val js_options) const
{
    VipsBlob *buffer;

    this->call("webpsave_buffer",
               (new Option)
                   ->set("in", *this)
                   ->set("buffer", &buffer),
               js_options);

    emscripten::val result = BlobVal.new_(emscripten::typed_memory_view(
        VIPS_AREA(buffer)->length,
        reinterpret_cast<uint8_t *>(VIPS_AREA(buffer)->data)));
    vips_area_unref(VIPS_AREA(buffer));

    return result;
}

void Image::webpsave_mime(emscripten::val js_options) const
{
    this->call("webpsave_mime",
               (new Option)
                   ->set("in", *this),
               js_options);
}

void Image::webpsave_target(const Target &target, emscripten::val js_options) const
{
    this->call("webpsave_target",
               (new Option)
                   ->set("in", *this)
                   ->set("target", target),
               js_options);
}

Image Image::wrap(emscripten::val js_options) const
{
    Image out;

    this->call("wrap",
               (new Option)
                   ->set("in", *this)
                   ->set("out", &out),
               js_options);

    return out;
}

Image Image::zoom(int xfac, int yfac) const
{
    Image out;

    this->call("zoom",
               (new Option)
                   ->set("input", *this)
                   ->set("out", &out)
                   ->set("xfac", xfac)
                   ->set("yfac", yfac));

    return out;
}
