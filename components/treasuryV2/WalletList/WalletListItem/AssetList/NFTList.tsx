import React from 'react'
import cx from 'classnames'
import { BigNumber } from 'bignumber.js'

import { NFTCollection } from '@models/treasury/Asset'

import Collapsible from './Collapsible'
import NFTCollectionPreviewIcon from '../../../icons/NFTCollectionPreviewIcon'
import NFTListItem from './NFTListItem'

interface Props {
  className?: string
  disableCollapse?: boolean
  nfts: NFTCollection[]
  selectedAssetId?: string | null
  onSelect?(nft: NFTCollection): void
}

export default function NFTList(props: Props) {
  const totalCount = props.nfts.reduce((acc, cur) => {
    return acc.plus(cur.count)
  }, new BigNumber(0))

  return (
    <Collapsible
      className={cx(props.className)}
      count={totalCount.toNumber()}
      disableCollapse={props.disableCollapse}
      icon={<NFTCollectionPreviewIcon className="fill-white/50" />}
      title="NFTs"
    >
      {props.nfts.map((collection) => (
        <NFTListItem
          amount={collection.count}
          key={collection.id}
          name={collection.name || 'No collection'}
          thumbnail={collection.icon}
          selected={props.selectedAssetId === collection.id}
          onSelect={() => props.onSelect?.(collection)}
        />
      ))}
    </Collapsible>
  )
}
