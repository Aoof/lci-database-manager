import { writable } from 'svelte/store';
import { toast } from 'svelte-sonner';
import { DbCommand } from '$lib/components/db-command';
import axios from 'axios';

export const sqlQuery = writable('');

export const sqlResult = writable({
  columns: [],
  rows: [],
  error: null,
  loading: false,
  message: '',
});

// Tables store
export const tables = writable<Array<{ name: string; columns: Array<{ name: string; type: string }> }>>([]);

// Loading state
export const isLoading = writable(false);

// Last executed query for display purposes
export const lastQuery = writable('');

// Database operations
export const databaseOperations = {
  // Create a new table
  async createTable(tableName: string, columns: Array<{ name: string; type: string }>) {
    isLoading.set(true);
    
    try {
      const { data } = await axios.post('/?/api/tables', {
        name: tableName,
        columns
      });

      // Update tables store
      tables.update(current => [...current, { name: tableName, columns }]);

      // Store the SQL query for display
      if (data.query) {
        lastQuery.set(data.query);

        // Show SQL command in toast
        toast.custom(DbCommand, { 
          componentProps: {
            code: data.query,
            title: 'Table Created'
          }, 
          duration: 5000 
        });
      }

      return { success: true };
    } catch (error) {
      toast.error(axios.isAxiosError(error) 
        ? error.response?.data?.message || 'Failed to create table' 
        : 'Failed to create table'
      );
      return { success: false, error };
    } finally {
      isLoading.set(false);
    }
  },

  // Update an existing table
  async updateTable(tableName: string, columns: Array<{ name: string; type: string }>) {
    isLoading.set(true);

    try {
      const { data } = await axios.put(`/?/api/tables/${tableName}`, {
        columns
      });

      // Update tables store
      tables.update(current => 
        current.map(table => 
          table.name === tableName 
            ? { name: tableName, columns } 
            : table
        )
      );

      // Store the SQL query for display
      if (data.query) {
        lastQuery.set(data.query);

        // Show SQL command in toast
        toast.custom(DbCommand, { 
          componentProps: {
            code: data.query,
            title: 'Table Modified'
          }, 
          duration: 5000 
        });
      }

      return { success: true };
    } catch (error) {
      toast.error(axios.isAxiosError(error) 
        ? error.response?.data?.message || 'Failed to update table' 
        : 'Failed to update table'
      );
      return { success: false, error };
    } finally {
      isLoading.set(false);
    }
  },

  // Load all tables
  async loadTables() {
    isLoading.set(true);

    try {
      const { data } = await axios.get('/?/api/tables');
      tables.set(data);
      return data;
    } catch (error) {
      toast.error(axios.isAxiosError(error) 
        ? error.response?.data?.message || 'Failed to load tables' 
        : 'Failed to load tables'
      );
      return [];
    } finally {
      isLoading.set(false);
    }
  }
};
