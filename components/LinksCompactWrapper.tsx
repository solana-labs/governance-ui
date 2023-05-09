import {
  CloudDownloadIcon,
  DocumentIcon,
  LinkIcon,
} from '@heroicons/react/outline'

const LinksCompactWrapper = () => {
  return (
    <>
      <div className="flex justify-center items-center gap-x-3 mt-16 mb-6 pb-6 border-b border-gray-900">
        <CloudDownloadIcon className="w-8 text-primary-light" />

        <h2>Docs that may help you</h2>
      </div>

      <a href="https://docs.realms.today/" rel="noreferrer" target="_blank">
        <div className="bg-bkg-2 w-full p-4 rounded-md flex items-center justify-start gap-x-3">
          <LinkIcon className="w-8 text-primary-light" />

          <p>Docs & tutorials</p>
        </div>
      </a>

      <a href="https://spl.solana.com/" rel="noreferrer" target="_blank">
        <div className="bg-bkg-2 mt-4 w-full p-4 rounded-md flex items-center justify-start gap-x-3">
          <DocumentIcon className="mr-1 w-8 text-primary-light" />

          <p>About SPL</p>
        </div>
      </a>
    </>
  )
}

export default LinksCompactWrapper
