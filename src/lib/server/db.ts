import type { NETWORKS } from '@constants'
import { PrismaClient } from '@prisma/client'
import * as lt from 'long-timeout'
import moment from 'moment'
export const prisma = new PrismaClient()

// @ts-expect-error
import { getCurrentPrice } from 'yahoo-stock-prices'
getCurrentPrice('QQQ').then(console.log)

export let contracts = await getContracts()
type a = typeof contracts & { b: true }[]
contracts.forEach((contract) => {
  if (contract.completed) return

  const { id, expiration } = contract
  const timeRemaining = expiration.getTime() - Date.now()
  console.log(`Contract ${id} will exercise ${moment(expiration).fromNow()}`)
  lt.setTimeout(() => exerciseContract(id), timeRemaining)
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
export async function createContract(
  cuid: string,
  token: string,
  chainId: number,
  value: number,
  upside: number,
  txnHash: string,
  expiration: Date,
  ticker: string
) {
  const duplicateTxn = !!(await prisma.transaction.count({
    where: {
      txnHash: { equals: txnHash }
    }
  }))
  if (duplicateTxn) {
    throw new Error('DUPLICATE TRANSACTION HASH')
  }

  const cuidExists = !!(await prisma.user.count({
    where: {
      id: { equals: cuid }
    }
  }))
  if (!cuidExists) {
    throw new Error("CUID DOESN'T EXIST")
  }

  const contract = await prisma.contract.create({
    data: {
      expiration,
      ticker,
      value,
      upside,
      buyer: {
        connect: { id: cuid }
      },
      transactions: {
        create: {
          txnHash,
          chainId,
          token,
          value,
          user: {
            connect: { id: cuid }
          }
        }
      }
    }
  })
  return contract.id
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
