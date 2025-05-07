import { db } from '$lib/server/db';
import type { CreateViewPayload } from '$lib/types/db';
import { isValidIdentifier } from '$lib/utils/db';
import { json } from '@sveltejs/kit';
import format from 'pg-format';

export async function GET({ url }) {
	const viewName = url.searchParams.get('view');
	if (!viewName || !isValidIdentifier(viewName)) {
		return json({ error: 'Invalid or missing view name' }, { status: 400 });
	}

	if (viewName === 'all') {
		const table = url.searchParams.get('table');
		if (!table || !isValidIdentifier(table)) {
			return json({ error: 'Invalid or missing table name' }, { status: 400 });
		}

		const query = format(
			"SELECT viewname FROM pg_views WHERE schemaname = 'public' AND definition LIKE %L",
			`%FROM ${table}%`
		);
		try {
			const views = await db.query(query);
			return json({ query, data: views, message: 'Views retrieved successfully' }, { status: 200 });
		} catch (error) {
			console.error('Error executing query:', error);
			return json({ error: 'Error executing query', details: error }, { status: 500 });
		}
	}

	if (url.searchParams.has('count')) {
		const query = format('SELECT COUNT(*) FROM %I', viewName);
		try {
			const count = await db.query(query);
			return json({ query, data: count, message: 'Count retrieved successfully' }, { status: 200 });
		} catch (error) {
			console.error('Error executing query:', error);
			return json({ error: 'Error executing query', details: error }, { status: 500 });
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

	let query = format('SELECT * FROM %I', viewName);
	query += format(' LIMIT %L OFFSET %L', limit, offset);

	try {
		const data = await db.query(query);
		return json({ query, data, message: 'Data retrieved successfully' }, { status: 200 });
	} catch (error) {
		console.error('Error executing query:', error);
		return json({ error: 'Error executing query', details: error }, { status: 500 });
	}
}

export async function POST({ request, url }) {
	return json({ error: 'Action prevented to maintain the integrity of the data in the demo version.' }, { status: 500 });
	// const table = url.searchParams.get('table');
	// if (!table || !isValidIdentifier(table)) {
	// 	return json({ error: 'Invalid or missing table name' }, { status: 400 });
	// }

	// const viewName = url.searchParams.get('view');
	// if (!viewName || !isValidIdentifier(viewName)) {
	// 	return json({ error: 'Invalid or missing view name' }, { status: 400 });
	// }

	// const { select, withCheckOption }: CreateViewPayload = await request.json();
	// const { columns, filters, groupBy, aggregates, having, orderBy, limit, offset } = select;

	// if (!viewName || !isValidIdentifier(viewName)) {
	// 	return json({ error: 'Invalid or missing view name' }, { status: 400 });
	// }

	// // SELECT clause
	// const selectClause = [
	// 	...columns.map((col) => format.ident(col)),
	// 	...(aggregates || []).map((agg) => format('%s(%I)', agg.func, agg.column))
	// ].join(', ');

	// let query = format(
	// 	'CREATE OR REPLACE VIEW %I AS SELECT %s FROM %I',
	// 	viewName,
	// 	selectClause,
	// 	table
	// );

	// // WHERE clause
	// if (filters && filters.length > 0) {
	// 	const filterClauses = filters.map((filter) => {
	// 		switch (filter.type) {
	// 			case '=':
	// 			case '!=':
	// 			case '<':
	// 			case '<=':
	// 			case '>':
	// 			case '>=':
	// 				return format('%I %s %L', filter.column, filter.type, filter.value);
	// 			case 'IN':
	// 			case 'NOT IN':
	// 				return format('%I %s (%L)', filter.column, filter.type, filter.value);
	// 			case 'BETWEEN':
	// 				return format('%I BETWEEN %L AND %L', filter.column, filter.value[0], filter.value[1]);
	// 			case 'IS NULL':
	// 			case 'IS NOT NULL':
	// 				return format('%I %s', filter.column, filter.type);
	// 			case 'ILIKE':
	// 				return format('%I ILIKE %L', filter.column, filter.value);
	// 		}
	// 	});
	// 	query += ` WHERE ${filterClauses.join(' AND ')}`;
	// }

	// // GROUP BY
	// if (groupBy && groupBy.length > 0) {
	// 	query += ` GROUP BY ${groupBy.map((col) => format.ident(col)).join(', ')}`;
	// }

	// // HAVING
	// if (having) {
	// 	query += format(
	// 		' HAVING %s(%I) %s %L',
	// 		having.func,
	// 		having.column,
	// 		having.operator,
	// 		having.value
	// 	);
	// }

	// // ORDER BY
	// if (orderBy) {
	// 	query += format(' ORDER BY %I %s', orderBy.column, orderBy.direction);
	// }

	// // LIMIT / OFFSET
	// if (limit) query += format(' LIMIT %L', limit);
	// if (offset) query += format(' OFFSET %L', offset);

	// // WITH CHECK OPTION
	// if (withCheckOption) {
	// 	query += ' WITH CHECK OPTION';
	// }

	// try {
	// 	await db.query(query);
	// 	return json({ query, message: 'View created successfully' }, { status: 200 });
	// } catch (error) {
	// 	console.error('Error executing query:', error);
	// 	return json({ error: 'Error executing query', details: error }, { status: 500 });
	// }
}

export async function DELETE({ url }) {
	return json({ error: 'Action prevented to maintain the integrity of the data in the demo version.' }, { status: 500 });
	// const viewName = url.searchParams.get('name');
	// if (!viewName || !isValidIdentifier(viewName)) {
	// 	return json({ error: 'Invalid or missing view name' }, { status: 400 });
	// }

	// const query = format('DROP VIEW IF EXISTS %I', viewName);

	// try {
	// 	await db.query(query);
	// 	return json({ query, message: 'View deleted successfully' }, { status: 200 });
	// } catch (error) {
	// 	console.error('Error executing query:', error);
	// 	return json({ error: 'Error executing query', details: error }, { status: 500 });
	// }
}
