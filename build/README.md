# Build notes

```bash
python3 gen_cpp_binding.py
python3 gen_type_declarations.py /usr/share/gir-1.0/Vips-8.0.gir
python3 gen_operators.py -g h > ../src/bindings/vips-operators.h
python3 gen_operators.py -g cpp > ../src/bindings/vips-operators.cpp
```

```bash
# Get the emsdk repo
git clone https://github.com/emscripten-core/emsdk.git

# Enter that directory
cd emsdk

# Fetch the latest version of the emsdk (not needed the first time you clone)
git pull

# Download and install the "tip-of-tree" build (i.e. the very latest binaries)
./emsdk install tot

# Make the "tip-of-tree" build active for the current user (writes .emscripten file)
./emsdk activate tot

# Prefer the default system-installed version of Node.js
NODE=$(which node)
sed -i'.old' "/^NODE_JS/s/= .*/= '${NODE//\//\\/}'/" .emscripten

# Activate PATH and other environment variables in the current terminal
source ./emsdk_env.sh
```
