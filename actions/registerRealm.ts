import { PublicKey, Transaction, TransactionInstruction } from '@solana/web3.js'
import BN from 'bn.js'
import { MintMaxVoteWeightSource } from '../models/accounts'
import { withCreateRealm } from '../models/withCreateRealm'
import { RpcContext } from '../models/core/api'
import { sendTransaction } from '../utils/send'
import { withAddEntry } from '@models/registry/withAddEntry'
import { withInit } from '@models/registry/withInitRegistry'

export async function registerRealm(
  { connection, wallet, programId, programVersion, walletPubkey }: RpcContext,
  name: string,
  description: string,
  imageUrl: string,
  communityMint: PublicKey,
  councilMint: PublicKey | undefined,
  communityMintMaxVoteWeightSource: MintMaxVoteWeightSource,
  minCommunityTokensToCreateGovernance: BN
): Promise<PublicKey> {
  const instructions: TransactionInstruction[] = []

  const realmAddress = await withCreateRealm(
    instructions,
    programId,
    programVersion,
    name,
    walletPubkey,
    communityMint,
    walletPubkey,
    councilMint,
    communityMintMaxVoteWeightSource,
    minCommunityTokensToCreateGovernance,
    undefined
  )

  await withAddEntry(
    instructions,
    realmAddress,
    0,
    JSON.stringify({
      programId: programId.toBase58(),
      ogImage: imageUrl,
      displayName: name,
      description,
      realmId: realmAddress.toBase58(),
    }),
    walletPubkey
  )

  const transaction = new Transaction()
  transaction.add(...instructions)

  await sendTransaction({ transaction, wallet, connection })
  return realmAddress
}

export async function initRegistry({
  connection,
  wallet,
  walletPubkey,
}: RpcContext): Promise<string> {
  const instructions: TransactionInstruction[] = []

  await withInit(instructions, walletPubkey)

  const transaction = new Transaction()
  transaction.add(...instructions)

  return await sendTransaction({ transaction, wallet, connection })
}
