import type { NETWORKS } from '@constants'
import type { Contract } from '@prisma/client'
import { PrismaClient } from '@prisma/client'
import * as lt from 'long-timeout'
import moment from 'moment'
export const prisma = new PrismaClient()

// @ts-expect-error
import { getCurrentPrice } from 'yahoo-stock-prices'
getCurrentPrice('QQQ').then(console.log)

// keep users, txns, and contracts in memory to avoid database slowdowns or ddos
export const users = await getUsers()
export const txns = await getTxns()
export const contracts = await getContracts()

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
export async function getUsers() {
  const users = await prisma.user.findMany()
  const cuids = users.map((u) => u.id)
  return cuids
}
export async function getTxns() {
  const transactions = await prisma.transaction.findMany()
  const txns = transactions.map((t) => t.txnHash)
  return txns
}

export async function activateContract(
  cuid: string,
  chainId: number,
  txnHash: string,
  contractId: string
) {
  await prisma.contract.update({
    where: {
      id: contractId
    },
    data: {
      activated: { set: true },
      activatedAt: { set: Date() },

      sharesAtActivation: await getCurrentPrice()
    }
  })
}

export async function createContract(
  cuid: string,
  ticker: string,
  value: number,
  expiration: Date,
  upside: number,
  chainId: number,
  txnHash: string,
  token: string
) {
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
          },
          isCreationPayment: true
        }
      }
    }
  })
  return contract.id
}
export async function login(signature: string, address: string, ip: string) {
  const user = await prisma.user.upsert({
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
  if (users.includes(user.id)) {
    users.push(user.id)
  }
  return user
}
