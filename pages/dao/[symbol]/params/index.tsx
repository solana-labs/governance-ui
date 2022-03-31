import { useEffect, useState } from 'react'
import GovernedAccountsTabs from '@components/GovernedAccountsTabs'
import PreviousRouteBtn from '@components/PreviousRouteBtn'
import useRealm from '@hooks/useRealm'
import { fmtMintAmount } from '@tools/sdk/units'
import { capitalize } from '@utils/helpers'
import { getTreasuryAccountItemInfoV2 } from '@utils/treasuryTools'
import useGovernanceAssetsStore, {
  AccountType,
} from 'stores/useGovernanceAssetsStore'
import {
  getFormattedStringFromDays,
  SECS_PER_DAY,
} from 'VoteStakeRegistry/tools/dateTools'
import Tabs from '@components/Tabs'
import Select from '@components/inputs/Select'
import Button from '@components/Button'
import useGovernanceAssets from '@hooks/useGovernanceAssets'

import RealmConfigModal from './RealmConfigModal'
import GovernanceConfigModal from './GovernanceConfigModal'
import { VoteTipping } from '@solana/spl-governance'
import { tryParsePublicKey } from '@tools/core/pubkey'
import { getAccountName } from '@components/instructions/tools'
import useWalletStore from 'stores/useWalletStore'
import SetRealmAuthorityModal from './SetRealmAuthorityModal'
import BigNumber from 'bignumber.js'

const Params = () => {
  const { realm, mint, councilMint, ownVoterWeight } = useRealm()
  const wallet = useWalletStore((s) => s.current)
  const { canUseAuthorityInstruction, assetAccounts } = useGovernanceAssets()
  const governancesArray = useGovernanceAssetsStore((s) => s.governancesArray)
  const loadGovernedAccounts = useGovernanceAssetsStore(
    (s) => s.loadGovernedAccounts
  )

  const realmAuthorityGovernance = assetAccounts.find(
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
  const [isRealmAuthorityModalOpen, setRealmAuthorityModalIsOpen] = useState(
    false
  )
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
  const openSetRealmAuthorityModal = () => {
    setRealmAuthorityModalIsOpen(true)
  }
  const closeSetRealmAuthorityModal = () => {
    setRealmAuthorityModalIsOpen(false)
  }
  const getYesNoString = (val) => {
    return val ? ' Yes' : ' No'
  }

  useEffect(() => {
    if (governancesArray.length > 0) {
      setActiveGovernance(governancesArray[0])
    }
  }, [governancesArray])
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
      {isRealmAuthorityModalOpen && (
        <SetRealmAuthorityModal
          isOpen={isRealmAuthorityModalOpen}
          closeModal={closeSetRealmAuthorityModal}
        ></SetRealmAuthorityModal>
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
                <div className="flex">
                  {wallet?.publicKey?.toBase58() ===
                    realmAccount?.authority?.toBase58() && (
                    <Button
                      onClick={openSetRealmAuthorityModal}
                      className="ml-auto"
                    >
                      Set authority
                    </Button>
                  )}
                </div>
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
                    governancesArray.find((acc) => acc.pubkey.toBase58() === g)
                  )
                }
                placeholder="Please select..."
                value={activeGovernance?.pubkey.toBase58()}
              >
                {governancesArray.map((x) => {
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
              <h3 className="mb-4">{governancesArray.length} Governances</h3>
              <GovernedAccountsTabs
                activeTab={activeGovernance}
                onChange={(g) => setActiveGovernance(g)}
                tabs={governancesArray}
              />
            </div>
            {activeGovernance ? (
              <div className="col-span-12 lg:col-span-8">
                <h3 className="break-all mb-4">
                  {activeGovernance.pubkey.toBase58()}
                </h3>
                {assetAccounts.filter(
                  (x) =>
                    x.governance.pubkey.toBase58() ===
                    activeGovernance.pubkey.toBase58()
                ).length > 0 ? (
                  <Tabs
                    activeTab={activeTab}
                    onChange={(t) => setActiveTab(t)}
                    tabs={['Params', 'Accounts']}
                  />
                ) : null}
                {activeTab === 'Params' ? (
                  <>
                    <DisplayField
                      label="owner"
                      padding
                      val={activeGovernance.owner.toBase58()}
                    />
                    {realmAccount?.authority?.toBase58() ===
                      activeGovernance.pubkey.toBase58() && (
                      <DisplayField
                        label="Realm Authority"
                        padding
                        val={'Yes'}
                      />
                    )}
                    <DisplayField
                      label="Proposals Count"
                      padding
                      val={activeGovernance.account.proposalCount}
                    />
                    <DisplayField
                      label="Voting Proposals Count"
                      padding
                      val={activeGovernance.account.votingProposalCount}
                    />
                    <DisplayField
                      label="Max Voting Time"
                      padding
                      val={getFormattedStringFromDays(
                        activeGovernance.account.config.maxVotingTime /
                          SECS_PER_DAY
                      )}
                    />
                    {communityMint && (
                      <DisplayField
                        label="Min community tokens to create a proposal"
                        padding
                        val={fmtMintAmount(
                          mint,
                          activeGovernance.account.config
                            .minCommunityTokensToCreateProposal
                        )}
                      />
                    )}
                    {councilMint && (
                      <DisplayField
                        label="Min council tokens to create a proposal"
                        padding
                        val={fmtMintAmount(
                          councilMint,
                          activeGovernance.account.config
                            .minCouncilTokensToCreateProposal
                        )}
                      />
                    )}
                    <DisplayField
                      label="Min Instruction Holdup Time"
                      padding
                      val={`${activeGovernance.account.config.minInstructionHoldUpTime} secs`}
                    />
                    <DisplayField
                      label="Proposal Cool-off Time"
                      padding
                      val={`${activeGovernance.account.config.proposalCoolOffTime} secs`}
                    />
                    <DisplayField
                      label="Vote Threshold Percentage"
                      padding
                      val={`${activeGovernance.account.config.voteThresholdPercentage.value}%`}
                    />
                    <DisplayField
                      label="Vote Tipping"
                      padding
                      val={
                        VoteTipping[
                          activeGovernance.account.config.voteTipping as any
                        ]
                      }
                    />
                    <div className="flex">
                      <Button
                        disabled={
                          !ownVoterWeight.canCreateProposal(
                            activeGovernance.account.config
                          )
                        }
                        tooltipMessage={
                          'Please connect wallet with enough voting power to create governance config proposals'
                        }
                        onClick={openGovernanceProposalModal}
                        className="ml-auto"
                      >
                        Change config
                      </Button>
                    </div>
                  </>
                ) : (
                  <div className="space-y-3">
                    {assetAccounts
                      .filter(
                        (x) =>
                          x.governance.pubkey.toBase58() ===
                          activeGovernance.pubkey.toBase58()
                      )
                      .map((x) => {
                        const info = getTreasuryAccountItemInfoV2(x)
                        if (x.isToken || x.isSol) {
                          return (
                            <div
                              className="bg-bkg-1 p-4 pb-2 rounded-md"
                              key={x.pubkey.toBase58()}
                            >
                              <DisplayField
                                bg={false}
                                label="Name"
                                val={info.name}
                              />
                              <DisplayField
                                bg={false}
                                label="Address"
                                val={x.extensions?.transferAddress?.toBase58()}
                              />
                              <DisplayField
                                bg={false}
                                label="Balance"
                                val={
                                  <div className="flex items-center">
                                    {info.logo && (
                                      <img
                                        className="h-4 mr-1 w-4"
                                        src={info.logo}
                                      />
                                    )}
                                    <span>{`${info.amountFormatted} ${
                                      info.info?.symbol && info.info?.symbol
                                    }`}</span>
                                  </div>
                                }
                              />
                              <DisplayField
                                bg={false}
                                label="Type"
                                val={AccountType[x.type]}
                              />
                              {x.type !== AccountType.SOL && (
                                <DisplayField
                                  label="Mint"
                                  bg={false}
                                  val={x.extensions.mint?.publicKey.toBase58()}
                                />
                              )}
                            </div>
                          )
                        }

                        if (x.type === AccountType.NFT) {
                          return (
                            <div
                              className="bg-bkg-1 p-4 pb-2 rounded-md"
                              key={x.pubkey.toBase58()}
                            >
                              <DisplayField
                                bg={false}
                                label="Type"
                                val={AccountType[x.type]}
                              />
                              <DisplayField
                                bg={false}
                                label="Address"
                                val={x.extensions?.transferAddress?.toBase58()}
                              />
                            </div>
                          )
                        }
                        if (x.type === AccountType.MINT) {
                          return (
                            <div
                              className="bg-bkg-1 p-4 pb-2 rounded-md"
                              key={x.pubkey.toBase58()}
                            >
                              <DisplayField
                                bg={false}
                                label="Type"
                                val={AccountType[x.type]}
                              />
                              <DisplayField
                                bg={false}
                                label="Pubkey"
                                val={x.extensions.mint?.publicKey.toBase58()}
                              />
                              <DisplayField
                                bg={false}
                                label="Decimals"
                                val={x.extensions.mint?.account.decimals}
                              />
                              <DisplayField
                                bg={false}
                                label="Mint Authority"
                                val={x.extensions.mint?.account.mintAuthority?.toBase58()}
                              />
                              <DisplayField
                                bg={false}
                                label="Supply"
                                val={new BigNumber(
                                  x.extensions.mint!.account.supply.toString()
                                )
                                  .shiftedBy(
                                    -x.extensions.mint!.account.decimals || 0
                                  )
                                  .toFormat()}
                              />
                              <DisplayField
                                bg={false}
                                label="Is Initialized"
                                val={getYesNoString(
                                  x.extensions.mint?.account.isInitialized
                                )}
                              />
                              {x.extensions.mint?.account.freezeAuthority ? (
                                <DisplayField
                                  bg={false}
                                  label="Freeze Authority"
                                  val={x.extensions.mint?.account.freezeAuthority?.toBase58()}
                                />
                              ) : null}
                            </div>
                          )
                        }
                        if (x.type === AccountType.PROGRAM) {
                          return (
                            <div
                              className="bg-bkg-1 p-4 pb-2 rounded-md"
                              key={x.pubkey.toBase58()}
                            >
                              <DisplayField
                                bg={false}
                                label="Type"
                                val={AccountType[x.type]}
                              />
                              <DisplayField
                                bg={false}
                                label="Pubkey"
                                val={x.pubkey.toBase58()}
                              />
                            </div>
                          )
                        }
                      })}
                  </div>
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
