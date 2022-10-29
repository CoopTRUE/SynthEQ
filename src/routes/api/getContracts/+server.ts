import type { PageServerLoad } from './$types'
import { contracts } from '$server/db'
export const GET: RequestHandler = () => {
  return Response(JSON.stringify({ contracts }))
}
