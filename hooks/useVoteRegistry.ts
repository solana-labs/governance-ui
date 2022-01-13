import { useEffect, useState } from 'react'

import { Provider, Wallet } from '@project-serum/anchor'
import { VsrClient } from '@blockworks-foundation/voter-stake-registry-client'
import useWalletStore from 'stores/useWalletStore'

export function useVoteRegistry() {
  const wallet = useWalletStore((s) => s.current)
  const connection = useWalletStore((s) => s.connection)
  const [client, setClient] = useState<VsrClient>()

  useEffect(() => {
    const handleSetClient = async () => {
      const options = Provider.defaultOptions()
      const provider = new Provider(
        connection.current,
        (wallet as unknown) as Wallet,
        options
      )
      const vsrClient = await VsrClient.connect(provider, true)
      setClient(vsrClient)
    }
    if (wallet?.connected) {
      handleSetClient()
    }
  }, [connection, wallet, connection.endpoint])

  return client
}
