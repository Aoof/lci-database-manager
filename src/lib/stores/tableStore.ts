import { writable, get } from 'svelte/store';
import { databaseStore } from '$lib/stores/databaseStore';
import type { DbTable, Row, TableState } from '$lib/types'; // Removed unused Column import
import { toast } from 'svelte-sonner';
import { dbCommand } from '$lib/components/db-command';

const initialState: TableState = {
	selectedTable: null,
	sortConfig: { name: '', direction: null },
	filterProps: {},
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
				toast.error(result.error ?? 'Failed to delete table'); // Use ??
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
				if (result.query) { dbCommand(result.query); }
				await tableActions.selectTable(tableName);
				return { success: true, message: result.message ?? 'Row added successfully' }; // Use ??
			} else {
				toast.error(result.error ?? 'Failed to add row'); // Use ??
				return { success: false, message: result.error ?? 'Failed to add row' }; // Use ??
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
			const dbState = get(databaseStore);
			let tableFromDbStore = dbState.tables.find(t => t.name === tableName);

			if (!tableFromDbStore) {
				console.warn(`Table ${tableName} not found in databaseStore, attempting fetch.`);
				await databaseStore.getTables();
				const updatedDbState = get(databaseStore);
				tableFromDbStore = updatedDbState.tables.find(t => t.name === tableName);
				
				// Add check after refetch attempt
				if (!tableFromDbStore) {
					throw new Error(`Table ${tableName} not found after refetch.`);
				}
			}

			let _selectedTable: DbTable = {
				name: tableName,
				columns: tableFromDbStore.columns, // Now safe to access
				rows: []
			};

			const state = get(tableStore);
			const offset = state.pagination.itemsPerPage * (state.pagination.currentPage - 1);
			const [rowsResult, countResult] = await Promise.all([
				databaseStore.getRows(tableName, state.pagination.itemsPerPage, offset),
				databaseStore.getRowsLength(tableName)
			]);

			_selectedTable.rows = rowsResult?.data as Row[] ?? [];
			let _totalItems = Number.parseInt(countResult?.data[0]?.count) || _selectedTable.rows.length; // Keep || here as fallback might be intended

			tableStore.update((currentState) => ({
				...currentState,
				selectedTable: _selectedTable,
				pagination: {
					...currentState.pagination,
					totalItems: _totalItems,
					currentPage: 1
				},
				sortConfig: { name: '', direction: null }
			}));
		} catch (error: any) {
			console.error('Error selecting table:', error);
			toast.error(error.message ?? 'Failed to select table'); 
			tableStore.update(s => ({ ...s, selectedTable: null }));
		}
	},

	sortTable: (name: string) => {
		tableStore.update((state) => {
			let newDirection: 'asc' | 'desc' = 'asc';
			if (state.sortConfig.name === name) {
				newDirection = state.sortConfig.direction === 'asc' ? 'desc' : 'asc';
			}

			const sortedRows = [...(state.selectedTable?.rows ?? [])].sort((a, b) => { 
				if (a[name] === b[name]) return 0;
				const comparison = a[name] < b[name] ? -1 : 1;
				return newDirection === 'asc' ? comparison : -comparison;
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
		tableStore.update((state) => ({
			...state,
			pagination: {
				...state.pagination,
				currentPage: page
			}
		}));

		const state = get(tableStore);
		if (state.selectedTable) {
			const offset = state.pagination.itemsPerPage * (page - 1);
			const newRows = (await databaseStore.getRows(state.selectedTable.name, state.pagination.itemsPerPage, offset))?.data as Row[] ?? []; // Use ??
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
				if (result.query) { dbCommand(result.query); }
				tableStore.update((state) => {
					const newRows = state.selectedTable ? state.selectedTable.rows.filter((row) => row.id !== rowId) : [];
					const newTotalItems = state.pagination.totalItems - 1;
					return {
						...state,
						selectedTable: state.selectedTable
							? {
									...state.selectedTable,
									rows: newRows
								}
							: null,
						pagination: {
							...state.pagination,
							totalItems: newTotalItems > 0 ? newTotalItems : 0
						}
					};
				});
				return { success: true, message: result.message };
			} else {
				toast.error(result.error ?? 'Failed to delete row'); // Use ??
				return { success: false, message: result.error ?? 'Failed to delete row' }; // Use ??
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

			// Remove any empty string values to avoid SQL type conversion issues
			const cleanedValues = { ...values };
			Object.keys(cleanedValues).forEach(key => {
				if (cleanedValues[key] === '') {
					cleanedValues[key] = null;
				}
			});

			const response = await fetch(`/api/row?table=${tableName}`, {
				method: 'PUT',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({ identifier, values: cleanedValues })
			});

			const result = await response.json();

			if (response.ok) {
				if (result.query) { dbCommand(result.query); }
				tableStore.update((state) => ({
					...state,
					selectedTable: state.selectedTable
						? {
								...state.selectedTable,
								rows: state.selectedTable.rows.map((row) =>
									row.id === rowId ? { ...row, ...cleanedValues } : row
								)
							}
						: null
				}));
				return { success: true, message: result.message };
			} else {
				const errorMessage = result.details ? `${result.error}: ${result.details}` : result.error;
				toast.error(errorMessage || 'Failed to update row');
				return { success: false, message: errorMessage || 'Failed to update row' };
			}
		} catch (error: any) {
			console.error('Error updating row:', error);
			const errorMessage = error.message || 'An error occurred while updating the row';
			toast.error(errorMessage);
			return { success: false, message: errorMessage };
		}
	}
};

export const currentTable = {
	subscribe: tableStore.subscribe
};
