import useLegacyConnectionContext from '@hooks/useLegacyConnectionContext'
import { GovernanceAccount, getGovernanceAccount } from '@solana/spl-governance'
import { PublicKey } from '@solana/web3.js'
import { useQuery } from '@tanstack/react-query'
import asFindable from '@utils/queries/asFindable'

export const governanceAccountQueryKeys = {
  all: (cluster: string, kind: string) => [
    cluster,
    `Governance Account: ${kind}`,
  ],
  byPubkey: (cluster: string, kind: string, k: PublicKey) => [
    ...governanceAccountQueryKeys.all(cluster, kind),
    k.toString(),
  ],
}

export function useGovernanceAccountByPubkeyQuery<T extends GovernanceAccount>(
  kind: new (...args) => T,
  kindLabel: string,
  pubkey?: PublicKey
) {
  const connection = useLegacyConnectionContext()

  const enabled = pubkey !== undefined
  const query = useQuery({
    queryKey: enabled
      ? governanceAccountQueryKeys.byPubkey(
          connection.cluster,
          kindLabel,
          pubkey
        )
      : undefined,
    queryFn: async () => {
      if (!enabled) throw new Error()

      const f = () => getGovernanceAccount(connection.current, pubkey, kind)
      return asFindable(f)()
    },
    enabled,
  })

  return query
}
