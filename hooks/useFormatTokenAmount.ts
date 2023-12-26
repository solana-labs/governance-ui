import { PublicKey } from '@solana/web3.js'
import BigNumber from 'bignumber.js'
import BN from 'bn.js'
import { useMintInfoByPubkeyQuery } from './queries/mintInfo'
import { useMemo } from 'react'

const useFormatTokenAmount = (mint: PublicKey | undefined) => {
  const { data: mintInfo } = useMintInfoByPubkeyQuery(mint)

  return useMemo(
    () =>
      mintInfo?.result
        ? (x: BN | BigNumber | string) =>
            new BigNumber(x.toString())
              .shiftedBy(-mintInfo?.result.decimals)
              .toString()
        : undefined,
    [mintInfo?.result]
  )
}

export default useFormatTokenAmount
