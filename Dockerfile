# https://github.com/emscripten-core/emsdk
FROM docker.io/emscripten/emsdk:3.1.44

# Path settings
ENV \
  RUSTUP_HOME="/usr/local/rustup" \
  CARGO_HOME="/usr/local/cargo" \
  PATH="/usr/local/cargo/bin:$PATH"

RUN \
  apt-get update && \
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
  pip3 install meson

# Emscripten patches
RUN \
  curl -Ls https://github.com/emscripten-core/emscripten/compare/3.1.44...kleisauke:wasm-vips-3.1.44.patch | patch -p1 -d $EMSDK/upstream/emscripten && \
  emcc --clear-cache && embuilder build sysroot --force

# Rust
RUN \
  curl https://sh.rustup.rs -sSf | sh -s -- -y \
    --no-modify-path \
    --profile minimal \
    --target wasm32-unknown-emscripten \
    --default-toolchain nightly-2023-07-21 \
    --component rust-src

# https://github.com/rust-lang/libc/pull/3282
# https://github.com/rust-lang/libc/pull/3308
RUN \
  sed -i 's|version = "0.2.146"|git = "https://github.com/kleisauke/libc", branch = "emscripten-lfs64-compat"|' $(rustc --print sysroot)/lib/rustlib/src/rust/library/std/Cargo.toml

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
