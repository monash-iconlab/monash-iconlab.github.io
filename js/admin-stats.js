(function () {
  'use strict';

  var TOKEN_KEY = 'iconlab_stats_token';
  var config = window.ICONLAB_ANALYTICS || {};
  var statsEndpoint = config.statsEndpoint || '';

  var loginPanel = document.getElementById('stats-login');
  var dashboard = document.getElementById('stats-dashboard');
  var loginForm = document.getElementById('stats-login-form');
  var tokenInput = document.getElementById('stats-token-input');
  var loginError = document.getElementById('stats-login-error');
  var dashboardError = document.getElementById('stats-dashboard-error');
  var refreshBtn = document.getElementById('stats-refresh-btn');
  var signOutBtn = document.getElementById('stats-signout-btn');

  function getToken() {
    return sessionStorage.getItem(TOKEN_KEY) || '';
  }

  function setToken(token) {
    sessionStorage.setItem(TOKEN_KEY, token);
  }

  function clearToken() {
    sessionStorage.removeItem(TOKEN_KEY);
  }

  function showLogin() {
    loginPanel.hidden = false;
    dashboard.hidden = true;
    loginError.textContent = '';
    dashboardError.textContent = '';
  }

  function showDashboard() {
    loginPanel.hidden = true;
    dashboard.hidden = false;
    loginError.textContent = '';
  }

  function formatDateTime(iso) {
    if (!iso) return '—';
    try {
      return new Date(iso).toLocaleString('en-AU', {
        timeZone: 'Australia/Melbourne',
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      });
    } catch (err) {
      return iso;
    }
  }

  function formatCountry(code) {
    if (!code || code === 'unknown' || code === 'XX') return '—';
    try {
      var name = new Intl.DisplayNames(['en'], { type: 'region' }).of(code);
      return name ? name + ' (' + code + ')' : code;
    } catch (err) {
      return code;
    }
  }

  function formatLocation(visit) {
    var locationParts = [visit.city, visit.region].filter(Boolean);
    var countryLabel = formatCountry(visit.country);
    if (locationParts.length && countryLabel !== '—') {
      return locationParts.join(', ') + ', ' + countryLabel;
    }
    if (locationParts.length) return locationParts.join(', ');
    return countryLabel;
  }

  function parseUserAgent(ua) {
    if (!ua) return '—';
    var browser = 'Unknown browser';
    var os = 'Unknown OS';

    if (/Edg\//.test(ua)) browser = 'Edge';
    else if (/Chrome\//.test(ua)) browser = 'Chrome';
    else if (/Firefox\//.test(ua)) browser = 'Firefox';
    else if (/Safari\//.test(ua)) browser = 'Safari';

    if (/Windows/.test(ua)) os = 'Windows';
    else if (/Mac OS X/.test(ua)) os = 'macOS';
    else if (/Android/.test(ua)) os = 'Android';
    else if (/iPhone|iPad/.test(ua)) os = 'iOS';
    else if (/Linux/.test(ua)) os = 'Linux';

    return browser + ' / ' + os;
  }

  function formatReferrer(referrer) {
    if (!referrer) return 'Direct';
    return referrer;
  }

  function sitePathLink(path) {
    var safePath = path || '/';
    return 'https://monash-iconlab.github.io' + (safePath.startsWith('/') ? safePath : '/' + safePath);
  }

  function escapeHtml(value) {
    if (value == null) return '';
    var div = document.createElement('div');
    div.textContent = String(value);
    return div.innerHTML;
  }

  function renderSummary(data) {
    document.getElementById('stat-total-visits').textContent = data.totalVisits || 0;
    document.getElementById('stat-unique-ips').textContent = data.uniqueIps || 0;
    document.getElementById('stat-visits-today').textContent = data.visitsToday || 0;

    var topPageEl = document.getElementById('stat-top-page');
    if (data.topPage && data.topPage.path) {
      topPageEl.innerHTML =
        '<a href="' + escapeHtml(sitePathLink(data.topPage.path)) + '" target="_blank" rel="noopener noreferrer">' +
        escapeHtml(data.topPage.path) + '</a>' +
        ' <span class="stats-card-sub">(' + escapeHtml(data.topPage.count) + ' views)</span>';
    } else {
      topPageEl.textContent = '—';
    }
  }

  function renderTable(tbodyId, rowsHtml, emptyMessage) {
    var tbody = document.getElementById(tbodyId);
    if (!rowsHtml) {
      tbody.innerHTML = '<tr><td colspan="99" class="stats-empty">' + escapeHtml(emptyMessage) + '</td></tr>';
      return;
    }
    tbody.innerHTML = rowsHtml;
  }

  function renderRecentVisits(visits) {
    if (!visits || !visits.length) {
      renderTable('stats-recent-body', '', 'No visits recorded yet.');
      return;
    }

    var rows = visits.map(function (visit) {
      var ref = formatReferrer(visit.referer);
      var refCell = ref === 'Direct'
        ? 'Direct'
        : '<a href="' + escapeHtml(ref) + '" target="_blank" rel="noopener noreferrer">' + escapeHtml(ref) + '</a>';

      return (
        '<tr>' +
        '<td>' + escapeHtml(formatDateTime(visit.ts)) + '</td>' +
        '<td>' + escapeHtml(visit.ip) + '</td>' +
        '<td><a href="' + escapeHtml(sitePathLink(visit.path)) + '" target="_blank" rel="noopener noreferrer">' + escapeHtml(visit.path || '/') + '</a></td>' +
        '<td>' + escapeHtml(formatLocation(visit)) + '</td>' +
        '<td>' + refCell + '</td>' +
        '<td title="' + escapeHtml(visit.userAgent || '') + '">' + escapeHtml(parseUserAgent(visit.userAgent)) + '</td>' +
        '</tr>'
      );
    }).join('');

    renderTable('stats-recent-body', rows, '');
  }

  function renderByIp(rows) {
    if (!rows || !rows.length) {
      renderTable('stats-ip-body', '', 'No visitor data yet.');
      return;
    }

    var html = rows.map(function (row) {
      return (
        '<tr>' +
        '<td>' + escapeHtml(row.ip) + '</td>' +
        '<td>' + escapeHtml(row.count) + '</td>' +
        '<td>' + escapeHtml(formatCountry(row.country)) + '</td>' +
        '<td>' + escapeHtml(formatDateTime(row.firstSeen)) + '</td>' +
        '<td>' + escapeHtml(formatDateTime(row.lastSeen)) + '</td>' +
        '<td>' + escapeHtml(row.lastPath || '—') + '</td>' +
        '</tr>'
      );
    }).join('');

    renderTable('stats-ip-body', html, '');
  }

  function renderByPage(rows, totalVisits) {
    if (!rows || !rows.length) {
      renderTable('stats-page-body', '', 'No page data yet.');
      return;
    }

    var html = rows.slice().sort(function (a, b) { return b.count - a.count; }).map(function (row) {
      var share = totalVisits ? Math.round((row.count / totalVisits) * 100) : 0;
      return (
        '<tr>' +
        '<td><a href="' + escapeHtml(sitePathLink(row.path)) + '" target="_blank" rel="noopener noreferrer">' + escapeHtml(row.path || '/') + '</a></td>' +
        '<td>' + escapeHtml(row.count) + '</td>' +
        '<td>' + escapeHtml(share) + '%</td>' +
        '<td>' + escapeHtml(formatDateTime(row.lastSeen)) + '</td>' +
        '</tr>'
      );
    }).join('');

    renderTable('stats-page-body', html, '');
  }

  function renderDashboard(data) {
    renderSummary(data);
    renderRecentVisits(data.recentVisits || []);
    renderByIp(data.byIp || []);
    renderByPage(data.byPage || [], data.totalVisits || 0);
    document.getElementById('stats-updated-at').textContent = 'Last updated: ' + formatDateTime(new Date().toISOString());
  }

  function fetchStats(token) {
    if (!statsEndpoint) {
      return Promise.reject(new Error('Stats endpoint is not configured in js/analytics-config.js.'));
    }

    return fetch(statsEndpoint, {
      method: 'GET',
      headers: {
        Authorization: 'Bearer ' + token
      }
    }).then(function (response) {
      return response.json().then(function (data) {
        if (!response.ok) {
          var message = data && data.error ? data.error : 'Failed to load stats.';
          throw new Error(message);
        }
        return data;
      });
    });
  }

  function loadDashboard() {
    var token = getToken();
    if (!token) {
      showLogin();
      return;
    }

    dashboardError.textContent = 'Loading...';
    showDashboard();

    fetchStats(token)
      .then(function (data) {
        dashboardError.textContent = '';
        renderDashboard(data);
      })
      .catch(function (err) {
        if (err && err.message === 'Unauthorized') {
          clearToken();
          showLogin();
          loginError.textContent = 'Invalid token. Please sign in again.';
          return;
        }
        dashboardError.textContent = err.message || 'Failed to load stats.';
      });
  }

  if (loginForm) {
    loginForm.addEventListener('submit', function (e) {
      e.preventDefault();
      var token = (tokenInput.value || '').trim();
      if (!token) {
        loginError.textContent = 'Please enter your stats token.';
        return;
      }

      loginError.textContent = 'Checking...';
      fetchStats(token)
        .then(function (data) {
          setToken(token);
          tokenInput.value = '';
          renderDashboard(data);
          showDashboard();
          dashboardError.textContent = '';
        })
        .catch(function (err) {
          loginError.textContent = err.message === 'Unauthorized'
            ? 'Invalid token. Please try again.'
            : (err.message || 'Failed to connect.');
        });
    });
  }

  if (refreshBtn) {
    refreshBtn.addEventListener('click', loadDashboard);
  }

  if (signOutBtn) {
    signOutBtn.addEventListener('click', function () {
      clearToken();
      showLogin();
    });
  }

  if (getToken()) {
    loadDashboard();
  } else {
    showLogin();
  }
})();
