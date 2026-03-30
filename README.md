# monash-iconlab.github.io

ICON Lab website (GitHub Pages root site).

## Deploy (GitHub Pages)

In this repo: **Settings → Pages → Source** → Deploy from a branch → **main** → **/ (root)**.

## Updating content

### Team

- Edit the Team section directly in `index.html` (Director + Members).
- Team photos live under `images/team/`.

### News

- Homepage list: `data/news.json`
- Detail pages: `news/*.html` (copy an existing file and edit)
- YouTube embed: paste the `<iframe ...></iframe>` inside the `<div class="video-embed">` block.

### Projects

- Homepage list: `data/projects.json`
- Detail pages: `projects/*.html` (copy an existing file and edit)
- YouTube embed: same as News.

### About / Contact

- Edit the About and Contact sections in `index.html`.

## Local preview

Use a local server so JSON loads correctly:

- `npx serve .`
- or `python -m http.server`
