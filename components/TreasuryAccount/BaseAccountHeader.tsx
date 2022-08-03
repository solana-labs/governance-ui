import { TokenInfo } from '@solana/spl-token-registry'
import React from 'react'
import { useEffect, useState } from 'react'
import useWalletStore from 'stores/useWalletStore'
import { findMetadataPda } from '@metaplex-foundation/js'
import { PublicKey } from '@solana/web3.js'
import { Metadata } from '@metaplex-foundation/mpl-token-metadata'

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

  useEffect(() => {
    const getTokenMetadata = async (mintAddress: string) => {
      try {
        const mintPubkey = new PublicKey(mintAddress)
        const metadataAccount = findMetadataPda(mintPubkey)
        const data = await connection.current.getAccountInfo(metadataAccount)

        const state = Metadata.deserialize(data!.data)

        setLogo(state[0].data.uri.slice(0, state[0].data.uri.indexOf('\x00')))
        setSymbol(
          state[0].data.symbol.slice(0, state[0].data.symbol.indexOf('\x00'))
        )
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
