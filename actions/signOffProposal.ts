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
import { SignatoryRecord } from '@solana/spl-governance'
import { ProgramAccount } from '@solana/spl-governance'
import { sendTransaction } from 'utils/send'
import { withSignOffProposal } from '@solana/spl-governance'

export const signOffProposal = async (
  { connection, wallet, programId }: RpcContext,
  realmPk: PublicKey,
  proposal: ProgramAccount<Proposal>,
  signatoryRecord: ProgramAccount<SignatoryRecord> | undefined
) => {
  const instructions: TransactionInstruction[] = []
  const signers: Keypair[] = []

  // Explicitly request the version before making RPC calls to work around race conditions in resolving
  // the version for RealmInfo
  const programVersion = await getGovernanceProgramVersion(
    connection,
    programId
  )
  const hasSignatoriesCount = proposal.account.signatoriesCount === 0
  withSignOffProposal(
    instructions,
    programId,
    programVersion,
    realmPk,
    proposal.account.governance,
    proposal.pubkey,
    !hasSignatoriesCount
      ? signatoryRecord!.account.signatory
      : wallet.publicKey!,
    !hasSignatoriesCount ? signatoryRecord!.pubkey! : undefined,
    !hasSignatoriesCount ? undefined : proposal.account.tokenOwnerRecord
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
