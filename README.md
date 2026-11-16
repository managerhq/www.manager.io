# Manager.io website

Static website built with [Eleventy](https://www.11ty.dev/) and Tailwind CSS, deployed to GitHub Pages.

## Commands

```
npm install      # once
npm start        # local preview at http://localhost:8080, rebuilds on change
npm run build    # writes the site to _site/
```

Pushing to `main` builds and deploys the site (`.github/workflows/pages.yml`).

## Where things are

| Path | What it holds |
|---|---|
| `src/*.njk` | One file per page, or per kind of page (`guides.njk`, `language.njk`) |
| `src/_includes/` | Layout, header, footer and other shared pieces |
| `src/_data/releases.json` | Release notes shown on `/releases/` |
| `src/_data/banners.json` | Country-specific messages, keyed by country and page path |
| `src/_data/languages.json` | Languages; each gets a download page such as `/ar/` |
| `src/_data/translations.json` | Text of the language pages |
| `src/_data/guideSidebar.json` | Menu on the guide pages |
| `content/guides/*.json` | Guide content; each file becomes `/guides/{name}/` |
| `content/openapi/*.json` | OpenAPI specs; each is published at `/openapi/{name}.json` and gets a viewer page at `/extend/openapi/{name}/` |
| `public/` | Files copied to the site as they are |
| `eleventy.config.js` | Build configuration and template filters |

Tailwind runs after each Eleventy build and reads the generated HTML, so any class used in a page or in guide content is picked up automatically.
