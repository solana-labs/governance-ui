import { PublicKey, Transaction, TransactionInstruction } from '@solana/web3.js'
import BN from 'bn.js'
import { MintMaxVoteWeightSource } from '../models/accounts'
import { withCreateRealm } from '../models/withCreateRealm'
import { RpcContext } from '../models/core/api'
import { sendTransaction } from '../utils/send'

export async function registerRealm(
  { connection, wallet, programId, programVersion, walletPubkey }: RpcContext,
  name: string,
  communityMint: PublicKey,
  councilMint: PublicKey | undefined,
  communityMintMaxVoteWeightSource: MintMaxVoteWeightSource,
  minCommunityTokensToCreateGovernance: BN
): Promise<string> {
  const instructions: TransactionInstruction[] = []

  await withCreateRealm(
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

  const transaction = new Transaction()
  transaction.add(...instructions)

  return sendTransaction({ transaction, wallet, connection })
}

export async function getRealmIdFromTransaction(
  { connection }: RpcContext,
  txid: string
): Promise<string | undefined> {
  const tx = await connection.getTransaction(txid, { commitment: 'confirmed' })
  return tx?.transaction.message.accountKeys[2].toBase58()
}
