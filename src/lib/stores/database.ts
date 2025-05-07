import { writable } from 'svelte/store';
import { dbCommand } from '$lib/components/db-command';
import type { Column, ConstraintPayload } from '$lib/types';

// Loading state store
export const isLoading = writable<boolean>(false);

const getTableBody = (columns: Column[]) => {
	return columns.map((column) => {
		return {
			name: column.name,
			type: column.type
		};
	});
};

const getConstraintsBody = (columns: Column[]) => {
	let constraintBody : ConstraintPayload = { constraints: [] };
	let constraints_str : string[] = [];

	for (const column of columns) {
		if (column.isPrimaryKey && !constraints_str.includes("PRIMARY_KEY")) {
			constraintBody.constraints.push({
				type: 'PRIMARY_KEY',
				columns: [column.name]
			});

			constraints_str.push("PRIMARY_KEY");
		} else if (column.isPrimaryKey)
		{
			constraintBody.constraints
			.filter(val => val.type == "PRIMARY_KEY")[0]
			.columns.push(column.name);
		}

		if (column.isNotNull && !constraints_str.includes("NOT_NULL")) {
			constraintBody.constraints.push({
				type: 'NOT_NULL',
				columns: [column.name]
			});
			constraints_str.push("NOT_NULL");
		} else if (column.isNotNull)
		{
			constraintBody.constraints
			.filter(val => val.type == "NOT_NULL")[0]
			.columns.push(column.name);
		}

		if (column.isUnique) {
			constraintBody.constraints.push({
				type: 'UNIQUE',
				column: column.name
			});
		}

		if (column.checkString) {
			constraintBody.constraints.push({
				type: 'CHECK',
				checkString: column.checkString
			});
		}

		if (column.foreignKey) {
			constraintBody.constraints.push({
				type: 'FOREIGN_KEY',
				column: column.name,
				foreignTable: column.foreignKey.table,
				foreignColumn: column.foreignKey.column
			});
		}
	}

	return constraintBody;
};

// Database operations for table management
export const databaseOperations = {
	// Create a new table
	async createTable(tableName: string, columns: Column[]) {
		return { success: false, message: 'This action is disabled to maintain data integrity in the demo version.' };
		// isLoading.set(true);
		// try {
		// 	const response = await fetch(`/api/table?table=${tableName}`, {
		// 		method: 'POST',
		// 		headers: {
		// 			'Content-Type': 'application/json'
		// 		},
		// 		body: JSON.stringify({ columns: getTableBody(columns) })
		// 	});

		// 	const result = await response.json();
		// 	isLoading.set(false);

		// 	if (response.ok) {
		// 		const constraintResponse = await fetch(`/api/constraint?table=${tableName}`, {
		// 			method: 'POST',
		// 			headers: {
		// 				'Content-Type': 'application/json'
		// 			},
		// 			body: JSON.stringify(getConstraintsBody(columns))
		// 		})

		// 		const constraintResult = await constraintResponse.json();
		// 		if (!constraintResponse.ok) {
		// 			isLoading.set(false);
		// 			return { success: false, message: constraintResult.error || 'Failed to create constraints' };
		// 		}

		// 		// Show the SQL query using the DbCommand component
		// 		if (result.query) {
		// 			dbCommand(result.query);
		// 		}

		// 		if (constraintResult.query) {
		// 			dbCommand(constraintResult.query);
		// 		}

		// 		return { success: true, message: result.message };
		// 	} else {
		// 		return { success: false, message: result.error || 'Failed to create table' };
		// 	}
		// } catch (error) {
		// 	isLoading.set(false);
		// 	console.error('Error creating table:', error);
		// 	return { success: false, message: 'An error occurred while creating the table' };
		// }
	},

	// Update an existing table
	async updateTable(tableName: string, columns: Column[]) {
		return { success: false, message: 'This action is disabled to maintain data integrity in the demo version.' };
		isLoading.set(true);
		try {
			// Convert columns to the format expected by the API
			const existingColumnsResponse = await fetch(`/api/table?table=${tableName}`);
			const existingColumnsData = await existingColumnsResponse.json();

			if (!existingColumnsResponse.ok) {
				isLoading.set(false);
				return { success: false, message: 'Failed to fetch existing columns' };
			}

			// Get existing column names from the first row of data
			const existingColumns =
				existingColumnsData.data.length > 0
					? existingColumnsData.data.map((row: any) => {
							return row.column_name;
						})
					: [];

			// Determine changes to make
			const changes = [];

			// Add new columns
			for (const column of columns) {
				if (!existingColumns.includes(column.name)) {
					changes.push({
						action: 'ADD',
						column: column.name,
						type: column.type
					});
				} else {
					const existingColumn = existingColumnsData.data[0][column.name];
					if (existingColumn !== column.type) {
						changes.push({
							action: 'MODIFY',
							column: column.name,
							type: column.type
						});
					}
				}
			}

			// Drop columns that no longer exist
			for (const existingCol of existingColumns) {
				if (!columns.some((col) => col.name === existingCol)) {
					changes.push({
						action: 'DROP',
						column: existingCol
					});
				}
			}

			// If no changes, return success
			if (changes.length === 0) {
				isLoading.set(false);
				return { success: true, message: 'No changes needed' };
			}

			// Send update request
			const response = await fetch(`/api/table?table=${tableName}`, {
				method: 'PUT',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({ changes })
			});

			const result = await response.json();
			isLoading.set(false);

			if (response.ok) {
				// Show the SQL query using the DbCommand component
				if (result.query) {
					dbCommand(result.query);
				}
				return { success: true, message: result.message };
			} else {
				return { success: false, message: result.error || 'Failed to update table' };
			}
		} catch (error) {
			isLoading.set(false);
			console.error('Error updating table:', error);
			return { success: false, message: 'An error occurred while updating the table' };
		}
	}
};
