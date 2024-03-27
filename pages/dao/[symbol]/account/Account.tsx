import PreviousRouteBtn from '@components/PreviousRouteBtn'
import { LinkIcon } from '@heroicons/react/outline'
import MyProposalsBtn from 'pages/dao/[symbol]/proposal/components/MyProposalsBtn'
import DelegateCard from '@components/DelegateCard'
import TokenBalanceCardWrapper from '@components/TokenBalance/TokenBalanceCardWrapper'
import useRealm from '@hooks/useRealm'
import useWalletOnePointOh from '@hooks/useWalletOnePointOh'
import DelegatorOptions from './DelegatorOptions'

const AccountInner = ({
  displayPanel,
  withHeader = true,
}: {
  displayPanel?: boolean
  withHeader?: boolean
}) => {
  const wallet = useWalletOnePointOh()
  const connected = !!wallet?.connected
  const { realmInfo } = useRealm()
  return (
    <div className="bg-bkg-2 col-span-12 p-4 md:p-6 rounded-lg">
      {withHeader && (
        <>
          <div className="mb-4">
            <PreviousRouteBtn />
          </div>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center justify-center">
              {realmInfo?.ogImage && (
                <img
                  src={realmInfo?.ogImage}
                  className="mr-2 rouninded-full w-8 h-8"
                />
              )}
              <h1 className="leading-none mb-0">My governance power</h1>
            </div>
            {connected && <MyProposalsBtn></MyProposalsBtn>}
          </div>
        </>
      )}

      {!withHeader && connected && <MyProposalsBtn></MyProposalsBtn>}

      <div>
        {displayPanel ? (
          !connected ? (
            <div className="border border-fgd-4 flex flex-col items-center justify-center p-6 rounded-lg">
              <LinkIcon className="h-6 mb-1 text-primary-light w-6" />
              <span className="text-fgd-1 text-sm">Connect your wallet</span>
            </div>
          ) : (
            <TokenBalanceCardWrapper inAccountDetails={true} />
          )
        ) : null}
      </div>
    </div>
  )
}

const Account = ({
  displayPanel = true,
  withHeader = true,
}: {
  displayPanel?: boolean
  withHeader?: boolean
}) => {
  if (withHeader) {
    return (
      <div className="grid grid-cols-12 gap-4">
        <AccountInner withHeader={withHeader} displayPanel={displayPanel} />
        <div className="md:col-span-6 col-span-12">
          <DelegateCard />
        </div>
        <div className="md:col-span-6 col-span-12">
          <DelegatorOptions />
        </div>
      </div>
    )
  } else {
    return (
      <>
        <AccountInner withHeader={withHeader} displayPanel={displayPanel} />
        <div className="col-span-12 grid grid-cols-2 gap-4">
          <div className="col-span-2 md:col-span-1">
            <DelegateCard />
          </div>
          <div className="col-span-2 md:col-span-1">
            <DelegatorOptions />
          </div>
        </div>
      </>
    )
  }
}

export default Account
