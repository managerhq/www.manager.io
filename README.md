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
| `src/cloud-edition.njk`, `accountants.njk`, `advisors.njk`, `advisor-profile.njk` | Public pages of the cloud edition. Sign-up, the customer portal and the API they read are the ManagerCloud project at `site.cloud` (see below) |
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

## Cloud edition pages

Everything public about the cloud edition is here; everything that needs a signed-in user is on
`www.manager.cloud` (the ManagerCloud project), whose address is `cloud` in `src/_data/site.json`.

- `/cloud-edition/` — pricing, features and FAQ. Prices are in the page's front matter.
- `/accountants/` — the accountants directory, a StoreRocket widget loaded by `public/js/accountants.js`.
- `/advisors/` and `/advisors/profile/?username=…` — the advisor directory. `public/js/advisors.js` and
  `advisor-profile.js` read it in the browser from the anonymous `GET /api/advisors/*` and
  `/api/languages` endpoints on manager.cloud, which answer with `Access-Control-Allow-Origin: *`.
  Contacting an advisor needs a signed-in sender, so that button leads to manager.cloud.

`www.manager.cloud` redirects its old `/`, `/accountants`, `/advisors` and `/advisors/profile` here.

Tailwind runs after each Eleventy build and reads the generated HTML, so any class used in a page or in guide content is picked up automatically.
