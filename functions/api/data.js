export async function onRequestGet(context) {
	const { env } = context;
	const result = {};
	let cursor = null;
	do {
		const list = await env.HOD_KV.list({ cursor });
		for (const key of list.keys) {
			result[key.name] = await env.HOD_KV.get(key.name);
		}
		cursor = list.list_complete ? null : list.cursor;
	} while (cursor);
	return Response.json(result);
}

export async function onRequestPost(context) {
	const { request, env } = context;
	const { key, value } = await request.json();
	if (!key) return Response.json({ error: 'key is required' }, { status: 400 });
	await env.HOD_KV.put(key, value);
	return Response.json({ ok: true });
}
