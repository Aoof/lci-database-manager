<script lang="ts">
	import '../app.css';
	import { ModeWatcher } from 'mode-watcher';
	import { Toaster } from "$lib/components/ui/sonner";
	import { Button } from '$lib/components/ui/button';
	import { Separator } from '$lib/components/ui/separator';

	let { children } = $props();
</script>

<ModeWatcher />
<Toaster />

<nav>
	<ul class="flex justify-center gap-4 py-4">
		<Button variant="link" href="/">Home</Button>
		<Separator orientation="vertical" class="h-8" />
		<Button variant="link" href="/report">Report</Button>
		<Separator orientation="vertical" class="h-8" />
		<Button variant="secondary" href="/database-manager">Database Manager</Button>
	</ul>
</nav>

{@render children()}
