import { db } from '$lib/server/db';
import type { IdentifierPayload, InsertRowPayload, UpdateRowPayload } from '$lib/types/db';
import { isValidIdentifier } from '$lib/utils/db';
import { json } from '@sveltejs/kit';
import format from 'pg-format';

export async function GET({ url }) {
	const table = url.searchParams.get('table');
	if (!table) return json({ error: 'Table Name is required!' }, { status: 400 });
	if (!isValidIdentifier(table)) {
		return json({ error: 'Invalid table name' }, { status: 400 });
	}

	if (url.searchParams.has('count')) {
		const query = format('SELECT COUNT(*) FROM %I', table);
		try {
			const count = await db.query(query);
			return json(
				{ query, data: count, message: 'Count retrieved successfully!' },
				{ status: 200 }
			);
		} catch (error) {
			console.error('Error executing query:', error);
			return json({ error: 'Error executing query' }, { status: 500 });
		}
	}

	const limit = parseInt(url.searchParams.get('limit') || '10', 10);
	const offset = parseInt(url.searchParams.get('offset') || '0', 10);

	if (isNaN(limit) || limit <= 0) {
		return json({ error: 'Invalid limit value' }, { status: 400 });
	}
	if (isNaN(offset) || offset < 0) {
		return json({ error: 'Invalid offset value' }, { status: 400 });
	}

	const query = format('SELECT * FROM %I LIMIT %L OFFSET %L', table, limit, offset);

	try {
		const rows = await db.query(query);
		return json({ query, data: rows, message: 'Rows retrieved successfully!' }, { status: 200 });
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

	const { identifier, values }: UpdateRowPayload = await request.json();
	if (
		!identifier ||
		typeof identifier !== 'object' ||
		Object.keys(identifier).length === 0 ||
		!values ||
		typeof values !== 'object' ||
		Object.keys(values).length === 0
	) {
		return json({ error: 'Invalid identifier or values structure' }, { status: 400 });
	}

	const setClause = Object.entries(values)
		.map(([key, value]) => {
			if (!isValidIdentifier(key)) {
				throw new Error(`Invalid column name: ${key}`);
			}
			return format('%I = %L', key, value);
		})
		.join(', ');

	const whereClause = Object.entries(identifier)
		.map(([key, value]) => {
			if (!isValidIdentifier(key)) {
				return json({ error: `Invalid column name in identifier: ${key}` }, { status: 400 });
			}
			return format('%I = %L', key, value);
		})
		.join(' AND ');

	const query = format('UPDATE %I SET %s WHERE %s', tableName, setClause, whereClause);

	try {
		await db.query(query);
		return json({ query, message: 'Row updated successfully!' }, { status: 200 });
	} catch (error) {
		console.error('Error executing query:', error);
		return json({ error: 'Error executing query' }, { status: 500 });
	}
}

export async function DELETE({ url, request }) {
	const tableName = url.searchParams.get('table');
	if (!tableName) return json({ error: 'Table Name is required!' }, { status: 400 });
	if (!isValidIdentifier(tableName)) {
		return json({ error: 'Invalid table name' }, { status: 400 });
	}

	const identifier: IdentifierPayload = await request.json();
	if (!identifier || typeof identifier !== 'object' || Object.keys(identifier).length === 0) {
		return json({ error: 'Invalid identifier structure' }, { status: 400 });
	}

	const whereClause = Object.entries(identifier)
		.map(([key, value]) => {
			if (!isValidIdentifier(key)) {
				return json({ error: `Invalid column name in identifier: ${key}` }, { status: 400 });
			}
			return format('%I = %L', key, value);
		})
		.join(' AND ');

	const query = format('DELETE FROM %I WHERE %s', tableName, whereClause);

	try {
		await db.query(query);
		return json({ query, message: 'Row deleted successfully!' }, { status: 200 });
	} catch (error) {
		console.error('Error executing query:', error);
		return json({ error: 'Error executing query' }, { status: 500 });
	}
}
