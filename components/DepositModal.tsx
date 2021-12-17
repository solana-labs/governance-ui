import { useState } from 'react'
import {
  Account,
  SystemProgram,
  Transaction,
  TransactionInstruction,
} from '@solana/web3.js'
import { MintInfo } from '@solana/spl-token'
import BN from 'bn.js'
import useWalletStore from '../stores/useWalletStore'
import { withDepositGoverningTokens } from '../models/withDepositGoverningTokens'
import { approveTokenTransfer, TOKEN_PROGRAM_ID } from '../utils/tokens'
import useRealm from '../hooks/useRealm'
import { sendTransaction } from '../utils/send'
import Button from './Button'
import Modal from './Modal'
import Input from './Input'
import ButtonGroup from './ButtonGroup'
import { fmtTokenAmount } from '../utils/formatting'

type DepositModalProps = {
  depositTokenAccount: any
  isOpen: boolean
  mint: MintInfo
  onClose: () => void
}

const DepositModal = ({
  depositTokenAccount,
  isOpen,
  mint,
  onClose,
}: DepositModalProps) => {
  const [depositSizePercent, setDepositSizePercent] = useState('100')
  const [invalidAmountMessage, setInvalidAmountMessage] = useState('')
  const wallet = useWalletStore((s) => s.current)
  const connection = useWalletStore((s) => s.connection.current)
  const { fetchWalletTokenAccounts, fetchRealm } = useWalletStore(
    (s) => s.actions
  )
  const { symbol, realm, realmInfo } = useRealm()

  const maxDepositAmount = fmtTokenAmount(
    depositTokenAccount.account.amount,
    mint!.decimals
  )

  const [depositAmount, setDepositAmount] = useState(maxDepositAmount)

  const onChangeInput = (amount) => {
    setDepositAmount(amount)
    setInvalidAmountMessage('')
  }

  const handleSetDepositSize = (percent) => {
    setDepositSizePercent(percent)
    setInvalidAmountMessage('')
    const depositSize = (percent / 100) * maxDepositAmount
    setDepositAmount(Math.floor(depositSize))
  }

  const handleDepositTokens = async function (amount: BN) {
    const instructions: TransactionInstruction[] = []
    const signers: Account[] = []

    const transferAuthority = approveTokenTransfer(
      instructions,
      [],
      depositTokenAccount.publicKey,
      wallet!.publicKey!,
      amount
    )

    signers.push(transferAuthority)

    await withDepositGoverningTokens(
      instructions,
      realmInfo!.programId,
      realm!.pubkey,
      depositTokenAccount.publicKey,
      depositTokenAccount.account.mint,
      wallet!.publicKey!,
      transferAuthority.publicKey,
      amount,
      wallet!.publicKey!,
      TOKEN_PROGRAM_ID,
      SystemProgram.programId
    )

    const transaction = new Transaction()
    transaction.add(...instructions)

    await sendTransaction({
      connection,
      wallet,
      transaction,
      signers,
      sendingMessage: 'Depositing tokens',
      successMessage: 'Tokens have been deposited',
    })

    await fetchWalletTokenAccounts()
    await fetchRealm(realmInfo!.programId, realmInfo!.realmId)
  }

  const depositAllTokens = async (amount: BN) => {
    const formattedAmount = amount.mul(new BN(10).pow(new BN(mint!.decimals)))
    await handleDepositTokens(formattedAmount)

    onClose()
  }

  const validateAmountInput = (amount) => {
    if (amount > maxDepositAmount) {
      setInvalidAmountMessage('Insufficient Balance')
    }
    setDepositAmount(Math.floor(depositAmount))
  }

  return (
    <Modal onClose={onClose} isOpen={isOpen}>
      <h2 className="pb-2 text-th-fgd-1">Deposit Tokens</h2>
      <div className="flex pb-2">
        <Input
          type="number"
          min="0"
          error={!!invalidAmountMessage}
          onBlur={(e) => validateAmountInput(e.target.value)}
          value={depositAmount}
          onChange={(e) => onChangeInput(e.target.value)}
          suffix={symbol}
        />
      </div>
      <div className="pb-6">
        <ButtonGroup
          activeValue={depositSizePercent}
          onChange={(p) => handleSetDepositSize(p)}
          unit="%"
          values={['25', '50', '75', '100']}
        />
      </div>
      <Button
        disabled={!!invalidAmountMessage}
        onClick={() => depositAllTokens(new BN(depositAmount))}
      >
        {invalidAmountMessage
          ? invalidAmountMessage
          : `Deposit ${depositAmount} ${symbol}`}
      </Button>
    </Modal>
  )
}

export default DepositModal
