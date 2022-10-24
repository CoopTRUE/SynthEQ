export const SERVER_ADDRESS = '0xa1792198be90499a006515ccc6739d6527003296' as const // must be lowercase
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
