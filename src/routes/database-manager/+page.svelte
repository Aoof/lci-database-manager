<script lang="ts">
	import type { Selected } from 'bits-ui';
	
	// Import necessary Svelte and shadcn-svelte components
	import { TableDialog } from '$lib/components/table-dialog';
	import { Button } from '$lib/components/ui/button';
	import * as Sheet from '$lib/components/ui/sheet';
	import * as Table from '$lib/components/ui/table';
	import * as Select from '$lib/components/ui/select';
	import * as Pagination from '$lib/components/ui/pagination';
	import * as Dialog from '$lib/components/ui/dialog';
	import { toast } from 'svelte-sonner';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { CaretDown, CaretUp, CaretSort, Pencil2, Trash } from 'svelte-radix';
	
	// Import stores
	import { databaseStore } from '$lib/stores/databaseStore';
	import { tableStore, tableActions, currentTable } from '$lib/stores/tableStore';
	import { onMount } from 'svelte';
	
	// Load tables on component mount
	onMount(() => {
		databaseStore.getTables();
	});

	// Computed properties
	$: selectedTableName = $tableStore.selectedTable?.name;
	$: sortConfig = $tableStore.sortConfig;
	$: currentPage = $tableStore.pagination.currentPage;
	$: itemsPerPage = $tableStore.pagination.itemsPerPage;
	$: totalItems = $tableStore.pagination.totalItems;

	// Computed property for sorted rows
	$: sortedRows = $tableStore.selectedTable?.rows || [];

	// --- Event Handlers ---
	function handleSort(key: string) {
		tableActions.sortTable(key);
	}

	function handleSelectTable(value: Selected<unknown> | undefined) {
		const tableName = (value as Selected<unknown>)?.value as string;
		if (tableName) {
			tableActions.selectTable(tableName);
			toast.success(`Selected table: ${tableName}`);
		}
	}

	function handleEditTable() {
		if (selectedTableName) {
			toast.info(`Edit Table clicked for: ${selectedTableName}`);
		} else {
			toast.error('No table selected to edit');
		}
	}

	function handleDeleteTable() {
		if (selectedTableName) {
			toast.info(`Delete Table clicked for: ${selectedTableName}`);
			// Show confirmation dialog
		} else {
			toast.error('No table selected to delete');
		}
	}

	function handleEditRow(rowId: number) {
		toast.info(`Edit Row clicked for ID: ${rowId}`);
	}

	function handleDeleteRow(rowId: number) {
		toast.info(`Delete Row clicked for ID: ${rowId}`);
		// Show confirmation dialog
	}

	// Get available tables from the database store
	$: availableTables = $databaseStore.tables;
</script>

<div class="container mx-auto p-4 md:p-6 lg:p-8">
	<h1 class="text-3xl font-bold mb-6">Database Manager</h1>

	<div class="mb-6 flex justify-start">
		<Sheet.Root>
			<Sheet.Trigger asChild let:builder>
				<Button variant="outline" builders={[builder]}>Open Tests</Button>
			</Sheet.Trigger>
			<Sheet.Content>
				<Sheet.Header>
					<Sheet.Title>Database Manager Tests</Sheet.Title>
					<Sheet.Description>
						These tests will help you evaluate the database manager. (Content TBD)
					</Sheet.Description>
				</Sheet.Header>
				<div class="py-4">
					<p>Test content goes here...</p>
				</div>
			</Sheet.Content>
		</Sheet.Root>
	</div>

	<section class="mb-6 p-4 border rounded-lg bg-card text-card-foreground">
		<h2 class="text-xl font-semibold mb-4">Table Management</h2>
		<div class="flex flex-col sm:flex-row justify-between items-start gap-4">
			<div class="flex items-center gap-2">
				<span class="font-medium">Table:</span>
				<Select.Root onSelectedChange={handleSelectTable}>
					<Select.Trigger class="w-[180px]">
						<Select.Value placeholder="Select a table" />
					</Select.Trigger>
					<Select.Content>
						<Select.Label>Available Tables</Select.Label>
						<Select.Separator />
						{#each availableTables as tableName (tableName)}
							<Select.Item value={tableName} class="cursor-pointer">
								{tableName}
							</Select.Item>
						{/each}
						{#if availableTables.length === 0}
							<Select.Item value="no-tables" disabled>No tables found</Select.Item>
						{/if}
					</Select.Content>
				</Select.Root>
			</div>

			<div class="flex flex-wrap gap-2">
				<TableDialog />
				{#if $tableStore.selectedTable}
					<TableDialog tableName={$tableStore.selectedTable.name} columns={$tableStore.selectedTable.columns} editTable />
				{:else}
					<Button variant="outline" disabled={!selectedTableName}>
						Edit Table
					</Button>
				{/if}
				<Button variant="destructive" on:click={handleDeleteTable} disabled={!selectedTableName}>
					Delete Table
				</Button>
			</div>
		</div>
	</section>

	<section class="p-4 border rounded-lg bg-card text-card-foreground">
		<h2 class="text-xl font-semibold mb-4">
			Data for: { selectedTableName ?? 'No table selected'}
		</h2>

		{#if selectedTableName}
			<div class="rounded-md border">
				<Table.Root>
					<Table.Header>
						<Table.Row>
							{#each $tableStore.selectedTable?.columns || [] as column (column.key)}
								<Table.Head>
									{#if column.sortable}
										<Button
											variant="ghost"
											class="w-full justify-start px-2 hover:bg-secondary hover:text-accent-foreground"
											on:click={() => handleSort(column.key)}
										>
											{column.name}

											{#if sortConfig.key === column.key}
												{#if sortConfig.direction === 'asc'}
													<CaretUp class="ml-2 h-4 w-4" />
												{:else}
													<CaretDown class="ml-2 h-4 w-4" />
												{/if}
											{/if}

											{#if sortConfig.key !== column.key}
												<CaretSort class="ml-2 h-4 w-4 opacity-50" />
											{/if}
										</Button>
									{:else}
										<div class="font-medium px-2 py-2 text-left">{column.name}</div>
									{/if}
								</Table.Head>
							{/each}
							<Table.Head class="text-right w-[100px]">Actions</Table.Head>
						</Table.Row>
					</Table.Header>
					<Table.Body>
						{#each sortedRows as row (row.id)}
							<Table.Row>
								{#each $tableStore.selectedTable?.columns || [] as column (column.key)}
									<Table.Cell>
										{row[column.key] ?? 'NULL'}
									</Table.Cell>
								{/each}
								<Table.Cell class="text-right">
									<Button
										variant="ghost"
										size="icon"
										class="h-8 w-8"
										on:click={() => handleEditRow(row.id)}
										aria-label="Edit Row"
									>
										<Pencil2 class="h-4 w-4" />
									</Button>
									<Button
										variant="ghost"
										size="icon"
										class="h-8 w-8 text-destructive hover:text-destructive"
										on:click={() => handleDeleteRow(row.id)}
										aria-label="Delete Row"
									>
										<Trash class="h-4 w-4" />
									</Button>
								</Table.Cell>
							</Table.Row>
						{:else}
							<Table.Row>
								<Table.Cell colspan={($tableStore.selectedTable?.columns.length || 0) + 1} class="h-24 text-center">
									No results.
								</Table.Cell>
							</Table.Row>
						{/each}
					</Table.Body>
				</Table.Root>
				<Pagination.Root 
					class="my-4" 
					count={totalItems} 
					perPage={itemsPerPage} 
					let:pages 
					let:currentPage={localPage}
					bind:page={currentPage}
				>
					<Pagination.Content>
						<Pagination.Item>
							<Pagination.PrevButton />
						</Pagination.Item>
						{#each pages as page (page.key)}
							{#if page.type == "ellipsis"}
							<Pagination.Item>
								<Pagination.Ellipsis />
							</Pagination.Item>
							{:else}
							<Pagination.Item class={(localPage == page.value) ? "" : "hidden"}>
								<Pagination.Link {page} isActive={localPage == page.value}>
									{page.value}
								</Pagination.Link>
							</Pagination.Item>
							{/if}
						{/each}
						<Pagination.Item>
							<Pagination.NextButton />
						</Pagination.Item>
					</Pagination.Content>
				</Pagination.Root>
			</div>

			{:else}
			<p class="text-muted-foreground">Please select a table to view its data.</p>
		{/if}
	</section>

</div>
