import { error } from '@sveltejs/kit'
import type { RequestHandler } from './$types'
import { z } from 'zod'
import { MIN_VALUE, MAX_VALUE, NETWORKS, SERVER_ADDRESS, TOKEN_ABI } from '@constants'
import { createContract } from '$server/db'
import { BigNumber, ethers } from 'ethers'

type ChainId = keyof typeof NETWORKS

// looks complex but essentially it creates a provider for each network id
const providers = Object.entries(NETWORKS).reduce((providers, [id, { rpc }]) => {
  providers[+id as ChainId] = new ethers.providers.JsonRpcProvider(rpc)
  return providers
}, {} as Record<ChainId, ethers.providers.JsonRpcProvider>)

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
    var chainId = _chainId as ChainId
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
  // looks really complex but its finding the first token that contains this contract address
  const tokenName = Object.entries(NETWORKS[chainId].tokens).find(
    ([_, address]) => address === contractAddress
  )?.[0]
  if (!tokenName) {
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
  const value = +ethers.utils.formatEther(transactionData.args.amount)
  if (value < MIN_VALUE) {
    throw error(400, 'Transaction is too small!')
  }
  if (value > MAX_VALUE) {
    throw error(400, 'Transaction too big!')
  }
  try {
    const contractId = await createContract(
      cuid,
      tokenName,
      value,
      txnHash,
      new Date(new Date().getTime() + expiration),
      ticker
    )
    // return new Response(JSON.parse({ contractId }), { status: 200, statusText: 'ALL GOOD SLATT' })
  } catch {
    throw error(400, 'Unexpected server error!')
  }
  return new Response('d')
}
