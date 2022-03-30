import { TokenInfo } from '@solana/spl-token-registry'
import React from 'react'

const BaseAccountHeader: React.FC<{
  isNFT?: boolean
  tokenInfo?: TokenInfo
  amountFormatted: string
  totalPrice?: string
}> = ({ isNFT, tokenInfo, amountFormatted, totalPrice }) => {
  return (
    <div className="bg-bkg-1 mb-4 p-4 rounded-md w-full flex items-center">
      {(tokenInfo?.logoURI || isNFT) && (
        <img
          className={`flex-shrink-0 h-8 w-8 mr-2.5 ${!isNFT && 'rounded-full'}`}
          src={isNFT ? '/img/collectablesIcon.svg' : tokenInfo?.logoURI}
        />
      )}
      <div>
        <h3 className="mb-0 text-xl">
          {amountFormatted}{' '}
          <span className="font-normal text-sm text-fgd-3">
            {!isNFT ? tokenInfo?.symbol : 'NFTS'}
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
