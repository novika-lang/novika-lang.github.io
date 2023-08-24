<script lang="ts">
  import {
    leavesTags,
    searchFilter,
    takesTags,
    unregisterFilter,
    tlFilters,
    removeSearchFilter,
    removeTakesTag,
    removeLeavesTag,
    clearAll,
    filteredWords,
    preprocessedWords,
  } from "./storage";
</script>

<div
  class="bg-zinc-900 border-t border-zinc-800 flex justify-between items-start px-3 py-2 gap-2"
>
  <ul class="flex flex-1 gap-2 w-full items-center overflow-x-auto">
    <li class="text-xs text-zinc-500 whitespace-nowrap">
      Showing {$filteredWords.length}/{preprocessedWords.length} word(s) matching:
    </li>
    {#if $searchFilter.length > 0}
      <li class="bg-zinc-800 rounded px-1 py-0.5 flex gap-1 text-sm">
        <i class="ri-search-line text-zinc-400" />
        <p class="font-medium text-zinc-300 whitespace-nowrap">
          {$searchFilter}
        </p>
        <button
          class="hover:bg-zinc-600 rounded-full px-0.5"
          on:click={removeSearchFilter}
        >
          <i class="ri-close-fill" />
        </button>
      </li>
    {/if}
    {#each $tlFilters as tlFilter}
      <li class="bg-zinc-800 rounded px-1 py-0.5 flex gap-1 text-sm">
        <i class="ri-expand-left-right-line text-zinc-400" />
        <p class="font-medium text-zinc-300 whitespace-nowrap">
          {tlFilter.effect.long} ({tlFilter.effect.short})
        </p>
        <button
          class="hover:bg-zinc-600 rounded-full px-0.5"
          on:click={() => unregisterFilter(tlFilter)}
        >
          <i class="ri-close-fill" />
        </button>
      </li>
    {/each}
    {#each $takesTags as takesTag}
      <li class="bg-zinc-800 rounded px-1 py-0.5 flex gap-1 text-sm">
        <i class="ri-corner-left-up-fill text-zinc-400" />
        <p class="font-medium text-zinc-300 whitespace-nowrap">
          {takesTag.qualname}<sub class="ml-0.5">{takesTag.ordinal + 1}</sub>
        </p>
        <p class="text-zinc-500 ml-1 font-variation-mono">--</p>
        <button
          class="hover:bg-zinc-600 rounded-full px-0.5"
          on:click={() => removeTakesTag(takesTag)}
        >
          <i class="ri-close-fill" />
        </button>
      </li>
    {/each}
    {#each $leavesTags as leavesTag}
      <li class="bg-zinc-800 rounded px-1 py-0.5 flex gap-1 text-sm">
        <p class="text-zinc-500 ml-1 font-variation-mono">--</p>
        <p class="font-medium text-zinc-300 whitespace-nowrap">
          {leavesTag.qualname}<sub class="ml-0.5">{leavesTag.ordinal + 1}</sub>
        </p>
        <button
          class="hover:bg-zinc-600 rounded-full px-1"
          on:click={() => removeLeavesTag(leavesTag)}
        >
          <i class="ri-close-fill" />
        </button>
      </li>
    {/each}
  </ul>
  <button
    class="text-zinc-400 hover:underline hover:text-zinc-200 underline-offset-2"
    on:click={clearAll}
  >
    Clear all
  </button>
</div>
