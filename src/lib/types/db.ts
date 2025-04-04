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
	values: Array<any>; // Array of values to insert into the row
}

// Type for the JSON payload expected by the PUT method in row updates
export interface UpdateRowPayload {
	values: Record<string, any>; // Key-value pairs of column names and their new values
}

export interface TableFilterPayload {
	filters?: Record<string, string | number>; // Key-value pairs for filtering
	sort?: {
		column: string; // Column name to sort by
		direction: 'ASC' | 'DESC'; // Sort direction
	};
	limit?: number; // Max number of records to return
	offset?: number; // Number of records to skip
}

export type Constraint =
	| { type: 'PRIMARY_KEY'; column: string }
	| { type: 'FOREIGN_KEY'; columns: string[]; foreignTable: string; foreignColumns: string[] }
	| { type: 'NOT_NULL'; columns: string[] }
	| { type: 'CHECK'; checkString: string }
	| { type: 'UNIQUE'; column: string };

export interface ConstraintPayload {
	constraints: Constraint[]; // Array of constraints to be applied to the table
}
