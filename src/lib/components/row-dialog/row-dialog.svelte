<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import * as Dialog from '$lib/components/ui/dialog';
	import * as Select from '$lib/components/ui/select';
	import * as Tooltip from '$lib/components/ui/tooltip';
	import { Label } from '$lib/components/ui/label';
	import { Input } from '$lib/components/ui/input';
	import { toast } from 'svelte-sonner';
	import { PlusCircled } from 'svelte-radix';
	import { tableStore, tableActions } from '$lib/stores/tableStore';
	import { databaseStore } from '$lib/stores/databaseStore';
	import type { Column, Row } from '$lib/types';
	import { ColumnTypes } from '$lib/lib/utils';
	import { onMount } from 'svelte';

	// Props
	export let isOpen: boolean = false;
	export let editMode: boolean = false;
	export let rowData: Row | null = null;
	export let hideButton: boolean = false;

	// Dialog state
	let dialogTitle: string = 'Add Row';
	let dialogDescription: string = 'Fill in the details for the new row.';
	let buttonText: string = 'Save Row';
	let formValues: Record<string, any> = {};

	// Foreign key reference data
	let foreignKeyData: Record<string, { table: string; column: string; options: any[] }> = {};

	// Reset component state when dialog is closed
	export let onClose: () => void = () => {
		resetState();
	};

	// Function to reset the component state
	function resetState() {
		formValues = {};
		foreignKeyData = {};
		isOpen = false;
	}

	// Fetch foreign key reference data
	async function fetchForeignKeyData() {
		if (!$tableStore.selectedTable) return;

		for (const column of $tableStore.selectedTable.columns) {
			if (column.foreignKey) {
				const { table: fkTable, column: fkColumn } = column.foreignKey;
				
				try {
					const response = await fetch(`/api/row?table=${fkTable}`);
					if (response.ok) {
						const result = await response.json();
						foreignKeyData[column.name] = {
							table: fkTable,
							column: fkColumn,
							options: result.data || []
						};
					}
				} catch (error) {
					console.error(`Error fetching foreign key data for ${fkTable}.${fkColumn}:`, error);
				}
			}
		}
	}

	// Update dialog state based on mode
	async function updateDialogState() {
		dialogTitle = editMode ? 'Edit Row' : 'Add Row';
		dialogDescription = editMode
			? 'Modify the details for this row.'
			: 'Fill in the details for the new row.';
		buttonText = editMode ? 'Update Row' : 'Save Row';

		// If editing, populate form with row data
		if (editMode && rowData) {
			formValues = { ...rowData };
			// Remove the id field as it shouldn't be editable
			delete formValues.id;
		} else {
			// Initialize empty form values for each column
			formValues = {};
			if ($tableStore.selectedTable) {
				$tableStore.selectedTable.columns.forEach((column) => {
					// Skip id column for new rows
					if (column.name !== 'id') {
						formValues[column.name] = '';
					}
				});
			}
		}

		// Fetch foreign key data when the dialog opens
		await fetchForeignKeyData();
	}

	// Update dialog state when isOpen changes
	$: if (isOpen) {
		updateDialogState();
	}

	// Get the appropriate input type based on column data type
	function getInputType(columnType: string): string {
		switch (columnType.toLowerCase()) {
			case 'serial':
			case 'integer':
			case 'decimal':
				return 'number';
			case 'date':
				return 'date';
			case 'timestamp':
				return 'datetime-local';
			case 'boolean':
				return 'checkbox';
			default:
				return 'text';
		}
	}

	// Check if a column is a serial PK and should be read-only
	function isSerialPrimaryKey(column: Column): boolean {
		console.log('Checking if column is serial primary key:', column);
		console.log('Column type:', column.type.toLowerCase());
		return (column.isPrimaryKey ?? false) && column.type.toLowerCase() === 'integer';
	}

	// Validate form values
	function validateForm(): { valid: boolean; message?: string } {
		// Check if table is selected
		if (!$tableStore.selectedTable) {
			return { valid: false, message: 'No table selected' };
		}

		// Check if all required fields are filled
		for (const column of $tableStore.selectedTable.columns) {
			// Skip id column for new rows
			if (column.name === 'id') continue;
			
			// Skip primary keys that are auto-generated
			if (isSerialPrimaryKey(column)) continue;

			// Check if the field is empty
			if (formValues[column.name] === undefined || formValues[column.name] === '') {
				return { valid: false, message: `${column.name} is required` };
			}

			// Validate numeric fields
			if (
				(column.type.toLowerCase().includes('decimal') ||
				 column.type.toLowerCase().includes('integer') ||
				 column.type.toLowerCase().includes('serial')) &&
				isNaN(Number(formValues[column.name]))
			) {
				return { valid: false, message: `${column.name} must be a number` };
			}
		}

		return { valid: true };
	}

	// Handle form submission
	async function handleSaveRow() {
		const validation = validateForm();
		if (!validation.valid) {
			toast.error(validation.message || 'Invalid form data');
			return;
		}

		try {
			// Clean up the form values - remove empty strings for non-required fields
			const cleanedFormValues = { ...formValues };
			Object.keys(cleanedFormValues).forEach(key => {
				// Convert empty strings to null for database compatibility
				if (cleanedFormValues[key] === '') {
					cleanedFormValues[key] = null;
				}
			});

			let result;

			if (editMode && rowData) {
				// Update existing row
				result = await tableActions.updateRow(rowData.id, cleanedFormValues);
			} else {
				// Add new row
				result = await tableActions.addRow(cleanedFormValues);
			}

			if (result.success) {
				toast.success(result.message || `Row ${editMode ? 'updated' : 'added'} successfully`);
				resetState();
			} else {
				toast.error(result.message || `Failed to ${editMode ? 'update' : 'add'} row`);
			}
		} catch (error) {
			console.error(`Error ${editMode ? 'updating' : 'adding'} row:`, error);
			toast.error(`An error occurred while ${editMode ? 'updating' : 'adding'} the row`);
		}
	}

	// Handle input change
	function handleInputChange(column: Column, event: Event) {
		const target = event.target as HTMLInputElement;
		let value: any = target.value;

		// Convert value based on column type
		if (
			column.type.toLowerCase().includes('decimal') ||
			column.type.toLowerCase().includes('integer') ||
			column.type.toLowerCase().includes('serial')
		) {
			value = value ? parseFloat(value) : null;
		} else if (column.type.toLowerCase() === 'boolean') {
			value = target.checked;
		}

		formValues[column.name] = value;
	}

	// Handle foreign key selection change
	function handleForeignKeyChange(columnName: string, selected: any) {
		if (!selected || !selected.value) return;
		formValues[columnName] = selected.value;
	}

	// Get selected table name for tooltip content
	$: selectedTableName = $tableStore.selectedTable?.name;
</script>

<Dialog.Root bind:open={isOpen} onOpenChange={(open) => {
		if (!open) { onClose(); }
	}}>
	<Dialog.Trigger asChild let:builder>
		{#if (!hideButton)}
			<Button variant={editMode ? "outline" : "secondary"} builders={[builder]}>
				<PlusCircled class="h-4 w-4 mr-2" />
				{dialogTitle}
			</Button>
		{/if}
	</Dialog.Trigger>
	<Dialog.Content class="max-w-3xl overflow-y-auto max-h-[85vh]">
		<Dialog.Header>
			<Dialog.Title>{dialogTitle}</Dialog.Title>
			<Dialog.Description>{dialogDescription}</Dialog.Description>
		</Dialog.Header>
		<div class="grid gap-4 py-4">
			{#if $tableStore.selectedTable}
				{#each $tableStore.selectedTable.columns as column, index (column.name ? `${column.name}-${index}` : `column-${index}`)}
					{#if column.name !== 'id'}
						<div class="grid grid-cols-4 items-center gap-4">
							<div class="text-right truncate flex items-center justify-end gap-1">
								<Label for={column.name} class="truncate">
									{column.name}:
								</Label>
								
								{#if column.isPrimaryKey}
									<Tooltip.Root>
										<Tooltip.Trigger>
											<span class="px-1.5 py-0.5 text-xs text-muted-foreground font-semibold rounded bg-chart-2/80 inline-flex items-center whitespace-nowrap">
												PK
											</span>
										</Tooltip.Trigger>
										<Tooltip.Content>
											{selectedTableName}.PrimaryKey
										</Tooltip.Content>
									</Tooltip.Root>
								{/if}

								{#if column.foreignKey}
									<Tooltip.Root>
										<Tooltip.Trigger>
											<span class="px-1.5 py-0.5 text-xs text-muted-foreground font-semibold rounded bg-chart-3/80 inline-flex items-center whitespace-nowrap">
												FK
											</span>
										</Tooltip.Trigger>
										<Tooltip.Content>
											{column.foreignKey.table}.{column.foreignKey.column}
										</Tooltip.Content>
									</Tooltip.Root>	
								{/if}
							</div>
							
							{#if column.foreignKey && foreignKeyData[column.name]}
								<div class="col-span-3">
									<Select.Root onSelectedChange={(selected) => handleForeignKeyChange(column.name, selected)}>
										<Select.Trigger class="w-full" id={column.name}>
											<Select.Value placeholder={`Select ${column.foreignKey.table}`} />
										</Select.Trigger>
										<Select.Content>
											<Select.Label>{column.foreignKey.table} options</Select.Label>
											<Select.Separator />
											{#each foreignKeyData[column.name].options as option}
												<Select.Item value={option[foreignKeyData[column.name].column]} class="cursor-pointer">
													{option[foreignKeyData[column.name].column]} 
													{#if option.name} - {option.name}{/if}
													{#if option.title} - {option.title}{/if}
												</Select.Item>
											{/each}
										</Select.Content>
									</Select.Root>
								</div>
							{:else if isSerialPrimaryKey(column)}
								<!-- Serial Primary Key field - display as disabled and with note -->
								<div class="col-span-3">
									<Input
										type="text"
										placeholder="Auto-generated value"
										class="col-span-3 bg-gray-100"
										id={column.name}
										value={editMode ? (formValues[column.name] || 'Auto-generated') : 'Auto-generated'}
										disabled={true}
										readonly={true}
									/>
									<p class="text-xs text-muted-foreground mt-1">This value is auto-generated and cannot be modified.</p>
								</div>
							{:else if column.isPrimaryKey}
								<Input
									type={getInputType(column.type)}
									placeholder={column.name}
									class="col-span-3 bg-gray-100"
									id={column.name}
									value={formValues[column.name] || ''}
									on:input={(e) => handleInputChange(column, e)}
								/>
							{:else}
								<Input
									type={getInputType(column.type)}
									placeholder={column.name}
									class="col-span-3"
									id={column.name}
									value={formValues[column.name] || ''}
									on:input={(e) => handleInputChange(column, e)}
								/>
							{/if}
						</div>
					{/if}
				{/each}
			{:else}
				<div class="text-center py-4 text-muted-foreground">
					Please select a table first.
				</div>
			{/if}
		</div>
		<Dialog.Footer class="flex justify-between">
			<div class="flex gap-2">
				<Button variant="secondary" on:click={handleSaveRow} disabled={!$tableStore.selectedTable}>
					{buttonText}
				</Button>
			</div>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>