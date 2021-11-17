#!/usr/bin/env python

# This file generates the TypeScript declaration file

# this needs pyvips
#
#   pip install --user pyvips

import argparse
import xml.etree.ElementTree as ET

from pyvips import Introspect, GValue, Error, \
    ffi, values_for_enum, values_for_flag, \
    gobject_lib, type_map, type_name, \
    type_from_name, nickname_find

# turn a GType into a TypeScript type
gtype_to_js_param = {
    GValue.gbool_type: 'boolean',
    GValue.gint_type: 'number',
    GValue.guint64_type: 'number',
    GValue.gdouble_type: 'number',
    GValue.gstr_type: 'string',
    GValue.refstr_type: 'string',
    GValue.gflags_type: 'Flag',
    GValue.image_type: 'Image',
    GValue.source_type: 'Source',
    GValue.target_type: 'Target',
    GValue.array_int_type: 'ArrayConstant',
    GValue.array_double_type: 'ArrayConstant',
    GValue.array_image_type: 'ArrayImage',
    GValue.blob_type: 'Blob',
    type_from_name('VipsInterpolate'): 'Interpolate'
}

gtype_to_js_return = {
    GValue.gbool_type: 'boolean',
    GValue.gint_type: 'number',
    GValue.guint64_type: 'number',
    GValue.gdouble_type: 'number',
    GValue.gstr_type: 'string',
    GValue.refstr_type: 'string',
    GValue.gflags_type: 'number',
    GValue.image_type: 'Image',
    GValue.array_int_type: 'number[]',
    GValue.array_double_type: 'number[]',
    GValue.array_image_type: 'Vector<Image>',
    GValue.blob_type: 'Uint8Array',
    type_from_name('VipsAngle'): 'Angle'
}

js_keywords = ('in',)

# values for VipsArgumentFlags
_REQUIRED = 1
_INPUT = 16
_OUTPUT = 32
_DEPRECATED = 64
_MODIFY = 128

# for VipsOperationFlags
_OPERATION_DEPRECATED = 8


def get_js_type(gtype, param=False):
    """Map a gtype to JS type name we use to represent it.
    """
    lookup = gtype_to_js_param if param else gtype_to_js_return

    if gtype in lookup:
        # we allow constants in image parameter types
        if param and (gtype == GValue.image_type or
                      gtype == GValue.array_image_type):
            return lookup[gtype] + ' | ArrayConstant'

        return lookup[gtype]

    fundamental = gobject_lib.g_type_fundamental(gtype)

    if fundamental in lookup:
        return lookup[fundamental]

    return '<unknown type>'


def to_camel_case(snake_str):
    components = snake_str.split('_')
    # We capitalize the first letter of each component except the first one
    # with the 'title' method and join them together.
    return components[0] + ''.join(x.title() for x in components[1:])


# swap any '-' for '_'
def js_name(name):
    name = name.replace('-', '_')
    if name in js_keywords:
        return '_' + name
    return name


def remove_prefix(enum_str):
    prefix = 'Vips'

    if enum_str.startswith(prefix):
        return enum_str[len(prefix):]

    return enum_str


def generate_operation(operation_name, indent='        '):
    intro = Introspect.get(operation_name)

    required_output = [name for name in intro.required_output if name != intro.member_x]

    has_input = len(intro.method_args) >= 1
    has_output = len(required_output) >= 1
    has_optional_options = len(intro.doc_optional_input) + len(intro.doc_optional_output) >= 1

    # Add a comment block with some additional markings (@param, @return)
    result = f'\n{indent}/**'
    result += f'\n{indent} * {intro.description.capitalize()}.'

    for name in intro.method_args:
        result += f"\n{indent} * @param {js_name(name)} {intro.details[name]['blurb']}."

    if has_optional_options:
        result += f'\n{indent} * @param options Optional options.'

    if has_output:
        result += f"\n{indent} * @return {intro.details[required_output[0]]['blurb']}."

    result += f'\n{indent} */\n'

    if intro.member_x is None:
        result += f'{indent}static '
    else:
        result += indent

    js_operation = to_camel_case(operation_name)

    result += f'{js_operation}('
    result += ', '.join([f"{js_name(x)}: {get_js_type(intro.details[x]['type'], True)}"
                         for x in intro.method_args])

    if has_optional_options:
        if has_input:
            result += ', '
        result += 'options?: {'
        for name in intro.doc_optional_input:
            result += f'\n{indent}    /**'
            result += f"\n{indent}     * {intro.details[name]['blurb'].capitalize()}."
            result += f'\n{indent}     */'
            result += f"\n{indent}    {js_name(name)}?: {get_js_type(intro.details[name]['type'], True)}"
        for name in intro.doc_optional_output:
            result += f'\n{indent}    /**'
            result += f"\n{indent}     * {intro.details[name]['blurb'].capitalize()} (output)."
            result += f'\n{indent}     */'
            result += f"\n{indent}    {js_name(name)}?: {get_js_type(intro.details[name]['type'], False)} | undefined"
        result += f'\n{indent}}}'

    result += '): '

    # the first output arg will be used as the result
    if has_output:
        js_type = get_js_type(intro.details[required_output[0]]['type'], False)
        result += f'{js_type};'
    else:
        result += 'void;'

    return result


def generate_type_declarations(filename):
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

    # filter functions we document by hand
    filter = ['composite', 'find_trim', 'profile', 'project',
              'bandjoin_const', 'boolean_const', 'math2_const', 'relational_const', 'remainder_const']
    all_nicknames = [name for name in all_nicknames if name not in filter]

    with open(filename, 'a') as f:
        f.write('    class ImageAutoGen {\n')
        f.write('        // THIS IS A GENERATED CLASS. DO NOT EDIT DIRECTLY.\n')

        for nickname in all_nicknames:
            f.write(generate_operation(nickname) + '\n')

        f.write('    }\n')
        f.write('}')


def generate_enums_flags(gir_file, out_file):
    root = ET.parse(gir_file).getroot()
    namespace = {
        'goi': 'http://www.gtk.org/introspection/core/1.0'
    }

    # find all the enumerations/flags and make a dict for them
    xml_enums = {}
    for node in root.findall('goi:namespace/goi:enumeration', namespace):
        xml_enums[node.get('name')] = node

    xml_flags = {}
    for node in root.findall('goi:namespace/goi:bitfield', namespace):
        xml_flags[node.get('name')] = node

    all_nicknames = []

    def add_enum(gtype, a, b):
        nickname = type_name(gtype)
        all_nicknames.append(nickname)
        gtype_to_js_param[gtype] = f'{remove_prefix(nickname)} | Enum'

        type_map(gtype, add_enum)

        return ffi.NULL

    # Enums
    type_map(type_from_name('GEnum'), add_enum)

    # Flags
    all_nicknames.append('VipsForeignPngFilter')
    gtype_to_js_param[type_from_name('VipsForeignPngFilter')] = f'{remove_prefix("VipsForeignPngFilter")} | Flag'

    with open('preamble_vips.d.ts', 'r') as f:
        preamble = f.read()

    with open(out_file, 'w') as f:
        f.write(preamble)

        for name in all_nicknames:
            gtype = type_from_name(name)
            name = remove_prefix(name)
            if name in xml_enums:
                is_enum = True
                node = xml_enums[name]
            elif name in xml_flags:
                is_enum = False
                node = xml_flags[name]
            else:
                continue

            enum_doc = node.find('goi:doc', namespace)

            if enum_doc is not None:
                text = enum_doc.text.replace('\n', '\n     * ')
                f.write('    /**\n')
                f.write(f"     * {text}\n")
                f.write('     */\n')

            f.write(f'    export enum {name} {{\n')

            values = values_for_enum(gtype) if is_enum else values_for_flag(gtype)
            for i, value in enumerate(values):
                js_value = value.replace('-', '_')
                if i == 0 and (js_value == 'error' or js_value == 'notset'):
                    continue

                member = node.find(f"goi:member[@name='{js_value}']", namespace)
                member_doc = member.find('goi:doc', namespace)
                if member_doc is not None:
                    text = member_doc.text[:1].upper() + member_doc.text[1:]
                    f.write('        /**\n')
                    f.write(f'         * {text}\n')
                    f.write('         */\n')

                f.write(f"        {js_value} = '{value}'")

                if i != len(values) - 1:
                    f.write(',\n')

            f.write('\n    }\n\n')


parser = argparse.ArgumentParser(description='TypeScript declaration generator')
parser.add_argument('gir',
                    type=argparse.FileType('r'),
                    help='GIR file')

if __name__ == '__main__':
    args = parser.parse_args()

    generate_enums_flags(args.gir, 'vips.d.ts')
    generate_type_declarations('vips.d.ts')
