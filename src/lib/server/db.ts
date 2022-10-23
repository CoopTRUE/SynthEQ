import type { Contract } from '@prisma/client'
import { PrismaClient } from '@prisma/client'
export const prisma = new PrismaClient()

export let contracts: Contract[] = []

export async function refresh() {
  const newContracts = await getContracts()
  console.log(`Obtained ${newContracts.length} contracts`)
  if (JSON.stringify(newContracts) !== JSON.stringify(contracts)) {
    contracts = newContracts
    console.log('CONTRACTS OVERWRITTEN')
  }
}

export async function getContracts() {
  return await prisma.contract.findMany({
    where: {
      completed: { equals: false }
    }
  })
}
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
