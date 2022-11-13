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

# setjmp/longjmp support using Wasm EH instructions, disabled by default
# https://github.com/WebAssembly/exception-handling
WASM_EH=false

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

# Parse arguments
while [ $# -gt 0 ]; do
  case $1 in
    --enable-lto) LTO=true ;;
    --enable-wasm-fs) WASM_FS=true ;;
    --enable-wasm-eh) WASM_EH=true ;;
    --disable-simd) SIMD=false ;;
    --disable-wasm-bigint) WASM_BIGINT=false ;;
    --disable-jxl) JXL=false ;;
    --disable-modules)
      PIC=false
      MODULES=false
      ;;
    -e|--environment) ENVIRONMENT="$2"; shift ;;
    *) echo "ERROR: Unknown parameter: $1" >&2; exit 1 ;;
  esac
  shift
done

# Configure flags helpers
if [ "$SIMD" = "true" ]; then
  ENABLE_SIMD=true
else
  DISABLE_SIMD=true
fi
if [ "$MODULES" = "true" ]; then
  ENABLE_MODULES=true
else
  DISABLE_MODULES=true
fi
if [ "$JXL" = "true" ]; then
  ENABLE_JXL=true
else
  DISABLE_JXL=true
fi

# Embuilder flags
if [ "$LTO" = "true" ]; then LTO_FLAG=--lto; fi
if [ "$PIC" = "true" ]; then PIC_FLAG=--pic; fi

# Handy for debugging
#export CFLAGS="-O0 -gsource-map -pthread"
#export CXXFLAGS="$CFLAGS"
#export LDFLAGS="-L$TARGET/lib -O0 -gsource-map"
#export EMCC_DEBUG=1

# Handy for catching bugs
#export CFLAGS="-Os -gsource-map -fsanitize=address -pthread"
#export CXXFLAGS="$CFLAGS"
#export LDFLAGS="-L$TARGET/lib -Os -gsource-map -fsanitize=address -sINITIAL_MEMORY=64MB"

# Specify location where source maps are published (browser specific)
#export LDFLAGS+=" --source-map-base http://localhost:3000/lib/"

# Common compiler flags
export CFLAGS="-O3 -fno-rtti -fno-exceptions -mnontrapping-fptoint -pthread"
if [ "$SIMD" = "true" ]; then export CFLAGS+=" -msimd128 -DWASM_SIMD_COMPAT_SLOW"; fi
if [ "$WASM_BIGINT" = "true" ]; then
  # libffi needs to detect WASM_BIGINT support at compile time
  export CFLAGS+=" -DWASM_BIGINT"
fi
if [ "$WASM_FS" = "true" ]; then export CFLAGS+=" -DWASMFS"; fi
if [ "$WASM_EH" = "true" ]; then export CFLAGS+=" -sSUPPORT_LONGJMP=wasm"; fi
if [ "$LTO" = "true" ]; then export CFLAGS+=" -flto"; fi
if [ "$PIC" = "true" ]; then export CFLAGS+=" -fPIC"; fi
export CXXFLAGS="$CFLAGS"
export LDFLAGS="-L$TARGET/lib -O3"
if [ "$WASM_BIGINT" = "true" ]; then export LDFLAGS+=" -sWASM_BIGINT"; fi
if [ "$WASM_FS" = "true" ]; then export LDFLAGS+=" -sWASMFS"; fi
if [ "$WASM_EH" = "true" ]; then export LDFLAGS+=" -sSUPPORT_LONGJMP=wasm"; fi
if [ "$LTO" = "true" ]; then export LDFLAGS+=" -flto"; fi

# Build paths
export CPATH="$TARGET/include"
export PKG_CONFIG_PATH="$TARGET/lib/pkgconfig"
export EM_PKG_CONFIG_PATH="$PKG_CONFIG_PATH"

# Specific variables for cross-compilation
export CHOST="wasm32-unknown-linux" # wasm32-unknown-emscripten
export MESON_CROSS="$SOURCE_DIR/build/emscripten-crossfile.meson"

# Run as many parallel jobs as there are available CPU cores
export MAKEFLAGS="-j$(nproc)"

# Dependency version numbers
VERSION_ZLIBNG=2.0.6        # https://github.com/zlib-ng/zlib-ng
VERSION_FFI=3.4.4           # https://github.com/libffi/libffi
VERSION_GLIB=2.75.0         # https://gitlab.gnome.org/GNOME/glib
VERSION_EXPAT=2.5.0         # https://github.com/libexpat/libexpat
VERSION_EXIF=0.6.24         # https://github.com/libexif/libexif
VERSION_LCMS2=2.14          # https://github.com/mm2/Little-CMS
VERSION_HWY=1.0.2           # https://github.com/google/highway
VERSION_BROTLI=f4153a       # https://github.com/google/brotli
VERSION_JPEG=4.1.1          # https://github.com/mozilla/mozjpeg
VERSION_JXL=0.7.0           # https://github.com/libjxl/libjxl
VERSION_SPNG=0.7.2          # https://github.com/randy408/libspng
VERSION_IMAGEQUANT=2.4.1    # https://github.com/lovell/libimagequant
VERSION_CGIF=0.3.0          # https://github.com/dloebl/cgif
VERSION_WEBP=1.2.4          # https://chromium.googlesource.com/webm/libwebp
VERSION_TIFF=4.4.0          # https://gitlab.com/libtiff/libtiff
VERSION_VIPS=8.13.3         # https://github.com/libvips/libvips

# Remove patch version component
without_patch() {
  echo "${1%.[[:digit:]]*}"
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

stage "Set-up environment"
emcc --version
node --version

cd $(dirname $(which emcc))

# Assumes that the patches have already been applied when not running in a container
if [ "$RUNNING_IN_CONTAINER" = true ]; then
  # TODO(kleisauke): Discuss these patches upstream
  curl -Ls https://github.com/emscripten-core/emscripten/compare/3.1.25...kleisauke:wasm-vips-3.1.25.patch | patch -p1

  # The system headers require to be reinstalled, as some of
  # them have been changed with the patches above
  embuilder.py build sysroot --force

  # Need to rebuild libembind, libc, and libwasmfs, since we
  # also modified it with the patches above
  embuilder.py build libembind libc-mt{,-debug} libwasmfs-mt{,-debug} --force $LTO_FLAG $PIC_FLAG
fi

[ -f "$TARGET/lib/pkgconfig/zlib.pc" ] || (
  stage "Compiling zlib-ng"
  mkdir $DEPS/zlib-ng
  curl -Ls https://github.com/zlib-ng/zlib-ng/archive/refs/tags/$VERSION_ZLIBNG.tar.gz | tar xzC $DEPS/zlib-ng --strip-components=1
  cd $DEPS/zlib-ng
  # SSE intrinsics needs to be checked for wasm32
  sed -i 's/|\s*x86_64/& | wasm32/g' configure
  # Correct SSSE3 intrinsics header
  sed -i 's/x86intrin.h/immintrin.h/g' configure
  # Avoid CPU checks at runtime
  sed -i 's/\s-DX86_FEATURES//g' configure
  sed -i 's/\sx86.l*o//g' configure
  sed -i '/x86_cpu_has_ssse3/d' functable.c
  emconfigure ./configure --prefix=$TARGET --static --zlib-compat ${DISABLE_SIMD:+--without-optimizations} \
    ${ENABLE_SIMD:+--force-sse2} --without-acle --without-neon
  make install
)

[ -f "$TARGET/lib/pkgconfig/libffi.pc" ] || (
  stage "Compiling ffi"
  mkdir $DEPS/ffi
  curl -Ls https://github.com/libffi/libffi/releases/download/v$VERSION_FFI/libffi-$VERSION_FFI.tar.gz | tar xzC $DEPS/ffi --strip-components=1
  cd $DEPS/ffi
  # TODO(kleisauke): https://github.com/hoodmane/libffi-emscripten/issues/16
  curl -Ls https://github.com/libffi/libffi/compare/v$VERSION_FFI...kleisauke:wasm-vips.patch | patch -p1
  autoreconf -fiv
  # Compile without -fexceptions
  sed -i 's/ -fexceptions//g' configure
  emconfigure ./configure --host=$CHOST --prefix=$TARGET --enable-static --disable-shared --disable-dependency-tracking \
    --disable-builddir --disable-multi-os-directory --disable-raw-api --disable-structs --disable-docs
  make install SUBDIRS='include'
)

[ -f "$TARGET/lib/pkgconfig/glib-2.0.pc" ] || (
  stage "Compiling glib"
  mkdir $DEPS/glib
  curl -Lks https://download.gnome.org/sources/glib/$(without_patch $VERSION_GLIB)/glib-$VERSION_GLIB.tar.xz | tar xJC $DEPS/glib --strip-components=1
  cd $DEPS/glib
  # TODO(kleisauke): Discuss these patches upstream
  curl -Ls https://github.com/GNOME/glib/compare/$VERSION_GLIB...kleisauke:wasm-vips-$VERSION_GLIB.patch | patch -p1
  meson setup _build --prefix=$TARGET --cross-file=$MESON_CROSS --default-library=static --buildtype=release \
    --force-fallback-for=gvdb -Dselinux=disabled -Dxattr=false -Dlibmount=disabled -Dnls=disabled \
    -Dtests=false -Dglib_assert=false -Dglib_checks=false
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
  curl -Ls https://github.com/libexif/libexif/releases/download/v$VERSION_EXIF/libexif-$VERSION_EXIF.tar.bz2 | tar xjC $DEPS/exif --strip-components=1
  cd $DEPS/exif
  emconfigure ./configure --host=$CHOST --prefix=$TARGET --enable-static --disable-shared --disable-dependency-tracking \
    --disable-docs --disable-nls --without-libiconv-prefix --without-libintl-prefix CPPFLAGS="-DNO_VERBOSE_TAG_DATA"
  make install SUBDIRS='libexif' doc_DATA=
)

[ -f "$TARGET/lib/pkgconfig/lcms2.pc" ] || (
  stage "Compiling lcms2"
  mkdir $DEPS/lcms2
  curl -Ls https://github.com/mm2/Little-CMS/releases/download/lcms$VERSION_LCMS2/lcms2-$VERSION_LCMS2.tar.gz | tar xzC $DEPS/lcms2 --strip-components=1
  cd $DEPS/lcms2
  # Disable threading support, we rely on libvips' thread pool
  emconfigure ./configure --host=$CHOST --prefix=$TARGET --enable-static --disable-shared --disable-dependency-tracking \
   --without-threads --without-jpeg --without-tiff --without-zlib
  make install SUBDIRS='src include'
)

[ -f "$TARGET/lib/pkgconfig/libhwy.pc" ] || [ -n "$DISABLE_JXL" ] || (
  stage "Compiling hwy"
  mkdir $DEPS/hwy
  curl -Ls https://github.com/google/highway/archive/refs/tags/$VERSION_HWY.tar.gz | tar xzC $DEPS/hwy --strip-components=1
  cd $DEPS/hwy
  emcmake cmake -B_build -H. -DCMAKE_BUILD_TYPE=Release -DCMAKE_INSTALL_PREFIX=$TARGET -DBUILD_SHARED_LIBS=FALSE \
    -DBUILD_TESTING=FALSE -DHWY_ENABLE_CONTRIB=FALSE -DHWY_ENABLE_EXAMPLES=FALSE
  make -C _build install
)

[ -f "$TARGET/lib/pkgconfig/libbrotlicommon.pc" ] || [ -n "$DISABLE_JXL" ] || (
  stage "Compiling brotli"
  mkdir $DEPS/brotli
  curl -Ls https://github.com/google/brotli/archive/$VERSION_BROTLI.tar.gz | tar xzC $DEPS/brotli --strip-components=1
  cd $DEPS/brotli
  # https://github.com/google/brotli/pull/655
  patch -p1 <$SOURCE_DIR/build/patches/brotli-655.patch
  # Exclude internal dictionary, see: https://github.com/emscripten-core/emscripten/issues/9960
  emcmake cmake -B_build -H. -DCMAKE_BUILD_TYPE=Release -DCMAKE_INSTALL_PREFIX=$TARGET -DBROTLI_DISABLE_TESTS=TRUE \
    -DCMAKE_C_FLAGS="$CFLAGS -DBROTLI_EXTERNAL_DICTIONARY_DATA"
  make -C _build install
)

[ -f "$TARGET/lib/pkgconfig/libjpeg.pc" ] || (
  stage "Compiling jpeg"
  mkdir $DEPS/jpeg
  curl -Ls https://github.com/mozilla/mozjpeg/archive/refs/tags/v$VERSION_JPEG.tar.gz | tar xzC $DEPS/jpeg --strip-components=1
  cd $DEPS/jpeg
  # Compile without SIMD support, see: https://github.com/libjpeg-turbo/libjpeg-turbo/issues/250
  # Disable environment variables usage, see: https://github.com/libjpeg-turbo/libjpeg-turbo/issues/600
  emcmake cmake -B_build -H. -DCMAKE_BUILD_TYPE=Release -DCMAKE_INSTALL_PREFIX=$TARGET -DENABLE_STATIC=TRUE \
    -DENABLE_SHARED=FALSE -DWITH_JPEG8=TRUE -DWITH_SIMD=FALSE -DWITH_TURBOJPEG=FALSE -DPNG_SUPPORTED=FALSE \
    -DCMAKE_C_FLAGS="$CFLAGS -DNO_GETENV -DNO_PUTENV"
  make -C _build install
)

[ -f "$TARGET/lib/pkgconfig/libjxl.pc" ] || [ -n "$DISABLE_JXL" ] || (
  stage "Compiling jxl"
  mkdir $DEPS/jxl
  curl -Ls https://github.com/libjxl/libjxl/archive/refs/tags/v$VERSION_JXL.tar.gz | tar xzC $DEPS/jxl --strip-components=1
  cd $DEPS/jxl
  # Avoid bundling libpng, see: https://github.com/libjxl/libjxl/pull/1726
  sed -i 's/JPEGXL_EMSCRIPTEN/& AND JPEGXL_BUNDLE_LIBPNG/' third_party/CMakeLists.txt
  # CMake < 3.19 workaround, see: https://github.com/libjxl/libjxl/issues/1425
  sed -i 's/lcms2,INCLUDE_DIRECTORIES/lcms2,INTERFACE_INCLUDE_DIRECTORIES/' lib/jxl.cmake
  emcmake cmake -B_build -H. -DCMAKE_BUILD_TYPE=Release -DCMAKE_INSTALL_PREFIX=$TARGET -DCMAKE_FIND_ROOT_PATH=$TARGET \
    -DBUILD_SHARED_LIBS=FALSE -DBUILD_TESTING=FALSE -DJPEGXL_ENABLE_TOOLS=FALSE -DJPEGXL_ENABLE_EXAMPLES=FALSE \
    -DJPEGXL_ENABLE_SJPEG=FALSE -DJPEGXL_ENABLE_SKCMS=FALSE -DJPEGXL_BUNDLE_LIBPNG=FALSE -DJPEGXL_ENABLE_TRANSCODE_JPEG=FALSE \
    -DJPEGXL_FORCE_SYSTEM_BROTLI=TRUE -DJPEGXL_FORCE_SYSTEM_LCMS2=TRUE -DJPEGXL_FORCE_SYSTEM_HWY=TRUE \
    -DCMAKE_C_FLAGS="$CFLAGS -DJXL_DEBUG_ON_ABORT=0" -DCMAKE_CXX_FLAGS="$CXXFLAGS -DJXL_DEBUG_ON_ABORT=0"
  make -C _build install
  if [ -n "$ENABLE_MODULES" ]; then
    # Ensure we don't link with lcms2 in the vips-jxl side module
    sed -i '/^Requires.private:/s/ lcms2//' $TARGET/lib/pkgconfig/libjxl.pc
    # Ensure the vips-jxl side module links against the private dependencies
    sed -i 's/Requires.private/Requires/' $TARGET/lib/pkgconfig/libjxl.pc
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
  meson setup _build --prefix=$TARGET --cross-file=$MESON_CROSS --default-library=static --buildtype=release \
    -Dbuild_examples=false -Dstatic_zlib=true ${DISABLE_SIMD:+-Denable_opt=false} ${ENABLE_SIMD:+-Dc_args="$CFLAGS -msse4.1 -DSPNG_SSE=4"}
  meson install -C _build --tag devel
)

[ -f "$TARGET/lib/pkgconfig/imagequant.pc" ] || (
  stage "Compiling imagequant"
  mkdir $DEPS/imagequant
  curl -Ls https://github.com/lovell/libimagequant/archive/refs/tags/v$VERSION_IMAGEQUANT.tar.gz | tar xzC $DEPS/imagequant --strip-components=1
  cd $DEPS/imagequant
  # TODO(kleisauke): Discuss this patch upstream
  curl -Ls https://github.com/lovell/libimagequant/compare/v$VERSION_IMAGEQUANT...kleisauke:wasm-vips.patch | patch -p1
  meson setup _build --prefix=$TARGET --cross-file=$MESON_CROSS --default-library=static --buildtype=release \
    ${ENABLE_SIMD:+-Dc_args="$CFLAGS -msse -DUSE_SSE=1"}
  meson install -C _build --tag devel
)

[ -f "$TARGET/lib/pkgconfig/cgif.pc" ] || (
  stage "Compiling cgif"
  mkdir $DEPS/cgif
  curl -Ls https://github.com/dloebl/cgif/archive/refs/tags/V$VERSION_CGIF.tar.gz | tar xzC $DEPS/cgif --strip-components=1
  cd $DEPS/cgif
  meson setup _build --prefix=$TARGET --cross-file=$MESON_CROSS --default-library=static --buildtype=release \
    -Dtests=false
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
    --disable-mdi --disable-pixarlog --disable-old-jpeg --disable-cxx
  make install SUBDIRS='libtiff' noinst_PROGRAMS= dist_doc_DATA=
)

[ -f "$TARGET/lib/pkgconfig/vips.pc" ] || (
  stage "Compiling vips"
  mkdir $DEPS/vips
  curl -Ls https://github.com/libvips/libvips/releases/download/v$VERSION_VIPS/vips-$VERSION_VIPS.tar.gz | tar xzC $DEPS/vips --strip-components=1
  cd $DEPS/vips
  # Backport commit libvips/libvips@702ed82
  curl -Ls https://github.com/libvips/libvips/commit/702ed8298f45d7ba342ebf5bae612d159e9cec6f.patch | patch -p1
  # Emscripten specific patches
  curl -Ls https://github.com/libvips/libvips/compare/v$VERSION_VIPS...kleisauke:wasm-vips.patch | patch -p1
  # Disable building C++ bindings, man pages, gettext po files, tools, and (fuzz-)tests
  sed -i "/subdir('cplusplus')/{N;N;N;N;N;d;}" meson.build
  meson setup _build --prefix=$TARGET --cross-file=$MESON_CROSS --default-library=static --buildtype=release \
    -Ddeprecated=false -Dintrospection=false -Dauto_features=disabled ${ENABLE_MODULES:+-Dmodules=enabled} \
    -Dcgif=enabled -Dexif=enabled -Dimagequant=enabled -Djpeg=enabled ${ENABLE_JXL:+-Djpeg-xl=enabled} \
    -Djpeg-xl-module=enabled -Dlcms=enabled -Dspng=enabled -Dtiff=enabled -Dwebp=enabled -Dnsgif=true \
    -Dppm=true -Danalyze=true -Dradiance=true
  meson install -C _build --tag runtime,devel
  # Emscripten requires linking to side modules to find the necessary symbols to export
  module_dir=$(printf '%s\n' $TARGET/lib/vips-modules-* | sort -n | tail -1)
  [ -d "$module_dir" ] && modules=$(find $module_dir/ -type f -printf " %p")
  sed -i "/^Libs:/ s/$/${modules//\//\\/}/" $TARGET/lib/pkgconfig/vips.pc
)

(
  stage "Compiling JS bindings"
  mkdir $DEPS/wasm-vips
  cd $DEPS/wasm-vips
  emcmake cmake $SOURCE_DIR -DCMAKE_BUILD_TYPE=Release -DCMAKE_RUNTIME_OUTPUT_DIRECTORY="$SOURCE_DIR/lib" \
    -DENVIRONMENT=${ENVIRONMENT//,/;} -DENABLE_MODULES=$MODULES
  make
)

[ "$ENVIRONMENT" != "web,node" ] || (
  # Building for both Node.js and web, prepare NPM package
  stage "Prepare NPM package"

  # Ensure compatibility with Deno (classic workers are not supported)
  # FIXME(kleisauke): This should ideally be handled in Emscripten itself for -sEXPORT_ES6
  sed -i 's/new Worker(\([^()]\+\))/new Worker(\1,{type:"module"})/g' $SOURCE_DIR/lib/vips-es6.js
  sed -i 's/new Worker(\(new URL([^)]\+)\)/new Worker(\1,{type:"module"}/g' $SOURCE_DIR/lib/vips-es6.js

  # The produced vips.wasm file should be the same across the different variants (sanity check)
  # FIXME(kleisauke): -sMAIN_MODULE=2 appears to produce non-determinism binaries, perhaps this is similar to:
  # https://github.com/emscripten-core/emscripten/issues/15706
  expected_sha256=$(sha256sum "$SOURCE_DIR/lib/vips.wasm" | awk '{ print $1 }')
  for file in vips-es6.wasm node-commonjs/vips.wasm node-es6/vips.wasm; do
    echo "$expected_sha256 $SOURCE_DIR/lib/$file" | sha256sum --check || true
    rm $SOURCE_DIR/lib/$file
  done

  # Adjust vips.wasm path for web and Node.js
  for file in vips-es6.js node-commonjs/vips.js node-es6/vips.mjs; do
    case "$file" in
      vips-es6.js) expression='s/vips-es6.wasm/vips.wasm/g' ;;
      *) expression='s/vips[^.]*.wasm/..\/&/g' ;;
    esac
    sed -i "$expression" $SOURCE_DIR/lib/$file
  done

  # Copy dynamic loadable modules
  module_dir=$(printf '%s\n' $TARGET/lib/vips-modules-* | sort -n | tail -1)
  [ -d "$module_dir" ] && cp $module_dir/* $SOURCE_DIR/lib/
)
