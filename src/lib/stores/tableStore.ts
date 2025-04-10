import { writable, get } from 'svelte/store';
import { databaseStore } from '$lib/stores/databaseStore';
import type { Column, DbTable, Row, TableState } from '$lib/types';
import { toast } from 'svelte-sonner';
import { dbCommand } from '$lib/components/db-command';

const initialState: TableState = {
	selectedTable: null,
	sortConfig: { name: '', direction: null },
	filterProps: {
	},
	pagination: {
		currentPage: 1,
		itemsPerPage: 10,
		totalItems: 0
	}
};

export const tableStore = writable<TableState>(initialState);

export const tableActions = {
	deleteTable: async (tableName: string) => {
		try {
			const response = await fetch(`/api/table?table=${tableName}`, {
				method: 'DELETE'
			});

			const result = await response.json();

			if (response.ok) {
				if (result.query) { dbCommand(result.query); }

				databaseStore.getTables();
				tableActions.unSelectTable();
			} else {
				toast.error(result.error || 'Failed to delete table');
			}
		} catch (error) {
			console.error('Error deleting table:', error);
			toast.error('An error occurred while deleting the table');
		}
	},

	addRow: async (values: Record<string, any>) => {
		try {
			const state = get(tableStore);
			if (!state.selectedTable) {
				throw new Error('No table selected');
			}

			const tableName = state.selectedTable.name;

			const response = await fetch(`/api/row?table=${tableName}`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({ values })
			});

			const result = await response.json();

			if (response.ok) {
				// Show the SQL query using the DbCommand component
				if (result.query) { dbCommand(result.query); }

				// Refresh the table data to include the new row
				await tableActions.selectTable(tableName);

				return { success: true, message: result.message || 'Row added successfully' };
			} else {
				toast.error(result.error || 'Failed to add row');
				return { success: false, message: result.error || 'Failed to add row' };
			}
		} catch (error) {
			console.error('Error adding row:', error);
			toast.error('An error occurred while adding the row');
			return { success: false, message: 'An error occurred while adding the row' };
		}
	},
	unSelectTable: () => tableStore.update((_) => initialState),
	selectTable: async (tableName: string) => {
		try {
			let _selectedTable : DbTable = {
				name: tableName,
				columns: [],
				rows: []	
			}
			const tableData = await databaseStore.getTable(tableName);
			_selectedTable.name = tableName;

			let _columns : Column[] = [];
			for (const element of tableData.data) {
				_columns.push({
					name: element.column_name,
					type: element.data_type,
					sortable: true
				})
			}
			_selectedTable.columns = _columns;

			const state = get(tableStore);
			const offset = state.pagination.itemsPerPage * (state.pagination.currentPage - 1);
			_selectedTable.rows = (await databaseStore.getRows(tableName, state.pagination.itemsPerPage, offset))?.data as Row[];

			let _totalItems = Number.parseInt((await databaseStore.getRowsLength(tableName))?.data[0]?.count) || _selectedTable.rows.length;

			tableStore.update((state) => ({
				...state,
				selectedTable: _selectedTable,
				pagination: {
					...state.pagination,
					totalItems: _totalItems
				}
			}));
		} catch (error) {
			console.error('Error selecting table:', error);
		}
	},
	sortTable: (name: string) => {
		tableStore.update((state) => {
			const newDirection =
				state.sortConfig.name === name
					? state.sortConfig.direction === 'asc'
						? 'desc'
						: 'asc'
					: 'asc';

			const sortedRows = [...(state.selectedTable?.rows || [])].sort((a, b) => {
				if (newDirection === 'asc') return a[name] > b[name] ? 1 : -1;
				return a[name] < b[name] ? 1 : -1;
			});

			return {
				...state,
				sortConfig: { name, direction: newDirection },
				selectedTable: state.selectedTable
					? {
							...state.selectedTable,
							rows: sortedRows
						}
					: null
			};
		});
	},

	setPagination: async (page: number) => {
		console.log('setPagination', page);
		tableStore.update((state) => ({
			...state,
			pagination: {
				...state.pagination,
				currentPage: page
			}
		}));

		// Fetch new data with updated pagination
		const state = get(tableStore);
		if (state.selectedTable) {
			const offset = state.pagination.itemsPerPage * (page - 1);
			const newRows = (await databaseStore.getRows(state.selectedTable.name, state.pagination.itemsPerPage, offset))?.data as Row[];
			tableStore.update((state) => ({
				...state,
				selectedTable: state.selectedTable ? {
					...state.selectedTable,
					rows: newRows
				} : null
			}));
		}
	},

	deleteRow: async (rowId: number) => {
		try {
			const state = get(tableStore);
			if (!state.selectedTable) {
				throw new Error('No table selected');
			}

			const tableName = state.selectedTable.name;
			const identifier = { id: rowId };

			const response = await fetch(`/api/row?table=${tableName}`, {
				method: 'DELETE',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify(identifier)
			});

			const result = await response.json();

			if (response.ok) {
				// Show the SQL query using the DbCommand component
				if (result.query) { dbCommand(result.query); }

				// Update the table data by removing the deleted row
				tableStore.update((state) => ({
					...state,
					selectedTable: state.selectedTable
						? {
								...state.selectedTable,
								rows: state.selectedTable.rows.filter((row) => row.id !== rowId)
							}
						: null,
					pagination: {
						...state.pagination,
						totalItems: state.selectedTable ? state.selectedTable.rows.length - 1 : 0
					}
				}));

				return { success: true, message: result.message };
			} else {
				toast.error(result.error || 'Failed to delete row');
				return { success: false, message: result.error || 'Failed to delete row' };
			}
		} catch (error) {
			console.error('Error deleting row:', error);
			toast.error('An error occurred while deleting the row');
			return { success: false, message: 'An error occurred while deleting the row' };
		}
	},

	updateRow: async (rowId: number, values: Record<string, any>) => {
		try {
			const state = get(tableStore);
			if (!state.selectedTable) {
				throw new Error('No table selected');
			}

			const tableName = state.selectedTable.name;
			const identifier = { id: rowId };

			const response = await fetch(`/api/row?table=${tableName}`, {
				method: 'PUT',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({ identifier, values })
			});

			const result = await response.json();

			if (response.ok) {
				// Show the SQL query using the DbCommand component
				if (result.query) { dbCommand(result.query); }

				// Update the table data by updating the modified row
				tableStore.update((state) => ({
					...state,
					selectedTable: state.selectedTable
						? {
								...state.selectedTable,
								rows: state.selectedTable.rows.map((row) =>
									row.id === rowId ? { ...row, ...values } : row
								)
							}
						: null
				}));

				return { success: true, message: result.message };
			} else {
				toast.error(result.error || 'Failed to update row');
				return { success: false, message: result.error || 'Failed to update row' };
			}
		} catch (error) {
			console.error('Error updating row:', error);
			toast.error('An error occurred while updating the row');
			return { success: false, message: 'An error occurred while updating the row' };
		}
	}
};

export const currentTable = {
	subscribe: tableStore.subscribe
};
