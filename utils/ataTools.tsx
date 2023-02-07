import { utils } from '@coral-xyz/anchor'
import {
  ASSOCIATED_TOKEN_PROGRAM_ID,
  Token,
  TOKEN_PROGRAM_ID,
} from '@solana/spl-token'
import { Connection, PublicKey, Transaction } from '@solana/web3.js'
import type { ConnectionContext } from 'utils/connection'
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
    owner, // owner
    true
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

export async function getATA({
  connection,
  receiverAddress,
  mintPK,
  wallet,
}: {
  connection: ConnectionContext
  receiverAddress: PublicKey
  mintPK: PublicKey
  wallet: any
}) {
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
    const existingAta = await tryGetAta(
      connection.current,
      mintPK,
      currentAddress
    )
    if (!existingAta) {
      const ata = await Token.getAssociatedTokenAddress(
        ASSOCIATED_TOKEN_PROGRAM_ID, // always ASSOCIATED_TOKEN_PROGRAM_ID
        TOKEN_PROGRAM_ID, // always TOKEN_PROGRAM_ID
        mintPK, // mint
        receiverAddress, // owner
        true
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

export function findATAAddrSync(
  wallet: PublicKey,
  mintAddress: PublicKey
): [PublicKey, number] {
  const seeds = [
    wallet.toBuffer(),
    TOKEN_PROGRAM_ID.toBuffer(),
    mintAddress.toBuffer(),
  ]
  return utils.publicKey.findProgramAddressSync(
    seeds,
    ASSOCIATED_TOKEN_PROGRAM_ID
  )
}
