import { error } from '@sveltejs/kit'
import type { RequestHandler } from './$types'
import { z } from 'zod'
import { createContract } from '$server/db'

const jsonValidator = z.object({
  cuid: z.string().cuid(),
  txnHash: z.string().startsWith('0x').length(66),
  ticker: z.string(),
  expiration: z.date()
})

export const POST: RequestHandler = async ({ request, getClientAddress }) => {
  try {
    var json = await request.json()
  } catch (e) {
    throw error(400, 'Malformed json')
  }

  try {
    var { cuid, txnHash, expiration, ticker } = jsonValidator.parse(json)
  } catch (e) {
    // @ts-expect-error
    throw error(400, e.issues)
  }

  try {
    const contractId = await createContract(cuid, txnHash, expiration, ticker)
    return new Response(JSON.parse({ contractId }), { status: 200, statusText: 'ALL GOOD SLATT' })
  } catch {
    throw error(400, 'Unexpected server error!')
  }
}
