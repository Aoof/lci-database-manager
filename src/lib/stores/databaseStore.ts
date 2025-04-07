import { writable } from 'svelte/store';
import { toast } from 'svelte-sonner';
import { DbCommand } from '$lib/components/db-command';

export interface DatabaseState {
	tables: string[];
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

			database.update((state) => ({ ...state, tables: result.data.map((table: { table_name: string }) => table.table_name), isLoading: false }));

			// Show the SQL query using the DbCommand component
			if (result.query) {
                toast(DbCommand, {
                    duration: 5000,
                    componentProps: {
                        code: result.query,
                        title: 'SQL Query',
                        language:'sql'
                    }
                })
			}
		} catch (error) {
			database.update((state) => ({ ...state, error: 'Failed to load tables', isLoading: false }));
		}
	},
	async getTable(name: string) {
		database.update((state) => ({ ...state, isLoading: true }));
		try {
			const response = await fetch(`/api/table?table=${name}`);
			const result = await response.json();

			// Show the SQL query using the DbCommand component
			if (result.query) {
                toast(DbCommand, {
                    duration: 5000,
                    componentProps: {
                        code: result.query,
                        title: 'SQL Query',
                        language:'sql'
                    }
                })
            }

			return result;
		} catch (error) {
			database.update((state) => ({
				...state,
				error: 'Failed to load table data',
				isLoading: false
			}));
			return null;
		}
	}
};
