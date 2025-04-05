import { json } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { isValidIdentifier } from '$lib/utils/db';
import format from 'pg-format';
import type { ConstraintPayload } from '$lib/types/db';

export async function GET({ url }) {
	const table = url.searchParams.get('table');
	if (!table) return json({ error: 'Table name is required' }, { status: 400 });
	if (!isValidIdentifier(table)) return json({ error: 'Invalid table name' }, { status: 400 });

	const query = format(
		'SELECT * FROM information_schema.table_constraints WHERE table_name=%L;',
		table
	);

	try {
		const constraints = await db.query(query);
		return json(
			{ query, data: constraints, message: 'Constraints retrieved successfully' },
			{ status: 200 }
		);
	} catch (error) {
		console.error('Error executing query:', error);
		return json({ error: 'Error executing query' }, { status: 500 });
	}
}

export async function POST({ request, url }) {
	const table = url.searchParams.get('table');
	if (!table) return json({ error: 'Table name is required' }, { status: 400 });
	if (!isValidIdentifier(table)) return json({ error: 'Invalid table name' }, { status: 400 });

	const constraints: ConstraintPayload = await request.json();

	let query: string = '';
	for (const constraint of constraints.constraints) {
		if (!isValidIdentifier(constraint.type)) {
			return json({ error: `Invalid constraint name: ${constraint.type}` }, { status: 400 });
		}

		switch (constraint.type) {
			case 'PRIMARY_KEY': {
				query += format(
					'ALTER TABLE %I ADD CONSTRAINT %I PRIMARY KEY (%I)',
					table,
					`${table}_${constraint.column}_PK`,
					constraint.column
				);
				break;
			}
			case 'FOREIGN_KEY': {
				query += format(
					'ALTER TABLE %I ADD CONSTRAINT %I FOREIGN KEY (%s) REFERENCES %I (%s)',
					table,
					`${table}_${constraint.columns.join('_')}_FK`,
					constraint.columns.map((col) => format('%I', col)).join(', '),
					constraint.foreignTable,
					constraint.foreignColumns.map((col) => format('%I', col)).join(', ')
				);
				break;
			}
			case 'UNIQUE': {
				query += format(
					'ALTER TABLE %I ADD CONSTRAINT %s UNIQUE(%I)',
					table,
					`${table}_${constraint.column}_UK`,
					constraint.column
				);
				break;
			}
			case 'NOT_NULL': {
				query += format(
					'ALTER TABLE %I %s',
					table,
					constraint.columns.map((col) => format('ALTER COLUMN %I SET NOT NULL', col)).join(', ')
				);
				break;
			}
			case 'CHECK': {
				query += format(
					'ALTER TABLE %I ADD CONSTRAINT %I CHECK (%s)',
					table,
					`${table}_CC`,
					constraint.checkString
				);
				break;
			}
		}

		try {
			await db.query(query);
			return json({ query, message: 'Constraint added successfully' }, { status: 200 });
		} catch (error) {
			console.error('Error executing query:', error);
			return json({ error: 'Error executing query' }, { status: 500 });
		}
	}
}
