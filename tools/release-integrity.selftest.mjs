import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import {
    mkdir,
    mkdtemp,
    rm,
    writeFile,
} from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { verifyPublishedDirectory } from "./release-integrity.mjs";

const bytes = Buffer.from("trusted payload\n");
const manifest = {
    files: {
        "lib/payload.wasm": {
            sha256: createHash("sha256").update(bytes).digest("hex"),
            size: bytes.length,
        },
    },
    package: {
        name: "@colorhythm/vips-wasm",
        version: "0.0.0-test",
    },
    schemaVersion: 1,
    upstream: {
        version: "0.0.0-test",
    },
};
const packageMetadata = {
    browser: "lib/vips.js",
    exports: {
        ".": {
            browser: {
                import: "./lib/vips-es6.js",
                require: "./lib/vips.js",
            },
            node: {
                import: "./lib/vips-node.mjs",
                require: "./lib/vips-node.js",
            },
            default: "./lib/vips.js",
        },
        "./integrity": "./integrity.json",
    },
    main: "lib/vips-node.js",
    name: manifest.package.name,
    publishConfig: {
        access: "public",
        registry: "https://registry.npmjs.org/",
    },
    types: "lib/vips.d.ts",
    version: manifest.package.version,
};

const temporaryRoot = await mkdtemp(join(tmpdir(), "vips-wasm-selftest-"));
try {
    await mkdir(join(temporaryRoot, "lib"));
    await writeFile(join(temporaryRoot, "integrity.json"), JSON.stringify(manifest));
    await writeFile(join(temporaryRoot, "lib/payload.wasm"), bytes);
    await writeFile(join(temporaryRoot, "package.json"), JSON.stringify(packageMetadata));
    await writeFile(join(temporaryRoot, "README.md"), "test package\n");

    await verifyPublishedDirectory(temporaryRoot, manifest, packageMetadata);

    await writeFile(join(temporaryRoot, "package.json"), JSON.stringify({
        ...packageMetadata,
        description: "unexpected metadata",
    }));
    await assert.rejects(
        verifyPublishedDirectory(temporaryRoot, manifest, packageMetadata),
        /differs from the reviewed source metadata/,
    );

    for (const field of [
        "bundleDependencies",
        "bundledDependencies",
        "dependencies",
        "optionalDependencies",
        "peerDependencies",
    ]) {
        await writeFile(join(temporaryRoot, "package.json"), JSON.stringify({
            ...packageMetadata,
            [field]: {
                unexpected: "1.0.0",
            },
        }));
        await assert.rejects(
            verifyPublishedDirectory(temporaryRoot, manifest, packageMetadata),
            new RegExp(`${field} is not permitted`),
        );
    }

    for (const script of [
        "dependencies",
        "install",
        "postinstall",
        "postpack",
        "postprepare",
        "postpublish",
        "preinstall",
        "prepack",
        "prepare",
        "preprepare",
        "prepublish",
        "prepublishOnly",
        "publish",
    ]) {
        await writeFile(join(temporaryRoot, "package.json"), JSON.stringify({
            ...packageMetadata,
            scripts: {
                [script]: "node unexpected.js",
            },
        }));
        await assert.rejects(
            verifyPublishedDirectory(temporaryRoot, manifest, packageMetadata),
            new RegExp(`${script} lifecycle scripts are not permitted`),
        );
    }

    await writeFile(join(temporaryRoot, "package.json"), JSON.stringify(packageMetadata));

    await writeFile(join(temporaryRoot, "lib/payload.wasm"), "corrupt\n");
    await assert.rejects(
        verifyPublishedDirectory(temporaryRoot, manifest, packageMetadata),
        /size does not match|SHA-256 does not match/,
    );

    await writeFile(join(temporaryRoot, "lib/payload.wasm"), bytes);
    await writeFile(join(temporaryRoot, "unexpected.txt"), "unexpected\n");
    await assert.rejects(
        verifyPublishedDirectory(temporaryRoot, manifest, packageMetadata),
        /file set does not match/,
    );
} finally {
    await rm(temporaryRoot, { force: true, recursive: true });
}
