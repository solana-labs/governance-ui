import ListItem from './ListItem'
import { PublicKey } from '@solana/web3.js'
import {
  useDigitalAssetById,
  useDigitalAssetsByOwner,
} from '@hooks/queries/digitalAssets'
import NFTCollectionPreviewIcon from '@components/treasuryV2/icons/NFTCollectionPreviewIcon'
import useTreasuryAddressForGovernance from '@hooks/useTreasuryAddressForGovernance'
import { useMemo } from 'react'
import { SUPPORT_CNFTS } from '@constants/flags'
import { useTreasurySelectState } from '@components/treasuryV2/Details/treasurySelectStore'

interface Props {
  collectionId: PublicKey | 'none'
  governance: PublicKey
}

const Collection = ({
  governance,
  collectionId,
}: Props & { collectionId: PublicKey }) => {
  const { result: treasury } = useTreasuryAddressForGovernance(governance)
  const { data: governanceNfts } = useDigitalAssetsByOwner(governance)
  const { data: treasuryNfts } = useDigitalAssetsByOwner(treasury)
  const countHeld = useMemo(
    () =>
      governanceNfts && treasuryNfts
        ? [...governanceNfts, ...treasuryNfts]
            .flat()
            .filter((x) => SUPPORT_CNFTS || !x.compression.compressed)
            .filter((x) =>
              (x.grouping as any[]).find(
                (y) => y.group_value === collectionId.toString()
              )
            ).length
        : undefined,
    [collectionId, governanceNfts, treasuryNfts]
  )

  const { data: collectionNft } = useDigitalAssetById(collectionId)
  const name = collectionNft?.result.content.metadata.name
  const imageUri =
    collectionNft?.result.content.files[0]?.cdn_uri ??
    collectionNft?.result.content.files[0]?.uri

  const [treasurySelect, setTreasurySelect] = useTreasurySelectState()

  const isSelected =
    treasurySelect?._kind === 'NftCollection' &&
    treasurySelect.selectedGovernance === governance.toString() &&
    treasurySelect.collectionId === collectionId.toString()

  return (
    <ListItem
      //className={props.className}
      name={name}
      rhs={
        <div className="flex items-center space-x-1">
          <div className="text-xs text-fgd-1 font-bold">
            {countHeld !== undefined ? countHeld : '...'}
          </div>
          <div className="text-xs text-fgd-1">
            {countHeld === 1 ? 'NFT' : 'NFTs'}
          </div>
        </div>
      }
      selected={isSelected}
      onSelect={() =>
        setTreasurySelect({
          selectedGovernance: governance.toString(),
          _kind: 'NftCollection',
          collectionId: collectionId.toString(),
        })
      }
      thumbnail={<img src={imageUri} className="h-6 w-6 rounded-sm" />}
    />
  )
}

const UncollectedNfts = ({ governance }: Omit<Props, 'collectionId'>) => {
  const { result: treasury } = useTreasuryAddressForGovernance(governance)
  const { data: governanceNfts } = useDigitalAssetsByOwner(governance)
  const { data: treasuryNfts } = useDigitalAssetsByOwner(treasury)
  const countHeld = useMemo(
    () =>
      governanceNfts && treasuryNfts
        ? [...governanceNfts, ...treasuryNfts]
            .flat()
            .filter((x) => SUPPORT_CNFTS || !x.compression.compressed)
            .filter((x) => x.grouping.length < 1).length
        : undefined,
    [governanceNfts, treasuryNfts]
  )

  const [treasurySelect, setTreasurySelect] = useTreasurySelectState()

  const isSelected =
    treasurySelect?._kind === 'NftCollection' &&
    treasurySelect.selectedGovernance === governance.toString() &&
    treasurySelect.collectionId === 'none'

  return (
    <ListItem
      //className={props.className}
      name={'NFTs with no collection'}
      rhs={
        <div className="flex items-center space-x-1">
          <div className="text-xs text-fgd-1 font-bold">
            {countHeld !== undefined ? countHeld : '...'}
          </div>
          <div className="text-xs text-fgd-1">
            {countHeld === 1 ? 'NFT' : 'NFTs'}
          </div>
        </div>
      }
      selected={isSelected}
      onSelect={() =>
        setTreasurySelect({
          selectedGovernance: governance.toString(),
          _kind: 'NftCollection',
          collectionId: 'none',
        })
      }
      thumbnail={<NFTCollectionPreviewIcon className="stroke-fgd-1 h-6 w-6" />}
    />
  )
}

export default function NFTListItem({ collectionId, ...props }: Props) {
  return collectionId === 'none' ? (
    <UncollectedNfts {...props} />
  ) : (
    <Collection collectionId={collectionId} {...props} />
  )
}
