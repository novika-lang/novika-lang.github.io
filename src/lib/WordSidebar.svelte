<script lang="ts">
  import EffectFilterInput from "./EffectFilterInput.svelte";
  import WordPanelList from "./WordPanelList.svelte";
  import WordSearchBox from "./WordSearchBox.svelte";

  import { takesTags, leavesTags, searchFilter } from "./storage";

  export let focusedWordIndex: number | undefined;
</script>

<div class="relative bg-zinc-900 h-full flex flex-col">
  <div class="w-full px-2 py-3 flex flex-col gap-4">
    <WordSearchBox bind:query={$searchFilter} />
    <div class="px-2 flex flex-col gap-3">
      <EffectFilterInput
        title="Takes"
        placeholder="Start typing to enter effects..."
        deck={(word) => word.takes}
        bind:effectTags={$takesTags}
      />
      <EffectFilterInput
        title="Leaves"
        placeholder="Start typing to enter effects..."
        deck={(word) => word.leaves}
        bind:effectTags={$leavesTags}
      />
    </div>
  </div>
  <div class="list relative px-1.5 overflow-y-auto">
    <WordPanelList {focusedWordIndex} />
  </div>
</div>

<style lang="postcss">
  /* Add a fade out effect above and below the word list. It
     should persist even if the word list is scrolled, therefore,
     sticky comes in handy. */

  .list::before {
    content: "";

    @apply bg-gradient-to-b w-full h-3 sticky block top-0 from-zinc-900;
  }

  .list::after {
    content: "";

    @apply bg-gradient-to-t w-full h-3 sticky block bottom-0 from-zinc-900;
  }
</style>
