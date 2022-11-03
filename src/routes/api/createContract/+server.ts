import { error } from '@sveltejs/kit'
import type { RequestHandler } from './$types'
import { z } from 'zod'
import { SERVER_ADDRESS, CONSTRAINTS, NETWORKS, TOKEN_ABI } from '@constants'
import { txns, users, createContract } from '$server/db'
import { BigNumber, ethers } from 'ethers'
import { providers } from '$server/server'

type ChainId = keyof typeof NETWORKS

const jsonValidator = z.object({
  cuid: z.string().cuid(),
  ticker: z.string(),
  expiration: z.number().min(8.64e7),
  upside: z.number().nonnegative(),
  chainId: z.number().refine((chainId) => chainId in NETWORKS, {
    message: `ChainId is not in [${Object.keys(NETWORKS).join(', ')}]`
  }),
  txnHash: z.string().regex(/^0x([A-Fa-f0-9]{64})$/)
})
export const POST: RequestHandler = async ({ request, getClientAddress }) => {
  try {
    var json = await request.json()
  } catch (e) {
    throw error(400, 'Malformed json')
  }

  try {
    var { cuid, ticker, expiration, upside, chainId: _chainId, txnHash } = jsonValidator.parse(json)
    var chainId = _chainId as ChainId
  } catch (e) {
    // @ts-expect-error
    throw error(400, e.issues)
  }

  if (!users.includes(cuid)) {
    throw new Error('User does not exist in the database!')
  }
  if (txns.includes(txnHash)) {
    throw new Error('Transaction hash already used!')
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
  if (transactionData.args.recipient !== SERVER_ADDRESS) {
    throw error(400, 'Transaction does not transfer coins to the server address!')
  }
  const value = +ethers.utils.formatEther(transactionData.args.amount)
  if (value < CONSTRAINTS.MIN_CONTRACT_VALUE) {
    throw error(400, 'Transaction is too small!')
  }
  if (value > CONSTRAINTS.MAX_CONTRACT_VALUE) {
    throw error(400, 'Transaction too big!')
  }
  try {
    const contractId = await createContract(
      cuid,
      ticker,
      value,
      new Date(new Date().getTime() + expiration),
      upside,
      chainId,
      txnHash,
      tokenName
    )
    return new Response(JSON.stringify({ contractId }), {
      status: 200,
      statusText: 'ALL GOOD SLATT'
    })
  } catch (e) {
    console.warn(e)
    throw error(400, 'Unexpected server error!')
  }
}
