import {
  Keypair,
  PublicKey,
  Transaction,
  TransactionInstruction,
} from '@solana/web3.js'
import { VsrClient } from '@blockworks-foundation/voter-stake-registry-client'
import { RpcContext } from '@solana/spl-governance'
import { sendTransaction } from '@utils/send'
import { getRegistrarPDA, getVoterPDA } from 'VoteStakeRegistry/sdk/accounts'

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
  instructions.push(
    client!.program.instruction.closeDepositEntry(depositIndex, {
      accounts: {
        voter: voter,
        voterAuthority: wallet!.publicKey!,
      },
    })
  )

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
