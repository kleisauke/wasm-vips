# Releasing

## First-package bootstrap gate

The first `@colorhythm/vips-wasm` version cannot use npm trusted publishing
because the package does not yet exist. An authorized npm maintainer must perform
the one-time bootstrap manually.

Do not publish the bootstrap archive until the source commit has passed CI and
the exact archive has passed `release:verify`, the minimum-Node CommonJS/ESM
smoke test, and the expected SHA-256 check. Publish the verified `0.0.16`
archive from the `0.0.16` release commit without rebuilding it:

```shell
npm publish release/colorhythm-vips-wasm-0.0.16.tgz --access public --provenance=false --tag latest
```

Its expected SHA-256 is
`51d291ad9f2eb6734295d33884957956b2dacf8ebc2c929fc55e0e1132738d0d`, and its
expected npm SRI is
`sha512-u2tkTqV7O7sAnbyEKBV4MKpaI+xydCJ9Qz1XKU7W8Evo9axjgdpI5V5acPjT4QP4hw9KUlPii1CJWjE6PaAFPA==`.

Then configure npm trusted publishing for:

- Environment: `npm`
- Organization or user: `colorhythm`
- Repository: `vips-wasm`
- Workflow filename: `ci.yml`
- Allowed action: `npm publish`

The trusted workflow's publishing action must invoke `npm publish` directly, as
the release job in `ci.yml` does.

After trusted publishing is configured, push `vips-wasm-v0.0.16`. The tag CI
will rebuild and byte-compare the candidate with npm before it creates the
GitHub release. All later versions are published only by the tag CI after the
source build, tests, exact-archive verification, and minimum-Node smoke tests
succeed. The trusted workflow publishes new versions under the `next` dist-tag;
promote a version to `latest` only after Tyto staging and rollback verification
succeed. The manually bootstrapped `0.0.16` remains `latest` until that gate.

## Promotion and rollback

After Tyto staging validates `0.0.18`, promote the staged package without
repacking or republishing it:

```shell
npm dist-tag add @colorhythm/vips-wasm@0.0.18 latest
```

If a regression requires reversal, restore the known-good `0.0.16` package:

```shell
npm dist-tag add @colorhythm/vips-wasm@0.0.16 latest
```

Confirm the registry state after either command:

```shell
npm dist-tag ls @colorhythm/vips-wasm
```
