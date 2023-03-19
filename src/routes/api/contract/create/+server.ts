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

const schema = z.object({
  type: z.enum(['buyer', 'shorter']),
  address: z.string().regex(REGEX.address),
  ticker: z.string().refine((ticker) => SERVER.supportedTickers.includes(ticker)),
  value: z.number().min(POSITION.minValue).max(POSITION.maxValue).int(),
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

  const user = await prisma.user.findUnique({
    where: {
      address
    }
  })
  if (!user) {
    log.reqError(`${ip}: User not found`)
    return new Response('User not found', { status: 404 })
  }

  if (await redis.sismember('processingContractCreation', txnHash)) {
    log.reqError(`${ip}: Contract creation already in progress`)
    return new Response('Contract creation already in progress', { status: 409 })
  }
  await redis.sadd('processingContractCreation', txnHash)
  async function removeProcessingContractCreation() {
    await redis.srem('processingContractCreation', txnHash)
  }

  const network = NETWORKS[chainId]

  const createPosition = parsed.data.type === 'buyer' ? createBuyerPosition : createShorterPosition
  const position = await createPosition(parsed.data)
  removeProcessingContractCreation()

  log.createPosition(`${ip}: ${JSON.stringify(position)}`)
  return json({ position })
}
