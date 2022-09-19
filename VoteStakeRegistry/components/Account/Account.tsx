import PreviousRouteBtn from '@components/PreviousRouteBtn'
import { LinkIcon } from '@heroicons/react/outline'
import MyProposalsBtn from 'pages/dao/[symbol]/proposal/components/MyProposalsBtn'
import useWalletStore from 'stores/useWalletStore'
import DelegateCard from '@components/DelegateCard'
// import { RealmInfo } from '@models/registry/api'
// import TokenBalanceCardWrapper from '@components/TokenBalance/TokenBalanceCardWrapper'
import { useEffect } from 'react'
import TokenBalanceCardWrapper from '@components/TokenBalance/TokenBalanceCardWrapper'
import { RealmInfo } from '@models/registry/api'

const AccountInner = ({
  realmInfo,
  withHeader = true,
}: {
  realmInfo?: RealmInfo
  withHeader?: boolean
}) => {
  const connected = useWalletStore((s) => s.connected)
  useEffect(() => {
    console.log(realmInfo)
  })
  return (
    <div className="bg-bkg-2 col-span-12 p-4 md:p-6 rounded-lg">
      {withHeader && (
        <>
          <div className="mb-4">
            <PreviousRouteBtn />
          </div>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center justify-center">
              {/* <img src={realmInfo?.ogImage} className="mr-2 rounded-full" /> */}
              <h1 className="leading-none mb-0">Your Account</h1>
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

const Account = ({
  realmInfo,
  withHeader = true,
}: {
  realmInfo?: RealmInfo
  withHeader?: boolean
}) => {
  if (withHeader) {
    return (
      <div className="grid grid-cols-12 gap-4">
        <AccountInner realmInfo={realmInfo} withHeader={withHeader} />
        <div className="md:w-1/2 col-span-12">
          <DelegateCard />
        </div>
      </div>
    )
  } else {
    return (
      <>
        <AccountInner realmInfo={realmInfo} withHeader={withHeader} />
        <div className="md:w-1/2 col-span-12">
          <DelegateCard />
        </div>
      </>
    )
  }
}

export default Account
