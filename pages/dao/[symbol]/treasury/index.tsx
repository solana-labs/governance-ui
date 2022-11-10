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
  const {
    governedTokenAccountsWithoutNfts,
    auxiliaryTokenAccounts,
  } = useGovernanceAssets()
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
    // eslint-disable-next-line react-hooks/exhaustive-deps -- TODO please fix, it can cause difficult bugs. You might wanna check out https://bobbyhadz.com/blog/react-hooks-exhaustive-deps for info. -@asktree
  }, [
    tokenService._tokenList.length,
    // eslint-disable-next-line react-hooks/exhaustive-deps -- TODO please fix, it can cause difficult bugs. You might wanna check out https://bobbyhadz.com/blog/react-hooks-exhaustive-deps for info. -@asktree
    governedTokenAccountsWithoutNfts.filter((x) => x.extensions.mint).length,
  ])
  useEffect(() => {
    async function prepTreasuryAccounts() {
      if (
        governedTokenAccountsWithoutNfts.every(
          (x) => x.extensions.transferAddress
        )
      ) {
        const accounts = [
          ...governedTokenAccountsWithoutNfts,
          ...auxiliaryTokenAccounts,
        ]
        const accountsSorted = accounts.sort((a, b) => {
          const infoA = getTreasuryAccountItemInfoV2(a)
          const infoB = getTreasuryAccountItemInfoV2(b)
          return infoB.totalPrice - infoA.totalPrice
        })
        setTreasuryAccounts(accountsSorted)
      }
    }
    prepTreasuryAccounts()
    // eslint-disable-next-line react-hooks/exhaustive-deps -- TODO please fix, it can cause difficult bugs. You might wanna check out https://bobbyhadz.com/blog/react-hooks-exhaustive-deps for info. -@asktree
  }, [JSON.stringify(governedTokenAccountsWithoutNfts)])

  useEffect(() => {
    if (treasuryAccounts.length > 0 && treasuryAccounts[0].extensions.mint) {
      setActiveAccount(treasuryAccounts[0])
      setCurrentAccount(treasuryAccounts[0], connection)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- TODO please fix, it can cause difficult bugs. You might wanna check out https://bobbyhadz.com/blog/react-hooks-exhaustive-deps for info. -@asktree
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
      <div className="p-4 rounded-lg bg-bkg-2 md:p-6">
        <div className="grid grid-cols-12 gap-6">
          <div className="col-span-12">
            <div className="mb-4">
              <PreviousRouteBtn />
            </div>
            <div className="flex flex-col justify-between pb-4 border-b border-fgd-4 md:flex-row">
              <div className="flex items-center py-2 mb-2 md:mb-0">
                {realmInfo?.ogImage ? (
                  <img src={realmInfo?.ogImage} className="w-8 h-8 mr-3"></img>
                ) : null}
                <div>
                  <p className="">{realmInfo?.displayName}</p>
                  <h1 className="mb-0">Treasury</h1>
                </div>
              </div>
              {totalPriceFormatted && (
                <div className="px-4 py-2 rounded-md bg-bkg-1">
                  <div className="flex items-center">
                    <CurrencyDollarIcon className="flex-shrink-0 w-8 h-8 mr-2 text-primary-light" />
                    <div>
                      <p className="">Treasury Value</p>
                      <div className="text-2xl hero-text text-fgd-1">
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
              <div className="flex items-center justify-between pt-3 pb-4">
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
                    <PlusCircleIcon className="w-5 h-5 mr-2" />
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
