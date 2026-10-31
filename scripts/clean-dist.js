// tsc never deletes output, so a moved or renamed source file would leave its old build in
// dist/ and ship it. Every package's build runs this first, from the package folder.
import { rmSync } from "node:fs";

rmSync("dist", { recursive: true, force: true });
