<script lang="ts">
  import WordTipContainer from "./WordTipContainer.svelte";
  import { goto } from "$app/navigation";
  import { wordURI } from "./util";

  function navigate(e: any) {
    if (!e.target?.classList.contains("seamless-ref")) return;

    const name = e.target.innerText;
    goto(wordURI(name));
  }
</script>

<!-- svelte-ignore a11y-no-static-element-interactions -->
<!-- svelte-ignore a11y-click-events-have-key-events -->
<div on:click={navigate}>
  <WordTipContainer>
    <slot />
  </WordTipContainer>
</div>

<style lang="postcss">
  :global(.seamless-ref) {
    @apply border-b border-zinc-700 hover:border-blue-300 cursor-pointer hover:text-zinc-100;
  }
</style>
