import React, { useState } from 'react'
import { PublicKey } from '@solana/web3.js'
import Modal from '@components/Modal'
import Button, { LinkButton, SecondaryButton } from '@components/Button'
import { getMinDurationFmt, getTimeLeftFromNowFmt } from '@utils/dateTools'
import { notify } from '@utils/notifications'
import { PositionWithMeta } from '../sdk/types'
import { getMintMinAmountAsDecimal } from '@tools/sdk/units'
import useRealm from '@hooks/useRealm'
import { precision } from '@utils/formatting'
import Input from '@components/inputs/Input'

export interface TransferTokensModalProps {
  isOpen: boolean
  positions: PositionWithMeta[]
  maxTransferAmount: number
  onClose: () => void
  onSubmit: (positon: PositionWithMeta, amount: number) => Promise<void>
}

export const TransferTokensModal: React.FC<TransferTokensModalProps> = ({
  isOpen,
  positions,
  maxTransferAmount,
  onClose,
  onSubmit,
}) => {
  const { mint } = useRealm()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [amount, setAmount] = useState<number | null>(null)
  const [selectedPosPk, setSelectedPosPk] = useState<PublicKey | null>(null)
  const mintMinAmount = mint ? getMintMinAmountAsDecimal(mint) : 1
  const currentPrecision = precision(mintMinAmount)

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!Number(e.target.value)) {
      return setAmount(Number(e.target.value))
    }

    setAmount(
      parseFloat(
        Math.max(
          Number(mintMinAmount),
          Math.min(Number(maxTransferAmount), Number(e.target.value))
        ).toFixed(currentPrecision)
      )
    )
  }

  const handleOnSubmit = async () => {
    if (amount && selectedPosPk) {
      try {
        setIsSubmitting(true)
        await onSubmit(
          positions.find((pos) => pos.pubkey.equals(selectedPosPk))!,
          amount
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
  }

  const CardLabel = ({ label, value }) => {
    return (
      <div className="flex flex-col w-1/2 gap-1">
        <p className="text-xs text-fgd-2">{label}</p>
        <p className="text-xs font-bold text-fgd-1">{value}</p>
      </div>
    )
  }

  const labelClasses = 'mb-2 text-fgd-2 text-sm'
  return (
    <Modal onClose={onClose} isOpen={isOpen}>
      <h2 className="mb-4 flex flex-row items-center">Transfer Tokens</h2>
      <div className="bg-bkg-3 rounded-md w-full p-4 mb-4 font-normal text-xs">
        <div>Select an existing positon to transfer to</div>
        <br />
        <div>
          You can only transfer to positions that have a greater than or equal
          lockup time.
        </div>
        <br />
        <div className="text-red">
          You cant transfer to Landrush positions, and transfering out of one
          after the Landrush period, will result in losing the multiplier!
        </div>
      </div>
      <div className="mb-4">
        <div className={`${labelClasses} flex justify-between`}>
          Amount to Transfer
          <LinkButton
            className="text-primary-light"
            onClick={() => setAmount(maxTransferAmount)}
          >
            Max: {maxTransferAmount}
          </LinkButton>
        </div>
        <Input
          max={maxTransferAmount}
          min={mintMinAmount}
          value={amount}
          type="number"
          onChange={handleAmountChange}
          step={mintMinAmount}
        />
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
                    ? getMinDurationFmt(pos.lockup.startTs, pos.lockup.endTs)
                    : getTimeLeftFromNowFmt(pos.lockup.endTs)
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
          disabled={!selectedPosPk || !amount || isSubmitting}
        >
          Transfer Tokens
        </Button>
        <SecondaryButton onClick={onClose}>Cancel</SecondaryButton>
      </div>
    </Modal>
  )
}
