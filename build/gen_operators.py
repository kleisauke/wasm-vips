#!/usr/bin/env python

# This file generates the member definitions and declarations for all vips
# operators.

# this needs pyvips
#
#   pip install --user pyvips

# Sample member declaration:
# Image invert() const;

# Sample member definition:
# Image Image::invert() const
# {
#     Image out;
#
#     this->call("invert",
#                (new Option)
#                    ->set("in", *this)
#                    ->set("out", &out));
#
#     return out;
# }

import argparse
import re

from pyvips import Introspect, GValue, Error, \
    ffi, gobject_lib, type_map, type_name, type_from_name, nickname_find

# turn a GType into a C++ type
gtype_to_cpp_param = {
    GValue.gbool_type: 'bool',
    GValue.gint_type: 'int',
    GValue.gdouble_type: 'double',
    GValue.gstr_type: 'const std::string &',
    GValue.refstr_type: 'const std::string &',
    GValue.gflags_type: 'int',
    GValue.genum_type: 'emscripten::val',
    GValue.image_type: 'emscripten::val',
    GValue.source_type: 'const Source &',
    GValue.target_type: 'const Target &',
    GValue.array_int_type: 'const std::vector<int> &',
    GValue.array_double_type: 'const std::vector<double> &',
    GValue.array_image_type: 'emscripten::val',
    GValue.blob_type: 'const std::string &'
}

gtype_to_cpp_return = {
    GValue.gbool_type: 'bool',
    GValue.gint_type: 'int',
    GValue.gdouble_type: 'double',
    GValue.gstr_type: 'std::string',
    GValue.refstr_type: 'std::string',
    GValue.gflags_type: 'int',
    GValue.image_type: 'Image',
    GValue.array_int_type: 'std::vector<int>',
    GValue.array_double_type: 'std::vector<double>',
    GValue.array_image_type: 'std::vector<Image>',
    GValue.blob_type: 'emscripten::val'
}

cplusplus_suffixes = ('*', '&')
cplusplus_keywords = ('case', 'switch')

preamble = """/**
 * This file was generated automatically. Do not edit!
 */
"""

# for VipsOperationFlags
_OPERATION_DEPRECATED = 8


def get_cpp_type(gtype, param=False):
    """Map a gtype to C++ type name we use to represent it.
    """
    lookup = gtype_to_cpp_param if param else gtype_to_cpp_return

    if gtype in lookup:
        return lookup[gtype]

    fundamental = gobject_lib.g_type_fundamental(gtype)

    if fundamental in lookup:
        return lookup[fundamental]

    return '<unknown type>'


# swap any '-' for '_'
def cppize(name):
    return name.replace('-', '_')


def remove_prefix(enum_str):
    prefix = 'Vips'

    if enum_str.startswith(prefix):
        return enum_str[len(prefix):]

    return enum_str


def to_snake_case(name):
    s1 = re.sub('(.)([A-Z][a-z]+)', r'\1_\2', name)
    return re.sub('([a-z0-9])([A-Z])', r'\1_\2', s1).lower()


def generate_operation(operation_name, declaration_only=False):
    intro = Introspect.get(operation_name)

    required_output = [name for name in intro.required_output if name != intro.member_x]

    has_input = len(intro.method_args) >= 1
    has_output = len(required_output) >= 1
    has_optional_options = len(intro.optional_input) + len(intro.optional_output) >= 1

    # Add a C++ style comment block with some additional markings (@param,
    # @return)
    if declaration_only:
        result = f'\n/**\n * {intro.description.capitalize()}.'

        for name in intro.method_args:
            result += f"\n * @param {cppize(name)} {intro.details[name]['blurb']}."

        if has_output:
            # skip the first element
            for name in required_output[1:]:
                result += f"\n * @param {cppize(name)} {intro.details[name]['blurb']}."

        if has_optional_options:
            result += '\n * @param js_options Optional options.'

        if has_output:
            result += f"\n * @return {intro.details[required_output[0]]['blurb']}."

        result += '\n */\n'
    else:
        result = '\n'

    if intro.member_x is None and declaration_only:
        result += 'static '
    if has_output:
        # the first output arg will be used as the result
        cpp_type = get_cpp_type(intro.details[required_output[0]]['type'], False)
        spacing = '' if cpp_type.endswith(cplusplus_suffixes) else ' '
        result += f'{cpp_type}{spacing}'
    else:
        result += 'void '

    if not declaration_only:
        result += 'Image::'

    cplusplus_operation = operation_name
    if operation_name in cplusplus_keywords:
        cplusplus_operation += '_image'

    result += f'{cplusplus_operation}('
    for i, name in enumerate(intro.method_args):
        details = intro.details[name]
        gtype = details['type']
        cpp_type = get_cpp_type(gtype, True)
        spacing = '' if cpp_type.endswith(cplusplus_suffixes) else ' '
        result += f'{cpp_type}{spacing}{cppize(name)}'
        if i != len(intro.method_args) - 1:
            result += ', '

    # output params are passed by reference
    if has_output:
        # skip the first element
        for i, name in enumerate(required_output[1:]):
            details = intro.details[name]
            gtype = details['type']
            cpp_type = get_cpp_type(gtype, False)
            spacing = '' if cpp_type.endswith(cplusplus_suffixes) else ' '
            result += f'{cpp_type}{spacing}*{cppize(name)}'
            if i != len(required_output) - 2:
                result += ', '

    if has_optional_options:
        if has_input or len(required_output) > 1:
            result += ', '
        result += f"emscripten::val js_options{' = emscripten::val::null()' if declaration_only else ''}"

    result += ')'

    # if no 'this' available, it's a class method and they are all const
    if intro.member_x is not None:
        result += ' const'

    if declaration_only:
        result += ';'

        return result

    result += '\n{\n'

    if has_output:
        # the first output arg will be used as the result
        name = required_output[0]
        gtype = intro.details[name]['type']
        cpp_type = 'VipsBlob *' if (gtype == GValue.blob_type) else get_cpp_type(gtype, False)
        spacing = '' if cpp_type.endswith(cplusplus_suffixes) else ' '
        result += f'    {cpp_type}{spacing}{ cppize(name)};\n\n'

    separate_blob = False

    for name in intro.method_args:
        if intro.details[name]['type'] == GValue.blob_type:
            #  We must take a copy of the data.
            result += f'    VipsBlob *blob = vips_blob_copy({name}.c_str(), {name}.size());\n'
            separate_blob = True
            break

    if not separate_blob:
        result += f"    {'Image::' if intro.member_x is None else 'this->'}"
        result += f'call("{operation_name}",'
        result += f"{' nullptr,' if intro.member_x is None else ''}\n"

    padding = ' ' * 16 if intro.member_x is None else ' ' * 15

    if separate_blob:
        padding += ' ' * 6
        result += '    Option *options = (new Option)'
    else:
        result += f'{padding}(new Option)'

    if intro.member_x is not None:
        result += f'\n    {padding}->set("{intro.member_x}", *this)'

    all_required = intro.method_args

    if has_output:
        # first element needs to be passed by reference
        arg = cppize(required_output[0])
        result += f'\n    {padding}->set("{required_output[0]}", &{arg})'

        # append the remaining list
        all_required += required_output[1:]

    for name in all_required:
        gtype = intro.details[name]['type']

        if gtype == GValue.blob_type:
            arg = 'blob'
        elif name not in required_output and get_cpp_type(gtype, True) == 'emscripten::val':
            type = to_snake_case(remove_prefix(type_name(gtype))).upper()
            arg = f'VIPS_TYPE_{type}, {cppize(name)}'
            # a match image is needed for image types
            if intro.member_x is not None \
                and (gtype == GValue.image_type or
                     gtype == GValue.array_image_type):
                arg += ', this'
        else:
            arg = cppize(name)

        result += f'\n    {padding}->set("{name}", {arg})'

    if separate_blob:
        result += ';\n'
        result += '    vips_area_unref(VIPS_AREA(blob));\n\n'
        result += f"    {'Image::' if intro.member_x is None else 'this->'}"
        result += f'call("{operation_name}",'
        result += f"{' nullptr,' if intro.member_x is None else ''} options, js_options);\n"
    else:
        result += f',\n{padding}js_options);\n' if has_optional_options else ');\n'

    if has_output:
        gtype = intro.details[required_output[0]]['type']

        result += '\n'
        if gtype == GValue.blob_type:
            result += '    emscripten::val result = BlobVal.new_(emscripten::typed_memory_view(\n'
            result += f'        VIPS_AREA({required_output[0]})->length,\n'
            result += f'        static_cast<uint8_t *>(VIPS_AREA({required_output[0]})->data)));\n'
            result += f'    vips_area_unref(VIPS_AREA({required_output[0]}));\n\n'
            result += '    return result;\n'
        else:
            result += f'    return {required_output[0]};\n'

    result += '}'

    return result


def generate_operators(declarations_only=False):
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

    # some functions are wrapped by hand
    filter = ['add', 'bandjoin_const', 'boolean', 'composite', 'divide', 'ifthenelse',
              'math2', 'multiply', 'relational', 'remainder', 'subtract']
    all_nicknames = [name for name in all_nicknames if name not in filter]

    print(preamble)

    for nickname in all_nicknames:
        print(generate_operation(nickname, declarations_only))


parser = argparse.ArgumentParser(description='C++ binding generator')
parser.add_argument('--gen', '-g',
                    default='cpp',
                    choices=['h', 'cpp'],
                    help='File to generate: h (headers) or cpp ' + \
                         '(implementations) (default: %(default)s)')

if __name__ == '__main__':
    args = parser.parse_args()

    generate_operators(args.gen == 'h')
