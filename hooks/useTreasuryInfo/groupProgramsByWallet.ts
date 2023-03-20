import { PublicKey } from '@solana/web3.js'
import { getNativeTreasuryAddress } from '@solana/spl-governance'

import { AssetAccount, AccountType } from '@utils/uiTypes/assets'

export type ProgramAssetAccount = Omit<AssetAccount, 'type'> & {
  type: AccountType.PROGRAM
}

export async function groupProgramsByWallet(
  programId: PublicKey,
  programs: ProgramAssetAccount[]
) {
  const groups: { [wallet: string]: ProgramAssetAccount[] } = {}

  for (const program of programs) {
    const walletAddress = (
      await getNativeTreasuryAddress(programId, program.governance.pubkey)
    ).toBase58()

    if (!groups[walletAddress]) {
      groups[walletAddress] = []
    }

    groups[walletAddress].push(program)
  }

  return groups
}
