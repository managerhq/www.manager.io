import { readdir } from "node:fs/promises";

// Names of the specs in content/openapi/{name}.json. A name starts with its verb, e.g. "get-customers".
export default async function () {
  const files = await readdir(new URL("../../content/openapi/", import.meta.url));

  return files
    .filter((name) => name.endsWith(".json"))
    .map((name) => name.slice(0, -".json".length))
    .sort();
}
