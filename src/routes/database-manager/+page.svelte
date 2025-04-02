<script lang="ts">
	import { Button } from "$lib/components/ui/button";
    import * as Sheet from "$lib/components/ui/sheet";
    import * as Table from "$lib/components/ui/table";

    const currentTable = {
        name: "Users",
        columns: [
            { name: "ID", type: "integer" },
            { name: "Name", type: "string" },
            { name: "Email", type: "string" },
            { name: "Created At", type: "datetime" }
        ],
        rows: [
            { id: 1, name: "John Doe", email: "john.doe@example.com", createdAt: "2023-01-15T08:30:00" },
            { id: 2, name: "Jane Smith", email: "jane.smith@example.com", createdAt: "2023-02-23T14:45:00" },
            { id: 3, name: "Alex Johnson", email: "alex.j@example.com", createdAt: "2023-03-10T11:20:00" },
            { id: 4, name: "Sarah Williams", email: "sarah.w@example.com", createdAt: "2023-04-05T16:15:00" },
            { id: 5, name: "Michael Brown", email: "michael.b@example.com", createdAt: "2023-05-18T09:10:00" }
        ]
    };
</script>

<article class="size-[60%] mx-auto my-10">
    <h1 class="text-4xl font-bold mb-4">Database Manager</h1>
    <div class="w-full flex flex-col items-center gap-4">
        <part class="w-full mb-4">
            <p class="text-lg text-gray-300 mb-4">
                Click on the button to open the tests that will help you evaluate the database manager.
            </p>
            <Sheet.Root>
                <Sheet.Trigger asChild let:builder>
                    <Button variant="outline" builders={[builder]} size="lg" class="cursor-pointer m-auto">
                        Open Tests
                    </Button>
                </Sheet.Trigger>
                <Sheet.Content>
                    <Sheet.Header>
                        <Sheet.Title>Database Manager Tests</Sheet.Title>
                        <Sheet.Description>
                            These tests will help you evaluate the database manager.
                        </Sheet.Description>
                    </Sheet.Header>
                </Sheet.Content>
            </Sheet.Root>
        </part>
        <part class="w-full">
            <h2 class="text-3xl font-bold mb-4">Table:</h2>

            <Table.Root>
                <Table.Header>
                    <Table.Row>
                        {#each currentTable.columns as column}
                            <Table.Head>{column.name}</Table.Head>
                        {/each}
                    </Table.Row>
                </Table.Header>
                <Table.Body>
                    {#each currentTable.rows as row}
                        <Table.Row>
                            {#each currentTable.columns as column}
                                <Table.Cell>{Object.values(row)[currentTable.columns.indexOf(column)]}</Table.Cell>
                            {/each}
                        </Table.Row>
                    {/each}
                </Table.Body>
            </Table.Root>
        </part>
    </div>
</article>