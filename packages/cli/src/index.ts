#!/usr/bin/env node
import { readFile } from "node:fs/promises";

import { run } from "./cli.js";
import { askBrand } from "./prompt.js";

const pkg = JSON.parse(await readFile(new URL("../package.json", import.meta.url), "utf8")) as {
  version: string;
};

process.exitCode = await run(process.argv.slice(2), {
  cwd: process.cwd(),
  version: pkg.version,
  interactive: process.stdin.isTTY && process.stdout.isTTY,
  out: (line) => {
    console.log(line);
  },
  err: (line) => {
    console.error(line);
  },
  askBrand,
});
