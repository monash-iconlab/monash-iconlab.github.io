# ICON Lab Website

Official website for **ICON Lab** (Intelligent Construction Systems Lab), a research group in the Department of Civil and Environmental Engineering at [Monash University](https://www.monash.edu/).

**Live site:** [https://monash-iconlab.github.io/](https://monash-iconlab.github.io/)

## Purpose

This site is the public-facing home of ICON Lab. It introduces the group’s research mission, showcases the team, lists funded research projects and recent news, and provides a contact point for collaborators, students, and visitors.

ICON Lab focuses on intelligent construction systems that combine **robotics**, **artificial intelligence**, and **automation** to improve how infrastructure is planned, built, and operated. The website helps communicate that work to the academic community, industry partners, prospective students, and the public.

The site is intentionally **static** (HTML, CSS, and JavaScript only): no server, no build step, and straightforward hosting on **GitHub Pages**.

## What’s on the site

| Section | Description |
|---------|-------------|
| **About** | Overview of ICON Lab’s research vision and focus areas. |
| **Team** | Director, current members, and alumni with photos and short bios; each member links to an individual profile page. |
| **Projects** | Funded research projects (ARC, Building 4.0 CRC, SPARC Hub, etc.), ordered by period; each links to a detail page with funding information and related publications or reports. |
| **News** | Lab announcements, awards, events, and welcomes; each item links to a full news article. |
| **Contact** | Email and location at Monash Clayton campus. |

## Tech stack

- **HTML** — homepage sections and static detail pages (`news/`, `projects/`, `people/`)
- **CSS** — layout, typography, and responsive design (`css/style.css`)
- **JavaScript** — loads project and news lists from JSON, smooth scrolling, mobile navigation (`js/main.js`)
- **GitHub Pages** — deployment from the `main` branch at the repository root

## Repository layout

| Path | Purpose |
|------|---------|
| `index.html` | Homepage (navigation, banner, About, Team, Projects, News, Contact) |
| `css/style.css` | Global styles and theme (`--logo-blue` accent) |
| `js/main.js` | Fetches `data/*.json`, renders cards, nav toggle |
| `data/news.json` | News list for the homepage (title, date, excerpt, slug) |
| `data/projects.json` | Projects list for the homepage (title, period, funding excerpt, slug) |
| `news/*.html` | Full article for each news item |
| `projects/*.html` | Full page for each research project |
| `people/*.html` | Individual profile pages for director, members, and alumni |
| `images/` | Logo, banner, team photos (`images/team/`), news images |

## Updating content

### Team

Edit the **Director**, **Current Members**, and **Alumni** blocks in `index.html` (search for `id="team"`). Link each avatar to the matching file under `people/`. Profile pages are text-focused standalone HTML files.

### Projects

1. Add an entry to `data/projects.json` (newest projects first).
2. Create a matching page under `projects/` (copy an existing file and edit).
3. Put funding details and descriptions first; place external links (publications, CRC reports) at the bottom of the detail page.

### News

1. Add an entry to `data/news.json` (most recent first).
2. Create a matching page under `news/` (copy an existing file and edit).

### About / Contact

Edit the corresponding sections directly in `index.html`.

## Local preview

JSON is loaded via `fetch`, so open the site through a local server rather than `file://`:

```bash
npx serve .
```

Then visit the URL shown in the terminal (e.g. `http://localhost:3000`).

## Deploy (GitHub Pages)

In this repository: **Settings → Pages → Build and deployment → Source** → Deploy from branch → **main** → **/ (root)**.

Changes pushed to `main` are published automatically after GitHub Pages rebuilds the site.

## License & attribution

Content © ICON Lab, Monash University. For questions about the site or lab research, contact [eng-iconlab@monash.edu](mailto:eng-iconlab@monash.edu).
