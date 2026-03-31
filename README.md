# monash-iconlab.github.io

ICON Lab website (GitHub Pages root site).

## Project summary

This repository hosts a **static** research group website: no backend, suitable for **GitHub Pages**. The live site is served from the organization root URL:

**https://monash-iconlab.github.io/**

### What’s included

- **Top navigation** with logo image (`images/ICON_logo_2.png`) and anchor links to About, Team, Projects, News, Contact.
- **Banner** below the header (`images/banner.png`), aligned to the same **1000px content column** as the rest of the page (matches nav / About left and right edges).
- **Homepage sections** (single `index.html`): About, Team, Projects, News, Contact.
- **Team layout**: Director (Yihai Fang, photo + intro), **Current Students** (3-column cards), **Alumni** (same card layout; content edited in HTML).
- **Projects & News** lists loaded from JSON (`data/projects.json`, `data/news.json`); each item links to a **detail page** under `projects/` or `news/` (static HTML).
- **Detail pages** reuse the same CSS; nav shows the logo; optional **YouTube embed** via `<div class="video-embed">` + iframe.
- **Styling**: light grey/white background, shared **logo blue** (`--logo-blue` in `css/style.css`), card hover borders, responsive layout.

### Tech stack

- HTML, CSS, JavaScript (no build step required).
- `js/main.js` fetches JSON for Projects/News lists and handles smooth scrolling + mobile nav.

## Deploy (GitHub Pages)

In this repo: **Settings → Pages → Source** → Deploy from a branch → **main** → **/ (root)**.

## Repository layout

| Path | Purpose |
|------|---------|
| `index.html` | Homepage (nav, banner, all main sections) |
| `css/style.css` | Theme, layout, banner, team cards, detail pages |
| `js/main.js` | Loads `data/*.json`, nav toggle, smooth scroll |
| `data/news.json`, `data/projects.json` | Homepage lists for News / Projects |
| `data/team.json` | Legacy; team on homepage is **static HTML** in `index.html` |
| `news/*.html`, `projects/*.html` | Full pages for each news item / project |
| `images/` | Logo, banner, team photos (`images/team/`) |

## Updating content

### Team

- Edit **Director**, **Current Students**, and **Alumni** directly in `index.html` (search for `id="team"`).
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
- **About** line width matches the main content column (no narrow `max-width` on body text).

### Theme colors

- Global accent / section heading blue: CSS variable `--logo-blue` in `css/style.css` (adjust to match the logo if needed).

## Local preview

Use a local server so JSON loads correctly:

- `npx serve .`
- or `python -m http.server`

Then open the URL shown in the terminal (e.g. `http://localhost:3000`).

## 项目概要（中文）

- 静态网站，部署在 GitHub Pages，根域名：**https://monash-iconlab.github.io/**
- 顶部导航含 **Logo**；下方有 **横幅图**（`images/banner.png`），与正文 **同宽对齐**（1000px 内容区）。
- 首页包含：About、Team（Director / Current Students / Alumni）、Projects、News、Contact；Projects 与 News 列表由 **JSON** 驱动，详情为独立 **HTML 页面**。
- 样式见 `css/style.css`；改主题蓝调整 `--logo-blue`。
