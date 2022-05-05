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

# Parse arguments
while [ $# -gt 0 ]; do
  case $1 in
    --enable-lto) LTO=true ;;
    --enable-wasm-fs) WASM_FS=true ;;
    --enable-wasm-eh) WASM_EH=true ;;
    --disable-simd) SIMD=false ;;
    --disable-wasm-bigint) WASM_BIGINT=false ;;
    -e|--environment) ENVIRONMENT="$2"; shift ;;
    *) echo "ERROR: Unknown parameter: $1" >&2; exit 1 ;;
  esac
  shift
done

# SIMD configure flags helpers
if [ "$SIMD" = "true" ]; then
  ENABLE_SIMD=true
else
  DISABLE_SIMD=true
fi

# LTO embuilder flag
if [ "$LTO" = "true" ]; then LTO_FLAG=--lto; fi

# Handy for debugging
#export CFLAGS="-O0 -gsource-map"
#export CXXFLAGS="$CFLAGS"
#export LDFLAGS="-L$TARGET/lib -O0 -gsource-map"
#export EMCC_DEBUG=1

# Handy for catching bugs
#export CFLAGS="-Os -gsource-map -fsanitize=address -sINITIAL_MEMORY=64MB"
#export CXXFLAGS="$CFLAGS"
#export LDFLAGS="-L$TARGET/lib -Os -gsource-map -fsanitize=address"

# Specify location where source maps are published (browser specific)
#export CFLAGS+=" --source-map-base http://localhost:3000/lib"

# Common compiler flags
export CFLAGS="-O3 -fno-rtti -fno-exceptions -mnontrapping-fptoint"
if [ "$SIMD" = "true" ]; then export CFLAGS+=" -msimd128 -DWASM_SIMD_COMPAT_SLOW"; fi
if [ "$WASM_BIGINT" = "true" ]; then
  # libffi needs to detect WASM_BIGINT support at compile time
  export CFLAGS+=" -DWASM_BIGINT"
fi
if [ "$WASM_FS" = "true" ]; then export CFLAGS+=" -DWASMFS"; fi
if [ "$WASM_EH" = "true" ]; then export CFLAGS+=" -sSUPPORT_LONGJMP=wasm"; fi
if [ "$LTO" = "true" ]; then export CFLAGS+=" -flto"; fi
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

# Dependency version numbers
VERSION_ZLIBNG=2.0.6
VERSION_FFI=3.4.2
VERSION_GLIB=2.72.1
VERSION_EXPAT=2.4.8
VERSION_EXIF=0.6.24
VERSION_LCMS2=2.13.1
VERSION_JPEG=2.1.3
VERSION_PNG16=1.6.37
VERSION_SPNG=0.7.2
VERSION_IMAGEQUANT=2.4.1
VERSION_CGIF=0.2.1
VERSION_WEBP=1.2.2
VERSION_TIFF=4.3.0
VERSION_VIPS=8.12.2

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
  patch -p1 <$SOURCE_DIR/build/patches/emscripten-windows-path.patch

  # Need to rebuild libembind and libc, since we modified it
  # with the patches above
  embuilder.py build libembind libc-mt --force $LTO_FLAG

  # The system headers require to be reinstalled, as some of
  # them have also been changed with the patches above
  embuilder.py build sysroot --force
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

echo "============================================="
echo "Compiling ffi"
echo "============================================="
test -f "$TARGET/lib/pkgconfig/libffi.pc" || (
  mkdir $DEPS/ffi
  curl -Ls https://github.com/libffi/libffi/releases/download/v$VERSION_FFI/libffi-$VERSION_FFI.tar.gz | tar xzC $DEPS/ffi --strip-components=1
  cd $DEPS/ffi
  patch -p1 <$SOURCE_DIR/build/patches/libffi-emscripten.patch
  autoreconf -fiv
  # Compile without -fexceptions
  sed -i 's/ -fexceptions//g' configure
  emconfigure ./configure --host=$CHOST --prefix=$TARGET --enable-static --disable-shared --disable-dependency-tracking \
    --disable-builddir --disable-multi-os-directory --disable-raw-api --disable-structs --disable-docs
  make install SUBDIRS='include'
)

echo "============================================="
echo "Compiling glib"
echo "============================================="
test -f "$TARGET/lib/pkgconfig/glib-2.0.pc" || (
  mkdir $DEPS/glib
  curl -Lks https://download.gnome.org/sources/glib/$(without_patch $VERSION_GLIB)/glib-$VERSION_GLIB.tar.xz | tar xJC $DEPS/glib --strip-components=1
  cd $DEPS/glib
  patch -p1 <$SOURCE_DIR/build/patches/glib-emscripten.patch
  patch -p1 <$SOURCE_DIR/build/patches/glib-function-pointers.patch
  meson setup _build --prefix=$TARGET --cross-file=$MESON_CROSS --default-library=static --buildtype=release \
    --force-fallback-for=libpcre -Diconv="libc" -Dselinux=disabled -Dxattr=false -Dlibmount=disabled -Dnls=disabled \
    -Dtests=false -Dglib_assert=false -Dglib_checks=false
  ninja -C _build install
)

echo "============================================="
echo "Compiling expat"
echo "============================================="
test -f "$TARGET/lib/pkgconfig/expat.pc" || (
  mkdir $DEPS/expat
  curl -Ls https://github.com/libexpat/libexpat/releases/download/R_${VERSION_EXPAT//./_}/expat-$VERSION_EXPAT.tar.xz | tar xJC $DEPS/expat --strip-components=1
  cd $DEPS/expat
  emconfigure ./configure --host=$CHOST --prefix=$TARGET --enable-static --disable-shared --disable-dependency-tracking \
    --without-xmlwf --without-docbook --without-getrandom --without-sys-getrandom --without-examples --without-tests
  make install
)

echo "============================================="
echo "Compiling exif"
echo "============================================="
test -f "$TARGET/lib/pkgconfig/libexif.pc" || (
  mkdir $DEPS/exif
  curl -Ls https://github.com/libexif/libexif/releases/download/v$VERSION_EXIF/libexif-$VERSION_EXIF.tar.bz2 | tar xjC $DEPS/exif --strip-components=1
  cd $DEPS/exif
  emconfigure ./configure --host=$CHOST --prefix=$TARGET --enable-static --disable-shared --disable-dependency-tracking \
    --disable-docs --disable-nls --without-libiconv-prefix --without-libintl-prefix \
    CPPFLAGS="-DNO_VERBOSE_TAG_DATA"
  make -C 'libexif' install doc_DATA=
  make install-pkgconfigDATA
)

echo "============================================="
echo "Compiling lcms2"
echo "============================================="
test -f "$TARGET/lib/pkgconfig/lcms2.pc" || (
  mkdir $DEPS/lcms2
  curl -Ls https://github.com/mm2/Little-CMS/releases/download/lcms$VERSION_LCMS2/lcms2-$VERSION_LCMS2.tar.gz | tar xzC $DEPS/lcms2 --strip-components=1
  cd $DEPS/lcms2
  # Disable threading support, we rely on libvips' thread pool
  emconfigure ./configure --host=$CHOST --prefix=$TARGET --enable-static --disable-shared --disable-dependency-tracking \
   --without-threads --without-jpeg --without-tiff --without-zlib
  make install SUBDIRS='src include'
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
  make -C _build install
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
  # libpng's user limits can be set for both reading and writing PNG images
  sed -i '/^option USER_LIMITS/s/requires READ//' scripts/pnglibconf.dfa
  # The hardware optimizations in libpng are only used for reading PNG images, since we use libspng
  # for that we can safely pass --disable-hardware-optimizations and compile with -DPNG_NO_READ
  # Need to compile with -pthread after https://reviews.llvm.org/D120013 as png.c uses setjmp/longjmp
  CFLAGS="$CFLAGS -pthread" \
  emconfigure ./configure --host=$CHOST --prefix=$TARGET --enable-static --disable-shared --disable-dependency-tracking \
    --disable-hardware-optimizations --disable-unversioned-libpng-config --without-binconfigs CPPFLAGS="-DPNG_NO_READ"
  make install dist_man_MANS= bin_PROGRAMS=
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
    -Dbuild_examples=false -Dstatic_zlib=true ${DISABLE_SIMD:+-Denable_opt=false} ${ENABLE_SIMD:+-Dc_args="$CFLAGS -msse4.1 -DSPNG_SSE=4"}
  ninja -C _build install
)

echo "============================================="
echo "Compiling imagequant"
echo "============================================="
test -f "$TARGET/lib/pkgconfig/imagequant.pc" || (
  mkdir $DEPS/imagequant
  curl -Ls https://github.com/lovell/libimagequant/archive/v$VERSION_IMAGEQUANT.tar.gz | tar xzC $DEPS/imagequant --strip-components=1
  cd $DEPS/imagequant
  # TODO(kleisauke): Discuss this patch upstream
  patch -p1 <$SOURCE_DIR/build/patches/imagequant-emscripten.patch
  meson setup _build --prefix=$TARGET --cross-file=$MESON_CROSS --default-library=static --buildtype=release \
    ${ENABLE_SIMD:+-Dc_args="$CFLAGS -msse -DUSE_SSE=1"}
  ninja -C _build install
)

echo "============================================="
echo "Compiling cgif"
echo "============================================="
test -f "$TARGET/lib/pkgconfig/cgif.pc" || (
  mkdir $DEPS/cgif
  curl -Ls https://github.com/dloebl/cgif/archive/V$VERSION_CGIF.tar.gz | tar xzC $DEPS/cgif --strip-components=1
  cd $DEPS/cgif
  meson setup _build --prefix=$TARGET --cross-file=$MESON_CROSS --default-library=static --buildtype=release \
    -Dtests=false 
  ninja -C _build install
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
    --enable-libwebpmux --enable-libwebpdemux CPPFLAGS="-DWEBP_DISABLE_STATS"
  make -C 'src' install
)

echo "============================================="
echo "Compiling tiff"
echo "============================================="
test -f "$TARGET/lib/pkgconfig/libtiff-4.pc" || (
  mkdir $DEPS/tiff
  curl -Ls https://download.osgeo.org/libtiff/tiff-$VERSION_TIFF.tar.gz | tar xzC $DEPS/tiff --strip-components=1
  cd $DEPS/tiff
  # Need to compile with -pthread after https://reviews.llvm.org/D120013 as tif_jpeg.c uses setjmp/longjmp
  CFLAGS="$CFLAGS -pthread" \
  emconfigure ./configure --host=$CHOST --prefix=$TARGET --enable-static --disable-shared --disable-dependency-tracking \
    --disable-mdi --disable-pixarlog --disable-old-jpeg --disable-cxx
  make -C 'libtiff' install noinst_PROGRAMS=
  make install-pkgconfigDATA
)

echo "============================================="
echo "Compiling vips"
echo "============================================="
test -f "$TARGET/lib/pkgconfig/vips.pc" || (
  mkdir $DEPS/vips
  curl -Ls https://github.com/libvips/libvips/releases/download/v$VERSION_VIPS/vips-$VERSION_VIPS.tar.gz | tar xzC $DEPS/vips --strip-components=1
  #curl -Ls https://github.com/libvips/libvips/archive/$VERSION_VIPS.tar.gz | tar xzC $DEPS/vips --strip-components=1
  cd $DEPS/vips
  # Emscripten specific patches
  patch -p1 <$SOURCE_DIR/build/patches/vips-remove-orc.patch
  patch -p1 <$SOURCE_DIR/build/patches/vips-1492-emscripten.patch
  #patch -p1 <$SOURCE_DIR/build/patches/vips-1492-profiler.patch
  emconfigure ./autogen.sh --host=$CHOST --prefix=$TARGET --enable-static --disable-shared --disable-dependency-tracking \
    --disable-debug --disable-introspection --disable-deprecated --disable-modules --with-radiance --with-analyze --with-ppm \
    --with-imagequant --with-nsgif --with-cgif --with-lcms --with-zlib --with-libexif --with-jpeg --with-libspng --with-png \
    --with-tiff --with-libwebp --without-fftw --without-pangocairo --without-fontconfig --without-gsf --without-heif \
    --without-pdfium --without-poppler --without-rsvg --without-OpenEXR --without-libjxl --without-libopenjp2 --without-openslide \
    --without-matio --without-nifti --without-cfitsio --without-magick
  make -C 'libvips' install
  make install-pkgconfigDATA
)

echo "============================================="
echo "Compiling JS bindings"
echo "============================================="
(
  mkdir $DEPS/wasm-vips
  cd $DEPS/wasm-vips
  emcmake cmake $SOURCE_DIR -DCMAKE_BUILD_TYPE=Release -DCMAKE_RUNTIME_OUTPUT_DIRECTORY="$SOURCE_DIR/lib" \
    -DENVIRONMENT=${ENVIRONMENT//,/;}
  make
)

echo "============================================="
echo "Prepare NPM package"
echo "============================================="
[ "$ENVIRONMENT" = "web,node" ] && (
  # Building for both Node.js and web, prepare NPM package
  # FIXME(kleisauke): Workaround for https://github.com/emscripten-core/emscripten/issues/11792
  sed -i '1iimport { dirname } from "path";' $SOURCE_DIR/lib/node-es6/vips.mjs
  sed -i '2iimport { fileURLToPath } from "url";' $SOURCE_DIR/lib/node-es6/vips.mjs
  sed -i '3iimport { createRequire } from "module";' $SOURCE_DIR/lib/node-es6/vips.mjs
  sed -i '4iconst require = createRequire(import.meta.url);' $SOURCE_DIR/lib/node-es6/vips.mjs
  sed -i 's/__dirname/dirname(fileURLToPath(import.meta.url))/g' $SOURCE_DIR/lib/node-es6/vips.mjs
  sed -i 's/\(new URL([^)]\+)\+\).toString()/fileURLToPath(\1)/g' $SOURCE_DIR/lib/node-es6/vips.mjs
  sed -i 's/vips.worker.js/vips.worker.mjs/g' $SOURCE_DIR/lib/node-es6/vips.mjs
  mv $SOURCE_DIR/lib/node-es6/vips.worker.js $SOURCE_DIR/lib/node-es6/vips.worker.mjs
  sed -i 's/var Module/import { fileURLToPath } from "url";&/' $SOURCE_DIR/lib/node-es6/vips.worker.mjs
  sed -i 's/var Module/import { createRequire } from "module";&/' $SOURCE_DIR/lib/node-es6/vips.worker.mjs
  sed -i 's/var Module/const require = createRequire(import.meta.url);&/' $SOURCE_DIR/lib/node-es6/vips.worker.mjs
  sed -i 's/__filename/fileURLToPath(import.meta.url)/g' $SOURCE_DIR/lib/node-es6/vips.worker.mjs

  # Ensure compatibility with Deno (classic workers are not supported)
  sed -i 's/new Worker(\([^()]\+\))/new Worker(\1,{type:"module"})/g' $SOURCE_DIR/lib/vips-es6.js
  sed -i 's/new Worker(\(new URL([^)]\+)\)/new Worker(\1,{type:"module"}/g' $SOURCE_DIR/lib/vips-es6.js

  # The produced vips.wasm file should be the same across the different variants (sanity check)
  expected_sha256=$(sha256sum "$SOURCE_DIR/lib/vips.wasm" | awk '{ print $1 }')
  for file in vips-es6.wasm node-commonjs/vips.wasm node-es6/vips.wasm; do
    echo "$expected_sha256 $SOURCE_DIR/lib/$file" | sha256sum --check
    rm $SOURCE_DIR/lib/$file
  done

  # Adjust vips.wasm path for web and Node.js
  for file in vips-es6.js node-commonjs/vips.js node-es6/vips.mjs; do
    case "$file" in
      vips-es6.js) expression='s/vips-es6.wasm/vips.wasm/g' ;;
      *) expression='s/vips.wasm/..\/&/g' ;;
    esac
    sed -i "$expression" $SOURCE_DIR/lib/$file
  done
)
