<script lang="ts">
  import Tags from "svelte-tags-input";
  import "./svelte-tags-input-css.css";
  import {
    effectSource,
    refilter,
    registerFilter,
    unregisterFilter,
    type WordFilter,
  } from "./storage";
  import type { EffectDeck, EffectTag } from "../types";
  import { onMount } from "svelte";
  import type { PreprocessedWord } from "$lib/preprocess";

  /**
   * Title string to display above the input.
   */
  export let title: string;

  /**
   * Placeholder string to display when there is no value.
   */
  export let placeholder: string;

  /**
   * List of effect tags to display.
   */
  export let effectTags: EffectTag[] = [];

  /**
   * Function used to extract the deck-of-interest from the
   * given wrod.
   */
  export let deck: (word: PreprocessedWord) => EffectDeck;

  interface WhateverFilter {
    ordinal: number;
    match: (word: PreprocessedWord) => boolean;
  }

  interface TagFilter extends WhateverFilter {
    effectIndex: number;
  }

  const WHATEVER: EffectTag = { qualname: "Placeholder (*)", ordinal: 0 };

  let filters: (TagFilter | WhateverFilter)[] = [];

  const filterObj: WordFilter = {
    order: 2,
    fn(words): PreprocessedWord[] {
      return words.filter((word) =>
        filters.every((filter) => filter.match(word))
      );
    },
  };

  /**
   * Creates a match function for tags other than "whatever".
   */
  function createMatch(effectIndex: number, ordinal: number) {
    return (word: PreprocessedWord) => {
      // Localize effect index: find effect reference index for the
      // given effect index.
      const erefIndex = word.erefs.findIndex(
        ([itsEffectIndex]) => itsEffectIndex === effectIndex
      );
      if (erefIndex === -1) return false;

      // Find [erefIndex, ordinal] in the word's deck. If found the word
      // is a match, if not, it's not.
      return deck(word).some(
        ([itsErefIndex, itsOrdinal]) =>
          erefIndex === itsErefIndex && ordinal === itsOrdinal
      );
    };
  }

  /**
   * Creates a match function for the "whatever" tag.
   */
  function createWhateverMatch(n: number) {
    return (word: PreprocessedWord) => deck(word).length > n;
  }

  onMount(() => {
    registerFilter(filterObj);

    return () => unregisterFilter(filterObj);
  });

  let tally: Map<number, number>;

  // Recompute the filters array whenever the effect tags
  // array is updated.
  $: {
    const newTally = new Map<number, number>();

    filters = effectTags.map((tag, index) => {
      const effectIndex = tag.effectIndex ?? -1;
      const ordinal = newTally.get(effectIndex) ?? 0;
      newTally.set(effectIndex, ordinal + 1);

      return tag.effectIndex === undefined
        ? { ordinal, match: createWhateverMatch(index) }
        : { effectIndex, ordinal, match: createMatch(effectIndex, ordinal) };
    });

    tally = newTally;
  }

  // We have to ask the filtering system to refilter because it's
  // unaware of the change.
  $: filters, refilter();

  let effectList: EffectTag[];

  // Generate the list of effects which the user can enter based on
  // current tally. The next set of effects should have their ordinal
  // incremented if they are the same effect that was previously entered.
  //
  // E.g., let's say before the user enters Form its ordinal is 0 (default),
  // after they enter it the tally is recomputed, Form's count is now 1,
  // therefore, Form's next ordinal were the user to input Form again will be 1,
  // entering will triggers a tally recompute and so on.
  $: tally,
    (effectList = [
      WHATEVER,
      ...effectSource.map((effect, index) => {
        const count = tally.get(index) ?? 0;
        return {
          effectIndex: index,
          ordinal: count,
          qualname: `${effect.long} (${effect.short})`,
        };
      }),
    ]);
</script>

<div class="flex flex-col gap-2">
  <div class="flex items-center justify-between gap-3">
    <div class="flex-1 text-xs flex items-center justify-between">
      <p class="uppercase tracking-wide font-semibold text-zinc-300">
        <i class="ri-filter-line" />
        {title}
      </p>
      <button
        class="font-normal text-zinc-500 hover:text-zinc-300 border-b border-b-transparent hover:border-b-zinc-300"
        on:click={() => (effectTags = [])}
      >
        <i class="ri-filter-off-line" />
        Clear
      </button>
    </div>
  </div>
  <div class="effects-input">
    <Tags
      autoCompleteKey={"qualname"}
      addKeys={[9, 13, 188]}
      minChars={0}
      allowPaste={true}
      allowDrop={true}
      autoComplete={effectList}
      onlyAutocomplete={true}
      {placeholder}
      bind:tags={effectTags}
    />
  </div>
</div>

<style lang="postcss">
  .effects-input :global(.svelte-tags-input),
  .effects-input :global(.svelte-tags-input-tag),
  .effects-input :global(.svelte-tags-input-matchs),
  .effects-input :global(.svelte-tags-input-layout label) {
    @apply font-main;
  }

  .effects-input :global(.svelte-tags-input-layout) {
    @apply bg-zinc-800 border-none ring-2 ring-zinc-700 rounded-md px-1 py-1 lg:px-2 gap-1 transition-colors duration-100 focus-within:ring-blue-500 overflow-x-auto !important;
  }

  .effects-input :global(.svelte-tags-input-layout:focus),
  .effects-input :global(.svelte-tags-input-layout:hover) {
    @apply border-none !important;
  }

  .effects-input :global(.svelte-tags-input-layout .sr-only) {
    @apply hidden !important;
  }

  .effects-input :global(.svelte-tags-input) {
    @apply m-0 text-zinc-300 placeholder:text-zinc-500 placeholder:text-xs lg:placeholder:text-sm min-w-0 !important;
  }

  .effects-input :global(button + .svelte-tags-input::placeholder) {
    @apply text-transparent !important;
  }

  .effects-input :global(.svelte-tags-input-tag) {
    @apply flex items-center justify-between gap-1 m-0 bg-zinc-600 rounded px-1 text-zinc-300 font-medium text-xs lg:text-sm !important;
  }

  .effects-input :global(.svelte-tags-input-tag-remove) {
    text-indent: -9999px !important;
    line-height: 0 !important; /* Collapse the original line */
    @apply ml-0 flex items-center justify-between !important;
  }

  .effects-input :global(.svelte-tags-input-tag-remove::after) {
    content: "\0EB99";
    text-indent: 0;
    font-family: "remixicon";
    @apply leading-tight block hover:bg-zinc-700 px-0.5 rounded-full !important;
  }

  .effects-input :global(.svelte-tags-input-matchs) {
    @apply bg-zinc-800 border-none ring-2 ring-zinc-700 z-50 rounded mt-2 !important;
  }

  .effects-input :global(.svelte-tags-input-matchs li) {
    @apply px-2 py-1 text-zinc-300 font-normal !important;
  }

  .effects-input :global(.svelte-tags-input-matchs li strong) {
    @apply font-semibold text-zinc-100 !important;
  }

  .effects-input :global(.svelte-tags-input-matchs li:hover),
  .effects-input :global(.svelte-tags-input-matchs li.focus) {
    @apply bg-blue-500 text-zinc-200 rounded-none !important;
  }
</style>
