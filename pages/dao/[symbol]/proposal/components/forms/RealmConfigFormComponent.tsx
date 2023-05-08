import useGovernanceAssets from '@hooks/useGovernanceAssets'
import useRealm from '@hooks/useRealm'
import {
  GoverningTokenType,
  MintMaxVoteWeightSource,
} from '@solana/spl-governance'
import {
  getMintDecimalAmount,
  getMintMinAmountAsDecimal,
} from '@tools/sdk/units'
import { precision } from '@utils/formatting'
import BigNumber from 'bignumber.js'
import { AssetAccount } from '@utils/uiTypes/assets'
import InstructionForm, {
  InstructionInput,
  InstructionInputType,
} from '../instructions/FormCreator'
import { DISABLED_VOTER_WEIGHT } from '@tools/constants'
import { useRealmQuery } from '@hooks/queries/realm'

export interface RealmConfigForm {
  governedAccount: AssetAccount | undefined
  minCommunityTokensToCreateGovernance: number
  communityVoterWeightAddin: string
  removeCouncil: boolean
  maxCommunityVoterWeightAddin: string
  communityMintSupplyFactor: number
  communityTokenType: typeof TOKEN_TYPE_NAME_VALUES[number] // programVersion >= v3
  councilTokenType: typeof TOKEN_TYPE_NAME_VALUES[number] // programVersion >= v3
  councilVoterWeightAddin: string // programVersion >= v3
  maxCouncilVoterWeightAddin: string // programVersion >= v3
}

const TOKEN_TYPE_NAME_VALUES = [
  { name: 'Liquid', value: GoverningTokenType.Liquid },
  { name: 'Membership', value: GoverningTokenType.Membership },
  { name: 'Disabled', value: GoverningTokenType.Dormant },
]

const RealmConfigFormComponent = ({
  setForm,
  setFormErrors,
  formErrors,
  governedAccount = null,
  shouldBeGoverned,
  form = {},
  hideGovSelector = false,
}: {
  setForm: React.Dispatch<React.SetStateAction<any>>
  setFormErrors: React.Dispatch<React.SetStateAction<any>>
  formErrors: any
  governedAccount: AssetAccount | null
  shouldBeGoverned: boolean
  form: any
  hideGovSelector?: boolean
}) => {
  const realm = useRealmQuery().data?.result
  const { mint, realmInfo, councilMint, config } = useRealm()
  const { assetAccounts } = useGovernanceAssets()
  const minCommunity = mint ? getMintMinAmountAsDecimal(mint) : 0
  const minCommunityTokensToCreateProposal =
    realm && mint
      ? DISABLED_VOTER_WEIGHT.eq(
          realm.account.config.minCommunityTokensToCreateGovernance
        )
        ? DISABLED_VOTER_WEIGHT
        : getMintDecimalAmount(
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

  // TODO @asktree: the way we are setting initial values that could be undefined seems bad -- risks race conditions if users dirty fields before loading is done?
  // In any case dummy values should be absolutely avoided.
  const inputs: InstructionInput[] = [
    {
      label: 'Governance',
      initialValue: governedAccount,
      name: 'governedAccount',
      type: InstructionInputType.GOVERNED_ACCOUNT,
      shouldBeGoverned: shouldBeGoverned as any,
      governance: governedAccount?.governance,
      options: assetAccounts.filter(
        (x) =>
          x.governance.pubkey.toBase58() ===
          realm?.account.authority?.toBase58()
      ),
      hide: hideGovSelector,
    },
    {
      label: 'Min community tokens to create governance',
      initialValue: minCommunityTokensToCreateProposal,
      name: 'minCommunityTokensToCreateGovernance',
      type: InstructionInputType.DISABLEABLE_INPUT,
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
      label: 'Community token type',
      name: 'communityTokenType',
      type: InstructionInputType.SELECT,
      initialValue:
        TOKEN_TYPE_NAME_VALUES[
          config?.account.communityTokenConfig.tokenType ?? 0
        ],
      options: TOKEN_TYPE_NAME_VALUES,
    },
    {
      label: 'Community voter weight addin',
      initialValue:
        config?.account?.communityTokenConfig.voterWeightAddin?.toBase58() ||
        '',
      name: 'communityVoterWeightAddin',
      type: InstructionInputType.INPUT,
      inputType: 'text',
      hide: realmInfo?.programVersion === 1,
    },
    {
      label: 'Community max voter weight addin',
      initialValue:
        config?.account?.communityTokenConfig.maxVoterWeightAddin?.toBase58() ||
        '',
      name: 'maxCommunityVoterWeightAddin',
      type: InstructionInputType.INPUT,
      inputType: 'text',
      hide: realmInfo?.programVersion === 1,
    },
    {
      label: 'Council token type',
      name: 'councilTokenType',
      type: InstructionInputType.SELECT,
      initialValue:
        TOKEN_TYPE_NAME_VALUES[
          config?.account.councilTokenConfig.tokenType ?? 0
        ],
      options: TOKEN_TYPE_NAME_VALUES,
    },
    {
      label: 'Council voter weight addin',
      initialValue:
        config?.account?.councilTokenConfig.voterWeightAddin?.toBase58() || '',
      name: 'councilVoterWeightAddin',
      type: InstructionInputType.INPUT,
      inputType: 'text',
      hide:
        realmInfo?.programVersion === undefined ||
        realmInfo?.programVersion < 3,
    },
    {
      label: 'Council max voter weight addin',
      initialValue:
        config?.account?.councilTokenConfig.maxVoterWeightAddin?.toBase58() ||
        '',
      name: 'maxCouncilVoterWeightAddin',
      type: InstructionInputType.INPUT,
      inputType: 'text',
      hide:
        realmInfo?.programVersion === undefined ||
        realmInfo?.programVersion < 3,
    },
    {
      label: 'Remove council',
      initialValue: false,
      name: 'removeCouncil',
      type: InstructionInputType.SWITCH,
      hide:
        typeof councilMint === 'undefined' ||
        (realmInfo?.programVersion ?? 0) >= 3,
    },
  ]

  return (
    <>
      {form && (
        <InstructionForm
          outerForm={form}
          setForm={setForm}
          inputs={inputs}
          setFormErrors={setFormErrors}
          formErrors={formErrors}
        ></InstructionForm>
      )}
    </>
  )
}

export default RealmConfigFormComponent
