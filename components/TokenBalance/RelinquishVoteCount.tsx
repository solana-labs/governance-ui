import useWalletOnePointOh from '@hooks/useWalletOnePointOh'
import { useUserCommunityTokenOwnerRecord } from '@hooks/queries/tokenOwnerRecord'

const RelinquishVoteCount = () => {
  const wallet = useWalletOnePointOh()
  const walletId = wallet?.publicKey?.toBase58()
  const ownTokenRecord = useUserCommunityTokenOwnerRecord().data?.result

  if (!walletId || !ownTokenRecord) {
    return null
  }

  return (
    <>
      <h3 className="mb-0 mt-6">Vote Relinquish</h3>
      <div className="mt-2 italic text-xs mb-2">
        Required to withdraw governance tokens
      </div>

      <div className="flex space-x-4 items-center mt-4">
        <div className="bg-bkg-1 px-4 py-2 justify-between rounded-md w-full">
          <div className="flex flex-row justify-between w-full mb-2">
            <div>
              <p className="text-fgd-3 text-xs">Unrelinquished Votes Count</p>
              <p className="font-bold mb-0 text-fgd-1 text-xl">
                {ownTokenRecord.account.unrelinquishedVotesCount}
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default RelinquishVoteCount
