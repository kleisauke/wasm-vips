# https://github.com/emscripten-core/emsdk
FROM docker.io/emscripten/emsdk:3.1.30

# Path settings
ENV \
  PATH="$EMSDK/upstream/emscripten:$EMSDK/upstream/bin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin"

# Cache settings
ENV \
  # Enable Emscripten sysroot cache
  EM_CACHE="/src/build/emcache" \
  # Enable ccache
  CCACHE_DIR="/src/build/ccache" \
  _EMCC_CCACHE=1

RUN \
  apt-get update && \
  curl -fsSL https://deb.nodesource.com/setup_lts.x | bash - && \
  apt-get install -qqy \
    autoconf \
    build-essential \
    ccache \
    libglib2.0-dev \
    libtool \
    nodejs \
    pkgconf \
    # needed for Meson
    ninja-build \
    python3-pip \
    && \
  # https://github.com/mesonbuild/meson/pull/10969
  pip3 install git+https://github.com/kleisauke/meson@wasm-vips && \
  # Prefer the default system-installed version of Node.js
  echo "NODE_JS = '$(which node)'" >> $EMSDK/.emscripten

# Emscripten patches
RUN \
  curl -Ls https://github.com/emscripten-core/emscripten/compare/3.1.30...kleisauke:wasm-vips-3.1.30.patch | patch -p1 -d $EMSDK/upstream/emscripten && \
  emcc --clear-cache && embuilder build sysroot --force
