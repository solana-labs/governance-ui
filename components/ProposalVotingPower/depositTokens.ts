import type BigNumber from 'bignumber.js'
import type { SignerWalletAdapter } from '@solana/wallet-adapter-base'
import {
  ProgramAccount,
  Realm,
  withDepositGoverningTokens,
} from '@solana/spl-governance'
import {
  Connection,
  Keypair,
  Transaction,
  TransactionInstruction,
} from '@solana/web3.js'
import BN from 'bn.js'

import { RealmInfo, getProgramVersionForRealm } from '@models/registry/api'
import {
  approveTokenTransfer,
  TokenAccount,
  TokenProgramAccount,
} from '@utils/tokens'
import { sendTransaction } from '@utils/send'

interface Args {
  amount: BigNumber
  connection: Connection
  depositTokenAccount: TokenProgramAccount<TokenAccount>
  realm: ProgramAccount<Realm>
  realmInfo: RealmInfo
  wallet: SignerWalletAdapter
}

export default async function depositTokens({
  amount,
  connection,
  depositTokenAccount,
  realm,
  realmInfo,
  wallet,
}: Args) {
  if (!wallet.publicKey) {
    throw new Error('Could not complete deposit; wallet missing publicKey')
  }

  const instructions: TransactionInstruction[] = []
  const signers: Keypair[] = []
  const amountBN = new BN(amount.toString())

  const transferAuthority = approveTokenTransfer(
    instructions,
    [],
    depositTokenAccount.publicKey,
    wallet.publicKey,
    amountBN
  )

  signers.push(transferAuthority)

  await withDepositGoverningTokens(
    instructions,
    realmInfo.programId,
    getProgramVersionForRealm(realmInfo!),
    realm.pubkey,
    depositTokenAccount.publicKey,
    depositTokenAccount.account.mint,
    wallet!.publicKey,
    transferAuthority.publicKey,
    wallet!.publicKey,
    amountBN
  )

  const transaction = new Transaction()
  transaction.add(...instructions)

  await sendTransaction({
    connection,
    signers,
    transaction,
    wallet,
    sendingMessage: 'Depositing tokens',
    successMessage: 'Tokens have been deposited',
  })
}
