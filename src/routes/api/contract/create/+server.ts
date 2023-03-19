import { z } from 'zod'
import { json } from '@sveltejs/kit'
import { createBuyerPosition, createShorterPosition } from '$lib/server/server'
import * as SERVER from '@constants/server'
import * as POSITION from '@constants/position'

const schema = z.object({
  ticker: z.string().refine((ticker) => SERVER.supportedTickers.includes(ticker)),
  value: z.number().min(POSITION.minValue).max(POSITION.maxValue).int(),
  expiration: z.date().min(new Date(Date.now() + POSITION.minExpiration)).max(new Date(Date.now() + POSITION.maxExpiration)),
  upside: z.number().min(POSITION.minUpside).max(POSITION.maxUpside).int(),


export function POST() {
  return json({ message: 'Hello world!' })
}
