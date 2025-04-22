import { writable } from 'svelte/store';
import { dbCommand } from '$lib/components/db-command';
import type { Column, Constraint } from '$lib/types'; // Import Constraint type

export interface DatabaseState {
	tables: {
		name: string;
		columns: Column[];
	}[];
	isLoading: boolean;
	error: string | null;
}

const initialState: DatabaseState = {
	tables: [],
	isLoading: false,
	error: null
};

const database = writable<DatabaseState>(initialState);

// Helper function to fetch table details (columns or constraints)
async function fetchTableDetails(url: string) {
	try {
		const response = await fetch(url);
		if (!response.ok) {
			throw new Error(`Failed to fetch ${url}: ${response.statusText}`);
		}
		return await response.json();
	} catch (error) {
		console.error(`Error fetching ${url}:`, error);
		return null; // Return null on error to allow Promise.all to complete
	}
}

/**
 * Convert API constraint format to our Constraint type
 */
function normalizeConstraints(apiConstraints: any[]): Constraint[] {
	if (!Array.isArray(apiConstraints)) return [];
	
	return apiConstraints.map(constraint => {
		const { constraint_name, constraint_type, column_name, foreign_table_name, foreign_column_name } = constraint;
		
		switch(constraint_type) {
			case 'PRIMARY KEY':
				return { 
					type: 'PRIMARY_KEY', 
					columns: [column_name] 
				} as Constraint;
			
			case 'UNIQUE':
				return { 
					type: 'UNIQUE', 
					column: column_name 
				} as Constraint;
			
			case 'FOREIGN KEY':
				return { 
					type: 'FOREIGN_KEY', 
					column: column_name,
					foreignTable: foreign_table_name,
					foreignColumn: foreign_column_name
				} as Constraint;
			
			case 'NOT NULL':
				return { 
					type: 'NOT_NULL', 
					columns: [column_name] 
				} as Constraint;
			
			case 'CHECK':
				return { 
					type: 'CHECK', 
					checkString: constraint.definition || constraint_name 
				} as Constraint;
			
			default:
				console.warn(`Unknown constraint type: ${constraint_type}`);
				return null;
		}
	}).filter(Boolean) as Constraint[];
}

export const databaseStore = {
	subscribe: database.subscribe,
	async getTables() {
		database.update((state) => ({ ...state, isLoading: true, error: null }));
		try {
			// 1. Fetch all table names
			const tablesResponse = await fetch('/api/table?table=all');
			if (!tablesResponse.ok) throw new Error('Failed to load table list');
			const tablesResult = await tablesResponse.json();
			const tableNames: string[] = tablesResult.data.map((t: { table_name: string }) => t.table_name);

			// Show the initial SQL query
			if (tablesResult.query) { dbCommand(tablesResult.query); }

			// 2. Prepare promises for fetching column and constraint details in parallel
			const columnDetailPromises = tableNames.map(name => fetchTableDetails(`/api/table?table=${name}`));
			const constraintDetailPromises = tableNames.map(name => fetchTableDetails(`/api/constraint?table=${name}`));

			// 3. Execute fetches in parallel
			const [columnResults, constraintResults] = await Promise.all([
				Promise.all(columnDetailPromises),
				Promise.all(constraintDetailPromises)
			]);

			// 4. Process results and build the final table structure
			const _tables = tableNames.map((tableName, index) => {
				const tableData = columnResults[index];
				const constraintsData = constraintResults[index];

				if (!tableData || !constraintsData) {
					console.error(`Missing data for table: ${tableName}`);
					return null; 
				}

				// Show SQL queries if available
				if (tableData.query) { dbCommand(tableData.query); }
				if (constraintsData.query) { dbCommand(constraintsData.query); }

				// Convert API constraint format to our internal type
				const constraints: Constraint[] = normalizeConstraints(constraintsData.data ?? []);
				
				// More precise column mapping function
				const columns = parseColumnsWithConstraints(tableData.data ?? [], constraints);

				return {
					name: tableName,
					columns
				};
			}).filter(table => table !== null);

			console.log('_tables:', _tables);

			database.update((state) => ({ ...state, tables: _tables as DatabaseState['tables'], isLoading: false }));

		} catch (error: any) {
			console.error('Failed to load tables:', error);
			database.update((state) => ({ ...state, error: error.message ?? 'Failed to load tables', isLoading: false }));
		}
	},

	// Keep existing methods for potential direct use elsewhere
	async getTable(name: string) {
		database.update((state) => ({ ...state, isLoading: true }));
		try {
			const result = await fetchTableDetails(`/api/table?table=${name}`);
			if (result?.query) { dbCommand(result.query); }
			database.update((state) => ({ ...state, isLoading: false })); // Set loading false after fetch
			return result;
		} catch (error: any) {
			console.error(error);
			database.update((state) => ({
				...state,
				error: error.message ?? 'Failed to load table data',
				isLoading: false
			}));
			return null;
		}
	},

	async getRowsLength(name: string) {
		database.update((state) => ({...state, isLoading: true }));
		try {
			const result = await fetchTableDetails(`/api/row?table=${name}&count=true`);
			if (result?.query) { dbCommand(result.query); }
			database.update((state) => ({ ...state, isLoading: false }));
			return result;
		} catch (error: any) {
			console.error(error);
			database.update((state) => ({
				...state,
				error: error.message ?? 'Failed to load row count',
				isLoading: false
			}));	
			return null;
		}
	},

	async getRows(name: string, limit: number = 10, offset: number = 0) {
		database.update((state) => ({...state, isLoading: true }));
		try {
			const result = await fetchTableDetails(`/api/row?table=${name}&limit=${limit}&offset=${offset}`);
			if (result?.query) { dbCommand(result.query); }
			database.update((state) => ({ ...state, isLoading: false }));
			return result;
		} catch (error: any) {
			console.error(error);
			database.update((state) => ({
				...state,
				error: error.message ?? 'Failed to load rows',
				isLoading: false
			}));
			return null;
		}
	},

	async getConstraints(name: string) {
		database.update((state) => ({...state, isLoading: true }));
		try {
			const result = await fetchTableDetails(`/api/constraint?table=${name}`);
			if (result?.query) { dbCommand(result.query); }
			database.update((state) => ({ ...state, isLoading: false }));
			return result;
		} catch (error: any) {
			console.error(error);
			database.update((state) => ({
				...state,
				error: error.message ?? 'Failed to load constraints',
				isLoading: false
			}));	
			return null;
		}
	},
};

/**
 * Parse column data from the database and combine it with constraint information
 * to create properly typed Column objects
 */
function parseColumnsWithConstraints(
	columnsData: Array<any>, 
	constraints: Constraint[]
): Column[] {
	if (!Array.isArray(columnsData)) {
		console.error('Invalid column data format:', columnsData);
		return [];
	}

	return columnsData.map(col => {
		try {
			if (!col || typeof col.column_name !== 'string') {
				throw new Error(`Invalid column data: ${JSON.stringify(col)}`);
			}

			// Find constraints for this column
			const primaryKeyConstraints = constraints.filter(c => 
				c.type === 'PRIMARY_KEY' && c.columns.includes(col.column_name));
			const uniqueConstraints = constraints.filter(c => 
				c.type === 'UNIQUE' && c.column === col.column_name);
			const foreignKeyConstraints = constraints.filter(c => 
				c.type === 'FOREIGN_KEY' && c.column === col.column_name);
			const notNullConstraints = constraints.filter(c => 
				c.type === 'NOT_NULL' && c.columns.includes(col.column_name));
			const checkConstraints = constraints.filter(c => 
				c.type === 'CHECK');

			// Determine column properties based on constraints
			const isPrimaryKey = primaryKeyConstraints.length > 0;
			const isNotNull = notNullConstraints.length > 0 || isPrimaryKey; // Primary keys are implicitly NOT NULL
			const isUnique = uniqueConstraints.length > 0 || isPrimaryKey;
			
			// Get check constraint info
			const checkString = checkConstraints.length > 0 ? checkConstraints[0].checkString : undefined;
			
			// Process foreign key info
			let foreignKey: Column['foreignKey'] = undefined;
			
			if (foreignKeyConstraints.length > 0) {
				const constraint = foreignKeyConstraints[0];
				if (constraint.type == 'FOREIGN_KEY') {
					foreignKey = {
						table: constraint.foreignTable,
						column: constraint.foreignColumn
					};
				}
			}

			// Create a properly typed Column object
			const column: Column = {
				name: col.column_name,
				type: col.data_type,
				isPrimaryKey,
				isNotNull,
				isUnique,
				checkString,
				foreignKey,
				sortable: true
			};

			return column;
		} catch (error) {
			console.error(`Error processing column:`, error);
			// Return a minimal valid column to avoid breaking the UI
			return {
				name: col?.column_name || 'unknown',
				type: col?.data_type || 'unknown',
				isPrimaryKey: false,
				isNotNull: false,
				isUnique: false,
				sortable: true
			};
		}
	});
}
