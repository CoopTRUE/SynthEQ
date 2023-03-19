<script lang="ts">
  import type { Writable } from 'svelte/store'
  import { page } from '$app/stores'
  import { getContext, setContext } from 'svelte'
  import Wallet from './Wallet.svelte'

  let offsetHeight = 0
  const headerHeight = getContext<Writable<number>>('headerHeight')
  $: $headerHeight = offsetHeight
</script>

<header bind:offsetHeight>
  <p class="title">SynthEQ</p>
  <div class="middle">
    <a href="/" aria-current={$page.url.pathname === '/' ? 'page' : undefined}>Positions</a>

    <a href="/" aria-current={$page.url.pathname === '/my-positions' ? 'page' : undefined}>
      My Positions
    </a>
  </div>
  <div class="wallet-wrapper">
    <Wallet />
  </div>
</header>

<style lang="scss">
  header {
    // display: flex;
    // align-items: center;
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    grid-template-rows: 1fr;
    place-items: center;
    padding: 1rem 4rem;
  }
  .title {
    font-family: 'Yapari', sans-serif;
    font-size: 1.5rem;
  }
  .middle {
    display: flex;
    gap: 1rem;
    // make middle literally the middle
    // https://stackoverflow.com/a/10015027/112731
  }
  a {
    color: #000;
    text-decoration: none;
    &::after {
      content: '';
      display: block;
      width: 0;
      height: 2px;
      background: #000;
      transition: width 0.3s;
    }
    &:hover::after {
      content: '';
      display: block;
      width: 100%;
      height: 2px;
      background: #000;
    }
  }
</style>
