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
import { Metadata } from '@metaplex-foundation/mpl-token-metadata'
import useVotePluginsClientStore from 'stores/useVotePluginsClientStore'
export interface NftSelectorFunctions {
  handleGetNfts: () => void
}

function NFTSelector(
  {
    ownerPk,
    onNftSelect,
    nftWidth = '150px',
    nftHeight = '150px',
    selectable = true,
    collectionsPks = [],
  }: {
    ownerPk: PublicKey
    onNftSelect: (nfts: NFTWithMint[]) => void
    nftWidth?: string
    nftHeight?: string
    selectable?: boolean
    collectionsPks?: string[]
  },
  ref: React.Ref<NftSelectorFunctions>
) {
  const [nfts, setNfts] = useState<NFTWithMint[]>([])
  const [selectedNfts, setSelectedNfts] = useState<NFTWithMint[]>([])
  const client = useVotePluginsClientStore(
    (s) => s.state.currentRealmVotingClient
  )
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
    let nfts = await getNfts(connection.current, ownerPk)
    if (collectionsPks.length) {
      const resp = (
        await Promise.all(nfts.map((x) => getIsFromCollection(x.mint)))
      ).filter((x) => x instanceof Metadata) as Metadata[]
      nfts = nfts.filter((x) => resp.find((j) => j.data.mint === x.mint))
      const voterNfts: Metadata[] = []
      for (const nft of resp) {
        voterNfts.push(nft)
      }
      client._setCurrentVoterNfts(voterNfts)
    }
    if (nfts.length === 1) {
      handleSelectNft(nfts[0])
    }
    setNfts(nfts)
    setIsLoading(false)
  }
  const getIsFromCollection = async (mint: string) => {
    const metadataAccount = await Metadata.getPDA(mint)
    const metadata = await Metadata.load(connection.current, metadataAccount)
    return (
      metadata.data.collection?.key &&
      collectionsPks.includes(metadata.data.collection?.key) &&
      metadata.data.collection.verified &&
      metadata
    )
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
    if (collectionsPks) {
      handleGetNfts()
    }
  }, [collectionsPks.length])
  useEffect(() => {
    onNftSelect(selectedNfts)
  }, [selectedNfts])
  return (
    <>
      <div
        style={{ maxHeight: '350px', minHeight: '100px' }}
        className="overflow-y-auto"
      >
        {!isLoading ? (
          nfts.length ? (
            <div className="flex flex-row flex-wrap gap-4 mb-4">
              {nfts.map((x) => (
                <div
                  onClick={() => (selectable ? handleSelectNft(x) : null)}
                  key={x.mint}
                  className={`bg-bkg-2 flex items-center justify-center cursor-pointer default-transition rounded-lg border border-transparent ${
                    selectable ? 'hover:border-primary-dark' : ''
                  } relative overflow-hidden`}
                  style={{
                    width: nftWidth,
                    height: nftHeight,
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
