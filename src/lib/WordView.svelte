<script lang="ts">
  import WordEffectList from "$lib/WordEffectList.svelte";
  import WordDescription from "$lib/WordDescription.svelte";
  import WordViewHeader from "$lib/WordViewHeader.svelte";

  /**
   * Index of the word whose documentation should be displayed.
   */
  export let wordIndex: number | undefined;
</script>

<article class="flex flex-col gap-3 bg-zinc-900 h-full overflow-auto">
  {#if wordIndex !== undefined}
    <div class="sticky top-0 z-40">
      <WordViewHeader {wordIndex} />
    </div>
    <div class="flex flex-col gap-2 px-3 pb-4">
      <h1 class="text-lg uppercase font-semibold tracking-wide text-zinc-100">
        Effects
      </h1>
      <div class="flex flex-col gap-3 px-2">
        <p class="text-zinc-400 text-sm">
          Only recognized effects are highlighted. Unrecognized parts are left
          as is. Refer to the original effect above in case of a misrecognition.
          Click on an effect below to filter by that effect. Click on the "plug"
          button to filter by takes/leaves specifically.
        </p>
        <WordEffectList {wordIndex} />
      </div>
    </div>
    <div class="flex flex-col px-3 pb-4">
      <h1 class="text-lg uppercase font-semibold tracking-wide text-zinc-100">
        Description
      </h1>
      <WordDescription {wordIndex} />
    </div>
  {:else}
    <div class="flex justify-center items-center h-full text-zinc-400">
      Click on a word on the graph to learn more about it.
    </div>
  {/if}
</article>
