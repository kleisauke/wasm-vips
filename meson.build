project('wasm-vips', 'cpp',
    version: '0.0.16',
    meson_version: '>=0.60',
    license: 'MIT',
    default_options: [
        # Embind requires C++17 or newer
        'cpp_std=c++17',
        # Do a release (optimized) build by default
        'buildtype=release',
        # Turn off asserts etc. in release mode
        'b_ndebug=if-release',
    ],
)

# If we're optimizing (e.g. release mode) we turn off cast checks and g_asserts
if get_option('optimization') not in ['0', 'g']
    add_project_arguments('-DG_DISABLE_CAST_CHECKS', language: 'cpp')
    add_project_arguments('-DG_DISABLE_CHECKS', language: 'cpp')
    add_project_arguments('-DG_DISABLE_ASSERT', language: 'cpp')
endif

if get_option('wasmfs')
    add_project_arguments('-DWASMFS', language: 'cpp')
endif

cpp = meson.get_compiler('cpp')

vips_dep = dependency('vips', version: '>=8.17.0')
embind_dep = cpp.find_library('embind')

summary('Compiler', cpp.get_id(), section: 'Toolchain')
summary('Linker', cpp.get_linker_id(), section: 'Toolchain')

summary('Debugging', get_option('debug'), section: 'Build')
summary('Optimization', get_option('optimization'), section: 'Build')
summary('Environments', get_option('environments'), section: 'Build')
summary('Modules', get_option('modules'), section: 'Build')
summary('WasmFS', get_option('wasmfs'), section: 'Build')

subdir('src')
