import React, {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useState,
} from 'react'
import { PhotographIcon } from '@heroicons/react/solid'
import useWalletStore from 'stores/useWalletStore'
import { NFTWithMint } from '@utils/uiTypes/nfts'
import { CheckCircleIcon } from '@heroicons/react/solid'
import { PublicKey } from '@solana/web3.js'
import Loading from '@components/Loading'
import { getNfts } from '@utils/tokens'
import ImgWithLoader from '@components/ImgWithLoader'
import { rem } from '@utils/funStuff'

export interface NftSelectorFunctions {
  handleGetNfts: () => void
}

function NFTSelector(
  {
    ownerPk,
    onNftSelect,
  }: {
    ownerPk: PublicKey
    onNftSelect: (nfts: NFTWithMint[]) => void
  },
  ref: React.Ref<NftSelectorFunctions>
) {
  const [nfts, setNfts] = useState<NFTWithMint[]>([])
  const [selectedNfts, setSelectedNfts] = useState<NFTWithMint[]>([])
  const connection = useWalletStore((s) => s.connection)
  const [isLoading, setIsLoading] = useState(false)
  const handleSelectNft = (nft: NFTWithMint) => {
    const isSelected = selectedNfts.find((x) => x.mint === nft.mint)
    if (isSelected) {
      setSelectedNfts([...selectedNfts.filter((x) => x.mint !== nft.mint)])
    } else {
      //For now only one nft at the time
      setSelectedNfts([nft])
    }
  }
  const handleGetNfts = async () => {
    setIsLoading(true)
    const nfts = await getNfts(connection.current, ownerPk)
    if (nfts.length === 1) {
      handleSelectNft(nfts[0])
    }
    setNfts(nfts)
    setIsLoading(false)
  }
  useImperativeHandle(ref, () => ({
    handleGetNfts,
  }))

  useEffect(() => {
    if (ownerPk) {
      handleGetNfts()
    }
  }, [ownerPk])
  useEffect(() => {
    onNftSelect(selectedNfts)
  }, [selectedNfts])
  return (
    <>
      <div
        style={{ maxHeight: rem(350), minHeight: rem(100) }}
        className="overflow-y-auto"
      >
        {!isLoading ? (
          nfts.length ? (
            <div className="flex flex-row flex-wrap gap-4 mb-4">
              {nfts.map((x) => (
                <div
                  onClick={() => handleSelectNft(x)}
                  key={x.mint}
                  className="bg-bkg-2 flex items-center justify-center cursor-pointer default-transition border border-transparent hover:border-primary-dark relative overflow-hidden"
                  style={{
                    width: '150px',
                    height: '150px',
                  }}
                >
                  {selectedNfts.find(
                    (selectedNfts) => selectedNfts.mint === x.mint
                  ) && (
                    <CheckCircleIcon className="w-10 h-10 absolute text-green z-10"></CheckCircleIcon>
                  )}
                  <ImgWithLoader style={{ width: '150px' }} src={x.val.image} />
                </div>
              ))}
            </div>
          ) : (
            <div className="text-fgd-3 flex flex-col items-center">
              {"Connected wallet doesn't have any NFTs"}
              <PhotographIcon className="opacity-5 w-56 h-56"></PhotographIcon>
            </div>
          )
        ) : (
          <Loading></Loading>
        )}
      </div>
    </>
  )
}

export default forwardRef(NFTSelector)
