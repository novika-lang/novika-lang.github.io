<script lang="ts">
  export let markup: string;
</script>

<div class="markdown">
  {@html markup}
</div>

<style lang="postcss">
  /* General styling */

  .markdown :global(p) {
    @apply mt-3 leading-relaxed px-2;
  }

  .markdown :global(pre) {
    @apply mt-5 bg-zinc-900 text-zinc-300 rounded p-3 text-sm overflow-auto font-variation-mono leading-relaxed ring-1 ring-[#435265];
  }

  .markdown :global(a) {
    @apply text-blue-400 hover:underline;
  }

  .markdown :global(:not(pre) > code),
  .markdown :global(.code) {
    @apply font-variation-mono px-0.5 text-sm bg-zinc-800 border border-zinc-700 rounded-sm;
  }

  .markdown :global(strong) {
    @apply font-semibold;
  }

  .markdown :global(ul) {
    @apply px-3 mt-3;
  }

  .markdown :global(li) {
    @apply list-disc;
  }

  /* Headers */

  .markdown :global(h1) {
    @apply text-2xl text-blue-300 font-semibold mt-5 border rounded border-blue-300 px-1.5 py-0.5;
  }

  .markdown :global(h2) {
    @apply text-xl text-blue-300 font-semibold border-b border-blue-300 mt-4 pb-1;
  }

  .markdown :global(h3) {
    @apply text-lg text-zinc-300 font-medium border-l-2 border-zinc-400 mt-4 pl-2;
  }

  .markdown :global(h4) {
    @apply font-medium mt-3 py-1;
  }

  .markdown :global(h5) {
    @apply text-sm  uppercase font-semibold mt-2 py-1;
  }

  .markdown :global(h6) {
    @apply text-xs uppercase font-semibold mt-1 py-1;
  }

  /* Effect references */

  .markdown :global(.effect-ref.effect-long) {
    @apply border-b pb-0.5 border-zinc-600;
  }

  .markdown :global(.effect-ref.effect-long.target) {
    @apply border-blue-300 cursor-pointer;
  }

  /* Documentation references */

  .markdown :global(.word-ref) {
    @apply text-blue-300 hover:underline cursor-pointer;
  }
</style>
