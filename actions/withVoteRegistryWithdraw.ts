import { PublicKey, TransactionInstruction } from '@solana/web3.js'
import {
  ASSOCIATED_TOKEN_PROGRAM_ID,
  Token,
  TOKEN_PROGRAM_ID,
} from '@solana/spl-token'
import { BN } from '@project-serum/anchor'
import {
  Deposit,
  getRegistrarPDA,
  getVoterPDA,
  getVoterWeightPDA,
  tryGetVoter,
} from '@utils/voteRegistryTools'
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
  const existingVoter = await tryGetVoter(voter, client)

  const voterATAPk = await Token.getAssociatedTokenAddress(
    ASSOCIATED_TOKEN_PROGRAM_ID, // always ASSOCIATED_TOKEN_PROGRAM_ID
    TOKEN_PROGRAM_ID, // always TOKEN_PROGRAM_ID
    mint,
    voter
  )
  //TODO Check mint of deposit ?
  const indexOfDepositEntryWithTypeNone = (existingVoter?.deposits as Deposit[]).findIndex(
    (x) => x.isUsed && typeof x.lockup.kind.none !== 'undefined'
  )

  instructions.push(
    client?.program.instruction.withdraw(
      indexOfDepositEntryWithTypeNone,
      amount,
      {
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
      }
    )
  )
}
