import { db } from '$lib/server/db';
import type { TableFilterPayload } from '$lib/types/db';
import { isValidIdentifier } from '$lib/utils/db';
import { json } from '@sveltejs/kit';
import format from 'pg-format';

export async function POST({ request, url }) {
	const table = url.searchParams.get('table');
	if (!table) return json({ error: 'Table name is required' }, { status: 400 });
	if (!isValidIdentifier(table)) {
		return json({ error: 'Invalid table name' }, { status: 400 });
	}

	const { filters, sort, limit, offset }: TableFilterPayload = await request.json();

	// Build the WHERE clause by iterating over the filters object
	const conditions: string[] = [];

	if (filters && filters.length > 0) {
		for (const filter of filters) {
			switch (filter.type) {
				case '=':
				case '!=':
				case '<':
				case '<=':
				case '>':
				case '>=':
					conditions.push(format('%I %s %L', filter.column, filter.type, filter.value));
					break;

				case 'IN':
				case 'NOT IN':
					conditions.push(format('%I %s (%L)', filter.column, filter.type, filter.value));
					break;

				case 'BETWEEN':
					conditions.push(
						format('%I BETWEEN %L AND %L', filter.column, filter.value[0], filter.value[1])
					);
					break;

				case 'IS NULL':
				case 'IS NOT NULL':
					conditions.push(format('%I %s', filter.column, filter.type));
					break;

				case 'ILIKE':
					conditions.push(format('%I ILIKE %L', filter.column, filter.value));
					break;
			}
		}
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
