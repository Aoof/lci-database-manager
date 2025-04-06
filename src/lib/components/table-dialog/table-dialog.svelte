<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import * as Select from '$lib/components/ui/select';
	import * as Dialog from '$lib/components/ui/dialog';
	import { Label } from '$lib/components/ui/label';
	import { Input } from '$lib/components/ui/input';
	import { toast } from 'svelte-sonner';
	import { PlusCircled, Trash } from 'svelte-radix';
	import type { Selected } from 'bits-ui';
	import { databaseOperations, isLoading } from '$lib/stores/database';
	import { onMount } from 'svelte';

	export let tableName: string = '';
	export let columns: Array<{ name: string; type: string }> = [];

	export let onAddTable: (
		name: string,
		columns: Array<{ name: string; type: string }>
	) => void = () => {};

	export let onClose: () => void = () => { 
		columns = [];
		tableName = '';
		_selectedColumnType = { value: '' }; 
	};

	export let isOpen: boolean = false;
	export let editTable: boolean = false;

	let dialogTitle: string = 'Add Table';
	let dialogDescription: string = 'Fill in the details for the new table.';
	let buttonText: string = 'Save Table';

	export let columnTypes: Array<{ name: string; type: string }> = [
		{ name: 'String', type: 'string' },
		{ name: 'Integer', type: 'integer' },
		{ name: 'DateTime', type: 'datetime' }
	];

	let columnName: string = '';
	let columnType: string = '';
	let _selectedColumnType: Selected<string> = { value: '' };
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
        
        columns = [...columns, { name: columnName, type: columnType }];
        columnName = '';
        _selectedColumnType = { value: '' };
        toast.success(`Column "${columnName}" added successfully`);
    }

    onMount(() => {
        if (isOpen && !editTable) {
            tableName = '';
            columns = [];
        }

		console.log('Table Dialog Opened');
		console.log('Edit Table:', editTable);
		console.log('Table Name:', tableName);
		console.log('Columns:', columns);

		dialogTitle = editTable ? 'Edit Table' : 'Add Table';
		dialogDescription = editTable 
			? 'Modify the details for this table.'
			: 'Fill in the details for the new table.';
		buttonText = editTable ? 'Update Table' : 'Save Table';
    });

	$: if (isOpen) {
		if (editTable) {
			columns = columns.map((col) => ({ name: col.name, type: col.type }));
			tableName = tableName;
			dialogTitle = 'Edit Table';
			dialogDescription = 'Modify the details for this table.';
			buttonText = 'Update Table';
		} else {
			columns = [];
			tableName = '';
			dialogTitle = 'Add Table';
			dialogDescription = 'Fill in the details for the new table.';
			buttonText = 'Save Table';
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
			onAddTable(tableName, columns);
			onClose();
		}
	}

</script>

<Dialog.Root bind:open={isOpen}>
	<Dialog.Trigger asChild let:builder>
		<Button variant={editTable ? "outline" : "secondary"} builders={[builder]}>{dialogTitle}</Button>
	</Dialog.Trigger>
	<Dialog.Content>
		<Dialog.Header>
			<Dialog.Title>{dialogTitle}</Dialog.Title>
			<Dialog.Description>{dialogDescription}</Dialog.Description>
		</Dialog.Header>
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
							<Select.Separator />
							{#each columnTypes as type (type.type)}
								<Select.Item value={type.type} class="cursor-pointer">
									{type.name}
								</Select.Item>
							{/each}
						</Select.Content>
					</Select.Root>
				</div>
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
					<ul class="space-y-1 my-2">
						{#each columns as column}
							<li class="flex items-center justify-between gap-2 rounded-md border p-3 transition-colors hover:bg-background/80">
								<div class="flex flex-col">
									<span class="font-medium">{column.name}</span>
									<span class="text-xs text-muted-foreground capitalize">{column.type}</span>
								</div>
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
