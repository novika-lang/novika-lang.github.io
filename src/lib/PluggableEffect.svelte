<script lang="ts">
  import {
    effectSource,
    hoveredEffectIndex,
    registerFilter,
    unregisterFilter,
    wordFilters,
    type EffectFilter,
  } from "$lib/storage";
  import type { Writable } from "svelte/store";
  import type { PreprocessedWord } from "$lib/preprocess";
  import type { EffectTag } from "../types";

  /**
   * Index of this effect in this effect pool.
   */
  export let effectIndex: number;

  /**
   * Ordinal of this effect. Counts from 0 but displays from 1.
   */
  export let ordinal = 0;

  /**
   * Whether this effect is recurring. In this case the ordinal
   * will be shown as a subscript.
   */
  export let recurring = false;

  /**
   * Store where this effect will be added to/removed from when
   * plugged or unplugged.
   */
  export let tagStore: Writable<EffectTag[]>;

  // Whether this effect is plugged (present in the store).
  $: plugged = $tagStore.some(
    ({ effectIndex: itsEffectIndex, ordinal: itsOrdinal }) =>
      effectIndex === itsEffectIndex && ordinal <= itsOrdinal
  );

  // Effect object in the effect source.
  $: effect = effectSource[effectIndex];

  // Whether the outline should be drawn. Since we can hover on
  // effect references in markdown too, it's not as easy as CSS
  // hover or something like that.
  $: outline = $hoveredEffectIndex === effectIndex;

  // Find an existing filter object or create a new one.
  $: filter = $wordFilters.find((other) => other.long === effect.long) ?? {
    order: 1,
    effect,
    referrerWords: new Set(effect.words),
    fn(words: PreprocessedWord[], self: EffectFilter): PreprocessedWord[] {
      return words.filter((word) => self.referrerWords.has(word.index));
    },
  };

  // Whether the effect is active -- whether its filter is currently
  // in use.
  $: active = $wordFilters.some((other) => Object.is(other.effect, effect));

  /**
   * Toggle whether the filter for this effect is registered.
   */
  function toggleFilter() {
    active
      ? unregisterFilter((other) => Object.is(other.effect, effect))
      : registerFilter(filter);
  }

  /**
   * Toggle whether this effect is plugged into the corresponding
   * effect tags input.
   */
  function togglePlug() {
    tagStore.update((tags) => {
      if (plugged) {
        return tags.filter(
          ({ effectIndex: itsEffectIndex, ordinal: itsOrdinal }) =>
            !(effectIndex === itsEffectIndex && ordinal <= itsOrdinal)
        );
      }

      let nEqualItems = 0;
      for (const { effectIndex: itsEffectIndex } of tags)
        if (effectIndex === itsEffectIndex) nEqualItems += 1;

      for (let i = nEqualItems; i <= ordinal; i++) {
        tags.push({
          ordinal: i,
          effectIndex,
          qualname: `${effect.long} (${effect.short})`,
        });
      }

      return tags;
    });
  }
</script>

<button
  on:click={toggleFilter}
  on:mouseenter={() => ($hoveredEffectIndex = effectIndex)}
  on:mouseleave={() => ($hoveredEffectIndex = undefined)}
  class="flex px-1 py-0.5 border items-center gap-1 text-sm cursor-pointer rounded {active
    ? 'bg-blue-700 text-blue-50'
    : 'bg-zinc-700 text-zinc-300'} {outline
    ? 'border-blue-300'
    : 'border-transparent'}"
>
  <p
    class="px-1.5 py-0.5 font-variation-mono font-semibold text-zinc-100 rounded-sm text-xs"
    class:bg-zinc-500={!active}
    class:bg-blue-500={active}
  >
    {effect.short}
  </p>
  <div class="flex items-center gap-1 group">
    <p
      class="decoration-wavy font-variation-mono font-medium whitespace-nowrap text-sm"
    >
      {effect.long}
      {#if recurring}
        <sub class="text-zinc-400 font-main">
          {ordinal + 1}
        </sub>
      {/if}
    </p>
  </div>
  <button
    on:click|stopPropagation={togglePlug}
    class="px-1 border border-transparent rounded-sm {plugged
      ? 'bg-blue-500 text-zinc-100 shadow-none border-blue-400'
      : 'bg-zinc-800 shadow-inner shadow-zinc-950 hover:bg-blue-500 hover:text-zinc-100 hover:shadow-none hover:border-blue-300'}"
  >
    <i class="ri-corner-left-up-fill" />
  </button>
</button>
