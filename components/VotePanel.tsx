/* eslint-disable @typescript-eslint/no-non-null-assertion */
import {
  VoteKind,
  VoteThresholdType,
  withFinalizeVote,
  YesNoVote,
} from '@solana/spl-governance'
import { TransactionInstruction } from '@solana/web3.js'
import { useCallback, useMemo, useState } from 'react'
import { relinquishVote } from '../actions/relinquishVote'
import { useHasVoteTimeExpired } from '../hooks/useHasVoteTimeExpired'
import useRealm from '../hooks/useRealm'
import { ProposalState } from '@solana/spl-governance'
import { RpcContext } from '@solana/spl-governance'
import { GoverningTokenRole } from '@solana/spl-governance'
import { BanIcon, ThumbUpIcon, ThumbDownIcon } from '@heroicons/react/solid'

import useWalletStore from '../stores/useWalletStore'
import Button, { SecondaryButton } from './Button'
import VoteCommentModal from './VoteCommentModal'
import { getProgramVersionForRealm } from '@models/registry/api'
import useVotePluginsClientStore from 'stores/useVotePluginsClientStore'
import { useRouter } from 'next/router'
import useNftPluginStore from 'NftVotePlugin/store/nftPluginStore'
import { REALM_ID as PYTH_REALM_ID } from 'pyth-staking-api'
import { isYesVote } from '@models/voteRecords'
import Tooltip from '@components/Tooltip'
import { VotingClientType } from '@utils/uiTypes/VotePlugin'

/* 
  returns: undefined if loading, false if nobody can veto, 'council' if council can veto, 'community' if community can veto
*/
const useVetoingPop = () => {
  const { tokenRole, governance } = useWalletStore((s) => s.selectedProposal)

  const vetoingPop = useMemo(() => {
    if (governance === undefined) return undefined

    return tokenRole === GoverningTokenRole.Community
      ? governance?.account.config.councilVetoVoteThreshold.type !==
          VoteThresholdType.Disabled && 'council'
      : governance?.account.config.communityVetoVoteThreshold.type !==
          VoteThresholdType.Disabled && 'community'
  }, [governance, tokenRole])

  return vetoingPop
}

const useIsVetoable = (): undefined | boolean => {
  const vetoingPop = useVetoingPop()
  const isVoting = useIsVoting()

  if (isVoting === false) return false
  if (vetoingPop === undefined) return undefined
  return !!vetoingPop
}

const useUserVetoRecord = () => {
  // TODO
  return undefined
}

const useUserVetoTokenRecord = () => {
  const { ownTokenRecord, ownCouncilTokenRecord } = useRealm()
  const vetoingPop = useVetoingPop()
  const voterTokenRecord =
    vetoingPop === 'community' ? ownTokenRecord : ownCouncilTokenRecord
  return voterTokenRecord
}

const useCanVeto = ():
  | undefined
  | { canVote: true }
  | { canVote: false; message: string } => {
  const vetoingPop = useVetoingPop()
  const { ownTokenRecord, ownCouncilTokenRecord, ownVoterWeight } = useRealm()
  const connected = useWalletStore((s) => s.connected)
  const isVetoable = useIsVetoable()
  const userVetoRecord = useUserVetoRecord()
  const voterTokenRecord = useUserVetoTokenRecord()

  if (isVetoable === false)
    return {
      canVote: false,
      // (Note that users should never actually see this)
      message: 'This proposal is not vetoable',
    }

  // Are you connected?
  if (connected === false)
    return { canVote: false, message: 'You must connect your wallet' }

  // Did you already veto?
  if (userVetoRecord) return { canVote: false, message: 'You already voted' }

  // Do you have any voting power?
  const hasMinAmountToVote =
    voterTokenRecord &&
    ownVoterWeight.hasMinAmountToVote(
      voterTokenRecord.account.governingTokenMint
    )
  if (hasMinAmountToVote === undefined) return undefined
  if (hasMinAmountToVote === false)
    return {
      canVote: false,
      message: 'You don’t have governance power to vote in this dao',
    }

  return { canVote: true }
}

const useIsVoting = () => {
  const { governance, proposal } = useWalletStore((s) => s.selectedProposal)
  const hasVoteTimeExpired = useHasVoteTimeExpired(governance, proposal!)

  const isVoting =
    proposal?.account.state === ProposalState.Voting && !hasVoteTimeExpired
  return isVoting
}

const VetoPanel = () => {
  const vetoable = useIsVetoable()
  const vetoingPop = useVetoingPop()
  const canVeto = useCanVeto()
  const [openModal, setOpenModal] = useState(false)
  const voterTokenRecord = useUserVetoTokenRecord()

  return vetoable && vetoingPop && voterTokenRecord ? (
    <>
      <div className="bg-bkg-2 p-4 md:p-6 rounded-lg space-y-4">
        <div className="flex flex-col items-center justify-center">
          <h3 className="text-center">Cast your {vetoingPop} veto vote</h3>
        </div>
        <div className="flex flex-col items-center justify-center">
          <Button
            tooltipMessage={
              canVeto?.canVote === false ? canVeto.message : undefined
            }
            className="w-full"
            onClick={() => setOpenModal(true)}
            disabled={!canVeto?.canVote}
          >
            <div className="flex flex-row items-center justify-center">
              <BanIcon className="h-4 w-4 mr-2" />
              Veto
            </div>
          </Button>
        </div>
      </div>
      {openModal ? (
        <VoteCommentModal
          onClose={() => setOpenModal(false)}
          isOpen={openModal}
          voterTokenRecord={voterTokenRecord}
          vote={VoteKind.Veto}
        />
      ) : null}
    </>
  ) : null
}

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
    tokenRole,
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
    tokenRole === GoverningTokenRole.Community && ownTokenRecord
      ? voteRecordsByVoter[
          ownTokenRecord.account.governingTokenOwner.toBase58()
        ]
      : ownCouncilTokenRecord
      ? voteRecordsByVoter[
          ownCouncilTokenRecord.account.governingTokenOwner.toBase58()
        ]
      : wallet?.publicKey && voteRecordsByVoter[wallet.publicKey.toBase58()]

  const voterTokenRecord =
    tokenRole === GoverningTokenRole.Community
      ? ownTokenRecord
      : ownCouncilTokenRecord

  const isVoteCast = ownVoteRecord !== undefined
  const isVoting = useIsVoting()

  const hasMinAmountToVote =
    voterTokenRecord &&
    ownVoterWeight.hasMinAmountToVote(
      voterTokenRecord.account.governingTokenMint
    )

  const isVoteEnabled =
    connected && isVoting && !isVoteCast && hasMinAmountToVote

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
        realm!.pubkey,
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

  const votingPop =
    tokenRole === GoverningTokenRole.Community ? 'community' : 'council'

  const actionLabel =
    !isVoteCast || !connected ? `Cast your ${votingPop} vote` : 'Your vote'

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
    : client.clientType === VotingClientType.NftVoterClient && !voterTokenRecord
    ? 'You must join the Realm to be able to vote'
    : !voterTokenRecord ||
      !ownVoterWeight.hasMinAmountToVote(
        voterTokenRecord.account.governingTokenMint
      )
    ? 'You don’t have governance power to vote in this dao'
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
  const didNotVote =
    !!proposal &&
    !isVoting &&
    proposal.account.state !== ProposalState.Cancelled &&
    proposal.account.state !== ProposalState.Draft &&
    !isVoteCast &&
    isVisibleToWallet

  //Todo: move to own components with refactor to dao folder structure
  const isPyth = realmInfo?.realmId.toBase58() === PYTH_REALM_ID.toBase58()

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
          <div className="flex flex-col items-center justify-center">
            <h3 className="text-center">{actionLabel}</h3>
            {isVoteCast &&
              connected &&
              ownVoteRecord &&
              (isYesVote(ownVoteRecord.account) ? (
                <Tooltip content={`You voted "Yes"`}>
                  <div className="flex flex-row items-center justify-center rounded-full border border-[#8EFFDD] p-2 mt-2">
                    <ThumbUpIcon className="h-4 w-4 fill-[#8EFFDD]" />
                  </div>
                </Tooltip>
              ) : (
                <Tooltip content={`You voted "No"`}>
                  <div className="flex flex-row items-center justify-center rounded-full border border-[#FF7C7C] p-2 mt-2">
                    <ThumbDownIcon className="h-4 w-4 fill-[#FF7C7C]" />
                  </div>
                </Tooltip>
              ))}
          </div>

          <div className="items-center justify-center flex w-full gap-5">
            {isVoteCast && connected ? (
              <div className="flex flex-col gap-6 items-center">
                {isVoting && (
                  <SecondaryButton
                    className="min-w-[200px]"
                    isLoading={isLoading}
                    tooltipMessage={withdrawTooltipContent}
                    onClick={() => submitRelinquishVote()}
                    disabled={!isWithdrawEnabled || isLoading}
                  >
                    Withdraw
                  </SecondaryButton>
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
                        <ThumbUpIcon className="h-4 w-4 mr-2" />
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
                        <ThumbDownIcon className="h-4 w-4 mr-2" />
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
              vote={vote! === YesNoVote.Yes ? VoteKind.Approve : VoteKind.Deny}
              voterTokenRecord={voterTokenRecord!}
            />
          ) : null}
        </div>
      )}
      <VetoPanel />
      {didNotVote && (
        <div className="bg-bkg-2 p-4 md:p-6 rounded-lg flex flex-col items-center justify-center">
          <h3 className="text-center mb-0">You did not vote</h3>
          <Tooltip content="You did not vote on this proposal">
            <BanIcon className="h-[34px] w-[34px] fill-white/50 mt-2" />
          </Tooltip>
        </div>
      )}
    </>
  )
}

export default VotePanel
