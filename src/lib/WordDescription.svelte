<script lang="ts">
  import MarkdownWithWordTips from "./MarkdownWithWordTips.svelte";
  import { preprocessedWords } from "./storage";

  /**
   * Index of the word whose description should be displayed.
   */
  export let wordIndex: number;

  $: word = preprocessedWords[wordIndex];
</script>

<MarkdownWithWordTips markup={word.markdownMarkup} />
