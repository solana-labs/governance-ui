import cx from 'classnames'

import StickyScrolledContainer from '../StickyScrolledContainer'
import { useDigitalAssetsByOwner } from '@hooks/queries/digitalAssets'
import useTreasuryAddressForGovernance from '@hooks/useTreasuryAddressForGovernance'
import { useMemo } from 'react'
import { SUPPORT_CNFTS } from '@constants/flags'
import NFTGallery from '@components/NFTGallery'
import { PublicKey } from '@solana/web3.js'
import Header from './Header'

interface Props {
  className?: string
  collectionId: string
  isStickied?: boolean
  governance: string
}

const NftCollectionGallery = ({
  collectionId,
  governance,
  ...props
}: Omit<Parameters<typeof NFTGallery>[0], 'nfts'> & {
  collectionId: PublicKey | 'none'
  governance: PublicKey
}) => {
  const { result: treasury } = useTreasuryAddressForGovernance(governance)
  const { data: governanceNfts } = useDigitalAssetsByOwner(governance)
  const { data: treasuryNfts } = useDigitalAssetsByOwner(treasury)

  const nfts = useMemo(
    () =>
      governanceNfts && treasuryNfts
        ? [...governanceNfts, ...treasuryNfts]
            .flat()
            .filter((x) => SUPPORT_CNFTS || !x.compression.compressed)
            .filter((x) =>
              collectionId === 'none'
                ? x.grouping?.length < 1
                : (x.grouping as any[]).find(
                    (y) => y.group_value === collectionId.toString()
                  )
            )
        : undefined,
    [collectionId, governanceNfts, treasuryNfts]
  )

  return <NFTGallery nfts={nfts} {...props} />
}

export default function NFTCollectionDetails(props: Props) {
  const collectionId: 'none' | PublicKey = useMemo(
    () =>
      props.collectionId === 'none'
        ? 'none'
        : new PublicKey(props.collectionId),
    [props.collectionId]
  )
  const governance = useMemo(() => new PublicKey(props.governance), [
    props.governance,
  ])
  return (
    <div className={cx(props.className, 'rounded', 'overflow-hidden')}>
      <StickyScrolledContainer
        className="h-full"
        isAncestorStickied={props.isStickied}
      >
        <Header governance={governance} collectionId={collectionId} />
        <section className="p-6 bg-bkg-3">
          <NftCollectionGallery
            governance={governance}
            collectionId={collectionId}
            onClickSendNft={() => {
              return
            }}
          />
        </section>
      </StickyScrolledContainer>
    </div>
  )
}
