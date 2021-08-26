import Button from './Button'

const VotePanel = () => {
  return (
    <div className="bg-bkg-2 p-6 rounded-md space-y-6">
      <h2 className="mb-4 text-center">Cast your vote</h2>
      <div className="flex items-center justify-center">
        <Button className="mx-2 w-44">Approve</Button>
        <Button className="mx-2 w-44">Deny</Button>
      </div>
    </div>
  )
}

export default VotePanel
