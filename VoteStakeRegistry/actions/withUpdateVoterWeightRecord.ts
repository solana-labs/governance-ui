import {
  ProgramAccount,
  Realm,
  SYSTEM_PROGRAM_ID,
} from '@solana/spl-governance'
import { PublicKey, TransactionInstruction } from '@solana/web3.js'
import { useVoteRegistry } from 'VoteStakeRegistry/hooks/useVoteRegistry'
import {
  getRegistrarPDA,
  getVoterPDA,
  getVoterWeightPDA,
} from 'VoteStakeRegistry/utils/voteRegistryTools'

export const withUpdateVoterWeightRecord = async (
  instructions: TransactionInstruction[],
  walletPubKey: PublicKey,
  realm: ProgramAccount<Realm>
) => {
  const { client } = useVoteRegistry()
  if (!client) {
    throw 'no vote registry plugin'
  }
  if (!realm.account.config.useCommunityVoterWeightAddin) {
    return
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
}
