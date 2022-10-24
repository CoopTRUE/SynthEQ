import type { Contract } from '@prisma/client'
import { PrismaClient } from '@prisma/client'
import * as lt from 'long-timeout'
import moment from 'moment'
export const prisma = new PrismaClient()

export let contracts: Contract[] = await getContracts()
contracts.forEach((contract) => {
  if (contract.completed) return

  const contractId = contract.id
  const { expiration } = contract
  const timeRemaining = expiration.getTime() - Date.now()
  console.log(`Contract ${contractId} will exercise ${moment(expiration).fromNow()}`)
  lt.setTimeout(() => exerciseContract(contractId), timeRemaining)
})
export async function refresh() {
  const newContracts = await getContracts()
  console.log(`Refreshed ${newContracts.length} contracts!`)
}

export async function exerciseContract(contractId: string) {
  // TODO: Code exercise function
  await refresh()
}

export async function getContracts() {
  return await prisma.contract.findMany()
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
