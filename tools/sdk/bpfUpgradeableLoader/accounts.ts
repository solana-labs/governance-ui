import { getProgramDataAccount } from '@solana/spl-governance'
import { Connection, PublicKey } from '@solana/web3.js'

export async function getProgramSlot(
  connection: Connection,
  programId: string
) {
  const programData = await getProgramDataAccount(
    connection,
    new PublicKey(programId)
  )

  return programData.slot
}
