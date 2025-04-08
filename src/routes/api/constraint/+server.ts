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

	const queries = constraints.constraints.map((constraint) => {
		switch (constraint.type) {
			case 'PRIMARY_KEY': {
				return format(
					'ALTER TABLE %I ADD CONSTRAINT %I PRIMARY KEY (%s)',
					table,
					`${table}_${constraint.columns.join('_')}_PK`,
					constraint.columns.map((col) => format('%I', col)).join(', ')
				);
			}
			case 'FOREIGN_KEY': {
				return format(
					'ALTER TABLE %I ADD CONSTRAINT %I FOREIGN KEY (%s) REFERENCES %I (%s)',
					table,
					`${table}_${constraint.columns.join('_')}_FK`,
					constraint.columns.map((col) => format('%I', col)).join(', '),
					constraint.foreignTable,
					constraint.foreignColumns.map((col) => format('%I', col)).join(', ')
				);
			}
			case 'UNIQUE':
				return format(
					'ALTER TABLE %I ADD CONSTRAINT %s UNIQUE(%I)',
					table,
					`${table}_${constraint.column}_UK`,
					constraint.column
				);

			case 'NOT_NULL': {
				return format(
					'ALTER TABLE %I %s',
					table,
					constraint.columns.map((col) => format('ALTER COLUMN %I SET NOT NULL', col)).join(', ')
				);
			}
			case 'CHECK': {
				return format(
					'ALTER TABLE %I ADD CONSTRAINT %I CHECK (%s)',
					table,
					`${table}_CC`,
					constraint.checkString
				);
			}
		}
	});

	try {
		Promise.all(
			queries.map(async (query) => {
				await db.query(query);
			})
		);
		return json(
			{ query: queries.join(';'), message: 'Constraint added successfully' },
			{ status: 200 }
		);
	} catch (error) {
		console.error('Error executing query:', error);
		return json({ error: 'Error executing query' }, { status: 500 });
	}
}
