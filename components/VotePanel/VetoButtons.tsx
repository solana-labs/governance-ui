import Button from '@components/Button'
import VoteCommentModal from '@components/VoteCommentModal'
import { BanIcon } from '@heroicons/react/solid'
import useRealm from '@hooks/useRealm'
import {
  GoverningTokenRole,
  VoteThresholdType,
  VoteKind,
} from '@solana/spl-governance'
import { useMemo, useState } from 'react'
import useWalletStore from 'stores/useWalletStore'
import { useIsVoting } from './hooks'

/* 
  returns: undefined if loading, false if nobody can veto, 'council' if council can veto, 'community' if community can veto
*/
export const useVetoingPop = () => {
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
  | { canVeto: true }
  | { canVeto: false; message: string } => {
  const { ownVoterWeight } = useRealm()
  const connected = useWalletStore((s) => s.connected)
  const isVetoable = useIsVetoable()
  const userVetoRecord = useUserVetoRecord()
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
  if (userVetoRecord) return { canVeto: false, message: 'You already voted' }

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
              canVeto?.canVeto === false ? canVeto.message : undefined
            }
            className="w-full"
            onClick={() => setOpenModal(true)}
            disabled={!canVeto?.canVeto}
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
