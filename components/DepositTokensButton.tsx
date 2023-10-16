import { BigNumber } from 'bignumber.js'
import Button, { ButtonProps, SecondaryButton } from '@components/Button'
import BN from 'bn.js'
import useUserGovTokenAccountQuery from '@hooks/useUserGovTokenAccount'
import { useDepositCallback } from './GovernancePower/Vanilla/useDepositCallback'
import useWalletOnePointOh from '@hooks/useWalletOnePointOh'
import Modal from './Modal'
import { useState, useEffect } from 'react'
import useGoverningTokenMint from '@hooks/selectedRealm/useGoverningTokenMint'
import { useMintInfoByPubkeyQuery } from '@hooks/queries/mintInfo'
import Input from './inputs/Input'

export const DepositTokensButton = ({
  role,
  as = 'secondary',
  ...props
}: { role: 'community' | 'council'; as?: 'primary' | 'secondary' } & Omit<
  ButtonProps,
  'onClick' | 'tooltipMessage'
>) => {
  const wallet = useWalletOnePointOh()
  const connected = !!wallet?.connected

  const userAta = useUserGovTokenAccountQuery(role).data?.result
  const depositAmount = userAta?.amount
    ? new BigNumber(userAta.amount.toString())
    : new BigNumber(0)

  const hasTokensInWallet = depositAmount.isGreaterThan(0)
  const depositTooltipContent = !connected
    ? 'Connect your wallet to deposit'
    : !hasTokensInWallet
      ? "You don't have any governance tokens in your wallet to deposit."
      : undefined

  const ButtonToUse = as === 'primary' ? Button : SecondaryButton
  const [openModal, setOpenModal] = useState(false)
  const mint = useGoverningTokenMint(role)
  const mintInfo = useMintInfoByPubkeyQuery(mint).data?.result

  const humanReadableMax =
    mintInfo === undefined
      ? undefined
      : depositAmount.shiftedBy(-mintInfo.decimals).toNumber()

  const [amount, setAmount] = useState('')

  useEffect(() => {
    if (humanReadableMax && humanReadableMax > 0)
      setAmount(humanReadableMax ? humanReadableMax.toString() : '')
  }, [humanReadableMax])

  const deposit = useDepositCallback(role)

  return (
    <>
      <ButtonToUse
        {...props}
        onClick={() => setOpenModal(true)}
        tooltipMessage={depositTooltipContent}
        disabled={!connected || !hasTokensInWallet || props.disabled}
      >
        Deposit
      </ButtonToUse>
      {openModal && (
        <Modal isOpen={openModal} onClose={() => setOpenModal(false)}>
          <div className="flex flex-col gap-y-4">
            <h2>Deposit tokens</h2>
            <label>
              Amount to deposit
              <span>
                &nbsp;-&nbsp;<a href="#" onClick={() => { setAmount(humanReadableMax ? humanReadableMax.toString() : '') }}>Max</a>
              </span>
            </label>
            <Input
              placeholder={humanReadableMax?.toString() + ' (max)'}
              type="number"
              value={amount}
              onChange={(e) => { setAmount(e.target.value) }}
              max={humanReadableMax}
            />
            <Button
              onClick={async () => {
                if (mintInfo === undefined) throw new Error()
                const nativeAmount = new BN(
                  new BigNumber(amount).shiftedBy(mintInfo.decimals).toString()
                )
                await deposit(nativeAmount)
                setOpenModal(false)
              }}
              disabled={humanReadableMax !== undefined && (parseInt(amount) > humanReadableMax || parseInt(amount) > 0)}
            >
              Confirm
            </Button>
          </div>
        </Modal>
      )}
    </>
  )
}
