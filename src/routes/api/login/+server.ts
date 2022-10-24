import { error } from '@sveltejs/kit'
import type { RequestHandler } from './$types'

export const POST: RequestHandler = async ({ request }) => {
  try {
    var json = await request.json()
  } catch (e) {
    throw error(404, 'Malformed json')
  }
  return new Response(JSON.stringify(true))
}
