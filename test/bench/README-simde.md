# JPEG passthrough using simde

Context: [simd-everywhere/simde#646](https://github.com/simd-everywhere/simde/issues/646).

## Test environment

* Intel Core i5-8600K CPU 3.60GHz (Coffee Lake), 1 CPU, 6 logical and 6 physical cores
* Fedora 34
* Node v16.6.2<sup>1</sup>

<sup>1</sup> Node.js >= 16.4.0 is required to match the final SIMD opcodes.

## Test image

* [`2569067123_aca715a2ee_o.jpg`](images/2569067123_aca715a2ee_o.jpg) (2725×2225)

## The task

Decompress the JPEG image, and then save the image as JPEG again.
A "quality" setting of 80 is used during saving.

## Results

### libjpeg-turbo with SIMD

```bash
$ cd test/bench
$ node perf-jpeg-buffer-passthrough.js
Processing time: 685.8319929996505 milliseconds.
```

### libjpeg-turbo without SIMD

```diff
--- a/perf-jpeg-buffer-passthrough.js
+++ b/perf-jpeg-buffer-passthrough.js
@@ -14,7 +14,7 @@ const benchmark = async () => {
     const vips = await Vips({
       preRun: (module) => {
         // Enable SIMD usage in libjpeg-turbo
-        module.ENV.JSIMD_FORCENEON = '1';
+        //module.ENV.JSIMD_FORCENEON = '1';
       }
     });
 
```

```bash
$ cd test/bench
$ node perf-jpeg-buffer-passthrough.js
Processing time: 193.604350999929 milliseconds.
```

## Build notes

Build wasm-vips by running `npm run build` in the checkout directory
(requires Docker or Podman).

## Profiling notes

We'll use the [built-in profiler of Node.js](
https://nodejs.org/en/docs/guides/simple-profiling/), to avoid having
to build V8 from source.

Within the build script, it's necessary to [enable debug information](
https://emscripten.org/docs/porting/Debugging.html#debug-information)
to get function names, and to turn off SIMDe's inlining declarations
so that we  can see which intrinsics consume the most time. See commit
[`25f650f`](
https://github.com/kleisauke/wasm-vips/commit/25f650f878f8418a74a0e7217cf806d400c5dd2a)
for details.

After that, run the built-in profiler to generate a tick file. This
file can be post-processed using V8's tick processor bundled with the
Node.js binary.

```bash
$ node --prof perf-jpeg-buffer-passthrough.js
$ find . -name 'isolate-0x*-v8.log' -exec node --prof-process {} \; > v8-processed.log
```

## Profiling data

See [`v8-processed.log`](v8-processed.log).

### Ticks >= 10

- `simde_vshlq_u16`
- `simde_vld3_u8`
- `simde_vld4q_s16`
- `simde_vclzq_s16`
- `simde_vld1q_lane_s16`
- `simde_vtrn1q_s32`
- `simde_vtrn2q_s32`
- `simde_vtrn1q_s16`
