<script lang="ts">
  import type { Position, Transaction } from '@prisma/client'

  export let data: Position & { transactions: Transaction[] }
  const {
    id,
    ticker,
    value,
    expiration,
    upside,
    buyerAddress,
    shorterAddress,
    transactions,
    completed
  } = data
  export let prices: Record<string, number>

  function getMarketValue(position: Position) {
    const price = prices[position.ticker]
    return price * position.value
  }
</script>

<div class="container">
  <h2 class="ticker">${ticker.toUpperCase()}</h2>
  <p class="value">${data.value}</p>
</div>

<style lang="scss">
  .container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 1rem;
    border: 1px solid #ccc;
    border-radius: 0.5rem;
    margin: 1rem;
    width: 100%;
    max-width: 400px;
  }

  .ticker {
    font-size: 1.5rem;
    font-weight: 600;
  }

  .value {
    font-size: 1.25rem;
    font-weight: 400;
  }
</style>
