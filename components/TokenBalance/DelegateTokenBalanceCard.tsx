import useMembersStore from 'stores/useMembersStore'
import useWalletStore from 'stores/useWalletStore'

const DelegateBalanceCard = () => {
  const delegates = useMembersStore((s) => s.compact.delegates)
  const wallet = useWalletStore((s) => s.current)
  const walletId = wallet?.publicKey?.toBase58()

  const getCouncilTokenCount = () => {
    if (walletId && delegates?.[walletId]) {
      return delegates?.[walletId].councilTokenCount || 0
    }
    return 0
  }

  const getCouncilDelegateAmt = () => {
    if (walletId && delegates?.[walletId]) {
      return delegates?.[walletId]?.councilMembers?.length || 0
    }
    return 0
  }

  const getCommunityTokenCount = () => {
    if (walletId && delegates?.[walletId]) {
      return delegates?.[walletId].communityTokenCount || 0
    }
    return 0
  }

  const getCommunityDelegateAmt = () => {
    if (walletId && delegates?.[walletId]) {
      return delegates?.[walletId]?.communityMembers?.length || 0
    }
    return 0
  }

  return (
    <div className="bg-bkg-2 p-4 md:p-6 rounded-lg">
      <h3 className="mb-0">Your Delegates</h3>
      <div className="flex space-x-4 items-center mt-4">
        <div className="bg-bkg-1 px-4 py-2 rounded-md w-full">
          <p className="text-fgd-3 text-xs">Council Votes</p>
          <p className="font-bold mb-0 text-fgd-1 text-xl">
            {getCouncilTokenCount()}
          </p>
          <p className="text-fgd-3 text-xs">Delegate Accounts</p>
          <p className="font-bold mb-0 text-fgd-1 text-xl">
            {getCouncilDelegateAmt()}
          </p>
        </div>
      </div>
      <div className="flex space-x-4 items-center mt-4">
        <div className="bg-bkg-1 px-4 py-2 rounded-md w-full">
          <p className="text-fgd-3 text-xs">Community Votes</p>
          <p className="font-bold mb-0 text-fgd-1 text-xl">
            {getCommunityTokenCount()}
          </p>
          <p className="text-fgd-3 text-xs">Delegate Accounts</p>
          <p className="font-bold mb-0 text-fgd-1 text-xl">
            {getCommunityDelegateAmt()}
          </p>
        </div>
      </div>
    </div>
  )
}

export default DelegateBalanceCard
