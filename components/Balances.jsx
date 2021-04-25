import BN from 'bn.js'

import useWalletStore from '../stores/useWalletStore'

const Balances = () => {
  var { tokenAccounts, mints } = useWalletStore((state) => state)

  function fixedPointNumber(value, decimals) {
    const divisor = new BN(10).pow(new BN(decimals))
    const quotient = value.div(divisor)
    const remainder = value.mod(divisor)
    return quotient.toNumber() + remainder.toNumber() / divisor.toNumber()
  }

  function calculateBalance(a) {
    const mint = mints[a.account.mint.toBase58()]
    return mint ? fixedPointNumber(a.account.amount, mint.decimals) : 0
  }

  const displayedBalances = tokenAccounts
    .map((a) => `${a.publicKey.toBase58()}: ${calculateBalance(a)}`)
    .sort()

  return (
    <ul>
      {displayedBalances.map((b, i) => (
        <li key={i}>{b}</li>
      ))}
    </ul>
  )
}

export default Balances
