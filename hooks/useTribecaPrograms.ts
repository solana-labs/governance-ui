import { Wallet } from '@project-serum/common'
import {
  SolanaAugmentedProvider,
  SolanaProvider,
} from '@saberhq/solana-contrib'
import { useEffect, useState } from 'react'

import useWalletStore from 'stores/useWalletStore'
import ATribecaConfiguration, {
  TribecaPrograms,
} from '@tools/sdk/tribeca/ATribecaConfiguration'

export default function useTribecaPrograms(
  tribecaConfiguration: ATribecaConfiguration | null
) {
  const connection = useWalletStore((s) => s.connection)
  const wallet = useWalletStore((s) => s.current)

  const [programs, setPrograms] = useState<TribecaPrograms | null>(null)

  useEffect(() => {
    if (!connection || !wallet || !tribecaConfiguration) {
      return
    }

    const solanaProvider = SolanaProvider.load({
      connection: connection.current,
      sendConnection: connection.current,
      wallet: wallet as Wallet,
    })

    setPrograms(
      tribecaConfiguration.loadPrograms(
        new SolanaAugmentedProvider(solanaProvider)
      )
    )
  }, [connection, wallet, tribecaConfiguration])

  return {
    programs,
  }
}
