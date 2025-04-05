<script lang="ts">
    import { onMount } from "svelte";
    import hljs from "highlight.js";
    import "highlight.js/styles/atom-one-dark-reasonable.css";
	import Button from "../ui/button/button.svelte";
    import { toast } from "svelte-sonner";

    export let code : string = "";
    export let language : string = "sql";
    export let title : string = "Code Snippet";

    let codeElem: HTMLElement;

    onMount(() => {
        hljs.highlightElement(codeElem);
    });
</script>

<div class="overflow-x-auto rounded-lg bg-gray-800 p-4 mb-4">
    <h2 class="text-lg font-semibold mb-2 text-gray-200">{title}</h2>
    <pre><code class={"language-" + language} bind:this={codeElem}>{code}</code></pre>
    <div class="flex justify-end">
        <Button
            class="mt-4 cursor-pointer ml-auto"
            variant="default"
            size="sm"
            on:click={() => {
                navigator.clipboard.writeText(code);
                toast.success("Code copied to clipboard", {
                    duration: 2000,
                });
            }}
        >
            Copy Code
        </Button>
    </div>
</div>