<script lang="ts">
  import _ from "lodash";
  import PluggableEffect from "$lib/PluggableEffect.svelte";
  import { createEventDispatcher } from "svelte";
  import { wordSource, effectSource, leavesTags, takesTags } from "./storage";
  import type {
    AnnEffectReference,
    DeckEffectReference,
    EffectDeck,
    EffectDeckEffectReference,
  } from "../types";
  import { createTippy } from "svelte-tippy";

  import "tippy.js/dist/tippy.css";
  import "tippy.js/animations/shift-away.css";

  /**
   * Index into word source of the word whose effect list should
   * be displayed.
   */
  export let wordIndex: number;

  interface RawFragment {
    type: "raw";
    data: string;
  }

  interface DeckReferenceFragment {
    type: "dref";
    data: DeckEffectReference;
  }

  type Fragment = RawFragment | DeckReferenceFragment;

  interface UnfixedFragmentPayload {
    /**
     * Global order within the entire fragments array (1st sorting criterion).
     */
    order: number;

    /**
     * Order within a small subgroup (2nd sorting criterion).
     */
    precedence: number;
  }

  type UnfixedFragment =
    | (RawFragment & UnfixedFragmentPayload)
    | (DeckReferenceFragment & UnfixedFragmentPayload);

  $: word = wordSource[wordIndex];
  $: erefs = word.erefs.map(
    ([eref, owner]) =>
      ({
        effectIndex: eref,
        inferred: wordIndex !== owner,
      } as AnnEffectReference)
  );

  /**
   * Returns a Set of recurring effect reference indices in deck.
   * Beware that it's NOT effect indices, but effect reference indices,
   * i.e. those into a word's erefs property.
   */
  function getRecurringSet(deck: EffectDeck): Set<number> {
    return new Set(
      deck
        .filter(([_, ordinal]) => ordinal > 0)
        .map(([erefsIndex, _]) => erefsIndex)
    );
  }

  /**
   * Gathers more data for the given deck with the help of a list of
   * prepared effect references.
   */
  function getDeckReferences(
    erefs: AnnEffectReference[],
    deck: EffectDeckEffectReference[],
    deckId: "takes" | "leaves"
  ): DeckEffectReference[] {
    const recurring = getRecurringSet(deck);
    const effects: DeckEffectReference[] = deck.map(
      ([erefsIndex, ordinal], indexInDeck) => ({
        ...erefs[erefsIndex],
        indexInDeck,
        deckId,
        ordinal,
        recurring: recurring.has(erefsIndex),
      })
    );

    return _.sortBy(effects, ["indexInDeck", "ordinal"]);
  }

  /**
   * Creates an effect extractor factory with the given named
   * group prefix.
   */
  function createExtractorFactory(prefix: string) {
    return (deckReference: DeckEffectReference) => {
      const { indexInDeck, effectIndex, ordinal } = deckReference;

      const { short } = effectSource[effectIndex];
      const id = `_${prefix}_${effectIndex}_${ordinal}`;
      const subpattern = `(?<${id}>.*?)(?:\\b${short}\\b)`;

      const extract = (groups: Record<string, string>): UnfixedFragment[] => [
        { type: "raw", data: groups[id], precedence: 0, order: indexInDeck },
        {
          type: "dref",
          data: deckReference,
          precedence: 1,
          order: indexInDeck,
        },
      ];

      return { subpattern, extract };
    };
  }

  /**
   * Splits `effect` at effect short names, returns a list of
   * "raw" and "dref" (to either takes or leaves) fragments.
   */
  function effectToFragments(
    erefs: AnnEffectReference[],
    takes: EffectDeck,
    leaves: EffectDeck,
    effect: string
  ): Fragment[] {
    const drefsTakes = getDeckReferences(erefs, takes, "takes");
    const drefsLeaves = getDeckReferences(erefs, leaves, "leaves");

    const takesExtractors = drefsTakes.map(createExtractorFactory("t"));
    const leavesExtractors = drefsLeaves.map(createExtractorFactory("l"));

    /*
     * Create a pattern for takes and leaves. The pattern's goal is to match
     * "gaps" between valid effects. We name the gaps "raw" fragments and
     * effects "effect" fragments.
     */
    const pattern = new RegExp(
      [
        ...takesExtractors.map(({ subpattern }) => subpattern),
        "(?<_t_post>.*?\\s*--\\s*)",
        ...leavesExtractors.map(({ subpattern }) => subpattern),
        "(?<_l_post>.*?)$",
      ].join(""),
      "gs"
    );

    const match = pattern.exec(effect);
    const groups = match?.groups;
    if (groups === undefined) return [{ type: "raw", data: effect }];

    /*
     * Sort takes and leaves fragments by order and then by precedence.
     * Order is kept as in word.takes, and precedence is localized raw->dref
     * precedence (0->1).
     */
    const takesFragments: UnfixedFragment[] = _.sortBy(
      takesExtractors.flatMap(({ extract }) => extract(groups)),
      ["order", "precedence"]
    );

    const leavesFragments: UnfixedFragment[] = _.sortBy(
      leavesExtractors.flatMap(({ extract }) => extract(groups)),
      ["order", "precedence"]
    );

    /*
     * Finally generate the fragment array.
     */
    const fragments = [
      ...takesFragments.map(({ type, data }) => ({ type, data, takes: true })),
      { type: "raw", data: groups["_t_post"] },
      ...leavesFragments.map(({ type, data }) => ({
        type,
        data,
        takes: false,
      })),
      { type: "raw", data: groups["_l_post"] },
    ] as Fragment[];

    if (fragments.length <= 1) return fragments;

    /*
     * Collapse consecutive raw tokens.
     */
    const collapsed: Fragment[] = [];

    let preceding = fragments[0];
    for (let i = 1; i < fragments.length; i++) {
      const fragment = fragments[i];

      if (preceding.type === "raw" && fragment.type === "raw") {
        preceding.data += fragment.data as string;
        continue;
      }

      collapsed.push(preceding);
      preceding = fragment;
    }

    collapsed.push(preceding);

    return collapsed;
  }

  $: fragments = effectToFragments(erefs, word.takes, word.leaves, word.effect);

  const dispatch = createEventDispatcher();

  const tippy = createTippy({
    animation: "shift-away",
    content: "Full name may be misleading. It was inferred from context.",
    placement: "bottom-start",
    theme: "inferred-warning",
  });
</script>

<div class="flex flex-col gap-2">
  <ol class="flex flex-wrap gap-1 items-center">
    {#each fragments as fragment}
      <li class="flex">
        {#if fragment.type === "raw"}
          <p class="font-variation-mono text-sm text-zinc-300">
            {fragment.data}
          </p>
        {:else if fragment.type === "dref"}
          {@const { data } = fragment}

          <PluggableEffect
            effectIndex={data.effectIndex}
            ordinal={data.ordinal}
            recurring={data.recurring}
            tagStore={fragment.takes ? takesTags : leavesTags}
          />

          {#if data.inferred}
            <p class="text-xl text-yellow-400 pl-0.5 cursor-help" use:tippy>
              *
            </p>
          {/if}
        {/if}
      </li>
    {/each}
  </ol>
</div>

<style lang="postcss">
  :global(.tippy-box[data-theme="inferred-warning"]) {
    @apply font-main font-medium bg-yellow-300 text-yellow-900 text-sm rounded;
  }

  :global(.tippy-box[data-theme="inferred-warning"] > .tippy-arrow) {
    @apply text-yellow-300;
  }
</style>
