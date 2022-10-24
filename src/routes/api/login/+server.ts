import { verifyMessage } from 'ethers/lib/utils'
import { login } from '$server/db'
import { error } from '@sveltejs/kit'
import { z } from 'zod'
import type { RequestHandler } from './$types'

const jsonValidator = z.object({
  address: z.string().startsWith('0x').length(42),
  signature: z.string().startsWith('0x').length(132)
})

export const POST: RequestHandler = async ({ request, getClientAddress }) => {
  try {
    var json = await request.json()
  } catch (e) {
    throw error(400, 'Malformed json')
  }

  try {
    var { address, signature } = jsonValidator.parse(json)
  } catch (e) {
    // @ts-expect-error
    throw error(400, e.issues)
  }

  const defaultMessage = `Signing this message confirms you control ${address}`
  const addressFromSig = verifyMessage(defaultMessage, signature).toLowerCase()
  if (addressFromSig !== address) {
    throw error(400, 'Signature was not signed by address')
  }

  const user = await login(
    signature,
    address,
    request.headers.get('x-forwarded-for') || getClientAddress()
  )

  return new Response(user.id)
}
