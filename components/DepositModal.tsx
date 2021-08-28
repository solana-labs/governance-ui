import { useState } from 'react'
import {
  Account,
  SystemProgram,
  Transaction,
  TransactionInstruction,
} from '@solana/web3.js'
import BN from 'bn.js'
import useWalletStore from '../stores/useWalletStore'
import { withDepositGoverningTokens } from '../models/withDepositGoverningTokens'
import { approveTokenTransfer, TOKEN_PROGRAM_ID } from '../utils/tokens'
import useRealm from '../hooks/useRealm'
import { sendTransaction } from '../utils/send'
import Button, { LinkButton } from './Button'
// import { notify } from '../utils/notifications'
import Loading from './Loading'
import Modal from './Modal'
import Input from './Input'

type DepositModalProps = {
  onClose: (success: boolean) => void
  isOpen: boolean
}

const DepositModal = ({ onClose, isOpen }: DepositModalProps) => {
  const [submitting, setSubmitting] = useState(false)
  const wallet = useWalletStore((s) => s.current)
  const connected = useWalletStore((s) => s.connected)
  const connection = useWalletStore((s) => s.connection.current)
  const { fetchWalletTokenAccounts, fetchRealm } = useWalletStore(
    (s) => s.actions
  )
  const {
    symbol,
    realm,
    realmInfo,
    realmTokenAccount,
    ownTokenRecord,
  } = useRealm()

  const [depositAmount, setDepositAmount] = useState(
    realmTokenAccount.account.amount
  )

  const depositTokens = async function (amount: BN) {
    const instructions: TransactionInstruction[] = []
    const signers: Account[] = []

    const transferAuthority = approveTokenTransfer(
      instructions,
      [],
      realmTokenAccount.publicKey,
      wallet.publicKey,
      amount
    )

    signers.push(transferAuthority)

    await withDepositGoverningTokens(
      instructions,
      realmInfo.programId,
      realm.pubkey,
      realmTokenAccount.publicKey,
      realm.info.communityMint,
      wallet.publicKey,
      transferAuthority.publicKey,
      wallet.publicKey,
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
    await fetchRealm(realmInfo.programId, realmInfo.realmId)
  }

  const depositAllTokens = async () =>
    await depositTokens(realmTokenAccount.account.amount)

  return (
    <Modal onClose={() => onClose(false)} isOpen={isOpen}>
      <h2 className="pb-4 text-th-fgd-1">Deposit tokens</h2>
      <div className="flex pb-6">
        <Input
          type="number"
          min="0"
          className={`border border-th-fgd-4 flex-grow pr-11`}
          placeholder="0.00"
          // error={!!invalidAmountMessage}
          // onBlur={(e) => validateAmountInput(e.target.value)}
          value={depositAmount}
          onChange={(e) => setDepositAmount(e.target.value)}
          suffix={symbol}
        />
      </div>
      <Button onClick={() => depositTokens(new BN(depositAmount))}>
        Deposit
      </Button>
    </Modal>
  )
}

export default DepositModal
