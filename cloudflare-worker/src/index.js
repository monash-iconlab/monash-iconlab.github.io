const KEY_TOTAL = 'global:total';
const KEY_LOG_INDEX = 'meta:log-index';
const MAX_VISIT_LOGS = 500;

function parseAllowedOrigins(env) {
  return (env.ALLOWED_ORIGINS || 'https://monash-iconlab.github.io,http://localhost:3000,http://localhost:5500,http://127.0.0.1:5500')
    .split(',')
    .map(function (origin) { return origin.trim(); })
    .filter(Boolean);
}

function isAllowedOrigin(origin, allowedOrigins) {
  if (!origin) return false;
  return allowedOrigins.indexOf(origin) !== -1;
}

function corsHeaders(origin, allowedOrigins) {
  if (!isAllowedOrigin(origin, allowedOrigins)) {
    return { 'Access-Control-Allow-Origin': 'null' };
  }
  return {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Max-Age': '86400'
  };
}

function jsonResponse(data, status, origin, allowedOrigins) {
  return new Response(JSON.stringify(data, null, 2), {
    status: status,
    headers: Object.assign(
      { 'Content-Type': 'application/json' },
      corsHeaders(origin, allowedOrigins)
    )
  });
}

function getClientIp(request) {
  var forwarded = request.headers.get('X-Forwarded-For');
  return request.headers.get('CF-Connecting-IP')
    || (forwarded ? forwarded.split(',')[0].trim() : null)
    || 'unknown';
}

function getGeoFromRequest(request) {
  var cf = request.cf || {};
  return {
    country: cf.country || request.headers.get('CF-IPCountry') || 'unknown',
    city: cf.city || request.headers.get('CF-IPCity') || '',
    region: cf.region || cf.regionCode || request.headers.get('CF-Region') || ''
  };
}

async function incrementCounter(kv, key) {
  var current = parseInt(await kv.get(key), 10);
  if (!Number.isFinite(current)) current = 0;
  var next = current + 1;
  await kv.put(key, String(next));
  return next;
}

function safeString(value, maxLen) {
  if (typeof value !== 'string') return '';
  return value.slice(0, maxLen);
}

async function readJson(kv, key, fallback) {
  var raw = await kv.get(key);
  if (!raw) return fallback;
  try {
    return JSON.parse(raw);
  } catch (err) {
    return fallback;
  }
}

async function appendVisitLog(kv, visit) {
  var logKey = 'log:' + visit.ts + ':' + visit.id;
  await kv.put(logKey, JSON.stringify(visit));

  var index = await readJson(kv, KEY_LOG_INDEX, []);
  index.push(logKey);
  if (index.length > MAX_VISIT_LOGS) {
    var removed = index.splice(0, index.length - MAX_VISIT_LOGS);
    await Promise.all(removed.map(function (key) { return kv.delete(key); }));
  }
  await kv.put(KEY_LOG_INDEX, JSON.stringify(index));
}

async function updateIpMeta(kv, ip, visit) {
  var metaKey = 'ipmeta:' + ip;
  var meta = await readJson(kv, metaKey, {
    ip: ip,
    count: 0,
    firstSeen: visit.ts,
    lastSeen: visit.ts,
    country: visit.country,
    lastPath: visit.path
  });

  meta.count += 1;
  meta.lastSeen = visit.ts;
  meta.country = visit.country || meta.country;
  meta.lastPath = visit.path;
  if (!meta.firstSeen) meta.firstSeen = visit.ts;

  await kv.put(metaKey, JSON.stringify(meta));
}

async function updatePageMeta(kv, pagePath, visit) {
  var metaKey = 'pagemeta:' + pagePath;
  var meta = await readJson(kv, metaKey, {
    path: pagePath,
    count: 0,
    firstSeen: visit.ts,
    lastSeen: visit.ts
  });

  meta.count += 1;
  meta.lastSeen = visit.ts;
  if (!meta.firstSeen) meta.firstSeen = visit.ts;

  await kv.put(metaKey, JSON.stringify(meta));
}

async function handleTrack(request, env, origin, allowedOrigins) {
  if (!isAllowedOrigin(origin, allowedOrigins)) {
    return jsonResponse({ error: 'Origin not allowed', origin: origin || null }, 403, origin, allowedOrigins);
  }

  var body = {};
  try {
    body = await request.json();
  } catch (err) {
    body = {};
  }

  var pagePath = typeof body.path === 'string' && body.path ? body.path : '/';
  if (pagePath.length > 500) {
    pagePath = pagePath.slice(0, 500);
  }

  var ip = getClientIp(request);
  var geo = getGeoFromRequest(request);
  var ts = typeof body.ts === 'string' && body.ts ? body.ts : new Date().toISOString();
  var visit = {
    id: crypto.randomUUID(),
    ts: ts,
    ip: ip,
    path: pagePath,
    country: geo.country,
    city: geo.city,
    region: geo.region,
    userAgent: safeString(request.headers.get('User-Agent') || '', 300),
    referer: safeString(body.referrer || request.headers.get('Referer') || '', 500),
    origin: origin || ''
  };

  var total = await incrementCounter(env.ICONLAB_STATS, KEY_TOTAL);
  await incrementCounter(env.ICONLAB_STATS, 'ip:' + ip + ':count');
  await incrementCounter(env.ICONLAB_STATS, 'page:' + pagePath + ':count');
  await appendVisitLog(env.ICONLAB_STATS, visit);
  await updateIpMeta(env.ICONLAB_STATS, ip, visit);
  await updatePageMeta(env.ICONLAB_STATS, pagePath, visit);

  return jsonResponse({
    ok: true,
    total: total,
    visitId: visit.id
  }, 200, origin, allowedOrigins);
}

function isAuthorized(request, env) {
  var token = env.STATS_TOKEN;
  if (!token) return false;

  var authHeader = request.headers.get('Authorization') || '';
  if (authHeader === 'Bearer ' + token) return true;

  var url = new URL(request.url);
  return url.searchParams.get('token') === token;
}

async function listMeta(kv, prefix) {
  var list = await kv.list({ prefix: prefix });
  var rows = [];

  for (var i = 0; i < list.keys.length; i++) {
    var meta = await readJson(kv, list.keys[i].name, null);
    if (meta) rows.push(meta);
  }

  rows.sort(function (a, b) {
    return String(b.lastSeen || '').localeCompare(String(a.lastSeen || ''));
  });

  return rows;
}

async function getRecentVisits(kv, limit) {
  var index = await readJson(kv, KEY_LOG_INDEX, []);
  var keys = index.slice(-limit).reverse();
  var visits = [];

  for (var i = 0; i < keys.length; i++) {
    var visit = await readJson(kv, keys[i], null);
    if (visit) visits.push(visit);
  }

  return visits;
}

async function countVisitsToday(kv) {
  var index = await readJson(kv, KEY_LOG_INDEX, []);
  var today = new Date().toISOString().slice(0, 10);
  var count = 0;

  for (var i = 0; i < index.length; i++) {
    var visit = await readJson(kv, index[i], null);
    if (visit && visit.ts && visit.ts.slice(0, 10) === today) {
      count += 1;
    }
  }

  return count;
}

function getTopPage(byPage) {
  if (!byPage.length) return null;
  var top = byPage[0];
  for (var i = 1; i < byPage.length; i++) {
    if (byPage[i].count > top.count) top = byPage[i];
  }
  return top;
}

async function handleStats(request, env, origin, allowedOrigins) {
  if (!isAuthorized(request, env)) {
    return jsonResponse({ error: 'Unauthorized' }, 401, origin, allowedOrigins);
  }

  var total = parseInt(await env.ICONLAB_STATS.get(KEY_TOTAL), 10);
  if (!Number.isFinite(total)) total = 0;

  var byIp = await listMeta(env.ICONLAB_STATS, 'ipmeta:');
  var byPage = await listMeta(env.ICONLAB_STATS, 'pagemeta:');
  var recentVisits = await getRecentVisits(env.ICONLAB_STATS, MAX_VISIT_LOGS);
  var visitsToday = await countVisitsToday(env.ICONLAB_STATS);
  var topPage = getTopPage(byPage);

  return jsonResponse({
    totalVisits: total,
    uniqueIps: byIp.length,
    visitsToday: visitsToday,
    topPage: topPage,
    byIp: byIp,
    byPage: byPage,
    recentVisits: recentVisits
  }, 200, origin, allowedOrigins);
}

export default {
  async fetch(request, env) {
    var url = new URL(request.url);
    var allowedOrigins = parseAllowedOrigins(env);

    if (request.method === 'OPTIONS') {
      var origin = request.headers.get('Origin');
      return new Response(null, {
        status: 204,
        headers: corsHeaders(origin, allowedOrigins)
      });
    }

    if (url.pathname === '/track' && request.method === 'POST') {
      return handleTrack(request, env, request.headers.get('Origin'), allowedOrigins);
    }

    if (url.pathname === '/stats' && request.method === 'GET') {
      return handleStats(request, env, request.headers.get('Origin'), allowedOrigins);
    }

    return new Response('Not Found', { status: 404 });
  }
};
