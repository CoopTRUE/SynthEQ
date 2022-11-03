export const SERVER_ADDRESS = '0x1BB817100c8C752D1d5B6504009Dd2258524B0aA' as const
export const CONSTRAINTS = {
  MIN_CONTRACT_VALUE: 10,
  MAX_CONTRACT_VALUE: 1000,
  MIN_UPSIDE: 0.01,
  MAX_UPSIDE: 1,
  MIN_TIME: 1000 * 60 * 60 * 24 * 7, // 1 day in MS
  MAX_TIME: 1000 * 60 * 60 * 24 * 365 // 1 year in MS
} as const
export const NETWORKS = {
  56: {
    name: 'Binance Smart Chain',
    symbol: 'BNB',
    rpc: 'https://rpc.ankr.com/bsc',
    explorer: 'https://bscscan.com/',
    tokens: {
      busd: '0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56',
      usdc: '0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d',
      dai: '0x1AF3F329e8BE154074D8769D1FFa4eE058B1DBc3'
    }
  },
  43114: {
    name: 'Avalanche C-Chain',
    symbol: 'FTM',
    rpc: 'https://api.avax.network/ext/bc/C/rpc',
    explorer: 'https://snowtrace.io/',
    tokens: {
      'usdc.e': '0xA7D7079b0FEaD91F3e65f86E8915Cb59c1a4C664',
      dai: '0xd586E7F844cEa2F87f50152665BCbc2C279D8d70',
      mim: '0x130966628846BFd36ff31a822705796e8cb8C18D'
    }
  },
  42161: {
    name: 'Arbitrum One',
    symbol: 'ETH',
    rpc: 'https://rpc.ankr.com/arbitrum',
    explorer: 'https://arbiscan.io/',
    tokens: {
      usdc: '0xFF970A61A04b1cA14834A43f5dE4533eBDDB5CC8',
      dai: '0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1'
    }
  }
} as const

// prettier-ignore
export const TOKEN_ABI = [{"inputs":[{"internalType":"address","name":"recipient","type":"address"},{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"transfer","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"","type":"address"}],"name":"balanceOf","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"}]
