<script>
  import 'normalize.css'
  import '../global.scss'
  import { Toaster } from 'svelte-french-toast'
  import Footer from './Footer.svelte'
  import Header from './Header.svelte'
  import { setContext } from 'svelte'
  import { writable } from 'svelte/store'

  const headerHeight = writable(0)
  setContext('headerHeight', headerHeight)
</script>

<Header />
<slot />
<Footer />
<Toaster position={'bottom-right'} />
