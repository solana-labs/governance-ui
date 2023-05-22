import { VoteKind, withFinalizeVote } from '@solana/spl-governance'
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
import useWalletStore from '../../stores/useWalletStore'
import { SecondaryButton } from '../Button'
import { getProgramVersionForRealm } from '@models/registry/api'
import useVotePluginsClientStore from 'stores/useVotePluginsClientStore'
import Tooltip from '@components/Tooltip'
import { useVoterTokenRecord, useIsVoting, useIsInCoolOffTime } from './hooks'
import assertUnreachable from '@utils/typescript/assertUnreachable'
import { useHasVoteTimeExpired } from '@hooks/useHasVoteTimeExpired'
import { useMaxVoteRecord } from '@hooks/useMaxVoteRecord'
import useWalletOnePointOh from '@hooks/useWalletOnePointOh'
import { useRealmQuery } from '@hooks/queries/realm'
import { useRouteProposalQuery } from '@hooks/queries/proposal'
import { useProposalGovernanceQuery } from '@hooks/useProposal'
import { useProposalVoteRecordQuery } from '@hooks/queries/voteRecord'
import useLegacyConnectionContext from '@hooks/useLegacyConnectionContext'

export const YouVoted = ({ quorum }: { quorum: 'electoral' | 'veto' }) => {
  const client = useVotePluginsClientStore(
    (s) => s.state.currentRealmVotingClient
  )
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
  const voterTokenRecord = useVoterTokenRecord()

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
        client
      )
    } catch (ex) {
      console.error("Can't relinquish vote", ex)
    }
    setIsLoading(false)
  }

  const vote = ownVoteRecord?.account.vote

  return vote !== undefined ? (
    <div className="bg-bkg-2 p-4 md:p-6 rounded-lg space-y-4">
      <div className="flex flex-col items-center justify-center">
        <h3 className="text-center">
          {quorum === 'electoral' ? 'Your vote' : 'You voted to veto'}
        </h3>
        {vote.voteType === VoteKind.Approve ? (
          <Tooltip content={`You voted "Yes"`}>
            <div className="flex flex-row items-center justify-center rounded-full border border-[#8EFFDD] p-2 mt-2">
              <ThumbUpIcon className="h-4 w-4 fill-[#8EFFDD]" />
            </div>
          </Tooltip>
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
          assertUnreachable(vote.voteType)
        )}
      </div>
      {(isVoting || isInCoolOffTime) && (
        <div className="items-center justify-center flex w-full gap-5">
          <div className="flex flex-col gap-6 items-center">
            <SecondaryButton
              className="min-w-[200px]"
              isLoading={isLoading}
              tooltipMessage={withdrawTooltipContent}
              onClick={() => submitRelinquishVote()}
              disabled={!isWithdrawEnabled || isLoading}
            >
              Relinquish Vote
            </SecondaryButton>
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
