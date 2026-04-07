export default {
	async fetch(request, env) {
		const url = new URL(request.url);

		// Handle API routes
		if (url.pathname.startsWith('/api/')) {
			// CORS preflight
			if (request.method === 'OPTIONS') {
				return new Response(null, {
					headers: {
						'Access-Control-Allow-Origin': '*',
						'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
						'Access-Control-Allow-Headers': 'Content-Type',
					},
				});
			}

			const json = (data, status = 200) =>
				new Response(JSON.stringify(data), {
					status,
					headers: { 'Content-Type': 'application/json' },
				});

			// GET /api/data — return all KV pairs as {key: value}
			if (url.pathname === '/api/data' && request.method === 'GET') {
				const result = {};
				let cursor = null;
				do {
					const list = await env.HOD_KV.list({ cursor });
					for (const key of list.keys) {
						result[key.name] = await env.HOD_KV.get(key.name);
					}
					cursor = list.list_complete ? null : list.cursor;
				} while (cursor);
				return json(result);
			}

			// POST /api/data — body: {key, value} → store in KV
			if (url.pathname === '/api/data' && request.method === 'POST') {
				const { key, value } = await request.json();
				if (!key) return json({ error: 'key is required' }, 400);
				await env.HOD_KV.put(key, value);
				return json({ ok: true });
			}

			return json({ error: 'Not found' }, 404);
		}

		// Serve static assets for all other routes
		return env.ASSETS.fetch(request);
	},
};
