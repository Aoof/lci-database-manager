<script lang="ts">
	import type { Selected } from 'bits-ui';
	
	// Import necessary Svelte and shadcn-svelte components
	import { TableDialog } from '$lib/components/table-dialog';
	import { RowDialog } from '$lib/components/row-dialog';
	import { FilterDialog } from '$lib/components/filter-dialog';
	import { Button } from '$lib/components/ui/button';
	import * as Sheet from '$lib/components/ui/sheet';
	import * as Table from '$lib/components/ui/table';
	import * as Select from '$lib/components/ui/select';
	import * as Pagination from '$lib/components/ui/pagination';
	import * as AlertDialog from '$lib/components/ui/alert-dialog';
	import * as Tooltip from '$lib/components/ui/tooltip';
	import { toast } from 'svelte-sonner';
	import { CaretDown, CaretUp, CaretSort, Pencil2, Trash, MagnifyingGlass } from 'svelte-radix';

	// Import stores
	import { databaseStore } from '$lib/stores/databaseStore';
	import { tableStore, tableActions } from '$lib/stores/tableStore';
	import { onMount } from 'svelte';
	import type { Row } from '$lib/types';

	// Load tables on component mount
	onMount(() => {
		databaseStore.getTables();
	});

	// Computed properties
	$: selectedTableName = $tableStore.selectedTable?.name;
	$: sortConfig = $tableStore.sortConfig;
	$: itemsPerPage = $tableStore.pagination.itemsPerPage;
	$: totalItems = $tableStore.pagination.totalItems;

	// Dialog states
	let isDeleteTableDialogOpen = false;
	let isAddRowDialogOpen = false;
	let isEditRowDialogOpen = false;
	let isFilterDialogOpen = false;
	let currentRowData: Row | null = null;

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
		}
	}

	function handleDeleteTable() {
		isDeleteTableDialogOpen = true;
	}

	// Dialog states for row operations
	let isDeleteRowDialogOpen = false;
	let currentRowId: number | null = null;

	function getPage() {
		return $tableStore.pagination.currentPage;
	}

	function setPage(page: number) {
		tableActions.setPagination(page);
	}

	function handleEditRow(rowId: number) {
		const row = $tableStore.selectedTable?.rows.find(row => row.id === rowId);
		if (row) {
			currentRowData = row;
			isEditRowDialogOpen = true;
		} else {
			toast.error('Row not found');
		}
	}

	function handleDeleteRow(rowId: number) {
		currentRowId = rowId;
		isDeleteRowDialogOpen = true;
	}
	
	async function confirmDeleteRow() {
		if (currentRowId !== null) {
			await tableActions.deleteRow(currentRowId);
			currentRowId = null;
			isDeleteRowDialogOpen = false;
		}
	}
	
	async function confirmDeleteTable() {
		if (selectedTableName) {
			await tableActions.deleteTable(selectedTableName);
			isDeleteTableDialogOpen = false;
		}
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
						{#each availableTables as table (table)}
							<Select.Item value={table.name} class="cursor-pointer">
								{table.name}
							</Select.Item>
						{/each}
						{#if availableTables.length === 0}
							<Select.Item value="no-tables" disabled>No tables found</Select.Item>
						{/if}
					</Select.Content>
				</Select.Root>
			</div>

			<Button variant="ghost" on:click={() => isFilterDialogOpen = true} class="hover:bg-input/100 w-full rounded bg-input/20">
				<MagnifyingGlass class="h-4 w-4 mr-2" />
				Filter
			</Button>

			<div class="flex gap-2">
				<TableDialog />
				<TableDialog tableName={$tableStore.selectedTable?.name} columns={$tableStore.selectedTable?.columns} editTable={true} disabled={!selectedTableName} />
				<Button variant="destructive" on:click={handleDeleteTable} disabled={!selectedTableName}>
					Delete Table
				</Button>
			</div>
		</div>
	</section>

	<section class="p-4 border rounded-lg bg-card text-card-foreground">
		<div class="flex justify-between items-center mb-4">
			<h2 class="text-xl font-semibold">
				Data for: {selectedTableName ?? 'No table selected'}
			</h2>
			
			{#if selectedTableName}
				<RowDialog 
					bind:isOpen={isAddRowDialogOpen} 
					editMode={false} 
					rowData={null} 
					onClose={() => {
						isAddRowDialogOpen = false;
					}}
				/>
			{/if}
		</div>

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
											{#if column.isPrimaryKey}
												<Tooltip.Root>
													<Tooltip.Trigger>
														<Button variant="ghost" size="icon" class="w-full text-xs text-muted-foreground capitalize h-8 w-8 bg-chart-2/80">
															PK
														</Button>
													</Tooltip.Trigger>
													<Tooltip.Content>
														{selectedTableName}.PrimaryKey
													</Tooltip.Content>
												</Tooltip.Root>
											{/if}

											{#if column.foreignKey}
												<Tooltip.Root>
													<Tooltip.Trigger>
														<Button variant="ghost" size="icon" class="w-full text-xs text-muted-foreground capitalize h-8 w-8 bg-chart-2/80">
															FK
														</Button>
													</Tooltip.Trigger>
													<Tooltip.Content>
														{column.foreignKey.table}.{column.foreignKey.column}
													</Tooltip.Content>
												</Tooltip.Root>	
											{/if}

											{#if sortConfig.key === column.key}
												{#if sortConfig.direction === 'asc'}
													<CaretDown class="ml-2 h-4 w-4" />
												{:else}
													<CaretUp class="ml-2 h-4 w-4" />
												{/if}
											{:else}
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
					bind:page={getPage, setPage}
				>
					<Pagination.Content>
						<Pagination.Item>
							<Pagination.PrevButton />
						</Pagination.Item>
						{#each pages as page (page.key)}
							{#if page.type === "ellipsis"}
								<Pagination.Item>
									<Pagination.Ellipsis />
								</Pagination.Item>
							{:else}
								<Pagination.Item class={localPage === page.value ? "" : "hidden"}>
									<Pagination.Link {page} isActive={localPage === page.value}>
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

	<!-- Delete Table Confirmation Dialog -->
	<AlertDialog.Root bind:open={isDeleteTableDialogOpen}>
		<AlertDialog.Content>
			<AlertDialog.Header>
				<AlertDialog.Title>Delete Table</AlertDialog.Title>
				<AlertDialog.Description>
					Are you sure you want to delete the table "{selectedTableName}"? This action cannot be undone.
				</AlertDialog.Description>
			</AlertDialog.Header>
			<AlertDialog.Footer>
				<AlertDialog.Cancel>Cancel</AlertDialog.Cancel>
				<AlertDialog.Action on:click={confirmDeleteTable} class="bg-destructive text-destructive-foreground hover:bg-destructive/90">
					Delete
				</AlertDialog.Action>
			</AlertDialog.Footer>
		</AlertDialog.Content>
	</AlertDialog.Root>

	<!-- Delete Row Confirmation Dialog -->
	<AlertDialog.Root bind:open={isDeleteRowDialogOpen}>
		<AlertDialog.Content>
			<AlertDialog.Header>
				<AlertDialog.Title>Delete Row</AlertDialog.Title>
				<AlertDialog.Description>
					Are you sure you want to delete this row? This action cannot be undone.
				</AlertDialog.Description>
			</AlertDialog.Header>
			<AlertDialog.Footer>
				<AlertDialog.Cancel>Cancel</AlertDialog.Cancel>
				<AlertDialog.Action on:click={confirmDeleteRow} class="bg-destructive text-destructive-foreground hover:bg-destructive/90">
					Delete
				</AlertDialog.Action>
			</AlertDialog.Footer>
		</AlertDialog.Content>
	</AlertDialog.Root>

	<FilterDialog
		bind:isOpen={isFilterDialogOpen}
		bind:filterProps={$tableStore.filterProps}
		onClose={() => {
			isFilterDialogOpen = false;
		}}
	/>

	<RowDialog
		bind:isOpen={isEditRowDialogOpen}
		editMode={true} 
		rowData={currentRowData}
		onClose={() => {
			isEditRowDialogOpen = false;
			currentRowData = null;
		}}
		hideButton={true}
	/>
</div>
