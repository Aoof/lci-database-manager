import { writable } from 'svelte/store';
import { toast } from 'svelte-sonner';
import { DbCommand } from '$lib/components/db-command';
import type { Column } from '$lib/types';

// Loading state store
export const isLoading = writable<boolean>(false);

// Database operations for table management
export const databaseOperations = {
    // Create a new table
    async createTable(tableName: string, columns: Column[]) {
        isLoading.set(true);
        try {
            const response = await fetch(`/api/table?table=${tableName}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ columns })
            });

            const result = await response.json();
            isLoading.set(false);

            if (response.ok) {
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
                return { success: true, message: result.message };
            } else {
                return { success: false, message: result.error || 'Failed to create table' };
            }
        } catch (error) {
            isLoading.set(false);
            console.error('Error creating table:', error);
            return { success: false, message: 'An error occurred while creating the table' };
        }
    },

    // Update an existing table
    async updateTable(tableName: string, columns: Column[]) {
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
            const existingColumns = existingColumnsData.data.length > 0 
                ? existingColumnsData.data.map((row : any) => { console.log(row.column_name); return row.column_name; })
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
                if (!columns.some(col => col.name === existingCol)) {
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
                    toast(DbCommand, {
                        duration: 5000,
                        componentProps: {
                            code: result.query,
                            title: 'SQL Query',
                            language:'sql'
                        } 
                    })
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