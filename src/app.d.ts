// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces
import type { PrismaClient } from '@prisma/client'
import type { ActivatedServerNetworks } from '@constants/networks'
import type { Eip1193Provider } from 'ethers'
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
  var networks: ActivatedServerNetworks
  interface Window {
    readonly ethereum: Eip1193Provider | undefined
  }
}

export {}
