import { getPositions, getPrices } from '$lib/server/server'

export function load() {
  return {
    positions: getPositions(),
    prices: getPrices()
  }
}
