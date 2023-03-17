import { getActivatedServerNetworks } from '$lib/networkLib'
import { WALLET_PRIVATE_KEY } from '$env/static/private'

const networks = await getActivatedServerNetworks(WALLET_PRIVATE_KEY)
console.log(networks)
