import {
  Account,
  Keypair,
  PublicKey,
  SystemProgram,
  Transaction,
  TransactionInstruction,
} from '@solana/web3.js'
import { serialize } from 'borsh'
import {
  InstructionData,
  InstructionExecutionStatus,
  ProposalInstruction,
  TokenOwnerRecord,
} from '@models/accounts'
import { RpcContext } from '@models/core/api'
import { withCreateProposal } from '@models/withCreateProposal'
import { withAddSignatory } from '@models/withAddSignatory'
import { withInsertInstruction } from '@models/withInsertInstruction'
import { withSignOffProposal } from '@models/withSignOffProposal'
import { chunk } from '@models/assembly/chunk'
import { withSetGovernanceDelegate } from '@models/withSetGovernanceDelegate'
import { getGovernanceAccount } from '@models/api'
import { GOVERNANCE_SCHEMA } from '@models/serialisation'
import { sendTransaction, sleep } from '@utils/send'

export const createProposal = async (
  { connection, wallet, programId, walletPubkey }: RpcContext,
  realm: PublicKey,
  governance: PublicKey,
  tokenOwnerRecord: PublicKey,
  name: string,
  descriptionLink: string,
  governingTokenMint: PublicKey,
  holdUpTime: number,
  proposalIndex: number,
  instructionsData: InstructionData[],
  isDraft: boolean
): Promise<PublicKey> => {
  const instructions: TransactionInstruction[] = []
  const signers: Account[] = []
  const governanceAuthority = walletPubkey
  const signatory = walletPubkey
  const payer = walletPubkey
  const notificationTitle = isDraft ? 'proposal draft' : 'proposal'

  const proposalAddress = await withCreateProposal(
    instructions,
    programId,
    realm,
    governance,
    tokenOwnerRecord,
    name,
    descriptionLink,
    governingTokenMint,
    governanceAuthority,
    proposalIndex,
    payer
  )

  const signatoryRecordAddress = await withAddSignatory(
    instructions,
    programId,
    proposalAddress,
    tokenOwnerRecord,
    governanceAuthority,
    signatory,
    payer
  )
  for (const [index, instruction] of instructionsData.entries()) {
    await withInsertInstruction(
      instructions,
      programId,
      governance,
      proposalAddress,
      tokenOwnerRecord,
      governanceAuthority,
      index,
      holdUpTime,
      instruction,
      payer
    )
  }

  if (!isDraft) {
    await withSignOffProposal(
      instructions,
      programId,
      proposalAddress,
      signatoryRecordAddress,
      signatory
    )
  }

  const chunks = chunk(instructions, 4)
  for (const chunk of chunks) {
    const transaction = new Transaction()

    transaction.add(...chunk)

    const signature = await sendTransaction({
      transaction,
      wallet,
      connection,
      signers,
      sendingMessage: `creating ${notificationTitle}`,
      successMessage: `${notificationTitle} created`,
    })

    console.log(signature)
  }

  return proposalAddress
}

export const createProposal2 = async (
  { connection, wallet, programId, walletPubkey }: RpcContext,
  realm: PublicKey,
  governance: PublicKey,
  tokenOwnerRecord: PublicKey,
  name: string,
  descriptionLink: string,
  governingTokenMint: PublicKey,
  holdUpTime: number,
  proposalIndex: number,
  instructionsData: InstructionData[],
  isDraft: boolean
): Promise<PublicKey> => {
  const instructions: TransactionInstruction[] = []
  const signers: Account[] = []
  const notificationTitle = isDraft ? 'proposal draft' : 'proposal'

  const tokenOwner = await getGovernanceAccount<TokenOwnerRecord>(
    connection,
    tokenOwnerRecord,
    TokenOwnerRecord
  )

  const previousDelegate = tokenOwner.info.governanceDelegate
  console.log('tokenOwnerDelegate', previousDelegate?.toString())

  const temporaryKeypair = new Keypair()
  console.log('temporaryKey', Array.from(temporaryKeypair.secretKey.values()))

  const rentExemptions = instructionsData.map(async (i) => {
    const instructionAccount = new ProposalInstruction({
      proposal: PublicKey.default,
      instructionIndex: 0,
      holdUpTime: 0,
      instruction: i,
      executedAt: null,
      executionStatus: InstructionExecutionStatus.None,
    })

    const serializedAccount = Buffer.from(
      serialize(GOVERNANCE_SCHEMA, instructionAccount)
    )

    // each account has a 8 byte header
    const accountSize = serializedAccount.length + 8

    return await connection.getMinimumBalanceForRentExemption(accountSize)
  })

  const accountRent = (await Promise.all(rentExemptions)).reduce(
    (a, b) => a + b
  )
  const signatureFees = instructionsData.length * 5_000
  const estimatedLamports = accountRent + signatureFees
  console.log('total', accountRent, signatureFees, estimatedLamports)

  // allocated temporary wallet for background signing
  instructions.push(
    SystemProgram.transfer({
      fromPubkey: walletPubkey,
      toPubkey: temporaryKeypair.publicKey,
      lamports: estimatedLamports,
    })
  )

  // regular create proposal, no changes
  const proposalAddress = await withCreateProposal(
    instructions,
    programId,
    realm,
    governance,
    tokenOwnerRecord,
    name,
    descriptionLink,
    governingTokenMint,
    walletPubkey,
    proposalIndex,
    walletPubkey
  )

  // create signatory controlled by delegate
  const signatoryRecordAddress = await withAddSignatory(
    instructions,
    programId,
    proposalAddress,
    tokenOwnerRecord,
    walletPubkey,
    temporaryKeypair.publicKey,
    walletPubkey
  )

  // set delegate so we can add instructions from temporary kepair
  await withSetGovernanceDelegate(
    instructions,
    programId,
    walletPubkey,
    tokenOwnerRecord,
    temporaryKeypair.publicKey
  )

  // send first tx, signed by user wallet
  {
    const transaction = new Transaction()
    transaction.add(...instructions)
    const signature = await sendTransaction({
      transaction,
      wallet,
      connection,
      signers,
      sendingMessage: `creating ${notificationTitle}`,
      successMessage: `${notificationTitle} created`,
    })

    console.log('start createProposal', signature)
  }

  // phase 2 do all the insertion requests needed in separate txs
  // TODO: intelligent chunking to use as little tx as possible
  // TODO: custom IX to be able to parallelize
  for (const [index, instruction] of instructionsData.entries()) {
    const instructions: TransactionInstruction[] = []
    await withInsertInstruction(
      instructions,
      programId,
      governance,
      proposalAddress,
      tokenOwnerRecord,
      temporaryKeypair.publicKey,
      index,
      holdUpTime,
      instruction,
      temporaryKeypair.publicKey
    )

    const tx = new Transaction()
    tx.add(...instructions)

    const sig = await connection.sendTransaction(tx, [temporaryKeypair], {
      preflightCommitment: 'processed',
    })

    let confirmed = false
    while (!confirmed) {
      const sigStatus = await connection.getSignatureStatus(sig)
      const confirmationStatus = sigStatus.value?.confirmationStatus
      if (
        confirmationStatus === 'confirmed' ||
        confirmationStatus === 'finalized'
      )
        confirmed = true

      await sleep(1000)
    }
    console.log('add ix', index, sig)
  }

  const finalizeSig = await (async () => {
    const instructions: TransactionInstruction[] = []

    if (!isDraft) {
      await withSignOffProposal(
        instructions,
        programId,
        proposalAddress,
        signatoryRecordAddress,
        temporaryKeypair.publicKey
      )
    }

    await withSetGovernanceDelegate(
      instructions,
      programId,
      temporaryKeypair.publicKey,
      tokenOwnerRecord,
      previousDelegate
    )

    // TODO: reclaim unused lamports

    const tx = new Transaction()
    tx.add(...instructions)

    return await connection.sendTransaction(tx, [temporaryKeypair], {
      skipPreflight: true,
    })
  })()

  console.log('finalize', finalizeSig)

  return proposalAddress
}
