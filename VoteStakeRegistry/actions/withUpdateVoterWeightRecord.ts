import { VsrClient } from '@blockworks-foundation/voter-stake-registry-client'
import {
  ProgramAccount,
  Realm,
  SYSTEM_PROGRAM_ID,
} from '@solana/spl-governance'
import { PublicKey, TransactionInstruction } from '@solana/web3.js'
import {
  getRegistrarPDA,
  getVoterPDA,
  getVoterWeightPDA,
} from 'VoteStakeRegistry/utils/voteRegistryTools'

export const withUpdateVoterWeightRecord = async (
  instructions: TransactionInstruction[],
  walletPubKey: PublicKey,
  realm: ProgramAccount<Realm>,
  client?: VsrClient
) => {
  //if no plugin then we dont do anything
  if (!realm.account.config.useCommunityVoterWeightAddin) {
    return
  }
  if (!client) {
    throw 'no vote registry plugin'
  }
  const clientProgramId = client!.program.programId

  //TODO support both mints for now only community is supported
  const { registrar } = await getRegistrarPDA(
    realm.pubkey,
    realm.account.communityMint,
    client!.program.programId
  )
  const { voter } = await getVoterPDA(registrar, walletPubKey, clientProgramId)
  const { voterWeight } = await getVoterWeightPDA(
    registrar,
    walletPubKey,
    clientProgramId
  )

  instructions.push(
    client.program.instruction.updateVoterWeightRecord({
      accounts: {
        registrar,
        voter,
        voterWeightRecord: voterWeight,
        systemProgram: SYSTEM_PROGRAM_ID,
      },
    })
  )
  return voterWeight
}
