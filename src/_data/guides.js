import { readdir, readFile } from "node:fs/promises";

const directory = new URL("../../content/guides/", import.meta.url);

const text = (html) => html.replace(/<[^>]+>/g, "").trim();

// One entry per content/guides/{slug}.json, which holds { key, content } where content is HTML.
export default async function () {
  const files = (await readdir(directory)).filter((name) => name.endsWith(".json")).sort();

  return Promise.all(files.map(async (name) => {
    const slug = name.slice(0, -".json".length);
    const guide = JSON.parse(await readFile(new URL(name, directory), "utf8"));
    const toc = [];

    const html = guide.content
      // Guides link to each other with and without a leading slash.
      .replace(/href="\/?guides\/([a-z0-9-]+)"/g, 'href="/guides/$1/"')
      // Number the h2 headings so the "On this page" list can link to them.
      .replace(/<h2\b([^>]*)>([\s\S]*?)<\/h2>/g, (match, attributes, inner) => {
        const id = toc.length + 1;
        toc.push({ id, text: text(inner) });
        return `<h2 id="${id}"${attributes.replace(/\sid="[^"]*"/, "")}>${inner}</h2>`;
      });

    return {
      slug,
      url: slug === "default" ? "/guides/" : `/guides/${slug}/`,
      title: text(guide.content.match(/<h1\b[^>]*>([\s\S]*?)<\/h1>/)?.[1] ?? ""),
      html,
      toc,
    };
  }));
}
