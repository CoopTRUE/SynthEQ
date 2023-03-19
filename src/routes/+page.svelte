<script lang="ts">
  import type { Writable } from 'svelte/store'
  import { browser } from '$app/environment'
  import { getContext } from 'svelte'
  import Position from './Position.svelte'
  import Wallet from './Wallet.svelte'
  import CreatePosition from './CreatePosition.svelte'
  import { address } from '$lib/stores'

  export let data
  const { positions, prices } = data
  let search = ''

  function searchInPositions(position: (typeof data.positions)[number], search: string) {
    if (!search) return position
    const lower = search.toLowerCase()
    return positions.filter((position) => {
      return (
        position.ticker.toLowerCase().includes(lower) ||
        position.buyerAddress?.toLowerCase().includes(lower) ||
        position.shorterAddress?.toLowerCase().includes(lower)
      )
    })
  }

  const headerHeight = getContext<Writable<number>>('headerHeight')
</script>

<svelte:head>
  <title>Home | SynthEQ</title>
  <meta
    name="description"
    content="SynthEQ provides an interface for buying and shorting synthetic equities"
  />
</svelte:head>

<main style:height={`calc(100vh - ${$headerHeight}px)`}>
  <div class="positions-container">
    <input type="text" placeholder="Search" />
    <div class="positions">
      {#if $address}
        <CreatePosition />
      {/if}
      {#each positions as position}
        {#if searchInPositions(position, search)}
          <Position data={position} {prices} />
        {/if}
      {/each}
    </div>
  </div>
</main>

<style lang="scss">
  main {
    display: flex;
    flex-direction: column;
    align-items: center;
    min-height: 300px;
    margin: 0 auto;
  }
  .positions-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 1rem;
    border: 1px solid grey;
    border-radius: 0.5rem;
    margin: 1rem;
    width: 100%;
    max-width: 600px;
  }
</style>
