import { writeFile } from "node:fs/promises";

import { configJsonSchema } from "../dist/index.js";

await writeFile(
  new URL("../dotaf.schema.json", import.meta.url),
  `${JSON.stringify(configJsonSchema(), null, 2)}\n`,
);
