/* eslint-disable @typescript-eslint/no-non-null-assertion */

import { withFinalizeVote, YesNoVote } from '@solana/spl-governance'
import { TransactionInstruction } from '@solana/web3.js'
import { useCallback, useState } from 'react'
import { relinquishVote } from '../actions/relinquishVote'
import { useHasVoteTimeExpired } from '../hooks/useHasVoteTimeExpired'
import useRealm from '../hooks/useRealm'
import { ProposalState } from '@solana/spl-governance'
import { RpcContext } from '@solana/spl-governance'
import { GoverningTokenType } from '@solana/spl-governance'
import { ThumbUpIcon, ThumbDownIcon } from '@heroicons/react/solid'

import useWalletStore from '../stores/useWalletStore'
import Button from './Button'
import VoteCommentModal from './VoteCommentModal'
import { getProgramVersionForRealm } from '@models/registry/api'
import useVotePluginsClientStore from 'stores/useVotePluginsClientStore'
import { useRouter } from 'next/router'
import useNftPluginStore from 'NftVotePlugin/store/nftPluginStore'
import { LOCALNET_REALM_ID as PYTH_LOCALNET_REALM_ID } from 'pyth-staking-api'
import { isYesVote } from '@models/voteRecords'

const VotePanel = () => {
  const [showVoteModal, setShowVoteModal] = useState(false)
  const [vote, setVote] = useState<YesNoVote | null>(null)
  const client = useVotePluginsClientStore(
    (s) => s.state.currentRealmVotingClient
  )
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const { pk } = router.query
  const {
    governance,
    proposal,
    voteRecordsByVoter,
    tokenType,
  } = useWalletStore((s) => s.selectedProposal)
  const {
    ownTokenRecord,
    ownCouncilTokenRecord,
    realm,
    realmInfo,
    ownVoterWeight,
  } = useRealm()
  const wallet = useWalletStore((s) => s.current)
  const connection = useWalletStore((s) => s.connection)
  const connected = useWalletStore((s) => s.connected)
  const refetchProposals = useWalletStore((s) => s.actions.refetchProposals)
  const fetchProposal = useWalletStore((s) => s.actions.fetchProposal)
  const hasVoteTimeExpired = useHasVoteTimeExpired(governance, proposal!)
  const maxVoterWeight =
    useNftPluginStore((s) => s.state.maxVoteRecord)?.pubkey || undefined

  // Handle state based on if a delegated wallet has already voted or not
  const ownVoteRecord =
    tokenType === GoverningTokenType.Community && ownTokenRecord
      ? voteRecordsByVoter[
          ownTokenRecord.account.governingTokenOwner.toBase58()
        ]
      : ownCouncilTokenRecord
      ? voteRecordsByVoter[
          ownCouncilTokenRecord.account.governingTokenOwner.toBase58()
        ]
      : wallet?.publicKey && voteRecordsByVoter[wallet.publicKey.toBase58()]

  const voterTokenRecord =
    tokenType === GoverningTokenType.Community
      ? ownTokenRecord
      : ownCouncilTokenRecord

  const isVoteCast = ownVoteRecord !== undefined
  const isVoting =
    proposal?.account.state === ProposalState.Voting && !hasVoteTimeExpired

  const isVoteEnabled =
    connected &&
    isVoting &&
    !isVoteCast &&
    voterTokenRecord &&
    ownVoterWeight.hasMinAmountToVote(
      voterTokenRecord.account.governingTokenMint
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

  const submitRelinquishVote = async () => {
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

      if (
        proposal?.account.state === ProposalState.Voting &&
        hasVoteTimeExpired
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
        proposal!,
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        voterTokenRecord!.pubkey,
        ownVoteRecord!.pubkey,
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

  const handleShowVoteModal = (vote: YesNoVote) => {
    setVote(vote)
    setShowVoteModal(true)
  }

  const handleCloseShowVoteModal = useCallback(() => {
    setShowVoteModal(false)
  }, [])

  const actionLabel =
    !isVoteCast || !connected
      ? `Cast your ${
          tokenType === GoverningTokenType.Community ? 'community' : 'council'
        } vote`
      : 'You voted!'

  const withdrawTooltipContent = !connected
    ? 'You need to connect your wallet'
    : !isWithdrawEnabled
    ? !ownVoteRecord?.account.isRelinquished
      ? 'Owner vote record is not relinquished'
      : 'The proposal is not in a valid state to execute this action.'
    : ''

  const voteTooltipContent = !connected
    ? 'You need to connect your wallet to be able to vote'
    : !isVoting && isVoteCast
    ? 'Proposal is not in a voting state anymore.'
    : !voterTokenRecord ||
      !ownVoterWeight.hasMinAmountToVote(
        voterTokenRecord.account.governingTokenMint
      )
    ? 'You don’t have governance power to vote in this realm'
    : ''

  const notVisibleStatesForNotConnectedWallet = [
    ProposalState.Cancelled,
    ProposalState.Succeeded,
    ProposalState.Draft,
    ProposalState.Completed,
  ]

  const isVisibleToWallet = !connected
    ? !hasVoteTimeExpired &&
      typeof notVisibleStatesForNotConnectedWallet.find(
        (x) => x === proposal?.account.state
      ) === 'undefined'
    : !ownVoteRecord?.account.isRelinquished

  const isPanelVisible = (isVoting || isVoteCast) && isVisibleToWallet

  //Todo: move to own components with refactor to dao folder structure
  const isPyth =
    realmInfo?.realmId.toBase58() === PYTH_LOCALNET_REALM_ID.toBase58()

  const isRelinquishVotePanelVisible = !(
    isPyth &&
    isVoteCast &&
    connected &&
    !isVoting
  )

  return (
    <>
      {isPanelVisible && isRelinquishVotePanelVisible && (
        <div className="bg-bkg-2 p-4 md:p-6 rounded-lg space-y-4">
          <h3 className="mb-4 text-center">{actionLabel}</h3>

          <div className="items-center justify-center flex w-full gap-5">
            {isVoteCast && connected ? (
              <div className="flex flex-col gap-6 min-w-[200px]">
                {ownVoteRecord &&
                  (isYesVote(ownVoteRecord.account) ? (
                    <Button disabled>
                      <div className="flex flex-row items-center justify-center">
                        <div className="bg-black rounded-full mr-1 p-[6px]">
                          <ThumbUpIcon className="h-4 w-4 fill-[#8EFFDD]" />{' '}
                        </div>
                        Yes
                      </div>
                    </Button>
                  ) : (
                    <Button disabled>
                      <div className="flex flex-row items-center justify-center">
                        <div className="bg-black rounded-full mr-1 p-[6px]">
                          <ThumbDownIcon className="h-4 w-4 fill-[#FF7C7C]" />{' '}
                        </div>
                        No
                      </div>
                    </Button>
                  ))}
                {isVoting && (
                  <Button
                    isLoading={isLoading}
                    tooltipMessage={withdrawTooltipContent}
                    onClick={() => submitRelinquishVote()}
                    disabled={!isWithdrawEnabled || isLoading}
                  >
                    Withdraw
                  </Button>
                )}
              </div>
            ) : (
              <>
                {isVoting && (
                  <div className="w-full flex justify-between items-center gap-5">
                    <Button
                      tooltipMessage={voteTooltipContent}
                      className="w-1/2"
                      onClick={() => handleShowVoteModal(YesNoVote.Yes)}
                      disabled={!isVoteEnabled}
                    >
                      <div className="flex flex-row items-center justify-center">
                        <div className="bg-black rounded-full mr-1 p-[6px]">
                          <ThumbUpIcon className="h-3 w-3 fill-[#8EFFDD]" />{' '}
                        </div>
                        Vote Yes
                      </div>
                    </Button>

                    <Button
                      tooltipMessage={voteTooltipContent}
                      className="w-1/2"
                      onClick={() => handleShowVoteModal(YesNoVote.No)}
                      disabled={!isVoteEnabled}
                    >
                      <div className="flex flex-row items-center justify-center">
                        <div className="bg-black rounded-full mr-1 p-[6px]">
                          <ThumbDownIcon className="h-3 w-3 fill-[#FF7C7C]" />
                        </div>
                        Vote No
                      </div>
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>

          {showVoteModal ? (
            <VoteCommentModal
              isOpen={showVoteModal}
              onClose={handleCloseShowVoteModal}
              vote={vote!}
              voterTokenRecord={voterTokenRecord!}
            />
          ) : null}
        </div>
      )}
    </>
  )
}

export default VotePanel
