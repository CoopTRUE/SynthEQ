import type { Contract } from '@prisma/client'
import { PrismaClient } from '@prisma/client'
export const prisma = new PrismaClient()

export let contracts: Contract[] = []

export async function refresh() {
  // console.log('refreshed', Date.now())
  const newContracts = await getContracts()
  if (JSON.stringify(newContracts) !== JSON.stringify(contracts)) {
    console.log(JSON.stringify(newContracts), JSON.stringify(contracts))
    contracts = newContracts
    console.log(`Obtained ${newContracts.length} contracts`)
  }
}

export async function getContracts() {
  return await prisma.contract.findMany({
    where: {
      completed: { equals: false }
    }
  })
}
export async function createContract() {}
export async function login(signature: string, address: string, ip: string) {
  return await prisma.user.upsert({
    where: { signature },
    update: {
      logins: {
        create: { ip }
      }
    },
    create: {
      signature,
      address
    }
  })
}
