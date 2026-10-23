import { mkdir } from "node:fs/promises";
import path from "node:path";
import { build } from "esbuild";

const output = path.resolve("vendor/supabase.js");

await mkdir(path.dirname(output), { recursive: true });
await build({
  entryPoints: ["scripts/desktop-supabase-entry.js"],
  outfile: output,
  bundle: true,
  minify: true,
  format: "iife",
  platform: "browser",
  target: "chrome120",
  legalComments: "linked"
});

console.log(`Built local Supabase browser bundle: ${path.relative(process.cwd(), output)}`);
