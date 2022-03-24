import { useEffect, useState } from 'react'
import GovernedAccountsTabs from '@components/GovernedAccountsTabs'
import PreviousRouteBtn from '@components/PreviousRouteBtn'
import useRealm from '@hooks/useRealm'
import { fmtMintAmount } from '@tools/sdk/units'
import useGovernanceAssetsStore from 'stores/useGovernanceAssetsStore'
import Tabs from '@components/Tabs'
import Select from '@components/inputs/Select'
import Button from '@components/Button'
import useGovernanceAssets from '@hooks/useGovernanceAssets'
import useGovernedMultiTypeAccounts from '@hooks/useGovernedMultiTypeAccounts'

import RealmConfigModal from './RealmConfigModal'
import GovernanceConfigModal from './GovernanceConfigModal'
import { capitalize } from '@utils/helpers'
import { tryParsePublicKey } from '@tools/core/pubkey'
import { getAccountName } from '@components/instructions/tools'

import ParamsView from './components/ParamsView'
import AccountsView from './components/AccountsView'
import StatsView from './components/StatsView'

const Params = () => {
  const { realm, mint } = useRealm()

  const { canUseAuthorityInstruction } = useGovernanceAssets()
  const { governedMultiTypeAccounts } = useGovernedMultiTypeAccounts()
  const governedAccounts = useGovernanceAssetsStore((s) => s.governedAccounts)
  const loadGovernedAccounts = useGovernanceAssetsStore(
    (s) => s.loadGovernedAccounts
  )

  const realmAuthorityGovernance = governedMultiTypeAccounts.find(
    (x) =>
      x.governance.pubkey.toBase58() === realm?.account.authority?.toBase58()
  )
  const [isRealmProposalModalOpen, setIsRealmProposalModalOpen] = useState(
    false
  )
  const [
    isGovernanceProposalModalOpen,
    setIsGovernanceProposalModalOpen,
  ] = useState(false)
  const [activeGovernance, setActiveGovernance] = useState<any>(null)
  const [activeTab, setActiveTab] = useState('Params')

  const realmAccount = realm?.account
  const communityMint = realmAccount?.communityMint.toBase58()
  const councilMintPk = realmAccount?.config.councilMint?.toBase58()
  const communityMintMaxVoteWeightSource =
    realmAccount?.config.communityMintMaxVoteWeightSource
  const realmConfig = realmAccount?.config
  const openRealmProposalModal = () => {
    setIsRealmProposalModalOpen(true)
  }
  const closeRealmProposalModal = () => {
    setIsRealmProposalModalOpen(false)
  }
  const openGovernanceProposalModal = () => {
    setIsGovernanceProposalModalOpen(true)
  }
  const closeGovernanceProposalModal = () => {
    setIsGovernanceProposalModalOpen(false)
  }
  const getYesNoString = (val) => {
    return val ? ' Yes' : ' No'
  }

  useEffect(() => {
    if (governedAccounts.length > 0) {
      setActiveGovernance(governedAccounts[0])
    }
  }, [governedAccounts])
  return (
    <div className="grid grid-cols-12 gap-4">
      {isRealmProposalModalOpen && (
        <RealmConfigModal
          isProposalModalOpen={isRealmProposalModalOpen}
          closeProposalModal={closeRealmProposalModal}
        ></RealmConfigModal>
      )}
      {isGovernanceProposalModalOpen && activeGovernance && (
        <GovernanceConfigModal
          governance={activeGovernance}
          isProposalModalOpen={isGovernanceProposalModalOpen}
          closeProposalModal={closeGovernanceProposalModal}
        ></GovernanceConfigModal>
      )}
      <div className="bg-bkg-2 rounded-lg p-4 md:p-6 col-span-12">
        <div className="mb-4">
          <PreviousRouteBtn />
        </div>
        <div className="flex items-center justify-between mb-6">
          <h1 className="leading-none mb-0">
            {realmAccount?.name} DAO Parameters
          </h1>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6 pb-6">
          {activeGovernance ? (
            <>
              <div className="border border-fgd-4 col-span-1 p-4 rounded-md">
                <h2>Addresses</h2>
                <DisplayField
                  padding
                  label="Pubkey"
                  val={realm?.pubkey.toBase58()}
                />
                <DisplayField
                  padding
                  label="Authority"
                  val={realmAccount?.authority?.toBase58()}
                />
                <DisplayField
                  padding
                  label="Owner"
                  val={realm?.owner.toBase58()}
                />
                {communityMint && (
                  <DisplayField
                    padding
                    label="Community Mint"
                    val={communityMint}
                  />
                )}
                {councilMintPk && (
                  <DisplayField
                    padding
                    label="Council Mint"
                    val={councilMintPk}
                  />
                )}
              </div>
              <div className="border border-fgd-4 col-span-1 p-4 rounded-md">
                <h2 className="flex items-center">Config </h2>
                {communityMintMaxVoteWeightSource && (
                  <DisplayField
                    padding
                    label="Community mint max vote weight source"
                    val={`${communityMintMaxVoteWeightSource.fmtSupplyFractionPercentage()}%`}
                  />
                )}
                <DisplayField
                  padding
                  label="Min community tokens to create governance"
                  val={
                    realmConfig &&
                    fmtMintAmount(
                      mint,
                      realmConfig!.minCommunityTokensToCreateGovernance
                    )
                  }
                />
                <DisplayField
                  padding
                  label="Use community voter weight add-in"
                  val={getYesNoString(
                    realmConfig?.useCommunityVoterWeightAddin
                  )}
                />
                <DisplayField
                  padding
                  label="Use max community voter weight add-in"
                  val={getYesNoString(
                    realmConfig?.useMaxCommunityVoterWeightAddin
                  )}
                />
                <div className="flex">
                  {realmAuthorityGovernance && (
                    <Button
                      disabled={!canUseAuthorityInstruction}
                      tooltipMessage={
                        'Please connect wallet with enough voting power to create realm config proposals'
                      }
                      onClick={openRealmProposalModal}
                      className="ml-auto"
                    >
                      Change config
                    </Button>
                  )}
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="animate-pulse bg-bkg-3 h-48 rounded-md w-full" />
              <div className="animate-pulse bg-bkg-3 h-48 rounded-md w-full" />
            </>
          )}
        </div>
        {!loadGovernedAccounts ? (
          <div className="border border-fgd-4 grid grid-cols-12 gap-4 lg:gap-6 p-6 rounded-md">
            <div className="col-span-12 lg:hidden">
              <Select
                className="break-all"
                label={'Governances'}
                onChange={(g) =>
                  setActiveGovernance(
                    governedAccounts.find((acc) => acc.pubkey.toBase58() === g)
                  )
                }
                placeholder="Please select..."
                value={activeGovernance?.pubkey.toBase58()}
              >
                {governedAccounts.map((x) => {
                  return (
                    <Select.Option
                      key={x.pubkey.toBase58()}
                      value={x.pubkey.toBase58()}
                    >
                      {x.pubkey.toBase58()}
                    </Select.Option>
                  )
                })}
              </Select>
            </div>
            <div className="hidden lg:block lg:col-span-4">
              <h3 className="mb-4">{governedAccounts.length} Governances</h3>
              <GovernedAccountsTabs
                activeTab={activeGovernance}
                onChange={(g) => setActiveGovernance(g)}
                tabs={governedAccounts}
              />
            </div>
            {activeGovernance ? (
              <div className="col-span-12 lg:col-span-8">
                <h3 className="break-all mb-4">
                  {activeGovernance.pubkey.toBase58()}
                </h3>
                {activeGovernance.accounts.length > 0 ? (
                  <Tabs
                    activeTab={activeTab}
                    onChange={(t) => setActiveTab(t)}
                    tabs={['Params', 'Accounts', 'Statistics']}
                  />
                ) : null}
                {activeTab === 'Params' && (
                  <ParamsView
                    activeGovernance={activeGovernance}
                    openGovernanceProposalModal={openGovernanceProposalModal}
                  />
                )}
                {activeTab === 'Accounts' && (
                  <AccountsView
                    activeGovernance={activeGovernance}
                    getYesNoString={getYesNoString}
                  />
                )}
                {activeTab === 'Statistics' && (
                  <StatsView activeGovernance={activeGovernance} />
                )}
              </div>
            ) : null}
          </div>
        ) : (
          <div className="animate-pulse bg-bkg-3 h-48 rounded-lg w-full" />
        )}
      </div>
    </div>
  )
}

const DisplayField = ({ label, val, padding = false, bg = false }) => {
  const pubkey = tryParsePublicKey(val)
  const name = pubkey ? getAccountName(pubkey) : ''
  return (
    <div
      className={`flex flex-col mb-2 ${bg ? 'bg-bkg-1' : ''} ${
        padding ? 'py-1' : ''
      }`}
    >
      <div className="text-xs text-fgd-3">{capitalize(label)}</div>
      <div className="text-sm break-all">
        {pubkey && name ? (
          <>
            <div className="text-xs">{name}</div>
            <div>{val}</div>
          </>
        ) : (
          <div>{val}</div>
        )}
      </div>
    </div>
  )
}

export default Params
