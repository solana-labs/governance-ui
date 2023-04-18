import React, {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useState,
} from 'react'
import { PhotographIcon } from '@heroicons/react/solid'
import { NFTWithMint } from '@utils/uiTypes/nfts'
import { CheckCircleIcon } from '@heroicons/react/solid'
import { PublicKey } from '@solana/web3.js'
import Loading from '@components/Loading'
import { getNfts } from '@utils/tokens'
import ImgWithLoader from '@components/ImgWithLoader'
import useWalletStore from 'stores/useWalletStore'

export interface NftSelectorFunctions {
  handleGetNfts: () => void
}

function NFTSelector(
  {
    ownersPk,
    onNftSelect,
    nftWidth = '150px',
    nftHeight = '150px',
    selectable = true,
    predefinedNfts,
    selectedNft,
  }: {
    ownersPk: PublicKey[]
    onNftSelect: (nfts: NFTWithMint[]) => void
    nftWidth?: string
    nftHeight?: string
    selectable?: boolean
    predefinedNfts?: NFTWithMint[]
    selectedNft?: NFTWithMint | null
  },
  ref: React.Ref<NftSelectorFunctions>
) {
  const isPredefinedMode = typeof predefinedNfts !== 'undefined'
  const [nfts, setNfts] = useState<NFTWithMint[]>([])
  const [selected, setSelected] = useState<NFTWithMint[]>([])
  const connection = useWalletStore((s) => s.connection)
  const [isLoading, setIsLoading] = useState(false)
  const handleSelectNft = (nft: NFTWithMint) => {
    const nftMint: string[] = []
    selected.map((x) => {
      nftMint.push(x.mintAddress)
    })
    // Deselects NFT if clicked on again.
    if (nftMint.includes(nft.mintAddress)) {
      setSelected((current) =>
        current.filter((item) => {
          return item.mintAddress !== nft.mintAddress
        })
      )
    } else {
      setSelected((current) => [...current, nft])
    }
  }
  const handleGetNfts = async () => {
    setIsLoading(true)
    const response = await Promise.all(
      ownersPk.map((x) => getNfts(x, connection))
    )
    const nfts = response.flatMap((x) => x)
    if (nfts.length === 1) {
      setSelected([nfts[0]])
    }
    setNfts(nfts)
    setIsLoading(false)
  }
  useImperativeHandle(ref, () => ({
    handleGetNfts,
  }))

  useEffect(() => {
    if (selectedNft) {
      setSelected([selectedNft])
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- TODO please fix, it can cause difficult bugs. You might wanna check out https://bobbyhadz.com/blog/react-hooks-exhaustive-deps for info. -@asktree
  }, [])
  useEffect(() => {
    if (ownersPk.length && !isPredefinedMode) {
      handleGetNfts()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- TODO please fix, it can cause difficult bugs. You might wanna check out https://bobbyhadz.com/blog/react-hooks-exhaustive-deps for info. -@asktree
  }, [JSON.stringify(ownersPk.map((x) => x.toBase58()))])
  useEffect(() => {
    if (!isPredefinedMode && selected) {
      onNftSelect(selected)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- TODO please fix, it can cause difficult bugs. You might wanna check out https://bobbyhadz.com/blog/react-hooks-exhaustive-deps for info. -@asktree
  }, [selected])
  useEffect(() => {
    if (predefinedNfts && isPredefinedMode) {
      setNfts(predefinedNfts)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- TODO please fix, it can cause difficult bugs. You might wanna check out https://bobbyhadz.com/blog/react-hooks-exhaustive-deps for info. -@asktree
  }, [predefinedNfts])
  return (
    <>
      <div className="overflow-y-auto">
        {!isLoading ? (
          nfts.length ? (
            <div className="flex flex-row flex-wrap gap-4 mb-4">
              {nfts.map((x) => (
                <div
                  onClick={() => (selectable ? handleSelectNft(x) : null)}
                  key={x.mintAddress}
                  className={`bg-bkg-2 flex items-center justify-center cursor-pointer default-transition rounded-lg border border-transparent ${
                    selectable ? 'hover:border-primary-dark' : ''
                  } relative overflow-hidden`}
                  style={{
                    width: nftWidth,
                    height: nftHeight,
                  }}
                >
                  {selected.find((k) => x.mintAddress === k.mintAddress) && (
                    <CheckCircleIcon className="w-10 h-10 absolute text-green z-10" />
                  )}

                  <ImgWithLoader style={{ width: '150px' }} src={x.image} />
                </div>
              ))}
            </div>
          ) : (
            <div className="text-fgd-3 flex flex-col items-center">
              {"Account doesn't have any NFTs"}
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
