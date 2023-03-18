import redis from '$lib/server/redis'

function convertToNumber(obj: Record<string, string>) {
  return Object.fromEntries(Object.entries(obj).map(([k, v]) => [k, Number(v)]))
}

export function load() {
  return {
    positions: redis.hgetall('positions'),
    prices: redis.hgetall('prices').then(convertToNumber)
  }
}
