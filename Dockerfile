# https://github.com/emscripten-core/emsdk
FROM docker.io/emscripten/emsdk:5.0.2

# Path settings
ENV \
  RUSTUP_HOME="/usr/local/rustup" \
  CARGO_HOME="/usr/local/cargo" \
  PATH="/usr/local/cargo/bin:/root/.local/bin:$PATH"

RUN \
  apt-get update && \
  apt-get install -qqy \
    build-essential \
    ccache \
    libglib2.0-dev \
    pkgconf \
    # needed for Meson
    ninja-build \
    pipx \
    && \
  pipx install meson

# Emscripten patches
RUN \
  curl -Ls https://github.com/emscripten-core/emscripten/compare/5.0.2...kleisauke:wasm-vips-5.0.2.patch | patch -p1 -d $EMSDK/upstream/emscripten && \
  curl -Ls https://github.com/emscripten-core/emscripten/compare/be68a76...kleisauke:mimalloc-update-3.2.8.patch | patch -p1 -d $EMSDK/upstream/emscripten && \
  emcc --clear-cache && embuilder build sysroot --force

# Rust
RUN \
  curl https://sh.rustup.rs -sSf | sh -s -- -y \
    --no-modify-path \
    --profile minimal \
    --target wasm32-unknown-emscripten \
    --default-toolchain nightly-2026-02-14 \
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
