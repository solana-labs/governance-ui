import { InstructionData } from '@solana/spl-governance'

import {
  Connection,
  Transaction,
  TransactionInstruction,
} from '@solana/web3.js'
import { simulateTransaction } from '../utils/send'
import { WalletAdapter } from '@solana/wallet-adapter-base'

export async function dryRunInstruction(
  connection: Connection,
  wallet: WalletAdapter,
  instructionData: InstructionData,
  prerequisiteInstructionsToRun?: TransactionInstruction[] | undefined
) {
  const transaction = new Transaction({ feePayer: wallet.publicKey })
  if (prerequisiteInstructionsToRun) {
    prerequisiteInstructionsToRun.map((x) => transaction.add(x))
  }
  transaction.add({
    keys: instructionData.accounts,
    programId: instructionData.programId,
    data: Buffer.from(instructionData.data),
  })

  const result = await simulateTransaction(connection, transaction, 'single')

  return { response: result.value, transaction }
}
