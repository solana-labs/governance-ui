import {
  Keypair,
  PublicKey,
  Transaction,
  TransactionInstruction,
} from '@solana/web3.js'
import BN from 'bn.js'
import { MintMaxVoteWeightSource } from '../models/accounts'
import { withCreateRealm } from '../models/withCreateRealm'
import { RpcContext } from '../models/core/api'
import { sendTransaction } from '../utils/send'
import { ProgramVersion } from '@models/registry/constants'
import {
  getWalletPublicKey,
  sendTransactions,
  SequenceType,
  WalletSigner,
} from 'utils/sendTransactions'
import { withCreateMint } from '@tools/sdk/splToken/withCreateMint'
import { withCreateAssociatedTokenAccount } from '@tools/sdk/splToken/withCreateAssociatedTokenAccount'
import { withMintTo } from '@tools/sdk/splToken/withMintTo'
import { chunks } from '@utils/helpers'
import { WalletConnectionError } from '@solana/wallet-adapter-base'
export async function registerRealm(
  { connection, wallet, walletPubkey }: RpcContext,
  programId: PublicKey,
  programVersion: ProgramVersion,
  name: string,
  communityMint: PublicKey,
  councilMint: PublicKey | undefined,
  communityMintMaxVoteWeightSource: MintMaxVoteWeightSource,
  minCommunityTokensToCreateGovernance: BN,
  councilWalletPks?: PublicKey[]
): Promise<PublicKey> {
  const instructions: TransactionInstruction[] = []
  const councilMintInstructions: TransactionInstruction[] = []
  const councilMintSigners: Keypair[] = []

  // If the array of council wallets is not empty
  // then should create mints to the council
  if (councilWalletPks) {
    let councilMintPk: PublicKey
    // If councilMint is undefined, then
    // should create the council mint
    councilMintPk =
      councilMint ??
      (await withCreateMint(
        connection,
        councilMintInstructions,
        councilMintSigners,
        walletPubkey,
        null,
        0,
        walletPubkey
      ))

    let walletAtaPk: PublicKey | undefined

    for (const teamWalletPk of councilWalletPks) {
      const ataPk = await withCreateAssociatedTokenAccount(
        councilMintInstructions,
        councilMintPk,
        teamWalletPk,
        walletPubkey
      )

      // Mint 1 council token to each team member
      await withMintTo(
        councilMintInstructions,
        councilMintPk,
        ataPk,
        walletPubkey,
        1
      )

      if (teamWalletPk.equals(walletPubkey)) {
        walletAtaPk = ataPk
      }
    }
  }

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

  const transaction = new Transaction()
  transaction.add(...instructions)

  const councilMembersChunks = chunks(councilMintInstructions, 10)
  // only walletPk needs to sign the minting instructions and it's a signer by default and we don't have to include any more signers
  const councilMembersSignersChunks = Array(councilMembersChunks.length).fill(
    []
  )
  if (!wallet) throw WalletConnectionError

  await sendTransactions(
    connection,
    wallet,
    [...councilMembersChunks, instructions],
    [...councilMembersSignersChunks, []],
    SequenceType.Sequential
  )

  // await sendTransaction({ transaction, wallet, connection })
  return realmAddress
}
