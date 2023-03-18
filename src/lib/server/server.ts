import redis from './redis'
import * as SERVER from '@constants/server'
import * as stockLib from '$lib/stockLib'
import type { Position, Prisma } from '@prisma/client'

type ExtractRequired<T> = {
  [K in keyof T]-?: Record<string, unknown> extends Pick<T, K> ? never : K
}[keyof T]
type OnlyRequired<T> = Pick<T, ExtractRequired<T>>

function entriesMap<T, U>(obj: Record<string, T>, fn: (v: T) => U) {
  return Object.fromEntries(Object.entries(obj).map(([k, v]) => [k, fn(v)]))
}

export async function newPosition(data: OnlyRequired<Prisma.PositionCreateInput>) {
  const position = await prisma.position.create({ data })
  await redis.hset('positions', position.ticker, JSON.stringify(position))
  return position
}

export async function getPositions() {
  const positions = await redis.hgetall('positions')
  const parsed = entriesMap(positions, JSON.parse)
  return parsed as Record<string, Position>
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
