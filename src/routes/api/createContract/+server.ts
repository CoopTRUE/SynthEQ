import { error } from '@sveltejs/kit'
import type { RequestHandler } from './$types'
import { z } from 'zod'
import { MIN_VALUE, NETWORKS, SERVER_ADDRESS, TOKEN_ABI } from '@constants'
import { createContract } from '$server/db'
import { BigNumber, ethers } from 'ethers'

type NetworkId = keyof typeof NETWORKS
type Tokens = typeof NETWORKS[NetworkId]['tokens']
// looks complex but essentially it creates a provider for each network id
const providers = Object.entries(NETWORKS).reduce((providers, [id, { rpc }]) => {
  providers[+id as NetworkId] = new ethers.providers.JsonRpcProvider(rpc)
  return providers
}, {} as Record<NetworkId, ethers.providers.JsonRpcProvider>)

const jsonValidator = z.object({
  cuid: z.string().cuid(),
  chainId: z.number().refine((chainId) => chainId in NETWORKS, {
    message: `ChainId is not in [${Object.keys(NETWORKS).join(', ')}]`
  }),
  txnHash: z.string().regex(/^0x([A-Fa-f0-9]{64})$/),
  ticker: z.string(),
  expiration: z.number().min(8.64e7)
})
export const POST: RequestHandler = async ({ request, getClientAddress }) => {
  try {
    var json = await request.json()
  } catch (e) {
    throw error(400, 'Malformed json')
  }

  try {
    var { cuid, chainId: _chainId, txnHash, expiration, ticker } = jsonValidator.parse(json)
    var chainId = _chainId as NetworkId
  } catch (e) {
    // @ts-expect-error
    throw error(400, e.issues)
  }

  const provider = providers[chainId]
  try {
    var transaction = await provider.getTransaction(txnHash)
  } catch (e) {
    throw error(400, 'Transaction does not exist!')
  }

  if (transaction.chainId !== chainId) {
    throw error(400, 'Transaction chain id does not match passed chain id!')
  }
  const transactionReceipt = await provider.getTransactionReceipt(txnHash)
  if (!transactionReceipt.status) {
    throw error(400, 'Transaction failed!')
  }
  const contractAddress = transaction.to
  if (
    !Object.values(NETWORKS[chainId].tokens)
      .map((tokenData) => tokenData.address)
      .some((realContractAddress) => realContractAddress === contractAddress)
  ) {
    throw error(400, 'Transaction does not interact with a supported coin')
  }
  const iface = new ethers.utils.Interface(TOKEN_ABI)
  try {
    var transactionData = iface.parseTransaction({
      data: transaction.data,
      value: transaction.value
    })
  } catch (e) {
    throw error(400, 'Transaction is not a transfer transaction!')
  }

  if (transactionData.functionFragment.name !== 'transfer') {
    throw error(400, 'Transaction is not a transfer transaction!')
  }
  // if (transactionData.args.recipient !== SERVER_ADDRESS) {
  //   throw error(400, 'Transaction does not transfer coins to the server address!')
  // }
  if (+ethers.utils.formatEther(transactionData.args.amount) < MIN_VALUE) {
    throw error(400, 'Transaction is too small!')
  }
  return new Response('ok')
  // try {
  //   const contractId = await createContract<chainId>(cuid, txnHash, expiration, ticker)
  //   return new Response(JSON.parse({ contractId }), { status: 200, statusText: 'ALL GOOD SLATT' })
  // } catch {
  //   throw error(400, 'Unexpected server error!')
  // }
}
