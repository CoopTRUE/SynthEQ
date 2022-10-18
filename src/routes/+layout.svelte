<script>
  import { SvelteToast } from '@zerodevx/svelte-toast'
  import '../global.scss'

  import { browser } from '$app/environment'
  import { connect } from '$lib/socket'
  if (browser) connect()
</script>

<slot />
<SvelteToast />
