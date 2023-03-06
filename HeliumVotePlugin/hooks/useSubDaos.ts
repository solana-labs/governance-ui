import useWallet from '@hooks/useWallet'
import { web3 } from '@project-serum/anchor'
import { useAsync, UseAsyncReturn } from 'react-async-hook'
import { SubDaoWithMeta } from '../sdk/types'
import { PROGRAM_ID } from '@helium/helium-sub-daos-sdk'
import { getSubDaos } from '../utils/getSubDaos'

export const useSubDaos = (
  programId: web3.PublicKey = PROGRAM_ID
): UseAsyncReturn<SubDaoWithMeta[]> => {
  const { anchorProvider: provider, connection } = useWallet()
  return useAsync(getSubDaos, [connection.current, provider, programId])
}
