import { getExplorerUrl } from '@components/explorer/tools'
import { PhotographIcon } from '@heroicons/react/outline'
import ImgWithLoader from '@components/ImgWithLoader'
import { MdScheduleSend } from 'react-icons/md'
import useLegacyConnectionContext from '@hooks/useLegacyConnectionContext'

const NFTGallery = ({
  nfts,
  onClickSendNft,
}: {
  nfts: any[] | undefined
  onClickSendNft: (nft: any) => void | Promise<void>
}) => {
  const connection = useLegacyConnectionContext()

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 grid-flow-row gap-6">
      {nfts === undefined ? (
        <>
          <div className="animate-pulse bg-bkg-3 col-span-1 h-48 rounded-lg" />
          <div className="animate-pulse bg-bkg-3 col-span-1 h-48 rounded-lg" />
          <div className="animate-pulse bg-bkg-3 col-span-1 h-48 rounded-lg" />
          <div className="animate-pulse bg-bkg-3 col-span-1 h-48 rounded-lg" />
        </>
      ) : nfts?.length ? (
        nfts.map((x) => (
          <div
            key={x.id}
            className="relative group bg-bkg-4 col-span-1 flex items-center justify-center rounded-lg filter drop-shadow-xl"
          >
            <a
              className="bg-bkg-2 cursor-pointer default-transition h-full w-full rounded-md border border-transparent transform scale-90 group-hover:scale-95 group-hover:opacity-50"
              href={
                connection.endpoint && x.id
                  ? getExplorerUrl(connection.cluster, x.id)
                  : ''
              }
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
            >
              <ImgWithLoader
                className="h-full w-full"
                src={x.content.files[0]?.cdn_uri ?? x.content.files[0]?.uri}
              />
            </a>
            <button
              className="hidden group-hover:block absolute w-20 h-20 items-center justify-center flex-auto text-primary-light"
              onClick={() => onClickSendNft(x)}
            >
              <div className="bg-white rounded-full flex items-center justify-center h-full w-full p-2 hover:opacity-75">
                <MdScheduleSend className="h-full w-full p-3" />
              </div>
            </button>
          </div>
        ))
      ) : (
        <div className="col-span-4 text-fgd-3 flex flex-col items-center">
          <PhotographIcon className="opacity-5 w-56 h-56" />
        </div>
      )}
    </div>
  )
}

export default NFTGallery
