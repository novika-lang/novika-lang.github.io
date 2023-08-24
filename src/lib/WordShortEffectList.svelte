<script lang="ts">
  import { hoveredEffectIndex, preprocessedWords } from "./storage";
  import {
    highlightIndex,
    trackEffect,
    unhighlightAll,
    untrackEffect,
  } from "./highlight-effect";

  /**
   * Index of the word whose list of short effects should be displayed.
   */
  export let wordIndex: number;

  let effect: HTMLElement | undefined;

  $: word = preprocessedWords[wordIndex];

  $: if (effect !== undefined)
    $hoveredEffectIndex === undefined
      ? unhighlightAll(effect)
      : highlightIndex(effect, $hoveredEffectIndex);
</script>

<code
  class="effect text-sm text-zinc-500 font-variation-mono overflow-ellipsis overflow-hidden whitespace-nowrap"
  bind:this={effect}
  on:mousemove={trackEffect}
  on:mouseleave={untrackEffect}
>
  {@html word.effectMarkup}
</code>

<style lang="postcss">
  .effect :global(.effect-ref.effect-short) {
    @apply underline decoration-dotted decoration-zinc-600 cursor-pointer;
  }

  .effect :global(.effect-ref.effect-short.target) {
    @apply text-blue-300 decoration-blue-500;
  }
</style>
