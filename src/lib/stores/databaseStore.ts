import { writable } from 'svelte/store';
import { toast } from 'svelte-sonner';
import { dbCommand } from '$lib/components/db-command';
import type { Column, Row } from '$lib/types';

export interface DatabaseState {
	tables: {
		name: string;
		columns: {
			name: string;
			type: string;
		}[];
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

export const databaseStore = {
	subscribe: database.subscribe,
	async getTables() {
		database.update((state) => ({ ...state, isLoading: true }));
		try {
			const response = await fetch('/api/table?table=all');
			const result = await response.json();
			
			let _tables = [];

			for (const { table_name } of result.data) {
				let _columns = [];

				const tableData = await databaseStore.getTable(table_name);

				for (const { column_name, data_type } of tableData.data) {
					_columns.push({
						name: column_name,
						type: data_type
					});
				}

				_tables.push({
					name: table_name,
					columns: _columns
				});
			}

			database.update((state) => ({ ...state, tables: _tables, isLoading: false }));

			// Show the SQL query using the DbCommand component
			if (result.query) { dbCommand(result.query) }
		} catch (error) {
			database.update((state) => ({ ...state, error: 'Failed to load tables', isLoading: false }));
		}
	},
	async getTable(name: string) {
		database.update((state) => ({ ...state, isLoading: true }));
		try {
			const response = await fetch(`/api/table?table=${name}`);
			const result = await response.json();

			return result;
		} catch (error) {
			database.update((state) => ({
				...state,
				error: 'Failed to load table data',
				isLoading: false
			}));
			return null;
		}
	},
	async getRowsLength(name: string) {
		database.update((state) => ({...state, isLoading: true }));
		try {
			const response = await fetch(`/api/row?table=${name}&count=true`);
			const result = await response.json();	

			return result;
		} catch (error) {
			database.update((state) => ({
				...state,
				error: 'Failed to load table data',
				isLoading: false
			}));	
		}
	},
	async getRows(name: string, limit: number = 10, offset: number = 0) {
		database.update((state) => ({...state, isLoading: true }));
		try {
			const response = await fetch(`/api/row?table=${name}&limit=${limit}&offset=${offset}`);
			const result = await response.json();

			// Show the SQL query using the DbCommand component
			if (result.query) { dbCommand(result.query); }

			return result;
		} catch (error) {
			database.update((state) => ({
				...state,
				error: 'Failed to load table data',
				isLoading: false
			}));
		}
	}
};
