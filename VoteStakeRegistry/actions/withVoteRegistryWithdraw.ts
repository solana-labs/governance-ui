import { PublicKey, TransactionInstruction } from '@solana/web3.js'
import {
  ASSOCIATED_TOKEN_PROGRAM_ID,
  Token,
  TOKEN_PROGRAM_ID,
} from '@solana/spl-token'
import { BN } from '@project-serum/anchor'
import {
  getRegistrarPDA,
  getVoterPDA,
  getVoterWeightPDA,
} from 'VoteStakeRegistry/utils/voteRegistryTools'
import { VsrClient } from '@blockworks-foundation/voter-stake-registry-client'

export const withVoteRegistryWithdraw = async (
  instructions: TransactionInstruction[],
  walletPubKey: PublicKey,
  //from where we deposit our founds
  toPubKey: PublicKey,
  //e.g council or community
  mint: PublicKey,
  realmPubKey: PublicKey,
  amount: BN,
  tokenOwnerRecordPubKey: PublicKey,
  depositIndex: number,
  client?: VsrClient
) => {
  if (!client) {
    throw 'no vote registry plugin'
  }
  if (!walletPubKey) {
    throw 'no wallet connected'
  }
  const clientProgramId = client!.program.programId

  const { registrar } = await getRegistrarPDA(
    realmPubKey,
    mint,
    client!.program.programId
  )
  const { voter } = await getVoterPDA(registrar, walletPubKey, clientProgramId)
  const { voterWeight } = await getVoterWeightPDA(
    registrar,
    walletPubKey,
    clientProgramId
  )

  const voterATAPk = await Token.getAssociatedTokenAddress(
    ASSOCIATED_TOKEN_PROGRAM_ID, // always ASSOCIATED_TOKEN_PROGRAM_ID
    TOKEN_PROGRAM_ID, // always TOKEN_PROGRAM_ID
    mint,
    voter
  )

  instructions.push(
    client?.program.instruction.withdraw(depositIndex!, amount, {
      accounts: {
        registrar: registrar,
        voter: voter,
        voterAuthority: walletPubKey,
        tokenOwnerRecord: tokenOwnerRecordPubKey,
        voterWeightRecord: voterWeight,
        vault: voterATAPk,
        destination: toPubKey,
        tokenProgram: TOKEN_PROGRAM_ID,
      },
    })
  )
}
