<script lang="ts">
  export let markdown: string;
</script>

<div class="leading-relaxed markdown">
  {@html markdown}
</div>

<style lang="postcss">
  .markdown :global(p) {
    @apply text-zinc-200;
  }

  .markdown :global(pre) {
    @apply mt-2 border border-l-4 border-zinc-500  text-zinc-300 rounded p-2 text-xs overflow-hidden font-variation-mono;
  }

  .markdown :global(a) {
    @apply text-blue-400 pointer-events-none;
  }

  .markdown :global(:not(pre) > code),
  .markdown :global(.code) {
    @apply font-variation-mono px-0.5 text-xs bg-zinc-600 border border-zinc-500 rounded;
  }

  .markdown :global(strong) {
    @apply font-semibold;
  }

  .markdown :global(ul) {
    @apply flex flex-col gap-2 pt-1;
  }

  .markdown :global(li) {
    @apply list-disc;
  }

  .markdown :global(h1),
  .markdown :global(h2),
  .markdown :global(h3),
  .markdown :global(h4),
  .markdown :global(h5),
  .markdown :global(h6) {
    @apply font-bold mt-1 pl-3;
  }

  /* Effect references */

  .markdown :global(.effect-ref.effect-long) {
    @apply underline underline-offset-4 decoration-dotted decoration-zinc-400;
  }

  /* Documentation references */

  .markdown :global(.word-ref) {
    @apply text-zinc-300;
  }
</style>
