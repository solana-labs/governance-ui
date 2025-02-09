import { PublicKey } from '@solana/web3.js'

import {
  Registrar,
  getRegistrarPDA,
  getVoterPDA,
} from 'VoteStakeRegistry/sdk/accounts'
import { VsrClient } from 'VoteStakeRegistry/sdk/client'

export const getUnlockDepositInstruction = async ({
  communityMintPk,
  voterAuthorityPk,
  realmPk,
  depositEntryIndex,
  client,
  voteStakeRegistryRegistrar,
}: {
  communityMintPk: PublicKey
  depositEntryIndex: number
  voterAuthorityPk: PublicKey
  realmPk: PublicKey
  client?: VsrClient
  voteStakeRegistryRegistrar: Registrar
}) => {
  const clientProgramId = client!.program.programId

  const { registrar } = getRegistrarPDA(
    realmPk,
    communityMintPk,
    clientProgramId
  )
  const { voter } = getVoterPDA(registrar, voterAuthorityPk, clientProgramId)

  const unlockDepositIx = await client?.program.methods
    .unlockDeposit(depositEntryIndex)
    .accounts({
      registrar,
      voter,
      voterAuthority: voterAuthorityPk,
      grantAuthority: voteStakeRegistryRegistrar.realmAuthority,
    })
    .instruction()
  return unlockDepositIx
}
