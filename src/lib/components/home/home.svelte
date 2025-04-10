<script lang="ts">
	import { onMount, tick } from 'svelte';
	import hljs from 'highlight.js';
	import { Progress } from '$lib/components/ui/progress';
	import 'highlight.js/styles/atom-one-dark-reasonable.css';
	import { marked } from 'marked';

	import homeMarkdown from './home.md?raw';

	let homeHtml: string;

	let isLoading = true;

	onMount(async () => {
		isLoading = true;
		homeHtml = await marked.parse(homeMarkdown);

		await tick();
		document.querySelectorAll('pre code').forEach((block: Element) => {
			hljs.highlightElement(block as HTMLElement);
		});

		isLoading = false;
	});
</script>

{#if isLoading}
	<div class="fixed inset-0 flex items-center justify-center">
		<Progress class="w-1/4" value={Math.random() * 100} />
	</div>
{/if}

<div class="prose prose-invert max-w-none">
	{@html homeHtml}
</div>

