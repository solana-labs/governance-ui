import {
  getGovernanceProgramVersion,
  ProgramAccount,
  TokenOwnerRecord,
  withRefundProposalDeposit,
} from '@solana/spl-governance'
import { RpcContext } from '@solana/spl-governance'
import {
  Keypair,
  PublicKey,
  Transaction,
  TransactionInstruction,
} from '@solana/web3.js'
import { sendTransaction } from '@utils/send'
import { Proposal } from '@solana/spl-governance'
import { withFinalizeVote } from '@solana/spl-governance'
import { getProposalDepositPk } from '@utils/helpers'

export const finalizeVote = async (
  { connection, wallet, programId }: RpcContext,
  realm: PublicKey,
  proposal: ProgramAccount<Proposal>,
  maxVoterWeightPk: PublicKey | undefined,
  proposalOwner: ProgramAccount<TokenOwnerRecord>
) => {
  const signers: Keypair[] = []
  const instructions: TransactionInstruction[] = []

  // Explicitly request the version before making RPC calls to work around race conditions in resolving
  // the version for RealmInfo
  const programVersion = await getGovernanceProgramVersion(
    connection,
    programId
  )

  await withFinalizeVote(
    instructions,
    programId,
    programVersion,
    realm,
    proposal.account.governance,
    proposal.pubkey,
    proposal.account.tokenOwnerRecord,
    proposal.account.governingTokenMint,
    maxVoterWeightPk
  )

  //its possible that delegate payed for deposit created with someone else token owner record.
  //there is need of check both deposits.
  const [possibleDelegateDeposit, possibleTorDeposit] = [
    proposalOwner.account.governanceDelegate
      ? getProposalDepositPk(
          proposal.pubkey,
          proposalOwner.account.governanceDelegate,
          programId
        )
      : null,
    getProposalDepositPk(
      proposal.pubkey,
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
      proposal.pubkey,
      possibleDelegateDeposit && delegateDeposit
        ? proposalOwner.account.governanceDelegate!
        : proposalOwner.account.governingTokenOwner!
    )
  }

  const transaction = new Transaction()

  transaction.add(...instructions)

  await sendTransaction({
    transaction,
    wallet,
    connection,
    signers,
    sendingMessage: 'Finalizing votes',
    successMessage: 'Votes finalized',
  })
}
