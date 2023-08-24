<script lang="ts">
  import { page } from "$app/stores";
  import DocLayout from "$lib/DocLayout.svelte";
  import { clearAll, wordNameToIndex } from "$lib/storage";
  import { decodeWordName } from "$lib/util";
  import { onMount } from "svelte";

  let wordIndex: number | undefined;

  $: wordIndex = $page.params.name
    ? wordNameToIndex.get(decodeWordName($page.params.name))
    : undefined;

  onMount(() => {
    // Clear all filters when the user leaves the page.
    return () => clearAll();
  });
</script>

<!-- {#if wordIndex === undefined} -->
<!-- <div class="flex gap-10 w-full h-full items-center justify-center">
    <p class="text-6xl rotate-[30deg] text-red-300">:(</p>
    <div class="flex flex-col gap-3">
      <h1 class="text-3xl font-semibold">Sorry</h1>
      <h2>
        Word not found: <strong class="font-medium font-variation-mono"
          >{$page.params.name}</strong
        >
      </h2>
    </div>
  </div> -->
<!-- {:else} -->

<DocLayout {wordIndex} />
<!-- {/if} -->
