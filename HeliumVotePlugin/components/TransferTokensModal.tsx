import React, { useState } from 'react'
import { PublicKey } from '@solana/web3.js'
import Modal from '@components/Modal'
import Button, { SecondaryButton } from '@components/Button'
import {
  getMinDurationFmt,
  getTimeLeftFromNowFmt,
} from 'VoteStakeRegistry/tools/dateTools'
import { notify } from '@utils/notifications'
import { PositionWithMeta } from 'HeliumVotePlugin/sdk/types'

export interface TransferTokensModalProps {
  isOpen: boolean
  positions: PositionWithMeta[]
  onClose: () => void
  onSubmit: (positon: PositionWithMeta) => Promise<void>
}

export const TransferTokensModal: React.FC<TransferTokensModalProps> = ({
  isOpen,
  positions,
  onClose,
  onSubmit,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedPosPk, setSelectedPosPk] = useState<PublicKey | null>(null)
  const handleOnSubmit = async () => {
    try {
      setIsSubmitting(true)
      await onSubmit(
        positions.find((pos) => pos.pubkey.equals(selectedPosPk!))!
      )
      onClose()
    } catch (e) {
      setIsSubmitting(false)
      notify({
        type: 'error',
        message: e.message || 'Unable to transfer tokens',
      })
    }
  }

  const CardLabel = ({ label, value }) => {
    return (
      <div className="flex flex-col w-1/2 gap-1">
        <p className="text-xs text-fgd-2">{label}</p>
        <p className="text-xs font-bold text-fgd-1">{value}</p>
      </div>
    )
  }

  return (
    <Modal onClose={onClose} isOpen={isOpen}>
      <h2 className="mb-4 flex flex-row items-center">Transfer Tokens</h2>
      <div className="bg-bkg-3 rounded-md w-full p-4 mb-4 font-normal text-xs">
        <div>Select an exisitng positon to transfer too</div>
        <br />
        <div>
          You can only transfer to positions that have greater than or equal
          lockup time
        </div>
      </div>
      <div className="w-full flex flex-col gap-2">
        {positions.map((pos) => {
          const lockup = pos.lockup
          const lockupKind = Object.keys(lockup.kind)[0] as string
          const isConstant = lockupKind === 'constant'
          const isSelected = selectedPosPk?.equals(pos.pubkey)

          return (
            <div
              className={`border rounded-md flex flex-row w-full p-4 hover:border-fgd-3 hover:bg-bkg-3 hover:cursor-pointer ${
                isSelected ? 'bg-bkg-3 border-fgd-3' : 'border-fgd-4'
              }`}
              onClick={() => setSelectedPosPk(pos.pubkey)}
              key={pos.pubkey.toBase58()}
            >
              <CardLabel
                label="Lockup Type"
                value={lockupKind.charAt(0).toUpperCase() + lockupKind.slice(1)}
              />
              <CardLabel
                label="Vote Multiplier"
                value={(pos.votingPower.isZero()
                  ? 0
                  : pos.votingPower.toNumber() /
                    pos.amountDepositedNative.toNumber()
                ).toFixed(2)}
              />
              <CardLabel
                label={isConstant ? 'Min. Duration' : 'Time left'}
                value={
                  isConstant
                    ? getMinDurationFmt(pos.lockup as any)
                    : getTimeLeftFromNowFmt(pos.lockup as any)
                }
              />
            </div>
          )
        })}
      </div>
      <div className="flex flex-col pt-4">
        <Button
          className="mb-4"
          onClick={handleOnSubmit}
          isLoading={isSubmitting}
          disabled={!selectedPosPk || isSubmitting}
        >
          Transfer Tokens
        </Button>
        <SecondaryButton onClick={onClose}>Cancel</SecondaryButton>
      </div>
    </Modal>
  )
}
