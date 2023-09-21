import {
  Keypair,
  PublicKey,
  Transaction,
  TransactionInstruction,
} from '@solana/web3.js'

import {
  getGovernanceProgramVersion,
  RpcContext,
  TokenOwnerRecord,
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
  proposalOwner: ProgramAccount<TokenOwnerRecord>
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

  //its possible that delegate payed for deposit created with someone else token owner record.
  //there is need of check both deposits.
  const [possibleDelegateDeposit, possibleTorDeposit] = [
    proposalOwner.account.governanceDelegate
      ? getProposalDepositPk(
          proposal!.pubkey,
          proposalOwner.account.governanceDelegate,
          programId
        )
      : null,
    getProposalDepositPk(
      proposal!.pubkey,
      proposalOwner.account.governingTokenOwner,
      programId
    ),
  ]

  //Release sol if deposit exempt setting threshold hit
  const [delegateDeposit, torDeposit] = await Promise.all([
    possibleDelegateDeposit
      ? connection.getBalance(possibleDelegateDeposit)
      : null,
    connection.getBalance(possibleTorDeposit),
  ])

  const activeDeposit = delegateDeposit ? delegateDeposit : torDeposit

  if (activeDeposit) {
    await withRefundProposalDeposit(
      instructions,
      programId!,
      programVersion,
      proposal!.pubkey,
      possibleDelegateDeposit && delegateDeposit
        ? proposalOwner.account.governanceDelegate!
        : proposalOwner.account.governingTokenOwner!
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
