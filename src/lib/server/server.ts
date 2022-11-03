import './db'
import { ethers } from 'ethers'
import { NETWORKS } from '@constants'

type ChainId = keyof typeof NETWORKS

// looks complex but essentially it creates a provider for each network id
export const providers = Object.entries(NETWORKS).reduce((providers, [id, { rpc }]) => {
  providers[+id as ChainId] = new ethers.providers.JsonRpcProvider(rpc)
  return providers
}, {} as Record<ChainId, ethers.providers.JsonRpcProvider>)
