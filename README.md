# Portfolio site — monograph edition

Static site, no framework and no build step. Content lives in JSON files edited through Pages CMS; Netlify hosts it and resizes images.

- **SETUP.md** — putting it online (GitHub → Netlify → Pages CMS)
- **HOW-TO-UPDATE.md** — the artist's guide to editing content

## Files

| Path | What it is | Who edits it |
|---|---|---|
| `index.html` | Page shell: head, masthead, menu, footer, lightbox | Developer |
| `styles.css` | All design tokens and layout | Developer |
| `app.js` | Loads the content, routes between pages, renders them | Developer |
| `content/works.json` | Projects, in display order | Pages CMS |
| `content/site.json` | Name, bio, contact, clients, press, available work | Pages CMS |
| `images/`, `video/`, `files/` | Uploaded media | Pages CMS |
| `.pages.yml` | Defines the editing forms | Developer |
| `pages-cms-config-copy.txt` | Visible copy of `.pages.yml` for uploading through a browser | — |
| `netlify.toml` | Hosting settings (no build, publish the root) | Developer |
| `404.html` | Sends unknown paths to the site's own not-found page | — |

## Pages

| Hash | Page |
|---|---|
| `#cover` (or none) | Cover and featured sequence |
| `#index` | Contents list, filterable by discipline and year |
| `#work-<slug>` | One project; slug is made from the title unless `slug` is set |
| `#archive` | Contact sheet of every image, with lightbox |
| `#info` / `#contact` | Bio and details |
| anything else | Not-found page |

## Content model

`content/works.json` is a list. Each project:

```json
{
  "title": "Lent",
  "year": 2025,
  "discipline": "Styling",
  "client": "Mara Editions",
  "role": "Stylist",
  "featured": true,
  "summary": "…",
  "images": [
    { "image": "/images/lent-01.jpg", "ratio": "4:5", "alt": "…", "caption": "", "vimeo": "", "video": "" }
  ],
  "credits": [{ "role": "Photography", "name": "Jonas Weil" }],
  "slug": ""
}
```

- An image with `vimeo` or `video` set renders as a film; `image` becomes the poster (and the still used in thumbnails, archive and lightbox).
- `ratio` reserves space before the photo loads. If it doesn't match the photo, `app.js` corrects it from the file on load.
- An image path that doesn't exist yet renders as a flat block at its ratio with the filename printed, never a broken-image icon. The sample projects rely on this.
- The cover photo is the first upright image of the first `featured` project; the sequence beneath uses the first image of each featured project (max six).
- Discipline options for the editor are in `.pages.yml`; the Index filters are built from the disciplines actually used.

## Images

Editors upload one large file. On the live site, `app.js` requests 800 / 1200 / 1600 / 2400px versions from Netlify Image CDN (`/.netlify/images?url=…&w=…`) and sets `srcset`. Locally (localhost or file) it uses the originals. If the site moves off Netlify, set `IMAGE_CDN = false` at the top of `app.js` or replace `imgUrl()` with another resizing service.

## Fonts

Three roles in `styles.css`: `--font-display` (Inter 300), `--font-body` (Newsreader), `--font-meta` (Space Mono), loaded from Google Fonts in `index.html`. For production, consider licensed faces: Neue Haas Grotesk Display Light or Founders Grotesk Light (display), Signifier or Lyon Text (body), Neue Haas Unica or Söhne Mono (meta). Self-host the `.woff2` files, add `@font-face` rules, change the three variables and remove the Google Fonts link.

## Colour

Four tokens only: `--rose` (accent, active states, colophon band), `--blush` (page), `--paper` (plates), `--ink` (text, 85% for body copy, 72% for secondary labels).

## Local preview

The page fetches its JSON, so it needs a server: `python3 -m http.server` in this folder, then http://localhost:8000.

## Changing the editor forms

When adding a field: add it to `.pages.yml`, read it in `normalise()` in `app.js`, render it in the relevant view function. Existing content keeps working because every field has a fallback.
