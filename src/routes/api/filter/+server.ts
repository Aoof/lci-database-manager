import { json } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { isValidIdentifier } from '$lib/utils/db';
import format from 'pg-format';
import type { TableFilterPayload } from '$lib/types/db';

export async function POST({ request, url }) {
	const table = url.searchParams.get('table');
	if (!table) return json({ error: 'Table name is required' }, { status: 400 });
	if (!isValidIdentifier(table)) {
		return json({ error: 'Invalid table name' }, { status: 400 });
	}

	const { filters, sort, limit, offset }: TableFilterPayload = await request.json();

	// Build the WHERE clause by iterating over the filters object
	const conditions: string[] = [];
	for (const key in filters) {
		conditions.push(format('%I = %L', key, filters[key]));
	}
	const whereClause = conditions.length ? 'WHERE ' + conditions.join(' AND ') : '';

	// Build the ORDER BY clause if sorting information is provided
	let orderClause = '';
	if (sort && sort.column) {
		orderClause = format('ORDER BY %I %s', sort.column, sort.direction);
	}

	// Build LIMIT and OFFSET clauses
	const limitClause = limit ? format('LIMIT %I', limit) : '';
	const offsetClause = offset ? format('OFFSET %I', offset) : '';

	// Construct the final SQL command
	const query = format(
		'SELECT * FROM %I %s %s %s %s;',
		table,
		whereClause,
		orderClause,
		limitClause,
		offsetClause
	);

	try {
		const rows = await db.query(query);

		return json({ query, data: rows, message: 'Data retrieved successfully' }, { status: 200 });
	} catch (error: any) {
		console.error('Error executing query:', error);
		return json({ error: error.message }, { status: 500 });
	}
}
