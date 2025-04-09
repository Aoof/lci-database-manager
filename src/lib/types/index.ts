// Export all types from individual type files
export * from './db';

// Define common database-related interfaces
export interface Column {
  key: string; // Key matching the property in the row data
  name: string; // Display name for the header
  type: string; // Data type (for potential formatting)
  sortable?: boolean; // Flag if the column can be sorted
  isPrimaryKey?: boolean; 
  foreignKey?: { table: string; column: string }
}

export interface Row {
  id: number;
  [key: string]: any; // Allow other properties
}

export interface DbTable {
  name: string;
  columns: Column[];
  rows: Row[];
}