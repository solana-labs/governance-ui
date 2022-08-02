import { TokenInfo } from '@solana/spl-token-registry'
import React from 'react'
import { useEffect, useState } from 'react'
import useWalletStore from 'stores/useWalletStore'
import { deprecated } from '@metaplex-foundation/mpl-token-metadata'
import { getConnectionContext } from '@utils/connection'

const BaseAccountHeader: React.FC<{
  isNFT?: boolean
  tokenInfo?: TokenInfo
  amountFormatted: string
  totalPrice?: string
  mintAddress: string
}> = ({ isNFT, tokenInfo, amountFormatted, totalPrice, mintAddress }) => {
  const [logo, setLogo] = useState<undefined | string>(tokenInfo?.logoURI)

  const [symbol, setSymbol] = useState<undefined | string>(tokenInfo?.symbol)
  const connection = useWalletStore((s) => s.connection)
  console.log(tokenInfo?.address)

  useEffect(() => {
    const getTokenMetadata = async (mintAddress: string) => {
      try {
        const tokenMetaPubkey = await deprecated.Metadata.getPDA(mintAddress)

        const tokenMeta = await deprecated.Metadata.load(
          getConnectionContext(connection.cluster).current,
          tokenMetaPubkey
        )
        setLogo(tokenMeta.data?.data.uri)
        setSymbol(tokenMeta.data?.data.symbol)
      } catch (e) {
        console.log(e)
      }
    }
    if (tokenInfo?.address) {
      setLogo(tokenInfo?.logoURI)
      setSymbol(tokenInfo?.symbol)
    } else {
      getTokenMetadata(mintAddress)
    }
  })
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
