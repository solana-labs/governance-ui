import { getGovernanceProgramVersion } from '@solana/spl-governance'
import { useConnection } from '@solana/wallet-adapter-react'
import { PublicKey } from '@solana/web3.js'
import { useQuery } from '@tanstack/react-query'

export const programVersionQueryKeys = {
  byProgramId: (programId: PublicKey) => [
    'programVersion',
    programId.toString(),
  ],
}

export function useProgramVersionByIdQuery(realmsProgramId?: PublicKey) {
  const { connection } = useConnection()
  console.log('connection', connection)

  const query = useQuery({
    queryKey:
      realmsProgramId && programVersionQueryKeys.byProgramId(realmsProgramId),
    queryFn: async () => {
      getGovernanceProgramVersion(connection, realmsProgramId!)
    },
    enabled: realmsProgramId !== undefined,
  })

  return query
}
