# https://github.com/emscripten-core/emsdk
FROM docker.io/emscripten/emsdk:4.0.9

# Path settings
ENV \
  RUSTUP_HOME="/usr/local/rustup" \
  CARGO_HOME="/usr/local/cargo" \
  PATH="/usr/local/cargo/bin:$PATH"

RUN \
  apt-get update && \
  apt-get install -qqy \
    build-essential \
    ccache \
    libglib2.0-dev \
    pkgconf \
    # needed for Meson
    ninja-build \
    python3-pip \
    # needed by GLib
    python3-packaging \
    && \
  pip3 install meson

# Emscripten patches
RUN \
  curl -Ls https://github.com/emscripten-core/emscripten/compare/4.0.9...kleisauke:wasm-vips-4.0.9.patch | patch -p1 -d $EMSDK/upstream/emscripten && \
  curl -Ls https://github.com/emscripten-core/emscripten/compare/5b489fcd...kleisauke:mimalloc-update-3.0.3.patch | patch -p1 -d $EMSDK/upstream/emscripten && \
  emcc --clear-cache && embuilder build sysroot --force

# Rust
RUN \
  curl https://sh.rustup.rs -sSf | sh -s -- -y \
    --no-modify-path \
    --profile minimal \
    --target wasm32-unknown-emscripten \
    --default-toolchain nightly-2025-05-01 \
    --component rust-src

# Cache settings
ENV \
  # Enable Emscripten sysroot cache
  EM_CACHE="/src/build/emcache" \
  # Enable Rust cache
  CARGO_HOME="/src/build/cargo-cache" \
  # Enable ccache
  CCACHE_DIR="/src/build/ccache" \
  _EMCC_CCACHE=1

ENTRYPOINT ["/bin/bash"]
CMD ["./build.sh"]
