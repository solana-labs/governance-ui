import { PublicKey } from '@solana/web3.js'
import BigNumber from 'bignumber.js'
import { fetchJupiterPrice } from './queries/jupiterPrice'
import { useAsync } from 'react-async-hook'

const useTotalTokenValue = ({
  amount,
  mintAddress,
}: {
  amount: number
  mintAddress: string
}) => {
  const { result: tokenPrice } = useAsync(
    async () =>
      await fetchJupiterPrice(new PublicKey(mintAddress)).then((x) =>
        x.found ? x.result.price : 0
      ),
    [mintAddress]
  )

  const totalPrice = amount * (tokenPrice ?? 0)
  const totalPriceFormatted = amount
    ? new BigNumber(totalPrice).toFormat(0)
    : ''

  return totalPriceFormatted
}
export default useTotalTokenValue
