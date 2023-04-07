import { PaymentStreamingAccount } from '@mean-dao/payment-streaming'
import { AssetAccount } from '@utils/uiTypes/assets'

export default function getMint(
  accounts: AssetAccount[] = [],
  paymentStreamingAccount: PaymentStreamingAccount
) {
  return accounts.find(
    (a) =>
      a.extensions.mint?.publicKey.toBase58() ===
      paymentStreamingAccount?.mint.toString()
  )?.extensions.mint?.account
}
