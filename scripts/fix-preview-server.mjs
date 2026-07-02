import { mkdir, readFile, readdir, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const scriptDir = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(scriptDir, "..");
const previewShimPath = resolve(projectRoot, "dist/server/server.js");
const previewShimSource = `export { default } from "../../.output/server/index.mjs";\n`;

const commonJsRuntimePatch = `const __create = Object.create;
const __defProp = Object.defineProperty;
const __getOwnPropDesc = Object.getOwnPropertyDescriptor;
const __getOwnPropNames = Object.getOwnPropertyNames;
const __getProtoOf = Object.getPrototypeOf;
const __hasOwnProp = Object.prototype.hasOwnProperty;
const __esmMin = (fn, res, err) => () => {
\tif (err) throw err[0];
\ttry {
\t\treturn fn && (res = fn(fn = 0)), res;
\t} catch (e) {
\t\tthrow err = [e], e;
\t}
};
const __commonJSMin = (cb, mod) => () => (mod || (cb((mod = { exports: {} }).exports, mod), cb = null), mod.exports);
const __copyProps = (to, from, except, desc) => {
\tif (from && (typeof from === "object" || typeof from === "function")) {
\t\tfor (const key of __getOwnPropNames(from)) {
\t\t\tif (!__hasOwnProp.call(to, key) && key !== except) {
\t\t\t\t__defProp(to, key, {
\t\t\t\t\tget: () => from[key],
\t\t\t\t\tenumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable,
\t\t\t\t});
\t\t\t}
\t\t}
\t}
\treturn to;
};
const __toESM = (mod, isNodeMode, target) => (
\ttarget = mod != null ? __create(__getProtoOf(mod)) : {},
\t__copyProps(
\t\tisNodeMode || !mod || !mod.__esModule
\t\t\t? __defProp(target, "default", { value: mod, enumerable: true })
\t\t\t: target,
\t\tmod,
\t)
);
`;

const helperImportPattern =
  /^import \{[^}]*((g as __esmMin)|(h as __commonJSMin))[^}]*\} from "\.\.\/(?:\.\.\/)?_ssr\/esm-Dova13aH\.mjs";\n/m;

async function walkFiles(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const entryPath = resolve(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await walkFiles(entryPath)));
      continue;
    }
    if (entry.isFile() && entry.name.endsWith(".mjs")) {
      files.push(entryPath);
    }
  }

  return files;
}

await mkdir(dirname(previewShimPath), { recursive: true });
await writeFile(previewShimPath, previewShimSource, "utf8");

const legacyServerOutputDir = resolve(projectRoot, ".output/server");
let serverOutputFiles = [];
try {
  serverOutputFiles = await walkFiles(legacyServerOutputDir);
} catch (error) {
  if (error?.code !== "ENOENT") throw error;
  process.stdout.write(`skip runtime patch: ${legacyServerOutputDir} not present\n`);
}
const patchedRuntimeFiles = [];

for (const filePath of serverOutputFiles) {
  const source = await readFile(filePath, "utf8");
  if (!helperImportPattern.test(source)) {
    continue;
  }

  const patchedSource = source.replace(helperImportPattern, `${commonJsRuntimePatch}\n`);
  if (patchedSource === source) {
    continue;
  }

  await writeFile(filePath, patchedSource, "utf8");
  patchedRuntimeFiles.push(filePath);
}

process.stdout.write(`preview shim ready: ${previewShimPath}\n`);
process.stdout.write(`patched runtime chunks: ${patchedRuntimeFiles.length}\n`);
for (const filePath of patchedRuntimeFiles) {
  process.stdout.write(` - ${filePath}\n`);
}
