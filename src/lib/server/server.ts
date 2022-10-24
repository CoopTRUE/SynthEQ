import { refresh } from './db'

refresh()
const interval = setInterval(refresh, 3000)
if (import.meta.hot) {
  import.meta.hot.dispose(() => clearInterval(interval))
}
