<script lang="ts">
  import { filteredWords, preprocessedWords } from "./storage";
  import MarkdownRelaxedView from "./MarkdownRelaxedView.svelte";
  import { wordURI } from "./util";

  /**
   * Index of this panel in the panel list (if any).
   */
  export let ownIndex = 0;

  /**
   * Index of the word whose information should be displayed
   * by this panel.
   */
  export let wordIndex: number;

  /**
   * Whether the panel is currently focused. When this prop changes
   * the panel is automatically scrolled into view.
   */
  export let focused: boolean = false;

  $: word = preprocessedWords[wordIndex];

  let thisPanel: HTMLElement | undefined;

  function scrollIntoViewIf(condition: boolean) {
    if (!condition) return;

    thisPanel?.scrollIntoView({
      behavior: "smooth",
      block: "center",
    });
  }

  // When this panel becomes focused we should scroll it into view.
  $: scrollIntoViewIf(thisPanel !== undefined && focused);
  $: if ($filteredWords.length < preprocessedWords.length)
    scrollIntoViewIf(ownIndex === 0 && thisPanel !== undefined);
</script>

<a
  href={wordURI(word.name)}
  class="bg-zinc-800 p-2 rounded flex flex-col justify-center gap-1 cursor-pointer hover:bg-zinc-700 border"
  class:border-blue-300={focused}
  class:border-transparent={!focused}
  class:border-l-zinc-500={!focused}
  bind:this={thisPanel}
>
  <div class="flex gap-2">
    <h1 class="text-sm font-semibold font-variation-mono text-zinc-300">
      {word.name}
    </h1>
    <p
      class="effect font-variation-mono text-zinc-500 text-sm overflow-hidden overflow-ellipsis whitespace-nowrap"
    >
      {@html word.effectMarkup}
    </p>
  </div>
  <div class="primer text-xs overflow-hidden">
    <MarkdownRelaxedView markdown={word.primerMarkup} />
  </div>
</a>

<style lang="postcss">
  .primer :global(a) {
    @apply pointer-events-none;
  }

  .primer :global(.effect-ref.effect-long) {
    @apply decoration-zinc-500;
  }

  .effect :global(.effect-ref.effect-short) {
    @apply underline decoration-dotted decoration-zinc-600 underline-offset-2;
  }
</style>
