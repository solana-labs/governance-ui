import PreviousRouteBtn from '@components/PreviousRouteBtn'
import { LinkIcon } from '@heroicons/react/outline'
import MyProposalsBtn from 'pages/dao/[symbol]/proposal/components/MyProposalsBtn'
import useWalletStore from 'stores/useWalletStore'
import DelegateCard from '@components/DelegateCard'
import { useEffect } from 'react'
import TokenBalanceCardWrapper from '@components/TokenBalance/TokenBalanceCardWrapper'
import useRealm from '@hooks/useRealm'

const AccountInner = ({ withHeader = true }: { withHeader?: boolean }) => {
  const connected = useWalletStore((s) => s.connected)
  const { realmInfo } = useRealm()
  useEffect(() => {
    console.log(realmInfo)
  }, [realmInfo])
  return (
    <div className="bg-bkg-2 col-span-12 p-4 md:p-6 rounded-lg">
      {withHeader && (
        <>
          <div className="mb-4">
            <PreviousRouteBtn />
          </div>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center justify-center">
              <img
                src={realmInfo?.ogImage}
                className="mr-2 rouninded-full w-8 h-8"
              />
              <h1 className="leading-none mb-0">My governance power</h1>
            </div>
            {connected && <MyProposalsBtn></MyProposalsBtn>}
          </div>
        </>
      )}

      <div>
        {!connected ? (
          <div className="border border-fgd-4 flex flex-col items-center justify-center p-6 rounded-lg">
            <LinkIcon className="h-6 mb-1 text-primary-light w-6" />
            <span className="text-fgd-1 text-sm">Connect your wallet</span>
          </div>
        ) : (
          <TokenBalanceCardWrapper inAccountDetails={true} />
        )}
      </div>
    </div>
  )
}

const Account = ({ withHeader = true }: { withHeader?: boolean }) => {
  if (withHeader) {
    return (
      <div className="grid grid-cols-12 gap-4">
        <AccountInner withHeader={withHeader} />
        <div className="md:w-1/2 col-span-12">
          <DelegateCard />
        </div>
      </div>
    )
  } else {
    return (
      <>
        <AccountInner withHeader={withHeader} />
        <div className="md:w-1/2 col-span-12">
          <DelegateCard />
        </div>
      </>
    )
  }
}

export default Account
