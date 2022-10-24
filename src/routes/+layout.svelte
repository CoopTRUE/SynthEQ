<script>
  import Footer from '$components/Footer.svelte'
  import { SvelteToast } from '@zerodevx/svelte-toast'
  import '../global.scss'
</script>

<slot />
<SvelteToast />
<Footer />
