import { InstructionData } from '../models/accounts'

import {
  Connection,
  Transaction,
  TransactionInstruction,
} from '@solana/web3.js'
import { simulateTransaction } from '../utils/send'
import { WalletAdapter } from '../@types/types'

export async function dryRunInstruction(
  connection: Connection,
  wallet: WalletAdapter,
  instructionData: InstructionData,
  additionalInstructionsToRun?: TransactionInstruction[] | undefined
) {
  const transaction = new Transaction({ feePayer: wallet.publicKey })
  if (additionalInstructionsToRun) {
    additionalInstructionsToRun.map((x) => transaction.add(x))
  }
  transaction.add({
    keys: instructionData.accounts,
    programId: instructionData.programId,
    data: Buffer.from(instructionData.data),
  })

  console.log(transaction)
  const result = await simulateTransaction(connection, transaction, 'single')

  return { response: result.value, transaction }
}
