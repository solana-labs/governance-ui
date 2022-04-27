import dynamic from 'next/dynamic'
import useRealm from '@hooks/useRealm'
import PreviousRouteBtn from '@components/PreviousRouteBtn'
import { LinkIcon } from '@heroicons/react/outline'
import MyProposalsBtn from 'pages/dao/[symbol]/proposal/components/MyProposalsBtn'
import useWalletStore from 'stores/useWalletStore'

const NotificationsCard = dynamic(() => import('@components/NotificationsCard'))
const DelegateCard = dynamic(() => import('@components/DelegateCard'))

const AccountInner = ({ withHeader = true }: { withHeader?: boolean }) => {
  const connected = useWalletStore((s) => s.connected)
  return (
    <div className="bg-bkg-2 col-span-12  p-4 md:p-6 rounded-lg">
      {withHeader && (
        <>
          <div className="mb-4">
            <PreviousRouteBtn />
          </div>
          <div className="flex items-center justify-between mb-4">
            <h1 className="leading-none mb-0">Account</h1>
          </div>
        </>
      )}

      <div>
        {connected ? (
          <MyProposalsBtn></MyProposalsBtn>
        ) : (
          <div className="border border-fgd-4 flex flex-col items-center justify-center p-6 rounded-lg">
            <LinkIcon className="h-6 mb-1 text-primary-light w-6" />
            <span className="text-fgd-1 text-sm">Connect your wallet</span>
          </div>
        )}
      </div>
    </div>
  )
}

const NotificationsPlugin = () => {
  const { realmInfo } = useRealm()
  if (realmInfo?.enableNotifi) {
    return (
      <div className="col-span-6">
        <NotificationsCard />
      </div>
    )
  }

  return null
}

const DelegatePlugin = () => {
  return (
    <div className="col-span-12">
      <DelegateCard />
    </div>
  )
}

const Account = ({ withHeader = true }: { withHeader?: boolean }) => {
  if (withHeader) {
    return (
      <div className="col-span-12 grid grid-cols-12 gap-4">
        <AccountInner withHeader={withHeader} />
        <DelegatePlugin />
        <NotificationsPlugin />
      </div>
    )
  } else {
    return (
      <>
        <AccountInner withHeader={withHeader} />
        <DelegatePlugin />
        <NotificationsPlugin />
      </>
    )
  }
}

export default Account
