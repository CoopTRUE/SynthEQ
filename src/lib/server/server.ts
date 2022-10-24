import { refresh } from './db'

const refreshInterval = 10000

refresh()
const interval = setInterval(refresh, refreshInterval)
if (import.meta.hot) {
  import.meta.hot.dispose(() => clearInterval(interval))
}
