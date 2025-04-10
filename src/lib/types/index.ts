// Export all types from individual type files
export * from './db';

// Define common database-related interfaces
export interface Column {
  name: string; // Display name for the header
  type: string; // Data type (for potential formatting)
  sortable?: boolean; // Flag if the column can be sorted
  isPrimaryKey?: boolean; 
  isNotNull?: boolean;
  isUnique?: boolean;
  checkString?: string;
  foreignKey?: { table: string; column: string }
}

export interface Row {
  [key: string]: any; // Allow other properties
}

export interface DbTable {
  name: string;
  columns: Column[];
  rows: Row[];
}

export interface TableState {
	selectedTable: DbTable | null;
	sortConfig: { name: string; direction: 'asc' | 'desc' | null };
	filterProps: {
		[key: string]: string;
	},
	pagination: {
		currentPage: number;
		itemsPerPage: number;
		totalItems: number;
	};
}
