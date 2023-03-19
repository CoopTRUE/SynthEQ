import redis from './redis'
import * as SERVER from '@constants/server'
import * as stockLib from '$lib/stockLib'
import type { Position, Transaction } from '@prisma/client'

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
    },
    include: {
      transactions: true
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
    },
    include: {
      transactions: true
    }
  })
  await redis.sadd('positions', JSON.stringify(position))
  return position
}

export async function getPositions(): Promise<(Position & { transactions: Transaction[] })[]> {
  // return [
  //   {
  //     id: '123',
  //     activated: true,
  //     completed: false,
  //     expiration: new Date(new Date().getTime() - 1000 * 60 * 60 * 24 * 7),
  //     ticker: 'aapl',
  //     value: 155,
  //     upside: 10,
  //     sharesAtActivation: 1,
  //     transactions: [],
  //     createdAt: new Date(new Date().getTime() - 1000 * 60 * 60 * 24 * 7),
  //     activatedAt: new Date(),
  //     completedAt: null,
  //     buyerAddress: '0x123',
  //     shorterAddress: '0x456',
  //     valueAtCompletion: null
  //   }
  // ]
  return await redis
    .smembers('positions')
    .then((positions) =>
      positions.map((p) => JSON.parse(p) as Position & { transactions: Transaction[] })
    )
}
export async function getPrices() {
  return await redis.hgetall('prices').then((prices) => entriesMap(prices, Number))
}

export async function updatePrices() {
  const prices = await stockLib.getPrices()
  const filtered = Object.fromEntries(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    Object.entries(prices).filter(([_, v]) => v !== null)
  ) as Record<string, number>
  await redis.hmset('prices', filtered)
  return false
}
async function checkPostions() {
  console.log('Checking positions')
  const currentDate = new Date()
  const prices = await getPrices()
  console.log(prices)
  const expiredPositions = await getPositions().then((positions) =>
    positions.filter((p) => p.activated && !p.completed && p.expiration < currentDate)
  )
  console.log('Expired Positions', expiredPositions.length)
  await Promise.all(
    expiredPositions.map(async (position) => {
      const price = prices[position.ticker]
      const valueAtExpiration = (position.sharesAtActivation as number) * price
      const percentageIncrease = (valueAtExpiration / position.value - 1) * 100
      const cappedPercentageIncrease =
        Math.min(Math.abs(percentageIncrease), position.upside) * (percentageIncrease > 0 ? 1 : -1)
      // stockLib.exercisePosition(position, cappedPercentageIncrease)
    })
  )
}

const interval =
  global.interval ||
  updatePrices().then(checkPostions) ||
  setInterval(updatePrices, SERVER.priceUpdateInterval)
if (process.env.NODE_ENV === 'development') global.interval = interval
