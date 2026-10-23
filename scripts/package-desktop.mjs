import { access, copyFile, cp, mkdir, readFile, rename, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { transform } from "esbuild";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const runtimeRoot = path.join(projectRoot, "node_modules", "electron", "dist");
const outputRoot = path.resolve(projectRoot, "desktop-dist");
const appOutput = path.resolve(outputRoot, "Rent Unfiltered-win32-x64");
const appRoot = path.join(appOutput, "resources", "app");
const electronExecutable = path.join(runtimeRoot, "electron.exe");
const appExecutable = path.join(appOutput, "Rent Unfiltered.exe");

function isInside(parent, candidate) {
  const relative = path.relative(path.resolve(parent), path.resolve(candidate));
  return relative === "" || (!relative.startsWith("..") && !path.isAbsolute(relative));
}

if (!isInside(projectRoot, outputRoot) || !isInside(outputRoot, appOutput)) {
  throw new Error("Refusing to write the desktop build outside this project.");
}

await access(electronExecutable);
await rm(appOutput, { recursive: true, force: true });
await mkdir(outputRoot, { recursive: true });
await cp(runtimeRoot, appOutput, { recursive: true });
await rename(path.join(appOutput, "electron.exe"), appExecutable);

const appFiles = [
  "styles.css",
  "lifecycle.jsx",
  "documents.jsx",
  "data.jsx",
  "shared.jsx",
  "tweaks-panel.jsx",
  "home.jsx",
  "project-guide.jsx",
  "extension-guide.jsx",
  "glossary.jsx",
  "rhir-spec.jsx",
  "form.jsx",
  "progress.jsx",
  "document-ui.jsx",
  "detail.jsx",
  "rri.jsx",
  "conclusion.jsx",
  "insight.jsx",
  "supabase.jsx",
  "admin.jsx",
  "electron/main.cjs",
  "scripts/network-status.js",
  "vendor/supabase.js",
  "node_modules/react/umd/react.production.min.js",
  "node_modules/react-dom/umd/react-dom.production.min.js",
  "vendor/supabase.js"
];

const jsxFiles = [
  "lifecycle.jsx",
  "documents.jsx",
  "data.jsx",
  "shared.jsx",
  "tweaks-panel.jsx",
  "home.jsx",
  "project-guide.jsx",
  "extension-guide.jsx",
  "glossary.jsx",
  "rhir-spec.jsx",
  "form.jsx",
  "progress.jsx",
  "document-ui.jsx",
  "detail.jsx",
  "rri.jsx",
  "conclusion.jsx",
  "insight.jsx",
  "supabase.jsx",
  "admin.jsx",
  "app.jsx"
];

await mkdir(appRoot, { recursive: true });
for (const entry of appFiles) {
  const source = path.join(projectRoot, entry);
  const destination = path.join(appRoot, entry);
  await mkdir(path.dirname(destination), { recursive: true });
  await copyFile(source, destination);
}

const transpiledScripts = [];
for (const entry of jsxFiles) {
  const source = await readFile(path.join(projectRoot, entry), "utf8");
  const result = await transform(source, {
    loader: "jsx",
    sourcefile: entry,
    target: "chrome120"
  });
  transpiledScripts.push(`// ${entry}\n${result.code}`);
}
await writeFile(path.join(appRoot, "app.js"), transpiledScripts.join("\n"));

const sourceIndex = await readFile(path.join(projectRoot, "index.html"), "utf8");
const desktopIndex = sourceIndex
  .replace(/<script src="node_modules\/@babel\/standalone\/babel\.min\.js"><\/script>\r?\n/, "")
  .replace(/<script type="text\/babel" src="[^"]+\.jsx"><\/script>\r?\n/g, "")
  .replace("</body>", "<script src=\"app.js\"></script>\n</body>");
await writeFile(path.join(appRoot, "index.html"), desktopIndex);

await writeFile(path.join(appRoot, "package.json"), JSON.stringify({
  name: "rent-unfiltered",
  version: "0.1.0",
  private: true,
  main: "electron/main.cjs"
}, null, 2) + "\n");

console.log(`Created Windows desktop app folder: ${path.relative(projectRoot, appOutput)}`);
console.log(`Launch locally: ${path.relative(projectRoot, appExecutable)}`);
