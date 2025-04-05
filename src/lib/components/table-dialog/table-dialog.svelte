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
	export let originalTableName: string = ''; // For tracking original table name when editing

	export let onAddTable: (
		name: string,
		columns: Array<{ name: string; type: string }>
	) => void = () => {};

	export let onClose: () => void = () => {};

	export let isOpen: boolean = false;
	export let retainTable: boolean = false;

	export let columnTypes: Array<{ name: string; type: string }> = [
		{ name: 'String', type: 'string' },
		{ name: 'Integer', type: 'integer' },
		{ name: 'DateTime', type: 'datetime' }
	];

	let columnName: string = '';
	let columnType: string = '';
	let _selectedColumnType: Selected<string> = { value: '' };
	$: columnType = _selectedColumnType.value;

    onMount(() => {
        if (isOpen && !retainTable) {
            tableName = '';
            columns = [];
            originalTableName = '';
        } else if (isOpen && retainTable && !originalTableName) {
            originalTableName = tableName; // Store original table name when editing
        }
    });

	async function handleSaveTable() {
		if (tableName && columns.length > 0) {
			let result;
			
			if (retainTable) {
				result = await databaseOperations.updateTable(originalTableName, tableName, columns);
			} else {
				result = await databaseOperations.createTable(tableName, columns);
			}
			
			if (result.success) {
				onAddTable(tableName, columns);
				onClose();
			}
		} else {
			toast.error('Please provide table name and at least one column');
		}
	}
	
	$: dialogTitle = retainTable ? 'Edit Table' : 'Add Table';
	$: dialogDescription = retainTable 
		? 'Modify the details for this table.'
		: 'Fill in the details for the new table.';
	$: buttonText = retainTable ? 'Update Table' : 'Save Table';
</script>

<Dialog.Root bind:open={isOpen}>
	<Dialog.Trigger asChild let:builder>
		<Button variant={retainTable ? "outline" : "secondary"} builders={[builder]}>{dialogTitle}</Button>
	</Dialog.Trigger>
	<Dialog.Content>
		<Dialog.Header>
			<Dialog.Title>{dialogTitle}</Dialog.Title>
			<Dialog.Description>{dialogDescription}</Dialog.Description>
		</Dialog.Header>
		<div class="grid gap-4 py-4">
			<div class="grid grid-cols-4 items-center gap-4">
				<Label for="table-name" class="text-right">Table Name:</Label>
					<Input 
					placeholder="Table Name" 
					class="col-span-3" 
					id="table-name" 
					bind:value={tableName} 
					disabled={retainTable}
					readonly={retainTable}
				/>
			</div>
			<div class="grid grid-cols-4 items-center gap-4">
				<Label for="column-type" class="text-right">Column Type:</Label>
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
				<Label for="column-name" class="text-right">Column Name:</Label>
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
							variant="secondary"
							on:click={() => {
								if (columnName && columnType) {
									columns = [...columns, { name: columnName, type: columnType }];
									columnName = '';
									_selectedColumnType = { value: '' };
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
							<li class="bg-muted flex justify-between items-center rounded-md p-2">
								<span>{column.name}</span>
								<span class="text-muted-foreground">{column.type}</span>
                                <Button
                                    variant="destructive"
                                    size="icon"
                                    on:click={() => {
                                        columns = columns.filter((c) => c.name !== column.name);
                                        toast.success('Column removed');
                                    }}
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
				<Button on:click={handleSaveTable} disabled={$isLoading}>
					{$isLoading ? 'Processing...' : buttonText}
				</Button>
			</div>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>
