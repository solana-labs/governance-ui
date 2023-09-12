import { PublicKey } from '@solana/web3.js'

import { getRegistrarPDA, getVoterPDA } from 'VoteStakeRegistry/sdk/accounts'
import { VsrClient } from 'VoteStakeRegistry/sdk/client'

export const getUnlockDepositInstruction = async ({
  grantAuthorityPk,
  voterAuthorityPk,
  realmPk,
  communityMintPk,
  depositEntryIndex,
  client,
}: {
  depositEntryIndex: number
  realmMint: PublicKey
  communityMintPk: PublicKey
  voterAuthorityPk: PublicKey
  realmPk: PublicKey
  grantAuthorityPk: PublicKey
  client?: VsrClient
}) => {
  const clientProgramId = client!.program.programId

  const { registrar } = await getRegistrarPDA(
    realmPk,
    communityMintPk,
    clientProgramId
  )
  const { voter } = await getVoterPDA(
    registrar,
    voterAuthorityPk,
    clientProgramId
  )

  const grantIx = await client?.program.methods
    .unlockDeposit(depositEntryIndex)
    .accounts({
      registrar,
      voter,
      voterAuthority: voterAuthorityPk,
      grantAuthority: grantAuthorityPk,
    })
    .instruction()
  return grantIx
}
