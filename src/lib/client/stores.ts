import { readable, writable } from 'svelte/store'
import type { ethers } from 'ethers'
// import io from 'socket.io-client'
import type { NETWORKS } from '@constants'

type Nullable<T> = T | null

// const development = process.env.NODE_ENV === 'development'
// export const socket = readable(development ? io(':2000') : io())

export const connectModalOpen = writable(false)

export const provider = writable<Nullable<ethers.providers.Web3Provider>>(null)
export const address = writable<Nullable<string>>(null)
export const chainId = writable<Nullable<keyof typeof NETWORKS>>(null)

import { browser } from '$app/environment'
export const cuid = writable<Nullable<string>>(
  browser ? localStorage.getItem('cuid') || null : null
)
