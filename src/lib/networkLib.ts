//hi
import NETWORKS, {
  type ActivatedClientToken,
  type ActivatedServerNetworks,
  type ActivatedServerToken,
  type Token,
  type ChainId
} from '@constants/networks'
import ABI from '@constants/abi'
import { ethers } from 'ethers'
import * as SERVER from '@constants/server'
import * as log from '$lib/logging'

const iface = new ethers.Interface(ABI)

async function retryOnFail<T>(fn: () => Promise<T>, maxRetries = 5, delay = 1000): Promise<T> {
  let retries = 0
  while (retries < maxRetries) {
    try {
      return await fn()
    } catch (err) {
      log.error(`Retrying ${fn.name}... ${retries + 1} of ${maxRetries}`)
      retries++
      await new Promise((resolve) => setTimeout(resolve, delay))
    }
  }
  log.error(`Max retries reached for ${fn.name}`)
  throw new Error('Max retries reached')
}

async function transfer(
  contract: ethers.Contract,
  to: string,
  amount: number
): Promise<ethers.ContractTransactionResponse> {
  return await contract.transfer(to, amount)
}

async function getBalance(
  contract: ethers.Contract,
  address: string,
  decimals: number
): Promise<number> {
  const balance = await retryOnFail(() => contract.balanceOf(address))
  return Number(balance) / 10 ** decimals
}

async function getPrice(oracleContract: ethers.Contract): Promise<number> {
  const latestRound = (await retryOnFail(() => oracleContract.latestRoundData())) as {
    answer: bigint
  }
  return Number(latestRound.answer) / 10 ** 8
}

function getTransferArgs(data: string, decimals: number) {
  const parsedTransaction = iface.parseTransaction({ data })
  if (parsedTransaction?.name !== 'transfer') {
    return null
  }
  const [to, amount] = parsedTransaction.args[0]
  return {
    to: to as string,
    amount: Number(amount) / 10 ** decimals
  }
}

async function buildClientToken(
  token: Token,
  signer: ethers.Signer,
  address: string
): Promise<ActivatedClientToken> {
  const contract = new ethers.Contract(token.address, ABI, signer)
  const oracleContract = new ethers.Contract(token.oracleAddress, ABI, signer)
  const decimals = Number(await contract.decimals())
  const clientToken = {
    ...token,
    balance: 0,
    serverBalance: 0,
    price: 0,
    transfer: (to: string, amount: number) => transfer(contract, to, amount)
  }
  async function update() {
    await Promise.all([
      getBalance(contract, address, decimals).then((balance) => (clientToken.balance = balance)),
      getBalance(contract, SERVER.address, decimals).then(
        (balance) => (clientToken.serverBalance = balance)
      ),
      getPrice(oracleContract).then((price) => (clientToken.price = price))
    ])
  }
  await update()
  return {
    ...clientToken,
    update
  }
}

async function buildServerToken(
  token: Token,
  signer: ethers.Signer
): Promise<ActivatedServerToken> {
  const contract = new ethers.Contract(token.address, ABI, signer)
  const oracleContract = new ethers.Contract(token.oracleAddress, ABI, signer)
  const decimals = Number(await contract.decimals())
  return {
    ...token,
    transfer: (to: string, amount: number) => transfer(contract, to, amount),
    getServerBalance: () => getBalance(contract, SERVER.address, decimals),
    getPrice: () => getPrice(oracleContract),
    getTransferArgs: (data: string) => getTransferArgs(data, decimals)
  }
}

export async function getActivatedServerNetworks(
  privateKey: string
): Promise<ActivatedServerNetworks> {
  const wallet = new ethers.Wallet(privateKey)
  const activatedNetworks = {} as ActivatedServerNetworks
  await Promise.all(
    Object.entries(NETWORKS).map(async ([chainId, network]) => {
      const provider = new ethers.JsonRpcProvider(network.rpc)
      const connectedWallet = wallet.connect(provider)
      const tokens = await Promise.all(
        network.tokens.map((token) => buildServerToken(token, connectedWallet))
      )
      activatedNetworks[+chainId as ChainId] = {
        ...network,
        tokens,
        getTransaction: (txnHash: string) => provider.getTransaction(txnHash),
        getTransactionReceipt: (txnHash: string) => provider.getTransactionReceipt(txnHash)
      }
    })
  )
  return activatedNetworks
}

export async function getActivatedClientTokens(
  signer: ethers.Signer
): Promise<ActivatedClientToken[]> {
  const { provider } = signer
  if (!provider) throw new Error('No provider')
  const chainId = Number((await provider.getNetwork()).chainId) as ChainId
  const address = await signer.getAddress()
  return await Promise.all(
    NETWORKS[chainId].tokens.map((token) => buildClientToken(token, signer, address))
  )
}
