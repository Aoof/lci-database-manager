<script lang="ts">
    import { Button } from '$lib/components/ui/button';
	import * as Select from '$lib/components/ui/select';
	import * as Dialog from '$lib/components/ui/dialog';
    import { Label } from '$lib/components/ui/label';
    import { Input } from '$lib/components/ui/input';
	import { toast } from 'svelte-sonner';
    import { PlusCircled, Trash } from 'svelte-radix';
	import type { Selected } from 'bits-ui';

    export let tableName: string = '';
    export let columns: Array<{ name: string; type: string }> = [];
    export let onAddTable: (name: string, columns: Array<{ name: string; type: string }>) => void = () => {};
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
    $: if (isOpen && !retainTable) {
        tableName = '';
        columns = [];
    }
</script>

<Dialog.Root bind:open={isOpen}>
    <Dialog.Trigger asChild let:builder>
        <Button 
            variant="secondary" 
            builders={[builder]}
        >
            Add Table
        </Button>

    </Dialog.Trigger>
    <Dialog.Content>
        <Dialog.Header>
            <Dialog.Title>Add Table</Dialog.Title>
            <Dialog.Description>
                Fill in the details for the new table.
            </Dialog.Description>
        </Dialog.Header>
        <div class="grid gap-4 py-4">
            <div class="grid grid-cols-4 items-center gap-4">
                <Label for="table-name" class="text-right">Table Name:</Label>
                <Input 
                    placeholder="Table Name" 
                    class="col-span-3" 
                    id="table-name" 
                    bind:value={tableName}
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
                            size="icon" 
                            on:click={() => {
                                columns = [];
                                toast.success('All columns removed');
                            }}
                        >
                            <Trash class="h-4 w-4" />
                        </Button>
                        <Button 
                            variant="secondary" 
                            on:click={() => {
                                if (columnName && columnType) {
                                    columns = [...columns, { name: columnName, type: columnType }];
                                    columnName = '';
                                    columnType = '';
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
                    <ul class="space-y-1">
                        {#each columns as column}
                            <li class="flex justify-between bg-muted p-2 rounded-md">
                                <span>{column.name}</span>
                                <span class="text-muted-foreground">{column.type}</span>
                            </li>
                        {/each}
                    </ul>
                {:else}
                    <div class="text-muted-foreground">
                        No columns added yet.
                    </div>
                {/if}
            </div>
        </div>
        <Dialog.Footer class="flex justify-between">
            <div class="flex gap-2">
                <Button 
                    on:click={() => {
                        if (tableName && columns.length > 0) {
                            onAddTable(tableName, columns);
                            onClose();
                        } else {
                            toast.error('Please provide table name and at least one column');
                        }
                    }}
                >
                    Save Table
                </Button>
            </div>
        </Dialog.Footer>
    </Dialog.Content>
</Dialog.Root>
