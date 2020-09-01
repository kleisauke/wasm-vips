// --js-library must go after --bind
if (!LibraryManager.library['$init_embind']) {
  throw Error("embind.js didn't run yet");
}

mergeInto(LibraryManager.library, {
  $getFloatHeap__deps: [],
  $getFloatHeap: function (name, shift) {
    switch (shift) {
      case 2:
        return function () { return HEAPF32; };
      case 3:
        return function () { return HEAPF64; };
      default:
        throw new TypeError("Unknown float type: " + name);
    }
  },

  $getIntegerHeap__deps: [],
  $getIntegerHeap: function (name, shift, signed) {
    switch (shift) {
      case 0:
        return signed ?
          function heapS8() { return HEAP8; } :
          function headU8() { return HEAPU8; };
      case 1:
        return signed ?
          function heapS16() { return HEAP16; } :
          function heapU16() { return HEAPU16; };
      case 2:
        return signed ?
          function heapS32() { return HEAP32 } :
          function headU32() { return HEAPU32; };
      default:
        throw new TypeError("Unknown integer type: " + name);
    }
  },

  _embind_register_arithmetic_vector__deps: [
    '$readLatin1String', '$registerType', '$getShiftFromSize', '$getFloatHeap',
    '$getIntegerHeap', '$simpleReadValueFromPointer', '$throwBindingError'],
  _embind_register_arithmetic_vector: function (rawType, name, size, isfloat, signed) {
    name = readLatin1String(name);
    var shift = getShiftFromSize(size);
    var getHeap = isfloat ? getFloatHeap(name, shift) : getIntegerHeap(name, shift, signed);

    registerType(rawType, {
      name: name,
      'fromWireType': function (value) {
        // Code mostly taken from _embind_register_std_string fromWireType
        var length = HEAPU32[value >> 2];
        var HEAP = getHeap();

        var a = new Array(length);
        var firstElement = value + size;
        for (var i = 0; i < length; ++i) {
          a[i] = HEAP[(firstElement >> shift) + i];
        }

        _free(value);

        return a;
      },
      'toWireType': function (destructors, value) {
        // We allow singular values as well
        if (typeof value == 'number') {
          value = [value];
        }

        if (!Array.isArray(value)) {
          throwBindingError('Cannot pass non-array to C++ vector type ' + name);
        }

        // flatten 2D arrays
        value = Array.prototype.concat.apply([], value);

        var length = value.length;
        var HEAP = getHeap();
        var ptr = _malloc(size + length * size);
#if CAN_ADDRESS_2GB
        ptr >>>= 0;
#endif

        HEAPU32[ptr >> 2] = length;
        var firstElement = ptr + size;
        for (var i = 0; i < length; ++i) {
          HEAP[(firstElement >> shift) + i] = value[i];
        }

        if (destructors !== null) {
          destructors.push(_free, ptr);
        }
        return ptr;
      },
      'argPackAdvance': 8,
      'readValueFromPointer': simpleReadValueFromPointer,
      destructorFunction: function (ptr) { _free(ptr); },
    });
  }
});
