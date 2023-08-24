<script lang="ts">
  import { onMount } from "svelte";
  import { registerFilter, unregisterFilter, refilter } from "./storage";
  import fuzzysort from "fuzzysort";
  import type { PreprocessedWord } from "$lib/preprocess";
  import debounce from "$lib/debounce";

  /**
   * Current word search query.
   */
  export let query = "";

  const searchOptions = {
    keys: ["name", "searchtext"],
  };

  const filterObject = {
    order: 0,
    fn(words: PreprocessedWord[]) {
      return fuzzysort
        .go(query, words, searchOptions)
        .map((result) => result.obj);
    },
  };

  let registered = false;

  /**
   * If the filter object is registered already refilters, otherwise
   * registers the filter object which triggers an automatic refilter.
   */
  function register() {
    if (registered) {
      refilter();
      return;
    }

    registerFilter(filterObject);
    registered = true;
  }

  /**
   * If the filter object is registered unregisters it, triggering
   * an automatic refilter.
   */
  function unregister() {
    if (!registered) return;

    unregisterFilter(filterObject);
    registered = false;
  }

  /**
   * If query string is blank unregisters the filter object,
   * otherwise registers it, refilters it, or both.
   */
  function refresh() {
    query.trim() === "" ? unregister() : register();
  }

  /**
   * Clears the query string and unregisters the filter object.
   */
  function clear() {
    query = "";

    unregister();
  }

  onMount(() => unregister);
</script>

<div
  class="px-2 py-1 rounded-lg bg-zinc-800 flex relative gap-2 items-center hover:border-zinc-500 text-zinc-400 ring-2 ring-zinc-700 focus-within:text-zinc-200 focus-within:ring-blue-500"
>
  <i
    class="absolute ri-search-line group-hover:text-zinc-300 pointer-events-none"
  />
  <input
    class="bg-transparent pl-5 flex-1 text-sm outline-none"
    placeholder="Search for words..."
    bind:value={query}
    use:debounce={{ query, func: refresh, duration: 500 }}
  />
  <button
    class="text-zinc-500 hover:bg-zinc-600 hover:text-zinc-200 hidden 2xl:block cursor-pointer rounded px-1"
    on:click={clear}
  >
    <i class="ri-close-fill" />
  </button>
</div>
