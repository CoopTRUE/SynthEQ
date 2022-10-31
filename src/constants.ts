export const SERVER_ADDRESS = '0xa1792198BE90499a006515CCc6739d6527003296' as const
export const MIN_VALUE = 10 as const // IN USD
export const NETWORKS = {
  56: {
    name: 'Binance Smart Chain',
    nativeCurrency: {
      name: 'BSC',
      symbol: 'BSC',
      decimals: 18
    },
    rpc: 'https://rpc.ankr.com/bsc',
    explorer: 'https://bscscan.com/',
    tokens: {
      busd: {
        address: '0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56',
        wei: 'ether'
      }
    }
  }
} as const

// prettier-ignore
export const TOKEN_ABI = [{"inputs":[{"internalType":"address","name":"recipient","type":"address"},{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"transfer","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"","type":"address"}],"name":"balanceOf","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"}]
