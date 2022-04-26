import PreviousRouteBtn from '@components/PreviousRouteBtn'
import useGovernanceAssets from '@hooks/useGovernanceAssets'
import { useTotalTreasuryPrice } from '@hooks/useTotalTreasuryPrice'
import { useEffect, useState } from 'react'
import useTreasuryAccountStore from 'stores/useTreasuryAccountStore'
import AccountsTabs from '@components/TreasuryAccount/AccountsTabs'
import AccountOverview from '@components/TreasuryAccount/AccountOverview'
import useWalletStore from 'stores/useWalletStore'
import useRealm from 'hooks/useRealm'
import { CurrencyDollarIcon, PlusCircleIcon } from '@heroicons/react/outline'
import { LinkButton } from '@components/Button'
import { useRouter } from 'next/router'
import useQueryContext from '@hooks/useQueryContext'
import tokenService from '@utils/services/token'
import useStrategiesStore from 'Strategies/store/useStrategiesStore'
import Select from '@components/inputs/Select'
import { getTreasuryAccountItemInfoV2 } from '@utils/treasuryTools'
import { AssetAccount } from '@utils/uiTypes/assets'
import Tooltip from '@components/Tooltip'

export const NEW_TREASURY_ROUTE = `/treasury/new`

const Treasury = () => {
  const { getStrategies } = useStrategiesStore()
  const { governedTokenAccountsWithoutNfts } = useGovernanceAssets()
  const { setCurrentAccount } = useTreasuryAccountStore()
  const connection = useWalletStore((s) => s.connection)
  const {
    ownVoterWeight,
    symbol,
    realm,
    toManyCommunityOutstandingProposalsForUser,
    toManyCouncilOutstandingProposalsForUse,
  } = useRealm()
  const router = useRouter()
  const { fmtUrlWithCluster } = useQueryContext()
  const connected = useWalletStore((s) => s.connected)
  const [treasuryAccounts, setTreasuryAccounts] = useState<AssetAccount[]>([])
  const [activeAccount, setActiveAccount] = useState<AssetAccount | null>(null)
  const [accountInfo, setAccountInfo] = useState<any>(null)
  const { realmInfo } = useRealm()
  useEffect(() => {
    if (
      tokenService._tokenList.length &&
      governedTokenAccountsWithoutNfts.filter((x) => x.extensions.mint).length
    ) {
      getStrategies(connection)
    }
  }, [
    tokenService._tokenList.length,
    governedTokenAccountsWithoutNfts.filter((x) => x.extensions.mint).length,
  ])
  useEffect(() => {
    async function prepTreasuryAccounts() {
      if (
        governedTokenAccountsWithoutNfts.every(
          (x) => x.extensions.transferAddress
        )
      ) {
        const accountsSorted = governedTokenAccountsWithoutNfts.sort((a, b) => {
          const infoA = getTreasuryAccountItemInfoV2(a)
          const infoB = getTreasuryAccountItemInfoV2(b)
          return infoB.totalPrice - infoA.totalPrice
        })
        setTreasuryAccounts(accountsSorted)
      }
    }
    prepTreasuryAccounts()
  }, [JSON.stringify(governedTokenAccountsWithoutNfts)])

  useEffect(() => {
    if (treasuryAccounts.length > 0 && treasuryAccounts[0].extensions.mint) {
      setActiveAccount(treasuryAccounts[0])
      setCurrentAccount(treasuryAccounts[0], connection)
    }
  }, [JSON.stringify(treasuryAccounts)])

  const { totalPriceFormatted } = useTotalTreasuryPrice()

  const handleChangeAccountTab = (acc) => {
    if (acc) {
      setActiveAccount(acc)
      setCurrentAccount(acc, connection)
    }
  }

  const goToNewAccountForm = () => {
    router.push(fmtUrlWithCluster(`/dao/${symbol}${NEW_TREASURY_ROUTE}`))
  }

  const canCreateGovernance = realm
    ? ownVoterWeight.canCreateGovernance(realm)
    : null
  const isConnectedWithGovernanceCreationPermission =
    connected &&
    canCreateGovernance &&
    !toManyCommunityOutstandingProposalsForUser &&
    !toManyCouncilOutstandingProposalsForUse

  const addNewAssetTooltip = !connected
    ? 'Connect your wallet to create new asset'
    : !canCreateGovernance
    ? "You don't have enough governance power to create a new asset"
    : toManyCommunityOutstandingProposalsForUser
    ? 'You have too many community outstanding proposals. You need to finalize them before creating a new asset.'
    : toManyCouncilOutstandingProposalsForUse
    ? 'You have too many council outstanding proposals. You need to finalize them before creating a new asset.'
    : ''
  useEffect(() => {
    if (activeAccount) {
      const info = getTreasuryAccountItemInfoV2(activeAccount)
      setAccountInfo(info)
    }
  }, [activeAccount])

  return (
    <>
      <div className="bg-bkg-2 rounded-lg p-4 md:p-6">
        <div className="grid grid-cols-12 gap-6">
          <div className="col-span-12">
            <div className="mb-4">
              <PreviousRouteBtn />
            </div>
            <div className="border-b border-fgd-4 flex flex-col md:flex-row justify-between pb-4">
              <div className="flex items-center mb-2 md:mb-0 py-2">
                {realmInfo?.ogImage ? (
                  <img src={realmInfo?.ogImage} className="h-8 mr-3 w-8"></img>
                ) : null}
                <div>
                  <p className="">{realmInfo?.displayName}</p>
                  <h1 className="mb-0">Treasury</h1>
                </div>
              </div>
              {totalPriceFormatted && (
                <div className="bg-bkg-1 px-4 py-2 rounded-md">
                  <div className="flex items-center">
                    <CurrencyDollarIcon className="flex-shrink-0 h-8 mr-2 text-primary-light w-8" />
                    <div>
                      <p className="">Treasury Value</p>
                      <div className="font-bold text-fgd-1 text-2xl">
                        ${totalPriceFormatted}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
          <>
            <div className="col-span-12 lg:col-span-4">
              <div className="flex items-center justify-between pb-4 pt-3">
                <h2 className="mb-0 text-base">Treasury Accounts</h2>
                <Tooltip
                  contentClassName="ml-auto"
                  content={addNewAssetTooltip}
                >
                  <LinkButton
                    className="flex items-center text-primary-light whitespace-nowrap"
                    disabled={!isConnectedWithGovernanceCreationPermission}
                    onClick={goToNewAccountForm}
                  >
                    <PlusCircleIcon className="h-5 mr-2 w-5" />
                    New DAO wallet
                  </LinkButton>
                </Tooltip>
              </div>
              <div className="col-span-12 lg:hidden">
                <Select
                  className="break-all"
                  onChange={(g) =>
                    handleChangeAccountTab(
                      treasuryAccounts.find((acc) => {
                        const info = getTreasuryAccountItemInfoV2(acc)
                        return info.accountName === g
                      })
                    )
                  }
                  placeholder="Please select..."
                  value={accountInfo?.accountName}
                >
                  {treasuryAccounts.map((x) => {
                    const { name } = getTreasuryAccountItemInfoV2(x)
                    return (
                      <Select.Option
                        key={x?.extensions.transferAddress?.toBase58()}
                        value={name}
                      >
                        {name}
                      </Select.Option>
                    )
                  })}
                </Select>
              </div>
              <div className="hidden lg:block">
                <AccountsTabs
                  activeTab={activeAccount}
                  onChange={(t) => handleChangeAccountTab(t)}
                  tabs={treasuryAccounts}
                />
              </div>
            </div>
            <div className="col-span-12 lg:col-span-8">
              <AccountOverview />
            </div>
          </>
        </div>
      </div>
    </>
  )
}

export default Treasury
