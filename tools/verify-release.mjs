import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import {
    mkdir,
    mkdtemp,
    rm,
} from "node:fs/promises";
import { tmpdir } from "node:os";
import {
    dirname,
    join,
    resolve,
} from "node:path";
import { fileURLToPath } from "node:url";
import {
    readJson,
    sha256,
    verifyPublishedDirectory,
} from "./release-integrity.mjs";

const REPOSITORY_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");

function parseOptions(arguments_) {
    assert.equal(
        arguments_[0],
        "--package-tarball",
        "Usage: npm run release:verify -- --package-tarball <path>",
    );
    assert.ok(arguments_[1], "A package tarball path is required");
    assert.equal(arguments_.length, 2, "Unexpected release verification options");
    return resolve(process.cwd(), arguments_[1]);
}

function run(command, arguments_) {
    const result = spawnSync(command, arguments_, {
        encoding: "utf8",
        stdio: ["ignore", "pipe", "pipe"],
    });
    if (result.status !== 0) {
        throw new Error(
            `${command} failed with status ${result.status}\n${result.stderr}`,
        );
    }
}

async function main() {
    const packageTarball = parseOptions(process.argv.slice(2));
    const manifest = await readJson(join(REPOSITORY_ROOT, "integrity.json"));
    const packageMetadata = await readJson(join(REPOSITORY_ROOT, "package.json"));
    const temporaryRoot = await mkdtemp(join(tmpdir(), "vips-wasm-verify-"));

    try {
        const extractDirectory = join(temporaryRoot, "extract");
        await mkdir(extractDirectory);
        run("tar", ["-xzf", packageTarball, "-C", extractDirectory]);
        await verifyPublishedDirectory(
            join(extractDirectory, "package"),
            manifest,
            packageMetadata,
        );

        process.stdout.write(`${JSON.stringify({
            package: manifest.package.name,
            sha256: await sha256(packageTarball),
            verified: true,
            version: manifest.package.version,
        }, null, 4)}\n`);
    } finally {
        await rm(temporaryRoot, { force: true, recursive: true });
    }
}

await main();
