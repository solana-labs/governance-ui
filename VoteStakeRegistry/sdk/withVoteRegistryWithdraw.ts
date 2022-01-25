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
} from 'VoteStakeRegistry/sdk/accounts'
import { VsrClient } from '@blockworks-foundation/voter-stake-registry-client'

export const withVoteRegistryWithdraw = async ({
  instructions,
  walletPk,
  toPubKey,
  mintPk,
  realmPk,
  amount,
  tokenOwnerRecordPubKey,
  depositIndex,
  closeDepositAfterOperation,
  client,
}: {
  instructions: TransactionInstruction[]
  walletPk: PublicKey
  toPubKey: PublicKey
  mintPk: PublicKey
  realmPk: PublicKey
  amount: BN
  tokenOwnerRecordPubKey: PublicKey
  depositIndex: number
  //if we want to close deposit after doing operation we need to fill this because we can close only deposits that have 0 tokens inside
  closeDepositAfterOperation?: boolean
  client?: VsrClient
}) => {
  if (!client) {
    throw 'no vote registry plugin'
  }
  const clientProgramId = client!.program.programId

  const { registrar } = await getRegistrarPDA(
    realmPk,
    mintPk,
    client!.program.programId
  )
  const { voter } = await getVoterPDA(registrar, walletPk, clientProgramId)
  const { voterWeightPk } = await getVoterWeightPDA(
    registrar,
    walletPk,
    clientProgramId
  )

  const voterATAPk = await Token.getAssociatedTokenAddress(
    ASSOCIATED_TOKEN_PROGRAM_ID,
    TOKEN_PROGRAM_ID,
    mintPk,
    voter
  )

  instructions.push(
    client?.program.instruction.withdraw(depositIndex!, amount, {
      accounts: {
        registrar: registrar,
        voter: voter,
        voterAuthority: walletPk,
        tokenOwnerRecord: tokenOwnerRecordPubKey,
        voterWeightRecord: voterWeightPk,
        vault: voterATAPk,
        destination: toPubKey,
        tokenProgram: TOKEN_PROGRAM_ID,
      },
    })
  )

  if (closeDepositAfterOperation) {
    const close = client.program.instruction.closeDepositEntry(depositIndex, {
      accounts: {
        voter: voter,
        voterAuthority: walletPk,
      },
    })
    instructions.push(close)
  }
}
