import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import {
    copyFile,
    mkdir,
    mkdtemp,
    rm,
} from "node:fs/promises";
import { tmpdir } from "node:os";
import {
    basename,
    dirname,
    join,
    resolve,
} from "node:path";
import { fileURLToPath } from "node:url";
import {
    digest,
    readJson,
    sha256,
    verifyPublishedDirectory,
    verifyUpstreamDirectory,
} from "./release-integrity.mjs";

const REPOSITORY_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");

function parseOptions(arguments_) {
    const options = {
        outputDirectory: resolve(process.cwd(), "release"),
        upstreamTarball: null,
    };

    for (let index = 0; index < arguments_.length; index += 1) {
        const argument = arguments_[index];
        const value = arguments_[index + 1];
        if (argument === "--output-directory" && value) {
            options.outputDirectory = resolve(process.cwd(), value);
            index += 1;
            continue;
        }
        if (argument === "--upstream-tarball" && value) {
            options.upstreamTarball = resolve(process.cwd(), value);
            index += 1;
            continue;
        }
        throw new Error(`Unknown or incomplete option: ${argument}`);
    }

    return options;
}

function run(command, arguments_, options = {}) {
    const result = spawnSync(command, arguments_, {
        cwd: options.cwd,
        encoding: "utf8",
        stdio: ["ignore", "pipe", "pipe"],
    });
    if (result.status !== 0) {
        throw new Error(
            `${command} failed with status ${result.status}\n${result.stderr}`,
        );
    }
    return result.stdout.trim();
}

function parsePackResult(output) {
    const result = JSON.parse(output);
    assert.equal(result.length, 1, "npm pack must produce exactly one archive");
    return result[0];
}

async function verifyUpstreamTarball(path, manifest) {
    assert.equal(
        await digest(path, "sha1"),
        manifest.upstream.shasum,
        "Upstream tarball SHA-1 differs from npm metadata",
    );
    assert.equal(
        await sha256(path),
        manifest.upstream.tarballSha256,
        "Upstream tarball SHA-256 differs from the trusted manifest",
    );
    assert.equal(
        `sha512-${await digest(path, "sha512", "base64")}`,
        manifest.upstream.integrity,
        "Upstream tarball SRI differs from npm metadata",
    );
}

async function main() {
    const options = parseOptions(process.argv.slice(2));
    const manifest = await readJson(join(REPOSITORY_ROOT, "integrity.json"));
    const packageMetadata = await readJson(join(REPOSITORY_ROOT, "package.json"));
    assert.equal(packageMetadata.name, manifest.package.name);
    assert.equal(packageMetadata.version, manifest.package.version);

    if (process.env.GITHUB_REF_NAME) {
        assert.equal(
            process.env.GITHUB_REF_NAME,
            `vips-wasm-v${manifest.package.version}`,
            "Release tag does not match package version",
        );
    }

    const temporaryRoot = await mkdtemp(join(tmpdir(), "vips-wasm-release-"));
    try {
        const cacheDirectory = join(temporaryRoot, "npm-cache");
        const downloadDirectory = join(temporaryRoot, "download");
        const extractDirectory = join(temporaryRoot, "upstream");
        await mkdir(cacheDirectory);
        await mkdir(downloadDirectory);
        await mkdir(extractDirectory);
        await mkdir(options.outputDirectory, { recursive: true });

        let upstreamTarball = options.upstreamTarball;
        if (!upstreamTarball) {
            const packResult = parsePackResult(run("npm", [
                "pack",
                `${manifest.upstream.name}@${manifest.upstream.version}`,
                "--cache",
                cacheDirectory,
                "--ignore-scripts",
                "--json",
                "--pack-destination",
                downloadDirectory,
            ]));
            upstreamTarball = join(downloadDirectory, packResult.filename);
        }

        await verifyUpstreamTarball(upstreamTarball, manifest);
        run("tar", ["-xzf", upstreamTarball, "-C", extractDirectory]);

        const upstreamPackageDirectory = join(extractDirectory, "package");
        await verifyUpstreamDirectory(upstreamPackageDirectory, manifest);
        await copyFile(
            join(REPOSITORY_ROOT, "integrity.json"),
            join(upstreamPackageDirectory, "integrity.json"),
        );
        await copyFile(
            join(REPOSITORY_ROOT, "package.json"),
            join(upstreamPackageDirectory, "package.json"),
        );
        await copyFile(
            join(REPOSITORY_ROOT, "README.md"),
            join(upstreamPackageDirectory, "README.md"),
        );

        const colorhythmPack = parsePackResult(run("npm", [
            "pack",
            upstreamPackageDirectory,
            "--cache",
            cacheDirectory,
            "--ignore-scripts",
            "--json",
            "--pack-destination",
            options.outputDirectory,
        ]));
        const colorhythmTarball = join(
            options.outputDirectory,
            colorhythmPack.filename,
        );

        const verificationDirectory = join(temporaryRoot, "verification");
        await mkdir(verificationDirectory);
        run("tar", ["-xzf", colorhythmTarball, "-C", verificationDirectory]);
        await verifyPublishedDirectory(
            join(verificationDirectory, "package"),
            manifest,
            packageMetadata,
        );

        process.stdout.write(`${JSON.stringify({
            filename: basename(colorhythmTarball),
            package: manifest.package.name,
            sha256: await sha256(colorhythmTarball),
            upstreamSha256: manifest.upstream.tarballSha256,
            version: manifest.package.version,
        }, null, 4)}\n`);
    } finally {
        await rm(temporaryRoot, { force: true, recursive: true });
    }
}

await main();
