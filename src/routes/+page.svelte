<script>
  import Wallet from './Wallet.svelte'
</script>

<svelte:head>
  <title>Home | SynthEQ</title>
  <meta
    name="description"
    content="SynthEQ provides an interface for buying and shorting synthetic equities"
  />
</svelte:head>

<main>
  <h1>SynthEQ</h1>
  <Wallet />
</main>

<style lang="scss">
  h1 {
    color: green;
  }
</style>
