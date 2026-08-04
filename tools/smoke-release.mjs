import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import {
    mkdir,
    mkdtemp,
    readFile,
    rm,
    writeFile,
} from "node:fs/promises";
import { tmpdir } from "node:os";
import {
    dirname,
    join,
    resolve,
} from "node:path";
import { fileURLToPath } from "node:url";
import { readJson } from "./release-integrity.mjs";

const REPOSITORY_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");

function parseOptions(arguments_) {
    const options = {
        expectedNodeVersion: null,
        packageTarball: null,
    };

    for (let index = 0; index < arguments_.length; index += 1) {
        const argument = arguments_[index];
        const value = arguments_[index + 1];
        if (argument === "--expected-node-version" && value) {
            options.expectedNodeVersion = value;
            index += 1;
            continue;
        }
        if (argument === "--package-tarball" && value) {
            options.packageTarball = resolve(process.cwd(), value);
            index += 1;
            continue;
        }
        throw new Error(`Unknown or incomplete option: ${argument}`);
    }

    assert.ok(options.packageTarball, "A package tarball path is required");
    return options;
}

function run(command, arguments_, options = {}) {
    const result = spawnSync(command, arguments_, {
        cwd: options.cwd,
        encoding: "utf8",
        input: options.input,
        stdio: [
            options.input === undefined ? "ignore" : "pipe",
            "pipe",
            "pipe",
        ],
    });
    if (result.status !== 0) {
        throw new Error(
            `${command} failed with status ${result.status}\n${result.stderr}`,
        );
    }
}

function browserCommonJsSmokeSource(packageName) {
    return `"use strict";
const assert = require("node:assert/strict");
const Vips = require(${JSON.stringify(packageName)});

assert.equal(typeof Vips, "function");
`;
}

function smokeSource(packageName, moduleType) {
    if (moduleType === "commonjs") {
        return `"use strict";
const assert = require("node:assert/strict");
const Vips = require(${JSON.stringify(packageName)});

const DYNAMIC_LIBRARIES = Object.freeze([
    "vips-heif.wasm",
    "vips-jxl.wasm",
    "vips-resvg.wasm",
]);
const DYNAMIC_OPERATIONS = Object.freeze([
    "heifload",
    "jxlload",
    "svgload",
]);

function verifyVips(vips) {
    assert.equal(typeof vips.shutdown, "function");
    for (const operation of DYNAMIC_OPERATIONS) {
        assert.notEqual(
            vips.Utils.typeFind("VipsOperation", operation),
            0,
            operation + " was not registered by its dynamic library",
        );
    }

    const input = vips.Image.newFromMemory(
        new Uint8Array([1, 2, 3, 4]),
        2,
        2,
        1,
        "uchar",
    );
    let output;
    try {
        output = input.add(10);
        assert.equal(output.avg(), 12.5);
    } finally {
        if (output) {
            output.delete();
        }
        input.delete();
    }
}

async function main() {
    assert.equal(typeof Vips, "function");
    const vips = await Vips({ dynamicLibraries: DYNAMIC_LIBRARIES });
    try {
        verifyVips(vips);
    } finally {
        vips.shutdown();
    }
}

main().catch(error => {
    console.error(error);
    process.exitCode = 1;
});
`;
    }

    return `import assert from "node:assert/strict";
import Vips from ${JSON.stringify(packageName)};

const DYNAMIC_LIBRARIES = Object.freeze([
    "vips-heif.wasm",
    "vips-jxl.wasm",
    "vips-resvg.wasm",
]);
const DYNAMIC_OPERATIONS = Object.freeze([
    "heifload",
    "jxlload",
    "svgload",
]);

function verifyVips(vips) {
    assert.equal(typeof vips.shutdown, "function");
    for (const operation of DYNAMIC_OPERATIONS) {
        assert.notEqual(
            vips.Utils.typeFind("VipsOperation", operation),
            0,
            operation + " was not registered by its dynamic library",
        );
    }

    const input = vips.Image.newFromMemory(
        new Uint8Array([1, 2, 3, 4]),
        2,
        2,
        1,
        "uchar",
    );
    let output;
    try {
        output = input.add(10);
        assert.equal(output.avg(), 12.5);
    } finally {
        if (output) {
            output.delete();
        }
        input.delete();
    }
}

assert.equal(typeof Vips, "function");
const vips = await Vips({ dynamicLibraries: DYNAMIC_LIBRARIES });
try {
    verifyVips(vips);
} finally {
    vips.shutdown();
}
`;
}

async function main() {
    const options = parseOptions(process.argv.slice(2));
    if (options.expectedNodeVersion) {
        assert.equal(
            process.versions.node,
            options.expectedNodeVersion,
            "Smoke test is not running on the required Node version",
        );
    }

    const packageMetadata = await readJson(join(REPOSITORY_ROOT, "package.json"));
    const temporaryRoot = await mkdtemp(join(tmpdir(), "vips-wasm-smoke-"));
    try {
        await writeFile(join(temporaryRoot, "package.json"), `${JSON.stringify({
            name: "vips-wasm-release-smoke",
            private: true,
            type: "module",
        }, null, 4)}\n`);
        const packageDirectory = join(
            temporaryRoot,
            "node_modules",
            ...packageMetadata.name.split("/"),
        );
        await mkdir(packageDirectory, { recursive: true });
        run("tar", [
            "-xzf",
            options.packageTarball,
            "-C",
            packageDirectory,
            "--strip-components=1",
        ]);

        const browserCommonJsPath = join(
            temporaryRoot,
            "browser-export-smoke.cjs",
        );
        const browserModuleSource = await readFile(
            join(packageDirectory, "lib", "vips-es6.js"),
            "utf8",
        );
        const commonJsPath = join(temporaryRoot, "node-smoke.cjs");
        const modulePath = join(temporaryRoot, "node-smoke.mjs");
        await writeFile(
            browserCommonJsPath,
            browserCommonJsSmokeSource(packageMetadata.name),
        );
        await writeFile(
            commonJsPath,
            smokeSource(packageMetadata.name, "commonjs"),
        );
        await writeFile(
            modulePath,
            smokeSource(packageMetadata.name, "module"),
        );
        run(
            process.execPath,
            ["--conditions=browser", browserCommonJsPath],
            { cwd: temporaryRoot },
        );
        run(
            process.execPath,
            ["--check", "--input-type=module"],
            {
                cwd: temporaryRoot,
                input: browserModuleSource,
            },
        );
        run(process.execPath, [commonJsPath], { cwd: temporaryRoot });
        run(process.execPath, [modulePath], { cwd: temporaryRoot });

        process.stdout.write(`${JSON.stringify({
            browserCommonjs: true,
            browserEsmSyntax: true,
            commonjs: true,
            dynamicLibraries: true,
            esm: true,
            initialized: true,
            node: process.versions.node,
            operations: true,
            package: `${packageMetadata.name}@${packageMetadata.version}`,
        }, null, 4)}\n`);
    } finally {
        await rm(temporaryRoot, { force: true, recursive: true });
    }
}

await main();
