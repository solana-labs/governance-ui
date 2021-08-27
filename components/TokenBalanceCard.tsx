import {
  Account,
  SystemProgram,
  Transaction,
  TransactionInstruction,
} from '@solana/web3.js'
import BN from 'bn.js'
import useRealm from '../hooks/useRealm'
import { withDepositGoverningTokens } from '../models/withDepositGoverningTokens'
import { withWithdrawGoverningTokens } from '../models/withWithdrawGoverningTokens'
import useWalletStore from '../stores/useWalletStore'
import { sendTransaction } from '../utils/send'
import { approveTokenTransfer, TOKEN_PROGRAM_ID } from '../utils/tokens'
import Button from './Button'

const TokenBalanceCard = () => {
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

  const withdrawAllTokens = async function () {
    const instructions: TransactionInstruction[] = []

    await withWithdrawGoverningTokens(
      instructions,
      realmInfo.programId,
      realm.pubkey,
      realmTokenAccount.publicKey,
      realm.info.communityMint,
      wallet.publicKey,
      TOKEN_PROGRAM_ID
    )

    const transaction = new Transaction()
    transaction.add(...instructions)

    await sendTransaction({
      connection,
      wallet,
      transaction,
      sendingMessage: 'Withdrawing tokens',
      successMessage: 'Tokens have been withdrawn',
    })

    await fetchWalletTokenAccounts()
    await fetchRealm(realmInfo.programId, realmInfo.realmId)
  }

  const hasTokensInWallet =
    realmTokenAccount && realmTokenAccount.account.amount.gt(new BN(0))

  const hasTokensDeposited =
    ownTokenRecord &&
    ownTokenRecord.info.governingTokenDepositAmount.gt(new BN(0))

  return (
    <div className="bg-bkg-2 p-6 rounded-md">
      <h3 className="mb-4">Deposit Tokens</h3>

      <div className="flex space-x-4 items-center">
        <div className="bg-bkg-1 px-4 py-2 rounded w-full">
          <p className="text-fgd-3 text-xs">{symbol} Votes</p>
          <div className="font-bold">
            {ownTokenRecord
              ? ownTokenRecord.info.governingTokenDepositAmount.toNumber()
              : '0'}
          </div>
        </div>
      </div>

      <div className="flex space-x-4">
        <Button
          className="w-1/2"
          disabled={!connected || !hasTokensInWallet}
          onClick={depositAllTokens}
        >
          Deposit
        </Button>
        <Button
          className="w-1/2"
          disabled={!connected || !hasTokensDeposited}
          onClick={withdrawAllTokens}
        >
          Withdraw
        </Button>
      </div>
    </div>
  )
}

export default TokenBalanceCard
