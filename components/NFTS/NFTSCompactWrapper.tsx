import { getExplorerUrl } from '@components/explorer/tools'
import ImgWithLoader from '@components/ImgWithLoader'
import { DEFAULT_NFT_TREASURY_MINT } from '@components/instructions/tools'
import { PhotographIcon } from '@heroicons/react/outline'
import { ChevronRightIcon } from '@heroicons/react/solid'
import useGovernanceAssets from '@hooks/useGovernanceAssets'
import useQueryContext from '@hooks/useQueryContext'
import useRealm from '@hooks/useRealm'
import { useRouter } from 'next/router'
import React from 'react'
import useTreasuryAccountStore from 'stores/useTreasuryAccountStore'
import useWalletStore from 'stores/useWalletStore'
import { LinkButton } from '@components/Button'

const NFTSCompactWrapper = () => {
  const router = useRouter()
  const { nftsGovernedTokenAccounts } = useGovernanceAssets()
  const connection = useWalletStore((s) => s.connection)
  const realmNfts = useTreasuryAccountStore((s) => s.allNfts)
  const isLoading = useTreasuryAccountStore((s) => s.isLoadingNfts)
  const { symbol } = useRealm()
  const { fmtUrlWithCluster } = useQueryContext()
  return nftsGovernedTokenAccounts.length ? (
    <div className="bg-bkg-2 p-4 md:p-6 rounded-lg transition-all">
      <div className="flex items-center justify-between pb-4">
        <h3 className="mb-0">NFTs</h3>
        <LinkButton
          className={`flex items-center text-primary-light`}
          onClick={() => {
            const url = fmtUrlWithCluster(
              `/dao/${symbol}/gallery/${DEFAULT_NFT_TREASURY_MINT}`
            )
            router.push(url)
          }}
        >
          View
          <ChevronRightIcon className="flex-shrink-0 h-6 w-6" />
        </LinkButton>
      </div>
      <div
        className="overflow-y-auto"
        style={{ maxHeight: '210px', minHeight: '50px' }}
      >
        <div className="grid grid-cols-4 grid-flow-row gap-3">
          {isLoading ? (
            <>
              <div className="animate-pulse bg-bkg-3 col-span-1 h-20 rounded-md" />
              <div className="animate-pulse bg-bkg-3 col-span-1 h-20 rounded-md" />
              <div className="animate-pulse bg-bkg-3 col-span-1 h-20 rounded-md" />
              <div className="animate-pulse bg-bkg-3 col-span-1 h-20 rounded-md" />
            </>
          ) : realmNfts.length ? (
            realmNfts.map((x, idx) => (
              <a
                className="bg-bkg-4 col-span-1 flex items-center justify-center rounded-lg filter drop-shadow-lg"
                key={idx}
                href={getExplorerUrl(connection.endpoint, x.mint)}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
              >
                <ImgWithLoader
                  className="bg-bkg-2 cursor-pointer default-transition transform scale-90 hover:scale-95 rounded-md"
                  src={x.val.image}
                />
              </a>
            ))
          ) : (
            <div className="col-span-3 text-fgd-3 flex flex-col items-center">
              <PhotographIcon className="opacity-5 w-56 h-56"></PhotographIcon>
            </div>
          )}
        </div>
      </div>
    </div>
  ) : null
}

export default NFTSCompactWrapper
