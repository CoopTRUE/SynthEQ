<script lang="ts">
  import { address, tokens } from '$lib/stores'
  import TokenSelection from './TokenSelection.svelte'

  let selectedToken = $tokens[0]
  $: balance = selectedToken.balance
  let error: string | null = null

  function handleSubmit() {}
</script>

<div class="position">
  <form method="POST" on:submit|preventDefault={handleSubmit}>
    <input type="number" placeholder="Amount" pattern="[0-9]*" />
    <TokenSelection on:change={({ detail }) => (selectedToken = detail)} />
  </form>
</div>
