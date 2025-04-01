import { json } from '@sveltejs/kit';
import { db } from '$lib/server/db';

export async function GET({ url }) {
	const tableName = url.searchParams.get('table');
	if (!tableName) return json({ error: 'Table Name is required!' }, { status: 400 });

	const id = url.searchParams.get('id');
	if (!id) return json({ error: 'Row id is required!' }, { status: 400 });

	const query = 'SELECT ? FROM ?';
	const values = [id, tableName];

	try {
		const [data] = await db.query(query, values);
		return json({ query, data: data, message: 'Row retrieved successfully!' }, { status: 200 });
	} catch (error) {
		console.error('Error executing query:', error);
		return json({ error: 'Error executing query' }, { status: 500 });
	}
}

export async function POST({ url, request }) {
	const tableName = url.searchParams.get('table');
	if (!tableName) return json({ error: 'Table Name is required!' }, { status: 400 });

	const id = url.searchParams.get('id');
	if (!id) return json({ error: 'Row id is required!' }, { status: 400 });

	const { values } = await request.json();
	if (!Array.isArray(values) || values.length === 0) {
		return json({ error: 'Invalid values structure' }, { status: 400 });
	}
}
