import { InstructionData } from '@solana/spl-governance'

import {
  ComputeBudgetProgram,
  Connection,
  Transaction,
  TransactionInstruction,
} from '@solana/web3.js'
import { WalletAdapter } from '@solana/wallet-adapter-base'

export async function dryRunInstruction(
  connection: Connection,
  wallet: WalletAdapter,
  instructionData: InstructionData | null,
  prerequisiteInstructionsToRun?: TransactionInstruction[] | undefined,
  additionalInstructions?: InstructionData[]
) {
  console.log("DRY RUN")
  const recentBlockHash = await connection.getLatestBlockhash()
  const transaction = new Transaction({ feePayer: wallet.publicKey })
  transaction.lastValidBlockHeight = recentBlockHash.lastValidBlockHeight
  transaction.recentBlockhash = recentBlockHash.blockhash

  transaction.add(
    ComputeBudgetProgram.setComputeUnitLimit({ units: 1_000_000 })
  )

  if (prerequisiteInstructionsToRun) {
    prerequisiteInstructionsToRun.map((x) => transaction.add(x))
  }
  console.log("additionalInstructions", additionalInstructions)
  if (additionalInstructions) {
    for (const i of additionalInstructions) {
      transaction.add({
        keys: i.accounts,
        programId: i.programId,
        data: Buffer.from(i.data),
      })
    }
  }

  console.log("instructionData", instructionData)
  if (instructionData) {
    transaction.add({
      keys: instructionData.accounts,
      programId: instructionData.programId,
      data: Buffer.from(instructionData.data),
    })
  }


  console.log("HERE")

  const result = await connection.simulateTransaction(
    transaction,
    undefined,
    true
  )
  console.log(result)

  return { response: result.value, transaction }
}
