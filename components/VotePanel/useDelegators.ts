import { DELEGATOR_BATCH_VOTE_SUPPORT_BY_PLUGIN } from '@constants/flags'
import { determineVotingPowerType } from '@hooks/queries/governancePower'
import { useRealmQuery } from '@hooks/queries/realm'
import { useTokenOwnerRecordsDelegatedToUser } from '@hooks/queries/tokenOwnerRecord'
import useSelectedRealmPubkey from '@hooks/selectedRealm/useSelectedRealmPubkey'
import { useConnection } from '@solana/wallet-adapter-react'
import { useAsync } from 'react-async-hook'
import { useSelectedDelegatorStore } from 'stores/useSelectedDelegatorStore'

const useDelegators = (role: 'community' | 'council' | undefined) => {
  const realm = useRealmQuery().data?.result
  const relevantMint =
    role && role === 'community'
      ? realm?.account.communityMint
      : realm?.account.config.councilMint

  const { data: torsDelegatedToUser } = useTokenOwnerRecordsDelegatedToUser()
  const relevantDelegators =
    relevantMint &&
    torsDelegatedToUser?.filter((x) =>
      x.account.governingTokenMint.equals(relevantMint)
    )
  return relevantDelegators
}
/* 
const fetchDelegators = async (connection: Connection, walletPk: PublicKey, realmPk: PublicKey, role: 'community' | 'council' | undefined) => {
  const realm = (await fetchRealmByPubkey(connection, realmPk)).result
  if (realm === undefined) {throw new Error('Realm not found')}
  
  const relevantMint =
    role && role === 'community'
      ? realm.account.communityMint
      : realm.account.config.councilMint
  
} */

/**
 * if batched voting is enabled for the plugin, and by the user, then this returns array of delegators.
 * otherwise, returns []
 **/
export const useBatchedVoteDelegators = (
  role: 'community' | 'council' | undefined
) => {
  const { connection } = useConnection()
  const realmPk = useSelectedRealmPubkey()
  const delegators = useDelegators(role)
  const { result: plugin } = useAsync(
    async () =>
      role && realmPk && determineVotingPowerType(connection, realmPk, role),
    [connection, realmPk, role]
  )
  const batchVoteSupported =
    plugin && DELEGATOR_BATCH_VOTE_SUPPORT_BY_PLUGIN[plugin]

  // empty array if not supported
  const delegatorsIfSupported =
    batchVoteSupported === undefined
      ? undefined
      : batchVoteSupported === false
      ? []
      : delegators

  // If the user is selecting a specific delegator, we want to just use that and not count the other delegators
  const selectedDelegator = useSelectedDelegatorStore((s) =>
    role === 'community' ? s.communityDelegator : s.councilDelegator
  )

  return selectedDelegator ? [] : delegatorsIfSupported
}

export default useDelegators
