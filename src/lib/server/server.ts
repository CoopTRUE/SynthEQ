import redis from './redis'
import * as SERVER from '@constants/server'
import * as stockLib from '$lib/stockLib'
import type { Position } from '@prisma/client'

function entriesMap<T, U>(obj: Record<string, T>, fn: (v: T) => U) {
  return Object.fromEntries(Object.entries(obj).map(([k, v]) => [k, fn(v)]))
}

interface NewPositionArgs {
  ticker: string
  value: number
  expiration: Date
  upside: number
  txnHash: string

  chainId: number
  token: string
}

export async function createBuyerPosition(data: NewPositionArgs & { address: string }) {
  const position = prisma.position.create({
    data: {
      ticker: data.ticker,
      value: data.value,
      expiration: data.expiration,
      upside: data.upside,
      buyer: {
        connect: {
          address: data.address
        }
      },
      transactions: {
        create: {
          txnHash: data.txnHash,
          chainId: data.chainId,
          token: data.token,
          value: data.value,
          user: {
            connect: {
              address: data.address
            }
          },
          isCreationPayment: false
        }
      }
    }
  })
  await redis.sadd('positions', JSON.stringify(position))
  return position
}
export async function createShorterPosition(data: NewPositionArgs & { address: string }) {
  const position = prisma.position.create({
    data: {
      ticker: data.ticker,
      value: data.value,
      expiration: data.expiration,
      upside: data.upside,
      shorter: {
        connect: {
          address: data.address
        }
      },
      transactions: {
        create: {
          txnHash: data.txnHash,
          chainId: data.chainId,
          token: data.token,
          value: data.value,
          user: {
            connect: {
              address: data.address
            }
          },
          isCreationPayment: false
        }
      }
    }
  })
  await redis.sadd('positions', JSON.stringify(position))
  return position
}

export async function getPositions() {
  return await redis
    .smembers('positions')
    .then((positions) => positions.map((p) => JSON.parse(p) as Position))
}
export async function getPrices() {
  return await redis.hgetall('prices').then((prices) => entriesMap(prices, Number))
}

export async function updatePrices() {
  const prices = await stockLib.getPrices()
  const filtered = Object.fromEntries(
    Object.entries(prices).filter(([k, v]) => v !== null)
  ) as Record<string, number>
  await redis.hmset('prices', filtered)
  return false
}

const interval =
  global.interval || updatePrices() || setInterval(updatePrices, SERVER.priceUpdateInterval)
if (process.env.NODE_ENV === 'development') global.interval = interval
