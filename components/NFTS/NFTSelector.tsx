import ImgWithLoader from '@components/ImgWithLoader'
import Loading from '@components/Loading'
import { CheckCircleIcon, PhotographIcon } from '@heroicons/react/solid'
import { useDigitalAssetsByOwner } from '@hooks/queries/digitalAssets'
import { PublicKey } from '@solana/web3.js'
import clsx from 'clsx'
import { SetStateAction } from 'react'

/** Select NFTs owned by a given governance */
function NFTSelector({
  nftWidth = '150px',
  nftHeight = '150px',
  selectedNfts,
  setSelectedNfts,
  owner,
}: {
  owner: PublicKey
  selectedNfts: PublicKey[]
  setSelectedNfts: React.Dispatch<SetStateAction<PublicKey[]>>
  nftWidth?: string
  nftHeight?: string
}) {
  const { data: nfts, isLoading } = useDigitalAssetsByOwner(owner)

  return (
    <>
      <div className="overflow-y-auto">
        {!isLoading ? (
          nfts?.length ? (
            <div className="flex flex-row flex-wrap gap-4 mb-4">
              {nfts.map((nft) => (
                <div
                  onClick={() =>
                    setSelectedNfts((prev) => {
                      const alreadyIncluded = prev.find(
                        (x) => x.toString() === nft.id
                      )
                      return alreadyIncluded
                        ? prev.filter((x) => x.toString() !== nft.id)
                        : [...prev, new PublicKey(nft.id)]
                    })
                  }
                  key={nft.id}
                  className={clsx(
                    `bg-bkg-2 flex-shrink-0 flex items-center justify-center cursor-pointer default-transition rounded-lg relative overflow-hidden`,
                    selectedNfts.find((k) => k.toString() === nft.id)
                      ? 'border-4 border-green'
                      : 'border border-transparent hover:border-primary-dark '
                  )}
                  style={{
                    width: nftWidth,
                    height: nftHeight,
                  }}
                >
                  {selectedNfts.find((k) => k.toString() === nft.id) && (
                    <CheckCircleIcon className="w-10 h-10 absolute text-green z-10" />
                  )}

                  <ImgWithLoader
                    style={{ width: '150px' }}
                    src={
                      nft.content.files[0]?.cdn_uri ?? nft.content.files[0]?.uri
                    }
                  />
                </div>
              ))}
            </div>
          ) : (
            <div className="text-fgd-3 flex flex-col items-center">
              {"Account doesn't have any NFTs"}
              <PhotographIcon className="opacity-5 w-56 h-56" />
            </div>
          )
        ) : (
          <Loading />
        )}
      </div>
    </>
  )
}

export default NFTSelector
