<script lang="ts">
  import MarkdownRelaxedView from "./MarkdownRelaxedView.svelte";
  import { preprocessedWords } from "./storage";

  export let wordIndex: number;

  $: word = preprocessedWords[wordIndex];
</script>

<div class="p-2">
  <div class="flex gap-2 items-center">
    <i class="ri-article-line" />
    <h2 class="font-variation-mono text-lg text-zinc-200">
      {word.name}
    </h2>
    <div
      class="effect font-variation-mono text-xs text-zinc-400 overflow-ellipsis overflow-hidden whitespace-nowrap"
    >
      {@html word.effectMarkup}
    </div>
  </div>
  <div class="tooltip-content w-[18rem] h-[6rem]">
    <MarkdownRelaxedView markdown={word.markdownMarkup} />
  </div>
</div>

<style>
  .tooltip-content {
    -webkit-mask-image: -webkit-gradient(
      linear,
      top,
      bottom,
      from(black),
      to(transparent)
    );
    -webkit-mask-image: linear-gradient(to bottom, black 0%, transparent 100%);
    mask-image: -webkit-gradient(
      linear,
      top,
      bottom,
      from(black),
      to(transparent)
    );
    mask-image: linear-gradient(to bottom, black 0%, transparent 100%);
  }

  .effect :global(.effect-ref.effect-short) {
    @apply underline underline-offset-2 decoration-dotted decoration-zinc-500;
  }
</style>
