# https://github.com/emscripten-core/emsdk
FROM docker.io/emscripten/emsdk:3.1.30

# Path settings
ENV \
  RUSTUP_HOME="/usr/local/rustup" \
  PATH="/usr/local/rustup/toolchains/nightly-x86_64-unknown-linux-gnu/bin:$EMSDK/upstream/emscripten:$EMSDK/upstream/bin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin"

# Cache settings
ENV \
  # Enable Emscripten sysroot cache
  EM_CACHE="/src/build/emcache" \
  # Enable Rust cache
  CARGO_HOME="/src/build/cargo-cache" \
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
  curl https://sh.rustup.rs -sSf | sh -s -- -y \
    --no-modify-path \
    --profile minimal \
    --target wasm32-unknown-emscripten \
    --default-toolchain nightly \
    --component rust-src \
    && \
  # https://github.com/mesonbuild/meson/pull/10969
  pip3 install git+https://github.com/kleisauke/meson@wasm-vips && \
  # Prefer the default system-installed version of Node.js
  echo "NODE_JS = '$(which node)'" >> $EMSDK/.emscripten

# Emscripten patches
RUN \
  curl -Ls https://github.com/emscripten-core/emscripten/compare/3.1.30...kleisauke:wasm-vips-3.1.30.patch | patch -p1 -d $EMSDK/upstream/emscripten && \
  emcc --clear-cache && embuilder build sysroot --force

# Rust patches
RUN \
  curl -Ls https://github.com/rust-lang/rust/pull/106779.patch | patch -p1 -d $(rustc --print sysroot)/lib/rustlib/src/rust && \
  curl -Ls https://github.com/kleisauke/rust/commit/c705a6a9b68b0262a01ddc50d80fbf8571580cfc.patch | patch -p1 -d $(rustc --print sysroot)/lib/rustlib/src/rust

# Copy the Cargo.lock for Rust to places `vendor` will see
# https://github.com/rust-lang/wg-cargo-std-aware/issues/23#issuecomment-720455524
RUN \
  cp $(rustc --print sysroot)/lib/rustlib/src/rust/Cargo.lock $(rustc --print sysroot)/lib/rustlib/src/rust/library/test
