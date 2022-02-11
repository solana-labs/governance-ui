import { useEffect } from 'react'
import useWalletStore from 'stores/useWalletStore'
import useRealm from '@hooks/useRealm'
import { usePrevious } from '@hooks/usePrevious'
import useVoteStakeRegistryClientStore from 'VoteStakeRegistry/stores/voteStakeRegistryClientStore'

export function useVoteRegistry() {
  const { realm } = useRealm()
  const {
    handleSetRegistrar,
    handleSetClient,
  } = useVoteStakeRegistryClientStore()
  const wallet = useWalletStore((s) => s.current)
  const previousRealmPk = usePrevious(realm?.pubkey.toBase58())
  const previousWalletPk = usePrevious(wallet?.publicKey?.toBase58())
  const connection = useWalletStore((s) => s.connection)
  const client = useVoteStakeRegistryClientStore((s) => s.state.client)
  const previousClientProgramPk = usePrevious(
    client?.program.programId.toBase58()
  )

  useEffect(() => {
    if (
      wallet?.connected &&
      wallet.publicKey?.toBase58() !== previousWalletPk
    ) {
      handleSetClient(wallet, connection)
    }
  }, [connection.endpoint, wallet?.connected])

  useEffect(() => {
    if (
      realm &&
      client &&
      previousRealmPk !== realm.pubkey.toBase58() &&
      previousClientProgramPk !== client.program.programId.toBase58()
    ) {
      handleSetRegistrar(client, realm)
    }
  }, [realm?.pubkey, client])
}
