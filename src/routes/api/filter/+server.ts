import { db } from '$lib/server/db';
import type { FilterPayload } from '$lib/types/db';
import { isValidIdentifier } from '$lib/utils/db';
import { json } from '@sveltejs/kit';
import format from 'pg-format';

export async function POST({ request, url }) {
	const table = url.searchParams.get('table');
	if (!table) return json({ error: 'Table name is required' }, { status: 400 });
	if (!isValidIdentifier(table)) {
		return json({ error: 'Invalid table name' }, { status: 400 });
	}

	const { columns, filters, groupBy, aggregates, having, orderBy, limit, offset }: FilterPayload =
		await request.json();

	// Build the SELECT clause
	const selectColumns = columns.map((col) => format('%I', col));
	if (aggregates && aggregates.length > 0) {
		aggregates.forEach((agg) =>
			selectColumns.push(format('%s(%I) AS %I', agg.func, agg.column, `${agg.func}_${agg.column}`))
		);
	}
	const selectClause = selectColumns.join(', ');

	// Build the WHERE clause
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

	if (url.searchParams.has('count')) {
		const countQuery = format('SELECT COUNT(*) FROM %I %s;', table, whereClause);
		try {
			const count = await db.query(countQuery);
			return json(
				{ query: countQuery, data: count, message: 'Count retrieved successfully!' },
				{ status: 200 }
			);
		} catch (error) {
			console.error('Error executing query:', error);
			return json({ error: 'Error executing query', details: error }, { status: 500 });
		}
	}

	// Build the GROUP BY clause
	const groupByClause =
		groupBy && groupBy.length > 0
			? 'GROUP BY ' + groupBy.map((col) => format('%I', col)).join(', ')
			: '';

	// Build the HAVING clause
	let havingClause = '';
	if (having) {
		havingClause = format(
			'HAVING %s(%I) %s %L',
			having.func,
			having.column,
			having.operator,
			having.value
		);
	}

	// Build the ORDER BY clause
	let orderClause = '';
	if (orderBy && orderBy.column) {
		orderClause = format('ORDER BY %I %s', orderBy.column, orderBy.direction);
	}

	// Build LIMIT and OFFSET clauses
	const limitClause = limit ? format('LIMIT %L', limit) : '';
	const offsetClause = offset ? format('OFFSET %L', offset) : '';

	// Construct the final SQL command
	const query = format(
		'SELECT %s FROM %I %s %s %s %s %s %s;',
		selectClause,
		table,
		whereClause,
		groupByClause,
		havingClause,
		orderClause,
		limitClause,
		offsetClause
	);

	try {
		const rows = await db.query(query);
		return json({ query, data: rows, message: 'Data retrieved successfully' }, { status: 200 });
	} catch (error) {
		console.error('Error executing query:', error);
		return json({ error: 'Error executing query', details: error }, { status: 500 });
	}
}
