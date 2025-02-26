// wasm-vips externs for Closure to know about

/**
 * See: 
 * https://emscripten.org/docs/api_reference/Filesystem-API.html
 * https://emscripten.org/docs/api_reference/advanced-apis.html#advanced-file-system-api
 * @suppress {duplicate}
 */
var FS, fs;

/**
 * @suppress {duplicate}
 */
var NODEFS;

/**
 * @param {number} ma
 * @param {number} mi
 */
FS.makedev = function (ma, mi) {};

/**
 * @param {Object|string} parent
 * @param {string} name
 * @param {function()=} input
 * @param {function(string)=} output
 */
FS.createDevice = function (parent, name, input, output) {};

/**
 * @param {number} dev
 * @param {Object} ops
 */
FS.registerDevice = function (dev, ops) {};

/**
 * @param {function()=} input
 * @param {function(string)=} output
 * @param {function(string)=} error
 */
FS.init = function (input, output, error) {};

/**
 * @param {*} type
 * @param {Object} opts
 * @param {string} mountpoint
 */
FS.mount = function (type, opts, mountpoint) {};

/**
 * @param {string} mountpoint
 */
FS.unmount = function (mountpoint) {};

/**
 * @param {boolean} populate
 * @param {function(Error)} callback
 */
FS.syncfs = function (populate, callback) {};

/**
 * @param {string} path
 * @param {number=} mode
 */
FS.mkdir = function (path, mode) {};

/**
 * @param {string} path
 * @param {number=} mode
 * @param {number=} dev
 */
FS.mkdev = function (path, mode, dev) {};

/**
 * @param {string} oldpath
 * @param {string} newpath
 */
FS.symlink = function (oldpath, newpath) {};

/**
 * @param {string} oldpath
 * @param {string} newpath
 */
FS.rename = function (oldpath, newpath) {};

/**
 * @param {string} path
 */
FS.rmdir = function (path) {};

/**
 * @param {string} path
 */
FS.unlink = function (path) {};

/**
 * @param {string} path
 */
FS.readlink = function (path) {};

/**
 * @param {string} path
 */
FS.stat = function (path) {};

/**
 * @param {string} path
 */
FS.lstat = function (path) {};

/**
 * @param {string} path
 * @param {number} mode
 */
FS.chmod = function (path, mode) {};

/**
 * @param {string} path
 * @param {number} mode
 */
FS.lchmod = function (path, mode) {};

/**
 * @param {number} fd
 * @param {number} mode
 */
FS.fchmod = function (fd, mode) {};

/**
 * @param {string} path
 * @param {number} uid
 * @param {number} gid
 */
FS.chown = function (path, uid, gid) {};

/**
 * @param {string} path
 * @param {number} uid
 * @param {number} gid
 */
FS.lchown = function (path, uid, gid) {};

/**
 * @param {number} fd
 * @param {number} uid
 * @param {number} gid
 */
FS.fchown = function (fd, uid, gid) {};

/**
 * @param {string} path
 * @param {number} len
 */
FS.truncate = function (path, len) {};

/**
 * @param {number} fd
 * @param {number} len
 */
FS.ftruncate = function (fd, len) {};

/**
 * @param {string} path
 * @param {number} atime
 * @param {number} mtime
 */
FS.utime = function (path, atime, mtime) {};

/**
 * @param {string} path
 * @param {string} flags
 * @param {number=} mode
 */
FS.open = function (path, flags, mode) {};

/**
 * @param {object} stream
 */
FS.close = function (stream) {};

/**
 * @param {object} stream
 * @param {number} offset
 * @param {number} whence
 */
FS.llseek = function (stream, offset, whence) {};

/**
 * @param {object} stream
 * @param {ArrayBufferView} buffer
 * @param {number} offset
 * @param {number} length
 * @param {number=} position
 */
FS.read = function (stream, buffer, offset, length, position) {};

/**
 * @param {object} stream
 * @param {ArrayBufferView} buffer
 * @param {number} offset
 * @param {number} length
 * @param {number=} position
 */
FS.write = function (stream, buffer, offset, length, position) {};

/**
 * @param {string} path
 * @param {{encoding:(string|undefined),flags:(string|undefined)}} opts
 */
FS.readFile = function (path, opts) {};

/**
 * @param {string} path
 * @param {string|ArrayBufferView} data
 * @param {{mode:(number|undefined),flags:(string|undefined)}} opts
 */
FS.writeFile = function (path, data, opts) {};

/**
 * @param {Object|string} parent
 * @param {string} name
 * @param {string|ArrayBufferView} data
 * @param {boolean} canRead
 * @param {boolean} canWrite
 * @param {boolean} canOwn
 */
FS.createDataFile = function (parent, name, data, canRead, canWrite, canOwn) {};

/**
 * @param {Object|string} parent
 * @param {string} name
 * @param {string} url
 * @param {boolean} canRead
 * @param {boolean} canWrite
 */
FS.createLazyFile = function (parent, name, url, canRead, canWrite) {};

/**
 * @param {Object|string} parent
 * @param {string} name
 * @param {string} url
 * @param {boolean} canRead
 * @param {boolean} canWrite
 */
FS.createPreloadedFile = function (parent, name, url, canRead, canWrite) {};

/**
 * @param {number} mode
 */
FS.isFile = function (mode) {};

/**
 * @param {number} mode
 */
FS.isDir = function (mode) {};

/**
 * @param {number} mode
 */
FS.isLink = function (mode) {};

/**
 * @param {number} mode
 */
FS.isChrdev = function (mode) {};

/**
 * @param {number} mode
 */
FS.isBlkdev = function (mode) {};

/**
 * @param {number} mode
 */
FS.isSocket = function (mode) {};

FS.cwd = function () {};

/**
 * @param {string} path
 */
FS.chdir = function (path) {};

/**
 * @param {Object|string} parent
 * @param {string} path
 * @param {boolean} canRead
 * @param {boolean} canWrite
 */
FS.createPath = function(parent, path, canRead, canWrite) {};

/**
 * @param {string} path
 * @param {{parent:(boolean),follow:(boolean)}} opts
 */
FS.lookupPath = function (path, opts) {};

/**
 * @param {string} path
 * @param {boolean} dontResolveLastLink
 */
FS.analyzePath = function (path, dontResolveLastLink) {};

/**
 * @param {*} node
 */
FS.getPath = function (node) {};
