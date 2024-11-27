# https://github.com/emscripten-core/emsdk
FROM docker.io/emscripten/emsdk:3.1.72

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
    patchutils \
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
  curl -Ls https://github.com/emscripten-core/emscripten/compare/3.1.72...kleisauke:wasm-vips-3.1.72.patch | patch -p1 -d $EMSDK/upstream/emscripten && \
  curl -Ls https://github.com/emscripten-core/emscripten/commit/d0a2dce14cc3debad719e111ed7830ee5eb728b0.patch | patch -p1 -d $EMSDK/upstream/emscripten && \
  curl -Ls https://github.com/emscripten-core/emscripten/commit/27d7daac1c2d3741a2aee3e88b1f660b21b49af6.patch | filterdiff -p1 -x ChangeLog.md | patch -p1 -d $EMSDK/upstream/emscripten && \
  emcc --clear-cache && embuilder build sysroot --force

# Rust
RUN \
  curl https://sh.rustup.rs -sSf | sh -s -- -y \
    --no-modify-path \
    --profile minimal \
    --target wasm32-unknown-emscripten \
    --default-toolchain nightly-2024-11-19 \
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
