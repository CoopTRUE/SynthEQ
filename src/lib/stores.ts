import type { ActivatedClientToken } from '@constants/networks'
import type { Position } from '@prisma/client'
import { writable } from 'svelte/store'

export const tokens = writable([] as ActivatedClientToken[])
export const myPositions = writable([] as Position[])
export const address = writable('')
export const chainId = writable(0)
