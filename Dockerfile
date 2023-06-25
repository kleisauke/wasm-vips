# https://github.com/emscripten-core/emsdk
FROM docker.io/emscripten/emsdk:3.1.42

# Path settings
ENV \
  RUSTUP_HOME="/usr/local/rustup" \
  PATH="/usr/local/cargo/bin:$EMSDK/upstream/emscripten:$EMSDK/upstream/bin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin"

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
  pip3 install meson && \
  # Prefer the default system-installed version of Node.js
  echo "NODE_JS = '$(which node)'" >> $EMSDK/.emscripten

# Emscripten patches
RUN \
  curl -Ls https://github.com/emscripten-core/emscripten/compare/3.1.42...kleisauke:wasm-vips-3.1.42.patch | patch -p1 -d $EMSDK/upstream/emscripten && \
  emcc --clear-cache && embuilder build sysroot --force

# Rust
RUN \
  curl https://sh.rustup.rs -sSf | CARGO_HOME="/usr/local/cargo" sh -s -- -y \
    --no-modify-path \
    --profile minimal \
    --target wasm32-unknown-emscripten \
    --default-toolchain nightly-2023-06-24 \
    --component rust-src

# https://github.com/rust-lang/libc/pull/3282
RUN \
  sed -i 's|version = "0.2.146"|git = "https://github.com/kleisauke/libc", branch = "emscripten-new-stat"|' $(rustc --print sysroot)/lib/rustlib/src/rust/library/std/Cargo.toml
