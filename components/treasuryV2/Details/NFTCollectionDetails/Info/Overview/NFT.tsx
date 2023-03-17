import React from 'react'
import * as AspectRatio from '@radix-ui/react-aspect-ratio'

import { NFT as NFTModel } from '@models/treasury/NFT'

interface Props {
  className?: string
  nft: NFTModel
}

export default function NFT(props: Props) {
  return (
    <div className={props.className}>
      <div className="w-full rounded-lg overflow-hidden">
        <AspectRatio.Root
          className="bg-center bg-cover"
          ratio={1}
          style={{ backgroundImage: `url(${props.nft.image})` }}
        />
      </div>
      <div className="mt-2 flex items-center justify-between">
        <div>
          <div className="text-sm font-bold text-fgd-1">{props.nft.name}</div>
          {props.nft.collection?.nftCount && (
            <div className="text-xs text-white/50"></div>
          )}
        </div>
        {props.nft.collection && (
          <div className="rounded-sm h-8 w-8 overflow-hidden">
            <AspectRatio.Root
              className="bg-center bg-cover"
              ratio={1}
              style={{ backgroundImage: `url(${props.nft.collection.image})` }}
            />
          </div>
        )}
      </div>
    </div>
  )
}
