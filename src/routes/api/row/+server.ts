import { db } from '$lib/server/db';
import type { InsertRowPayload, UpdateRowPayload } from '$lib/types/db';
import { isValidIdentifier } from '$lib/utils/db';
import { json } from '@sveltejs/kit';
import format from 'pg-format';

export async function GET({ url }) {
	const table = url.searchParams.get('table');
	if (!table) return json({ error: 'Table Name is required!' }, { status: 400 });
	if (!isValidIdentifier(table)) {
		return json({ error: 'Invalid table name' }, { status: 400 });
	}

	const id = url.searchParams.get('id');
	if (!id || isNaN(Number(id))) {
		return json({ error: 'Invalid or missing row id' }, { status: 400 });
	}

	const query = format('SELECT * FROM %I WHERE id = %L', table, id);

	try {
		const rows = await db.query(query);
		return json({ query, data: rows, message: 'Row retrieved successfully!' }, { status: 200 });
	} catch (error) {
		console.error('Error executing query:', error);
		return json({ error: 'Error executing query' }, { status: 500 });
	}
}

export async function POST({ url, request }) {
	const table = url.searchParams.get('table');
	if (!table) return json({ error: 'Table Name is required!' }, { status: 400 });
	if (!isValidIdentifier(table)) {
		return json({ error: 'Invalid table name' }, { status: 400 });
	}

	const { values }: InsertRowPayload = await request.json();
	if (!values || typeof values !== 'object' || Object.keys(values).length === 0) {
		return json({ error: 'Invalid values structure' }, { status: 400 });
	}

	const query = format(
		'INSERT INTO %I (%s) VALUES (%L)',
		table,
		Object.keys(values)
			.map((col) => format.ident(col))
			.join(', '),
		Object.values(values)
	);

	try {
		await db.query(query);
		return json({ query, message: 'Row inserted successfully!' }, { status: 201 });
	} catch (error) {
		console.error('Error executing query:', error);
		return json({ error: 'Error executing query' }, { status: 500 });
	}
}

export async function PUT({ url, request }) {
	const tableName = url.searchParams.get('table');
	if (!tableName) return json({ error: 'Table Name is required!' }, { status: 400 });
	if (!isValidIdentifier(tableName)) {
		return json({ error: 'Invalid table name' }, { status: 400 });
	}

	const id = url.searchParams.get('id');
	if (!id || isNaN(Number(id))) {
		return json({ error: 'Invalid or missing row id' }, { status: 400 });
	}

	const { values }: UpdateRowPayload = await request.json();
	if (!values || typeof values !== 'object' || Object.keys(values).length === 0) {
		return json({ error: 'Invalid values structure' }, { status: 400 });
	}

	const setClause = Object.entries(values)
		.map(([key, value]) => {
			if (!isValidIdentifier(key)) {
				throw new Error(`Invalid column name: ${key}`);
			}
			return format('%I = %L', key, value);
		})
		.join(', ');

	const query = format('UPDATE %I SET %s WHERE id = %L', tableName, setClause, id);

	try {
		await db.query(query);
		return json({ query, message: 'Row updated successfully!' }, { status: 200 });
	} catch (error) {
		console.error('Error executing query:', error);
		return json({ error: 'Error executing query' }, { status: 500 });
	}
}

export async function DELETE({ url }) {
	const tableName = url.searchParams.get('table');
	if (!tableName) return json({ error: 'Table Name is required!' }, { status: 400 });
	if (!isValidIdentifier(tableName)) {
		return json({ error: 'Invalid table name' }, { status: 400 });
	}

	const id = url.searchParams.get('id');
	if (!id || isNaN(Number(id))) {
		return json({ error: 'Invalid or missing row id' }, { status: 400 });
	}

	const query = format('DELETE FROM %I WHERE id = %L', tableName, id);

	try {
		await db.query(query);
		return json({ query, message: 'Row deleted successfully!' }, { status: 200 });
	} catch (error) {
		console.error('Error executing query:', error);
		return json({ error: 'Error executing query' }, { status: 500 });
	}
}
