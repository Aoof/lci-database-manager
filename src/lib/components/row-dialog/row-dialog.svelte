<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import * as Dialog from '$lib/components/ui/dialog';
	import { Label } from '$lib/components/ui/label';
	import { Input } from '$lib/components/ui/input';
	import { toast } from 'svelte-sonner';
	import { PlusCircled } from 'svelte-radix';
	import { tableStore, tableActions } from '$lib/stores/tableStore';
	import type { Column, Row } from '$lib/types';
	import { ColumnTypes } from '$lib/lib/utils';

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

	// Reset component state when dialog is closed
	export let onClose: () => void = () => {
		resetState();
	};

	// Function to reset the component state
	function resetState() {
		formValues = {};
		isOpen = false;
	}

	// Update dialog state based on mode
	function updateDialogState() {
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
					if (column.key !== 'id') {
						formValues[column.key] = '';
					}
				});
			}
		}
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

	// Validate form values
	function validateForm(): { valid: boolean; message?: string } {
		// Check if table is selected
		if (!$tableStore.selectedTable) {
			return { valid: false, message: 'No table selected' };
		}

		// Check if all required fields are filled
		for (const column of $tableStore.selectedTable.columns) {
			// Skip id column for new rows
			if (column.key === 'id') continue;

			// Check if the field is empty
			if (formValues[column.key] === undefined || formValues[column.key] === '') {
				return { valid: false, message: `${column.name} is required` };
			}

			// Validate numeric fields
			if (
				(column.type.toLowerCase().includes('decimal') ||
				 column.type.toLowerCase().includes('integer') ||
				 column.type.toLowerCase().includes('serial')) &&
				isNaN(Number(formValues[column.key]))
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
			let result;

			if (editMode && rowData) {
				// Update existing row
				result = await tableActions.updateRow(rowData.id, formValues);
			} else {
				// Add new row
				result = await tableActions.addRow(formValues);
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

		formValues[column.key] = value;
	}
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
	<Dialog.Content>
		<Dialog.Header>
			<Dialog.Title>{dialogTitle}</Dialog.Title>
			<Dialog.Description>{dialogDescription}</Dialog.Description>
		</Dialog.Header>
		<div class="grid gap-4 py-4">
			{#if $tableStore.selectedTable}
				{#each $tableStore.selectedTable.columns as column (column.key)}
					{#if column.key !== 'id'}
						<div class="grid grid-cols-4 items-center gap-4">
							<Label for={column.key} class="text-right">
								{column.name}:
								<span class="text-red-500">*</span>
							</Label>
							<Input
								type={getInputType(column.type)}
								placeholder={column.name}
								class="col-span-3"
								id={column.key}
								value={formValues[column.key] || ''}
								on:input={(e) => handleInputChange(column, e)}
							/>
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