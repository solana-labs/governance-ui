import { PublicKey, Transaction, TransactionInstruction } from '@solana/web3.js'
import BN from 'bn.js'
import { MintMaxVoteWeightSource } from '../models/accounts'
import { withCreateRealm } from '../models/withCreateRealm'
import { RpcContext } from '../models/core/api'
import { sendTransaction } from '../utils/send'

export async function registerRealm(
  { connection, wallet, programId, walletPubkey }: RpcContext,
  name: string,
  communityMint: PublicKey,
  councilMint: PublicKey | undefined,
  communityMintMaxVoteWeightSource: MintMaxVoteWeightSource,
  minCommunityTokensToCreateGovernance: BN
) {
  const instructions: TransactionInstruction[] = []

  await withCreateRealm(
    instructions,
    programId,
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

  await sendTransaction({ transaction, wallet, connection })
}
