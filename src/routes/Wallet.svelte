<script lang="ts">
  import networks, { type ChainId } from '@constants/networks'
  import { BrowserProvider, ethers } from 'ethers'
  import { tokens } from '$lib/stores'
  import { getActivatedClientTokens } from '$lib/networkLib'
  import toast from 'svelte-french-toast'
  import { address as addressStore, chainId as chainIdStore, myPositions } from '$lib/stores'
  import axios from 'axios'
  import * as SERVER from '$lib/constants/server'
  import type { Position } from '@prisma/client'

  $: partialAddress = $addressStore.slice(0, 6) + '...' + $addressStore.slice(-4)

  let justConnected = false
  const toastParams = {
    loading: 'Connecting...',
    success: 'Connected!',
    error: ''
  }

  async function _connect() {
    if (!window.ethereum) {
      toastParams.error = 'Browser wallet not found'
      throw new Error('Browser wallet not found')
    }
    const provider = new BrowserProvider(window.ethereum)
    provider.send('eth_requestAccounts', []).catch(() => {
      toastParams.error = 'Wallet connection failed'
      throw new Error('Wallet connection failed')
    })
    const chainId = await provider.getNetwork().then((network) => Number(network.chainId))
    if (!(chainId in networks)) {
      toastParams.error = 'Unsupported network'
      throw new Error('Unsupported network')
    }
    $chainIdStore = chainId
    const signer = await provider.getSigner()
    getActivatedClientTokens(signer).then(tokens.set)
    const address = await signer.getAddress()
    const { positions } = await signMessage(signer, address)
    $myPositions = positions
    $addressStore = address
    justConnected = true
  }
  function connect() {
    toast.promise(_connect(), toastParams)
  }

  let mouseOver = false
  function disconnect() {
    justConnected = false
    $addressStore = ''
    $tokens = []
    $myPositions = []
  }
  async function signMessage(signer: ethers.Signer, address: string) {
    const signature = await signer.signMessage(SERVER.signatureMsg).catch(() => {
      toastParams.error = 'Unable to sign message'
      throw new Error('Unable to sign message')
    })
    const { data } = await axios
      .post<{ positions: Position[] }>('/api/signature', {
        signature,
        address
      })
      .catch((err) => {
        toastParams.error = 'Unable to verify signature'
        throw new Error('Unable to verify signature')
      })
    return data
  }
</script>

{#if $addressStore}
  <button
    on:mouseenter={() => (mouseOver = true)}
    on:mouseleave={() => {
      mouseOver = false
      justConnected = false
    }}
    on:click={disconnect}
  >
    {#if mouseOver && !justConnected}
      {'Disconnect?'}
    {:else}
      {partialAddress}
    {/if}
  </button>
{:else}
  <button on:click={connect}>Connect Wallet</button>
{/if}

<style lang="scss">
  button {
    font-family: 'JetBrains Mono', monospace;
    background: white;
    border: 1px solid black;
    border-radius: 4px;
    padding: 0.5rem 1rem;
    font-size: 0.8rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease-in-out;
    &:hover {
      background: #000;
      color: white;
    }
  }
</style>
