<script lang="ts">
  import WordShortEffectList from "./WordShortEffectList.svelte";
  import { preprocessedWords } from "./storage";
  import { wordURI } from "./util";

  /**
   * Index of the word whose info should be displayed.
   */
  export let wordIndex: number;

  $: word = preprocessedWords[wordIndex];
</script>

<div
  class="flex items-end px-3 py-2 gap-3 border-b-2 border-zinc-600 drop-shadow-lg shadow-zinc-950 bg-zinc-800"
>
  <a class="flex items-end gap-3" href={wordURI(word.name)}>
    <p class="font-normal text-3xl text-zinc-500">#</p>
    <h1 class="font-variation-mono font-semibold text-xl text-zinc-300">
      {word.name}
    </h1>
  </a>

  <WordShortEffectList {wordIndex} />
</div>
