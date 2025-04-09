<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import * as Select from '$lib/components/ui/select';
	import * as Dialog from '$lib/components/ui/dialog';
	import * as AlertDialog from '$lib/components/ui/alert-dialog';
	import { Label } from '$lib/components/ui/label';
	import { Input } from '$lib/components/ui/input';
	import { toast } from 'svelte-sonner';
	import { PlusCircled, Trash } from 'svelte-radix';
	import type { Selected } from 'bits-ui';
	import { databaseOperations, isLoading } from '$lib/stores/database';
	import { databaseStore } from '$lib/stores/databaseStore';
	import { tableStore, tableActions } from '$lib/stores/tableStore';
	import { onMount } from 'svelte';
	import { ColumnTypes } from '$lib/lib/utils';
	import type { Column } from '$lib/types';

	export let tableName: string = '';
	export let columns: Column[] = [];
	export let disabled: boolean = false;

	// This is now just a callback for component users that need to know when a table is added/updated
	// The actual implementation uses the store system directly
	export let onAddTable: (
		name: string,
		columns: Array<{ name: string; type: string }>
	) => void = () => {};

	// Reset component state when dialog is closed
	export let onClose: () => void = () => { 
		resetState();
	};

	export let isOpen: boolean = false;
	export let editTable: boolean = false;

	// Function to reset the component state
	function resetState() {
		columns = [];
		tableName = '';
		columnName = '';
		_selectedColumnType = { value: '' };
		isOpen = false;
	}

	let dialogTitle: string = 'Add Table';
	let dialogDescription: string = 'Fill in the details for the new table.';
	let buttonText: string = 'Save Table';

	let columnName: string = '';
	let columnType: string = '';

	let selectedFkTable: Selected<string> = { value: '' };
	let selectedFkColumn: Selected<string> = { value: '' };
	let availableFkColumns: Array<{ name: string; type: string }> = [];
	let showFkDialog: boolean = false;
	let currentColumnForFk: string = '';
	let _selectedColumnType: Selected<string> = { value: '' };

	$: tableName = tableName.replaceAll(' ', '_');
	$: columnName = columnName.replaceAll(' ', '_');
	$: columnType = _selectedColumnType.value;

    // Validates table name
    function validateTableName(name: string): { valid: boolean; message?: string } {
        if (!name.trim()) {
            return { valid: false, message: 'Table name is required' };
        }
        // Check for valid identifier (letters, numbers, underscores, starting with letter)
        if (!/^[a-zA-Z][a-zA-Z0-9_]*$/.test(name)) {
            return { 
                valid: false, 
                message: 'Table name must start with a letter and contain only letters, numbers, and underscores' 
            };
        }

        return { valid: true };
    }

    // Validates column name and its uniqueness
    function validateColumn(name: string, type: string): { valid: boolean; message?: string } {
        if (!name.trim()) {
            return { valid: false, message: 'Column name is required' };
        }

        if (!type) {
            return { valid: false, message: 'Column type is required' };
        }

        // Check for valid identifier (letters, numbers, underscores, starting with letter)
        if (!/^[a-zA-Z][a-zA-Z0-9_]*$/.test(name)) {
            return { 
                valid: false, 
                message: 'Column name must start with a letter and contain only letters, numbers, and underscores' 
            };
        }

        // Check for duplicate column name
        if (columns.some(col => col.name.toLowerCase() === name.toLowerCase())) {
            return { valid: false, message: `Column "${name}" already exists` };
        }

        return { valid: true };
    }

    // Add a column with validation
    function addColumn() {
        const validation = validateColumn(columnName, columnType);
        
        if (!validation.valid) {
            toast.error(validation.message ?? 'Invalid column');
            return;
        }
        
        const colName = columnName; // Store column name before clearing it
		columns = [...columns, { key: colName, name: colName, type: columnType, isPrimaryKey: false, foreignKey: undefined }];
        columnName = '';
        _selectedColumnType = { value: '' };
        toast.success(`Column "${colName}" added successfully`);
    }

    onMount(() => {
        // Initialize the component based on whether we're editing or creating
        updateDialogState();
    });
    
    // Function to update dialog state based on editTable flag
    function updateDialogState() {
        dialogTitle = editTable ? 'Edit Table' : 'Add Table';
        dialogDescription = editTable 
            ? 'Modify the details for this table.'
            : 'Fill in the details for the new table.';
        buttonText = editTable ? 'Update Table' : 'Save Table';
        
        // If we're editing a table, ensure we have the correct column format
        if (editTable && tableName) {
            // Convert columns to the expected format if they're from the store
            // Store columns have key, name, type, sortable, and constraint properties
            // We need name, type, and constraint information for our dialog
            columns = columns.map((col) => ({
				key: col.name ?? '',
                name: col.name ?? '',
                type: col.type ?? '',

				isPrimaryKey: col.isPrimaryKey?? false,
                foreignKey: col.foreignKey?? undefined
            }));
        }
    }

	$: if (isOpen) {
		// When dialog opens, update its state based on mode
		updateDialogState();

		// If creating a new table, reset the form
		if (!editTable) {
			columns = [];
			tableName = '';
			_selectedColumnType = { value: '' };
		}
	}

	async function handleSaveTable() {
		if (!tableName || columns.length === 0) {
            toast.error('Please provide table name and at least one column');
            return;
        }
        
        const tableValidation = validateTableName(tableName);
        if (!tableValidation.valid) {
            toast.error(tableValidation.message ?? 'Invalid table name');
            return;
        }
			
		let result;
		
		if (editTable) {
			result = await databaseOperations.updateTable(tableName, columns);
		} else {
			result = await databaseOperations.createTable(tableName, columns);
		}
		
		if (result.success) {
			// Refresh the tables list after successful operation
			await databaseStore.getTables();
			
			// If editing, refresh the selected table data
			if (editTable && $tableStore.selectedTable) {
				await tableActions.selectTable(tableName);
			}
			
			// Call the callback if provided (for backward compatibility)
			if (onAddTable) {
				onAddTable(tableName, columns);
			}
			
			// Reset state and close dialog
			resetState();
		} else {
			toast.error(result.message || `Failed to ${editTable ? 'update' : 'create'} table`);
		}
	}
</script>

<Dialog.Root bind:open={isOpen} onOpenChange={(open) => {
		if (!open) { onClose(); }
	}}>
	<Dialog.Trigger asChild let:builder>
		<Button variant={editTable ? "outline" : "secondary"} builders={[builder]} disabled={disabled}>{dialogTitle}</Button>
	</Dialog.Trigger>
	<Dialog.Content>
		<Dialog.Header>
			<Dialog.Title>{dialogTitle}</Dialog.Title>
			<Dialog.Description>{dialogDescription}</Dialog.Description>
		</Dialog.Header>
		<AlertDialog.Root bind:open={showFkDialog}>
			<AlertDialog.Content>
				<AlertDialog.Header>
					<AlertDialog.Title>Select Foreign Key Reference</AlertDialog.Title>
					<AlertDialog.Description>
						Select the table and column this foreign key should reference.
					</AlertDialog.Description>
				</AlertDialog.Header>
				<div class="grid gap-4 py-4">
					<div class="grid grid-cols-4 items-center gap-4">
						<Label for="fk-table" class="text-right">Reference Table:</Label>
						<div class="col-span-3">
							<Select.Root bind:selected={selectedFkTable} onSelectedChange={(selected) => {
								if (selected?.value) {
									const table = $databaseStore.tables.find(t => t.name === selected.value);
									availableFkColumns = table?.columns ?? [];
								}
							}}>
								<Select.Trigger class="w-full" id="fk-table">
									<Select.Value placeholder="Select Table" />
								</Select.Trigger>
								<Select.Content>
									<Select.Label>Available Tables</Select.Label>
									{#each $databaseStore.tables as table}
										<Select.Item value={table.name} class="cursor-pointer">
											{table.name}
										</Select.Item>
									{/each}
								</Select.Content>
							</Select.Root>
						</div>
					</div>
					<div class="grid grid-cols-4 items-center gap-4">
						<Label for="fk-column" class="text-right">Reference Column:</Label>
						<div class="col-span-3">
							<Select.Root bind:selected={selectedFkColumn}>
								<Select.Trigger class="w-full" id="fk-column">
									<Select.Value placeholder="Select Column" />
								</Select.Trigger>
								<Select.Content>
									<Select.Label>Available Columns</Select.Label>
									{#each availableFkColumns as column}
										<Select.Item value={column.name} class="cursor-pointer">
											{column.name}
										</Select.Item>
									{/each}
								</Select.Content>
							</Select.Root>
						</div>
					</div>
				</div>
				<AlertDialog.Footer>
					<AlertDialog.Cancel>Cancel</AlertDialog.Cancel>
					<AlertDialog.Action on:click={() => {
						if (selectedFkTable.value && selectedFkColumn.value) {
							columns = columns.map(col => {
								if (col.name === currentColumnForFk) {
									return {
										...col,
										foreignKey: {
											table: selectedFkTable.value,
											column: selectedFkColumn.value
										}
									};
								}
								return col;
							});
							showFkDialog = false;
							selectedFkTable = { value: '' };
							selectedFkColumn = { value: '' };
							availableFkColumns = [];
						}
					}}>Confirm</AlertDialog.Action>
				</AlertDialog.Footer>
			</AlertDialog.Content>
		</AlertDialog.Root>
		<div class="grid gap-4 py-4">
			<div class="grid grid-cols-4 items-center gap-4">
				<Label for="table-name" class="text-right">
					Table Name:
					{#if !tableName}
						<span class="text-red-500">*</span>
					{/if}
				</Label>
				<Input 
					placeholder="Table Name" 
					class="col-span-3" 
					id="table-name" 
					bind:value={tableName} 
					disabled={editTable}
					readonly={editTable}
				/>
			</div>
			<div class="py-2">
				<h4 class="mb-2 font-medium">Columns Section:</h4>
				<p class="text-muted-foreground text-sm">
					Click the plus icon to add a new column. You can remove a column by clicking the trash icon next to it.
				</p>
			</div>
			<div class="grid grid-cols-4 items-center gap-4">
				<Label for="column-name" class="text-right">
					Column Name:
					{#if !columnName}
						<span class="text-red-500">*</span>
					{/if}
				</Label>
				<Input
					placeholder="Column Name"
					class="col-span-3"
					id="column-name"
					bind:value={columnName}
				/>
			</div>
			<div class="grid grid-cols-4 items-center gap-4">
				<Label for="column-type" class="text-right">
					Column Type:
					{#if !(_selectedColumnType.value)}
						<span class="text-red-500">*</span>
					{/if}
				</Label>
				<div class="col-span-3">
					<Select.Root bind:selected={_selectedColumnType}>
						<Select.Trigger class="w-full" id="column-type">
							<Select.Value placeholder="Select Column Type" />
						</Select.Trigger>
						<Select.Content>
							<Select.Label>Column Types</Select.Label>
							{#each ColumnTypes as type (type.type)}
								<Select.Item value={type.type} class="cursor-pointer">
									{type.name}
								</Select.Item>
							{/each}
						</Select.Content>
					</Select.Root>
				</div>
			</div>
			<div class="mt-4">
				<div class="flex items-center justify-between">
					<h4 class="mb-2 font-medium">Added Columns:</h4>
					<div class="flex items-center gap-2">
						<Button
							variant="ghost"
							size="icon"
							class="h-8 w-8 hover:bg-primary/10 hover:text-primary"
							on:click={() => {
								if (columnName && columnType) {
									addColumn();
								} else {
									toast.error('Please provide column name and type');
								}
							}}
						>
							<PlusCircled class="h-4 w-4" />
						</Button>
					</div>
				</div>
				{#if columns.length > 0}
					<ul class="space-y-1 my-2 overflow-y-auto h-[200px]">
						{#each columns as column}
							<li class="flex items-center justify-between gap-2 rounded-md border p-3 transition-colors hover:bg-background/80">
								<div class="flex flex-col">
									<span class="font-medium">{column.name}</span>
									<span class="text-xs text-muted-foreground capitalize">{column.type}</span>
								</div>
								<div class="flex justify-end gap-2">
									<Button variant="ghost" size="icon" 
										class={`h-8 w-8 ${column.isPrimaryKey ? "bg-chart-2/80" : "bg-chart-2/10"} hover:bg-chart-2/60`} 
										on:click={() => {
											columns = columns.map(col => {
												if (col.name === column.name) {
													return { ...col, isPrimaryKey: !col.isPrimaryKey };
												}
												return col;
											});
										}}>
										PK
									</Button>
									<Button variant="ghost" size="icon" 
											class={`h-8 w-8 ${column.foreignKey ? "bg-chart-3/80" : "bg-chart-3/10"} hover:bg-chart-3/60`} 
											on:click={() => {
												if (column.foreignKey) {
													columns = columns.map(col => {
														if (col.name === column.name) {
															return { ...col, foreignKey: undefined };
														}
														return col;
													});
												} else {
													currentColumnForFk = column.name;
													showFkDialog = true;
												}
											}}>
											FK
										</Button>
									<Button
										variant="ghost"
										size="icon"
										class="h-8 w-8 hover:bg-destructive/10 hover:text-destructive"
										on:click={() => {
											columns = columns.filter((c) => c.name !== column.name);
											toast.success(`Column '${column.name}' removed`);
										}}
										aria-label="Remove column"
									>
										<Trash class="h-4 w-4" />
									</Button>
								</div>
							</li>
						{/each}
					</ul>
				{:else}
					<div class="text-muted-foreground">No columns added yet.</div>
				{/if}
			</div>
		</div>
		<Dialog.Footer class="flex justify-between">
			<div class="flex gap-2">
				<Button variant="secondary" on:click={handleSaveTable} disabled={$isLoading}>
					{$isLoading ? 'Processing...' : buttonText}
				</Button>
			</div>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>
