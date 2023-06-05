import Button, { SecondaryButton } from '@components/Button'
import Loading from '@components/Loading'
import Modal from '@components/Modal'
import { ThumbDownIcon, ThumbUpIcon } from '@heroicons/react/solid'
import useCreateProposal from '@hooks/useCreateProposal'
import useLegacyConnectionContext from '@hooks/useLegacyConnectionContext'
import useQueryContext from '@hooks/useQueryContext'
import useRealm from '@hooks/useRealm'
import useWalletDeprecated from '@hooks/useWalletDeprecated'
import {
  getGovernanceProgramVersion,
  getInstructionDataFromBase64,
  Governance,
  ProgramAccount,
  Proposal,
  Realm,
  serializeInstructionToBase64,
  TokenOwnerRecord,
  Vote,
  withCastVote,
  YesNoVote,
} from '@solana/spl-governance'
import { PublicKey, TransactionInstruction } from '@solana/web3.js'
import { notify } from '@utils/notifications'
import { InstructionDataWithHoldUpTime } from 'actions/createProposal'
import { useRouter } from 'next/router'
import { useState } from 'react'

interface Props {
  onClose: () => void
  isOpen: boolean
  vote: YesNoVote
  proposal: ProgramAccount<Proposal>
  voterTokenRecord: ProgramAccount<TokenOwnerRecord>
  realm: ProgramAccount<Realm>
  currentGovernance?: ProgramAccount<Governance>
  programId?: PublicKey | null
}
export default function VoteProposalModal({
  onClose,
  isOpen,
  vote,
  voterTokenRecord,
  programId,
  realm,
  currentGovernance,
  proposal,
}: Props) {
  const router = useRouter()
  const { symbol } = useRealm()
  const { fmtUrlWithCluster } = useQueryContext()

  // const [comment, setComment] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const connection = useLegacyConnectionContext()
  const { wallet } = useWalletDeprecated()

  const { handleCreateProposal } = useCreateProposal()

  const submitVote = async (vote: YesNoVote) => {
    if (!wallet || !wallet.publicKey) {
      notify({ type: 'error', message: 'Please connect your wallet to vote.' })
      return
    }

    if (!programId || !currentGovernance) {
      notify({ type: 'error', message: 'Governance program not found.' })
      return
    }

    try {
      setSubmitting(true)

      const instructions: TransactionInstruction[] = []

      const governanceAuthority = voterTokenRecord.account.governingTokenOwner

      const programVersion = await getGovernanceProgramVersion(
        connection.current,
        programId
      )

      await withCastVote(
        instructions,
        programId,
        programVersion,
        realm.pubkey,
        proposal.account.governance,
        proposal.pubkey,
        proposal.account.tokenOwnerRecord,
        voterTokenRecord.pubkey,
        governanceAuthority,
        proposal.account.governingTokenMint,
        Vote.fromYesNoVote(vote),
        governanceAuthority
      )

      // if (comment.length > 0) {
      //   const msg = new ChatMessageBody({
      //     type: ChatMessageBodyType.Text,
      //     value: comment,
      //   })
      //   await withPostChatMessage(
      //     instructions,
      //     signers,
      //     GOVERNANCE_CHAT_PROGRAM_ID,
      //     programId,
      //     realm.pubkey,
      //     proposal.account.governance,
      //     proposal.pubkey,
      //     voterTokenRecord.pubkey,
      //     governanceAuthority,
      //     payer,
      //     undefined,
      //     msg
      //   )
      // }

      if (instructions.length <= 0) {
        notify({ type: 'error', message: 'No instructions found.' })
        return
      }

      const instructionsData: InstructionDataWithHoldUpTime[] = []

      instructions.forEach((ix) => {
        const serialized = serializeInstructionToBase64(ix)
        const data: InstructionDataWithHoldUpTime = {
          data: getInstructionDataFromBase64(serialized),
          holdUpTime: currentGovernance.account.config.minInstructionHoldUpTime,
          prerequisiteInstructions: [],
        }
        instructionsData.push(data)
      })

      const proposalAddress = await handleCreateProposal({
        title: `Vote ${vote === YesNoVote.Yes ? 'Yes' : 'No'}: ${
          proposal.account.name
        }`,
        description: `Voting ${
          vote === YesNoVote.Yes ? 'Yes' : 'No'
        } on proposal: ${proposal.account.name} at ${realm.pubkey.toBase58()}`,
        instructionsData,
        governance: currentGovernance,
      })

      const url = fmtUrlWithCluster(
        `/dao/${symbol}/proposal/${proposalAddress}`
      )
      await router.push(url)
    } catch (e) {
      console.error(e)
      notify({ type: 'error', message: 'Failed to vote.' })
    } finally {
      setSubmitting(false)
    }
  }

  const voteString = vote === YesNoVote.Yes ? 'Yes' : 'No'

  return (
    <Modal onClose={onClose} isOpen={isOpen}>
      <h2>Confirm your vote</h2>

      {/* <Tooltip content="This will be stored on-chain and displayed publically in the discussion on this proposal">
        <label className="border- mt-4 border-dashed border-fgd-3 inline-block leading-4 text-fgd-1 text-sm hover:cursor-help hover:border-b-0">
          Leave a comment
        </label>
        <span className="ml-1 text-xs text-fgd-3">(Optional)</span>
      </Tooltip>

      <Input
        className="mt-1.5"
        value={comment}
        type="text"
        onChange={(e) => setComment(e.target.value)}
        // placeholder={`Let the DAO know why you vote '${voteString}'`}
      /> */}
      <div className="flex items-center justify-center mt-8">
        <SecondaryButton className="w-44 mr-4" onClick={onClose}>
          Cancel
        </SecondaryButton>

        <Button
          className="w-44 flex items-center justify-center"
          onClick={() => submitVote(vote)}
        >
          <div className="flex items-center">
            {!submitting &&
              (vote === YesNoVote.Yes ? (
                <ThumbUpIcon className="h-4 w-4 fill-black mr-2" />
              ) : (
                <ThumbDownIcon className="h-4 w-4 fill-black mr-2" />
              ))}
            {submitting ? <Loading /> : <span>Vote {voteString}</span>}
          </div>
        </Button>
      </div>
    </Modal>
  )
}
