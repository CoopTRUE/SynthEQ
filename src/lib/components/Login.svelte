<script lang="ts">
  import { cuid } from '$client/stores'
  import axios from 'axios'

  function login() {}
</script>

<div class="container center">
  {#if $cuid}
    <p>connected!</p>
  {:else}
    <p>Please login</p>
  {/if}
</div>

<style lang="scss">
  .container {
    background: green;
  }
</style>
