import cx from 'classnames'

import StickyScrolledContainer from '../StickyScrolledContainer'
import { useDigitalAssetsByOwner } from '@hooks/queries/digitalAssets'
import useTreasuryAddressForGovernance from '@hooks/useTreasuryAddressForGovernance'
import { useCallback, useMemo, useState } from 'react'
import { SUPPORT_CNFTS } from '@constants/flags'
import NFTGallery from '@components/NFTGallery'
import { PublicKey } from '@solana/web3.js'
import Header from './Header'
import useFindGovernanceByTreasury from '@hooks/useFindGovernanceByTreasury'
import SendNft from '@components/SendNft'
import Modal from '@components/Modal'

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
  const [openSendNftsModal, setOpenSendNftsModal] = useState(false)

  const [
    selectedNftAndItsGovernance,
    setSelectedNftAndItsGovernance,
  ] = useState<[PublicKey | undefined, PublicKey]>()

  const findGovernanceByTreasury = useFindGovernanceByTreasury()
  // x is an nft object from the DAS api
  const onClickSendNft = useCallback(
    async (x: any) => {
      const owner = new PublicKey(x.ownership.owner)
      const governance = (await findGovernanceByTreasury(owner)) ?? owner
      setSelectedNftAndItsGovernance([new PublicKey(x.id), governance])
      setOpenSendNftsModal(true)
    },
    [findGovernanceByTreasury]
  )

  const onHeaderClickSendNft = useCallback(async () => {
    setSelectedNftAndItsGovernance([undefined, governance])
    setOpenSendNftsModal(true)
  }, [governance])

  return (
    <>
      <div className={cx(props.className, 'rounded', 'overflow-hidden')}>
        <StickyScrolledContainer
          className="h-full"
          isAncestorStickied={props.isStickied}
        >
          <Header
            collectionId={collectionId}
            onClickSendNft={onHeaderClickSendNft}
          />
          <section className="p-6 bg-bkg-3">
            <NftCollectionGallery
              governance={governance}
              collectionId={collectionId}
              onClickSendNft={onClickSendNft}
            />
          </section>
        </StickyScrolledContainer>
      </div>
      {openSendNftsModal && (
        <Modal
          sizeClassName="sm:max-w-3xl"
          onClose={() => setOpenSendNftsModal(false)}
          isOpen={openSendNftsModal}
        >
          <SendNft
            initialNftAndGovernanceSelected={selectedNftAndItsGovernance}
          />
        </Modal>
      )}
    </>
  )
}
