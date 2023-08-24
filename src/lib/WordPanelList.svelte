<script lang="ts">
  import WordPanel from "./WordPanel.svelte";
  import { filteredWordIndexSet } from "./storage";

  /**
   * Index of the currently focused word, or undefined if there is
   * no currently focused word.
   */
  export let focusedWordIndex: number | undefined;
</script>

<ul class="flex flex-col gap-3">
  {#each $filteredWordIndexSet as wordIndex, ownIndex (wordIndex)}
    <li>
      <WordPanel
        {ownIndex}
        {wordIndex}
        focused={wordIndex === focusedWordIndex}
      />
    </li>
  {:else}
    <li class="w-full text-zinc-400">
      <p>No words found :(</p>
    </li>
  {/each}
</ul>
