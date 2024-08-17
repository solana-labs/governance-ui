import {
  GovernanceAccountType,
  VoteKind,
  VoteType,
  getVoteRecordAddress,
  withFinalizeVote,
} from '@solana/spl-governance'
import { TransactionInstruction } from '@solana/web3.js'
import { useState } from 'react'
import { relinquishVote } from '../../actions/relinquishVote'
import useRealm from '../../hooks/useRealm'
import { ProposalState } from '@solana/spl-governance'
import { RpcContext } from '@solana/spl-governance'
import {
  ThumbUpIcon,
  ThumbDownIcon,
  BanIcon,
  MinusCircleIcon,
} from '@heroicons/react/solid'
import Button from '../Button'
import { getProgramVersionForRealm } from '@models/registry/api'
import Tooltip from '@components/Tooltip'
import {
  useVoterTokenRecord,
  useIsVoting,
  useIsInCoolOffTime,
  useUserVetoTokenRecord,
  useVotingPop,
} from './hooks'
import assertUnreachable from '@utils/typescript/assertUnreachable'
import { useHasVoteTimeExpired } from '@hooks/useHasVoteTimeExpired'
import { useMaxVoteRecord } from '@hooks/useMaxVoteRecord'
import useWalletOnePointOh from '@hooks/useWalletOnePointOh'
import { useRealmQuery } from '@hooks/queries/realm'
import {
  proposalQueryKeys,
  useRouteProposalQuery,
} from '@hooks/queries/proposal'
import { useProposalGovernanceQuery } from '@hooks/useProposal'
import {
  fetchVoteRecordByPubkey,
  useProposalVoteRecordQuery,
} from '@hooks/queries/voteRecord'
import useLegacyConnectionContext from '@hooks/useLegacyConnectionContext'
import queryClient from '@hooks/queries/queryClient'
import { CheckmarkFilled } from '@carbon/icons-react'
import { useVotingClientForGoverningTokenMint } from '@hooks/useVotingClients'
import { useRealmVoterWeightPlugins } from '@hooks/useRealmVoterWeightPlugins'
import { useAsync } from 'react-async-hook'
import { useBatchedVoteDelegators } from './useDelegators'
import { useSelectedDelegatorStore } from 'stores/useSelectedDelegatorStore'

export const YouVoted = ({ quorum }: { quorum: 'electoral' | 'veto' }) => {
  const proposal = useRouteProposalQuery().data?.result
  const realm = useRealmQuery().data?.result
  const { realmInfo } = useRealm()
  const wallet = useWalletOnePointOh()
  const connection = useLegacyConnectionContext()
  const connected = !!wallet?.connected

  const governance = useProposalGovernanceQuery().data?.result
  const maxVoterWeight = useMaxVoteRecord()?.pubkey || undefined
  const hasVoteTimeExpired = useHasVoteTimeExpired(governance, proposal!)
  const isVoting = useIsVoting()
  const isInCoolOffTime = useIsInCoolOffTime()
  const [isLoading, setIsLoading] = useState(false)

  const { data } = useProposalVoteRecordQuery(quorum)
  const ownVoteRecord = data?.result
  const electoralVoterTokenRecord = useVoterTokenRecord()
  const vetoVotertokenRecord = useUserVetoTokenRecord()
  const voterTokenRecord =
    quorum === 'electoral' ? electoralVoterTokenRecord : vetoVotertokenRecord
  const votingClient = useVotingClientForGoverningTokenMint(
    proposal?.account.governingTokenMint
  )

  const isWithdrawEnabled =
    connected &&
    ownVoteRecord &&
    !ownVoteRecord?.account.isRelinquished &&
    proposal &&
    (proposal!.account.state === ProposalState.Voting ||
      proposal!.account.state === ProposalState.Completed ||
      proposal!.account.state === ProposalState.Cancelled ||
      proposal!.account.state === ProposalState.Succeeded ||
      proposal!.account.state === ProposalState.Executing ||
      proposal!.account.state === ProposalState.Defeated)

  const withdrawTooltipContent = !connected
    ? 'You need to connect your wallet'
    : !isWithdrawEnabled
    ? !ownVoteRecord?.account.isRelinquished
      ? 'Owner vote record is not relinquished'
      : 'The proposal is not in a valid state to execute this action.'
    : ''

  const submitRelinquishVote = async () => {
    if (
      realm === undefined ||
      proposal === undefined ||
      voterTokenRecord === undefined ||
      ownVoteRecord === undefined ||
      ownVoteRecord === null
    )
      return

    const rpcContext = new RpcContext(
      proposal!.owner,
      getProgramVersionForRealm(realmInfo!),
      wallet!,
      connection.current,
      connection.endpoint
    )

    try {
      setIsLoading(true)
      const instructions: TransactionInstruction[] = []

      //we want to finalize only if someone try to withdraw after voting time ended
      //but its before finalize state
      if (
        proposal !== undefined &&
        proposal?.account.state === ProposalState.Voting &&
        hasVoteTimeExpired &&
        !isInCoolOffTime
      ) {
        await withFinalizeVote(
          instructions,
          realmInfo!.programId,
          getProgramVersionForRealm(realmInfo!),
          realm!.pubkey,
          proposal.account.governance,
          proposal.pubkey,
          proposal.account.tokenOwnerRecord,
          proposal.account.governingTokenMint,
          maxVoterWeight
        )
      }

      await relinquishVote(
        rpcContext,
        realm.pubkey,
        proposal,
        voterTokenRecord.pubkey,
        ownVoteRecord.pubkey,
        instructions,
        votingClient
      )
      queryClient.invalidateQueries({
        queryKey: proposalQueryKeys.all(connection.endpoint),
      })
    } catch (ex) {
      console.error("Can't relinquish vote", ex)
    }
    setIsLoading(false)
  }

  const selectedCommunityDelegator = useSelectedDelegatorStore(
    (s) => s.communityDelegator
  )
  const selectedCouncilDelegator = useSelectedDelegatorStore(
    (s) => s.councilDelegator
  )

  const communityDelegators = useBatchedVoteDelegators('community')
  const councilDelegators = useBatchedVoteDelegators('council')
  const votingPop = useVotingPop()
  const { voterWeightForWallet } = useRealmVoterWeightPlugins(votingPop)

  const relevantSelectedDelegator =
    votingPop === 'community'
      ? selectedCommunityDelegator
      : selectedCouncilDelegator

  const ownVoterWeight = relevantSelectedDelegator
    ? voterWeightForWallet(relevantSelectedDelegator)
    : wallet?.publicKey
    ? voterWeightForWallet(wallet?.publicKey)
    : undefined
  const hasVotingPower = !!(
    ownVoterWeight?.value && ownVoterWeight.value?.gtn(0)
  )

  const delegatorVote = useAsync(async () => {
    const relevantDelegators =
      votingPop === 'community' ? communityDelegators : councilDelegators

    if (
      !hasVotingPower &&
      proposal &&
      relevantDelegators &&
      relevantDelegators.length > 0
    ) {
      const delegatorisVoteList = await Promise.all(
        relevantDelegators.map(async (delegator) => {
          const pda = await getVoteRecordAddress(
            proposal.owner,
            proposal.pubkey,
            delegator.pubkey
          )
          const voteRecord = await fetchVoteRecordByPubkey(
            connection.current,
            pda
          )
          return voteRecord
        })
      )

      const allVoted = !delegatorisVoteList
        .map((vote) => !!vote.found)
        .includes(false)
      return allVoted ? delegatorisVoteList[0].result : null
    }
  }, [
    communityDelegators?.length,
    connection.current,
    councilDelegators?.length,
    hasVotingPower,
    proposal?.pubkey,
    votingPop,
  ])

  const getDelegatorVoteForQuorum = () => {
    if (
      // yes/no vote
      (quorum === 'electoral' && !delegatorVote?.result?.account.vote?.veto) ||
      // veto vote
      (quorum === 'veto' && delegatorVote?.result?.account.vote?.veto)
    ) {
      return delegatorVote?.result?.account.vote
    }
    return undefined
  }

  const vote = hasVotingPower
    ? ownVoteRecord?.account.vote
    : getDelegatorVoteForQuorum()

  const isMulti =
    proposal?.account.voteType !== VoteType.SINGLE_CHOICE &&
    proposal?.account.accountType === GovernanceAccountType.ProposalV2

  const nota = '$$_NOTA_$$'

  return vote !== undefined ? (
    <div className="bg-bkg-2 p-4 md:p-6 rounded-lg space-y-4">
      <div className="flex flex-col items-center justify-center">
        <h3 className="text-center">
          {quorum === 'electoral' ? 'Your vote' : 'You voted to veto'}
        </h3>
        {vote.voteType === VoteKind.Approve ? (
          isMulti ? (
            vote.approveChoices?.map((choice, index) =>
              choice.weightPercentage ? (
                <div className="p-1 w-full" key={index}>
                  <Button
                    className="w-full border border-primary-light text-primary-light bg-transparent"
                    disabled={true}
                  >
                    <div className="flex flex-row gap-2 justify-center">
                      <div>
                        <CheckmarkFilled />
                      </div>
                      <div>
                        {proposal?.account.options[index].label === nota
                          ? 'None of the Above'
                          : proposal?.account.options[index].label}
                      </div>
                    </div>
                  </Button>
                </div>
              ) : null
            )
          ) : (
            <Tooltip content={`You voted "Yes"`}>
              <div className="flex flex-row items-center justify-center rounded-full border border-[#8EFFDD] p-2 mt-2">
                <ThumbUpIcon className="h-4 w-4 fill-[#8EFFDD]" />
              </div>
            </Tooltip>
          )
        ) : vote.voteType === VoteKind.Deny ? (
          <Tooltip content={`You voted "No"`}>
            <div className="flex flex-row items-center justify-center rounded-full border border-[#FF7C7C] p-2 mt-2">
              <ThumbDownIcon className="h-4 w-4 fill-[#FF7C7C]" />
            </div>
          </Tooltip>
        ) : vote.voteType === VoteKind.Veto ? (
          <Tooltip content={`You voted "Veto"`}>
            <div className="flex flex-row items-center justify-center rounded-full border border-[#FF7C7C] p-2 mt-2">
              <BanIcon className="h-4 w-4 fill-[#FF7C7C]" />
            </div>
          </Tooltip>
        ) : vote.voteType === VoteKind.Abstain ? (
          <Tooltip content={`You voted "Abstain"`}>
            <div className="flex flex-row items-center justify-center rounded-full border border-gray-400 p-2 mt-2">
              <MinusCircleIcon className="h-4 w-4 fill-gray-400" />
            </div>
          </Tooltip>
        ) : (
          assertUnreachable(vote.voteType as never)
        )}
      </div>
      {(isVoting || isInCoolOffTime) && (
        <div className="items-center justify-center flex w-full gap-5">
          <div className="flex flex-col gap-6 items-center">
            <Button
              className="min-w-[200px]"
              isLoading={isLoading}
              tooltipMessage={withdrawTooltipContent}
              onClick={() => submitRelinquishVote()}
              disabled={!isWithdrawEnabled || isLoading}
            >
              Withdraw Vote
            </Button>

            {isInCoolOffTime && (
              <div className="text-xs">
                Warning: If you withdraw your vote now you can only deny the
                proposal its not possible to vote yes during cool off time
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  ) : null
}
