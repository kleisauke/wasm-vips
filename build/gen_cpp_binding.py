#!/usr/bin/env python

# This file generates the emscripten bindings

# this needs pyvips
#
#   pip install --user pyvips
import re

from pyvips import Image, Introspect, GValue, Error, \
    ffi, enum_dict, flags_dict, \
    gobject_lib, type_map, type_name, \
    type_from_name, nickname_find

# turn a GType into a C++ type
gtype_to_cpp = {
    GValue.gbool_type: 'bool',
    GValue.gint_type: 'int',
    GValue.gdouble_type: 'double',
    GValue.gstr_type: 'const std::string &',
    GValue.refstr_type: 'const std::string &',
    GValue.gflags_type: 'int',
    GValue.genum_type: 'emscripten::val',
    GValue.image_type: 'emscripten::val',
    GValue.array_int_type: 'const std::vector<int> &',
    GValue.array_double_type: 'const std::vector<double> &',
    GValue.array_image_type: 'emscripten::val',
    GValue.blob_type: 'const std::string &',
    GValue.source_type: 'const Source &',
    GValue.target_type: 'const Target &',
}

cplusplus_suffixes = ('*', '&')
cplusplus_keywords = ('case', 'switch')

# for VipsOperationFlags
_OPERATION_DEPRECATED = 8


def get_cpp_type(gtype):
    """Map a gtype to C++ type name we use to represent it.
    """
    if gtype in gtype_to_cpp:
        return gtype_to_cpp[gtype]

    fundamental = gobject_lib.g_type_fundamental(gtype)

    if fundamental in gtype_to_cpp:
        return gtype_to_cpp[fundamental]

    return '<unknown type>'


# swap any '-' for '_'
def cppize(name):
    return name.replace('-', '_')


def to_camel_case(snake_str):
    components = snake_str.split('_')
    # We capitalize the first letter of each component except the first one
    # with the 'title' method and join them together.
    return components[0] + ''.join(x.title() for x in components[1:])


def to_snake_case(name):
    s1 = re.sub('(.)([A-Z][a-z]+)', r'\1_\2', name)
    return re.sub('([a-z0-9])([A-Z])', r'\1_\2', s1).lower()


def generate_operation(operation_name):
    intro = Introspect.get(operation_name)

    required_output = [name for name in intro.required_output if name != intro.member_x]

    is_void = len(required_output) == 0
    has_input = len(intro.method_args) >= 1
    has_multiple_output = len(required_output) > 1
    has_optional_options = len(intro.optional_input) + len(intro.optional_output) >= 1

    function_type = 'function' if intro.member_x else 'class_function'

    result = ''

    cplusplus_operation = operation_name
    if operation_name in cplusplus_keywords:
        cplusplus_operation += '_image'

    padding = ' ' * 9 if intro.member_x else ' ' * 15

    result += f'        .{function_type}("{to_camel_case(operation_name)}", &Image::{cplusplus_operation}'

    if has_multiple_output:
        result += ', allow_raw_pointers())\n'
    else:
        result += ')'

    if not has_optional_options:
        return result

    # need to overload the function without optional options
    result += f'\n        .{function_type}("{to_camel_case(operation_name)}", optional_override([]('

    if intro.member_x is not None:
        result += 'const Image &image'
        if has_input or len(required_output) > 1:
            result += ', '

    for i, name in enumerate(intro.method_args):
        details = intro.details[name]
        gtype = details['type']
        cpp_type = get_cpp_type(gtype)
        spacing = '' if cpp_type.endswith(cplusplus_suffixes) else ' '
        result += f'{cpp_type}{spacing}{cppize(name)}'
        if i != len(intro.method_args) - 1:
            result += ', '

    # output params are passed by reference
    if has_multiple_output:
        # skip the first element
        for i, name in enumerate(required_output[1:]):
            details = intro.details[name]
            gtype = details['type']
            cpp_type = get_cpp_type(gtype)
            spacing = '' if cpp_type.endswith(cplusplus_suffixes) else ' '
            result += f'{cpp_type}{spacing}*{cppize(name)}'
            if i != len(required_output) - 2:
                result += ', '

    result += ') {\n'
    result += f'{padding}             '
    result += f"{'' if is_void else 'return '}"
    result += f"{'Image::' if intro.member_x is None else 'image.'}{cplusplus_operation}("

    for i, name in enumerate(intro.method_args):
        result += cppize(name)
        if i != len(intro.method_args) - 1:
            result += ', '

    if has_multiple_output:
        # skip the first element
        for i, name in enumerate(required_output[1:]):
            result += cppize(name)
            if i != len(required_output) - 2:
                result += ', '

    result += ');\n'
    result += f'         {padding}}})'

    if has_multiple_output:
        result += ', allow_raw_pointers())'
    else:
        result += ')'

    return result


def generate_functions(file):
    all_nicknames = []

    def add_nickname(gtype, a, b):
        nickname = nickname_find(gtype)
        try:
            # can fail for abstract types
            intro = Introspect.get(nickname)

            # we are only interested in non-deprecated operations
            if (intro.flags & _OPERATION_DEPRECATED) == 0:
                all_nicknames.append(nickname)
        except Error:
            pass

        type_map(gtype, add_nickname)

        return ffi.NULL

    type_map(type_from_name('VipsOperation'), add_nickname)

    # add 'missing' synonyms by hand
    all_nicknames.append('crop')

    # make list unique and sort
    all_nicknames = list(set(all_nicknames))
    all_nicknames.sort(key=lambda x: (bool(Introspect.get(x).member_x), x))

    # enum, _const and multiple output functions are wrapped by hand
    filter = ['add', 'bandbool', 'bandjoin_const', 'boolean', 'boolean_const', 'complex', 'complexget', 'composite',
              'divide', 'find_trim', 'flip', 'linear', 'math', 'math2', 'math2_const', 'morph', 'multiply', 'profile',
              'project', 'relational', 'relational_const', 'remainder', 'remainder_const', 'rot', 'round', 'subtract']
    all_nicknames = [name for name in all_nicknames if name not in filter]

    print(f'Generating {file}...')

    with open(file, 'w') as f:
        f.write('        // Auto-generated (class-)functions\n')

        for nickname in all_nicknames:
            f.write(generate_operation(nickname) + '\n')


def remove_prefix(enum_str):
    prefix = 'Vips'

    if enum_str.startswith(prefix):
        return enum_str[len(prefix):]

    return enum_str


def generate_enums_flags(file):
    all_enums = []
    all_flags = []

    def add_enum(gtype, a, b):
        nickname = type_name(gtype)
        all_enums.append(nickname)

        type_map(gtype, add_enum)

        return ffi.NULL

    def add_flag(gtype, a, b):
        nickname = type_name(gtype)
        all_flags.append(nickname)

        type_map(gtype, add_flag)

        return ffi.NULL

    type_map(type_from_name('GEnum'), add_enum)
    type_map(type_from_name('GFlags'), add_flag)

    # Filter internal enums
    filter_enums = ['VipsDemandStyle']
    all_enums = [name for name in all_enums if name not in filter_enums]

    # Filter internal flags
    filter_flags = ['VipsForeignFlags']
    all_flags = [name for name in all_flags if name not in filter_flags]

    # Filter values
    filter_values = [
        # VIPS_ACCESS_SEQUENTIAL_UNBUFFERED is deprecated
        'VIPS_ACCESS_SEQUENTIAL_UNBUFFERED'
    ]

    print(f'Generating {file}...')

    with open(file, 'w') as f:
        f.write('    // Auto-generated enums\n')

        for name in all_enums:
            gtype = type_from_name(name)

            f.write(f'    enum_<{name}>("{remove_prefix(name)}")')

            values = enum_dict(gtype)
            for key, _ in values.items():
                js_key = cppize(key)
                prefix = to_snake_case(name).upper()
                if prefix == 'VIPS_BAND_FORMAT':
                    prefix = 'VIPS_FORMAT'
                elif prefix == 'VIPS_IMAGE_TYPE':
                    prefix = 'VIPS_IMAGE'
                cpp_value = prefix + '_' + js_key.upper()
                if cpp_value == 'VIPS_INTERPRETATION_SRGB':
                    cpp_value = 'VIPS_INTERPRETATION_sRGB'
                elif cpp_value == 'VIPS_INTERPRETATION_SCRGB':
                    cpp_value = 'VIPS_INTERPRETATION_scRGB'
                elif cpp_value in filter_values:
                    continue

                f.write(f'\n        .value("{js_key}", {cpp_value})')

            f.write(';\n\n')

        for name in all_flags:
            gtype = type_from_name(name)

            f.write(f'    enum_<{name}>("{remove_prefix(name)}")')

            values = flags_dict(gtype)
            for key, _ in values.items():
                js_key = cppize(key)
                prefix = to_snake_case(name).upper()
                cpp_value = prefix + '_' + js_key.upper()

                f.write(f'\n        .value("{js_key}", {cpp_value})')

            f.write(';\n\n')


def generate_properties(filename):
    print(f'Generating {filename} ...')

    with open(filename, 'w') as f:
        f.write('        // Auto-generated properties\n')

        # all magic properties
        tmp_file = Image.new_temp_file('%s.v')
        all_properties = tmp_file.get_fields()
        for name in all_properties:
            cpp_name = cppize(name)
            f.write(f'        .property("{cpp_name}", &Image::{cpp_name})\n')


generate_enums_flags('enums.cpp')
generate_properties('properties.cpp')
generate_functions('functions.cpp')
