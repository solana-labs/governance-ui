import { useEffect, useState } from 'react'
import { Provider, Wallet } from '@project-serum/anchor'
import { VsrClient } from '@blockworks-foundation/voter-stake-registry-client'
import useWalletStore from 'stores/useWalletStore'
import useRealm from './useRealm'
import { PublicKey } from '@solana/web3.js'

export function useVoteRegistry() {
  const wallet = useWalletStore((s) => s.current)
  const connection = useWalletStore((s) => s.connection)
  const [client, setClient] = useState<VsrClient>()
  const { realm } = useRealm()

  const getRegistrar = async () => {
    if (!realm) {
      throw 'realm not selected'
    }
    if (!client) {
      throw 'no vsrClient registered'
    }
    const [registrar, registrarBump] = await PublicKey.findProgramAddress(
      [
        realm!.pubkey.toBuffer(),
        Buffer.from('registrar'),
        realm!.account.communityMint.toBuffer(),
      ],
      client!.program.programId
    )
    return {
      registrar,
      registrarBump,
    }
  }

  useEffect(() => {
    const handleSetClient = async () => {
      const options = Provider.defaultOptions()
      const provider = new Provider(
        connection.current,
        (wallet as unknown) as Wallet,
        options
      )
      const vsrClient = await VsrClient.connect(
        provider,
        connection.cluster === 'devnet'
      )
      setClient(vsrClient)
    }

    if (wallet?.connected) {
      handleSetClient()
    }
  }, [connection.endpoint, wallet?.connected])

  return { client, getRegistrar }
}
