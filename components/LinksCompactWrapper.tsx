import {
  CloudDownloadIcon,
  DocumentIcon,
  LinkIcon,
} from '@heroicons/react/outline'

const LinksCompactWrapper = () => {
  return (
    <>
      <div className="flex justify-center items-center gap-x-3 mt-16 mb-6 pb-6 border-b border-gray-900">
        <CloudDownloadIcon className="mb-2 w-6 text-primary-light" />

        <h2>Docs that may help you</h2>
      </div>

      <div className="bg-bkg-2 w-full p-4 rounded-md flex items-center justify-start gap-x-3">
        <LinkIcon className="w-6 text-primary-light" />

        <a href="https://docs.realms.today/" rel="noreferrer" target="_blank">
          Docs & tutorials
        </a>
      </div>

      <div className="bg-bkg-2 mt-4 w-full p-4 rounded-md flex items-center justify-start gap-x-3">
        <DocumentIcon className="mr-1 w-6 text-primary-light" />

        <a href="https://spl.solana.com/" rel="noreferrer" target="_blank">
          About SPL
        </a>
      </div>
    </>
  )
}

export default LinksCompactWrapper
