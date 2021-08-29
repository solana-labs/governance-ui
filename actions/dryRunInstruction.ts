import { InstructionData } from '../models/accounts'

import { Connection, Transaction } from '@solana/web3.js'
import { simulateTransaction } from '../utils/send'
import { WalletAdapter } from '../@types/types'

export async function dryRunInstruction(
  connection: Connection,
  wallet: WalletAdapter,
  instructionData: InstructionData
) {
  const transaction = new Transaction({ feePayer: wallet.publicKey })
  transaction.add({
    keys: instructionData.accounts,
    programId: instructionData.programId,
    data: Buffer.from(instructionData.data),
  })

  const result = await simulateTransaction(connection, transaction, 'single')

  return { response: result.value, transaction }
}
