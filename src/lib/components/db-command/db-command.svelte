<script lang="ts">
    import { onMount } from "svelte";
    import hljs from "highlight.js";
    import "highlight.js/styles/atom-one-dark-reasonable.css";
	import Button from "../ui/button/button.svelte";
    import { toast } from "svelte-sonner";
    import { Copy, Reader } from "svelte-radix";

    export let code : string = "";
    export let language : string = "sql";
    export let title : string = "Code Snippet";

    let codeElem: HTMLElement;

    onMount(() => {
        hljs.highlightElement(codeElem);
    });
</script>

<div class="relative">
    <div class="flex justify-between items-center mb-3">
        <h2 class="text-lg font-semibold text-gray-200 flex items-center gap-2">
            <Reader class="h-6 w-6" />
            {title}
        </h2>
        <div class="text-xs text-gray-400 bg-gray-700 px-2 py-1 rounded">{language.toUpperCase()}</div>
    </div>
    <pre class="whitespace-pre-wrap break-words overflow-auto relative"><code class={"language-" + language} bind:this={codeElem}>{code}</code><Button
            class="cursor-pointer absolute top-2 right-2 h-8 w-8 hover:bg-primary/10 hover:text-primary"
            variant="ghost"
            size="sm"
            on:click={() => {
                navigator.clipboard.writeText(code);
                toast.success("Code copied to clipboard", {
                    duration: 2000,
                });
            }}
        >
            <Copy class="h-8 w-8" />
        </Button></pre>
</div>