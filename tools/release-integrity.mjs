import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFile, readdir, stat } from "node:fs/promises";
import { join, relative, sep } from "node:path";

const PACKAGE_METADATA_FILES = Object.freeze([
    "integrity.json",
    "package.json",
    "README.md",
]);
const FORBIDDEN_DEPENDENCY_FIELDS = Object.freeze([
    "bundleDependencies",
    "bundledDependencies",
    "dependencies",
    "optionalDependencies",
    "peerDependencies",
]);
const FORBIDDEN_LIFECYCLE_SCRIPTS = Object.freeze([
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
]);

async function listFiles(root, directory = root) {
    const entries = await readdir(directory, { withFileTypes: true });
    const files = [];

    for (const entry of entries.sort((a, b) => a.name.localeCompare(b.name))) {
        const absolutePath = join(directory, entry.name);
        if (entry.isDirectory()) {
            files.push(...await listFiles(root, absolutePath));
            continue;
        }
        if (!entry.isFile()) {
            throw new Error(`Unsupported package entry: ${absolutePath}`);
        }

        files.push(relative(root, absolutePath).split(sep).join("/"));
    }

    return files.sort();
}

export async function readJson(path) {
    return JSON.parse(await readFile(path, "utf8"));
}

export async function digest(path, algorithm, encoding = "hex") {
    const bytes = await readFile(path);
    return createHash(algorithm).update(bytes).digest(encoding);
}

export async function sha256(path) {
    return digest(path, "sha256");
}

async function verifyFileSet(root, expectedFiles) {
    const actualFiles = await listFiles(root);
    assert.deepEqual(
        actualFiles,
        [...expectedFiles].sort(),
        "Package archive file set does not match the trusted allowlist",
    );
}

async function verifyPayloadFiles(root, manifest) {
    for (const [relativePath, expected] of Object.entries(manifest.files)) {
        const absolutePath = join(root, relativePath);
        const fileStat = await stat(absolutePath);
        assert.equal(
            fileStat.size,
            expected.size,
            `${relativePath} size does not match the trusted manifest`,
        );
        assert.equal(
            await sha256(absolutePath),
            expected.sha256,
            `${relativePath} SHA-256 does not match the trusted manifest`,
        );
    }
}

function verifyManifest(manifest) {
    assert.equal(manifest.schemaVersion, 1, "Unsupported integrity schema");
    assert.equal(
        manifest.package.version,
        manifest.upstream.version,
        "Colorhythm and upstream versions must match",
    );
}

function verifyPackagePolicy(packageMetadata) {
    for (const field of FORBIDDEN_DEPENDENCY_FIELDS) {
        assert.equal(
            packageMetadata[field],
            undefined,
            `${field} is not permitted in the published package`,
        );
    }

    for (const script of FORBIDDEN_LIFECYCLE_SCRIPTS) {
        assert.equal(
            packageMetadata.scripts?.[script],
            undefined,
            `${script} lifecycle scripts are not permitted in the published package`,
        );
    }
}

export async function verifyPublishedDirectory(
    root,
    trustedManifest,
    trustedPackageMetadata,
) {
    verifyManifest(trustedManifest);
    verifyPackagePolicy(trustedPackageMetadata);
    await verifyFileSet(root, [
        ...Object.keys(trustedManifest.files),
        ...PACKAGE_METADATA_FILES,
    ]);

    const packagedManifest = await readJson(join(root, "integrity.json"));
    assert.deepEqual(
        packagedManifest,
        trustedManifest,
        "Packaged integrity manifest differs from the trusted source manifest",
    );

    const packageMetadata = await readJson(join(root, "package.json"));
    verifyPackagePolicy(packageMetadata);
    assert.deepEqual(
        packageMetadata,
        trustedPackageMetadata,
        "Packaged package.json differs from the reviewed source metadata",
    );
    assert.equal(packageMetadata.name, trustedManifest.package.name);
    assert.equal(packageMetadata.version, trustedManifest.package.version);
    const rootExport = packageMetadata.exports?.["."];
    assert.deepEqual(
        Object.keys(rootExport || {}),
        ["browser", "node", "default"],
        "Root export conditions are missing or ordered unsafely",
    );
    assert.deepEqual(rootExport.browser, {
        import: "./lib/vips-es6.js",
        require: "./lib/vips.js",
    });
    assert.deepEqual(rootExport.node, {
        import: "./lib/vips-node.mjs",
        require: "./lib/vips-node.js",
    });
    assert.equal(rootExport.default, "./lib/vips.js");
    assert.equal(packageMetadata.browser, "lib/vips.js");
    assert.equal(packageMetadata.main, "lib/vips-node.js");
    assert.equal(packageMetadata.types, "lib/vips.d.ts");
    assert.equal(packageMetadata.exports?.["./integrity"], "./integrity.json");
    assert.equal(packageMetadata.publishConfig?.access, "public");
    assert.equal(
        packageMetadata.publishConfig?.registry,
        "https://registry.npmjs.org/",
    );

    await verifyPayloadFiles(root, trustedManifest);
}

export async function verifyUpstreamDirectory(root, trustedManifest) {
    verifyManifest(trustedManifest);
    await verifyFileSet(root, [
        ...Object.keys(trustedManifest.files),
        "package.json",
        "README.md",
    ]);

    const packageMetadata = await readJson(join(root, "package.json"));
    assert.equal(packageMetadata.name, trustedManifest.upstream.name);
    assert.equal(packageMetadata.version, trustedManifest.upstream.version);

    await verifyPayloadFiles(root, trustedManifest);
}
