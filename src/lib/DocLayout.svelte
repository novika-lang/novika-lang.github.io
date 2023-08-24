<script lang="ts">
  import WordGraph from "$lib/WordGraph.svelte";
  import WordView from "$lib/WordView.svelte";
  import DocFilterFooter from "./DocFilterFooter.svelte";
  import WordSidebar from "./WordSidebar.svelte";
  import { leavesTags, searchFilter, takesTags, tlFilters } from "./storage";

  export let wordIndex: number | undefined;
</script>

<main
  class="grid grid-cols-8 lg:grid-cols-6 auto-rows-fr h-full overflow-hidden"
>
  <section class="border-r border-zinc-800 col-span-2 lg:col-span-1">
    <WordSidebar focusedWordIndex={wordIndex} />
  </section>
  <section
    class="relative col-span-3 lg:col-span-3 border-r border-zinc-800 flex flex-col"
  >
    <WordGraph focusedWordIndex={wordIndex} />
    {#if $takesTags.length + $leavesTags.length + $searchFilter.length + $tlFilters.length > 0}
      <div class="absolute bottom-0 w-full">
        <DocFilterFooter />
      </div>
    {/if}
  </section>
  <section class="col-span-3 lg:col-span-2">
    <WordView {wordIndex} />
  </section>
</main>
