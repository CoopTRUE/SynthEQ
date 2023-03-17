// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces
import type { PrismaClient } from '@prisma/client'
import type { ActivatedServerNetworks } from '@constants/networks'
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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    readonly ethereum: any
  }
}

export {}
