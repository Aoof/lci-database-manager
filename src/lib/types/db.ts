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
	values: Record<string, any>; // Key-value pairs to insert into the row
}

// Type for the JSON payload expected by the PUT method in row updates
export interface UpdateRowPayload {
	values: Record<string, any>; // Key-value pairs of column names and their new values
}

type FilterCondition =
	| { column: string; type: '=' | '!=' | '<' | '<=' | '>' | '>='; value: string | number }
	| { column: string; type: 'IN' | 'NOT IN'; value: (string | number)[] }
	| { column: string; type: 'BETWEEN'; value: [string | number, string | number] }
	| { column: string; type: 'IS NULL' | 'IS NOT NULL' }
	| { column: string; type: 'ILIKE'; value: string };

export interface TableFilterPayload {
	filters?: FilterCondition[];
	sort?: {
		column: string;
		direction: 'ASC' | 'DESC';
	};
	limit?: number;
	offset?: number;
}

type Constraint =
	| { type: 'PRIMARY_KEY'; column: string }
	| { type: 'FOREIGN_KEY'; columns: string[]; foreignTable: string; foreignColumns: string[] }
	| { type: 'NOT_NULL'; columns: string[] }
	| { type: 'CHECK'; checkString: string }
	| { type: 'UNIQUE'; column: string };

export interface ConstraintPayload {
	constraints: Constraint[]; // Array of constraints to be applied to the table
}
