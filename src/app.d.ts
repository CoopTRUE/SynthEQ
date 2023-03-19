// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces
import '@total-typescript/ts-reset'
import type { PrismaClient } from '@prisma/client'
import type { ActivatedServerNetworks } from '@constants/networks'
import type { Eip1193Provider } from 'ethers'
import type { Redis } from 'ioredis'
declare global {
  namespace App {
    // interface Error {}
    // interface Locals {}
    // interface PageData {}
    // interface Platform {}
  }
  // eslint-disable-next-line no-var
  var prisma: PrismaClient
  // eslint-disable-next-line no-var
  var redis: Redis
  // eslint-disable-next-line no-var
  var networks: ActivatedServerNetworks
  // eslint-disable-next-line no-var
  var interval: NodeJS.Timeout
  interface Window {
    readonly ethereum: Eip1193Provider | undefined
  }
}

export {}
