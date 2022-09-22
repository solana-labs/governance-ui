import { PublicKey } from '@solana/web3.js'

export const deriveVaultCollateralAccount = async (
  programKey: PublicKey,
  vaultAccount: PublicKey
) => {
  return await PublicKey.findProgramAddress(
    [
      new PublicKey(vaultAccount).toBuffer(),
      Buffer.from('VaultCollateralAccount'),
    ],
    programKey
  )
}
