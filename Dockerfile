# https://github.com/emscripten-core/emsdk
FROM docker.io/emscripten/emsdk:3.1.29

# Avoid using bundled Node from emsdk
ENV PATH=$EMSDK:$EMSDK/upstream/emscripten:$EMSDK/upstream/bin:/root/.rustup/toolchains/nightly-x86_64-unknown-linux-gnu/bin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin \
    # Enable Emscripten sysroot cache
    EM_CACHE=/src/build/emcache \
    # Enable Rust cache
    CARGO_HOME="/src/build/cargo-cache" \
    # Enable ccache
    CCACHE_DIR=/src/build/ccache \
    _EMCC_CCACHE=1

RUN apt-get update \
  && curl -fsSL https://deb.nodesource.com/setup_lts.x | bash - \
  && apt-get install -qqy \
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
  # https://github.com/mesonbuild/meson/pull/10969
  && pip3 install git+https://github.com/kleisauke/meson@wasm-vips \
  # Prefer the default system-installed version of Node.js
  && echo "NODE_JS = '$(which node)'" >> $EMSDK/.emscripten

RUN curl -Ls https://github.com/emscripten-core/emscripten/compare/3.1.29...kleisauke:wasm-vips-3.1.29.patch | patch -p1 -d /emsdk/upstream/emscripten && \
    curl -Ls https://github.com/emscripten-core/emscripten/compare/3.1.29...kleisauke:dylink-deno-compat.patch | patch -p1 -d /emsdk/upstream/emscripten && \
    emcc --clear-cache && embuilder build sysroot --force

RUN curl https://sh.rustup.rs -sSf | sh -s -- -y --profile minimal --target wasm32-unknown-emscripten --default-toolchain nightly-2023-01-12 --component rust-src
RUN curl -Ls https://github.com/rust-lang/rust/pull/106779.patch | patch -p1 -d /root/.rustup/toolchains/nightly-x86_64-unknown-linux-gnu/lib/rustlib/src/rust
