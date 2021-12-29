import {
  Connection,
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
import { withDepositGoverningTokens } from '@models/withDepositGoverningTokens'

/**
 * Prepares the council instructions
 * @param connection
 * @param walletPubkey
 * @param councilMint
 * @param councilWalletPks
 */
async function prepareCouncilInstructions(
  connection: Connection,
  walletPubkey: PublicKey,
  councilMint?: PublicKey,
  councilWalletPks?: PublicKey[]
) {
  let councilMintPk: PublicKey | undefined = undefined
  let walletAtaPk: PublicKey | undefined
  const councilMintInstructions: TransactionInstruction[] = []
  const councilMintSigners: Keypair[] = []

  // If the array of council wallets is not empty
  // then should create mints to the council
  if (councilWalletPks && councilWalletPks.length) {
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

  const councilMembersChunks = chunks(councilMintInstructions, 10)
  // only walletPk needs to sign the minting instructions and it's a signer by default and we don't have to include any more signers
  const councilSignersChunks = Array(councilMembersChunks.length).fill(
    councilMintSigners
  )

  return {
    councilMintPk,
    walletAtaPk,
    councilMembersChunks,
    councilSignersChunks,
  }
}

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
  const realmInstructions: TransactionInstruction[] = []
  let tokenOwnerRecordPk: PublicKey | undefined = undefined

  const {
    councilMintPk,
    walletAtaPk,
    councilMembersChunks,
    councilSignersChunks,
  } = await prepareCouncilInstructions(
    connection,
    walletPubkey,
    councilMint,
    councilWalletPks
  )

  const realmAddress = await withCreateRealm(
    realmInstructions,
    programId,
    programVersion,
    name,
    walletPubkey,
    communityMint,
    walletPubkey,
    councilMintPk,
    communityMintMaxVoteWeightSource,
    minCommunityTokensToCreateGovernance,
    undefined
  )

  // If the current wallet is in the team then deposit the council token
  if (councilMintPk)
    if (walletAtaPk) {
      tokenOwnerRecordPk = await withDepositGoverningTokens(
        realmInstructions,
        programId,
        realmAddress,
        walletAtaPk,
        councilMintPk,
        walletPubkey,
        walletPubkey,
        walletPubkey
      )
    } else {
      // Let's throw for now if the current wallet isn't in the team
      // TODO: To fix it we would have to make it temp. as part of the team and then remove after the realm is created
      throw new Error('Current wallet must be in the team')
    }

  const transaction = new Transaction()
  transaction.add(...realmInstructions)

  if (!wallet) throw WalletConnectionError

  if (councilMembersChunks.length) {
    await sendTransactions(
      connection,
      wallet,
      [...councilMembersChunks, realmInstructions],
      [...councilSignersChunks, []],
      SequenceType.Sequential
    )
  } else {
    await sendTransaction({ transaction, wallet, connection })
  }

  return realmAddress
}
