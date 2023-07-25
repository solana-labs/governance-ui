import Button from '@components/Button'
import VoteCommentModal from '@components/VoteCommentModal'
import { BanIcon } from '@heroicons/react/solid'
import useRealm from '@hooks/useRealm'
import useWalletOnePointOh from '@hooks/useWalletOnePointOh'
import { VoteKind } from '@solana/spl-governance'
import { useState } from 'react'
import {
  useIsInCoolOffTime,
  useIsVoting,
  useUserVetoTokenRecord,
  useVetoingPop,
} from './hooks'
import { useProposalVoteRecordQuery } from '@hooks/queries/voteRecord'
import { useSubmitVote } from '@hooks/useSubmitVote'
import { useSelectedRealmInfo } from '@hooks/selectedRealm/useSelectedRealmRegistryEntry'

const useIsVetoable = (): undefined | boolean => {
  const vetoingPop = useVetoingPop()
  const isVoting = useIsVoting()
  const isInCoolOffTime = useIsInCoolOffTime()
  // TODO is this accurate?
  if (isVoting === false && isInCoolOffTime === false) return false
  if (vetoingPop === undefined) return undefined
  return !!vetoingPop
}

const useCanVeto = ():
  | undefined
  | { canVeto: true }
  | { canVeto: false; message: string } => {
  const { ownVoterWeight } = useRealm()
  const wallet = useWalletOnePointOh()
  const connected = !!wallet?.connected
  const isVetoable = useIsVetoable()
  const { data: userVetoRecord } = useProposalVoteRecordQuery('veto')
  const voterTokenRecord = useUserVetoTokenRecord()

  if (isVetoable === false)
    return {
      canVeto: false,
      // (Note that users should never actually see this)
      message: 'This proposal is not vetoable',
    }

  // Are you connected?
  if (connected === false)
    return { canVeto: false, message: 'You must connect your wallet' }

  // Did you already veto?
  if (userVetoRecord?.found)
    return { canVeto: false, message: 'You already voted' }

  // Do you have any voting power?
  const hasMinAmountToVote =
    voterTokenRecord &&
    ownVoterWeight.hasMinAmountToVote(
      voterTokenRecord.account.governingTokenMint
    )
  if (hasMinAmountToVote === undefined) return undefined
  if (hasMinAmountToVote === false)
    return {
      canVeto: false,
      message: 'You don’t have governance power to vote in this dao',
    }

  return { canVeto: true }
}

const VetoButtons = () => {
  const realmInfo = useSelectedRealmInfo()
  const allowDiscussion = realmInfo?.allowDiscussion ?? true
  const vetoable = useIsVetoable()
  const vetoingPop = useVetoingPop()
  const canVeto = useCanVeto()
  const [openModal, setOpenModal] = useState(false)
  const voterTokenRecord = useUserVetoTokenRecord()
  const { data: userVetoRecord } = useProposalVoteRecordQuery('veto')
  const { submitting, submitVote } = useSubmitVote()

  const handleVeto = async () => {
    if (allowDiscussion) {
      setOpenModal(true)
    } else {
      submitVote({
        vote: VoteKind.Veto,
        voterTokenRecord: voterTokenRecord!,
      })
    }
  }

  return vetoable &&
    vetoingPop &&
    voterTokenRecord &&
    !userVetoRecord?.found ? (
    <>
      <div className="bg-bkg-2 p-4 md:p-6 rounded-lg space-y-4">
        <div className="flex flex-col items-center justify-center">
          <h3 className="text-center">Cast your {vetoingPop} veto vote</h3>
        </div>
        <div className="flex flex-col items-center justify-center">
          <Button
            tooltipMessage={
              canVeto?.canVeto === false ? canVeto.message : undefined
            }
            className="w-full"
            onClick={handleVeto}
            disabled={!canVeto?.canVeto || submitting}
            isLoading={submitting}
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

export default VetoButtons
