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
