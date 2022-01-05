import { SecondaryButton } from '@components/Button'
import { getExplorerUrl } from '@components/explorer/tools'
import { DEFAULT_NFT_TREASURY_MINT } from '@components/instructions/tools'
import Loading from '@components/Loading'
import { PhotographIcon } from '@heroicons/react/outline'
import useGovernanceAssets from '@hooks/useGovernanceAssets'
import useQueryContext from '@hooks/useQueryContext'
import useRealm from '@hooks/useRealm'
import { getNfts } from '@utils/tokens'
import { NFTWithMint } from '@utils/uiTypes/nfts'
import { useRouter } from 'next/router'
import React, { useEffect, useState } from 'react'
import useWalletStore from 'stores/useWalletStore'

const NFTSCompactWrapper = () => {
  const router = useRouter()
  const { nftsGovernedTokenAccounts } = useGovernanceAssets()
  const connection = useWalletStore((s) => s.connection)
  const { symbol } = useRealm()
  const { fmtUrlWithCluster } = useQueryContext()
  const [nfts, setNfts] = useState<NFTWithMint[]>([])
  const [isLoading, setIsLoading] = useState(false)
  useEffect(() => {
    const getAllNftData = async () => {
      setIsLoading(true)
      let realmNfts: NFTWithMint[] = []

      //TODO If we will have many nft accounts we would need to rethink performance of this.
      for (const acc of nftsGovernedTokenAccounts) {
        const nfts = acc.governance?.pubkey
          ? await getNfts(connection, acc.governance.pubkey)
          : []
        realmNfts = [...realmNfts, ...nfts]
      }

      setNfts(realmNfts)
      setIsLoading(false)
    }
    getAllNftData()
  }, [nftsGovernedTokenAccounts.length])
  return nftsGovernedTokenAccounts.length ? (
    <div className="bg-bkg-2 p-4 md:p-6 rounded-lg transition-all">
      <>
        <h3 className="mb-4 flex items-center">
          NFTs{' '}
          <SecondaryButton
            className="ml-auto text-xs"
            onClick={() => {
              const url = fmtUrlWithCluster(
                `/dao/${symbol}/gallery/${DEFAULT_NFT_TREASURY_MINT}`
              )
              router.push(url)
            }}
          >
            See all
          </SecondaryButton>
        </h3>
        <div className="overflow-y-auto" style={{ maxHeight: '210px' }}>
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
                      width: '60px',
                      height: '60px',
                    }}
                    src={x.val.image}
                  />
                </a>
              ))}
            </div>
          ) : (
            <div className="text-fgd-3 flex flex-col items-center">
              {"There are no NFTs in the treasury's"}
              <PhotographIcon className="opacity-5 w-56 h-56"></PhotographIcon>
            </div>
          )}
        </div>
      </>
    </div>
  ) : null
}

export default NFTSCompactWrapper
