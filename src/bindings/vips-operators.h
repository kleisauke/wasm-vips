/**
 * This file was generated automatically. Do not edit!
 */


/**
 * Load an analyze6 image.
 * @param filename Filename to load from.
 * @param js_options Optional options.
 * @return Output image.
 */
static Image analyzeload(const std::string &filename, emscripten::val js_options = emscripten::val::null());

/**
 * Join an array of images.
 * @param in Array of input images.
 * @param js_options Optional options.
 * @return Output image.
 */
static Image arrayjoin(emscripten::val in, emscripten::val js_options = emscripten::val::null());

/**
 * Bandwise join a set of images.
 * @param in Array of input images.
 * @return Output image.
 */
static Image bandjoin(emscripten::val in);

/**
 * Band-wise rank of a set of images.
 * @param in Array of input images.
 * @param js_options Optional options.
 * @return Output image.
 */
static Image bandrank(emscripten::val in, emscripten::val js_options = emscripten::val::null());

/**
 * Make a black image.
 * @param width Image width in pixels.
 * @param height Image height in pixels.
 * @param js_options Optional options.
 * @return Output image.
 */
static Image black(int width, int height, emscripten::val js_options = emscripten::val::null());

/**
 * Load csv.
 * @param filename Filename to load from.
 * @param js_options Optional options.
 * @return Output image.
 */
static Image csvload(const std::string &filename, emscripten::val js_options = emscripten::val::null());

/**
 * Load csv.
 * @param source Source to load from.
 * @param js_options Optional options.
 * @return Output image.
 */
static Image csvload_source(const Source &source, emscripten::val js_options = emscripten::val::null());

/**
 * Make an image showing the eye's spatial response.
 * @param width Image width in pixels.
 * @param height Image height in pixels.
 * @param js_options Optional options.
 * @return Output image.
 */
static Image eye(int width, int height, emscripten::val js_options = emscripten::val::null());

/**
 * Load a fits image.
 * @param filename Filename to load from.
 * @param js_options Optional options.
 * @return Output image.
 */
static Image fitsload(const std::string &filename, emscripten::val js_options = emscripten::val::null());

/**
 * Load fits from a source.
 * @param source Source to load from.
 * @param js_options Optional options.
 * @return Output image.
 */
static Image fitsload_source(const Source &source, emscripten::val js_options = emscripten::val::null());

/**
 * Make a fractal surface.
 * @param width Image width in pixels.
 * @param height Image height in pixels.
 * @param fractal_dimension Fractal dimension.
 * @return Output image.
 */
static Image fractsurf(int width, int height, double fractal_dimension);

/**
 * Make a gaussian image.
 * @param sigma Sigma of Gaussian.
 * @param min_ampl Minimum amplitude of Gaussian.
 * @param js_options Optional options.
 * @return Output image.
 */
static Image gaussmat(double sigma, double min_ampl, emscripten::val js_options = emscripten::val::null());

/**
 * Make a gaussnoise image.
 * @param width Image width in pixels.
 * @param height Image height in pixels.
 * @param js_options Optional options.
 * @return Output image.
 */
static Image gaussnoise(int width, int height, emscripten::val js_options = emscripten::val::null());

/**
 * Load gif with libnsgif.
 * @param filename Filename to load from.
 * @param js_options Optional options.
 * @return Output image.
 */
static Image gifload(const std::string &filename, emscripten::val js_options = emscripten::val::null());

/**
 * Load gif with libnsgif.
 * @param buffer Buffer to load from.
 * @param js_options Optional options.
 * @return Output image.
 */
static Image gifload_buffer(const std::string &buffer, emscripten::val js_options = emscripten::val::null());

/**
 * Load gif from source.
 * @param source Source to load from.
 * @param js_options Optional options.
 * @return Output image.
 */
static Image gifload_source(const Source &source, emscripten::val js_options = emscripten::val::null());

/**
 * Make a grey ramp image.
 * @param width Image width in pixels.
 * @param height Image height in pixels.
 * @param js_options Optional options.
 * @return Output image.
 */
static Image grey(int width, int height, emscripten::val js_options = emscripten::val::null());

/**
 * Load a heif image.
 * @param filename Filename to load from.
 * @param js_options Optional options.
 * @return Output image.
 */
static Image heifload(const std::string &filename, emscripten::val js_options = emscripten::val::null());

/**
 * Load a heif image.
 * @param buffer Buffer to load from.
 * @param js_options Optional options.
 * @return Output image.
 */
static Image heifload_buffer(const std::string &buffer, emscripten::val js_options = emscripten::val::null());

/**
 * Load a heif image.
 * @param source Source to load from.
 * @param js_options Optional options.
 * @return Output image.
 */
static Image heifload_source(const Source &source, emscripten::val js_options = emscripten::val::null());

/**
 * Make a 1d image where pixel values are indexes.
 * @param js_options Optional options.
 * @return Output image.
 */
static Image identity(emscripten::val js_options = emscripten::val::null());

/**
 * Load jpeg2000 image.
 * @param filename Filename to load from.
 * @param js_options Optional options.
 * @return Output image.
 */
static Image jp2kload(const std::string &filename, emscripten::val js_options = emscripten::val::null());

/**
 * Load jpeg2000 image.
 * @param buffer Buffer to load from.
 * @param js_options Optional options.
 * @return Output image.
 */
static Image jp2kload_buffer(const std::string &buffer, emscripten::val js_options = emscripten::val::null());

/**
 * Load jpeg2000 image.
 * @param source Source to load from.
 * @param js_options Optional options.
 * @return Output image.
 */
static Image jp2kload_source(const Source &source, emscripten::val js_options = emscripten::val::null());

/**
 * Load jpeg from file.
 * @param filename Filename to load from.
 * @param js_options Optional options.
 * @return Output image.
 */
static Image jpegload(const std::string &filename, emscripten::val js_options = emscripten::val::null());

/**
 * Load jpeg from buffer.
 * @param buffer Buffer to load from.
 * @param js_options Optional options.
 * @return Output image.
 */
static Image jpegload_buffer(const std::string &buffer, emscripten::val js_options = emscripten::val::null());

/**
 * Load image from jpeg source.
 * @param source Source to load from.
 * @param js_options Optional options.
 * @return Output image.
 */
static Image jpegload_source(const Source &source, emscripten::val js_options = emscripten::val::null());

/**
 * Load jpeg-xl image.
 * @param filename Filename to load from.
 * @param js_options Optional options.
 * @return Output image.
 */
static Image jxlload(const std::string &filename, emscripten::val js_options = emscripten::val::null());

/**
 * Load jpeg-xl image.
 * @param buffer Buffer to load from.
 * @param js_options Optional options.
 * @return Output image.
 */
static Image jxlload_buffer(const std::string &buffer, emscripten::val js_options = emscripten::val::null());

/**
 * Load jpeg-xl image.
 * @param source Source to load from.
 * @param js_options Optional options.
 * @return Output image.
 */
static Image jxlload_source(const Source &source, emscripten::val js_options = emscripten::val::null());

/**
 * Make a laplacian of gaussian image.
 * @param sigma Radius of Gaussian.
 * @param min_ampl Minimum amplitude of Gaussian.
 * @param js_options Optional options.
 * @return Output image.
 */
static Image logmat(double sigma, double min_ampl, emscripten::val js_options = emscripten::val::null());

/**
 * Load file with imagemagick.
 * @param filename Filename to load from.
 * @param js_options Optional options.
 * @return Output image.
 */
static Image magickload(const std::string &filename, emscripten::val js_options = emscripten::val::null());

/**
 * Load buffer with imagemagick.
 * @param buffer Buffer to load from.
 * @param js_options Optional options.
 * @return Output image.
 */
static Image magickload_buffer(const std::string &buffer, emscripten::val js_options = emscripten::val::null());

/**
 * Make a butterworth filter.
 * @param width Image width in pixels.
 * @param height Image height in pixels.
 * @param order Filter order.
 * @param frequency_cutoff Frequency cutoff.
 * @param amplitude_cutoff Amplitude cutoff.
 * @param js_options Optional options.
 * @return Output image.
 */
static Image mask_butterworth(int width, int height, double order, double frequency_cutoff, double amplitude_cutoff, emscripten::val js_options = emscripten::val::null());

/**
 * Make a butterworth_band filter.
 * @param width Image width in pixels.
 * @param height Image height in pixels.
 * @param order Filter order.
 * @param frequency_cutoff_x Frequency cutoff x.
 * @param frequency_cutoff_y Frequency cutoff y.
 * @param radius Radius of circle.
 * @param amplitude_cutoff Amplitude cutoff.
 * @param js_options Optional options.
 * @return Output image.
 */
static Image mask_butterworth_band(int width, int height, double order, double frequency_cutoff_x, double frequency_cutoff_y, double radius, double amplitude_cutoff, emscripten::val js_options = emscripten::val::null());

/**
 * Make a butterworth ring filter.
 * @param width Image width in pixels.
 * @param height Image height in pixels.
 * @param order Filter order.
 * @param frequency_cutoff Frequency cutoff.
 * @param amplitude_cutoff Amplitude cutoff.
 * @param ringwidth Ringwidth.
 * @param js_options Optional options.
 * @return Output image.
 */
static Image mask_butterworth_ring(int width, int height, double order, double frequency_cutoff, double amplitude_cutoff, double ringwidth, emscripten::val js_options = emscripten::val::null());

/**
 * Make fractal filter.
 * @param width Image width in pixels.
 * @param height Image height in pixels.
 * @param fractal_dimension Fractal dimension.
 * @param js_options Optional options.
 * @return Output image.
 */
static Image mask_fractal(int width, int height, double fractal_dimension, emscripten::val js_options = emscripten::val::null());

/**
 * Make a gaussian filter.
 * @param width Image width in pixels.
 * @param height Image height in pixels.
 * @param frequency_cutoff Frequency cutoff.
 * @param amplitude_cutoff Amplitude cutoff.
 * @param js_options Optional options.
 * @return Output image.
 */
static Image mask_gaussian(int width, int height, double frequency_cutoff, double amplitude_cutoff, emscripten::val js_options = emscripten::val::null());

/**
 * Make a gaussian filter.
 * @param width Image width in pixels.
 * @param height Image height in pixels.
 * @param frequency_cutoff_x Frequency cutoff x.
 * @param frequency_cutoff_y Frequency cutoff y.
 * @param radius Radius of circle.
 * @param amplitude_cutoff Amplitude cutoff.
 * @param js_options Optional options.
 * @return Output image.
 */
static Image mask_gaussian_band(int width, int height, double frequency_cutoff_x, double frequency_cutoff_y, double radius, double amplitude_cutoff, emscripten::val js_options = emscripten::val::null());

/**
 * Make a gaussian ring filter.
 * @param width Image width in pixels.
 * @param height Image height in pixels.
 * @param frequency_cutoff Frequency cutoff.
 * @param amplitude_cutoff Amplitude cutoff.
 * @param ringwidth Ringwidth.
 * @param js_options Optional options.
 * @return Output image.
 */
static Image mask_gaussian_ring(int width, int height, double frequency_cutoff, double amplitude_cutoff, double ringwidth, emscripten::val js_options = emscripten::val::null());

/**
 * Make an ideal filter.
 * @param width Image width in pixels.
 * @param height Image height in pixels.
 * @param frequency_cutoff Frequency cutoff.
 * @param js_options Optional options.
 * @return Output image.
 */
static Image mask_ideal(int width, int height, double frequency_cutoff, emscripten::val js_options = emscripten::val::null());

/**
 * Make an ideal band filter.
 * @param width Image width in pixels.
 * @param height Image height in pixels.
 * @param frequency_cutoff_x Frequency cutoff x.
 * @param frequency_cutoff_y Frequency cutoff y.
 * @param radius Radius of circle.
 * @param js_options Optional options.
 * @return Output image.
 */
static Image mask_ideal_band(int width, int height, double frequency_cutoff_x, double frequency_cutoff_y, double radius, emscripten::val js_options = emscripten::val::null());

/**
 * Make an ideal ring filter.
 * @param width Image width in pixels.
 * @param height Image height in pixels.
 * @param frequency_cutoff Frequency cutoff.
 * @param ringwidth Ringwidth.
 * @param js_options Optional options.
 * @return Output image.
 */
static Image mask_ideal_ring(int width, int height, double frequency_cutoff, double ringwidth, emscripten::val js_options = emscripten::val::null());

/**
 * Load mat from file.
 * @param filename Filename to load from.
 * @param js_options Optional options.
 * @return Output image.
 */
static Image matload(const std::string &filename, emscripten::val js_options = emscripten::val::null());

/**
 * Load matrix.
 * @param filename Filename to load from.
 * @param js_options Optional options.
 * @return Output image.
 */
static Image matrixload(const std::string &filename, emscripten::val js_options = emscripten::val::null());

/**
 * Load matrix.
 * @param source Source to load from.
 * @param js_options Optional options.
 * @return Output image.
 */
static Image matrixload_source(const Source &source, emscripten::val js_options = emscripten::val::null());

/**
 * Load nifti volume.
 * @param filename Filename to load from.
 * @param js_options Optional options.
 * @return Output image.
 */
static Image niftiload(const std::string &filename, emscripten::val js_options = emscripten::val::null());

/**
 * Load nifti volumes.
 * @param source Source to load from.
 * @param js_options Optional options.
 * @return Output image.
 */
static Image niftiload_source(const Source &source, emscripten::val js_options = emscripten::val::null());

/**
 * Load an openexr image.
 * @param filename Filename to load from.
 * @param js_options Optional options.
 * @return Output image.
 */
static Image openexrload(const std::string &filename, emscripten::val js_options = emscripten::val::null());

/**
 * Load file with openslide.
 * @param filename Filename to load from.
 * @param js_options Optional options.
 * @return Output image.
 */
static Image openslideload(const std::string &filename, emscripten::val js_options = emscripten::val::null());

/**
 * Load source with openslide.
 * @param source Source to load from.
 * @param js_options Optional options.
 * @return Output image.
 */
static Image openslideload_source(const Source &source, emscripten::val js_options = emscripten::val::null());

/**
 * Load pdf from file.
 * @param filename Filename to load from.
 * @param js_options Optional options.
 * @return Output image.
 */
static Image pdfload(const std::string &filename, emscripten::val js_options = emscripten::val::null());

/**
 * Load pdf from buffer.
 * @param buffer Buffer to load from.
 * @param js_options Optional options.
 * @return Output image.
 */
static Image pdfload_buffer(const std::string &buffer, emscripten::val js_options = emscripten::val::null());

/**
 * Load pdf from source.
 * @param source Source to load from.
 * @param js_options Optional options.
 * @return Output image.
 */
static Image pdfload_source(const Source &source, emscripten::val js_options = emscripten::val::null());

/**
 * Make a perlin noise image.
 * @param width Image width in pixels.
 * @param height Image height in pixels.
 * @param js_options Optional options.
 * @return Output image.
 */
static Image perlin(int width, int height, emscripten::val js_options = emscripten::val::null());

/**
 * Load png from file.
 * @param filename Filename to load from.
 * @param js_options Optional options.
 * @return Output image.
 */
static Image pngload(const std::string &filename, emscripten::val js_options = emscripten::val::null());

/**
 * Load png from buffer.
 * @param buffer Buffer to load from.
 * @param js_options Optional options.
 * @return Output image.
 */
static Image pngload_buffer(const std::string &buffer, emscripten::val js_options = emscripten::val::null());

/**
 * Load png from source.
 * @param source Source to load from.
 * @param js_options Optional options.
 * @return Output image.
 */
static Image pngload_source(const Source &source, emscripten::val js_options = emscripten::val::null());

/**
 * Load ppm from file.
 * @param filename Filename to load from.
 * @param js_options Optional options.
 * @return Output image.
 */
static Image ppmload(const std::string &filename, emscripten::val js_options = emscripten::val::null());

/**
 * Load ppm base class.
 * @param source Source to load from.
 * @param js_options Optional options.
 * @return Output image.
 */
static Image ppmload_source(const Source &source, emscripten::val js_options = emscripten::val::null());

/**
 * Load named icc profile.
 * @param name Profile name.
 * @return Loaded profile.
 */
static emscripten::val profile_load(const std::string &name);

/**
 * Load a radiance image from a file.
 * @param filename Filename to load from.
 * @param js_options Optional options.
 * @return Output image.
 */
static Image radload(const std::string &filename, emscripten::val js_options = emscripten::val::null());

/**
 * Load rad from buffer.
 * @param buffer Buffer to load from.
 * @param js_options Optional options.
 * @return Output image.
 */
static Image radload_buffer(const std::string &buffer, emscripten::val js_options = emscripten::val::null());

/**
 * Load rad from source.
 * @param source Source to load from.
 * @param js_options Optional options.
 * @return Output image.
 */
static Image radload_source(const Source &source, emscripten::val js_options = emscripten::val::null());

/**
 * Load raw data from a file.
 * @param filename Filename to load from.
 * @param width Image width in pixels.
 * @param height Image height in pixels.
 * @param bands Number of bands in image.
 * @param js_options Optional options.
 * @return Output image.
 */
static Image rawload(const std::string &filename, int width, int height, int bands, emscripten::val js_options = emscripten::val::null());

/**
 * Create an sdf image.
 * @param width Image width in pixels.
 * @param height Image height in pixels.
 * @param shape SDF shape to create.
 * @param js_options Optional options.
 * @return Output image.
 */
static Image sdf(int width, int height, emscripten::val shape, emscripten::val js_options = emscripten::val::null());

/**
 * Make a 2d sine wave.
 * @param width Image width in pixels.
 * @param height Image height in pixels.
 * @param js_options Optional options.
 * @return Output image.
 */
static Image sines(int width, int height, emscripten::val js_options = emscripten::val::null());

/**
 * Sum an array of images.
 * @param in Array of input images.
 * @return Output image.
 */
static Image sum(emscripten::val in);

/**
 * Load svg with rsvg.
 * @param filename Filename to load from.
 * @param js_options Optional options.
 * @return Output image.
 */
static Image svgload(const std::string &filename, emscripten::val js_options = emscripten::val::null());

/**
 * Load svg with rsvg.
 * @param buffer Buffer to load from.
 * @param js_options Optional options.
 * @return Output image.
 */
static Image svgload_buffer(const std::string &buffer, emscripten::val js_options = emscripten::val::null());

/**
 * Load svg from source.
 * @param source Source to load from.
 * @param js_options Optional options.
 * @return Output image.
 */
static Image svgload_source(const Source &source, emscripten::val js_options = emscripten::val::null());

/**
 * Find the index of the first non-zero pixel in tests.
 * @param tests Table of images to test.
 * @return Output image.
 */
static Image switch_image(emscripten::val tests);

/**
 * Run an external command.
 * @param cmd_format Command to run.
 * @param js_options Optional options.
 */
static void system(const std::string &cmd_format, emscripten::val js_options = emscripten::val::null());

/**
 * Make a text image.
 * @param text Text to render.
 * @param js_options Optional options.
 * @return Output image.
 */
static Image text(const std::string &text, emscripten::val js_options = emscripten::val::null());

/**
 * Generate thumbnail from file.
 * @param filename Filename to read from.
 * @param width Size to this width.
 * @param js_options Optional options.
 * @return Output image.
 */
static Image thumbnail(const std::string &filename, int width, emscripten::val js_options = emscripten::val::null());

/**
 * Generate thumbnail from buffer.
 * @param buffer Buffer to load from.
 * @param width Size to this width.
 * @param js_options Optional options.
 * @return Output image.
 */
static Image thumbnail_buffer(const std::string &buffer, int width, emscripten::val js_options = emscripten::val::null());

/**
 * Generate thumbnail from source.
 * @param source Source to load from.
 * @param width Size to this width.
 * @param js_options Optional options.
 * @return Output image.
 */
static Image thumbnail_source(const Source &source, int width, emscripten::val js_options = emscripten::val::null());

/**
 * Load tiff from file.
 * @param filename Filename to load from.
 * @param js_options Optional options.
 * @return Output image.
 */
static Image tiffload(const std::string &filename, emscripten::val js_options = emscripten::val::null());

/**
 * Load tiff from buffer.
 * @param buffer Buffer to load from.
 * @param js_options Optional options.
 * @return Output image.
 */
static Image tiffload_buffer(const std::string &buffer, emscripten::val js_options = emscripten::val::null());

/**
 * Load tiff from source.
 * @param source Source to load from.
 * @param js_options Optional options.
 * @return Output image.
 */
static Image tiffload_source(const Source &source, emscripten::val js_options = emscripten::val::null());

/**
 * Build a look-up table.
 * @param js_options Optional options.
 * @return Output image.
 */
static Image tonelut(emscripten::val js_options = emscripten::val::null());

/**
 * Load vips from file.
 * @param filename Filename to load from.
 * @param js_options Optional options.
 * @return Output image.
 */
static Image vipsload(const std::string &filename, emscripten::val js_options = emscripten::val::null());

/**
 * Load vips from source.
 * @param source Source to load from.
 * @param js_options Optional options.
 * @return Output image.
 */
static Image vipsload_source(const Source &source, emscripten::val js_options = emscripten::val::null());

/**
 * Load webp from file.
 * @param filename Filename to load from.
 * @param js_options Optional options.
 * @return Output image.
 */
static Image webpload(const std::string &filename, emscripten::val js_options = emscripten::val::null());

/**
 * Load webp from buffer.
 * @param buffer Buffer to load from.
 * @param js_options Optional options.
 * @return Output image.
 */
static Image webpload_buffer(const std::string &buffer, emscripten::val js_options = emscripten::val::null());

/**
 * Load webp from source.
 * @param source Source to load from.
 * @param js_options Optional options.
 * @return Output image.
 */
static Image webpload_source(const Source &source, emscripten::val js_options = emscripten::val::null());

/**
 * Make a worley noise image.
 * @param width Image width in pixels.
 * @param height Image height in pixels.
 * @param js_options Optional options.
 * @return Output image.
 */
static Image worley(int width, int height, emscripten::val js_options = emscripten::val::null());

/**
 * Make an image where pixel values are coordinates.
 * @param width Image width in pixels.
 * @param height Image height in pixels.
 * @param js_options Optional options.
 * @return Output image.
 */
static Image xyz(int width, int height, emscripten::val js_options = emscripten::val::null());

/**
 * Make a zone plate.
 * @param width Image width in pixels.
 * @param height Image height in pixels.
 * @param js_options Optional options.
 * @return Output image.
 */
static Image zone(int width, int height, emscripten::val js_options = emscripten::val::null());

/**
 * Transform lch to cmc.
 * @return Output image.
 */
Image CMC2LCh() const;

/**
 * Transform cmyk to xyz.
 * @return Output image.
 */
Image CMYK2XYZ() const;

/**
 * Transform hsv to srgb.
 * @return Output image.
 */
Image HSV2sRGB() const;

/**
 * Transform lch to cmc.
 * @return Output image.
 */
Image LCh2CMC() const;

/**
 * Transform lch to lab.
 * @return Output image.
 */
Image LCh2Lab() const;

/**
 * Transform lab to lch.
 * @return Output image.
 */
Image Lab2LCh() const;

/**
 * Transform float lab to labq coding.
 * @return Output image.
 */
Image Lab2LabQ() const;

/**
 * Transform float lab to signed short.
 * @return Output image.
 */
Image Lab2LabS() const;

/**
 * Transform cielab to xyz.
 * @param js_options Optional options.
 * @return Output image.
 */
Image Lab2XYZ(emscripten::val js_options = emscripten::val::null()) const;

/**
 * Unpack a labq image to float lab.
 * @return Output image.
 */
Image LabQ2Lab() const;

/**
 * Unpack a labq image to short lab.
 * @return Output image.
 */
Image LabQ2LabS() const;

/**
 * Convert a labq image to srgb.
 * @return Output image.
 */
Image LabQ2sRGB() const;

/**
 * Transform signed short lab to float.
 * @return Output image.
 */
Image LabS2Lab() const;

/**
 * Transform short lab to labq coding.
 * @return Output image.
 */
Image LabS2LabQ() const;

/**
 * Transform xyz to cmyk.
 * @return Output image.
 */
Image XYZ2CMYK() const;

/**
 * Transform xyz to lab.
 * @param js_options Optional options.
 * @return Output image.
 */
Image XYZ2Lab(emscripten::val js_options = emscripten::val::null()) const;

/**
 * Transform xyz to yxy.
 * @return Output image.
 */
Image XYZ2Yxy() const;

/**
 * Transform xyz to scrgb.
 * @return Output image.
 */
Image XYZ2scRGB() const;

/**
 * Transform yxy to xyz.
 * @return Output image.
 */
Image Yxy2XYZ() const;

/**
 * Absolute value of an image.
 * @return Output image.
 */
Image abs() const;

/**
 * Append an alpha channel.
 * @return Output image.
 */
Image addalpha() const;

/**
 * Affine transform of an image.
 * @param matrix Transformation matrix.
 * @param js_options Optional options.
 * @return Output image.
 */
Image affine(const std::vector<double> &matrix, emscripten::val js_options = emscripten::val::null()) const;

/**
 * Autorotate image by exif tag.
 * @param js_options Optional options.
 * @return Output image.
 */
Image autorot(emscripten::val js_options = emscripten::val::null()) const;

/**
 * Find image average.
 * @return Output value.
 */
double avg() const;

/**
 * Boolean operation across image bands.
 * @param boolean Boolean to perform.
 * @return Output image.
 */
Image bandbool(emscripten::val boolean) const;

/**
 * Fold up x axis into bands.
 * @param js_options Optional options.
 * @return Output image.
 */
Image bandfold(emscripten::val js_options = emscripten::val::null()) const;

/**
 * Band-wise average.
 * @return Output image.
 */
Image bandmean() const;

/**
 * Unfold image bands into x axis.
 * @param js_options Optional options.
 * @return Output image.
 */
Image bandunfold(emscripten::val js_options = emscripten::val::null()) const;

/**
 * Boolean operations against a constant.
 * @param boolean Boolean to perform.
 * @param c Array of constants.
 * @return Output image.
 */
Image boolean_const(emscripten::val boolean, const std::vector<double> &c) const;

/**
 * Build a look-up table.
 * @return Output image.
 */
Image buildlut() const;

/**
 * Byteswap an image.
 * @return Output image.
 */
Image byteswap() const;

/**
 * Canny edge detector.
 * @param js_options Optional options.
 * @return Output image.
 */
Image canny(emscripten::val js_options = emscripten::val::null()) const;

/**
 * Use pixel values to pick cases from an array of images.
 * @param cases Array of case images.
 * @return Output image.
 */
Image case_image(emscripten::val cases) const;

/**
 * Cast an image.
 * @param format Format to cast to.
 * @param js_options Optional options.
 * @return Output image.
 */
Image cast(emscripten::val format, emscripten::val js_options = emscripten::val::null()) const;

/**
 * Clamp values of an image.
 * @param js_options Optional options.
 * @return Output image.
 */
Image clamp(emscripten::val js_options = emscripten::val::null()) const;

/**
 * Convert to a new colorspace.
 * @param space Destination color space.
 * @param js_options Optional options.
 * @return Output image.
 */
Image colourspace(emscripten::val space, emscripten::val js_options = emscripten::val::null()) const;

/**
 * Convolve with rotating mask.
 * @param mask Input matrix image.
 * @param js_options Optional options.
 * @return Output image.
 */
Image compass(emscripten::val mask, emscripten::val js_options = emscripten::val::null()) const;

/**
 * Perform a complex operation on an image.
 * @param cmplx Complex to perform.
 * @return Output image.
 */
Image complex(emscripten::val cmplx) const;

/**
 * Complex binary operations on two images.
 * @param right Right-hand image argument.
 * @param cmplx Binary complex operation to perform.
 * @return Output image.
 */
Image complex2(emscripten::val right, emscripten::val cmplx) const;

/**
 * Form a complex image from two real images.
 * @param right Right-hand image argument.
 * @return Output image.
 */
Image complexform(emscripten::val right) const;

/**
 * Get a component from a complex image.
 * @param get Complex to perform.
 * @return Output image.
 */
Image complexget(emscripten::val get) const;

/**
 * Blend a pair of images with a blend mode.
 * @param overlay Overlay image.
 * @param mode VipsBlendMode to join with.
 * @param js_options Optional options.
 * @return Output image.
 */
Image composite2(emscripten::val overlay, emscripten::val mode, emscripten::val js_options = emscripten::val::null()) const;

/**
 * Convolution operation.
 * @param mask Input matrix image.
 * @param js_options Optional options.
 * @return Output image.
 */
Image conv(emscripten::val mask, emscripten::val js_options = emscripten::val::null()) const;

/**
 * Approximate integer convolution.
 * @param mask Input matrix image.
 * @param js_options Optional options.
 * @return Output image.
 */
Image conva(emscripten::val mask, emscripten::val js_options = emscripten::val::null()) const;

/**
 * Approximate separable integer convolution.
 * @param mask Input matrix image.
 * @param js_options Optional options.
 * @return Output image.
 */
Image convasep(emscripten::val mask, emscripten::val js_options = emscripten::val::null()) const;

/**
 * Float convolution operation.
 * @param mask Input matrix image.
 * @return Output image.
 */
Image convf(emscripten::val mask) const;

/**
 * Int convolution operation.
 * @param mask Input matrix image.
 * @return Output image.
 */
Image convi(emscripten::val mask) const;

/**
 * Separable convolution operation.
 * @param mask Input matrix image.
 * @param js_options Optional options.
 * @return Output image.
 */
Image convsep(emscripten::val mask, emscripten::val js_options = emscripten::val::null()) const;

/**
 * Copy an image.
 * @param js_options Optional options.
 * @return Output image.
 */
Image copy(emscripten::val js_options = emscripten::val::null()) const;

/**
 * Count lines in an image.
 * @param direction Countlines left-right or up-down.
 * @return Number of lines.
 */
double countlines(emscripten::val direction) const;

/**
 * Extract an area from an image.
 * @param left Left edge of extract area.
 * @param top Top edge of extract area.
 * @param width Width of extract area.
 * @param height Height of extract area.
 * @return Output image.
 */
Image crop(int left, int top, int width, int height) const;

/**
 * Save image to csv.
 * @param filename Filename to save to.
 * @param js_options Optional options.
 */
void csvsave(const std::string &filename, emscripten::val js_options = emscripten::val::null()) const;

/**
 * Save image to csv.
 * @param target Target to save to.
 * @param js_options Optional options.
 */
void csvsave_target(const Target &target, emscripten::val js_options = emscripten::val::null()) const;

/**
 * Calculate de00.
 * @param right Right-hand input image.
 * @return Output image.
 */
Image dE00(emscripten::val right) const;

/**
 * Calculate de76.
 * @param right Right-hand input image.
 * @return Output image.
 */
Image dE76(emscripten::val right) const;

/**
 * Calculate decmc.
 * @param right Right-hand input image.
 * @return Output image.
 */
Image dECMC(emscripten::val right) const;

/**
 * Find image standard deviation.
 * @return Output value.
 */
double deviate() const;

/**
 * Draw a circle on an image.
 * @param ink Color for pixels.
 * @param cx Centre of draw_circle.
 * @param cy Centre of draw_circle.
 * @param radius Radius in pixels.
 * @param js_options Optional options.
 */
void draw_circle(const std::vector<double> &ink, int cx, int cy, int radius, emscripten::val js_options = emscripten::val::null()) const;

/**
 * Flood-fill an area.
 * @param ink Color for pixels.
 * @param x DrawFlood start point.
 * @param y DrawFlood start point.
 * @param js_options Optional options.
 */
void draw_flood(const std::vector<double> &ink, int x, int y, emscripten::val js_options = emscripten::val::null()) const;

/**
 * Paint an image into another image.
 * @param sub Sub-image to insert into main image.
 * @param x Draw image here.
 * @param y Draw image here.
 * @param js_options Optional options.
 */
void draw_image(emscripten::val sub, int x, int y, emscripten::val js_options = emscripten::val::null()) const;

/**
 * Draw a line on an image.
 * @param ink Color for pixels.
 * @param x1 Start of draw_line.
 * @param y1 Start of draw_line.
 * @param x2 End of draw_line.
 * @param y2 End of draw_line.
 */
void draw_line(const std::vector<double> &ink, int x1, int y1, int x2, int y2) const;

/**
 * Draw a mask on an image.
 * @param ink Color for pixels.
 * @param mask Mask of pixels to draw.
 * @param x Draw mask here.
 * @param y Draw mask here.
 */
void draw_mask(const std::vector<double> &ink, emscripten::val mask, int x, int y) const;

/**
 * Paint a rectangle on an image.
 * @param ink Color for pixels.
 * @param left Rect to fill.
 * @param top Rect to fill.
 * @param width Rect to fill.
 * @param height Rect to fill.
 * @param js_options Optional options.
 */
void draw_rect(const std::vector<double> &ink, int left, int top, int width, int height, emscripten::val js_options = emscripten::val::null()) const;

/**
 * Blur a rectangle on an image.
 * @param left Rect to fill.
 * @param top Rect to fill.
 * @param width Rect to fill.
 * @param height Rect to fill.
 */
void draw_smudge(int left, int top, int width, int height) const;

/**
 * Save image to deepzoom file.
 * @param filename Filename to save to.
 * @param js_options Optional options.
 */
void dzsave(const std::string &filename, emscripten::val js_options = emscripten::val::null()) const;

/**
 * Save image to dz buffer.
 * @param js_options Optional options.
 * @return Buffer to save to.
 */
emscripten::val dzsave_buffer(emscripten::val js_options = emscripten::val::null()) const;

/**
 * Save image to deepzoom target.
 * @param target Target to save to.
 * @param js_options Optional options.
 */
void dzsave_target(const Target &target, emscripten::val js_options = emscripten::val::null()) const;

/**
 * Embed an image in a larger image.
 * @param x Left edge of input in output.
 * @param y Top edge of input in output.
 * @param width Image width in pixels.
 * @param height Image height in pixels.
 * @param js_options Optional options.
 * @return Output image.
 */
Image embed(int x, int y, int width, int height, emscripten::val js_options = emscripten::val::null()) const;

/**
 * Extract an area from an image.
 * @param left Left edge of extract area.
 * @param top Top edge of extract area.
 * @param width Width of extract area.
 * @param height Height of extract area.
 * @return Output image.
 */
Image extract_area(int left, int top, int width, int height) const;

/**
 * Extract band from an image.
 * @param band Band to extract.
 * @param js_options Optional options.
 * @return Output image.
 */
Image extract_band(int band, emscripten::val js_options = emscripten::val::null()) const;

/**
 * False-color an image.
 * @return Output image.
 */
Image falsecolour() const;

/**
 * Fast correlation.
 * @param ref Input reference image.
 * @return Output image.
 */
Image fastcor(emscripten::val ref) const;

/**
 * Fill image zeros with nearest non-zero pixel.
 * @param js_options Optional options.
 * @return Value of nearest non-zero pixel.
 */
Image fill_nearest(emscripten::val js_options = emscripten::val::null()) const;

/**
 * Search an image for non-edge areas.
 * @param top Top edge of extract area.
 * @param width Width of extract area.
 * @param height Height of extract area.
 * @param js_options Optional options.
 * @return Left edge of image.
 */
int find_trim(int *top, int *width, int *height, emscripten::val js_options = emscripten::val::null()) const;

/**
 * Save image to fits file.
 * @param filename Filename to save to.
 * @param js_options Optional options.
 */
void fitssave(const std::string &filename, emscripten::val js_options = emscripten::val::null()) const;

/**
 * Flatten alpha out of an image.
 * @param js_options Optional options.
 * @return Output image.
 */
Image flatten(emscripten::val js_options = emscripten::val::null()) const;

/**
 * Flip an image.
 * @param direction Direction to flip image.
 * @return Output image.
 */
Image flip(emscripten::val direction) const;

/**
 * Transform float rgb to radiance coding.
 * @return Output image.
 */
Image float2rad() const;

/**
 * Frequency-domain filtering.
 * @param mask Input mask image.
 * @return Output image.
 */
Image freqmult(emscripten::val mask) const;

/**
 * Forward fft.
 * @return Output image.
 */
Image fwfft() const;

/**
 * Gamma an image.
 * @param js_options Optional options.
 * @return Output image.
 */
Image gamma(emscripten::val js_options = emscripten::val::null()) const;

/**
 * Gaussian blur.
 * @param sigma Sigma of Gaussian.
 * @param js_options Optional options.
 * @return Output image.
 */
Image gaussblur(double sigma, emscripten::val js_options = emscripten::val::null()) const;

/**
 * Read a point from an image.
 * @param x Point to read.
 * @param y Point to read.
 * @param js_options Optional options.
 * @return Array of output values.
 */
std::vector<double> getpoint(int x, int y, emscripten::val js_options = emscripten::val::null()) const;

/**
 * Save as gif.
 * @param filename Filename to save to.
 * @param js_options Optional options.
 */
void gifsave(const std::string &filename, emscripten::val js_options = emscripten::val::null()) const;

/**
 * Save as gif.
 * @param js_options Optional options.
 * @return Buffer to save to.
 */
emscripten::val gifsave_buffer(emscripten::val js_options = emscripten::val::null()) const;

/**
 * Save as gif.
 * @param target Target to save to.
 * @param js_options Optional options.
 */
void gifsave_target(const Target &target, emscripten::val js_options = emscripten::val::null()) const;

/**
 * Global balance an image mosaic.
 * @param js_options Optional options.
 * @return Output image.
 */
Image globalbalance(emscripten::val js_options = emscripten::val::null()) const;

/**
 * Place an image within a larger image with a certain gravity.
 * @param direction Direction to place image within width/height.
 * @param width Image width in pixels.
 * @param height Image height in pixels.
 * @param js_options Optional options.
 * @return Output image.
 */
Image gravity(emscripten::val direction, int width, int height, emscripten::val js_options = emscripten::val::null()) const;

/**
 * Grid an image.
 * @param tile_height Chop into tiles this high.
 * @param across Number of tiles across.
 * @param down Number of tiles down.
 * @return Output image.
 */
Image grid(int tile_height, int across, int down) const;

/**
 * Save image in heif format.
 * @param filename Filename to save to.
 * @param js_options Optional options.
 */
void heifsave(const std::string &filename, emscripten::val js_options = emscripten::val::null()) const;

/**
 * Save image in heif format.
 * @param js_options Optional options.
 * @return Buffer to save to.
 */
emscripten::val heifsave_buffer(emscripten::val js_options = emscripten::val::null()) const;

/**
 * Save image in heif format.
 * @param target Target to save to.
 * @param js_options Optional options.
 */
void heifsave_target(const Target &target, emscripten::val js_options = emscripten::val::null()) const;

/**
 * Form cumulative histogram.
 * @return Output image.
 */
Image hist_cum() const;

/**
 * Estimate image entropy.
 * @return Output value.
 */
double hist_entropy() const;

/**
 * Histogram equalisation.
 * @param js_options Optional options.
 * @return Output image.
 */
Image hist_equal(emscripten::val js_options = emscripten::val::null()) const;

/**
 * Find image histogram.
 * @param js_options Optional options.
 * @return Output histogram.
 */
Image hist_find(emscripten::val js_options = emscripten::val::null()) const;

/**
 * Find indexed image histogram.
 * @param index Index image.
 * @param js_options Optional options.
 * @return Output histogram.
 */
Image hist_find_indexed(emscripten::val index, emscripten::val js_options = emscripten::val::null()) const;

/**
 * Find n-dimensional image histogram.
 * @param js_options Optional options.
 * @return Output histogram.
 */
Image hist_find_ndim(emscripten::val js_options = emscripten::val::null()) const;

/**
 * Test for monotonicity.
 * @return true if in is monotonic.
 */
bool hist_ismonotonic() const;

/**
 * Local histogram equalisation.
 * @param width Window width in pixels.
 * @param height Window height in pixels.
 * @param js_options Optional options.
 * @return Output image.
 */
Image hist_local(int width, int height, emscripten::val js_options = emscripten::val::null()) const;

/**
 * Match two histograms.
 * @param ref Reference histogram.
 * @return Output image.
 */
Image hist_match(emscripten::val ref) const;

/**
 * Normalise histogram.
 * @return Output image.
 */
Image hist_norm() const;

/**
 * Plot histogram.
 * @return Output image.
 */
Image hist_plot() const;

/**
 * Find hough circle transform.
 * @param js_options Optional options.
 * @return Output image.
 */
Image hough_circle(emscripten::val js_options = emscripten::val::null()) const;

/**
 * Find hough line transform.
 * @param js_options Optional options.
 * @return Output image.
 */
Image hough_line(emscripten::val js_options = emscripten::val::null()) const;

/**
 * Output to device with icc profile.
 * @param js_options Optional options.
 * @return Output image.
 */
Image icc_export(emscripten::val js_options = emscripten::val::null()) const;

/**
 * Import from device with icc profile.
 * @param js_options Optional options.
 * @return Output image.
 */
Image icc_import(emscripten::val js_options = emscripten::val::null()) const;

/**
 * Transform between devices with icc profiles.
 * @param output_profile Filename to load output profile from.
 * @param js_options Optional options.
 * @return Output image.
 */
Image icc_transform(const std::string &output_profile, emscripten::val js_options = emscripten::val::null()) const;

/**
 * Insert image @sub into @main at @x, @y.
 * @param sub Sub-image to insert into main image.
 * @param x Left edge of sub in main.
 * @param y Top edge of sub in main.
 * @param js_options Optional options.
 * @return Output image.
 */
Image insert(emscripten::val sub, int x, int y, emscripten::val js_options = emscripten::val::null()) const;

/**
 * Invert an image.
 * @return Output image.
 */
Image invert() const;

/**
 * Build an inverted look-up table.
 * @param js_options Optional options.
 * @return Output image.
 */
Image invertlut(emscripten::val js_options = emscripten::val::null()) const;

/**
 * Inverse fft.
 * @param js_options Optional options.
 * @return Output image.
 */
Image invfft(emscripten::val js_options = emscripten::val::null()) const;

/**
 * Join a pair of images.
 * @param in2 Second input image.
 * @param direction Join left-right or up-down.
 * @param js_options Optional options.
 * @return Output image.
 */
Image join(emscripten::val in2, emscripten::val direction, emscripten::val js_options = emscripten::val::null()) const;

/**
 * Save image in jpeg2000 format.
 * @param filename Filename to save to.
 * @param js_options Optional options.
 */
void jp2ksave(const std::string &filename, emscripten::val js_options = emscripten::val::null()) const;

/**
 * Save image in jpeg2000 format.
 * @param js_options Optional options.
 * @return Buffer to save to.
 */
emscripten::val jp2ksave_buffer(emscripten::val js_options = emscripten::val::null()) const;

/**
 * Save image in jpeg2000 format.
 * @param target Target to save to.
 * @param js_options Optional options.
 */
void jp2ksave_target(const Target &target, emscripten::val js_options = emscripten::val::null()) const;

/**
 * Save image to jpeg file.
 * @param filename Filename to save to.
 * @param js_options Optional options.
 */
void jpegsave(const std::string &filename, emscripten::val js_options = emscripten::val::null()) const;

/**
 * Save image to jpeg buffer.
 * @param js_options Optional options.
 * @return Buffer to save to.
 */
emscripten::val jpegsave_buffer(emscripten::val js_options = emscripten::val::null()) const;

/**
 * Save image to jpeg mime.
 * @param js_options Optional options.
 */
void jpegsave_mime(emscripten::val js_options = emscripten::val::null()) const;

/**
 * Save image to jpeg target.
 * @param target Target to save to.
 * @param js_options Optional options.
 */
void jpegsave_target(const Target &target, emscripten::val js_options = emscripten::val::null()) const;

/**
 * Save image in jpeg-xl format.
 * @param filename Filename to save to.
 * @param js_options Optional options.
 */
void jxlsave(const std::string &filename, emscripten::val js_options = emscripten::val::null()) const;

/**
 * Save image in jpeg-xl format.
 * @param js_options Optional options.
 * @return Buffer to save to.
 */
emscripten::val jxlsave_buffer(emscripten::val js_options = emscripten::val::null()) const;

/**
 * Save image in jpeg-xl format.
 * @param target Target to save to.
 * @param js_options Optional options.
 */
void jxlsave_target(const Target &target, emscripten::val js_options = emscripten::val::null()) const;

/**
 * Label regions in an image.
 * @param js_options Optional options.
 * @return Mask of region labels.
 */
Image labelregions(emscripten::val js_options = emscripten::val::null()) const;

/**
 * Calculate (a * in + b).
 * @param a Multiply by this.
 * @param b Add this.
 * @param js_options Optional options.
 * @return Output image.
 */
Image linear(const std::vector<double> &a, const std::vector<double> &b, emscripten::val js_options = emscripten::val::null()) const;

/**
 * Cache an image as a set of lines.
 * @param js_options Optional options.
 * @return Output image.
 */
Image linecache(emscripten::val js_options = emscripten::val::null()) const;

/**
 * Save file with imagemagick.
 * @param filename Filename to save to.
 * @param js_options Optional options.
 */
void magicksave(const std::string &filename, emscripten::val js_options = emscripten::val::null()) const;

/**
 * Save image to magick buffer.
 * @param js_options Optional options.
 * @return Buffer to save to.
 */
emscripten::val magicksave_buffer(emscripten::val js_options = emscripten::val::null()) const;

/**
 * Resample with a map image.
 * @param index Index pixels with this.
 * @param js_options Optional options.
 * @return Output image.
 */
Image mapim(emscripten::val index, emscripten::val js_options = emscripten::val::null()) const;

/**
 * Map an image though a lut.
 * @param lut Look-up table image.
 * @param js_options Optional options.
 * @return Output image.
 */
Image maplut(emscripten::val lut, emscripten::val js_options = emscripten::val::null()) const;

/**
 * First-order match of two images.
 * @param sec Secondary image.
 * @param xr1 Position of first reference tie-point.
 * @param yr1 Position of first reference tie-point.
 * @param xs1 Position of first secondary tie-point.
 * @param ys1 Position of first secondary tie-point.
 * @param xr2 Position of second reference tie-point.
 * @param yr2 Position of second reference tie-point.
 * @param xs2 Position of second secondary tie-point.
 * @param ys2 Position of second secondary tie-point.
 * @param js_options Optional options.
 * @return Output image.
 */
Image match(emscripten::val sec, int xr1, int yr1, int xs1, int ys1, int xr2, int yr2, int xs2, int ys2, emscripten::val js_options = emscripten::val::null()) const;

/**
 * Apply a math operation to an image.
 * @param math Math to perform.
 * @return Output image.
 */
Image math(emscripten::val math) const;

/**
 * Binary math operations with a constant.
 * @param math2 Math to perform.
 * @param c Array of constants.
 * @return Output image.
 */
Image math2_const(emscripten::val math2, const std::vector<double> &c) const;

/**
 * Invert an matrix.
 * @return Output matrix.
 */
Image matrixinvert() const;

/**
 * Print matrix.
 * @param js_options Optional options.
 */
void matrixprint(emscripten::val js_options = emscripten::val::null()) const;

/**
 * Save image to matrix.
 * @param filename Filename to save to.
 * @param js_options Optional options.
 */
void matrixsave(const std::string &filename, emscripten::val js_options = emscripten::val::null()) const;

/**
 * Save image to matrix.
 * @param target Target to save to.
 * @param js_options Optional options.
 */
void matrixsave_target(const Target &target, emscripten::val js_options = emscripten::val::null()) const;

/**
 * Find image maximum.
 * @param js_options Optional options.
 * @return Output value.
 */
double max(emscripten::val js_options = emscripten::val::null()) const;

/**
 * Maximum of a pair of images.
 * @param right Right-hand image argument.
 * @return Output image.
 */
Image maxpair(emscripten::val right) const;

/**
 * Measure a set of patches on a color chart.
 * @param h Number of patches across chart.
 * @param v Number of patches down chart.
 * @param js_options Optional options.
 * @return Output array of statistics.
 */
Image measure(int h, int v, emscripten::val js_options = emscripten::val::null()) const;

/**
 * Merge two images.
 * @param sec Secondary image.
 * @param direction Horizontal or vertical merge.
 * @param dx Horizontal displacement from sec to ref.
 * @param dy Vertical displacement from sec to ref.
 * @param js_options Optional options.
 * @return Output image.
 */
Image merge(emscripten::val sec, emscripten::val direction, int dx, int dy, emscripten::val js_options = emscripten::val::null()) const;

/**
 * Find image minimum.
 * @param js_options Optional options.
 * @return Output value.
 */
double min(emscripten::val js_options = emscripten::val::null()) const;

/**
 * Minimum of a pair of images.
 * @param right Right-hand image argument.
 * @return Output image.
 */
Image minpair(emscripten::val right) const;

/**
 * Morphology operation.
 * @param mask Input matrix image.
 * @param morph Morphological operation to perform.
 * @return Output image.
 */
Image morph(emscripten::val mask, emscripten::val morph) const;

/**
 * Mosaic two images.
 * @param sec Secondary image.
 * @param direction Horizontal or vertical mosaic.
 * @param xref Position of reference tie-point.
 * @param yref Position of reference tie-point.
 * @param xsec Position of secondary tie-point.
 * @param ysec Position of secondary tie-point.
 * @param js_options Optional options.
 * @return Output image.
 */
Image mosaic(emscripten::val sec, emscripten::val direction, int xref, int yref, int xsec, int ysec, emscripten::val js_options = emscripten::val::null()) const;

/**
 * First-order mosaic of two images.
 * @param sec Secondary image.
 * @param direction Horizontal or vertical mosaic.
 * @param xr1 Position of first reference tie-point.
 * @param yr1 Position of first reference tie-point.
 * @param xs1 Position of first secondary tie-point.
 * @param ys1 Position of first secondary tie-point.
 * @param xr2 Position of second reference tie-point.
 * @param yr2 Position of second reference tie-point.
 * @param xs2 Position of second secondary tie-point.
 * @param ys2 Position of second secondary tie-point.
 * @param js_options Optional options.
 * @return Output image.
 */
Image mosaic1(emscripten::val sec, emscripten::val direction, int xr1, int yr1, int xs1, int ys1, int xr2, int yr2, int xs2, int ys2, emscripten::val js_options = emscripten::val::null()) const;

/**
 * Pick most-significant byte from an image.
 * @param js_options Optional options.
 * @return Output image.
 */
Image msb(emscripten::val js_options = emscripten::val::null()) const;

/**
 * Save image to nifti file.
 * @param filename Filename to save to.
 * @param js_options Optional options.
 */
void niftisave(const std::string &filename, emscripten::val js_options = emscripten::val::null()) const;

/**
 * Find threshold for percent of pixels.
 * @param percent Percent of pixels.
 * @return Threshold above which lie percent of pixels.
 */
int percent(double percent) const;

/**
 * Calculate phase correlation.
 * @param in2 Second input image.
 * @return Output image.
 */
Image phasecor(emscripten::val in2) const;

/**
 * Save image to file as png.
 * @param filename Filename to save to.
 * @param js_options Optional options.
 */
void pngsave(const std::string &filename, emscripten::val js_options = emscripten::val::null()) const;

/**
 * Save image to buffer as png.
 * @param js_options Optional options.
 * @return Buffer to save to.
 */
emscripten::val pngsave_buffer(emscripten::val js_options = emscripten::val::null()) const;

/**
 * Save image to target as png.
 * @param target Target to save to.
 * @param js_options Optional options.
 */
void pngsave_target(const Target &target, emscripten::val js_options = emscripten::val::null()) const;

/**
 * Save image to ppm file.
 * @param filename Filename to save to.
 * @param js_options Optional options.
 */
void ppmsave(const std::string &filename, emscripten::val js_options = emscripten::val::null()) const;

/**
 * Save to ppm.
 * @param target Target to save to.
 * @param js_options Optional options.
 */
void ppmsave_target(const Target &target, emscripten::val js_options = emscripten::val::null()) const;

/**
 * Premultiply image alpha.
 * @param js_options Optional options.
 * @return Output image.
 */
Image premultiply(emscripten::val js_options = emscripten::val::null()) const;

/**
 * Prewitt edge detector.
 * @return Output image.
 */
Image prewitt() const;

/**
 * Find image profiles.
 * @param rows First non-zero pixel in row.
 * @return First non-zero pixel in column.
 */
Image profile(Image *rows) const;

/**
 * Find image projections.
 * @param rows Sums of rows.
 * @return Sums of columns.
 */
Image project(Image *rows) const;

/**
 * Resample an image with a quadratic transform.
 * @param coeff Coefficient matrix.
 * @param js_options Optional options.
 * @return Output image.
 */
Image quadratic(emscripten::val coeff, emscripten::val js_options = emscripten::val::null()) const;

/**
 * Unpack radiance coding to float rgb.
 * @return Output image.
 */
Image rad2float() const;

/**
 * Save image to radiance file.
 * @param filename Filename to save to.
 * @param js_options Optional options.
 */
void radsave(const std::string &filename, emscripten::val js_options = emscripten::val::null()) const;

/**
 * Save image to radiance buffer.
 * @param js_options Optional options.
 * @return Buffer to save to.
 */
emscripten::val radsave_buffer(emscripten::val js_options = emscripten::val::null()) const;

/**
 * Save image to radiance target.
 * @param target Target to save to.
 * @param js_options Optional options.
 */
void radsave_target(const Target &target, emscripten::val js_options = emscripten::val::null()) const;

/**
 * Rank filter.
 * @param width Window width in pixels.
 * @param height Window height in pixels.
 * @param index Select pixel at index.
 * @return Output image.
 */
Image rank(int width, int height, int index) const;

/**
 * Save image to raw file.
 * @param filename Filename to save to.
 * @param js_options Optional options.
 */
void rawsave(const std::string &filename, emscripten::val js_options = emscripten::val::null()) const;

/**
 * Write raw image to buffer.
 * @param js_options Optional options.
 * @return Buffer to save to.
 */
emscripten::val rawsave_buffer(emscripten::val js_options = emscripten::val::null()) const;

/**
 * Write raw image to target.
 * @param target Target to save to.
 * @param js_options Optional options.
 */
void rawsave_target(const Target &target, emscripten::val js_options = emscripten::val::null()) const;

/**
 * Linear recombination with matrix.
 * @param m Matrix of coefficients.
 * @return Output image.
 */
Image recomb(emscripten::val m) const;

/**
 * Reduce an image.
 * @param hshrink Horizontal shrink factor.
 * @param vshrink Vertical shrink factor.
 * @param js_options Optional options.
 * @return Output image.
 */
Image reduce(double hshrink, double vshrink, emscripten::val js_options = emscripten::val::null()) const;

/**
 * Shrink an image horizontally.
 * @param hshrink Horizontal shrink factor.
 * @param js_options Optional options.
 * @return Output image.
 */
Image reduceh(double hshrink, emscripten::val js_options = emscripten::val::null()) const;

/**
 * Shrink an image vertically.
 * @param vshrink Vertical shrink factor.
 * @param js_options Optional options.
 * @return Output image.
 */
Image reducev(double vshrink, emscripten::val js_options = emscripten::val::null()) const;

/**
 * Relational operations against a constant.
 * @param relational Relational to perform.
 * @param c Array of constants.
 * @return Output image.
 */
Image relational_const(emscripten::val relational, const std::vector<double> &c) const;

/**
 * Remainder after integer division of an image and a constant.
 * @param c Array of constants.
 * @return Output image.
 */
Image remainder_const(const std::vector<double> &c) const;

/**
 * Replicate an image.
 * @param across Repeat this many times horizontally.
 * @param down Repeat this many times vertically.
 * @return Output image.
 */
Image replicate(int across, int down) const;

/**
 * Resize an image.
 * @param scale Scale image by this factor.
 * @param js_options Optional options.
 * @return Output image.
 */
Image resize(double scale, emscripten::val js_options = emscripten::val::null()) const;

/**
 * Rotate an image.
 * @param angle Angle to rotate image.
 * @return Output image.
 */
Image rot(emscripten::val angle) const;

/**
 * Rotate an image.
 * @param js_options Optional options.
 * @return Output image.
 */
Image rot45(emscripten::val js_options = emscripten::val::null()) const;

/**
 * Rotate an image by a number of degrees.
 * @param angle Rotate clockwise by this many degrees.
 * @param js_options Optional options.
 * @return Output image.
 */
Image rotate(double angle, emscripten::val js_options = emscripten::val::null()) const;

/**
 * Perform a round function on an image.
 * @param round Rounding operation to perform.
 * @return Output image.
 */
Image round(emscripten::val round) const;

/**
 * Transform srgb to hsv.
 * @return Output image.
 */
Image sRGB2HSV() const;

/**
 * Convert an srgb image to scrgb.
 * @return Output image.
 */
Image sRGB2scRGB() const;

/**
 * Convert scrgb to bw.
 * @param js_options Optional options.
 * @return Output image.
 */
Image scRGB2BW(emscripten::val js_options = emscripten::val::null()) const;

/**
 * Transform scrgb to xyz.
 * @return Output image.
 */
Image scRGB2XYZ() const;

/**
 * Convert an scrgb image to srgb.
 * @param js_options Optional options.
 * @return Output image.
 */
Image scRGB2sRGB(emscripten::val js_options = emscripten::val::null()) const;

/**
 * Scale an image to uchar.
 * @param js_options Optional options.
 * @return Output image.
 */
Image scale(emscripten::val js_options = emscripten::val::null()) const;

/**
 * Scharr edge detector.
 * @return Output image.
 */
Image scharr() const;

/**
 * Check sequential access.
 * @param js_options Optional options.
 * @return Output image.
 */
Image sequential(emscripten::val js_options = emscripten::val::null()) const;

/**
 * Unsharp masking for print.
 * @param js_options Optional options.
 * @return Output image.
 */
Image sharpen(emscripten::val js_options = emscripten::val::null()) const;

/**
 * Shrink an image.
 * @param hshrink Horizontal shrink factor.
 * @param vshrink Vertical shrink factor.
 * @param js_options Optional options.
 * @return Output image.
 */
Image shrink(double hshrink, double vshrink, emscripten::val js_options = emscripten::val::null()) const;

/**
 * Shrink an image horizontally.
 * @param hshrink Horizontal shrink factor.
 * @param js_options Optional options.
 * @return Output image.
 */
Image shrinkh(int hshrink, emscripten::val js_options = emscripten::val::null()) const;

/**
 * Shrink an image vertically.
 * @param vshrink Vertical shrink factor.
 * @param js_options Optional options.
 * @return Output image.
 */
Image shrinkv(int vshrink, emscripten::val js_options = emscripten::val::null()) const;

/**
 * Unit vector of pixel.
 * @return Output image.
 */
Image sign() const;

/**
 * Similarity transform of an image.
 * @param js_options Optional options.
 * @return Output image.
 */
Image similarity(emscripten::val js_options = emscripten::val::null()) const;

/**
 * Extract an area from an image.
 * @param width Width of extract area.
 * @param height Height of extract area.
 * @param js_options Optional options.
 * @return Output image.
 */
Image smartcrop(int width, int height, emscripten::val js_options = emscripten::val::null()) const;

/**
 * Sobel edge detector.
 * @return Output image.
 */
Image sobel() const;

/**
 * Spatial correlation.
 * @param ref Input reference image.
 * @return Output image.
 */
Image spcor(emscripten::val ref) const;

/**
 * Make displayable power spectrum.
 * @return Output image.
 */
Image spectrum() const;

/**
 * Find many image stats.
 * @return Output array of statistics.
 */
Image stats() const;

/**
 * Statistical difference.
 * @param width Window width in pixels.
 * @param height Window height in pixels.
 * @param js_options Optional options.
 * @return Output image.
 */
Image stdif(int width, int height, emscripten::val js_options = emscripten::val::null()) const;

/**
 * Subsample an image.
 * @param xfac Horizontal subsample factor.
 * @param yfac Vertical subsample factor.
 * @param js_options Optional options.
 * @return Output image.
 */
Image subsample(int xfac, int yfac, emscripten::val js_options = emscripten::val::null()) const;

/**
 * Generate thumbnail from image.
 * @param width Size to this width.
 * @param js_options Optional options.
 * @return Output image.
 */
Image thumbnail_image(int width, emscripten::val js_options = emscripten::val::null()) const;

/**
 * Save image to tiff file.
 * @param filename Filename to save to.
 * @param js_options Optional options.
 */
void tiffsave(const std::string &filename, emscripten::val js_options = emscripten::val::null()) const;

/**
 * Save image to tiff buffer.
 * @param js_options Optional options.
 * @return Buffer to save to.
 */
emscripten::val tiffsave_buffer(emscripten::val js_options = emscripten::val::null()) const;

/**
 * Save image to tiff target.
 * @param target Target to save to.
 * @param js_options Optional options.
 */
void tiffsave_target(const Target &target, emscripten::val js_options = emscripten::val::null()) const;

/**
 * Cache an image as a set of tiles.
 * @param js_options Optional options.
 * @return Output image.
 */
Image tilecache(emscripten::val js_options = emscripten::val::null()) const;

/**
 * Transpose3d an image.
 * @param js_options Optional options.
 * @return Output image.
 */
Image transpose3d(emscripten::val js_options = emscripten::val::null()) const;

/**
 * Unpremultiply image alpha.
 * @param js_options Optional options.
 * @return Output image.
 */
Image unpremultiply(emscripten::val js_options = emscripten::val::null()) const;

/**
 * Save image to file in vips format.
 * @param filename Filename to save to.
 * @param js_options Optional options.
 */
void vipssave(const std::string &filename, emscripten::val js_options = emscripten::val::null()) const;

/**
 * Save image to target in vips format.
 * @param target Target to save to.
 * @param js_options Optional options.
 */
void vipssave_target(const Target &target, emscripten::val js_options = emscripten::val::null()) const;

/**
 * Save as webp.
 * @param filename Filename to save to.
 * @param js_options Optional options.
 */
void webpsave(const std::string &filename, emscripten::val js_options = emscripten::val::null()) const;

/**
 * Save as webp.
 * @param js_options Optional options.
 * @return Buffer to save to.
 */
emscripten::val webpsave_buffer(emscripten::val js_options = emscripten::val::null()) const;

/**
 * Save image to webp mime.
 * @param js_options Optional options.
 */
void webpsave_mime(emscripten::val js_options = emscripten::val::null()) const;

/**
 * Save as webp.
 * @param target Target to save to.
 * @param js_options Optional options.
 */
void webpsave_target(const Target &target, emscripten::val js_options = emscripten::val::null()) const;

/**
 * Wrap image origin.
 * @param js_options Optional options.
 * @return Output image.
 */
Image wrap(emscripten::val js_options = emscripten::val::null()) const;

/**
 * Zoom an image.
 * @param xfac Horizontal zoom factor.
 * @param yfac Vertical zoom factor.
 * @return Output image.
 */
Image zoom(int xfac, int yfac) const;
