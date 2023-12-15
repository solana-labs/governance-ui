import { useVoterTokenRecord, useVotingPop } from './hooks'
import { VotingClientType } from '@utils/uiTypes/VotePlugin'
import useVotePluginsClientStore from 'stores/useVotePluginsClientStore'
import useWalletOnePointOh from '@hooks/useWalletOnePointOh'
import { useProposalVoteRecordQuery } from '@hooks/queries/voteRecord'
import {
  determineVotingPowerType,
  useGovernancePowerAsync,
} from '@hooks/queries/governancePower'

import { useConnection } from '@solana/wallet-adapter-react'
import { useAsync } from 'react-async-hook'
import { useSelectedDelegatorStore } from 'stores/useSelectedDelegatorStore'

import { DELEGATOR_BATCH_VOTE_SUPPORT_BY_PLUGIN } from '@constants/flags'
import useSelectedRealmPubkey from '@hooks/selectedRealm/useSelectedRealmPubkey'
import { useRealmQuery } from '@hooks/queries/realm'
import { useTokenOwnerRecordsDelegatedToUser } from '@hooks/queries/tokenOwnerRecord'

const useHasAnyVotingPower = (role: 'community' | 'council' | undefined) => {
  const realmPk = useSelectedRealmPubkey()
  const realm = useRealmQuery().data?.result

  const { connection } = useConnection()

  const relevantMint =
    role && role === 'community'
      ? realm?.account.communityMint
      : realm?.account.config.councilMint

  const { result: personalAmount } = useGovernancePowerAsync(role)

  const { result: plugin } = useAsync(
    async () =>
      role && realmPk && determineVotingPowerType(connection, realmPk, role),
    [connection, realmPk, role]
  )

  // DELEGATOR VOTING ---------------------------------------------------------------

  const batchVoteSupported =
    plugin && DELEGATOR_BATCH_VOTE_SUPPORT_BY_PLUGIN[plugin]
  // If the user is selecting a specific delegator, we want to just use that and not count the other delegators
  const selectedDelegator = useSelectedDelegatorStore((s) =>
    role === 'community' ? s.communityDelegator : s.councilDelegator
  )
  const torsDelegatedToUser = useTokenOwnerRecordsDelegatedToUser()
  const relevantDelegators = selectedDelegator
    ? undefined
    : relevantMint &&
      torsDelegatedToUser?.filter((x) =>
        x.account.governingTokenMint.equals(relevantMint)
      )

  //---------------------------------------------------------------------------------
  // notably, this is ignoring whether the delegators actually have voting power, but it's not a big deal
  const canBatchVote =
    relevantDelegators === undefined || batchVoteSupported === undefined
      ? undefined
      : batchVoteSupported && relevantDelegators?.length !== 0

  // technically, if you have a TOR you can vote even if there's no power. But that doesnt seem user friendly.
  const canPersonallyVote =
    personalAmount === undefined ? undefined : personalAmount.isZero() === false

  const canVote = canBatchVote || canPersonallyVote

  return canVote
}

export const useCanVote = () => {
  const client = useVotePluginsClientStore(
    (s) => s.state.currentRealmVotingClient
  )
  const votingPop = useVotingPop()
  const wallet = useWalletOnePointOh()
  const connected = !!wallet?.connected

  const { data: ownVoteRecord } = useProposalVoteRecordQuery('electoral')
  const voterTokenRecord = useVoterTokenRecord()

  const isVoteCast = !!ownVoteRecord?.found

  const hasMinAmountToVote = useHasAnyVotingPower(votingPop)

  const canVote =
    connected &&
    !(
      client.clientType === VotingClientType.NftVoterClient && !voterTokenRecord
    ) &&
    !(
      client.clientType === VotingClientType.HeliumVsrClient &&
      !voterTokenRecord
    ) &&
    !isVoteCast &&
    hasMinAmountToVote

  const voteTooltipContent = !connected
    ? 'You need to connect your wallet to be able to vote'
    : client.clientType === VotingClientType.NftVoterClient && !voterTokenRecord
    ? 'You must join the Realm to be able to vote'
    : !hasMinAmountToVote
    ? 'You don’t have governance power to vote in this dao'
    : ''

  return [canVote, voteTooltipContent] as const
}
