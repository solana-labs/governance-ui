import { useConnection } from '@solana/wallet-adapter-react'
import { getNetworkFromEndpoint } from '@utils/connection'
import { useMemo } from 'react'

/**
 * @deprecated
 * this hook is part of a refactor effort, you should not use it
 * just use useConnection from @solana/wallet-adapter-react
 */
const useLegacyConnectionContext = () => {
  const { connection } = useConnection()
  return useMemo(
    () => ({
      current: connection,
      endpoint: connection.rpcEndpoint,
      cluster: getNetworkFromEndpoint(connection.rpcEndpoint),
    }),
    [connection]
  )
}

export default useLegacyConnectionContext
