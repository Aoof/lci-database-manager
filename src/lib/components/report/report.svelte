<script lang="ts">
    import { onMount } from 'svelte';
    import hljs from 'highlight.js';
    import { Progress } from '$lib/components/ui/progress';
    import "highlight.js/styles/atom-one-dark-reasonable.css";
    import { marked } from 'marked';
    // Remove the direct mermaid import
    
    import reportMarkdown from './report.md?raw';

    let reportHtml: string;
    let isLoading = true;
    let diagram_index = 0;
    let mermaid: any;

    onMount(async () => {
        isLoading = true;
        
        // Import mermaid dynamically
        mermaid = (await import('mermaid')).default;
        mermaid.initialize({ startOnLoad: true, darkMode: true, theme: 'dark' });
        
        reportHtml = await marked.parse(reportMarkdown);

        document.querySelectorAll('pre code').forEach(async (block : Element) => {
            if (block.classList.contains('language-mermaid')) {
                const res = await mermaid.render("mermaid-diagram-" + ++diagram_index, block.innerHTML, block);
                block.innerHTML = res.svg;
                block.classList.remove('language-mermaid');
                block.classList.add('language-svg');
                block.classList.add('flex');
                block.classList.add('justify-center');
                return;
            }
            hljs.highlightElement(block as HTMLElement);
        });

        isLoading = false;
    }) 
</script>

{#if isLoading}
	<div class="fixed inset-0 flex items-center justify-center">
		<Progress class="w-1/4" value={Math.random() * 100} />
	</div>
{/if}

<div class="prose prose-invert max-w-none">
    {@html reportHtml}
</div>