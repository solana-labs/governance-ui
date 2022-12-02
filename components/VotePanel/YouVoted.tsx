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
import { useRouter } from 'next/router'
import useNftPluginStore from 'NftVotePlugin/store/nftPluginStore'
import Tooltip from '@components/Tooltip'
import {
  useVoterTokenRecord,
  useIsVoting,
  useProposalVoteRecordQuery,
} from './hooks'
import assertUnreachable from '@utils/typescript/assertUnreachable'

export const YouVoted = ({ quorum }: { quorum: 'electoral' | 'veto' }) => {
  const client = useVotePluginsClientStore(
    (s) => s.state.currentRealmVotingClient
  )
  const router = useRouter()
  const { pk } = router.query
  const { proposal } = useWalletStore((s) => s.selectedProposal)
  const { realm, realmInfo } = useRealm()
  const wallet = useWalletStore((s) => s.current)
  const connection = useWalletStore((s) => s.connection)
  const connected = useWalletStore((s) => s.connected)
  const refetchProposals = useWalletStore((s) => s.actions.refetchProposals)
  const fetchProposal = useWalletStore((s) => s.actions.fetchProposal)
  const maxVoterWeight =
    useNftPluginStore((s) => s.state.maxVoteRecord)?.pubkey || undefined

  const isVoting = useIsVoting()

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

      if (proposal !== undefined && isVoting) {
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
      await refetchProposals()
      if (pk) {
        fetchProposal(pk)
      }
    } catch (ex) {
      console.error("Can't relinquish vote", ex)
    }
    setIsLoading(false)
  }

  const vote = ownVoteRecord?.account.vote

  return vote !== undefined ? (
    <div className="bg-bkg-2 p-4 md:p-6 rounded-lg space-y-4">
      <div className="flex flex-col items-center justify-center">
        <h3 className="text-center">Your vote</h3>
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
      {isVoting && (
        <div className="items-center justify-center flex w-full gap-5">
          <div className="flex flex-col gap-6 items-center">
            (
            <SecondaryButton
              className="min-w-[200px]"
              isLoading={isLoading}
              tooltipMessage={withdrawTooltipContent}
              onClick={() => submitRelinquishVote()}
              disabled={!isWithdrawEnabled || isLoading}
            >
              Withdraw
            </SecondaryButton>
          </div>
        </div>
      )}
    </div>
  ) : null
}
