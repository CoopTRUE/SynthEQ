<script lang="ts">
  import { address, chainId, tokens } from '$lib/stores'
  import axios from 'axios'
  import TokenSelection from './TokenSelection.svelte'
  import * as SERVER from '@constants/server'
  import * as POSITION from '@constants/position'
  import toast from 'svelte-french-toast'
  import type { Position, Transaction } from '@prisma/client'

  let type: 'buyer' | 'shorter' = 'buyer'
  let ticker = ''
  let expiration = new Date()
  let upside = 0
  let selectedToken = $tokens[0]
  $: balance = selectedToken.balance
  let amount = POSITION.minValue
  let error: string | null = null

  let creating = false
  let creatingConfirmed = false

  async function handleSubmit() {
    const transaction = await selectedToken.transfer(SERVER.address, amount).catch((err) => {
      toast.error('Transaction failed.')
      throw err
    })
    let depositingConfirmed = true
    const receipt = await transaction.wait()
    if (!receipt?.status) {
      toast.error('Transaction failed.')
      return
    }
    await new Promise((resolve) => setTimeout(resolve, 100))
    await axios
      .post<{ position: Position & { transactions: Transaction[] } }>('/api/position/create', {
        type,
        address: $address,
        ticker,
        expiration,
        upside,
        txnHash: transaction.hash,
        chainId: chainId,
        token: selectedToken.symbol
      })
      .then(() => {
        toast.success('Position created! Refresh page to see it.')
      })
      .catch((err) => {
        console.log(err)
        toast.error('Position creation failed.', {
          duration: 5000
        })
      })
  }
</script>

<div class="position">
  <form method="POST" on:submit|preventDefault={handleSubmit}>
    <input type="number" placeholder="Amount" pattern="[0-9]*" />
    <TokenSelection on:change={({ detail }) => (selectedToken = detail)} />
  </form>
</div>
