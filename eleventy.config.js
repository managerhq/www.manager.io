import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { HtmlBasePlugin } from "@11ty/eleventy";
import markdownIt from "markdown-it";

const run = promisify(execFile);
const markdown = markdownIt(); // raw HTML in banner markdown stays disabled (the default)

// Versions are calendar based: "25.1.10.123" is YY.M.D.build.
function versionDate(version) {
  const match = String(version ?? "").match(/^v?(\d{1,2})\.(\d{1,2})\.(\d{1,2})\.\d+$/);
  if (!match) return null;
  const date = new Date(Date.UTC(2000 + Number(match[1]), Number(match[2]) - 1, Number(match[3])));
  return Number.isNaN(date.getTime()) ? null : date;
}

const formatDate = (date, options) => date.toLocaleDateString("en-US", { ...options, timeZone: "UTC" });

export default function (eleventyConfig) {
  // Rewrites root-relative URLs when the site is built with --pathprefix
  // (needed only while it is served from username.github.io/repository/).
  eleventyConfig.addPlugin(HtmlBasePlugin);

  eleventyConfig.addPassthroughCopy({ public: "/", "content/openapi": "openapi" });
  eleventyConfig.addWatchTarget("./content/guides/");
  eleventyConfig.addWatchTarget("./src/css/");
  eleventyConfig.addWatchTarget("./tailwind.config.js");

  eleventyConfig.addFilter("num", (value) => Number(value).toLocaleString("en-US"));
  eleventyConfig.addFilter("sumBy", (items, key) => items.reduce((total, item) => total + item[key], 0));

  // "/guides/sales-invoices/" -> Home > Guides > Sales Invoices
  eleventyConfig.addFilter("breadcrumb", (url) => {
    const trail = [{ url: "/", label: "Home" }];
    let path = "/";
    for (const segment of url.split("/").filter(Boolean)) {
      path += `${segment}/`;
      const label = segment.split("-").map((word) => word.charAt(0).toUpperCase() + word.slice(1)).join(" ");
      trail.push({ url: path, label });
    }
    return trail;
  });

  // Banners for one page as JSON: { "<country>": "<html>" }. Empty string when there are none.
  eleventyConfig.addFilter("bannersFor", (banners, url) => {
    const path = url.replace(/(.)\/$/, "$1");
    const matches = banners.filter((banner) => banner.path === path);
    if (matches.length === 0) return "";
    const byCountry = Object.fromEntries(matches.map((b) => [b.country.toLowerCase(), markdown.render(b.value)]));
    return JSON.stringify(byCountry).replace(/</g, "\\u003c");
  });

  // Releases grouped by month, newest first.
  eleventyConfig.addFilter("releaseMonths", (releases) => {
    const months = new Map();
    for (const release of releases) {
      const date = versionDate(release.version);
      const key = date ? date.toISOString().slice(0, 7) : "";
      if (!months.has(key)) months.set(key, { key, heading: date ? formatDate(date, { year: "numeric", month: "long" }) : "Other", items: [] });
      months.get(key).items.push({
        ...release,
        time: date?.getTime() ?? 0,
        day: date ? formatDate(date, { day: "2-digit", month: "short" }) : "—",
        weekday: date ? formatDate(date, { weekday: "short" }) : "",
      });
    }
    return [...months.values()]
      .sort((a, b) => b.key.localeCompare(a.key))
      .map((month) => ({ ...month, items: month.items.sort((a, b) => b.time - a.time) }));
  });

  // Tailwind scans the generated HTML, so it runs after every Eleventy build.
  eleventyConfig.on("eleventy.after", async () => {
    await run(process.execPath, [
      "node_modules/tailwindcss/lib/cli.js",
      "-i", "src/css/input.css",
      "-o", "_site/style.css",
      "--minify",
    ]);
  });

  return {
    dir: { input: "src", output: "_site" },
  };
}
