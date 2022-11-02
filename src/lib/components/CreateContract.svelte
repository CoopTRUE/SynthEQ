<script lang="ts">
  import { fade, fly } from 'svelte/transition'
  import { cuid, chainId } from '$client/stores'
  import axios from 'axios'

  type Nullable<T> = T | null
  let upside: Nullable<number> = null
  let txnHash: Nullable<string> = null
  let ticker: Nullable<string> = null
  let expiration: Nullable<Date> = null

  function createContract() {
    modalOpen = !modalOpen
    // axios.post('/createContract', {
    //   cuid,
    //   chainId,
    //   upside,
    //   txnHash,
    //   ticker,
    //   expiration
    // })
  }

  let modalOpen = false
</script>

<div class="create-contract-wrapper center">
  <button on:click={createContract} class="create-contract">CREATE CONTRACT</button>
</div>
{#if modalOpen}
  <div class="wrapper center">
    <div class="modal center" in:fly={{ x: 600 }}>
      <span>haiii</span>
    </div>
    <div class="bg" in:fade on:click={() => (modalOpen = false)} />
  </div>
{/if}

<style lang="scss">
  .create-contract-wrapper {
    width: 100%;
  }
  .create-contract {
    cursor: pointer;
  }
  .wrapper {
    position: fixed;
    top: 0;
    width: 100%;
    height: 100vh;
    > * {
      position: absolute;
    }
  }
  .modal {
    z-index: 101;
    width: 500px;
    height: 300px;
    background: blue;
  }
  .bg {
    width: 100%;
    height: 100%;
    backdrop-filter: blur(4px);
    z-index: 100;
  }
</style>
