# https://github.com/emscripten-core/emsdk
FROM docker.io/emscripten/emsdk:3.1.27

# Enable detection of running in a container
ENV RUNNING_IN_CONTAINER=true \
    # Avoid using bundled Node from emsdk
    PATH=$EMSDK:$EMSDK/upstream/emscripten:$EMSDK/upstream/bin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin \
    # Enable Emscripten sysroot cache
    EM_CACHE=/src/build/emcache \
    # Enable ccache
    CCACHE_DIR=/src/build/ccache \
    _EMCC_CCACHE=1

RUN apt-get update \
  && curl -fsSL https://deb.nodesource.com/setup_lts.x | bash - \
  && apt-get install -qqy \
    autoconf \
    build-essential \
    libglib2.0-dev \
    libtool \
    nodejs \
    pkgconf \
    # needed for Meson
    ninja-build \
    python3-pip \
    ccache \
  # https://github.com/mesonbuild/meson/pull/10969
  && pip3 install git+https://github.com/kleisauke/meson@wasm-vips \
  # Prefer the default system-installed version of Node.js
  && echo "NODE_JS = '$(which node)'" >> $EMSDK/.emscripten

RUN curl -Ls https://github.com/emscripten-core/emscripten/compare/3.1.27...kleisauke:wasm-vips-3.1.27.patch | patch -p1 -d /emsdk/upstream/emscripten && \
    emcc --clear-cache && embuilder build sysroot --force
