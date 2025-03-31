import { json } from '@sveltejs/kit';
import { db } from '$lib/server/db';

export async function GET({ url }) {
	const table = url.searchParams.get('table');
	if (!table) return json({ error: 'Table name is required' }, { status: 400 });

	const query = 'SELECT * FROM ?';
	const values = [table];

	try {
		const [rows] = await db.query(query, values);
		return json({ query: query, data: rows }, { status: 200 });
	} catch (error) {
		console.error('Error executing query:', error);
		return json({ error: 'Error executing query' }, { status: 500 });
	}
}

export async function POST({ request, url }) {
	const table = url.searchParams.get('table');
	if (!table) return json({ error: 'Table name is required' }, { status: 400 });

	const { columns } = await request.json();
	if (!Array.isArray(columns) || columns.length === 0) {
		return json({ error: 'Invalid columns structure' }, { status: 400 });
	}

	if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(table)) {
		return json({ error: 'Invalid table name' }, { status: 400 });
	}

	const columnDefinitions = columns
		.map(({ name, type }) => {
			if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(name)) {
				throw new Error(`Invalid column name: ${name}`);
			}
			if (
				!/^(INT|VARCHAR\(\d+\)|TEXT|BOOLEAN|DATETIME|FLOAT|DOUBLE|DECIMAL\(\d+,\d+\))$/i.test(type)
			) {
				throw new Error(`Invalid column type: ${type}`);
			}
			return `\`${name}\` ${type}`;
		})
		.join(', ');

	const query = `CREATE TABLE \`${table}\` (${columnDefinitions})`;

	try {
		await db.query(query);
		return json({ query: query, message: `Table ${table} created successfully!` }, { status: 200 });
	} catch (error) {
		console.error(error);
		return json({ error: error }, { status: 500 });
	}
}
