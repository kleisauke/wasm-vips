FROM emscripten/emsdk:3.1.15

# Enable detection of running in a container
ENV RUNNING_IN_CONTAINER=true

RUN apt-get update \
  && apt-get install -qqy \
    build-essential \
    autoconf \
    libtool \
    pkgconf \
    libglib2.0-dev \
    # needed for building libvips from source
    gtk-doc-tools \
    gobject-introspection \
    # needed for Meson
    ninja-build \
    python3-pip \
  && pip3 install meson

ARG MESON_PATCH=https://github.com/kleisauke/wasm-vips/raw/master/build/patches/meson-emscripten.patch
RUN cd $(dirname `python3 -c "import mesonbuild as _; print(_.__path__[0])"`) \
  && curl -Ls $MESON_PATCH | patch -p1
