import PreviousRouteBtn from '@components/PreviousRouteBtn'

const Treasury = () => {
  return (
    <div className="grid grid-cols-12">
      <div className="bg-bkg-2 rounded-lg p-4 md:p-6 col-span-12 space-y-3">
        <div className="border-b border-fgd-4 pb-4 pt-2">
          <div className="flex items-center">
            <PreviousRouteBtn /> <h1 className="ml-3">Treasury</h1>
          </div>
        </div>
      </div>
    </div>
  )
}
export default Treasury
