import { Connection } from '@solana/web3.js'

export function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export async function untilConfirmed(
  connection: Connection,
  signature: string
) {
  let confirmed = false
  while (!confirmed) {
    const sigStatus = await connection.getSignatureStatus(signature)
    const confirmationStatus = sigStatus.value?.confirmationStatus
    if (
      confirmationStatus === 'confirmed' ||
      confirmationStatus === 'finalized'
    )
      confirmed = true
    else {
      await sleep(1000)
    }
  }
}
