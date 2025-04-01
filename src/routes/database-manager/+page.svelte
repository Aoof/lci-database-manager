<script>
	import { Button } from "$lib/components/ui/button";
    import * as Drawer from "$lib/components/ui/drawer";

    // TODO: Complete the database manager tests
</script>

<article class="size-[60%] mx-auto my-10">
    <h1 class="text-4xl font-bold mb-4">Database Manager</h1>
    <div class="w-full">
        <part class="w-full mb-4">
            <p class="text-lg text-gray-300 mb-4">
                Click on the button to open the tests that will help you evaluate the database manager.
            </p>
            <Drawer.Root>
                <Drawer.Trigger>
                    <Button variant="outline" size="lg" class="cursor-pointer m-auto">
                        Open Tests
                    </Button>
                </Drawer.Trigger>
                <Drawer.Content>
                    <Drawer.Header>
                        <Drawer.Title>Database Manager Tests</Drawer.Title>
                        <Drawer.Description>
                            These tests will help you evaluate the database manager.
                        </Drawer.Description>
                        <Drawer.Close>
                            <Button variant="ghost" size="icon" class="absolute top-4 right-4">
                                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </Button>
                        </Drawer.Close>
                    </Drawer.Header>
                </Drawer.Content>

            </Drawer.Root>
        </part>
        <part class="w-full">
        </part>
    </div>
</article>