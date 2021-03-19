#!/usr/bin/env bash
set -e

# Working directories
#DEPS=/deps
#TARGET=/target
#mkdir $DEPS
#mkdir $TARGET

SOURCE_DIR=$PWD

# Build within the mounted volume, handy for debugging
# and ensures that dependencies are not being rebuilt
DEPS=$SOURCE_DIR/build/deps
TARGET=$SOURCE_DIR/build/target
rm -rf $DEPS/
mkdir $DEPS
mkdir -p $TARGET

# Define default arguments

# Specifies the environment(s) to target
ENVIRONMENT="web,node"

# Single Instruction Multiple Data (SIMD), disabled by default
SIMD=false

# Support for v128.const which was only recently implemented in V8, disabled by default
EXPERIMENTAL_SIMD=false

# Link-time optimizations (LTO), disabled by default
# https://github.com/emscripten-core/emscripten/issues/10603
LTO_FLAG=

# JS BigInt to Wasm i64 integration, disabled by default
WASM_BIGINT_FLAG=

# Parse arguments
while [ $# -gt 0 ]; do
  case $1 in
    --enable-simd) SIMD=true ;;
    --enable-experimental-simd) SIMD=true EXPERIMENTAL_SIMD=true ;;
    --enable-lto) LTO_FLAG=--lto ;;
    --enable-wasm-bigint) WASM_BIGINT_FLAG="-s WASM_BIGINT" ;;
    -e|--environment) ENVIRONMENT="$2"; shift ;;
    *) echo "ERROR: Unknown parameter: $1" >&2; exit 1 ;;
  esac
  shift
done

if [ "$SIMD" = "true" ]; then
  ENABLE_SIMD=true
else
  DISABLE_SIMD=true
fi

# Handy for debugging
#export CFLAGS="-O0 -g4"
#export CXXFLAGS="$CFLAGS"
#export LDFLAGS="-L$TARGET/lib -O0"
#export EMMAKEN_CFLAGS="--source-map-base http://localhost:5000/lib/"
#export EMCC_DEBUG="1"

# Handy for catching bugs
#export CFLAGS="-Os -g4 -fsanitize=address"
#export CXXFLAGS="$CFLAGS"
#export LDFLAGS="-L$TARGET/lib -Os -g4 -fsanitize=address"
#export EMMAKEN_CFLAGS="-s INITIAL_MEMORY=64MB --source-map-base http://localhost:5000/lib/"

# Common compiler flags
export CFLAGS="-O3 -fno-rtti -fno-exceptions -mnontrapping-fptoint"
if [ "$SIMD" = "true" ]; then export CFLAGS+=" -msimd128"; fi
if [ "$EXPERIMENTAL_SIMD" = "true" ]; then export CFLAGS+=" -munimplemented-simd128"; fi
if [ -n "$LTO_FLAG" ]; then export CFLAGS+=" -flto"; fi
if [ -n "$WASM_BIGINT_FLAG" ]; then export CFLAGS+=" -DWASM_BIGINT"; fi
export CXXFLAGS="$CFLAGS"
export LDFLAGS="-L$TARGET/lib -O3"
if [ -n "$LTO_FLAG" ]; then export LDFLAGS+=" -flto"; fi
if [ -n "$WASM_BIGINT_FLAG" ]; then export EMMAKEN_CFLAGS="$WASM_BIGINT_FLAG"; fi

# Build paths
export CPATH="$TARGET/include"
export EM_PKG_CONFIG_PATH="$TARGET/lib/pkgconfig"

# Specific variables for cross-compilation
export CHOST="wasm32-unknown-linux" # wasm32-unknown-emscripten
export MESON_CROSS="$SOURCE_DIR/build/emscripten-crossfile.meson"

# Dependency version numbers
# TODO(kleisauke): GIF support is currently missing, giflib abandoned autotools which makes compilation difficult
# Wait for https://github.com/libvips/libvips/pull/1709 instead.
VERSION_ZLIBNG=2.0.1
VERSION_FFI=3.3
VERSION_GLIB=2.68.0
VERSION_EXPAT=2.2.10
VERSION_EXIF=0.6.22
VERSION_LCMS2=2.11
VERSION_JPEG=2.0.6
VERSION_PNG16=1.6.37
VERSION_SPNG=0.6.2
VERSION_WEBP=1.2.0
VERSION_TIFF=4.2.0
VERSION_VIPS=8.10.6

# Remove patch version component
without_patch() {
  echo "${1%.[[:digit:]]*}"
}

echo "============================================="
echo "Environment"
echo "============================================="
emcc --version

cd $(dirname $(which emcc))

# Assumes that the patches have already been applied when not running in a container
if [ "$RUNNING_IN_CONTAINER" = true ]; then
  # TODO(kleisauke): Discuss these patches upstream
  patch -p1 <$SOURCE_DIR/build/patches/emscripten-auto-deletelater.patch
  patch -p1 <$SOURCE_DIR/build/patches/emscripten-vector-as-js-array.patch
  patch -p1 <$SOURCE_DIR/build/patches/emscripten-allow-block-main-thread.patch

  # https://github.com/emscripten-core/emscripten/pull/10110
  patch -p1 <$SOURCE_DIR/build/patches/emscripten-10110.patch

  # https://github.com/emscripten-core/emscripten/pull/12963
  patch -p1 <$SOURCE_DIR/build/patches/emscripten-12963.patch

  # Need to rebuild libembind, libc, libdlmalloc and libemmalloc,
  # since we modified it with the patches above
  embuilder.py build libembind libc-mt libdlmalloc-mt{,-debug} libemmalloc-mt{,-debug} --force $LTO_FLAG

  # The system headers require to be reinstalled, as some of
  # them have also been changed with the patches above
  embuilder.py build sysroot --force
fi

if [ -n "$EMMAKEN_CFLAGS" ]; then
  # The struct_info file must be built without modifications to EMMAKEN_CFLAGS
  EMMAKEN_CFLAGS= embuilder.py build struct_info $LTO_FLAG
fi

echo "============================================="
echo "Compiling zlib-ng"
echo "============================================="
test -f "$TARGET/lib/pkgconfig/zlib.pc" || (
  mkdir $DEPS/zlib-ng
  curl -Ls https://github.com/zlib-ng/zlib-ng/archive/$VERSION_ZLIBNG.tar.gz | tar xzC $DEPS/zlib-ng --strip-components=1
  cd $DEPS/zlib-ng
  # SSE intrinsics needs to be checked for wasm32
  sed -i 's/|\s*x86_64/& | wasm32/g' configure
  # Avoid CPU checks at runtime
  sed -i 's/\s-DX86_FEATURES//g' configure
  sed -i 's/\sx86.l*o//g' configure
  emconfigure ./configure --prefix=$TARGET --static --zlib-compat ${DISABLE_SIMD:+--without-optimizations} \
    ${ENABLE_SIMD:+--force-sse2} --without-acle --without-neon
  emmake make install
)

echo "============================================="
echo "Compiling ffi"
echo "============================================="
test -f "$TARGET/lib/pkgconfig/libffi.pc" || (
  mkdir $DEPS/ffi
  curl -Ls https://sourceware.org/pub/libffi/libffi-$VERSION_FFI.tar.gz | tar xzC $DEPS/ffi --strip-components=1
  cd $DEPS/ffi
  patch -p1 <$SOURCE_DIR/build/patches/libffi-emscripten.patch
  autoreconf -fiv
  emconfigure ./configure --host=$CHOST --prefix=$TARGET --enable-static --disable-shared --disable-dependency-tracking \
    --disable-builddir --disable-multi-os-directory --disable-raw-api --disable-structs
  emmake make install
)

echo "============================================="
echo "Compiling glib"
echo "============================================="
test -f "$TARGET/lib/pkgconfig/glib-2.0.pc" || (
  mkdir $DEPS/glib
  curl -Lks https://download.gnome.org/sources/glib/$(without_patch $VERSION_GLIB)/glib-$VERSION_GLIB.tar.xz | tar xJC $DEPS/glib --strip-components=1
  cd $DEPS/glib
  patch -p1 <$SOURCE_DIR/build/patches/glib-emscripten.patch
  meson setup _build --prefix=$TARGET --cross-file=$MESON_CROSS --default-library=static --buildtype=release \
    -Diconv="libc" -Dselinux=disabled -Dxattr=false -Dlibmount=disabled -Dnls=disabled -Dinternal_pcre=true \
    -Dtests=false -Dglib_assert=false -Dglib_checks=false
  emmake ninja -C _build install
)

echo "============================================="
echo "Compiling expat"
echo "============================================="
test -f "$TARGET/lib/pkgconfig/expat.pc" || (
  mkdir $DEPS/expat
  curl -Ls https://github.com/libexpat/libexpat/releases/download/R_${VERSION_EXPAT//./_}/expat-$VERSION_EXPAT.tar.xz | tar xJC $DEPS/expat --strip-components=1
  cd $DEPS/expat
  emconfigure ./configure --host=$CHOST --prefix=$TARGET --enable-static --disable-shared --disable-dependency-tracking \
    --without-xmlwf --without-docbook --without-getrandom --without-sys-getrandom --without-examples --without-tests \
    expatcfg_cv_compiler_supports_visibility=no
  emmake make install
)

echo "============================================="
echo "Compiling exif"
echo "============================================="
test -f "$TARGET/lib/pkgconfig/libexif.pc" || (
  mkdir $DEPS/exif
  curl -Ls https://github.com/libexif/libexif/releases/download/libexif-${VERSION_EXIF//./_}-release/libexif-$VERSION_EXIF.tar.xz | tar xJC $DEPS/exif --strip-components=1
  cd $DEPS/exif
  emconfigure ./configure --host=$CHOST --prefix=$TARGET --enable-static --disable-shared --disable-dependency-tracking \
    --disable-docs --disable-nls
  emmake make install
)

echo "============================================="
echo "Compiling lcms2"
echo "============================================="
test -f "$TARGET/lib/pkgconfig/lcms2.pc" || (
  mkdir $DEPS/lcms2
  curl -Ls https://downloads.sourceforge.net/project/lcms/lcms/$VERSION_LCMS2/lcms2-$VERSION_LCMS2.tar.gz | tar xzC $DEPS/lcms2 --strip-components=1
  cd $DEPS/lcms2
  # Disable threading support, we rely on libvips' thread pool
  emconfigure ./configure --host=$CHOST --prefix=$TARGET --enable-static --disable-shared --disable-dependency-tracking \
   --without-threads --without-jpeg --without-tiff --without-zlib \
   ax_cv_have_func_attribute_visibility=0
  emmake make install
)

echo "============================================="
echo "Compiling jpeg"
echo "============================================="
test -f "$TARGET/lib/pkgconfig/libjpeg.pc" || (
  mkdir $DEPS/jpeg
  curl -Ls https://github.com/libjpeg-turbo/libjpeg-turbo/archive/$VERSION_JPEG.tar.gz | tar xzC $DEPS/jpeg --strip-components=1
  cd $DEPS/jpeg
  # https://github.com/libjpeg-turbo/libjpeg-turbo/issues/250#issuecomment-407615180
  emcmake cmake -B_build -H. -DCMAKE_BUILD_TYPE=Release -DCMAKE_INSTALL_PREFIX=$TARGET -DENABLE_STATIC=TRUE \
    -DENABLE_SHARED=FALSE -DWITH_JPEG8=TRUE -DWITH_SIMD=FALSE -DWITH_TURBOJPEG=FALSE
  emmake make -C _build install
)

echo "============================================="
echo "Compiling png16"
echo "============================================="
test -f "$TARGET/lib/pkgconfig/libpng16.pc" || (
  mkdir $DEPS/png16
  curl -Ls https://downloads.sourceforge.net/project/libpng/libpng16/$VERSION_PNG16/libpng-$VERSION_PNG16.tar.xz | tar xJC $DEPS/png16 --strip-components=1
  cd $DEPS/png16
  # Switch the default zlib compression strategy to Z_RLE, as this is especially suitable for PNG images
  sed -i 's/Z_FILTERED/Z_RLE/g' scripts/pnglibconf.dfa
  # The hardware optimizations in libpng are only used for reading PNG images, since we use libspng
  # for that we can safely pass --disable-hardware-optimizations and compile with -DPNG_NO_READ
  emconfigure ./configure --host=$CHOST --prefix=$TARGET --enable-static --disable-shared --disable-dependency-tracking \
    --disable-hardware-optimizations CPPFLAGS="-DPNG_NO_READ"
  emmake make install
)

echo "============================================="
echo "Compiling spng"
echo "============================================="
test -f "$TARGET/lib/pkgconfig/spng.pc" || (
  mkdir $DEPS/spng
  curl -Ls https://github.com/randy408/libspng/archive/v$VERSION_SPNG.tar.gz | tar xzC $DEPS/spng --strip-components=1
  cd $DEPS/spng
  # TODO(kleisauke): Discuss this patch upstream
  patch -p1 <$SOURCE_DIR/build/patches/libspng-emscripten.patch
  meson setup _build --prefix=$TARGET --cross-file=$MESON_CROSS --default-library=static --buildtype=release \
    -Dstatic_zlib=true ${DISABLE_SIMD:+-Denable_opt=false} ${ENABLE_SIMD:+-Dc_args="$CFLAGS -msse2"}
  emmake ninja -C _build install
)

echo "============================================="
echo "Compiling webp"
echo "============================================="
test -f "$TARGET/lib/pkgconfig/libwebp.pc" || (
  mkdir $DEPS/webp
  curl -Ls https://storage.googleapis.com/downloads.webmproject.org/releases/webp/libwebp-$VERSION_WEBP.tar.gz | tar xzC $DEPS/webp --strip-components=1
  cd $DEPS/webp
  # Prepend `-msimd128` to SSE flags, see: https://github.com/emscripten-core/emscripten/issues/12714
  sed -i 's/-msse/-msimd128 &/g' configure
  # Disable threading support, we rely on libvips' thread pool
  emconfigure ./configure --host=$CHOST --prefix=$TARGET --enable-static --disable-shared --disable-dependency-tracking \
    ${DISABLE_SIMD:+--disable-sse2 --disable-sse4.1} ${ENABLE_SIMD:+--enable-sse2 --enable-sse4.1} --disable-neon \
    --disable-gl --disable-sdl --disable-png --disable-jpeg --disable-tiff --disable-gif --disable-threading \
    --enable-libwebpmux --enable-libwebpdemux CPPFLAGS="-DWEBP_EXTERN=extern -DWEBP_DISABLE_STATS"
  emmake make install
)

echo "============================================="
echo "Compiling tiff"
echo "============================================="
test -f "$TARGET/lib/pkgconfig/libtiff-4.pc" || (
  mkdir $DEPS/tiff
  curl -Ls https://download.osgeo.org/libtiff/tiff-$VERSION_TIFF.tar.gz | tar xzC $DEPS/tiff --strip-components=1
  cd $DEPS/tiff
  emconfigure ./configure --host=$CHOST --prefix=$TARGET --enable-static --disable-shared --disable-dependency-tracking \
    --disable-mdi --disable-pixarlog --disable-old-jpeg --disable-cxx
  emmake make install
)

echo "============================================="
echo "Compiling vips"
echo "============================================="
test -f "$TARGET/lib/pkgconfig/vips.pc" || (
  mkdir $DEPS/vips
  curl -Ls https://github.com/libvips/libvips/releases/download/v$VERSION_VIPS-beta2/vips-$VERSION_VIPS.tar.gz | tar xzC $DEPS/vips --strip-components=1
  #curl -Ls https://github.com/libvips/libvips/tarball/$VERSION_VIPS | tar xzC $DEPS/vips --strip-components=1
  cd $DEPS/vips
  # Emscripten specific patches
  patch -p1 <$SOURCE_DIR/build/patches/vips-remove-orc.patch
  # TODO(kleisauke): Discuss these patches upstream
  patch -p1 <$SOURCE_DIR/build/patches/vips-speed-up-getpoint.patch
  patch -p1 <$SOURCE_DIR/build/patches/vips-blob-copy-malloc.patch
  # TODO(kleisauke): https://github.com/libvips/libvips/issues/1492
  patch -p1 <$SOURCE_DIR/build/patches/vips-1492.patch
  patch -p1 <$SOURCE_DIR/build/patches/vips-1492-emscripten.patch
  #patch -p1 <$SOURCE_DIR/build/patches/vips-1492-profiler.patch
  emconfigure ./autogen.sh --host=$CHOST --prefix=$TARGET --enable-static --disable-shared --disable-dependency-tracking \
    --disable-debug --disable-introspection --disable-deprecated --with-radiance --with-analyze --with-ppm --with-libexif \
    --with-lcms --with-jpeg --with-png --with-libwebp --with-tiff --without-giflib --without-rsvg --without-gsf --without-zlib \
    --without-fftw --without-magick --without-OpenEXR --without-nifti --without-heif --without-pdfium --without-poppler \
    --without-openslide --without-matio --without-cfitsio --without-pangoft2 --without-imagequant
  emmake make -C 'libvips' install
  emmake make install-pkgconfigDATA
)

echo "============================================="
echo "Compiling JS bindings"
echo "============================================="
(
  mkdir $DEPS/wasm-vips
  cd $DEPS/wasm-vips
  emcmake cmake $SOURCE_DIR -DCMAKE_BUILD_TYPE=Release -DCMAKE_RUNTIME_OUTPUT_DIRECTORY="$SOURCE_DIR/lib" \
    -DENVIRONMENT=${ENVIRONMENT//,/;}
  emmake make
  # FinalizationGroup -> FinalizationRegistry, see:
  # https://github.com/tc39/proposal-weakrefs/issues/180
  # https://github.com/emscripten-core/emscripten/issues/11436#issuecomment-645870155
  # sed -i 's/FinalizationGroup/FinalizationRegistry/g' $SOURCE_DIR/lib/vips.js
)
