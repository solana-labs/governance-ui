import CloudIcon from './CloudIcon'
import DocIcon from './DocIcon'
import LinkIcon from './LinkIcon'

const Links = () => {
  return (
    <>
      <div className="flex justify-center items-center gap-x-3 mt-16 mb-6 pb-6 border-b border-gray-900">
        <CloudIcon className="mb-2" />

        <h2>Docs that may help you</h2>
      </div>

      <div className="bg-bkg-2 w-full p-4 rounded-md flex items-start justify-start gap-x-3">
        <LinkIcon className="" />

        <a href="#">Docs & tutorials</a>
      </div>

      <div className="bg-bkg-2 mt-4 w-full p-4 rounded-md flex items-start justify-start gap-x-3">
        <DocIcon className="mr-1" />

        <a href="#">About SPL</a>
      </div>
    </>
  )
}

export default Links
