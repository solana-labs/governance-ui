import { ChevronRightIcon } from '@heroicons/react/solid'
import { useRealmDigitalAssetsQuery } from '@hooks/queries/digitalAssets'
import useQueryContext from '@hooks/useQueryContext'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useMemo } from 'react'

const NFTSCompactWrapper = () => {
  const { data: nfts } = useRealmDigitalAssetsQuery()
  const nftsCount = useMemo(() => nfts?.flat().length ?? 0, [nfts])

  const { symbol } = useRouter().query
  const { fmtUrlWithCluster } = useQueryContext()
  return nftsCount > 0 ? (
    <div className="bg-bkg-2 p-4 md:p-6 rounded-lg transition-all">
      <div className="flex items-center justify-between">
        <h3 className="mb-0">NFTs</h3>
        <Link href={fmtUrlWithCluster(`/dao/${symbol}/gallery`)}>
          <a
            className={`default-transition flex items-center text-fgd-2 text-sm transition-all hover:text-fgd-3`}
          >
            View
            <ChevronRightIcon className="flex-shrink-0 h-6 w-6" />
          </a>
        </Link>
      </div>
      {/*  <div
        className="overflow-y-auto"
        style={{
          maxHeight: '210px',
          minHeight: isLoading || isLoadingAssets ? '25px' : '0',
        }}
      >
        <div className="grid grid-cols-4 grid-flow-row gap-3">
          {isLoading || isLoadingAssets ? (
            <div>
              <Loading></Loading>
            </div>
          ) : realmNfts.length ? (
            realmNfts.map((x, idx) => (
              <a
                className="bg-bkg-4 col-span-1 flex items-center justify-center rounded-lg filter drop-shadow-lg"
                key={idx}
                href={getExplorerUrl(connection.cluster, x.mintAddress)}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
              >
                <ImgWithLoader
                  className="bg-bkg-2 cursor-pointer default-transition transform scale-90 hover:scale-95 rounded-md"
                  src={x.image}
                />
              </a>
            ))
          ) : null}
        </div>
      </div> */}
    </div>
  ) : null
}

export default NFTSCompactWrapper
