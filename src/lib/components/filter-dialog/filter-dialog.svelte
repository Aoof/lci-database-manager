<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import * as Dialog from '$lib/components/ui/dialog';
	import { tableStore } from '$lib/stores/tableStore';

	// Props
	export let isOpen: boolean = false;
	export let filterProps: { [key: string]: string } | null = null;

	// Dialog state
	let dialogTitle: string = 'Filter';
	let dialogDescription: string = 'Choose your filters';
	let buttonText: string = 'Save Filters';
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
</script>

<Dialog.Root bind:open={isOpen} onOpenChange={(open) => {
		if (!open) { onClose(); }
	}}>
	<Dialog.Trigger>
	</Dialog.Trigger>
	<Dialog.Content>
		<Dialog.Header>
			<Dialog.Title>{dialogTitle}</Dialog.Title>
			<Dialog.Description>{dialogDescription}</Dialog.Description>
		</Dialog.Header>
        <Dialog.Footer class="flex justify-between">
			<div class="flex gap-2">
				<Button variant="secondary" on:click={() => {}} disabled={!$tableStore.selectedTable}>
					{buttonText}
				</Button>
			</div>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>