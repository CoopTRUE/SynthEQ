export const prerender = false

import { error } from '@sveltejs/kit'
import type { PageServerLoad } from './$types'

import { contracts } from '$server/db'
export const load: PageServerLoad = async ({ params }) => {
  return { contracts }
}
