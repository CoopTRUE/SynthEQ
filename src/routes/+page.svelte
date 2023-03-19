<script>
  import { browser } from '$app/environment'
  import Position from './Position.svelte'
  import Wallet from './Wallet.svelte'

  export let data
  const { positions, prices } = data
</script>

<svelte:head>
  <title>Home | SynthEQ</title>
  <meta
    name="description"
    content="SynthEQ provides an interface for buying and shorting synthetic equities"
  />
</svelte:head>

<main>
  <div class="positions">
    {#each positions as position}
      <Position data={position} {prices} />
    {/each}
  </div>
</main>

<style lang="scss">
  h1 {
    color: green;
  }
</style>
