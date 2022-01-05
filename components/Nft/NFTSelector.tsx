import React, {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useState,
} from 'react'
import { PhotographIcon } from '@heroicons/react/solid'
import useWalletStore from 'stores/useWalletStore'
import { getParsedNftAccountsByOwner } from '@nfteyez/sol-rayz'
import { NFTWithMint } from '@utils/uiTypes/nfts'
import axios from 'axios'
import { notify } from '@utils/notifications'
import { CheckCircleIcon } from '@heroicons/react/solid'
import { PublicKey } from '@solana/web3.js'
import Loading from '@components/Loading'

export interface NftSelectorFunctions {
  someExposedProperty: () => void
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
  const getNfts = async () => {
    setIsLoading(true)
    try {
      const nfts = await getParsedNftAccountsByOwner({
        publicAddress: ownerPk,
        connection: connection.current,
      })
      const data = Object.keys(nfts).map((key) => nfts[key])
      const arr: any[] = []
      for (let i = 0; i < data.length; i++) {
        const val = (await axios.get(data[i].data.uri)).data
        arr.push({ val, mint: data[i].mint })
      }
      setNfts(arr)
    } catch (error) {
      notify({
        type: 'error',
        message: 'Unable to fetch nfts',
      })
    }
    setIsLoading(false)
  }
  console.log(ref)
  console.log('123123')
  useImperativeHandle(ref, () => ({
    someExposedProperty: () => {
      console.log(`we're inside the exposed property function!`)
    },
  }))

  useEffect(() => {
    if (ownerPk) {
      getNfts()
    }
  }, [ownerPk])
  useEffect(() => {
    onNftSelect(selectedNfts)
  }, [selectedNfts])
  return (
    <>
      <div style={{ maxHeight: '350px' }} className="overflow-y-auto">
        {!isLoading ? (
          nfts.length ? (
            <div className="flex flex-row flex-wrap gap-4 mb-4">
              {nfts.map((x) => (
                <div
                  onClick={() => handleSelectNft(x)}
                  key={x.mint}
                  className="bg-bkg-2 flex items-center justify-center cursor-pointer default-transition rounded-lg border border-transparent hover:border-primary-dark relative overflow-hidden"
                  style={{
                    width: '150px',
                    height: '150px',
                  }}
                >
                  {selectedNfts.find(
                    (selectedNfts) => selectedNfts.mint === x.mint
                  ) && (
                    <CheckCircleIcon className="w-10 h-10 absolute text-green"></CheckCircleIcon>
                  )}
                  <img style={{ width: '150px' }} src={x.val.image} />
                </div>
              ))}
            </div>
          ) : (
            <div className="text-fgd-3 flex flex-col items-center">
              {"Connected wallet don't have any NFTS"}
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
