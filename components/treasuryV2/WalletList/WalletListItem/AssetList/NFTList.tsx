import { useMemo } from 'react'
import { BigNumber } from 'bignumber.js'

import { NFTCollection } from '@models/treasury/Asset'

import Collapsible from './Collapsible'
import NFTCollectionPreviewIcon from '../../../icons/NFTCollectionPreviewIcon'
import NFTListItem from './NFTListItem'
import useTreasuryAddressForGovernance from '@hooks/useTreasuryAddressForGovernance'
import {
  DasNftObject,
  useDigitalAssetsByOwner,
} from '@hooks/queries/digitalAssets'
import { PublicKey } from '@solana/web3.js'
import { SUPPORT_CNFTS } from '@constants/flags'

interface Poops {
  className?: string
  disableCollapse?: boolean
  expanded?: boolean
  nfts: NFTCollection[]
  selectedAssetId?: string | null
  onSelect?(nft: NFTCollection): void
  onToggleExpand?(): void
}

interface Props {
  governance: PublicKey
}

export default function NFTList({ governance }: Props) {
  const { result: treasury } = useTreasuryAddressForGovernance(governance)
  const { data: governanceNfts } = useDigitalAssetsByOwner(governance)
  const { data: treasuryNfts } = useDigitalAssetsByOwner(treasury)

  const nfts = useMemo(
    () =>
      governanceNfts && treasuryNfts
        ? ([...governanceNfts, ...treasuryNfts] as DasNftObject[])
            .flat()
            .filter((x) => SUPPORT_CNFTS || !x.compression.compressed)
        : undefined,
    [governanceNfts, treasuryNfts]
  )

  const collectionIds = useMemo(
    () =>
      new Set(
        nfts
          ?.map((x) => x.grouping)
          .flat()
          .map((x) => new PublicKey(x.group_value))
      ),
    [nfts]
  )

  const totalCount = nfts.reduce((acc, cur) => {
    return acc.plus(cur.count)
  }, new BigNumber(0))

  return (
    <Collapsible
      //className={cx(props.className)}
      count={totalCount.toNumber()}
      //disableCollapse={props.disableCollapse}
      //expanded={props.expanded}
      icon={<NFTCollectionPreviewIcon className="stroke-white/50" />}
      title="NFTs"
      //onToggleExpand={props.onToggleExpand}
    >
      {nfts.map((collection) => (
        <NFTListItem
          amount={collection.count}
          key={collection.id}
          name={collection.name || 'NFTs without a collection'}
          thumbnail={collection.icon}
          selected={props.selectedAssetId === collection.id}
          onSelect={() => props.onSelect?.(collection)}
        />
      ))}
    </Collapsible>
  )
}
