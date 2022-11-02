<script lang="ts">
  import type { PageData } from './$types'
  import ContractList from '$components/ContractList.svelte'
  export let data: PageData
</script>

<h1 class="center">Welcome to synthEQ</h1>
<ContractList contracts={data.contracts} />

<style>
  h1 {
    font-size: var(--header-size);
  }
</style>
