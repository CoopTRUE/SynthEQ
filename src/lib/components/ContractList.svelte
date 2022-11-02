<script lang="ts">
  import type { Contract } from '@prisma/client'
  import moment from 'moment'

  export let contracts: Contract[]
  console.log(contracts)
</script>

<div class="wrapper">
  {#each contracts as contract}
    <div class="contract">
      <p class="ticker">{contract.ticker}</p>
      <p class="value">${contract.value}</p>
      <p class="experation">EXPIRES IN {moment(contract.expiration).fromNow()}</p>
    </div>
  {/each}
</div>

<style lang="scss">
  .wrapper {
    margin: 100px;
    display: flex;
    gap: 40px;
    flex-wrap: wrap;
  }
  .contract {
    width: 400px;
    height: 300px;
    background: rgba(255, 255, 255, 0.3);
    border-radius: 8px;
    .ticker {
      color: black;
      font-weight: bolder;
      font-size: 40px;
    }
    .value {
      color: green;
      font-size: 30px;
    }
  }
</style>
