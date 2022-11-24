import { ApprovalProgress } from '@components/QuorumProgress'
import Button from '@components/Button'
import VoteResultsForRealmProposal from '@components/VoteResultsForRealmProposal'
import { ExternalLinkIcon } from '@heroicons/react/outline'
import { ThumbUpIcon } from '@heroicons/react/solid'
import useCreateProposal from '@hooks/useCreateProposal'
import { useHasVoteTimeExpired } from '@hooks/useHasVoteTimeExpired'
import useQueryContext from '@hooks/useQueryContext'
import useRealm from '@hooks/useRealm'
import useRealmProposalVotes from '@hooks/useRealmProposalVotes'
import useWallet from '@hooks/useWallet'
import {
  getGovernanceProgramVersion,
  getInstructionDataFromBase64,
  Governance,
  ProgramAccount,
  Proposal,
  ProposalState,
  Realm,
  serializeInstructionToBase64,
  TokenOwnerRecord,
  VoteRecord,
  withRelinquishVote,
  YesNoVote,
} from '@solana/spl-governance'
import { PublicKey, Transaction, TransactionInstruction } from '@solana/web3.js'
import { notify } from '@utils/notifications'
import { InstructionDataWithHoldUpTime } from 'actions/createProposal'
import classNames from 'classnames'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useCallback, useState } from 'react'
import useWalletStore from 'stores/useWalletStore'
import VoteProposalModal from './VoteProposalModal'

function getLabel(proposalState: ProposalState, hasVotingExpired?: boolean) {
  switch (proposalState) {
    case ProposalState.Cancelled:
      return 'Cancelled'
    case ProposalState.Completed:
      return 'Completed'
    case ProposalState.Defeated:
      return 'Defeated'
    case ProposalState.Draft:
      return 'Draft'
    case ProposalState.Executing:
      return 'Executable'
    case ProposalState.ExecutingWithErrors:
      return 'Executing w/ errors'
    case ProposalState.SigningOff:
      return 'Signing off'
    case ProposalState.Succeeded:
      return 'Completed'
    case ProposalState.Voting:
      return hasVotingExpired ? 'Finalizing' : 'Voting'
  }
}

function getTextColor(
  proposalState: ProposalState,
  hasVotingExpired?: boolean
) {
  switch (proposalState) {
    case ProposalState.Cancelled:
    case ProposalState.Draft:
      return 'text-white'
    case ProposalState.Completed:
      return 'text-[#8EFFDD]'
    case ProposalState.Defeated:
    case ProposalState.ExecutingWithErrors:
      return 'text-[#FF7C7C]'
    case ProposalState.Executing:
      return 'text-[#5DC9EB]'
    case ProposalState.SigningOff:
      return 'text-[#F5A458]'
    case ProposalState.Succeeded:
      return 'text-[#8EFFDD]'

    case ProposalState.Voting:
      return hasVotingExpired
        ? 'bg-gradient-to-r from-[#00C2FF] via-[#00E4FF] to-[#87F2FF] bg-clip-text text-transparent'
        : 'text-[#8EFFDD]'
  }
}

function getBorderColor(
  proposalState: ProposalState,
  hasVotingExpired?: boolean
) {
  switch (proposalState) {
    case ProposalState.Cancelled:
    case ProposalState.Completed:
    case ProposalState.Defeated:
    case ProposalState.ExecutingWithErrors:
      return 'border-transparent'
    case ProposalState.Executing:
      return 'border-[#5DC9EB]'
    case ProposalState.Draft:
      return 'border-white'
    case ProposalState.SigningOff:
      return 'border-[#F5A458]'
    case ProposalState.Succeeded:
      return 'border-transparent'

    case ProposalState.Voting:
      return hasVotingExpired ? 'border-[#5DC9EB]' : 'border-[#8EFFDD]'
  }
}

function getOpacity(proposalState: ProposalState) {
  switch (proposalState) {
    case ProposalState.Cancelled:
    case ProposalState.Completed:
    case ProposalState.Defeated:
    case ProposalState.ExecutingWithErrors:
      return 'opacity-70'
    case ProposalState.Draft:
      return ''
    case ProposalState.SigningOff:
      return ''
    case ProposalState.Succeeded:
      return 'opacity-70'
    default:
      return ''
  }
}

interface Props {
  voteRecord?: ProgramAccount<VoteRecord>
  proposal: ProgramAccount<Proposal>
  proposalGovernance?: ProgramAccount<Governance>
  currentGovernance?: ProgramAccount<Governance>
  realm: ProgramAccount<Realm>
  tokenOwnerRecord: ProgramAccount<TokenOwnerRecord>
  programId?: PublicKey | null
  realmSymbol: string
}
export default function ProposalDetails({
  voteRecord,
  proposal,
  proposalGovernance,
  currentGovernance,
  realm,
  tokenOwnerRecord,
  programId,
  realmSymbol,
}: Props) {
  const router = useRouter()
  const { cluster } = router.query

  const { symbol } = useRealm()
  const { wallet } = useWallet()
  const connection = useWalletStore((s) => s.connection.current)
  const { fmtUrlWithCluster } = useQueryContext()

  const [showVoteModal, setShowVoteModal] = useState(false)
  const [vote, setVote] = useState<YesNoVote | null>(null)
  const [isWithdrawing, setIsWithdrawing] = useState(false)

  const { handleCreateProposal } = useCreateProposal()

  const voteData = useRealmProposalVotes(
    proposal.account,
    realm.account,
    proposalGovernance?.account
  )

  const hasVoteTimeExpired = useHasVoteTimeExpired(proposalGovernance, proposal)

  const isVoteCast = voteRecord !== undefined
  const isVoting =
    proposal?.account.state === ProposalState.Voting && !hasVoteTimeExpired

  const handleCloseShowVoteModal = useCallback(() => {
    setShowVoteModal(false)
  }, [])
  const handleShowVoteModal = (vote: YesNoVote) => {
    setVote(vote)
    setShowVoteModal(true)
  }

  const handleWithdraw = async () => {
    if (!wallet || !wallet.publicKey) {
      notify({ type: 'error', message: 'Please connect your wallet to vote.' })
      return
    }

    if (!programId || !currentGovernance) {
      notify({ type: 'error', message: 'Governance program not found.' })
      return
    }

    if (!voteRecord) {
      notify({ type: 'error', message: 'No vote record found.' })
      return
    }

    try {
      setIsWithdrawing(true)

      const instructions: TransactionInstruction[] = []

      const programVersion = await getGovernanceProgramVersion(
        connection,
        programId
      )

      await withRelinquishVote(
        instructions,
        programId,
        programVersion,
        realm.pubkey,
        proposal.account.governance,
        proposal.pubkey,
        tokenOwnerRecord.pubkey,
        tokenOwnerRecord.account.governingTokenMint,
        voteRecord.pubkey,
        tokenOwnerRecord.account.governingTokenOwner,
        tokenOwnerRecord.account.governingTokenOwner
      )

      const tx = new Transaction({ feePayer: wallet.publicKey }).add(
        ...instructions
      )
      const simulated = await connection.simulateTransaction(tx)

      if (simulated.value.err) {
        console.log('[SPL_GOV] simulated logs ', simulated.value.logs)
        notify({
          type: 'error',
          message: 'Transaction simulation failed. Check console for logs.',
        })
        return
      }

      const instructionsData: InstructionDataWithHoldUpTime[] = []

      instructions.forEach(async (ix) => {
        const serializedIx = serializeInstructionToBase64(ix)

        const ixData = {
          data: getInstructionDataFromBase64(serializedIx),
          holdUpTime: currentGovernance.account.config.minInstructionHoldUpTime,
          prerequisiteInstructions: [],
          shouldSplitIntoSeparateTxs: false,
        }

        instructionsData.push(ixData)
      })

      const proposalAddress = await handleCreateProposal({
        title: `Relinquishing vote for "${proposal.account.name}"`,
        description: `Relinquishing vote for proposal ${proposal.pubkey.toString()} in ${
          realm.account.name
        }`,
        instructionsData,
        governance: currentGovernance,
      })
      const url = fmtUrlWithCluster(
        `/dao/${symbol}/proposal/${proposalAddress}`
      )
      await router.push(url)
    } catch (e) {
      console.error('[SPL_GOV] Error withdrawing vote', e)
      notify({ type: 'error', message: 'Error withdrawing vote' })
    } finally {
      setIsWithdrawing(false)
    }
  }

  return (
    <div className="rounded-md bg-bkg-2 p-4 flex flex-col space-y-4">
      <div className="flex justify-between border-b border-fgd-4 pb-3">
        <div className="flex flex-col">
          <p className="text-xl font-bold">
            <span>{proposal.account.name}</span>
            <span className="ml-2">
              <Link
                href={`/dao/${realmSymbol}/proposal/${proposal.pubkey.toBase58()}${
                  cluster ? `?cluster=${cluster}` : ''
                }`}
              >
                <a target="_blank" rel="noopener noreferrer">
                  <ExternalLinkIcon className="h-4 w-4 text-slate-500 cursor-pointer inline" />
                </a>
              </Link>
            </span>
          </p>
        </div>
        <div
          className={classNames(
            'border',
            'inline-flex',
            'min-w-max',
            'items-center',
            'px-2',
            'py-1',
            'rounded-full',
            'text-xs',
            getBorderColor(proposal.account.state, hasVoteTimeExpired),
            getOpacity(proposal.account.state),
            getTextColor(proposal.account.state, hasVoteTimeExpired)
          )}
        >
          {getLabel(proposal.account.state, hasVoteTimeExpired)}
        </div>
      </div>
      <div className="flex flex-col lg:flex-row space-y-1 lg:space-y-0 lg:space-x-3">
        <div className="flex-1">
          <VoteResultsForRealmProposal
            isListView
            proposal={proposal.account}
            realm={realm}
            governance={proposalGovernance}
          />
        </div>
        <div className="hidden lg:block self-stretch w-0.5 bg-fgd-4" />
        <div className="flex-1">
          <ApprovalProgress
            progress={voteData.yesVoteProgress}
            votesRequired={voteData.yesVotesRequired}
          />
        </div>
      </div>
      {isVoting && (
        <>
          <div className="flex space-x-2">
            {!isVoteCast ? (
              <>
                <Button
                  className="flex-1"
                  disabled={isVoteCast || !wallet || !wallet.publicKey}
                  onClick={() => handleShowVoteModal(YesNoVote.Yes)}
                  tooltipMessage={
                    !wallet || !wallet.publicKey
                      ? 'Please connect your wallet.'
                      : undefined
                  }
                >
                  <div className="flex flex-row items-center justify-center">
                    <ThumbUpIcon className="h-4 w-4 mr-2" />
                    Vote Yes
                  </div>
                </Button>
                <Button
                  className="flex-1"
                  disabled={isVoteCast || !wallet || !wallet.publicKey}
                  onClick={() => handleShowVoteModal(YesNoVote.No)}
                  tooltipMessage={
                    !wallet || !wallet.publicKey
                      ? 'Please connect your wallet.'
                      : undefined
                  }
                >
                  <div className="flex flex-row items-center justify-center">
                    <ThumbUpIcon className="h-4 w-4 mr-2" />
                    Vote No
                  </div>
                </Button>
              </>
            ) : (
              <Button
                className="w-full"
                onClick={handleWithdraw}
                disabled={isWithdrawing || !wallet || !wallet.publicKey}
              >
                Withdraw
              </Button>
            )}
          </div>
          {showVoteModal ? (
            <VoteProposalModal
              isOpen={showVoteModal}
              onClose={handleCloseShowVoteModal}
              vote={vote!}
              proposal={proposal}
              voterTokenRecord={tokenOwnerRecord}
              realm={realm}
              programId={programId}
              currentGovernance={currentGovernance}
            />
          ) : null}
        </>
      )}
    </div>
  )
}
