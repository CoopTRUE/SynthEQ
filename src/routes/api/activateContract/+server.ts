import type { RequestHandler } from './$types'
import { z } from 'zod'
import { NETWORKS, SERVER_ADDRESS, TOKEN_ABI } from '@constants'
import { ethers } from 'ethers'
import { users, txns, contracts, activateContract } from '$server/db'
import { error } from '@sveltejs/kit'
import { providers } from '$server/server'

type ChainId = keyof typeof NETWORKS

const jsonValidator = z.object({
  cuid: z.string().cuid(),
  chainId: z.number().refine((chainId) => chainId in NETWORKS, {
    message: `ChainId is not in [${Object.keys(NETWORKS).join(', ')}]`
  }),
  txnHash: z.string().regex(/^0x([A-Fa-f0-9]{64})$/),
  contractId: z.string().cuid()
})
const round = (n: number) => Math.ceil(n * 100) / 100

export const POST: RequestHandler = async ({ request, getClientAddress }) => {
  try {
    var json = await request.json()
  } catch (e) {
    throw error(400, 'Malformed json')
  }

  try {
    var { cuid, chainId: _chainId, txnHash, contractId } = jsonValidator.parse(json)
    var chainId = _chainId as ChainId
  } catch {
    // @ts-expect-error
    throw error(400, e.issues)
  }

  if (!users.has(cuid)) {
    throw new Error('User does not exist in the database!')
  }
  if (txns.has(txnHash)) {
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

  const contract = contracts.get(cuid)
  if (!contract) {
    throw error(400, 'Contract could not be found!')
  }
  const activationCost = contract.value * contract.upside

  const value = +ethers.utils.formatEther(transactionData.args.amount)
  if (round(activationCost) !== round(value)) {
    throw error(400, 'Value sent does not equal activation cost')
  }

  try {
    await activateContract(cuid, chainId, txnHash, contractId)
    return new Response('all good babey')
  } catch (e) {
    console.warn(e)
    throw error(400, 'Unexpected server error!')
  }
}
