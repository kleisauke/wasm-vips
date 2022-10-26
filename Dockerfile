# https://github.com/emscripten-core/emsdk
FROM docker.io/emscripten/emsdk:3.1.24

# Enable detection of running in a container
ENV RUNNING_IN_CONTAINER=true \
    # Avoid using bundled Node from emsdk
    PATH=$EMSDK:$EMSDK/upstream/emscripten:$EMSDK/upstream/bin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin

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
  && pip3 install meson \
  # Prefer the default system-installed version of Node.js
  && echo "NODE_JS = '$(which node)'" >> $EMSDK/.emscripten

ARG MESON_PATCH=https://github.com/kleisauke/wasm-vips/raw/master/build/patches/meson-emscripten.patch
RUN cd $(dirname `python3 -c "import mesonbuild as _; print(_.__path__[0])"`) \
  && curl -Ls $MESON_PATCH | patch -p1
