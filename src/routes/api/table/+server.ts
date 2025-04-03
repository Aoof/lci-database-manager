import { json } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { isValidIdentifier } from '$lib/utils/db';
import format from 'pg-format';
import type { CreateTablePayload, UpdateTablePayload } from '$lib/types/db';

export async function GET({ url }) {
	const table = url.searchParams.get('table');
	if (!table) return json({ error: 'Table name is required' }, { status: 400 });
	if (!isValidIdentifier(table)) {
		return json({ error: 'Invalid table name' }, { status: 400 });
	}

	const query = format('SELECT * FROM %I;', table);

	try {
		const rows = await db.query(query);
		return json({ query, data: rows, message: 'Data retrieved successfully' }, { status: 200 });
	} catch (error) {
		console.error('Error executing query:', error);
		return json({ error: 'Error executing query', details: error }, { status: 500 });
	}
}

export async function POST({ request, url }) {
	const table = url.searchParams.get('table');
	if (!table) return json({ error: 'Table name is required' }, { status: 400 });

	if (!isValidIdentifier(table)) {
		return json({ error: 'Invalid table name' }, { status: 400 });
	}

	const { columns }: CreateTablePayload = await request.json();
	if (!Array.isArray(columns) || columns.length === 0) {
		return json({ error: 'Invalid columns structure' }, { status: 400 });
	}

	for (const col of columns) {
		if (!col.name || !isValidIdentifier(col.name)) {
			return json({ error: 'Invalid column name' }, { status: 400 });
		}
		if (!col.type || typeof col.type !== 'string') {
			return json({ error: 'Invalid column type' }, { status: 400 });
		}
	}

	const columnDefs = columns.map((col) => format('%I %s', col.name, col.type)).join(', ');

	const query = format('CREATE TABLE %I (%s)', table, columnDefs);

	try {
		await db.query(query);

		return json({ query, message: 'Table created successfully' }, { status: 201 });
	} catch (error) {
		console.error('Query: ', query);
		console.error('Error executing query:', error);
		return json({ error: 'Error executing query: ' + error }, { status: 500 });
	}
}

export async function PUT({ request, url }) {
	const table = url.searchParams.get('table');
	if (!table) return json({ error: 'Table name is required' }, { status: 400 });
	if (!isValidIdentifier(table)) {
		return json({ error: 'Invalid table name' }, { status: 400 });
	}

	const { changes }: UpdateTablePayload = await request.json();
	if (!Array.isArray(changes) || changes.length === 0) {
		return json({ error: 'Invalid changes structure' }, { status: 400 });
	}

	for (const change of changes) {
		if (!change.action || !['ADD', 'DROP', 'MODIFY'].includes(change.action)) {
			return json({ error: 'Invalid action in changes' }, { status: 400 });
		}
		if (!change.column || !isValidIdentifier(change.column)) {
			return json({ error: 'Invalid column name in changes' }, { status: 400 });
		}
		if (change.action !== 'DROP' && (!change.type || typeof change.type !== 'string')) {
			return json({ error: 'Invalid column type in changes' }, { status: 400 });
		}
	}

	const query = changes
		.map((change) => {
			if (change.action === 'ADD') {
				return format('ALTER TABLE %I ADD COLUMN %I %s', table, change.column, change.type);
			} else if (change.action === 'DROP') {
				return format('ALTER TABLE %I DROP COLUMN %I', table, change.column);
			} else if (change.action === 'MODIFY') {
				return format('ALTER TABLE %I ALTER COLUMN %I TYPE %s', table, change.column, change.type);
			}
		})
		.join('; ');

	try {
		await db.query(query);

		return json({ query, message: 'Table updated successfully' }, { status: 200 });
	} catch (error) {
		console.error('query: ', query);
		console.error('Error executing query:', error);
		return json({ error: 'Error executing query: ' + error }, { status: 500 });
	}
}

export async function DELETE({ url }) {
	const table = url.searchParams.get('table');
	if (!table) return json({ error: 'Table name is required' }, { status: 400 });

	if (!isValidIdentifier(table)) {
		return json({ error: 'Invalid table name' }, { status: 400 });
	}

	const query = format('DROP TABLE %I', table);

	try {
		await db.query(query);

		return json({ query, message: 'Table deleted successfully' }, { status: 200 });
	} catch (error) {
		console.error('Query: ', query);
		console.error('Error executing query:', error);
		return json({ error: 'Error executing query: ' + error }, { status: 500 });
	}
}
