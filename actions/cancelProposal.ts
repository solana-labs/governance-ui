import {
  Keypair,
  PublicKey,
  Transaction,
  TransactionInstruction,
} from '@solana/web3.js'

import {
  getGovernanceProgramVersion,
  RpcContext,
  withRefundProposalDeposit,
} from '@solana/spl-governance'
import { Proposal } from '@solana/spl-governance'
import { ProgramAccount } from '@solana/spl-governance'
import { sendTransaction } from 'utils/send'
import { withCancelProposal } from '@solana/spl-governance'
import { getProposalDepositPk } from '@utils/helpers'

export const cancelProposal = async (
  { connection, wallet, programId, walletPubkey }: RpcContext,
  realmPk: PublicKey,
  proposal: ProgramAccount<Proposal> | undefined,
  proposalOwnerWallet: PublicKey
) => {
  const instructions: TransactionInstruction[] = []
  const signers: Keypair[] = []
  const governanceAuthority = walletPubkey

  // Explicitly request the version before making RPC calls to work around race conditions in resolving
  // the version for RealmInfo
  const programVersion = await getGovernanceProgramVersion(
    connection,
    programId
  )

  withCancelProposal(
    instructions,
    programId,
    programVersion,
    realmPk,
    proposal!.account.governance,
    proposal!.pubkey,
    proposal!.account.tokenOwnerRecord,
    governanceAuthority
  )

  const proposalDepositPk = getProposalDepositPk(
    proposal!.pubkey,
    proposalOwnerWallet,
    programId
  )

  //Release sol if deposit exempt setting threshold hit
  const isDepositActive = await connection.getBalance(proposalDepositPk)

  if (isDepositActive) {
    await withRefundProposalDeposit(
      instructions,
      programId!,
      programVersion,
      proposal!.pubkey,
      proposalOwnerWallet
    )
  }

  const transaction = new Transaction({ feePayer: walletPubkey })

  transaction.add(...instructions)

  await sendTransaction({
    transaction,
    wallet,
    connection,
    signers,
    sendingMessage: 'Cancelling proposal',
    successMessage: 'Proposal cancelled',
  })
}
