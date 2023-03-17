import type { ActivatedClientToken } from '@constants/networks'
import { writable } from 'svelte/store'

export const tokens = writable([] as ActivatedClientToken[])
