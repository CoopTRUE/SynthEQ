import { z } from 'zod'
import { json } from '@sveltejs/kit'
import { createBuyerPosition, createShorterPosition } from '$lib/server/server'
import * as SERVER from '@constants/server'
import * as POSITION from '@constants/position'
import * as REGEX from '@constants/regex'
import NETWORKS from '@constants/networks'
import * as log from '$lib/logging'
import prisma from '$lib/server/prisma'
import redis from '$lib/server/redis'
import networks from '$lib/server/networks'

const schema = z.object({
  type: z.enum(['buyer', 'shorter']),
  address: z.string().regex(REGEX.address),
  ticker: z.string().refine((ticker) => SERVER.supportedTickers.includes(ticker)),
  expiration: z
    .date()
    .min(new Date(Date.now() + POSITION.minExpiration))
    .max(new Date(Date.now() + POSITION.maxExpiration)),
  upside: z.number().min(POSITION.minUpside).max(POSITION.maxUpside).int(),
  txnHash: z.string().regex(REGEX.txnHash),
  chainId: z
    .number()
    .refine((chainId) => Object.prototype.hasOwnProperty.call(NETWORKS, chainId))
    .transform((chainId) => chainId as keyof typeof NETWORKS),
  token: z.string().refine((token) => Object.prototype.hasOwnProperty.call(NETWORKS, token))
})

export async function POST({ request }) {
  const ip = request.headers.get('x-forwarded-for') || 'localhost'
  log.reqInfo(`${ip}: Deposit request`)
  const parsed = schema.safeParse(await request.json())
  if (!parsed.success) {
    log.reqError(`${ip}: Parse error ${JSON.stringify(parsed.error)}`)
    return new Response('Invalid request', { status: 400 })
  }

  const { address, txnHash, chainId } = parsed.data

  const user = await prisma.user.findUnique({ where: { address } })
  if (!user) {
    log.reqError(`${ip}: User not found`)
    return new Response('User not found', { status: 404 })
  }

  if (await redis.sismember('processingPositionCreation', txnHash)) {
    log.reqError(`${ip}: Position creation already in progress`)
    return new Response('Position creation already in progress', { status: 409 })
  }
  await redis.sadd('processingPositionCreation', txnHash)
  async function cleanup() {
    await redis.srem('processingPositionCreation', txnHash)
  }

  const network = networks[chainId]
  const transaction = await network.getTransaction(txnHash)
  if (!transaction) {
    log.reqError(`${ip}: Transaction not found`)
    await cleanup()
    return new Response('Transaction not found', { status: 404 })
  }
  const receipt = await network.getTransactionReceipt(txnHash)
  if (!receipt) {
    log.reqError(`${ip}: Transaction not confirmed`)
    await cleanup()
    return new Response('Transaction not confirmed', { status: 400 })
  }
  if (!receipt.status) {
    log.reqError(`${ip}: Transaction failed`)
    await cleanup()
    return new Response('Transaction failed', { status: 400 })
  }
  if (transaction.from.toLowerCase() !== user.address) {
    log.reqError(`${ip}: Transaction not from user`)
    await cleanup()
    return new Response('Transaction not from user', { status: 400 })
  }
  const token = network.tokens.find((token) => token.address === transaction.to)
  if (!token) {
    log.reqError(`${ip}: Transaction not to supported token`)
    await cleanup()
    return new Response('Transaction not to supported token', { status: 400 })
  }
  const args = token.getTransferArgs(transaction.data)
  if (!args) {
    log.reqError(`${ip}: Transaction not a transfer`)
    await cleanup()
    return new Response('Transaction not a transfer', { status: 400 })
  }
  if (args.to !== SERVER.address) {
    log.reqError(`${ip}: Transaction not to server`)
    await cleanup()
    return new Response('Transaction not to server', { status: 400 })
  }
  const price = await token.getPrice()
  const value = args.amount * price
  if (value < POSITION.minValue || value > POSITION.maxValue) {
    log.reqError(`${ip}: Transaction value out of range`)
    await cleanup()
    return new Response('Transaction value out of range', { status: 400 })
  }

  const createPosition = parsed.data.type === 'buyer' ? createBuyerPosition : createShorterPosition
  const position = await createPosition({ ...parsed.data, value })
  await cleanup()

  log.createPosition(`${ip}: ${JSON.stringify(position)}`)
  return json({ position })
}
