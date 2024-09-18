declare function Vips(config?: Partial<EmscriptenModule>): Promise<NonNullable<typeof Vips>>;

type ModuleCallback = { (module?: any): void };

interface EmscriptenModule {
    print(str: string): void;
    printErr(str: string): void;

    dynamicLibraries: string[];

    preInit: ModuleCallback | ModuleCallback[];
    preRun: ModuleCallback | ModuleCallback[];
    postRun: ModuleCallback | ModuleCallback[];

    onAbort: { (what: any): void };
    onRuntimeInitialized: { (): void };

    instantiateWasm(
        imports: WebAssembly.Imports,
        successCallback: (instance: WebAssembly.Instance, module: WebAssembly.Module) => void
    ): WebAssembly.Exports;
    locateFile(url: string, scriptDirectory: string): string;
    mainScriptUrlOrBlob: Blob | File | string;

    // https://github.com/kleisauke/wasm-vips/issues/12
    workaroundCors: boolean;
}

declare module Vips {
    // Allow single pixels/images as input.
    type SingleOrArray<T> = T | T[];

    type Enum = string | number;
    type Flag = string | number;
    type Blob = string | ArrayBuffer | Uint8Array | Uint8ClampedArray | Int8Array;
    type ArrayConstant = SingleOrArray<number>;
    type ArrayImage = SingleOrArray<Image> | Vector<Image>;
    type DeletionFuncs<T extends EmbindClassHandle<T>> = EmbindClassHandle<T>[];

    //#region Utility functions

    /**
     * Queue of handles to be deleted.
     * This is filled when {@link deleteLater} is called on the handle.
     */
    const deletionQueue: DeletionFuncs<Image | Connection | Interpolate>;

    /**
     * Get the major, minor or patch version number of the libvips library.
     * When the flag is omitted, the entire version number is returned as a string.
     * @param flag 0 to get the major version number, 1 to get minor, 2 to get patch.
     * @return The version number of libvips.
     */
    function version(flag?: number): string | number;

    /**
     * Returns a string identifying the Emscripten version used for compiling wasm-vips.
     * @return The version number of Emscripten.
     */
    function emscriptenVersion(): string;

    /**
     * Get detailed information about the installation of libvips.
     * @return Information about how libvips is configured.
     */
    function config(): string;

    /**
     * Gets or, when a parameter is provided, sets the number of worker threads libvips' should create to
     * process each image.
     * @param concurrency The number of worker threads.
     * @return The number of worker threads libvips uses for image evaluation.
     */
    function concurrency(concurrency?: number): void | number;

    /**
     * Set the block state on all untrusted operations.
     * For example:
     * ```js
     * vips.blockUntrusted(true);
     * ```
     * Will block all untrusted operations from running. Use:
     * ```bash
     * $ vips -l | grep untrusted
     * ```
     * at the command-line to see which operations are marked as untrusted.
     * @param state Set to `true` to block the operations, set to `false` to re-enable them.
     */
    function blockUntrusted(state: boolean): void;

    /**
     * Set the block state on all operations in the libvips class hierarchy.
     * For example:
     * ```js
     * vips.operationBlock('VipsForeignLoad', true);
     * vips.operationBlock('VipsForeignLoadJpeg', false);
     * ```
     * Will block all load operations, except JPEG. Use:
     * ```bash
     * $ vips -l
     * ```
     * at the command-line to see the class hierarchy.
     * @param name The name of the operation in the libvips class hierarchy.
     * @param state Set to `true` to block the operation, set to `false` to re-enable it.
     */
    function operationBlock(name: string, state: boolean): void;

    /**
     * Call this to drop caches, close plugins, terminate background threads, and finalize any internal library testing.
     * Calling this is optional. If you don't call it, your platform will clean up for you.
     * The only negative consequences are that the leak checker and the profiler will not work.
     */
    function shutdown(): void;

    //#endregion

    //#region APIs

    /**
     * Embind adds the following methods to all its exposed classes.
     */
    abstract class EmbindClassHandle<T extends EmbindClassHandle<T>> {
        /**
         * Returns a new handle. It must eventually also be disposed with {@link delete} or
         * {@link deleteLater}.
         * @return A new handle.
         */
        clone(): T;

        /**
         * Signal that a C++ object is no longer needed and can be deleted.
         */
        delete(): void;

        /**
         * Signal that a C++ object is no longer needed and can be deleted later.
         * @return `this`.
         */
        deleteLater(): T;

        /**
         * Check whether two Embind handles point to the same underlying object.
         * @param other Embind handle for comparison.
         * @return `true` if the handles point to the same underlying object.
         */
        isAliasOf(other: any): boolean;

        /**
         * Check whether this handle is deleted.
         * @return `true` if this handle is deleted.
         */
        isDeleted(): boolean;

        /**
         * Prevents the C++ object from being auto deleted.
         * @return `this`.
         */
        preventAutoDelete(): T;
    }

    /**
     * A sequence container representing an array that can change in size.
     */
    interface Vector<T> extends EmbindClassHandle<Vector<T>> {
        /**
         * Adds a new element at the end of the vector, after its current last element.
         * @param val The value to be appended at the end of the container.
         */
        push_back(val: T): void;

        /**
         * Resizes the container so that it contains n elements.
         * @param n New size of the container.
         * @param val The value to initialize the new elements with.
         */
        resize(n: number, val: T): void;

        /**
         * Returns the number of elements in the container.
         * @return The number of elements in the container.
         */
        size(): number;

        /**
         * Access a specified element with bounds checking.
         * @param pos Position of the element to return.
         * @return The requested element or `undefined`.
         */
        get(pos: number): T | undefined;

        /**
         * Update a specified element at a certain position.
         * @param pos Position of the element to update.
         * @param val Value to be stored at the specified position.
         * @return `true` if successfully updated.
         */
        set(pos: number, val: T): boolean;
    }

    /**
     * An abstract class around libvips' operation cache.
     */
    abstract class Cache {
        /**
         * Gets or, when a parameter is provided, sets the maximum number of operations libvips keeps in cache.
         * @param max Maximum number of operations.
         * @return The maximum number of operations libvips keeps in cache.
         */
        static max(max?: number): void | number;

        /**
         * Gets or, when a parameter is provided, sets the maximum amount of tracked memory allowed.
         * @param mem Maximum amount of tracked memory.
         * @return The maximum amount of tracked memory libvips allows.
         */
        static maxMem(mem?: number): void | number;

        /**
         * Gets or, when a parameter is provided, sets the maximum amount of tracked files allowed.
         * @param maxFiles Maximum amount of tracked files.
         * @return The maximum amount of tracked files libvips allows.
         */
        static maxFiles(maxFiles?: number): void | number;

        /**
         * Get the current number of operations in cache.
         * @return The current number of operations in cache.
         */
        static size(): number;
    }

    /**
     * An abstract class that provides the statistics of memory usage and opened files.
     * libvips watches the total amount of live tracked memory and
     * uses this information to decide when to trim caches.
     */
    abstract class Stats {
        /**
         * Get the number of active allocations.
         * @return The number of active allocations.
         */
        static allocations(): number;

        /**
         * Get the number of bytes currently allocated `vips_malloc()` and friends.
         * libvips uses this figure to decide when to start dropping cache.
         * @return The number of bytes currently allocated.
         */
        static mem(): number;

        /**
         * Get the largest number of bytes simultaneously allocated via `vips_tracked_malloc()`.
         * Handy for estimating max memory requirements for a program.
         * @return The largest number of currently allocated bytes.
         */
        static memHighwater(): number;

        /**
         * Get the number of open files.
         * @return The number of open files.
         */
        static files(): number;
    }

    /**
     * Handy utilities.
     */
    abstract class Utils {
        /**
         * Get the GType for a name.
         * Looks up the GType for a nickname. Types below basename in the type hierarchy are searched.
         * @param basename Name of base class.
         * @param nickname Search for a class with this nickname.
         * @return The GType of the class, or `0` if the class is not found.
         */
        static typeFind(basename: string, nickname: string): number;

        /**
         * Make a temporary file name. The format parameter is something like `"%s.jpg"`
         * and will be expanded to something like `"/tmp/vips-12-34587.jpg"`.
         * @param format The filename format.
         */
        static tempName(format: string): string;
    }

    /**
     * The abstract base Connection class.
     */
    abstract class Connection extends EmbindClassHandle<Connection> {
        /**
         * Get the filename associated with a connection.
         */
        readonly filename: string;

        /**
         * Make a human-readable name for a connection suitable for error messages.
         */
        readonly nick: string;
    }

    /**
     * An input connection.
     */
    class Source extends Connection {
        /**
         * Make a new source from a file.
         *
         * Make a new source that is attached to the named file. For example:
         * ```js
         * const source = vips.Source.newFromFile('myfile.jpg');
         * ```
         * You can pass this source to (for example) {@link Image.newFromSource}.
         * @param filename The file.
         * @return A new source.
         */
        static newFromFile(filename: string): Source;

        /**
         * Make a new source from a memory object.
         *
         * Make a new source that is attached to the memory object. For example:
         * ```js
         * const data = image.writeToBuffer('.jpg');
         * const source = vips.Source.newFromMemory(data);
         * ```
         * You can pass this source to (for example) {@link Image.newFromSource}.
         * @param memory The memory object.
         * @return A new source.
         */
        static newFromMemory(memory: Blob): Source;
    }

    /**
     * A source that can be attached to callbacks to implement behavior.
     */
    class SourceCustom extends Source {
        /**
         * Attach a read handler.
         * The handler is given a number of bytes to fetch {@link length}, and should return a
         * bytes-like object containing up to that number of bytes. If there's no more data
         * available, it should return `undefined`.
         * @param length The maximum number of bytes to be read.
         * @return A blob up to {@link length} bytes or `undefined` if there's no more data available.
         */
        onRead: (length: number) => Blob | undefined;

        /**
         * Attach a seek handler.
         * Seek handlers are optional. If you do not set one, your source will be
         * treated as unseekable and libvips will do extra caching.
         * @param offset A byte offset relative to the whence parameter.
         * @param size A value indicating the reference point used to obtain the new position.
         * @return The new position within the current source.
         */
        onSeek: (offset: number, whence: number) => number;
    }

    /**
     * An output connection.
     */
    class Target extends Connection {
        /**
         * Make a new target to write to a file.
         *
         * Make a new target that will write to the named file. For example:
         * ```js
         * const target = vips.Target.newToFile('myfile.jpg');
         * ```
         * You can pass this target to (for example) {@link image.writeToTarget}.
         * @param filename Write to this file.
         * @return A new target.
         */
        static newToFile(filename: string): Target;

        /**
         * Make a new target to write to an area of memory.
         *
         * Make a new target that will write to memory. For example:
         * ```js
         * const target = vips.Target.newToMemory();
         * ```
         * You can pass this target to (for example) {@link image.writeToTarget}.
         *
         * After writing to the target, fetch the bytes from the target object with {@link getBlob}.
         * @return A new target.
         */
        static newToMemory(): Target;

        /**
         * Fetch the typed array of 8-bit unsigned integer values
         * from the target object.
         *
         * @return A typed array of 8-bit unsigned integer values.
         */
        getBlob(): Uint8Array;
    }

    /**
     * A target that can be attached to callbacks to implement behavior.
     */
    class TargetCustom extends Target {
        /**
         * Attach a write handler.
         * @param data A typed array of 8-bit unsigned integer values.
         * @return The number of bytes that were written.
         */
        onWrite: (data: Uint8Array) => number;

        /* libtiff needs to be able to seek and read on targets, unfortunately.
         */

        /**
         * Attach a read handler.
         * @param length The maximum number of bytes to be read.
         * @return A blob up to {@link length} bytes or `undefined` if there's no more data available.
         */
        onRead: (length: number) => Blob | undefined;

        /**
         * Attach a seek handler.
         * @param offset A byte offset relative to the whence parameter.
         * @param size A value indicating the reference point used to obtain the new position.
         * @return The new position within the current target.
         */
        onSeek: (offset: number, whence: number) => number;

        /**
         * Attach an end handler.
         * This optional handler is called at the end of write. It should do any
         * cleaning up, if necessary.
         * @return 0 on success, -1 on error.
         */
        onEnd: () => number;
    }

    /**
     * A class to build various interpolators.
     * For e.g. nearest, bilinear, and some non-linear.
     */
    class Interpolate extends EmbindClassHandle<Interpolate> {
        /**
         * Look up an interpolator from a nickname and make one.
         * @param nickname Nickname for interpolator.
         * @return An interpolator.
         */
        static newFromName(nickname: string): Interpolate;
    }

    /**
     * An image class.
     */
    class Image extends ImageAutoGen {
        /**
         * Image width in pixels.
         */
        readonly width: number;

        /**
         * Image height in pixels.
         */
        readonly height: number;

        /**
         * Number of bands in image.
         */
        readonly bands: number;

        /**
         * Pixel format in image.
         */
        readonly format: string;

        /**
         * Pixel coding.
         */
        readonly coding: string;

        /**
         * Pixel interpretation.
         */
        readonly interpretation: string;

        /**
         * Horizontal offset of origin.
         */
        readonly xoffset: number;

        /**
         * Vertical offset of origin.
         */
        readonly yoffset: number;

        /**
         * Horizontal resolution in pixels/mm.
         */
        readonly xres: number;

        /**
         * Vertical resolution in pixels/mm.
         */
        readonly yres: number;

        /**
         * Image filename.
         */
        readonly filename: string;

        /**
         * Page height in pixels.
         */
        readonly pageHeight: number;

        /**
         * Block evaluation on this image.
         */
        kill: boolean;

        /**
         * Attach progress feedback.
         *
         * This method can update user-interfaces with progress feedback,
         * for example:
         * ```js
         * const image = vips.Image.newFromFile('huge.jpg');
         * image.onProgress = (percent) =>
         *   console.log(`${percent}% complete`);
         * image.writeToFile('x.png');
         * ```
         * @param percent Percent complete.
         */
        onProgress: (percent: number) => void;

        //#region Constructor functions

        /**
         * Creates a new image which, when written to, will create a memory image.
         * @return A new image.
         */
        static newMemory(): Image;

        /**
         * Make a new temporary image.
         *
         * Returns an image backed by a temporary file. When written to with
         * {@link write}, a temporary file will be created on disc in the
         * specified format. When the image is closed, the file will be deleted
         * automatically.
         *
         * The file is created in the temporary directory. This is set with
         * the environment variable `TMPDIR`. If this is not set, vips will
         * default to `/tmp`.
         *
         * libvips uses `g_mkstemp()` to make the temporary filename. They
         * generally look something like `"vips-12-EJKJFGH.v"`.
         * @param format The format for the temp file, defaults to a vips
         * format file (`"%s.v"`). The `%s` is substituted by the file path.
         * @return A new image.
         */
        static newTempFile(format?: string): Image;

        /**
         * Load an image from a file.
         *
         * This method can load images in any format supported by libvips. The
         * filename can include load options, for example:
         * ```js
         * const image = vips.Image.newFromFile('fred.jpg[shrink=2]');
         * ```
         * You can also supply options as keyword arguments, for example:
         * ```js
         * const image = vips.Image.newFromFile('fred.jpg', {
         *     shrink: 2
         * });
         * ```
         * The full set of options available depend upon the load operation that
         * will be executed. Try something like:
         * ```bash
         * $ vips jpegload
         * ```
         * at the command-line to see a summary of the available options for the
         * JPEG loader.
         *
         * Loading is fast: only enough of the image is loaded to be able to fill
         * out the header. Pixels will only be decompressed when they are needed.
         * @param vipsFilename The file to load the image from, with optional appended arguments.
         * @param options Optional options that depend on the load operation.
         * @return A new image.
         */
        static newFromFile(vipsFilename: string, options?: {
            /**
             * Force open via memory.
             */
            memory?: boolean
            /**
             * Hint the expected access pattern for the image.
             */
            access?: Access | Enum
            /**
             * The type of error that will cause load to fail. By default,
             * loaders are permissive, that is, {@link FailOn.none}.
             */
            fail_on?: FailOn | Enum
            /**
             * Don't use a cached result for this operation.
             */
            revalidate?: boolean
        }): Image;

        /**
         * Wrap an image around a memory array.
         *
         * Wraps an Image around an area of memory containing a C-style array. For
         * example, if the `data` memory array contains four bytes with the
         * values 1, 2, 3, 4, you can make a one-band, 2x2 uchar image from
         * it like this:
         * ```js
         * const data = new Uint8Array([1, 2, 3, 4]);
         * const image = vips.Image.newFromMemory(data, 2, 2, 1, vips.BandFormat.uchar);
         * ```
         * The data object will internally be copied from JavaScript to WASM.
         *
         * This method is useful for efficiently transferring images from WebGL into
         * libvips.
         *
         * See {@link writeToMemory} for the opposite operation.
         * Use {@link copy} to set other image attributes.
         * @param data A C-style JavaScript array.
         * @param width Image width in pixels.
         * @param height Image height in pixels.
         * @param bands Number of bands.
         * @param format Band format.
         * @return A new image.
         */
        static newFromMemory(data: Blob, width: number, height: number, bands: number, format: BandFormat): Image;

        /**
         * Wrap an image around a pointer.
         *
         * This behaves exactly as {@link newFromMemory}, but the image is
         * loaded from a pointer rather than from a JavaScript array.
         * @param ptr A memory address.
         * @param size Length of memory area.
         * @param width Image width in pixels.
         * @param height Image height in pixels.
         * @param bands Number of bands.
         * @param format Band format.
         * @return A new image.
         */
        static newFromMemory(ptr: number, size: number, width: number, height: number, bands: number, format: BandFormat): Image;

        /**
         * Load a formatted image from memory.
         *
         * This behaves exactly as {@link newFromFile}, but the image is
         * loaded from the memory object rather than from a file. The
         * memory object can be a string or buffer.
         * @param data The memory object to load the image from.
         * @param strOptions Load options as a string.
         * @param options Optional options that depend on the load operation.
         * @return A new image.
         */
        static newFromBuffer(data: Blob, strOptions?: string, options?: {
            /**
             * Hint the expected access pattern for the image.
             */
            access?: Access | Enum
            /**
             * The type of error that will cause load to fail. By default,
             * loaders are permissive, that is, {@link FailOn.none}.
             */
            fail_on?: FailOn | Enum
            /**
             * Don't use a cached result for this operation.
             */
            revalidate?: boolean
        }): Image;

        /**
         * Load a formatted image from a source.
         *
         * This behaves exactly as {@link newFromFile}, but the image is
         * loaded from a source rather than from a file.
         * @param source The source to load the image from.
         * @param strOptions Load options as a string.
         * @param options Optional options that depend on the load operation.
         * @return A new image.
         */
        static newFromSource(source: Source, strOptions?: string, options?: {
            /**
             * Hint the expected access pattern for the image.
             */
            access?: Access | Enum
            /**
             * The type of error that will cause load to fail. By default,
             * loaders are permissive, that is, {@link FailOn.none}.
             */
            fail_on?: FailOn | Enum
            /**
             * Don't use a cached result for this operation.
             */
            revalidate?: boolean
        }): Image;

        /**
         * Create an image from a 1D array.
         *
         * A new one-band image with {@link BandFormat.double} pixels is
         * created from the array. These images are useful with the libvips
         * convolution operator {@link conv}.
         * @param width Image width.
         * @param height Image height.
         * @param array Create the image from these values.
         * @return A new image.
         */
        static newMatrix(width: number, height: number, array?: ArrayConstant): Image;

        /**
         * Create an image from a 2D array.
         *
         * A new one-band image with {@link BandFormat.double} pixels is
         * created from the array. These images are useful with the libvips
         * convolution operator {@link conv}.
         * @param array Create the image from these values.
         * @param scale Default to 1.0. What to divide each pixel by after
         * convolution. Useful for integer convolution masks.
         * @param offset Default to 0.0. What to subtract from each pixel
         * after convolution. Useful for integer convolution masks.
         * @return A new image.
         */
        static newFromArray(array: ArrayConstant, scale?: number, offset?: number): Image;

        /**
         * Make a new image from an existing one.
         *
         * A new image is created which has the same size, format, interpretation
         * and resolution as itself, but with every pixel set to `value`.
         * @param value The value for the pixels. Use a single number to make a
         * one-band image; use an array constant to make a many-band image.
         * @return A new image.
         */
        newFromImage(value: ArrayConstant): Image;

        /**
         * Copy an image to memory.
         *
         * A large area of memory is allocated, the image is rendered to that
         * memory area, and a new image is returned which wraps that large memory
         * area.
         * @return A new image.
         */
        copyMemory(): Image;

        //#endregion

        //#region Writer functions

        /**
         * Write an image to another image.
         *
         * This function writes itself to another image. Use something like
         * {@link newTempFile} to make an image that can be written to.
         * @param other The image to write to.
         * @return A new image.
         */
        write(other: Image): Image;

        /**
         * Write an image to a file.
         *
         * This method can save images in any format supported by libvips. The format
         * is selected from the filename suffix. The filename can include embedded
         * save options, see {@link newFromFile}.
         *
         * For example:
         * ```js
         * image.writeToFile('fred.jpg[Q=95]');
         * ```
         * You can also supply options as keyword arguments, for example:
         * ```js
         * image.writeToFile('.fred.jpg', {
         *     Q: 95
         * });
         * ```
         * The full set of options available depend upon the save operation that
         * will be executed. Try something like:
         * ```bash
         * $ vips jpegsave
         * ```
         * at the command-line to see a summary of the available options for the
         * JPEG saver.
         * @param vipsFilename The file to save the image to, with optional appended arguments.
         * @param options Optional options that depend on the save operation.
         */
        writeToFile(vipsFilename: string, options?: {}): void;

        /**
         * Write an image to a typed array of 8-bit unsigned integer values.
         *
         * This method can save images in any format supported by libvips. The format
         * is selected from the suffix in the format string. This can include
         * embedded save options, see {@link newFromFile}.
         *
         * For example:
         * ```js
         * const data = image.writeToBuffer('.jpg[Q=95]');
         * ```
         * You can also supply options as keyword arguments, for example:
         * ```js
         * const data = image.writeToBuffer('.jpg', {
         *     Q: 85
         * });
         * ```
         * The full set of options available depend upon the load operation that
         * will be executed. Try something like:
         * ```bash
         * $ vips jpegsave_buffer
         * ```
         * at the command-line to see a summary of the available options for the
         * JPEG saver.
         * @param formatString The suffix, plus any string-form arguments.
         * @param options Optional options that depend on the save operation.
         * @return A typed array of 8-bit unsigned integer values.
         */
        writeToBuffer(formatString: string, options?: {}): Uint8Array;

        /**
         * Write an image to a target.
         *
         * This behaves exactly as {@link writeToFile}, but the image is
         * written to a target rather than a file.
         * @param target Write to this target.
         * @param formatString The suffix, plus any string-form arguments.
         * @param options Optional options that depend on the save operation.
         */
        writeToTarget(target: Target, formatString: string, options?: {}): void;

        /**
         * Write the image to a large memory array.
         *
         * A large area of memory is allocated, the image is rendered to that
         * memory array, and the array is returned as a typed array.
         *
         * For example, if you have a 2x2 uchar image containing the bytes 1, 2,
         * 3, 4, read left-to-right, top-to-bottom, then:
         * ```js
         * const array = Uint8Array.of(1, 2, 3, 4);
         * const im = vips.Image.newFromMemory(array, 2, 2, 1, 'uchar');
         * const buf = im.writeToMemory();
         * ```
         * will return a four byte typed array containing the values 1, 2, 3, 4.
         * @return A typed array of 8-bit unsigned integer values.
         */
        writeToMemory(): Uint8Array;

        //#endregion

        //#region get/set metadata

        /**
         * Set an integer on an image as metadata.
         * @param name The name of the piece of metadata to set the value of.
         * @param value The metadata value.
         */
        setInt(name: string, value: number): void;

        /**
         * Set an integer array on an image as metadata.
         * @param name The name of the piece of metadata to set the value of.
         * @param value The metadata value.
         */
        setArrayInt(name: string, value: ArrayConstant): void;

        /**
         * Set a double array on an image as metadata.
         * @param name The name of the piece of metadata to set the value of.
         * @param value The metadata value.
         */
        setArrayDouble(name: string, value: ArrayConstant): void;

        /**
         * Set a double on an image as metadata.
         * @param name The name of the piece of metadata to set the value of.
         * @param value The metadata value.
         */
        setDouble(name: string, value: number): void;

        /**
         * Set a string on an image as metadata.
         * @param name The name of the piece of metadata to set the value of.
         * @param value The metadata value.
         */
        setString(name: string, value: string): void;

        /**
         * Set a blob on an image as metadata.
         * The value will internally be copied from JavaScript to WASM.
         * @param name The name of the piece of metadata to set the value of.
         * @param value The metadata value.
         */
        setBlob(name: string, value: Blob): void;

        /**
         * Set a blob pointer on an image as metadata.
         * @param name The name of the piece of metadata to set the value of.
         * @param ptr The metadata value as memory address.
         * @param size Length of blob.
         */
        setBlob(name: string, ptr: number, size: number): void;

        /**
         * Get the GType of an item of metadata.
         * Fetch the GType of a piece of metadata, or 0 if the named item does not exist.
         * @param name The name of the piece of metadata to get the type of.
         * @return The GType, or `0` if not found.
         */
        getTypeof(name: string): number;

        /**
         * Get an integer from an image.
         * @param name The name of the piece of metadata to get.
         * @return The metadata item as an integer.
         */
        getInt(name: string): number;

        /**
         * Get an integer array from an image.
         * @param name The name of the piece of metadata to get.
         * @return The metadata item as an integer array.
         */
        getArrayInt(name: string): number[];

        /**
         * Get a double array from an image.
         * @param name The name of the piece of metadata to get.
         * @return The metadata item as a double array.
         */
        getArrayDouble(name: string): number[];

        /**
         * Get an double from an image.
         * @param name The name of the piece of metadata to get.
         * @return The metadata item as a double.
         */
        getDouble(name: string): number;

        /**
         * Get a string from an image.
         * @param name The name of the piece of metadata to get.
         * @return The metadata item as a string.
         */
        getString(name: string): string;

        /**
         * Get a blob from an image.
         * @param name The name of the piece of metadata to get.
         * @return The metadata item as a typed array of 8-bit unsigned integer values.
         */
        getBlob(name: string): Uint8Array;

        /**
         * Get a list of all the metadata fields on an image.
         * @return All metadata fields as string vector.
         */
        getFields(): Vector<string>;

        /**
         * Remove an item of metadata.
         * @param name The name of the piece of metadata to remove.
         * @return `true` if successfully removed.
         */
        remove(name: string): boolean;

        //#endregion

        //#region Handwritten functions

        /**
         * Does this image have an alpha channel?
         * @return `true` if this image has an alpha channel.
         */
        hasAlpha(): boolean;

        /**
         * Sets the `delete_on_close` flag for the image.
         * If this flag is set, when image is finalized, the filename held in
         * {@link image.filename} at the time of this call is deleted.
         * This function is clearly extremely dangerous, use with great caution.
         */
        setDeleteOnClose(flag: boolean): void;

        /**
         * Search an image for non-edge areas.
         * @param options Optional options.
         * @return The bounding box of the non-background area.
         */
        findTrim(options?: {
            /**
             * Object threshold.
             */
            threshold?: number
            /**
             * Color for background pixels.
             */
            background?: ArrayConstant
            /**
             * Enable line art mode.
             */
            line_art?: boolean
        }): {
            /**
             * Output left edge.
             */
            left: number

            /**
             * Output top edge.
             */
            top: number

            /**
             * Output width.
             */
            width: number

            /**
             * Output width.
             */
            height: number
        };

        /**
         * Find image profiles.
         * @return First non-zero pixel in column/row.
         */
        profile(): {
            /**
             * Distances from top edge.
             */
            columns: Image

            /**
             * Distances from left edge.
             */
            rows: Image
        };

        /**
         * Find image projections.
         * @return Sums of columns/rows.
         */
        project(): {
            /**
             * Sums of columns.
             */
            columns: Image

            /**
             * Sums of rows.
             */
            rows: Image
        };

        /**
         * Split an n-band image into n separate images.
         * @return Vector of output images.
         */
        bandsplit(): Vector<Image>;

        //#endregion

        //#region Instance overloads

        /**
         * Append a set of images or constants bandwise
         * @param _in Array of input images.
         * @return Output image.
         */
        bandjoin(_in: ArrayImage | ArrayConstant): Image;

        /**
         * Band-wise rank filter a set of images or constants.
         * @param _in Array of input images.
         * @param options Optional options.
         * @return Output image.
         */
        bandrank(_in: ArrayImage | ArrayConstant, options?: {
            /**
             * Select this band element from sorted list.
             */
            index?: number
        }): Image;

        /**
         * Composite a set of images with a set of blend modes.
         * @param _in Images to composite.
         * @param mode Blend modes to use.
         * @param options Optional options.
         * @return Blended image.
         */
        static composite(_in: ArrayImage, mode: SingleOrArray<BlendMode>, options?: {
            /**
             * Array of x coordinates to join at.
             */
            x?: ArrayConstant
            /**
             * Array of y coordinates to join at.
             */
            y?: ArrayConstant
            /**
             * Composite images in this colour space.
             */
            compositing_space?: Interpretation | Enum
            /**
             * Images have premultiplied alpha.
             */
            premultiplied?: boolean
        }): Image;

        /**
         * Composite a set of images with a set of blend modes.
         * @param overlay Images to composite.
         * @param mode Blend modes to use.
         * @param options Optional options.
         * @return Blended image.
         */
        composite(overlay: ArrayImage, mode: SingleOrArray<BlendMode>, options?: {
            /**
             * Array of x coordinates to join at.
             */
            x?: ArrayConstant
            /**
             * Array of y coordinates to join at.
             */
            y?: ArrayConstant
            /**
             * Composite images in this colour space.
             */
            compositing_space?: Interpretation | Enum
            /**
             * Images have premultiplied alpha.
             */
            premultiplied?: boolean
        }): Image;

        //#endregion

        //#region Extra utility functions

        /**
         * Return the coordinates of the image maximum.
         * @return Array of output values.
         */
        maxPos(): number[];

        /**
         * Return the coordinates of the image minimum.
         * @return Array of output values.
         */
        minPos(): number[];

        //#endregion

        //#region Enum overloads

        /**
         * Flip an image horizontally.
         * @return Output image.
         */
        flipHor(): Image;

        /**
         * Flip an image vertically.
         * @return Output image.
         */
        flipVer(): Image;

        /**
         * Rotate an image 90 degrees clockwise.
         * @return Output image.
         */
        rot90(): Image;

        /**
         * Rotate an image 180 degrees.
         * @return Output image.
         */
        rot180(): Image;

        /**
         * Rotate an image 270 degrees clockwise.
         * @return Output image.
         */
        rot270(): Image;

        /**
         * size x size median filter.
         * @param size The size of the median filter, defaults to 3.
         * @return Output image.
         */
        median(size?: number): Image;

        /**
         * Return the largest integral value not greater than the argument.
         * @return Output image.
         */
        floor(): Image;

        /**
         * Return the smallest integral value not less than the argument.
         * @return Output image.
         */
        ceil(): Image;

        /**
         * Return the nearest integral value.
         * @return Output image.
         */
        rint(): Image;

        /**
         * AND image bands together.
         * @return Output image.
         */
        bandand(): Image;

        /**
         * OR image bands together.
         * @return Output image.
         */
        bandor(): Image;

        /**
         * EOR image bands together.
         * @return Output image.
         */
        bandeor(): Image;

        /**
         * Return the real part of a complex image.
         * @return Output image.
         */
        real(): Image;

        /**
         * Return the imaginary part of a complex image.
         * @return Output image.
         */
        imag(): Image;

        /**
         * Return an image converted to polar coordinates.
         * @return Output image.
         */
        polar(): Image;

        /**
         * Return an image converted to rectangular coordinates.
         * @return Output image.
         */
        rect(): Image;

        /**
         * Return the complex conjugate of an image.
         * @return Output image.
         */
        conj(): Image;

        /**
         * Return the sine of an image in degrees.
         * @return Output image.
         */
        sin(): Image;

        /**
         * Return the cosine of an image in degrees.
         * @return Output image.
         */
        cos(): Image;

        /**
         * Return the tangent of an image in degrees.
         * @return Output image.
         */
        tan(): Image;

        /**
         * Return the inverse sine of an image in degrees.
         * @return Output image.
         */
        asin(): Image;

        /**
         * Return the inverse cosine of an image in degrees.
         * @return Output image.
         */
        acos(): Image;

        /**
         * Return the inverse tangent of an image in degrees.
         * @return Output image.
         */
        atan(): Image;

        /**
         * Return the hyperbolic sine of an image in radians.
         * @return Output image.
         */
        sinh(): Image;

        /**
         * Return the hyperbolic cosine of an image in radians.
         * @return Output image.
         */
        cosh(): Image;

        /**
         * Return the hyperbolic tangent of an image in radians.
         * @return Output image.
         */
        tanh(): Image;

        /**
         * Return the inverse hyperbolic sine of an image in radians.
         * @return Output image.
         */
        asinh(): Image;

        /**
         * Return the inverse hyperbolic cosine of an image in radians.
         * @return Output image.
         */
        acosh(): Image;

        /**
         * Return the inverse hyperbolic tangent of an image in radians.
         * @return Output image.
         */
        atanh(): Image;

        /**
         * Return the natural log of an image.
         * @return Output image.
         */
        log(): Image;

        /**
         * Return the log base 10 of an image.
         * @return Output image.
         */
        log10(): Image;

        /**
         * Return e ** pixel.
         * @return Output image.
         */
        exp(): Image;

        /**
         * Return 10 ** pixel.
         * @return Output image.
         */
        exp10(): Image;

        //#endregion

        //#region Constant/image overloads

        /**
         * Erode with a structuring element.
         * @param mask Input matrix image.
         * @return Output image.
         */
        erode(mask: Image | ArrayConstant): Image;

        /**
         * Dilate with a structuring element.
         * @param mask Input matrix image.
         * @return Output image.
         */
        dilate(mask: Image | ArrayConstant): Image;

        /**
         * Raise to power of an image or constant.
         * @param right To the power of this.
         * @return Output image.
         */
        pow(right: Image | ArrayConstant): Image;

        /**
         * Raise to power of an image, but with the arguments reversed.
         * @param right To the power of this.
         * @return Output image.
         */
        wop(right: Image | ArrayConstant): Image;

        /**
         * Arc tangent of an image or constant.
         * @param right Divisor parameter.
         * @return Output image.
         */
        atan2(right: Image | ArrayConstant): Image;

        /**
         * Performs a bitwise left shift operation (<<).
         * @param right Right operand.
         * @return Output image.
         */
        lshift(right: Image | ArrayConstant): Image;

        /**
         * Performs a bitwise right shift operation (>>).
         * @param right Right operand.
         * @return Output image.
         */
        rshift(right: Image | ArrayConstant): Image;

        /**
         * Performs a bitwise AND operation (&).
         * @param right Right operand.
         * @return Output image.
         */
        and(right: Image | ArrayConstant): Image;

        /**
         * Performs a bitwise OR operation (|) .
         * @param right Right operand.
         * @return Output image.
         */
        or(right: Image | ArrayConstant): Image;

        /**
         * Performs a bitwise exclusive-OR operation (^).
         * @param right Right operand.
         * @return Output image.
         */
        eor(right: Image | ArrayConstant): Image;

        /**
         * Performs a relational greater than operation (>).
         * @param right Right operand.
         * @return Output image.
         */
        more(right: Image | ArrayConstant): Image;

        /**
         * Performs a relational greater than or equal operation (>=).
         * @param right Right operand.
         * @return Output image.
         */
        moreEq(right: Image | ArrayConstant): Image;

        /**
         * Performs a relational less than operation (<).
         * @param right Right operand.
         * @return Output image.
         */
        less(right: Image | ArrayConstant): Image;

        /**
         * Performs a relational less than or equal operation (<=).
         * @param right Right operand.
         * @return Output image.
         */
        lessEq(right: Image | ArrayConstant): Image;

        /**
         * Performs a relational equality operation (==).
         * @param right Right operand.
         * @return Output image.
         */
        equal(right: Image | ArrayConstant): Image;

        /**
         * Performs a relational inequality operation (!=).
         * @param right Right operand.
         * @return Output image.
         */
        notEq(right: Image | ArrayConstant): Image;

        //#endregion
    }

    //#endregion
