import type { RequestHandler } from './$types'
import { contracts } from '$server/db'
export const GET: RequestHandler = () => {
  return new Response(JSON.stringify({ contracts }))
}
