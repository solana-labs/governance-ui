export const MAINNET_RPC =
  process.env.NEXT_PUBLIC_MAINNET_RPC ||
  process.env.MAINNET_RPC ||
  'https://mainnet.helius-rpc.com/?api-key=09efbe04-3da6-4492-aa39-84a7a3e27016'

export const DEVNET_RPC =
  process.env.NEXT_PUBLIC_DEVNET_RPC ||
  process.env.DEVNET_RPC ||
  'https://mango.devnet.rpcpool.com'
