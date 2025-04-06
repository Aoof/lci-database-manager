import { writable } from 'svelte/store';
import { databaseStore } from '$lib/stores/databaseStore';
import type { Column, DbTable } from '$lib/types';

export interface TableState {
	selectedTable: DbTable | null;
	sortConfig: { key: string; direction: 'asc' | 'desc' | null };
	pagination: {
		currentPage: number;
		itemsPerPage: number;
		totalItems: number;
	};
}

const initialState: TableState = {
	selectedTable: null,
	sortConfig: { key: '', direction: null },
	pagination: {
		currentPage: 1,
		itemsPerPage: 10,
		totalItems: 0
	}
};

export const tableStore = writable<TableState>(initialState);

export const tableActions = {
	selectTable: async (tableName: string) => {
		try {
			const tableData = await databaseStore.getTable(tableName);
			tableStore.update((state) => ({
				...state,
				selectedTable: tableData,
				pagination: {
					...state.pagination,
					totalItems: tableData.rows.length
				}
			}));
		} catch (error) {
			console.error('Error selecting table:', error);
		}
	},

	sortTable: (key: string) => {
		tableStore.update((state) => {
			const newDirection =
				state.sortConfig.key === key
					? state.sortConfig.direction === 'asc'
						? 'desc'
						: 'asc'
					: 'asc';

			const sortedRows = [...(state.selectedTable?.rows || [])].sort((a, b) => {
				if (newDirection === 'asc') return a[key] > b[key] ? 1 : -1;
				return a[key] < b[key] ? 1 : -1;
			});

			return {
				...state,
				sortConfig: { key, direction: newDirection },
				selectedTable: state.selectedTable
					? {
							...state.selectedTable,
							rows: sortedRows
						}
					: null
			};
		});
	},

	setPagination: (page: number) => {
		tableStore.update((state) => ({
			...state,
			pagination: {
				...state.pagination,
				currentPage: page
			}
		}));
	}
};

export const currentTable = {
	subscribe: tableStore.subscribe
};
