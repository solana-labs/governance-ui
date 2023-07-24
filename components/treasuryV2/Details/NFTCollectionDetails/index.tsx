import cx from 'classnames'

import { NFTCollection } from '@models/treasury/Asset'

import Header from './Header'
import StickyScrolledContainer from '../StickyScrolledContainer'

interface Props {
  className?: string
  nftCollection: NFTCollection
  isStickied?: boolean
}

const NftCollectionGallery = () => {
  const { data: governanceNfts } = useRealmDigitalAssetsQuery()
  const DASnftsFlat = useMemo(
    () =>
      nftsDAS?.flat().filter((x) => SUPPORT_CNFTS || !x.compression.compressed),
    [nftsDAS]
  )

  return <div>bingus</div>
}

export default function NFTCollectionDetails(props: Props) {
  return (
    <div className={cx(props.className, 'rounded', 'overflow-hidden')}>
      <StickyScrolledContainer
        className="h-full"
        isAncestorStickied={props.isStickied}
      >
        <Header nftCollection={props.nftCollection} />
        <section className="p-6 bg-bkg-3">
          <NftCollectionGallery />
        </section>
      </StickyScrolledContainer>
    </div>
  )
}
