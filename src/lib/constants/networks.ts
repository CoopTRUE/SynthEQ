import type { ethers } from 'ethers'

export interface Token {
  readonly name: string
  readonly symbol: string
  readonly address: string
  readonly oracleAddress: string
  readonly image: string
}

interface ActivatedTokenBase extends Token {
  readonly transfer: (to: string, amount: number) => Promise<ethers.ContractTransactionResponse>
}
export interface ActivatedClientToken extends ActivatedTokenBase {
  balance: number
  serverBalance: number
  price: number
  readonly update: () => Promise<void>
}
export interface ActivatedServerToken extends ActivatedTokenBase {
  readonly getServerBalance: () => Promise<number>
  readonly getPrice: () => Promise<number>
  readonly getTransferArgs: (data: string) => { to: string; amount: number } | null
}

interface Network {
  readonly name: string
  readonly nativeCurrency: string
  readonly rpc: string
  readonly explorer: string
  readonly tokens: readonly Token[]
}
interface Networks {
  [chainId: number]: Network
}
export type ChainId = keyof typeof networks
export interface ActivatedServerNetwork {
  readonly getTransaction: (txnHash: string) => Promise<ethers.TransactionResponse | null>
  readonly getTransactionReceipt: (txnHash: string) => Promise<ethers.TransactionReceipt | null>
  readonly tokens: readonly ActivatedServerToken[]
}
export type ActivatedServerNetworks = Record<keyof typeof networks, ActivatedServerNetwork>

const networks = {
  56: {
    name: 'Binance Smart Chain',
    nativeCurrency: 'BNB',
    rpc: 'https://rpc.ankr.com/bsc',
    explorer: 'https://snowtrace.io/',
    tokens: [
      {
        name: 'Binance-Peg BUSD Token',
        symbol: 'BUSD',
        address: '0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56',
        oracleAddress: '0xcBb98864Ef56E9042e7d2efef76141f15731B82f',
        image: 'https://cryptologos.cc/logos/binance-usd-busd-logo.svg'
      },
      // {
      //   name: 'Wrapped BNB',
      //   symbol: 'WBNB',
      //   decimals: 18,
      //   roundPrecision: 5,
      //   address: '0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c',
      //   oracleAddress: '0x0567F2323251f0Aab15c8dFb1967E4e8A7D42aeE',
      //   image: 'https://cryptologos.cc/logos/binance-coin-bnb-logo.svg'
      // },
      {
        name: 'Binance-Peg Ethereum Token',
        symbol: 'ETH',
        address: '0x2170Ed0880ac9A755fd29B2688956BD959F933F8',
        oracleAddress: '0x9ef1B8c0E4F7dc8bF5719Ea496883DC6401d5b2e',
        image: 'https://cryptologos.cc/logos/ethereum-eth-logo.svg'
      },
      {
        name: 'Binance-Peg USD COIN',
        symbol: 'USDC',
        address: '0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d',
        oracleAddress: '0x51597f405303C4377E36123cBc172b13269EA163',
        image: 'https://cryptologos.cc/logos/usd-coin-usdc-logo.svg'
      }
    ]
  },
  43114: {
    name: 'Avalanche C-Chain',
    nativeCurrency: 'AVAX',
    rpc: 'https://api.avax.network/ext/bc/C/rpc',
    explorer: 'https://snowtrace.io/',
    tokens: [
      {
        name: 'USD Coin',
        symbol: 'USDC',
        address: '0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E',
        oracleAddress: '0xF096872672F44d6EBA71458D74fe67F9a77a23B9',
        image: 'https://cryptologos.cc/logos/usd-coin-usdc-logo.svg'
      },
      // {
      //   name: 'Wrapped AVAX',
      //   symbol: 'WAVAX',
      //   decimals: 18,
      //   roundPrecision: 5,
      //   address: '0xB31f66AA3C1e785363F0875A1B74E27b85FD66c7',
      //   oracleAddress: '0x0A77230d17318075983913bC2145DB16C7366156',
      //   image: 'https://cryptologos.cc/logos/avalanche-avax-logo.svg'
      // },
      {
        name: 'Magic Internet Money',
        symbol: 'MIM',
        address: '0x130966628846BFd36ff31a822705796e8cb8C18D',
        oracleAddress: '0x54EdAB30a7134A16a54218AE64C73e1DAf48a8Fb',
        image: 'https://s2.coinmarketcap.com/static/img/coins/200x200/162.png'
      }
    ]
  }
} as const satisfies Networks

export default networks
