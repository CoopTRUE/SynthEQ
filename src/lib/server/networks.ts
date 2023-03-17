import { getActivatedServerNetworks } from '$lib/networkLib'
import { WALLET_PRIVATE_KEY } from '$env/static/private'

const networks = global.networks || (await getActivatedServerNetworks(WALLET_PRIVATE_KEY))
if (process.env.NODE_ENV === 'development') global.networks = networks

export default networks
