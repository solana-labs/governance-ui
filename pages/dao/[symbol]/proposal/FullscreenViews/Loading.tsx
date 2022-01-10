import Spinner from '@components/Spinner'

const LoadingPage = () => {
  return (
    <div className="w-full flex justify-between items-start">
      <div className="w-full flex flex-col justify-center items-center max-w-xl rounded-xl mt-8">
        <Spinner className="mb-5" />

        <p className="text-base mb-2">Creating proposal...</p>

        <p className="text-sm">This can take a few seconds</p>
      </div>

      <div className="max-w-xs w-full">
        <div className="mb-5 flex flex-col">
          <p className="font-bold">Title</p>

          <p>...</p>
        </div>

        <div className="mb-5 flex flex-col">
          <p className="font-bold">Description</p>

          <p>...</p>
        </div>
      </div>
    </div>
  )
}

export default LoadingPage
