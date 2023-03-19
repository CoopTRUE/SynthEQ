import * as SERVER from '@constants/server'
import * as REGEX from '@constants/regex'
import { z } from 'zod'
import { ethers } from 'ethers'
import prisma from '$lib/server/prisma'
import { json } from '@sveltejs/kit'
import * as log from '$lib/logging'

const schema = z.object({
  signature: z.string().regex(REGEX.signature),
  address: z.string().regex(REGEX.address)
})
export async function POST({ request }) {
  const ip = request.headers.get('x-forwarded-for') || 'localhost'
  log.reqInfo(`${ip}: Login request`)
  const reqJson = await request.json()
  const parsed = schema.safeParse(reqJson)
  if (!parsed.success) {
    log.reqError(`${ip}: Parse error ${JSON.stringify(parsed.error)}`)
    return new Response('Invalid Request', { status: 400 })
  }

  const { address, signature } = parsed.data
  const recoveredAddress = ethers.verifyMessage(SERVER.signatureMsg, signature)
  if (recoveredAddress !== address) {
    log.reqError(`${ip}: Signature mismatch`)
    return new Response('Unauthorized', { status: 401 })
  }

  log.login(`New login from ${address.slice(0, 10)}... at ${ip}`)
  const { buyerPositions } = await prisma.user.upsert({
    where: { signature },
    update: {
      logins: { create: { ip } }
    },
    create: {
      address,
      signature,
      logins: { create: { ip } }
    },
    select: { buyerPositions: true }
  })
  return json({ buyerPositions })
}
