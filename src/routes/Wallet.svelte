<script lang="ts">
  import { BrowserProvider } from 'ethers'
  import { tokens } from '$lib/stores'
  import { getActivatedClientTokens } from '$lib/networkLib'
  let address = ''

  async function connect() {
    const provider = new BrowserProvider(window.ethereum)
    console.log(provider)
    provider.send('eth_requestAccounts', []).then((accounts: string[]) => {
      address = accounts[0]
    })
    const signer = await provider.getSigner()
    console.time('getActivatedClientTokens')
    $tokens = await getActivatedClientTokens(signer).then((tokens) => {
      console.log(tokens)
      return tokens
    })
    console.timeEnd('getActivatedClientTokens')
  }
</script>

<button on:click={connect}>{address || 'connect!'}</button>
