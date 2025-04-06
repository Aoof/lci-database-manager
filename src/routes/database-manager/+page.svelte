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
	import { Input } from '$lib/components/ui/input'; // Added for potential filtering
	import { Label } from '$lib/components/ui/label';
	import { CaretDown, CaretUp, CaretSort, Pencil2, Trash } from 'svelte-radix'; // Icons for sorting and actions
	import { writable, type Writable } from 'svelte/store';

	// --- Reactive State ---
	// Store the currently selected table name
	const selectedTableName = writable<string | undefined>(undefined);
	const pages = writable<number>(0);
	const currentPage = writable<number>(1);

	// Store sorting configuration
	const sortConfig = writable<{ key: string; direction: 'asc' | 'desc' | null }>({
		key: '',
		direction: null
	});

	// --- Sample Data (Replace with dynamic data fetching) ---
	// Define interfaces for better type safety
	interface Column {
		key: string; // Key matching the property in the row data
		name: string; // Display name for the header
		type: string; // Data type (for potential formatting)
		sortable?: boolean; // Flag if the column can be sorted
	}

	interface Row {
		id: number;
		[key: string]: any; // Allow other properties
	}

	interface DbTable {
		name: string;
		columns: Column[];
		rows: Row[];
	}

	// Example table data structure
	const usersTable: DbTable = {
		name: 'Users',
		columns: [
			{ key: 'id', name: 'ID', type: 'integer', sortable: true },
			{ key: 'name', name: 'Name', type: 'string', sortable: true },
			{ key: 'email', name: 'Email', type: 'string', sortable: true },
			{ key: 'createdAt', name: 'Created At', type: 'datetime', sortable: true }
			// Add an 'actions' column definition if needed, or handle it separately
		],
		rows: [
			{ id: 1, name: 'John Doe', email: 'john.doe@example.com', createdAt: '2023-01-15T08:30:00' },
			{ id: 2, name: 'Jane Smith', email: 'jane.smith@example.com', createdAt: '2023-02-23T14:45:00' },
			{ id: 3, name: 'Alex Johnson', email: 'alex.j@example.com', createdAt: '2023-03-10T11:20:00' },
			{ id: 4, name: 'Sarah Williams', email: 'sarah.w@example.com', createdAt: '2023-04-05T16:15:00' },
			{ id: 5, name: 'Michael Brown', email: 'michael.b@example.com', createdAt: '2023-05-18T09:10:00' }
		]
	};

	// In a real app, you'd fetch this data based on $selectedTableName
	// For now, we'll just use the static usersTable
	let currentTable: Writable<DbTable> = writable(usersTable); // This would be reactive based on selected table

	// --- Computed Properties ---
	// Reactive statement to sort rows based on sortConfig
	$: sortedRows = [...$currentTable.rows].sort((a, b) => {
		const { key, direction } = $sortConfig;
		if (!direction || !key) return 0;

		const aValue = a[key];
		const bValue = b[key];

		// Basic comparison, needs refinement for different types (numbers, dates)
		if (aValue < bValue) return direction === 'asc' ? -1 : 1;
		if (aValue > bValue) return direction === 'asc' ? 1 : -1;
		return 0;
	});

	// --- Event Handlers ---
	function handleSort(key: string) {
		sortConfig.update((current) => {
			if (current.key === key) {
				// Cycle through asc -> desc -> null
				const newDirection = current.direction === 'asc' ? 'desc' : current.direction === 'desc' ? null : 'asc';
				// If direction becomes null, clear the key as well
				return { key: newDirection ? key : '', direction: newDirection };
			} else {
				// Start with ascending on new key
				return { key: key, direction: 'asc' };
			}
		});
	}

	function handleSelectTable(value : Selected<unknown> | undefined) {
		selectedTableName.set((value as Selected<unknown>)?.value as string);
	
		currentTable.set(usersTable);
		toast.success(`Selected table: ${value?.value}`);
		// Reset sorting when table changes
		sortConfig.set({ key: '', direction: null });
	}

	function handleAddTable() {

	}

	function handleEditTable() {
		// TODO: Implement logic to open a form/modal for altering the selected table
		if ($selectedTableName) {
			toast.info(`Edit Table clicked for: ${$selectedTableName}`);
		} else {
			toast.error('No table selected to edit');
			// Optionally show a notification to the user
		}
	}

	function handleDeleteTable() {
		// TODO: Implement logic to confirm and delete the selected table
		if ($selectedTableName) {
			toast.info(`Delete Table clicked for: ${$selectedTableName}`);
			// Show confirmation dialog
		} else {
			toast.error('No table selected to delete');
			// Optionally show a notification to the user
		}
	}

	function handleEditRow(rowId: number) {
		// TODO: Implement logic to open an edit form for the specific row
		toast.info(`Edit Row clicked for ID: ${rowId}`);
	}

	function handleDeleteRow(rowId: number) {
		// TODO: Implement logic to confirm and delete the specific row
		toast.info(`Delete Row clicked for ID: ${rowId}`);
		// Show confirmation dialog
	}

	// Placeholder list of tables for the dropdown
	const availableTables = ['Users', 'Orders', 'Products']; // Replace with dynamically fetched list

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
				{#if $currentTable}
					<TableDialog tableName={$currentTable.name} columns={$currentTable.columns} editTable />
				{:else}
					<Button variant="outline" disabled={!$selectedTableName}>
						Edit Table
					</Button>
				{/if}
				<Button variant="destructive" on:click={handleDeleteTable} disabled={!$selectedTableName}>
					Delete Table
				</Button>
			</div>
		</div>
	</section>

	<section class="p-4 border rounded-lg bg-card text-card-foreground">
		<h2 class="text-xl font-semibold mb-4">
			Data for: { $selectedTableName ?? 'No table selected'}
		</h2>

		{#if $selectedTableName}
			<div class="rounded-md border">
				<Table.Root>
					<Table.Header>
						<Table.Row>
							{#each $currentTable.columns as column (column.key)}
								<Table.Head>
									{#if column.sortable}
										<Button
											variant="ghost"
											class="w-full justify-start px-2 hover:bg-secondary hover:text-accent-foreground"
											on:click={() => handleSort(column.key)}
										>
											{column.name}

											{#if $sortConfig.key === column.key}
												{#if $sortConfig.direction === 'asc'}
													<CaretUp class="ml-2 h-4 w-4" />
												{:else}
													<CaretDown class="ml-2 h-4 w-4" />
												{/if}
											{/if}

											{#if $sortConfig.key !== column.key}
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
								{#each $currentTable.columns as column (column.key)}
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
								<Table.Cell colspan={$currentTable.columns.length + 1} class="h-24 text-center">
									No results.
								</Table.Cell>
							</Table.Row>
						{/each}
					</Table.Body>
				</Table.Root>
				<Pagination.Root class="my-4" count={$currentTable.rows.length} perPage={10} let:pages let:currentPage>
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
							<Pagination.Item class={(currentPage == page.value) ? "" : "hidden"}>
								<Pagination.Link {page} isActive={currentPage == page.value}>
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
