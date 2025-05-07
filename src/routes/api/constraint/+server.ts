import { db } from '$lib/server/db';
import type { ConstraintPayload } from '$lib/types/db';
import { isValidIdentifier } from '$lib/utils/db';
import { json } from '@sveltejs/kit';
import format from 'pg-format';

export async function GET({ url }) {
	const table = url.searchParams.get('table');
	if (!table) return json({ error: 'Table name is required' }, { status: 400 });
	if (!isValidIdentifier(table)) return json({ error: 'Invalid table name' }, { status: 400 });

	const query = format(
		'SELECT tc.constraint_name, tc.constraint_type, kcu.column_name, ccu.table_name AS foreign_table_name, ccu.column_name AS foreign_column_name FROM information_schema.table_constraints AS tc JOIN information_schema.key_column_usage AS kcu ON tc.constraint_name = kcu.constraint_name AND tc.table_schema = kcu.table_schema LEFT JOIN information_schema.constraint_column_usage AS ccu ON ccu.constraint_name = tc.constraint_name AND ccu.table_schema = tc.table_schema WHERE tc.table_name = %L;',
		table
	)

	try {
		const constraints = await db.query(query);
		return json(
			{ query: 'SELECT * FROM information_schema.constraints as c JOIN information_schema.tables as t ON t.table_schema = c.table_schema;', data: constraints, message: 'Constraints retrieved successfully' },
			{ status: 200 }
		);
	} catch (error) {
		console.error('Error executing query:', error);
		return json({ error: 'Error executing query' }, { status: 500 });
	}
}

export async function POST({ request, url }) {
	return json({ error: 'Action prevented to maintain the integrity of the data in the demo version.' }, { status: 500 });
	// const table = url.searchParams.get('table');
	// if (!table) return json({ error: 'Table name is required' }, { status: 400 });
	// if (!isValidIdentifier(table)) return json({ error: 'Invalid table name' }, { status: 400 });

	// const constraints: ConstraintPayload = await request.json();

	// const queries = constraints.constraints.map((constraint) => {
	// 	switch (constraint.type) {
	// 		case 'PRIMARY_KEY': {
	// 			return format(
	// 				'ALTER TABLE %I ADD CONSTRAINT %I PRIMARY KEY (%s)',
	// 				table,
	// 				`${table}_${constraint.columns.join('_')}_PK`,
	// 				constraint.columns.map((col) => format('%I', col)).join(', ')
	// 			);
	// 		}
	// 		case 'FOREIGN_KEY': {
	// 			return format(
	// 				'ALTER TABLE %I ADD CONSTRAINT %I FOREIGN KEY (%I) REFERENCES %I (%I)',
	// 				table,
	// 				`${table}_${constraint.column}_FK`,
	// 				constraint.column,
	// 				constraint.foreignTable,
	// 				constraint.foreignColumn,
	// 			);
	// 		}
	// 		case 'UNIQUE':
	// 			return format(
	// 				'ALTER TABLE %I ADD CONSTRAINT %s UNIQUE(%I)',
	// 				table,
	// 				`${table}_${constraint.column}_UK`,
	// 				constraint.column
	// 			);

	// 		case 'NOT_NULL': {
	// 			return format(
	// 				'ALTER TABLE %I %s',
	// 				table,
	// 				constraint.columns.map((col) => format('ALTER COLUMN %I SET NOT NULL', col)).join(', ')
	// 			);
	// 		}
	// 		case 'CHECK': {
	// 			return format(
	// 				'ALTER TABLE %I ADD CONSTRAINT %I CHECK (%s)',
	// 				table,
	// 				`${table}_CC`,
	// 				constraint.checkString
	// 			);
	// 		}
	// 	}
	// });

	// try {
	// 	Promise.all(
	// 		queries.map(async (query) => {
	// 			await db.query(query);
	// 		})
	// 	);
	// 	return json(
	// 		{ query: queries.join(';'), message: 'Constraint added successfully' },
	// 		{ status: 200 }
	// 	);
	// } catch (error) {
	// 	console.error('Error executing query:', error);
	// 	return json({ error: 'Error executing query' }, { status: 500 });
	// }
}
