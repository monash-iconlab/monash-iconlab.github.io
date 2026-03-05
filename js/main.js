(function () {
  'use strict';

  // Smooth scroll for anchor links
  document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
    anchor.addEventListener('click', function (e) {
      var targetId = this.getAttribute('href');
      if (targetId === '#') return;
      e.preventDefault();
      var target = document.querySelector(targetId);
      if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });

  // Mobile nav toggle
  var navToggle = document.querySelector('.nav-toggle');
  var navLinks = document.querySelector('.nav-links');
  if (navToggle && navLinks) {
    navToggle.addEventListener('click', function () {
      var expanded = this.getAttribute('aria-expanded') === 'true';
      this.setAttribute('aria-expanded', !expanded);
      navLinks.classList.toggle('is-open', !expanded);
    });
  }

  // Use relative paths so the site works both locally and on GitHub Pages
  function resolve(path) {
    if (path.startsWith('http')) return path;
    return path;
  }

  // Team section is static HTML in index.html (Yihai Fang row + 3-person row)

  // Load and render projects from data/projects.json
  fetch('data/projects.json')
    .then(function (r) { return r.ok ? r.json() : Promise.reject(); })
    .then(function (data) {
      var list = document.getElementById('projects-list');
      if (!list) return;
      var items = data.projects || data;
      list.innerHTML = items.map(function (item) {
        var href = item.url || 'projects/' + (item.slug || item.id || '') + '.html';
        return (
          '<a class="project-card" href="' + escapeAttr(href) + '">' +
          '<h3 class="project-title">' + escapeHtml(item.title) + '</h3>' +
          '<p class="project-excerpt">' + escapeHtml(item.excerpt || '') + '</p>' +
          '<span class="project-link-text">Read more &rarr;</span>' +
          '</a>'
        );
      }).join('');
    })
    .catch(function () {
      var list = document.getElementById('projects-list');
      if (list) list.innerHTML = '<p class="projects-loading">Add projects in data/projects.json or edit this section in index.html.</p>';
    });

  // Load and render news from data/news.json
  fetch('data/news.json')
    .then(function (r) { return r.ok ? r.json() : Promise.reject(); })
    .then(function (data) {
      var list = document.getElementById('news-list');
      if (!list) return;
      var items = data.news || data;
      list.innerHTML = items.map(function (item) {
        var href = item.url || 'news/' + (item.slug || item.id || '') + '.html';
        return (
          '<a class="news-card" href="' + escapeAttr(href) + '">' +
          '<p class="news-date">' + escapeHtml(item.date || '') + '</p>' +
          '<h3 class="news-title">' + escapeHtml(item.title) + '</h3>' +
          '<p class="news-excerpt">' + escapeHtml(item.excerpt || '') + '</p>' +
          '<span class="news-link-text">Read more &rarr;</span>' +
          '</a>'
        );
      }).join('');
    })
    .catch(function () {
      var list = document.getElementById('news-list');
      if (list) list.innerHTML = '<p class="news-loading">Add news in data/news.json or edit this section in index.html.</p>';
    });

  function escapeHtml(s) {
    if (!s) return '';
    var div = document.createElement('div');
    div.textContent = s;
    return div.innerHTML;
  }

  function escapeAttr(s) {
    if (!s) return '';
    return String(s)
      .replace(/&/g, '&amp;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }
})();
