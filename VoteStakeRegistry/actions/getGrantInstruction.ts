import { PublicKey, SYSVAR_RENT_PUBKEY } from '@solana/web3.js'
import { RpcContext, SYSTEM_PROGRAM_ID } from '@solana/spl-governance'

import { BN } from '@project-serum/anchor'
import { VsrClient } from '@blockworks-foundation/voter-stake-registry-client'
import {
  getRegistrarPDA,
  getVoterPDA,
  getVoterWeightPDA,
  LockupType,
} from 'VoteStakeRegistry/sdk/accounts'
import {
  ASSOCIATED_TOKEN_PROGRAM_ID,
  Token,
  TOKEN_PROGRAM_ID,
} from '@solana/spl-token'

export const getGrantInstruction = async ({
  rpcContext,
  fromPk,
  toPk,
  realmMint,
  realmPk,
  grantMintPk,
  amount,
  lockupPeriod,
  startTime,
  lockupKind,
  allowClawback,
  client,
}: {
  rpcContext: RpcContext
  //from where we deposit our founds
  fromPk: PublicKey
  realmMint: PublicKey
  grantMintPk: PublicKey
  toPk: PublicKey
  realmPk: PublicKey
  programId: PublicKey
  amount: BN
  tokenOwnerRecordPk: PublicKey | null
  //days or months in case of monthly vesting lockup type
  lockupPeriod: number
  lockupKind: LockupType
  startTime: number
  allowClawback: boolean
  client?: VsrClient
}) => {
  const clientProgramId = client!.program.programId
  const { wallet } = rpcContext
  const { registrar } = await getRegistrarPDA(
    realmPk,
    realmMint,
    client!.program.programId
  )
  const { voter, voterBump } = await getVoterPDA(
    registrar,
    toPk,
    clientProgramId
  )
  const { voterWeightPk, voterWeightBump } = await getVoterWeightPDA(
    registrar,
    toPk,
    clientProgramId
  )
  const ata = await Token.getAssociatedTokenAddress(
    ASSOCIATED_TOKEN_PROGRAM_ID, // always ASSOCIATED_TOKEN_PROGRAM_ID
    TOKEN_PROGRAM_ID, // always TOKEN_PROGRAM_ID
    grantMintPk, // mint
    toPk // owner
  )
  return client?.program.instruction.grant(
    voterBump,
    voterWeightBump,
    lockupKind,
    new BN(startTime),
    lockupPeriod,
    allowClawback,
    amount,
    {
      accounts: {
        registrar,
        voter,
        voterAuthority: fromPk,
        voterWeightRecord: voterWeightPk,
        vault: ata,
        depositToken: fromPk,
        authority: realmPk,
        payer: wallet.publicKey!,
        depositMint: grantMintPk,
        systemProgram: SYSTEM_PROGRAM_ID,
        tokenProgram: TOKEN_PROGRAM_ID,
        associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
        rent: SYSVAR_RENT_PUBKEY,
      },
    }
  )
}
