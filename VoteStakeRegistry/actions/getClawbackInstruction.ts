import { PublicKey } from '@solana/web3.js'

import { VsrClient } from '@blockworks-foundation/voter-stake-registry-client'
import { getRegistrarPDA, getVoterPDA } from 'VoteStakeRegistry/sdk/accounts'
import {
  ASSOCIATED_TOKEN_PROGRAM_ID,
  Token,
  TOKEN_PROGRAM_ID,
} from '@solana/spl-token'

export const getClawbackInstruction = async ({
  realmPk,
  realmAuthority,
  walletAddress,
  tokenOwnerRecord,
  destination,
  voterDepositIndex,
  grantMintPk,
  client,
}: {
  realmPk: PublicKey
  realmAuthority: PublicKey
  walletAddress: PublicKey
  tokenOwnerRecord: PublicKey
  destination: PublicKey
  voterDepositIndex: number
  grantMintPk: PublicKey
  client?: VsrClient
}) => {
  const clientProgramId = client!.program.programId

  const { registrar } = await getRegistrarPDA(
    realmPk,
    grantMintPk,
    clientProgramId
  )
  const { voter } = await getVoterPDA(registrar, walletAddress, clientProgramId)

  const voterATAPk = await Token.getAssociatedTokenAddress(
    ASSOCIATED_TOKEN_PROGRAM_ID,
    TOKEN_PROGRAM_ID,
    grantMintPk,
    voter
  )

  const clawbackIx = client?.program.instruction.clawback(voterDepositIndex, {
    accounts: {
      registrar,
      realmAuthority,
      voter,
      tokenOwnerRecord,
      vault: voterATAPk,
      destination,
      tokenProgram: TOKEN_PROGRAM_ID,
    },
  })
  return clawbackIx
}
