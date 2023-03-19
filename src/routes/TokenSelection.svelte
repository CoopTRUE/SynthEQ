<script lang="ts">
  import type { ActivatedClientToken } from '@constants/networks'
  import { createEventDispatcher } from 'svelte'
  const dispatch = createEventDispatcher<{ change: ActivatedClientToken }>()
  import { tokens } from '$lib/stores'
  import { fly } from 'svelte/transition'
  import { onMount } from 'svelte'

  let selectedToken = $tokens[0]
  $: otherTokens = $tokens.filter((token) => token.symbol !== selectedToken.symbol)

  let expanded = false

  function toggleToken(token: ActivatedClientToken) {
    selectedToken = token
    expanded = false
  }

  $: dispatch('change', selectedToken)

  onMount(() => {
    refresh()
    // const id = setInterval(refresh, 10000)
    // return () => clearInterval(id)
  })

  async function refresh() {
    // console.time('refresh')
    await Promise.all(
      $tokens.map((token) => {
        token.update()
      })
    )
    // console.timeEnd('refresh')
  }
</script>

<div class="container">
  <button
    on:click={() => (expanded = !expanded)}
    type="button"
    class="token"
    class:greyed={!selectedToken.balance}
    style:background="transparent url({selectedToken.image}) center/contain no-repeat"
    title="{selectedToken.symbol} {selectedToken.balance}"
  />
  {#if expanded}
    {#each otherTokens as token, i}
      <button
        in:fly={{ x: 10, y: 0, delay: i * 100, duration: 400 }}
        out:fly={{ x: 10, y: 0, delay: (otherTokens.length - i - 1) * 60, duration: 180 }}
        on:click={() => toggleToken(token)}
        type="button"
        class="token"
        title="{token.symbol} {token.balance}"
        class:greyed={!token.balance}
        style:background="url({token.image}) center/contain no-repeat"
      />
    {/each}
  {/if}
</div>

<style lang="scss">
  .container {
    display: flex;
    flex-direction: row-reverse;
    gap: 0.75rem;
  }
  .token {
    width: 2rem;
    height: 2rem;
    border: none;
    cursor: pointer;
    transition: transform 0.2s ease-in-out;
    &:focus,
    &:hover {
      transform: scale(1.1);
    }
    &.greyed {
      opacity: 0.5;
    }
  }
</style>
