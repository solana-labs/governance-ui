import { getProgramDataAccount } from '@solana/spl-governance'
import { Connection, PublicKey } from '@solana/web3.js'

export async function getProgramData(
  connection: Connection,
  programId: string
) {
console.log(programId)
  const programData = await getProgramDataAccount(
    connection,
    new PublicKey(programId)
  )

  return programData
}
