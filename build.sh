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

# Fixed-width SIMD, enabled by default
# https://github.com/WebAssembly/simd
SIMD=true

# JS BigInt to Wasm i64 integration, enabled by default
# https://github.com/WebAssembly/JS-BigInt-integration
WASM_BIGINT=true

# WebAssembly-based file system layer for Emscripten, disabled by default
# https://github.com/emscripten-core/emscripten/issues/15041
WASM_FS=false

# Leverage Wasm EH instructions for setjmp/longjmp support
# and throwing/catching exceptions, disabled by default
# https://github.com/WebAssembly/exception-handling
WASM_EH=false

# Emit instructions for the standardized Wasm EH proposal with exnref
# (adopted on Oct 2023), disabled by default
# https://github.com/WebAssembly/exception-handling/issues/280
WASM_EXNREF=false

# Link-time optimizations (LTO), disabled by default
# https://github.com/emscripten-core/emscripten/issues/10603
LTO=false

# Position Independent Code (PIC), forcefully enabled as required by MAIN_MODULE
# TODO(kleisauke): Remove this once https://github.com/emscripten-core/emscripten/issues/12682 is fixed
PIC=true

# Dynamic loadable modules, enabled by default
MODULES=true

# Support for JPEG XL images, enabled by default
JXL=true

# Support for AVIF, enabled by default
AVIF=true

# Partial support for SVG load via resvg, enabled by default
SVG=true

# Build libvips C++ API, disabled by default
LIBVIPS_CPP=false

# Build bindings, enabled by default but can be disabled if you only need libvips
BINDINGS=true

# Parse arguments
while [ $# -gt 0 ]; do
  case $1 in
    --enable-lto) LTO=true ;;
    --enable-wasm-fs) WASM_FS=true ;;
    --enable-wasm-eh) WASM_EH=true ;;
    --enable-new-wasm-eh)
      WASM_EH=true
      WASM_EXNREF=true
      ;;
    --disable-simd) SIMD=false ;;
    --disable-wasm-bigint) WASM_BIGINT=false ;;
    --disable-jxl) JXL=false ;;
    --disable-avif) AVIF=false ;;
    --disable-svg) SVG=false ;;
    --disable-modules)
      PIC=false
      MODULES=false
      ;;
    --disable-bindings) BINDINGS=false ;;
    --enable-libvips-cpp) LIBVIPS_CPP=true ;;
    -e|--environment) ENVIRONMENT="$2"; shift ;;
    *) echo "ERROR: Unknown parameter: $1" >&2; exit 1 ;;
  esac
  shift
done

# Configure the ENABLE_* and DISABLE_* expansion helpers
for arg in SIMD JXL AVIF SVG PIC MODULES BINDINGS; do
  if [ "${!arg}" = "true" ]; then
    declare ENABLE_$arg=true
  else
    declare DISABLE_$arg=true
  fi
done

# Handy for debugging
#COMMON_FLAGS="-Og -gsource-map -pthread"
#export EMCC_DEBUG=1
#export EMCC_DEBUG_SAVE=1

# Handy for catching bugs
#COMMON_FLAGS="-Os -gsource-map -fsanitize=address -pthread"

# Specify location where source maps are published (browser specific)
#export LDFLAGS+=" --source-map-base http://localhost:3000/lib/"

# Rust flags
export RUSTFLAGS="-Ctarget-feature=+atomics -Zdefault-visibility=hidden -Zlocation-detail=none -Zfmt-debug=none"

# Common compiler flags
COMMON_FLAGS="-O3 -pthread"
if [ "$LTO" = "true" ]; then
  COMMON_FLAGS+=" -flto"
  export RUSTFLAGS+=" -Clto -Cembed-bitcode=yes"
fi
if [ "$WASM_EH" = "true" ]; then
  COMMON_FLAGS+=" -fwasm-exceptions -sSUPPORT_LONGJMP=wasm"
  # https://github.com/rust-lang/rust/pull/131830
  export RUSTFLAGS+=" -Zemscripten-wasm-eh"
  if [ "$WASM_EXNREF" = "true" ]; then
    COMMON_FLAGS+=" -sWASM_LEGACY_EXCEPTIONS=0"
    export RUSTFLAGS+=" -Cllvm-args=-wasm-use-legacy-eh=0"
  fi
else
  COMMON_FLAGS+=" -fexceptions"
fi

export CFLAGS="$COMMON_FLAGS -fvisibility=hidden"
if [ "$SIMD" = "true" ]; then
  export CFLAGS+=" -msimd128 -DWASM_SIMD_COMPAT_SLOW"
  export RUSTFLAGS+=" -Ctarget-feature=+simd128"
fi
[ "$PIC" = "false" ] || export CFLAGS+=" -fPIC"

export CXXFLAGS="$CFLAGS"

export LDFLAGS="$COMMON_FLAGS -L$TARGET/lib -sAUTO_JS_LIBRARIES=0 -sAUTO_NATIVE_LIBRARIES=0"
[ "$WASM_BIGINT" = "true" ] || export LDFLAGS+=" -sWASM_BIGINT=0"

# Build paths
export CPATH="$TARGET/include"
export PKG_CONFIG_PATH="$TARGET/lib/pkgconfig"
export EM_PKG_CONFIG_PATH="$PKG_CONFIG_PATH"

# Specific variables for cross-compilation
export CHOST="wasm32-unknown-linux" # wasm32-unknown-emscripten
export CMAKE_ARGS=""
export MESON_ARGS="--cross-file=$SOURCE_DIR/build/emscripten-cross.ini"
if [ "$WASM_EXNREF" = "true" ]; then
  # Requires Node >= 22
  # https://github.com/nodejs/node/pull/51362
  export CMAKE_ARGS+=" -DCMAKE_CROSSCOMPILING_EMULATOR=node;--experimental-wasm-exnref"
  export MESON_ARGS+=" --cross-file=$SOURCE_DIR/build/node-wasm-exnref.ini"
fi

# Run as many parallel jobs as there are available CPU cores
export MAKEFLAGS="-j$(nproc)"

# Ensure we link against internal/private dependencies
export PKG_CONFIG="pkg-config --static"

# Ensure Rust build path prefixes are removed from the resulting binaries
# https://reproducible-builds.org/docs/build-path/
export CARGO_PROFILE_RELEASE_TRIM_PATHS="all"

# Dependency version numbers
VERSION_ZLIB_NG=2.2.4       # https://github.com/zlib-ng/zlib-ng
VERSION_FFI=3.5.1           # https://github.com/libffi/libffi
VERSION_GLIB=2.85.1         # https://gitlab.gnome.org/GNOME/glib
VERSION_EXPAT=2.7.1         # https://github.com/libexpat/libexpat
VERSION_EXIF=0.6.25         # https://github.com/libexif/libexif
VERSION_LCMS2=2.17          # https://github.com/mm2/Little-CMS
VERSION_HWY=1.2.0           # https://github.com/google/highway
VERSION_BROTLI=1.1.0        # https://github.com/google/brotli
VERSION_MOZJPEG=4.1.5       # https://github.com/mozilla/mozjpeg
VERSION_JXL=0.11.1          # https://github.com/libjxl/libjxl
VERSION_SPNG=0.7.4          # https://github.com/randy408/libspng
VERSION_IMAGEQUANT=2.4.1    # https://github.com/lovell/libimagequant
VERSION_CGIF=0.5.0          # https://github.com/dloebl/cgif
VERSION_WEBP=1.5.0          # https://chromium.googlesource.com/webm/libwebp
VERSION_TIFF=4.7.0          # https://gitlab.com/libtiff/libtiff
VERSION_RESVG=0.45.1        # https://github.com/linebender/resvg
VERSION_AOM=3.12.1          # https://aomedia.googlesource.com/aom
VERSION_HEIF=1.19.8         # https://github.com/strukturag/libheif
VERSION_VIPS=8.17.0         # https://github.com/libvips/libvips

VERSION_EMSCRIPTEN="$(emcc -dumpversion)"

# Generate versions.json
( printf "{\n"; \
  [ -n "$DISABLE_AVIF" ] || printf "  \"aom\": \"${VERSION_AOM}\",\n"; \
  [ -n "$DISABLE_JXL" ] || printf "  \"brotli\": \"${VERSION_BROTLI}\",\n"; \
  printf "  \"cgif\": \"${VERSION_CGIF}\",\n"; \
  printf "  \"emscripten\": \"${VERSION_EMSCRIPTEN}\",\n"; \
  printf "  \"exif\": \"${VERSION_EXIF}\",\n"; \
  printf "  \"expat\": \"${VERSION_EXPAT}\",\n"; \
  printf "  \"ffi\": \"${VERSION_FFI}\",\n"; \
  printf "  \"glib\": \"${VERSION_GLIB}\",\n"; \
  [ -n "$DISABLE_AVIF" ] || printf "  \"heif\": \"${VERSION_HEIF}\",\n"; \
  [[ -n "$DISABLE_SIMD" && -n "$DISABLE_JXL" ]] || printf "  \"highway\": \"${VERSION_HWY}\",\n"; \
  printf "  \"imagequant\": \"${VERSION_IMAGEQUANT}\",\n"; \
  [ -n "$DISABLE_JXL" ] || printf "  \"jxl\": \"${VERSION_JXL}\",\n"; \
  printf "  \"lcms\": \"${VERSION_LCMS2}\",\n"; \
  printf "  \"mozjpeg\": \"${VERSION_MOZJPEG}\",\n"; \
  [ -n "$DISABLE_SVG" ] || printf "  \"resvg\": \"${VERSION_RESVG}\",\n"; \
  printf "  \"spng\": \"${VERSION_SPNG}\",\n"; \
  printf "  \"tiff\": \"${VERSION_TIFF}\",\n"; \
  printf "  \"vips\": \"${VERSION_VIPS}\",\n"; \
  printf "  \"webp\": \"${VERSION_WEBP}\",\n"; \
  printf "  \"zlib-ng\": \"${VERSION_ZLIB_NG}\"\n"; \
  printf '}'; ) \
>$TARGET/versions.json

# Remove patch version component
without_patch() {
  echo "${1%.[[:digit:]]*}"
}

# Remove prerelease suffix
without_prerelease() {
  echo "${1%-[[:alnum:]]*}"
}

title() {
  echo -ne "\e]0;$1\a"
}

stage() {
  title "$1"
  echo -e "\e[1;32m============================================="
  echo "$1"
  echo -e "=============================================\e[0m"
}

stage "Environment"
emcc --version
node --version

[ -f "$TARGET/lib/pkgconfig/zlib.pc" ] || (
  stage "Compiling zlib-ng"
  mkdir $DEPS/zlib-ng
  curl -Ls https://github.com/zlib-ng/zlib-ng/archive/refs/tags/$VERSION_ZLIB_NG.tar.gz | tar xzC $DEPS/zlib-ng --strip-components=1
  cd $DEPS/zlib-ng
  # SSE intrinsics needs to be checked for wasm32
  sed -i 's/BASEARCH_X86_FOUND/& OR BASEARCH_WASM32_FOUND/g' CMakeLists.txt
  emcmake cmake -B_build -H. -DCMAKE_BUILD_TYPE=Release -DCMAKE_INSTALL_PREFIX=$TARGET $CMAKE_ARGS -DBUILD_SHARED_LIBS=FALSE \
    ${DISABLE_SIMD:+-DWITH_OPTIM=FALSE} ${ENABLE_SIMD:+-DFORCE_SSE2=TRUE} -DWITH_RUNTIME_CPU_DETECTION=FALSE -DZLIB_COMPAT=TRUE \
    -DZLIB_ENABLE_TESTS=FALSE -DZLIBNG_ENABLE_TESTS=FALSE -DWITH_GTEST=FALSE
  make -C _build install
)

[ -f "$TARGET/lib/pkgconfig/libffi.pc" ] || (
  stage "Compiling ffi"
  mkdir $DEPS/ffi
  curl -Ls https://github.com/libffi/libffi/releases/download/v$VERSION_FFI/libffi-$VERSION_FFI.tar.gz | tar xzC $DEPS/ffi --strip-components=1
  cd $DEPS/ffi
  [ "$WASM_BIGINT" = "true" ] || curl -Ls https://github.com/libffi/libffi/compare/v$VERSION_FFI...kleisauke:disable-wasm-bigint.patch | patch -p1
  # Compile without -fexceptions
  sed -i 's/ -fexceptions//g' configure
  emconfigure ./configure --host=$CHOST --prefix=$TARGET --enable-static --disable-shared --disable-dependency-tracking \
    --disable-builddir --disable-multi-os-directory --disable-raw-api --disable-structs --disable-docs
  make install
)

[ -f "$TARGET/lib/pkgconfig/glib-2.0.pc" ] || (
  stage "Compiling glib"
  mkdir $DEPS/glib
  curl -Lks https://download.gnome.org/sources/glib/$(without_patch $VERSION_GLIB)/glib-$VERSION_GLIB.tar.xz | tar xJC $DEPS/glib --strip-components=1
  cd $DEPS/glib
  # TODO(kleisauke): Discuss these patches upstream
  curl -Ls https://github.com/GNOME/glib/compare/$VERSION_GLIB...kleisauke:wasm-vips-$VERSION_GLIB.patch | patch -p1
  meson setup _build --prefix=$TARGET $MESON_ARGS --default-library=static --buildtype=release \
    --force-fallback-for=gvdb -Dintrospection=disabled -Dselinux=disabled -Dxattr=false -Dlibmount=disabled -Dsysprof=disabled -Dnls=disabled \
    -Dglib_debug=disabled -Dtests=false -Dglib_assert=false -Dglib_checks=false
  meson install -C _build --tag devel
)

[ -f "$TARGET/lib/pkgconfig/expat.pc" ] || (
  stage "Compiling expat"
  mkdir $DEPS/expat
  curl -Ls https://github.com/libexpat/libexpat/releases/download/R_${VERSION_EXPAT//./_}/expat-$VERSION_EXPAT.tar.xz | tar xJC $DEPS/expat --strip-components=1
  cd $DEPS/expat
  emconfigure ./configure --host=$CHOST --prefix=$TARGET --enable-static --disable-shared --disable-dependency-tracking \
    --without-xmlwf --without-docbook --without-getrandom --without-sys-getrandom --without-examples --without-tests
  make install dist_cmake_DATA= nodist_cmake_DATA=
)

[ -f "$TARGET/lib/pkgconfig/libexif.pc" ] || (
  stage "Compiling exif"
  mkdir $DEPS/exif
  curl -Ls https://github.com/libexif/libexif/releases/download/v$VERSION_EXIF/libexif-$VERSION_EXIF.tar.xz | tar xJC $DEPS/exif --strip-components=1
  cd $DEPS/exif
  emconfigure ./configure --host=$CHOST --prefix=$TARGET --enable-static --disable-shared --disable-dependency-tracking \
    --disable-docs --disable-nls --without-libiconv-prefix --without-libintl-prefix CPPFLAGS="-DNO_VERBOSE_TAG_DATA"
  make install doc_DATA=
)

[ -f "$TARGET/lib/pkgconfig/lcms2.pc" ] || (
  stage "Compiling lcms2"
  mkdir $DEPS/lcms2
  curl -Ls https://github.com/mm2/Little-CMS/releases/download/lcms$VERSION_LCMS2/lcms2-$VERSION_LCMS2.tar.gz | tar xzC $DEPS/lcms2 --strip-components=1
  cd $DEPS/lcms2
  meson setup _build --prefix=$TARGET $MESON_ARGS --default-library=static --buildtype=release \
    -Dtests=disabled -Djpeg=disabled -Dtiff=disabled
  meson install -C _build --tag devel
)

[ -f "$TARGET/lib/pkgconfig/libhwy.pc" ] || [[ -n "$DISABLE_SIMD" && -n "$DISABLE_JXL" ]] || (
  stage "Compiling hwy"
  mkdir $DEPS/hwy
  curl -Ls https://github.com/google/highway/archive/refs/tags/$VERSION_HWY.tar.gz | tar xzC $DEPS/hwy --strip-components=1
  cd $DEPS/hwy
  # Remove build path from binary
  sed -i 's/HWY_ASSERT/HWY_DASSERT/' hwy/aligned_allocator.cc
  emcmake cmake -B_build -H. -DCMAKE_BUILD_TYPE=Release -DCMAKE_INSTALL_PREFIX=$TARGET $CMAKE_ARGS -DBUILD_SHARED_LIBS=FALSE \
    -DBUILD_TESTING=FALSE -DHWY_ENABLE_CONTRIB=FALSE -DHWY_ENABLE_EXAMPLES=FALSE -DHWY_ENABLE_TESTS=FALSE
  make -C _build install
)

[ -f "$TARGET/lib/pkgconfig/libbrotlicommon.pc" ] || [ -n "$DISABLE_JXL" ] || (
  stage "Compiling brotli"
  mkdir $DEPS/brotli
  curl -Ls https://github.com/google/brotli/archive/refs/tags/v$VERSION_BROTLI.tar.gz | tar xzC $DEPS/brotli --strip-components=1
  cd $DEPS/brotli
  # Exclude internal dictionary, see: https://github.com/emscripten-core/emscripten/issues/9960
  emcmake cmake -B_build -H. -DCMAKE_BUILD_TYPE=Release -DCMAKE_INSTALL_PREFIX=$TARGET $CMAKE_ARGS -DBROTLI_DISABLE_TESTS=TRUE \
    -DCMAKE_C_FLAGS="$CFLAGS -DBROTLI_EXTERNAL_DICTIONARY_DATA"
  make -C _build install
)

[ -f "$TARGET/lib/pkgconfig/libjpeg.pc" ] || (
  stage "Compiling jpeg"
  mkdir $DEPS/jpeg
  curl -Ls https://github.com/mozilla/mozjpeg/archive/refs/tags/v$VERSION_MOZJPEG.tar.gz | tar xzC $DEPS/jpeg --strip-components=1
  cd $DEPS/jpeg
  # TODO(kleisauke): Discuss this patch upstream
  curl -Ls https://github.com/kleisauke/libjpeg-turbo/commit/a60fb467fc7601b008741d42e98268c8a7bcb5b4.patch | patch -p1
  # Compile without SIMD support, see: https://github.com/libjpeg-turbo/libjpeg-turbo/issues/250
  # Disable environment variables usage, see: https://github.com/libjpeg-turbo/libjpeg-turbo/issues/600
  emcmake cmake -B_build -H. -DCMAKE_BUILD_TYPE=Release -DCMAKE_INSTALL_PREFIX=$TARGET $CMAKE_ARGS -DENABLE_STATIC=TRUE \
    -DENABLE_SHARED=FALSE -DWITH_JPEG8=TRUE -DWITH_SIMD=FALSE -DWITH_TURBOJPEG=FALSE -DPNG_SUPPORTED=FALSE \
    -DCMAKE_C_FLAGS="$CFLAGS -DNO_GETENV -DNO_PUTENV"
  make -C _build install
)

[ -f "$TARGET/lib/pkgconfig/libjxl.pc" ] || [ -n "$DISABLE_JXL" ] || (
  stage "Compiling jxl"
  mkdir $DEPS/jxl
  curl -Ls https://github.com/libjxl/libjxl/archive/refs/tags/v$VERSION_JXL.tar.gz | tar xzC $DEPS/jxl --strip-components=1
  cd $DEPS/jxl
  emcmake cmake -B_build -H. -DCMAKE_BUILD_TYPE=Release -DCMAKE_INSTALL_PREFIX=$TARGET $CMAKE_ARGS -DCMAKE_FIND_ROOT_PATH=$TARGET \
    -DBUILD_SHARED_LIBS=FALSE -DBUILD_TESTING=FALSE -DJPEGXL_ENABLE_TOOLS=FALSE -DJPEGXL_ENABLE_JPEGLI=FALSE \
    -DJPEGXL_ENABLE_EXAMPLES=FALSE -DJPEGXL_ENABLE_SJPEG=FALSE -DJPEGXL_ENABLE_SKCMS=FALSE -DJPEGXL_BUNDLE_LIBPNG=FALSE \
    -DJPEGXL_FORCE_SYSTEM_BROTLI=TRUE -DJPEGXL_FORCE_SYSTEM_LCMS2=TRUE -DJPEGXL_FORCE_SYSTEM_HWY=TRUE \
    -DJPEGXL_ENABLE_TRANSCODE_JPEG=FALSE # libvips always decodes to pixels
  make -C _build install
  if [ -n "$ENABLE_MODULES" ]; then
    # Ensure we don't link with highway in the vips-jxl side module
    [ -n "$DISABLE_SIMD" ] || sed -i '/^Requires:/s/ libhwy//' $TARGET/lib/pkgconfig/libjxl.pc
    # ... and the same for lcms2
    sed -i '/^Requires:/s/ lcms2//' $TARGET/lib/pkgconfig/libjxl_cms.pc
    # ... and the same for -lc++, see:
    # https://github.com/emscripten-core/emscripten/issues/16680#issuecomment-1558015445
    sed -i '/^Libs/s/ -lc++//g' $TARGET/lib/pkgconfig/libjxl{,_cms}.pc
  fi
)

[ -f "$TARGET/lib/pkgconfig/spng.pc" ] || (
  stage "Compiling spng"
  mkdir $DEPS/spng
  curl -Ls https://github.com/randy408/libspng/archive/refs/tags/v$VERSION_SPNG.tar.gz | tar xzC $DEPS/spng --strip-components=1
  cd $DEPS/spng
  # TODO(kleisauke): Discuss this patch upstream
  curl -Ls https://github.com/randy408/libspng/compare/v$VERSION_SPNG...kleisauke:wasm-vips.patch | patch -p1
  # Switch the default zlib compression strategy to Z_RLE, as this is especially suitable for PNG images
  sed -i 's/Z_FILTERED/Z_RLE/g' spng/spng.c
  meson setup _build --prefix=$TARGET $MESON_ARGS --default-library=static --buildtype=release \
    -Dbuild_examples=false -Dstatic_zlib=true ${DISABLE_SIMD:+-Denable_opt=false} ${ENABLE_SIMD:+-Dc_args="$CFLAGS -msse4.1 -DSPNG_SSE=4"}
  meson install -C _build --tag devel
)

[ -f "$TARGET/lib/pkgconfig/imagequant.pc" ] || (
  stage "Compiling imagequant"
  mkdir $DEPS/imagequant
  curl -Ls https://github.com/lovell/libimagequant/archive/refs/tags/v$VERSION_IMAGEQUANT.tar.gz | tar xzC $DEPS/imagequant --strip-components=1
  cd $DEPS/imagequant
  meson setup _build --prefix=$TARGET $MESON_ARGS --default-library=static --buildtype=release \
    ${ENABLE_SIMD:+-Dc_args="$CFLAGS -msse -DUSE_SSE=1"}
  meson install -C _build --tag devel
)

[ -f "$TARGET/lib/pkgconfig/cgif.pc" ] || (
  stage "Compiling cgif"
  mkdir $DEPS/cgif
  curl -Ls https://github.com/dloebl/cgif/archive/refs/tags/v$VERSION_CGIF.tar.gz | tar xzC $DEPS/cgif --strip-components=1
  cd $DEPS/cgif
  meson setup _build --prefix=$TARGET $MESON_ARGS --default-library=static --buildtype=release \
    -Dexamples=false -Dtests=false
  meson install -C _build --tag devel
)

[ -f "$TARGET/lib/pkgconfig/libwebp.pc" ] || (
  stage "Compiling webp"
  mkdir $DEPS/webp
  curl -Ls https://storage.googleapis.com/downloads.webmproject.org/releases/webp/libwebp-$VERSION_WEBP.tar.gz | tar xzC $DEPS/webp --strip-components=1
  cd $DEPS/webp
  # Prepend `-msimd128` to SSE flags, see: https://github.com/emscripten-core/emscripten/issues/12714
  sed -i 's/-msse/-msimd128 &/g' configure
  # Disable threading support, we rely on libvips' thread pool
  emconfigure ./configure --host=$CHOST --prefix=$TARGET --enable-static --disable-shared --disable-dependency-tracking \
    ${DISABLE_SIMD:+--disable-sse2 --disable-sse4.1} ${ENABLE_SIMD:+--enable-sse2 --enable-sse4.1} --disable-neon \
    --disable-gl --disable-sdl --disable-png --disable-jpeg --disable-tiff --disable-gif --disable-threading \
    --enable-libwebpmux --enable-libwebpdemux CPPFLAGS="-DWEBP_DISABLE_STATS -DWEBP_REDUCE_CSP"
  make install bin_PROGRAMS= noinst_PROGRAMS= man_MANS=
)

[ -f "$TARGET/lib/pkgconfig/libtiff-4.pc" ] || (
  stage "Compiling tiff"
  mkdir $DEPS/tiff
  curl -Ls https://download.osgeo.org/libtiff/tiff-$VERSION_TIFF.tar.gz | tar xzC $DEPS/tiff --strip-components=1
  cd $DEPS/tiff
  emconfigure ./configure --host=$CHOST --prefix=$TARGET --enable-static --disable-shared --disable-dependency-tracking \
    --disable-tools --disable-tests --disable-contrib --disable-docs --disable-mdi --disable-pixarlog --disable-old-jpeg --disable-cxx
  make install noinst_PROGRAMS= dist_doc_DATA=
)

[ -f "$TARGET/lib/libresvg.a" ] || [ -n "$DISABLE_SVG" ] || (
  stage "Compiling resvg"
  mkdir -p $DEPS/resvg
  curl -Ls https://github.com/linebender/resvg/releases/download/v$VERSION_RESVG/resvg-$VERSION_RESVG.tar.xz | tar xJC $DEPS/resvg --strip-components=1
  cd $DEPS/resvg
  # Vendor dir doesn't work with -Zbuild-std due to https://github.com/rust-lang/wg-cargo-std-aware/issues/23
  # Just delete the config so that all deps are downloaded from the internet
  rm .cargo/config
  # We don't want to build the shared library
  sed -i '/^crate-type =/s/"cdylib", //' crates/c-api/Cargo.toml
  cargo build --manifest-path=crates/c-api/Cargo.toml --release --target wasm32-unknown-emscripten --locked \
    -Zbuild-std=panic_abort,std -Ztrim-paths --no-default-features --features raster-images
  cp target/wasm32-unknown-emscripten/release/libresvg.a $TARGET/lib/
  cp crates/c-api/resvg.h $TARGET/include/
)

[ -f "$TARGET/lib/pkgconfig/aom.pc" ] || [ -n "$DISABLE_AVIF" ] || (
  stage "Compiling aom"
  mkdir $DEPS/aom
  curl -Ls https://storage.googleapis.com/aom-releases/libaom-$VERSION_AOM.tar.gz | tar xzC $DEPS/aom --strip-components=1
  cd $DEPS/aom
  emcmake cmake -B_build -H. -DCMAKE_BUILD_TYPE=Release -DCMAKE_INSTALL_PREFIX=$TARGET $CMAKE_ARGS \
    -DAOM_TARGET_CPU=generic ${ENABLE_PIC:+-DCONFIG_PIC=1} -DCONFIG_RUNTIME_CPU_DETECT=0 \
    -DENABLE_DOCS=FALSE -DENABLE_TESTS=FALSE -DENABLE_EXAMPLES=FALSE -DENABLE_TOOLS=FALSE \
    -DCONFIG_WEBM_IO=0 -DCONFIG_AV1_HIGHBITDEPTH=0 \
    -DCONFIG_MULTITHREAD=0 # Disable threading support, we rely on libvips' thread pool.
  make -C _build install
)

[ -f "$TARGET/lib/pkgconfig/libheif.pc" ] || [ -n "$DISABLE_AVIF" ] || (
  stage "Compiling libheif"
  mkdir $DEPS/heif
  curl -Ls https://github.com/strukturag/libheif/releases/download/v$VERSION_HEIF/libheif-$VERSION_HEIF.tar.gz | tar xzC $DEPS/heif --strip-components=1
  cd $DEPS/heif
  # Note: without CMAKE_FIND_ROOT_PATH find_path for AOM is not working for some reason (see https://github.com/emscripten-core/emscripten/issues/10078).
  # Compile with -D__EMSCRIPTEN_STANDALONE_WASM__ to disable the Embind implementation.
  emcmake cmake -B_build -H. -DCMAKE_BUILD_TYPE=Release -DCMAKE_INSTALL_PREFIX=$TARGET $CMAKE_ARGS -DCMAKE_FIND_ROOT_PATH=$TARGET \
    -DBUILD_SHARED_LIBS=FALSE -DCMAKE_POSITION_INDEPENDENT_CODE=$PIC -DENABLE_PLUGIN_LOADING=FALSE \
    -DBUILD_TESTING=FALSE -DWITH_EXAMPLES=FALSE -DWITH_LIBDE265=FALSE -DWITH_X265=FALSE -DWITH_OpenH264_DECODER=FALSE \
    -DCMAKE_CXX_FLAGS="$CXXFLAGS -D__EMSCRIPTEN_STANDALONE_WASM__" \
    -DENABLE_MULTITHREADING_SUPPORT=FALSE # Disable threading support, we rely on libvips' thread pool.
  make -C _build install
  if [ -n "$ENABLE_MODULES" ]; then
    # Ensure we don't link with libsharpyuv in the vips-heif side module
    sed -i '/^Requires.private:/s/ libsharpyuv//' $TARGET/lib/pkgconfig/libheif.pc
    # ... and the same for -lc++, see:
    # https://github.com/emscripten-core/emscripten/issues/16680#issuecomment-1558015445
    sed -i '/^Libs.private:/s/ -lc++//' $TARGET/lib/pkgconfig/libheif.pc
  fi
)

[ -f "$TARGET/lib/pkgconfig/vips.pc" ] || (
  stage "Compiling vips"
  mkdir $DEPS/vips
  curl -Ls https://github.com/libvips/libvips/releases/download/v$VERSION_VIPS/vips-$VERSION_VIPS.tar.xz | tar xJC $DEPS/vips --strip-components=1
  cd $DEPS/vips
  # Emscripten specific patches
  curl -Ls https://github.com/libvips/libvips/compare/v$VERSION_VIPS...kleisauke:wasm-vips-8.17.patch | patch -p1
  # Disable building man pages, gettext po files, tools, and (fuzz-)tests
  sed -i "/subdir('man')/{N;N;N;N;d;}" meson.build
  meson setup _build --prefix=$TARGET $MESON_ARGS --default-library=static --buildtype=release \
    -Ddeprecated=false -Dexamples=false -Dcplusplus=$LIBVIPS_CPP -Dauto_features=disabled \
    ${DISABLE_MODULES:+-Dmodules=disabled} -Dcgif=enabled -Dexif=enabled ${ENABLE_AVIF:+-Dheif=enabled} \
    -Dheif-module=enabled -Dimagequant=enabled -Djpeg=enabled ${ENABLE_JXL:+-Djpeg-xl=enabled} \
    -Djpeg-xl-module=enabled -Dlcms=enabled ${ENABLE_SIMD:+-Dhighway=enabled} ${ENABLE_SVG:+-Dresvg=enabled} \
    -Dresvg-module=enabled -Dspng=enabled -Dtiff=enabled -Dwebp=enabled -Dnsgif=true -Dppm=true -Danalyze=true \
    -Dradiance=true -Dzlib=enabled
  meson install -C _build --tag runtime,devel
  # Emscripten requires linking to side modules to find the necessary symbols to export
  module_dir=$(printf '%s\n' $TARGET/lib/vips-modules-* | sort -n | tail -1)
  [ -d "$module_dir" ] && modules=$(find $module_dir/ -type f -printf " %p") || true
  sed -i "/^Libs:/ s/$/${modules//\//\\/}/" $TARGET/lib/pkgconfig/vips.pc
)

[ -n "$DISABLE_BINDINGS" ] || (
  stage "Compiling JS bindings"
  mkdir $DEPS/wasm-vips
  cd $DEPS/wasm-vips
  emcmake cmake $SOURCE_DIR -DCMAKE_BUILD_TYPE=Release -DCMAKE_RUNTIME_OUTPUT_DIRECTORY="$SOURCE_DIR/lib" $CMAKE_ARGS \
    -DENVIRONMENT=${ENVIRONMENT//,/;} -DENABLE_MODULES=$MODULES -DENABLE_WASMFS=$WASM_FS
  make
)

[ -n "$DISABLE_BINDINGS" ] || [ "$ENVIRONMENT" != "web,node" ] || (
  # Building for both Node.js and web, prepare NPM package
  stage "Prepare NPM package"

  # The produced binary should be the same across the different variants (sanity check)
  expected_sha256=$(sha256sum "$SOURCE_DIR/lib/vips.wasm" | awk '{ print $1 }')
  for file in vips-es6.wasm vips-node.wasm vips-node-es6.wasm; do
    echo "$expected_sha256 $SOURCE_DIR/lib/$file" | sha256sum --check --quiet
    rm $SOURCE_DIR/lib/$file
  done

  # Use a single wasm binary for web and Node.js
  for file in vips-es6.js vips-node.js vips-node-es6.mjs; do
    sed -i "s/${file%.*}.wasm/vips.wasm/g" $SOURCE_DIR/lib/$file
  done

  # Omit -es6 suffix from Node.js files
  mv $SOURCE_DIR/lib/vips-node-es6.mjs $SOURCE_DIR/lib/vips-node.mjs
  sed -i 's/vips-node-es6/vips-node/g' $SOURCE_DIR/lib/vips-node.mjs

  # Print the target features section
  echo -n "Used Wasm features: "
  $EMSDK/upstream/bin/wasm-opt --mvp-features --print-features -o /dev/null $SOURCE_DIR/lib/vips.wasm | \
    sed 's/^--enable-//' | paste -sd' '

  # Copy dynamic loadable modules
  module_dir=$(printf '%s\n' $TARGET/lib/vips-modules-* | sort -n | tail -1)
  [ -d "$module_dir" ] && cp $module_dir/* $SOURCE_DIR/lib || true

  # Copy versions.json
  cp $TARGET/versions.json $SOURCE_DIR
)
