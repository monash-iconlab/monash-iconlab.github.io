# ICON Lab Research Group Website

Static website for ICON Lab, designed for [GitHub Pages](https://pages.github.com/) (no backend, no cost).

## Deploy on GitHub Pages

1. Create a new repository (e.g. `iconlab.github.io` for `https://iconlab.github.io`, or any name for `https://username.github.io/repo-name`).
2. Push this project to the repo.
3. In the repo: **Settings → Pages → Source**: choose **Deploy from a branch**.
4. Branch: **main**, folder: **/ (root)**. Save.
5. The site will be live at the URL shown (may take a minute).

## Updating content

### Team (photos and introductions)

- **Photos**: Add image files (e.g. JPG/PNG) under `images/team/` (e.g. `jane.jpg`, `john.jpg`).
- **List and bios**: Edit `data/team.json`. Each member has:
  - `name`, `role`, `bio`
  - `photo`: path from site root, e.g. `images/team/jane.jpg`
- Add or remove members by adding/removing objects in the `members` array.

### News

- **Homepage list**: Edit `data/news.json`. Each item has `date`, `title`, `excerpt`, and `slug` (used for the link).
- **Full story and video**: Create a new file in `news/` named `YYYY-MM-slug.html` (use the same `slug` as in `news.json`). Copy from `news/2024-01-placeholder.html` and change the title, date, and body text.
- **YouTube embed**: On the news page, find the `<div class="video-embed">` block. In YouTube: **Share → Embed**, copy the `<iframe ...></iframe>` and paste it inside that div (replace or add to the existing iframe).

### Projects

- **Homepage list**: Edit `data/projects.json`. Each item has `title`, `excerpt`, and `slug`.
- **Project page**: Create `projects/slug.html` (same `slug` as in JSON). Copy from `projects/placeholder-project.html`, edit the title and content.
- **YouTube embed**: Same as news—paste the YouTube embed iframe inside the `<div class="video-embed">` on the project page.

### About and Contact

- Edit the **About** and **Contact** sections directly in `index.html` (search for "About" and "Contact").

## Local preview

Open `index.html` in a browser, or use a simple local server (e.g. `npx serve .` or Python `python -m http.server`) so that `data/*.json` loads correctly.

## Structure

- `index.html` – Homepage (About, Team, Projects, News, Contact)
- `css/style.css` – Blue tech theme and layout
- `js/main.js` – Loads team, news, and projects from JSON; smooth scroll; mobile nav
- `data/team.json`, `data/news.json`, `data/projects.json` – Editable content
- `news/*.html` – One page per news item (with optional YouTube embed)
- `projects/*.html` – One page per project (with optional YouTube embed)
- `images/team/` – Team member photos
