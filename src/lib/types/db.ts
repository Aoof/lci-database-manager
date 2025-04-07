// Type for the JSON payload expected by the POST method in table creation
export interface CreateTablePayload {
	columns: Array<{
		name: string; // Column name
		type: string; // Column type (e.g., "VARCHAR(255)", "SERIAL PRIMARY KEY")
	}>;
}

// Type for the JSON payload expected by the PUT method in table updates
export interface UpdateTablePayload {
	changes: Array<{
		action: 'ADD' | 'DROP' | 'MODIFY'; // Action to perform on the column
		column: string; // Column name
		type?: string; // Column type (required for ADD and MODIFY actions)
	}>;
}

// Type for the JSON payload expected by the POST method in row insertion
export interface InsertRowPayload {
	values: Record<string, unknown>; // Key-value pairs to insert into the row
}

export type IdentifierPayload = Record<string, unknown>; // Key-value pairs of column names and their current values

// Type for the JSON payload expected by the PUT method in row updates
export interface UpdateRowPayload {
	identifier: IdentifierPayload; // Identifier for the row to update
	values: Record<string, unknown>; // Key-value pairs of column names and their new values
}

type FilterCondition =
	| { column: string; type: '=' | '!=' | '<' | '<=' | '>' | '>='; value: string | number }
	| { column: string; type: 'IN' | 'NOT IN'; value: (string | number)[] }
	| { column: string; type: 'BETWEEN'; value: [string | number, string | number] }
	| { column: string; type: 'IS NULL' | 'IS NOT NULL' }
	| { column: string; type: 'ILIKE'; value: string };

export interface FilterPayload {
	columns: string[]; // Columns to select, may include aggregates (e.g., 'MAX(sal)' as alias)
	filters?: FilterCondition[]; // Advanced filtering (supporting operators like '=', '<>', 'IN', 'BETWEEN', etc.)
	groupBy?: string[]; // Columns to group by
	aggregates?: { func: 'MAX' | 'MIN' | 'AVG' | 'SUM' | 'COUNT'; column: string }[]; // Aggregate functions
	having?: {
		func: 'MAX' | 'MIN' | 'AVG' | 'SUM' | 'COUNT';
		column: string;
		operator: '=' | '!=' | '<' | '<=' | '>' | '>=';
		value: number;
	}; // HAVING clause for filtering groups
	orderBy?: { column: string; direction: 'ASC' | 'DESC' }; // Ordering
	limit?: number; // Pagination limit
	offset?: number; // Pagination offset
}

type Constraint =
	| { type: 'PRIMARY_KEY'; columns: string[] }
	| { type: 'FOREIGN_KEY'; columns: string[]; foreignTable: string; foreignColumns: string[] }
	| { type: 'NOT_NULL'; columns: string[] }
	| { type: 'CHECK'; checkString: string }
	| { type: 'UNIQUE'; column: string };

export interface ConstraintPayload {
	constraints: Constraint[]; // Array of constraints to be applied to the table
}

export interface CreateViewPayload {
	select: FilterPayload;
	withCheckOption?: boolean;
}
