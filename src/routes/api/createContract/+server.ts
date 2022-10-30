import { error } from '@sveltejs/kit'
import type { RequestHandler } from './$types'
import { z } from 'zod'
import { NETWORKS } from '@constants'
import { createContract } from '$server/db'
import { ethers } from 'ethers'

type NetworkId = keyof typeof NETWORKS

// looks complex but essentially it creates a provider for each network id
const providers = Object.entries(NETWORKS).reduce((obj, [id, { rpc }]) => {
  obj[+id as NetworkId] = new ethers.providers.JsonRpcProvider(rpc)
  return obj
}, {} as Record<NetworkId, ethers.providers.JsonRpcProvider>)

const jsonValidator = z.object({
  cuid: z.string().cuid(),
  chainId: z.string().refine((chainId) => chainId in NETWORKS, {
    message: `ChainId is not in ${JSON.stringify(Object.keys(NETWORKS))}`
  }),
  txnHash: z.string().regex(/^0x([A-Fa-f0-9]{64})$/),
  ticker: z.string(),
  expiration: z.date().min(new Date())
})

export const POST: RequestHandler = async ({ request, getClientAddress }) => {
  try {
    var json = await request.json()
  } catch (e) {
    throw error(400, 'Malformed json')
  }

  try {
    var { cuid, chainId, txnHash, expiration, ticker } = jsonValidator.parse(json)
  } catch (e) {
    // @ts-expect-error
    throw error(400, e.issues)
  }

  if (transaction) {
  }
  try {
    const contractId = await createContract(cuid, txnHash, expiration, ticker)
    return new Response(JSON.parse({ contractId }), { status: 200, statusText: 'ALL GOOD SLATT' })
  } catch {
    throw error(400, 'Unexpected server error!')
  }
}
