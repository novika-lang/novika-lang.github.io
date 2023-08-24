<script lang="ts">
  import { onMount } from "svelte";
  import tippy, { type Instance as TippyInstance } from "tippy.js";
  import "tippy.js/animations/perspective-subtle.css";
  import WordTip from "./WordTip.svelte";
  import { wordNameToIndex } from "./storage";

  let tipTemplate: HTMLElement | undefined;
  let tipContainer: HTMLElement | undefined;

  let target: HTMLElement | undefined;
  let tippyInstance: TippyInstance | undefined;

  let wordIndex: number | undefined;

  $: wordIndex =
    target !== undefined ? wordNameToIndex.get(target.innerText) : wordIndex;

  function cleanup() {
    if (target === undefined || tippyInstance === undefined) return;

    target = undefined;
    tippyInstance.hide();
  }

  function move(e) {
    if (e.target === null) return;

    const classes = e.target.classList;
    if (!(classes.contains("word-ref") || classes.contains("seamless-ref"))) {
      cleanup();
      return;
    }

    if (Object.is(e.target, target) || tippyInstance === undefined) return;

    target = e.target;

    const referenceClientRect = target.getBoundingClientRect();

    tippyInstance.setProps({
      getReferenceClientRect: () => referenceClientRect,
    });

    tippyInstance.show();
  }

  onMount(() => {
    tippyInstance = tippy(tipContainer, {
      content: tipTemplate,
      placement: "bottom",
      interactive: true,
      trigger: "manual",
      allowHTML: true,
      theme: "word-tip",
      animation: "perspective-subtle",
    });

    return tippyInstance.destroy;
  });
</script>

<!-- svelte-ignore a11y-no-static-element-interactions -->
<div
  class="word-tip"
  bind:this={tipContainer}
  on:mouseenter={cleanup}
  on:mouseleave={cleanup}
  on:mousemove={move}
>
  <slot />
  <div bind:this={tipTemplate} class="z-50">
    {#if wordIndex !== undefined}
      <WordTip {wordIndex} />
    {/if}
  </div>
</div>

<style lang="postcss">
  :global(.tippy-box[data-theme="word-tip"]) {
    @apply font-main bg-zinc-700 rounded;
  }

  :global(.tippy-box[data-theme="word-tip"] > .tippy-content) {
    @apply p-0;
  }

  :global(.tippy-box[data-theme="word-tip"] > .tippy-arrow) {
    @apply text-zinc-700;
  }
</style>
