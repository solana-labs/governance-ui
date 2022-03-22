import { useEffect, useState } from 'react'
import GovernedAccountsTabs from '@components/GovernedAccountsTabs'
import PreviousRouteBtn from '@components/PreviousRouteBtn'
import useRealm from '@hooks/useRealm'
import {
  fmtMintAmount,
  getMintDecimalAmount,
  getMintMinAmountAsDecimal,
  parseMintNaturalAmountFromDecimalAsBN,
} from '@tools/sdk/units'
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
import Modal from '@components/Modal'
import useGovernanceAssets from '@hooks/useGovernanceAssets'
import Input from '@components/inputs/Input'
import VoteBySwitch from '../proposal/components/VoteBySwitch'
import Textarea from '@components/inputs/Textarea'
import InstructionForm, {
  InstructionInputType,
} from '../proposal/components/instructions/FormCreator'
import {
  createSetRealmConfig,
  MintMaxVoteWeightSource,
  PROGRAM_VERSION_V1,
  serializeInstructionToBase64,
} from '@solana/spl-governance'
import { precision } from '@utils/formatting'
import BigNumber from 'bignumber.js'
import { RealmConfigForm } from '../proposal/components/instructions/RealmConfig'
import { validateInstruction } from '@utils/instructionTools'
import { getRealmCfgSchema } from '@utils/validations'
import useWalletStore from 'stores/useWalletStore'
import { PublicKey } from '@solana/web3.js'
import { UiInstruction } from '@utils/uiTypes/proposalCreationTypes'
import { parseMintSupplyFraction } from '@utils/tokens'
import useGovernedMultiTypeAccounts from '@hooks/useGovernedMultiTypeAccounts'
import useCreateProposal from '@hooks/useCreateProposal'
import { InstructionDataWithHoldUpTime } from 'actions/createProposal'
import useQueryContext from '@hooks/useQueryContext'
import { useRouter } from 'next/router'
import { notify } from '@utils/notifications'

interface RealmConfigProposal extends RealmConfigForm {
  title: string
  description: string
}

const Params = () => {
  const router = useRouter()
  const {
    realm,
    mint,
    councilMint,
    canChooseWhoVote,
    config,
    realmInfo,
    symbol,
  } = useRealm()
  const { fmtUrlWithCluster } = useQueryContext()
  const wallet = useWalletStore((s) => s.current)
  const { handleCreateProposal } = useCreateProposal()
  const { canUseAuthorityInstruction } = useGovernanceAssets()
  const { governedMultiTypeAccounts } = useGovernedMultiTypeAccounts()
  const governedAccounts = useGovernanceAssetsStore((s) => s.governedAccounts)
  const loadGovernedAccounts = useGovernanceAssetsStore(
    (s) => s.loadGovernedAccounts
  )
  const defaultCfgTitle = 'Change realm config'
  const realmAuthorityGovernance = governedMultiTypeAccounts.find(
    (x) =>
      x.governance.pubkey.toBase58() === realm?.account.authority?.toBase58()
  )
  const [isProposalModalOpen, setIsProposalModalOpen] = useState(false)
  const [activeGovernance, setActiveGovernance] = useState<any>(null)
  const [activeTab, setActiveTab] = useState('Params')
  const [formErrors, setFormErrors] = useState({})
  const [voteByCouncil, setVoteByCouncil] = useState(false)
  const [form, setForm] = useState<RealmConfigProposal>()
  const handleSetForm = ({ propertyName, value }) => {
    setFormErrors({})
    setForm({ ...form!, [propertyName]: value })
  }
  const realmAccount = realm?.account
  const communityMint = realmAccount?.communityMint.toBase58()
  const councilMintPk = realmAccount?.config.councilMint?.toBase58()
  const communityMintMaxVoteWeightSource =
    realmAccount?.config.communityMintMaxVoteWeightSource
  const realmConfig = realmAccount?.config
  const openProposalModal = () => {
    setIsProposalModalOpen(true)
  }
  const closeProposalModal = () => {
    setIsProposalModalOpen(false)
  }
  const getYesNoString = (val) => {
    return val ? ' Yes' : ' No'
  }
  const schema = getRealmCfgSchema({ form })
  const handleCreate = async () => {
    const isValid = await validateInstruction({ schema, form, setFormErrors })
    let serializedInstruction = ''
    if (
      isValid &&
      form!.governedAccount?.governance?.account &&
      wallet?.publicKey &&
      realm
    ) {
      const governance = form!.governedAccount.governance
      const mintAmount = parseMintNaturalAmountFromDecimalAsBN(
        form!.minCommunityTokensToCreateGovernance!,
        mint!.decimals!
      )
      const instruction = await createSetRealmConfig(
        realmInfo!.programId,
        realmInfo!.programVersion!,
        realm.pubkey,
        realm.account.authority!,
        form?.removeCouncil ? undefined : realm?.account.config.councilMint,
        parseMintSupplyFraction(form!.communityMintSupplyFactor.toString()),
        mintAmount,
        form!.communityVoterWeightAddin
          ? new PublicKey(form!.communityVoterWeightAddin)
          : undefined,
        form?.maxCommunityVoterWeightAddin
          ? new PublicKey(form.maxCommunityVoterWeightAddin)
          : undefined,
        wallet.publicKey
      )
      serializedInstruction = serializeInstructionToBase64(instruction)
      const obj: UiInstruction = {
        serializedInstruction: serializedInstruction,
        isValid,
        governance,
      }
      const instructionData = new InstructionDataWithHoldUpTime({
        instruction: obj,
        governance,
      })
      try {
        const proposalAddress = await handleCreateProposal({
          title: form!.title ? form!.title : defaultCfgTitle,
          description: form!.description ? form!.description : '',
          voteByCouncil,
          instructionsData: [instructionData],
          governance: governance!,
        })
        const url = fmtUrlWithCluster(
          `/dao/${symbol}/proposal/${proposalAddress}`
        )
        router.push(url)
      } catch (ex) {
        notify({ type: 'error', message: `${ex}` })
      }
    }
  }
  const minCommunity = mint ? getMintMinAmountAsDecimal(mint) : 0
  const minCommunityTokensToCreateProposal =
    realm && mint
      ? getMintDecimalAmount(
          mint,
          realm.account.config.minCommunityTokensToCreateGovernance
        )
      : new BigNumber(0)

  const currentPrecision = precision(minCommunity)
  const getMinSupplyFractionStep = () =>
    new BigNumber(1)
      .shiftedBy(-1 * MintMaxVoteWeightSource.SUPPLY_FRACTION_DECIMALS)
      .toNumber()

  const getMintSupplyFraction = () => {
    const communityMintMaxVoteWeightSource = realm!.account.config
      .communityMintMaxVoteWeightSource

    return new BigNumber(communityMintMaxVoteWeightSource.value.toString())
      .shiftedBy(-MintMaxVoteWeightSource.SUPPLY_FRACTION_DECIMALS)
      .toNumber()
  }
  const getSupplyFraction = () => {
    try {
      return mint
        ? getMintDecimalAmount(mint, mint?.supply).toNumber() *
            Number(form?.communityMintSupplyFactor)
        : 0
    } catch (e) {
      return 0
    }
  }
  const getPercentSupply = () => {
    try {
      return `${Number(form?.communityMintSupplyFactor) * 100}%`
    } catch (e) {
      return ''
    }
  }
  useEffect(() => {
    if (governedAccounts.length > 0) {
      setActiveGovernance(governedAccounts[0])
    }
  }, [governedAccounts])
  //TODO make component
  const inputs = [
    {
      label: 'Governance',
      name: 'governedAccount',
      type: InstructionInputType.GOVERNED_ACCOUNT,
      hide: true,
      initialValue: realmAuthorityGovernance,
      options: governedMultiTypeAccounts.filter(
        (x) =>
          x.governance.pubkey.toBase58() ===
          realm?.account.authority?.toBase58()
      ),
    },
    {
      label: 'Min community tokens to create governance',
      initialValue: minCommunityTokensToCreateProposal,
      name: 'minCommunityTokensToCreateGovernance',
      type: InstructionInputType.INPUT,
      inputType: 'number',
      min: minCommunity,
      step: minCommunity,
      hide: !mint,
      validateMinMax: true,
      precision: currentPrecision,
    },
    {
      label: 'Community mint supply factor (max vote weight)',
      initialValue: realm ? getMintSupplyFraction() : 0,
      name: 'communityMintSupplyFactor',
      type: InstructionInputType.INPUT,
      inputType: 'number',
      min: getMinSupplyFractionStep(),
      max: 1,
      hide: !mint,
      validateMinMax: true,
      step: getMinSupplyFractionStep(),
      additionalComponent: (
        <div>
          {new BigNumber(getSupplyFraction()).toFormat()} ({getPercentSupply()})
        </div>
      ),
    },
    {
      label: 'Community voter weight addin',
      initialValue:
        config?.account?.communityVoterWeightAddin?.toBase58() || '',
      name: 'communityVoterWeightAddin',
      type: InstructionInputType.INPUT,
      inputType: 'text',
      hide: realmInfo?.programVersion === PROGRAM_VERSION_V1,
    },
    {
      label: 'Community max voter weight addin',
      initialValue:
        config?.account?.maxCommunityVoterWeightAddin?.toBase58() || '',
      name: 'maxCommunityVoterWeightAddin',
      type: InstructionInputType.INPUT,
      inputType: 'text',
      hide: realmInfo?.programVersion === PROGRAM_VERSION_V1,
    },
    {
      label: 'Remove council',
      initialValue: false,
      name: 'removeCouncil',
      type: InstructionInputType.SWITCH,
      hide: typeof councilMint === 'undefined',
    },
  ]
  return (
    <div className="grid grid-cols-12 gap-4">
      {isProposalModalOpen && (
        <Modal
          sizeClassName="sm:max-w-3xl"
          onClose={closeProposalModal}
          isOpen={isProposalModalOpen}
        >
          <div className="space-y-4 w-full">
            <h3 className="mb-4 flex flex-col">Change Realm Config</h3>
            <div className="pt-2">
              <div className="pb-4">
                <Input
                  label="Title"
                  placeholder={defaultCfgTitle}
                  value={form?.title}
                  type="text"
                  error={formErrors['title']}
                  onChange={(evt) =>
                    handleSetForm({
                      value: evt.target.value,
                      propertyName: 'title',
                    })
                  }
                />
              </div>
              <Textarea
                className="mb-3"
                label="Description"
                placeholder="Description of your proposal or use a github gist link (optional)"
                value={form?.description}
                onChange={(evt) =>
                  handleSetForm({
                    value: evt.target.value,
                    propertyName: 'description',
                  })
                }
              ></Textarea>
              {canChooseWhoVote && (
                <VoteBySwitch
                  checked={voteByCouncil}
                  onChange={() => {
                    setVoteByCouncil(!voteByCouncil)
                  }}
                ></VoteBySwitch>
              )}
            </div>
            <InstructionForm
              setForm={setForm}
              inputs={inputs}
              setFormErrors={setFormErrors}
              formErrors={formErrors}
            ></InstructionForm>
          </div>
          <div className="border-t border-fgd-4 flex justify-end mt-6 pt-6 space-x-4">
            <Button onClick={() => handleCreate()}>Add proposal</Button>
          </div>
        </Modal>
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
                <h2 className="flex items-center">
                  Config{' '}
                  {realmAuthorityGovernance && canUseAuthorityInstruction && (
                    <Button onClick={openProposalModal} className="ml-auto">
                      Change
                    </Button>
                  )}
                </h2>
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
                      val={
                        activeGovernance.account.config.minInstructionHoldUpTime
                      }
                    />
                    <DisplayField
                      label="Proposal Cool-off Time"
                      padding
                      val={activeGovernance.account.config.proposalCoolOffTime}
                    />
                    <DisplayField
                      label="Vote Threshold Percentage"
                      padding
                      val={`${activeGovernance.account.config.voteThresholdPercentage.value}%`}
                    />
                    <DisplayField
                      label="Vote Tipping"
                      padding
                      val={activeGovernance.account.config.voteTipping}
                    />
                  </>
                ) : (
                  <div className="space-y-3">
                    {activeGovernance.accounts.map((x) => {
                      const info = getTreasuryAccountItemInfoV2(x)
                      if (
                        x.type === AccountType.TOKEN ||
                        x.type === AccountType.SOL
                      ) {
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
                              val={x.extensions.mint?.account.supply.toNumber()}
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
  return (
    <div
      className={`flex flex-col mb-2 ${bg ? 'bg-bkg-1' : ''} ${
        padding ? 'py-1' : ''
      }`}
    >
      <div className="text-xs text-fgd-3">{capitalize(label)}</div>
      <div className="text-sm break-all">{val}</div>
    </div>
  )
}

export default Params
