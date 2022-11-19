# https://github.com/emscripten-core/emsdk
FROM docker.io/emscripten/emsdk:3.1.26

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
  # https://github.com/mesonbuild/meson/pull/10969
  && pip3 install git+https://github.com/kleisauke/meson@wasm-vips \
  # Prefer the default system-installed version of Node.js
  && echo "NODE_JS = '$(which node)'" >> $EMSDK/.emscripten
