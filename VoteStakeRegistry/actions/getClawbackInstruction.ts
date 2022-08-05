import { PublicKey } from '@solana/web3.js'

import { getRegistrarPDA, getVoterPDA } from 'VoteStakeRegistry/sdk/accounts'
import {
  ASSOCIATED_TOKEN_PROGRAM_ID,
  Token,
  TOKEN_PROGRAM_ID,
} from '@solana/spl-token'
import { VsrClient } from 'VoteStakeRegistry/sdk/client'

export const getClawbackInstruction = async ({
  realmPk,
  realmAuthority,
  voterWalletAddress,
  destination,
  voterDepositIndex,
  grantMintPk,
  realmCommunityMintPk,
  client,
}: {
  realmPk: PublicKey
  realmAuthority: PublicKey
  voterWalletAddress: PublicKey
  destination: PublicKey
  voterDepositIndex: number
  grantMintPk: PublicKey
  realmCommunityMintPk: PublicKey
  client?: VsrClient
}) => {
  const clientProgramId = client!.program.programId

  const { registrar } = await getRegistrarPDA(
    realmPk,
    realmCommunityMintPk,
    clientProgramId
  )
  const { voter } = await getVoterPDA(
    registrar,
    voterWalletAddress,
    clientProgramId
  )

  const voterATAPk = await Token.getAssociatedTokenAddress(
    ASSOCIATED_TOKEN_PROGRAM_ID,
    TOKEN_PROGRAM_ID,
    grantMintPk,
    voter,
    true
  )

  const clawbackIx = await client?.program.methods
    .clawback(voterDepositIndex)
    .accounts({
      registrar,
      realmAuthority,
      voter,
      vault: voterATAPk,
      destination,
      tokenProgram: TOKEN_PROGRAM_ID,
    })
    .instruction()
  return clawbackIx
}
