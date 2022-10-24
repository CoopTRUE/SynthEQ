<script lang="ts">
  import type { PageData } from './$types'
  import axios from 'axios'
  import Login from '$components/Login.svelte'
  export let data: PageData
  console.log(data)
</script>

<Login />
<h1>Welcome to SvelteKit</h1>
<p>Visit <a href="https://kit.svelte.dev">kit.svelte.dev</a> to read the documentation</p>
