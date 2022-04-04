import { PublicKey, SystemProgram, SYSVAR_RENT_PUBKEY } from '@solana/web3.js'

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
  fromPk,
  toPk,
  realmPk,
  grantMintPk,
  communityMintPk,
  amount,
  lockupPeriod,
  startTime,
  lockupKind,
  allowClawback,
  grantAuthority,
  client,
}: {
  fromPk: PublicKey
  realmMint: PublicKey
  grantMintPk: PublicKey
  communityMintPk: PublicKey
  toPk: PublicKey
  realmPk: PublicKey
  grantAuthority: PublicKey
  amount: number
  //days or months in case of monthly vesting lockup type
  lockupPeriod: number
  lockupKind: LockupType
  startTime: number
  allowClawback: boolean
  client?: VsrClient
}) => {
  const systemProgram = SystemProgram.programId
  const clientProgramId = client!.program.programId

  const { registrar } = await getRegistrarPDA(
    realmPk,
    communityMintPk,
    clientProgramId
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
  const voterATAPk = await Token.getAssociatedTokenAddress(
    ASSOCIATED_TOKEN_PROGRAM_ID,
    TOKEN_PROGRAM_ID,
    grantMintPk,
    voter
  )

  const grantIx = client?.program.instruction.grant(
    voterBump,
    voterWeightBump,
    { [lockupKind]: {} },
    new BN(startTime),
    lockupPeriod,
    allowClawback,
    new BN(amount),
    {
      accounts: {
        registrar,
        voter,
        voterAuthority: toPk,
        voterWeightRecord: voterWeightPk,
        vault: voterATAPk,
        depositToken: fromPk,
        tokenAuthority: grantAuthority,
        grantAuthority: toPk,
        depositMint: grantMintPk,
        payer: toPk,
        systemProgram: systemProgram,
        tokenProgram: TOKEN_PROGRAM_ID,
        associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
        rent: SYSVAR_RENT_PUBKEY,
      },
    }
  )
  return grantIx
}
