import { json } from '@sveltejs/kit';
import { sql } from '$lib/server/db';

export async function GET({ url }) {
	const table = url.searchParams.get('table');
	if (!table) return json({ error: 'Table name is required' }, { status: 400 });

	const query = `SELECT * FROM ${table};`;

	try {
		const rows = await sql`${query}`;
		return json({ query, data: rows, message: 'Data retrieved successfully' }, { status: 200 });
	} catch (error) {
		console.error('Error executing query:', error);
		return json({ error: 'Error executing query', details: error }, { status: 500 });
	}
}

// type of json it needs to receive
// {
//  "table": "users",
//  "columns": [
//    { "name": "id", "type": "INT AUTO_INCREMENT PRIMARY KEY" },
//    { "name": "username", "type": "VARCHAR(255)" },
//    { "name": "email", "type": "VARCHAR(255)" }
//  ]
//}
export async function POST({ request, url }) {
	const table = url.searchParams.get('table');
	if (!table) return json({ error: 'Table name is required' }, { status: 400 });

	const { columns } = await request.json();
	if (!Array.isArray(columns) || columns.length === 0) {
		return json({ error: 'Invalid columns structure' }, { status: 400 });
	}

	const validIdentifier = /^[a-zA-Z0-9_]+$/;
	if (!validIdentifier.test(table)) {
		return json({ error: 'Invalid table name' }, { status: 400 });
	}

	for (const col of columns) {
		if (!col.name || !validIdentifier.test(col.name)) {
			return json({ error: 'Invalid column name' }, { status: 400 });
		}
		if (!col.type || typeof col.type !== 'string') {
			return json({ error: 'Invalid column type' }, { status: 400 });
		}
	}

	const columnDefs = columns.map((col) => `\`${col.name}\` ${col.type}`).join(', ');

	const query = `CREATE TABLE \`${table}\` (${columnDefs})`;

	try {
		const [data] = await sql.query(query);

		return json({ query, message: 'Table created successfully', data }, { status: 201 });
	} catch (error) {
		console.error('Error executing query:', error);
		return json({ error: 'Error executing query: ' + error }, { status: 500 });
	}
}
