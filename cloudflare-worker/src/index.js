const KEY_TOTAL = 'global:total';

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
  return new Response(JSON.stringify(data), {
    status: status,
    headers: Object.assign(
      { 'Content-Type': 'application/json' },
      corsHeaders(origin, allowedOrigins)
    )
  });
}

function getClientIp(request) {
  return request.headers.get('CF-Connecting-IP')
    || request.headers.get('X-Forwarded-For')?.split(',')[0]?.trim()
    || 'unknown';
}

async function incrementCounter(kv, key) {
  var current = parseInt(await kv.get(key), 10);
  if (!Number.isFinite(current)) current = 0;
  var next = current + 1;
  await kv.put(key, String(next));
  return next;
}

async function handleTrack(request, env, origin, allowedOrigins) {
  if (!isAllowedOrigin(origin, allowedOrigins)) {
    return jsonResponse({ error: 'Origin not allowed' }, 403, origin, allowedOrigins);
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
  var ipKey = 'ip:' + ip + ':count';
  var pageKey = 'page:' + pagePath + ':count';

  var total = await incrementCounter(env.ICONLAB_STATS, KEY_TOTAL);
  var ipCount = await incrementCounter(env.ICONLAB_STATS, ipKey);
  var pageCount = await incrementCounter(env.ICONLAB_STATS, pageKey);

  return jsonResponse({
    ok: true,
    total: total,
    ipCount: ipCount,
    pageCount: pageCount
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

async function listStats(kv, prefix) {
  var list = await kv.list({ prefix: prefix });
  var rows = [];

  for (var i = 0; i < list.keys.length; i++) {
    var key = list.keys[i].name;
    var value = parseInt(await kv.get(key), 10);
    if (!Number.isFinite(value)) value = 0;
    rows.push({
      key: key.slice(prefix.length),
      count: value
    });
  }

  rows.sort(function (a, b) { return b.count - a.count; });
  return rows;
}

async function handleStats(request, env, origin, allowedOrigins) {
  if (!isAuthorized(request, env)) {
    return jsonResponse({ error: 'Unauthorized' }, 401, origin, allowedOrigins);
  }

  var total = parseInt(await env.ICONLAB_STATS.get(KEY_TOTAL), 10);
  if (!Number.isFinite(total)) total = 0;

  var byIp = await listStats(env.ICONLAB_STATS, 'ip:');
  var byPage = await listStats(env.ICONLAB_STATS, 'page:');

  return jsonResponse({
    totalVisits: total,
    uniqueIps: byIp.length,
    byIp: byIp.map(function (row) {
      return {
        ip: row.key.replace(/:count$/, ''),
        count: row.count
      };
    }),
    byPage: byPage.map(function (row) {
      return {
        path: row.key.replace(/:count$/, ''),
        count: row.count
      };
    })
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
