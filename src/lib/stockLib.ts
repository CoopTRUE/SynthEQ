import { supportedSymbols } from '@constants/server'
import yahooFinance from 'yahoo-finance2'
import * as log from '$lib/logging'

export type SupportedSymbol = (typeof supportedSymbols)[number]

export async function getPrice(ticker: string) {
  const price = await yahooFinance
    .quote(ticker)
    .then((quote) => quote.regularMarketPrice ?? null)
    .catch(() => null)
  if (price === null) {
    log.error(`Failed to fetch price for ${ticker}`)
  }
  return price
}

export async function getPrices() {
  const prices = await Promise.all(
    supportedSymbols.map(async (ticker) => [ticker, await getPrice(ticker)] as const)
  )
  return Object.fromEntries(prices)
}
