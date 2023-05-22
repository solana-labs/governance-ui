import useLegacyConnectionContext from '@hooks/useLegacyConnectionContext'
import { EndpointTypes } from '@models/types'
import { getGovernanceProgramVersion } from '@solana/spl-governance'
import { PublicKey } from '@solana/web3.js'
import { useQuery } from '@tanstack/react-query'
import useWalletStore from 'stores/useWalletStore'

export const programVersionQueryKeys = {
  byProgramId: (cluster: EndpointTypes, programId: PublicKey) => [
    cluster,
    'programVersion',
    programId.toString(),
  ],
}

export function useProgramVersionByIdQuery(realmsProgramId?: PublicKey) {
  // @asktree is unsure why we use this instead of `useConnection` (which has no corresponding provider in the BaseApp)
  const connection = useLegacyConnectionContext()
  const query = useQuery({
    queryKey:
      realmsProgramId &&
      programVersionQueryKeys.byProgramId(connection.cluster, realmsProgramId),
    queryFn: () =>
      getGovernanceProgramVersion(connection.current, realmsProgramId!),
    enabled: realmsProgramId !== undefined,
    // Staletime is zero by default, so queries get refetched often. Since program version is immutable it should never go stale.
    staleTime: Number.MAX_SAFE_INTEGER,
  })

  return query
}
