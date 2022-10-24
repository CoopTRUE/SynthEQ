<script lang="ts">
  import type { Contract } from '@prisma/client'

  export let contracts: Contract[]
  console.log(contracts)
</script>

<div class="wrapper">
  {#each contracts as contract}
    <div class="container">
      <span>Buyer: {contract.buyerAddress}</span>
      <span>Shorter: {contract.shorterAddress}</span>
    </div>
  {/each}
</div>

<style lang="scss">
  .wrapper {
    height: calc(100vh - var(--header-size));
    width: 95vw;
  }
  .container {
    width: 400px;
    height: 400px;
    background: black;
    overflow: scroll;
  }
</style>
