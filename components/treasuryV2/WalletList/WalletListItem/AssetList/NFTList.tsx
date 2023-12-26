import { useMemo } from 'react'

import Collapsible from './Collapsible'
import NFTCollectionPreviewIcon from '../../../icons/NFTCollectionPreviewIcon'
import NFTListItem from './NFTListItem'
import { PublicKey } from '@solana/web3.js'
import cx from '@hub/lib/cx'
import useGovernanceNfts from './useGovernanceNfts'

interface Props {
  className?: string
  expanded?: boolean
  onToggleExpand?(): void
  disableCollapse?: boolean
  governance: PublicKey
}

function onlyUnique(value, index, array) {
  return array.indexOf(value) === index
}

export default function NFTList({ governance, ...props }: Props) {
  const nfts = useGovernanceNfts(governance)

  const collectionIds = useMemo(
    () =>
      nfts &&
      nfts
        .map((x) => x.grouping)
        .flat()
        .map((x) => x.group_value)
        .filter(onlyUnique)
        .map((x) => new PublicKey(x)),
    [nfts]
  )
  console.log('collectionIds', JSON.stringify(collectionIds))

  const hasNftWithoutCollection = nfts?.find((x) => x.grouping.length < 1)

  const totalCount = nfts?.length ?? 0

  return (
    <Collapsible
      className={cx(props.className)}
      count={totalCount}
      disableCollapse={props.disableCollapse}
      expanded={props.expanded}
      icon={<NFTCollectionPreviewIcon className="stroke-white/50" />}
      title="NFTs"
      onToggleExpand={props.onToggleExpand}
    >
      {[
        ...(hasNftWithoutCollection
          ? [
              <NFTListItem
                governance={governance}
                key={'none'}
                collectionId={'none'}
              />,
            ]
          : []),
        ...(collectionIds
          ? collectionIds.map((id) => (
              <NFTListItem
                governance={governance}
                key={id.toString()}
                collectionId={id}
              />
            ))
          : []),
      ]}
    </Collapsible>
  )
}
