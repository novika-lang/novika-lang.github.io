import { get, derived, writable, type Readable, type Writable } from "svelte/store";
import { words, effects } from "../assets/payload.json";
import type { EffectTag, PayloadEffect, PayloadWord } from "../types";
import { preprocessWords, type PreprocessedWord } from "$lib/preprocess";

export interface WordFilter {
  /**
   * The function used to obtain filtered results.
   */
  fn: (words: PreprocessedWord[], self: WordFilter) => PreprocessedWord[];

  /**
   * Order of the filter. Filters with smaller order will filter
   * first and the resulting array of filtered words will be fed
   * to this filter.
   */
  order: number;
}

export interface EffectFilter extends WordFilter {
  effect: PayloadEffect;
  referrerWords: Set<number>;
}

/**
 * Access to raw word objects from the payload.
 */
export const wordSource = words as PayloadWord[];

/**
 * Access to raw effect objects from the payload.
 */
export const effectSource = effects as PayloadEffect[];

/**
 * Maps word name to the corresponding `PayloadWord`.
 */
export const wordSourceMap = new Map<string, PayloadWord>();

for (const payloadWord of wordSource)
  wordSourceMap.set(payloadWord.name, payloadWord);

/**
 * Index of the currently hovered effect.
 */
export const hoveredEffectIndex: Writable<number | undefined> = writable();

export const wordFilters: Writable<WordFilter[]> = writable([]);

export const takesTags = writable([]);
export const leavesTags = writable([]);
export const tlFilters = derived([wordFilters], ([$wordFilters]) =>
  $wordFilters.filter((filter) => filter.effect !== undefined),
);

export const searchFilter = writable("");

/**
 * Appends the given word filter to the word filter list.
 */
export function registerFilter(filter: WordFilter) {
  wordFilters.update((filters) => {
    filters.push(filter);
    filters.sort((f1, f2) => f1.order - f2.order);
    return filters;
  });

  return filter;
}

/**
 * Removes the given word filter from the word filter list.
 */
export function unregisterFilter(
  needle: WordFilter | ((needle: WordFilter) => boolean),
) {
  if (typeof needle !== "function") {
    const origNeedle = needle;

    needle = (matchee: WordFilter) => Object.is(matchee, origNeedle);
  }

  wordFilters.update((filters) => {
    filters = filters.filter((filter) => !needle(filter));
    filters.sort((f1, f2) => f1.order - f2.order);
    return filters;
  });
}

/**
 * Recomputes the word filter. If you change word filters this
 * will be done automatically.
 */
export function refilter() {
  wordFilters.update(($wordFilters) => $wordFilters);
}

/**
 * Clears all filters.
 */
export function clearAll() {
  takesTags.set([]);
  leavesTags.set([]);
  searchFilter.set("");

  const $tlFilters = get(tlFilters);

  for (const tlFilter of $tlFilters) unregisterFilter(tlFilter);
}

/**
 * Removes the search filter.
 */
export function removeSearchFilter() {
  searchFilter.set("");
}

/**
 * Removes the given takes tag from the corresponding effect
 * tags input. This will in turn clear all linked filters.
 */
export function removeTakesTag(takesTag: EffectTag) {
  takesTags.update(($takesTags) =>
    $takesTags.filter((it) => !Object.is(it, takesTag)),
  );
}

/**
 * Removes the given leaves tag from the corresponding effect
 * tags input. This will in turn clear all linked filters.
 */
export function removeLeavesTag(leavesTag: EffectTag) {
  leavesTags.update(($leavesTags) =>
    $leavesTags.filter((it) => !Object.is(it, leavesTag)),
  );
}

export const preprocessedWords = preprocessWords(wordSource);

/**
 * Holds filtered, preprocessed words. By default includes all words.
 */
export const filteredWords: Readable<PreprocessedWord[]> = derived(
  [wordFilters],
  ([$wordFilters]) =>
    $wordFilters.reduce(
      (filteredWords, filter) => filter.fn(filteredWords, filter),
      preprocessedWords,
    ),
);

/**
 * Holds indices of filtered words.
 */
export const filteredWordIndexSet: Readable<Set<number>> = derived(
  [filteredWords],
  ([$filteredWords]) => new Set($filteredWords.map((word) => word.index)),
);

/**
 * Maps word names to their indices.
 */
export const wordNameToIndex = new Map(
  preprocessedWords.map((word) => [word.name, word.index]),
);
