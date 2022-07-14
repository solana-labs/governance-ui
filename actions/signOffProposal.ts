import {
  Keypair,
  PublicKey,
  Transaction,
  TransactionInstruction,
} from '@solana/web3.js'

import {
  getGovernanceProgramVersion,
  Proposal,
  RpcContext,
} from '@solana/spl-governance'
import { ProgramAccount } from '@solana/spl-governance'
import { sendTransaction } from 'utils/send'
import { withSignOffProposal } from '@solana/spl-governance'

export const signOffProposal = async (
  { connection, wallet, programId }: RpcContext,
  realmPk: PublicKey,
  proposal: ProgramAccount<Proposal>,
  tokenOwnerRecord: PublicKey
) => {
  const instructions: TransactionInstruction[] = []
  const signers: Keypair[] = []

  // Explicitly request the version before making RPC calls to work around race conditions in resolving
  // the version for RealmInfo
  const programVersion = await getGovernanceProgramVersion(
    connection,
    programId
  )

  withSignOffProposal(
    instructions,
    programId,
    programVersion,
    realmPk,
    proposal.account.governance,
    proposal.pubkey,
    wallet.publicKey!,
    undefined,
    tokenOwnerRecord
  )

  const transaction = new Transaction()

  transaction.add(...instructions)

  await sendTransaction({
    transaction,
    wallet,
    connection,
    signers,
    sendingMessage: 'Signing off proposal',
    successMessage: 'Proposal signed off',
  })
}
