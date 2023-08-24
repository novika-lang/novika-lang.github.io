<script lang="ts">
  import MarkdownView from "./MarkdownView.svelte";
  import NavigatableWordTipContainer from "./NavigatableWordTipContainer.svelte";
  import { hoveredEffectIndex } from "./storage";
  import {
    highlightIndex,
    trackEffect,
    unhighlightAll,
    untrackEffect,
  } from "./highlight-effect";

  let container: HTMLElement | undefined;

  // When the user hovers over effect forward that to other
  // depictions of the same effect.
  $: if (container !== undefined)
    $hoveredEffectIndex === undefined
      ? unhighlightAll(container)
      : highlightIndex(container, $hoveredEffectIndex);

  /**
   * HTML markup that should be displayed.
   */
  export let markup: string;
</script>

<!-- svelte-ignore a11y-no-static-element-interactions -->
<div
  bind:this={container}
  on:mousemove={trackEffect}
  on:mouseleave={untrackEffect}
>
  <NavigatableWordTipContainer>
    <MarkdownView {markup} />
  </NavigatableWordTipContainer>
</div>
