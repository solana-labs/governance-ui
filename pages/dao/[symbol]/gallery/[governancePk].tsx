import { getExplorerUrl } from '@components/explorer/tools'
import PreviousRouteBtn from '@components/PreviousRouteBtn'
import { getParsedNftAccountsByOwner } from '@nfteyez/sol-rayz'
import { notify } from '@utils/notifications'
import axios from 'axios'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import useWalletStore from 'stores/useWalletStore'
import { PhotographIcon } from '@heroicons/react/outline'
import { NFTWithMint } from '@utils/uiTypes/nfts'

const gallery = () => {
  const router = useRouter()
  const connection = useWalletStore((s) => s.connection)
  const governancePk = router?.query?.governancePk
  const [nfts, setNfts] = useState<NFTWithMint[]>([])

  useEffect(() => {
    const getAllNftData = async () => {
      try {
        const nfts = await getParsedNftAccountsByOwner({
          publicAddress: governancePk,
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
    }
    if (governancePk) {
      getAllNftData()
    }
  }, [governancePk, connection.endpoint])
  return (
    <div className="grid grid-cols-12">
      <div className="bg-bkg-2 rounded-lg p-4 md:p-6 col-span-12 space-y-3">
        <PreviousRouteBtn />
        {nfts.length ? (
          <div className="flex flex-row flex-wrap gap-4">
            {nfts.map((x, idx) => (
              <a
                key={idx}
                href={getExplorerUrl(connection.endpoint, x.mint)}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
              >
                <img
                  className="bg-bkg-2 cursor-pointer default-transition rounded-lg border border-transparent hover:border-primary-dark"
                  style={{
                    width: '150px',
                    height: '150px',
                  }}
                  src={x.val.image}
                />
              </a>
            ))}
          </div>
        ) : (
          <div className="text-fgd-3 flex flex-col items-center">
            There are no NFTs in the treasury
            <PhotographIcon className="opacity-5 w-56 h-56"></PhotographIcon>
          </div>
        )}
      </div>
    </div>
  )
}

export default gallery
