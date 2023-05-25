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
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useCallback, useState } from 'react'
import VoteProposalModal from './VoteProposalModal'
import ProposalStateBadge from '@components/ProposalStateBadge'
import { useConnection } from '@solana/wallet-adapter-react'
import useWalletOnePointOh from '@hooks/useWalletOnePointOh'

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
  const wallet = useWalletOnePointOh()
  const { connection } = useConnection()
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
        <ProposalStateBadge proposal={proposal.account} />
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
