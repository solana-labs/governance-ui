import { getExplorerUrl } from '@components/explorer/tools'
import PreviousRouteBtn from '@components/PreviousRouteBtn'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import useWalletStore from 'stores/useWalletStore'
import { PhotographIcon } from '@heroicons/react/outline'
import { NFTWithMint } from '@utils/uiTypes/nfts'
import { getNfts } from '@utils/tokens'
import { PublicKey } from '@solana/web3.js'
import Loading from '@components/Loading'
import { DEFAULT_NFT_TREASURY_MINT } from '@components/instructions/tools'
import useGovernanceAssets from '@hooks/useGovernanceAssets'

const gallery = () => {
  const router = useRouter()
  const connection = useWalletStore((s) => s.connection)
  const governancePk = router?.query?.governancePk
  const { nftsGovernedTokenAccounts } = useGovernanceAssets()
  const fetchAllNftsForRealm = DEFAULT_NFT_TREASURY_MINT === governancePk
  const [nfts, setNfts] = useState<NFTWithMint[]>([])
  const [isLoading, setIsLoading] = useState(false)
  useEffect(() => {
    const getAllNftData = async () => {
      if (governancePk) {
        setIsLoading(true)
        let realmNfts: NFTWithMint[] = []

        //TODO If we will have many nft accounts we would need to rethink performance of this.
        if (fetchAllNftsForRealm) {
          for (const acc of nftsGovernedTokenAccounts) {
            const nfts = acc.governance?.pubkey
              ? await getNfts(connection, acc.governance.pubkey)
              : []
            realmNfts = [...realmNfts, ...nfts]
          }
        } else {
          realmNfts = await getNfts(connection, new PublicKey(governancePk))
        }

        setNfts(realmNfts)
        setIsLoading(false)
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
        {isLoading ? (
          <Loading></Loading>
        ) : nfts.length ? (
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
