import {
  Keypair,
  PublicKey,
  Transaction,
  TransactionInstruction,
} from '@solana/web3.js'
import { RpcContext } from '@solana/spl-governance'
import { sendTransaction } from '@utils/send'
import { getRegistrarPDA, getVoterPDA } from 'VoteStakeRegistry/sdk/accounts'
import { VsrClient } from 'VoteStakeRegistry/sdk/client'

export const closeDeposit = async ({
  rpcContext,
  realmPk,
  depositIndex,
  communityMintPk,
  client,
}: {
  rpcContext: RpcContext
  realmPk: PublicKey
  communityMintPk: PublicKey
  depositIndex: number
  client?: VsrClient
}) => {
  const signers: Keypair[] = []
  const { wallet, connection } = rpcContext
  const instructions: TransactionInstruction[] = []
  const clientProgramId = client!.program.programId

  const { registrar } = await getRegistrarPDA(
    realmPk,
    communityMintPk,
    client!.program.programId
  )
  const { voter } = await getVoterPDA(
    registrar,
    wallet!.publicKey!,
    clientProgramId
  )
  const closeDepositEntry = await client!.program.methods
    .closeDepositEntry(depositIndex)
    .accounts({
      voter: voter,
      voterAuthority: wallet!.publicKey!,
    })
    .instruction()
  instructions.push(closeDepositEntry)

  const transaction = new Transaction()
  transaction.add(...instructions)

  await sendTransaction({
    transaction,
    wallet,
    connection,
    signers,
    sendingMessage: `Closing deposit`,
    successMessage: `Deposit closed successful`,
  })
}
