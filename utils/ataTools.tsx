import {
  ASSOCIATED_TOKEN_PROGRAM_ID,
  Token,
  TOKEN_PROGRAM_ID,
} from '@solana/spl-token'
import { Connection, PublicKey, Transaction } from '@solana/web3.js'
import { WalletAdapter } from '../@types/types'
import { ConnectionContext } from 'stores/useWalletStore'
import { sendTransaction } from './send'
import { tryGetAta, isExistingTokenAccount } from './validations'

// calculate ATA
export async function createATA(
  connection: Connection,
  wallet,
  mintPubkey: PublicKey,
  owner: PublicKey,
  feePayer: PublicKey
) {
  const ata = await Token.getAssociatedTokenAddress(
    ASSOCIATED_TOKEN_PROGRAM_ID, // always ASSOCIATED_TOKEN_PROGRAM_ID
    TOKEN_PROGRAM_ID, // always TOKEN_PROGRAM_ID
    mintPubkey, // mint
    owner // owner
  )

  const transaction = new Transaction()
  transaction.add(
    Token.createAssociatedTokenAccountInstruction(
      ASSOCIATED_TOKEN_PROGRAM_ID, // always ASSOCIATED_TOKEN_PROGRAM_ID
      TOKEN_PROGRAM_ID, // always TOKEN_PROGRAM_ID
      mintPubkey, // mint
      ata, // ata
      owner, // owner of token account
      feePayer // fee payer
    )
  )
  await sendTransaction({
    connection,
    wallet,
    transaction,
  })
  return ata
}

export async function findTrueReceiver(
  connection: ConnectionContext,
  receiverAddress: PublicKey,
  mintPK: PublicKey,
  wallet: WalletAdapter
) {
  if (!wallet?.publicKey) {
    throw 'please connect your wallet'
  }
  let currentAddress = receiverAddress
  let needToCreateAta = false
  const isExistingAccount = await isExistingTokenAccount(
    connection,
    receiverAddress
  )
  if (!isExistingAccount) {
    const existingAta = await tryGetAta(connection, mintPK, currentAddress)
    if (!existingAta) {
      const ata = await Token.getAssociatedTokenAddress(
        ASSOCIATED_TOKEN_PROGRAM_ID, // always ASSOCIATED_TOKEN_PROGRAM_ID
        TOKEN_PROGRAM_ID, // always TOKEN_PROGRAM_ID
        mintPK, // mint
        receiverAddress // owner
      )
      needToCreateAta = true
      currentAddress = ata
    } else {
      currentAddress = existingAta.publicKey
    }
  }
  return {
    currentAddress,
    needToCreateAta,
  }
}
