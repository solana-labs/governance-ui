import React from 'react'
import { useEffect, useState } from 'react'
import { PublicKey } from '@solana/web3.js'
import { TokenInfoWithoutDecimals } from '@utils/services/tokenPrice'
import { useTokenMetadata } from '@hooks/queries/tokenMetadata'

const BaseAccountHeader: React.FC<{
  isNFT?: boolean
  tokenInfo?: TokenInfoWithoutDecimals
  amountFormatted: string
  totalPrice?: string
  mintAddress: string
}> = ({ isNFT, tokenInfo, amountFormatted, totalPrice, mintAddress }) => {
  const [logo, setLogo] = useState<undefined | string>(tokenInfo?.logoURI)

  const [symbol, setSymbol] = useState<undefined | string>(tokenInfo?.symbol)
  const { data } = useTokenMetadata(
    new PublicKey(mintAddress),
    !tokenInfo?.symbol
  )

  useEffect(() => {
    if (tokenInfo?.address) {
      setLogo(tokenInfo?.logoURI)
      setSymbol(tokenInfo?.symbol)
    }
    if (data?.symbol) {
      setSymbol(data?.symbol)
    }
  }, [data, tokenInfo])
  return (
    <div className="bg-bkg-1 mb-4 p-4 rounded-md w-full flex items-center">
      {(logo || isNFT) && (
        <img
          className={`flex-shrink-0 h-8 w-8 mr-2.5 ${!isNFT && 'rounded-full'}`}
          src={isNFT ? '/img/collectablesIcon.svg' : logo}
        />
      )}
      <div>
        <h3 className="mb-0 text-xl">
          {amountFormatted}{' '}
          <span className="font-normal text-sm text-fgd-3">
            {!isNFT ? symbol : 'NFTS'}
          </span>
        </h3>
        <p className="text-fgd-3 text-sm">
          {totalPrice && totalPrice !== '0' ? <>${totalPrice}</> : ''}
        </p>
      </div>
    </div>
  )
}

export default BaseAccountHeader
