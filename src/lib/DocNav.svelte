<script lang="ts">
  import { page } from "$app/stores";
</script>

<nav class="flex gap-2">
  <a
    class="text-sm text-zinc-200 hover:underline hover:text-blue-400 underline-offset-2"
    class:underline={$page.route.id === "/"}
    href="/">Home</a
  >
  <a
    class="text-sm text-zinc-200 hover:underline hover:text-blue-400 underline-offset-2"
    class:underline={$page.route.id === "/docs/[[name]]"}
    href="/docs">Docs</a
  >
  <a
    class="text-sm text-zinc-200 hover:underline hover:text-blue-400 underline-offset-2"
    href="https://github.com/novika-lang/novika">GitHub</a
  >
  <a
    class="text-sm text-zinc-200 hover:underline hover:text-blue-400 underline-offset-2"
    href="https://github.com/novika-lang/nightly-builds/releases/latest"
  >
    Download
  </a>
</nav>
