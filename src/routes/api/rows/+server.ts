import { json } from '@sveltejs/kit';
import { sql } from '$lib/server/db';
import { isValidIdentifier } from '$lib/utils/db';
import type { InsertRowPayload, UpdateRowPayload } from '$lib/types/db';

export async function GET({ url }) {
	const tableName = url.searchParams.get('table');
	if (!tableName) return json({ error: 'Table Name is required!' }, { status: 400 });
	if (!isValidIdentifier(tableName)) {
		return json({ error: 'Invalid table name' }, { status: 400 });
	}

	const id = url.searchParams.get('id');
	if (!id || isNaN(Number(id))) {
		return json({ error: 'Invalid or missing row id' }, { status: 400 });
	}

	const query = `SELECT * FROM "${tableName}" WHERE id = ${id}`;

	try {
		const rows = await sql.query(query);
		return json({ query, data: rows, message: 'Row retrieved successfully!' }, { status: 200 });
	} catch (error) {
		console.error('Error executing query:', error);
		return json({ error: 'Error executing query' }, { status: 500 });
	}
}

export async function POST({ url, request }) {
	const tableName = url.searchParams.get('table');
	if (!tableName) return json({ error: 'Table Name is required!' }, { status: 400 });
	if (!isValidIdentifier(tableName)) {
		return json({ error: 'Invalid table name' }, { status: 400 });
	}

	const { values }: InsertRowPayload = await request.json();
	if (!Array.isArray(values) || values.length === 0) {
		return json({ error: 'Invalid values structure' }, { status: 400 });
	}

	const formattedValues = values
		.map((value) => (typeof value === 'string' ? `'${value}'` : value))
		.join(', ');
	const query = `INSERT INTO "${tableName}" VALUES (${formattedValues})`;

	try {
		await sql.query(query);
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
			return `"${key}" = ${typeof value === 'string' ? `'${value}'` : value}`;
		})
		.join(', ');

	const query = `UPDATE "${tableName}" SET ${setClause} WHERE id = ${id}`;

	try {
		await sql.query(query);
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

	const query = `DELETE FROM "${tableName}" WHERE id = ${id}`;

	try {
		await sql.query(query);
		return json({ query, message: 'Row deleted successfully!' }, { status: 200 });
	} catch (error) {
		console.error('Error executing query:', error);
		return json({ error: 'Error executing query' }, { status: 500 });
	}
}
