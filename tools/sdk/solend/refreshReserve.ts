import { TransactionInstruction } from '@solana/web3.js'
import { refreshReserveInstruction } from '@solendprotocol/solend-sdk'

import SolendConfiguration, { SupportedMintName } from './configuration'

export async function refreshReserve({
  mintName,
}: {
  mintName: SupportedMintName
}): Promise<TransactionInstruction> {
  const { reserve, pythOracle, switchboardFeedAddress } =
    SolendConfiguration.getSupportedMintInformation(mintName)

  return refreshReserveInstruction(
    reserve,
    SolendConfiguration.programID,
    pythOracle,
    switchboardFeedAddress
  )
}
