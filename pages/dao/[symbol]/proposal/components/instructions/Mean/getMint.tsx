import { Treasury } from '@mean-dao/msp'
import { AssetAccount } from '@utils/uiTypes/assets'

export default function getMint(accounts: AssetAccount[], treasury: Treasury) {
  return accounts.find(
    (a) =>
      a.extensions.mint?.publicKey.toBase58() ===
      treasury?.associatedToken.toString()
  )?.extensions.mint?.account
}
