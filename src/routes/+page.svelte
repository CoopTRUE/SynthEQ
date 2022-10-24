<script lang="ts">
  import type { PageData } from './$types'
  import axios from 'axios'
  export let data: PageData
  console.log(data)

  function login() {}
</script>

<button on:click={login}>dd</button>
<h1>Welcome to SvelteKit</h1>
<p>Visit <a href="https://kit.svelte.dev">kit.svelte.dev</a> to read the documentation</p>
