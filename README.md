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
| `js/main.js` | Fetches `data/*.json`, renders cards, nav toggle, optional visit tracking |
| `js/analytics-config.js` | Cloudflare Worker tracking endpoint config (disabled until deployed) |
| `data/news.json` | News list for the homepage (title, date, excerpt, slug) |
| `data/projects.json` | Projects list for the homepage (title, period, funding excerpt, slug) |
| `news/*.html` | Full article for each news item |
| `projects/*.html` | Full page for each research project |
| `people/*.html` | Individual profile pages for director, members, and alumni |
| `images/` | Logo, banner, team photos (`images/team/`), news images |
| `cloudflare-worker/` | Optional Cloudflare Worker for visitor IP and page-view analytics |

## Visitor analytics (optional, free tier)

GitHub Pages cannot log visitor IPs by itself. This repo includes an optional **Cloudflare Worker** that records:

- total page views
- visits per page path
- visits per visitor IP address

The static site sends a lightweight `POST /track` request on each page load. Stats are stored in **Cloudflare KV** and can be read from a protected `GET /stats` endpoint.

Tracking is **off by default** until you deploy the worker and enable it in `js/analytics-config.js`.

### 1. Deploy the Worker

Prerequisites: [Cloudflare account](https://dash.cloudflare.com/) (free), [Node.js](https://nodejs.org/).

```bash
cd cloudflare-worker
npm install
npx wrangler login
npx wrangler kv namespace create ICONLAB_STATS
```

Copy the returned `id` into `cloudflare-worker/wrangler.toml` (`REPLACE_WITH_YOUR_KV_NAMESPACE_ID`).

Set an admin token (keep this secret):

```bash
npx wrangler secret put STATS_TOKEN
```

Deploy:

```bash
npm run deploy
```

Note the Worker URL, e.g. `https://iconlab-analytics.<account>.workers.dev`.

### 2. Enable tracking on the website

Edit [js/analytics-config.js](js/analytics-config.js):

```javascript
window.ICONLAB_ANALYTICS = {
  enabled: true,
  endpoint: 'https://iconlab-analytics.<account>.workers.dev/track'
};
```

Commit and push to GitHub Pages as usual.

### 3. View statistics

Replace `<WORKER_URL>` and `<STATS_TOKEN>` with your values:

```bash
curl -H "Authorization: Bearer <STATS_TOKEN>" "https://<WORKER_URL>/stats"
```

Example response:

```json
{
  "totalVisits": 42,
  "uniqueIps": 15,
  "byIp": [{ "ip": "203.0.113.10", "count": 5 }],
  "byPage": [{ "path": "/index.html", "count": 20 }]
}
```

### KV data model

| Key pattern | Meaning |
|-------------|---------|
| `global:total` | Total page views |
| `ip:{address}:count` | Views from one IP |
| `page:{path}:count` | Views of one path |

### Security notes

- Only origins listed in `ALLOWED_ORIGINS` (`wrangler.toml`) may call `/track`.
- `/stats` requires the `STATS_TOKEN` secret (header or `?token=` query).
- Do not commit real tokens. Do not publish stats URLs with the token embedded.
- IP addresses are personal data; the homepage footer includes a short notice.

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
