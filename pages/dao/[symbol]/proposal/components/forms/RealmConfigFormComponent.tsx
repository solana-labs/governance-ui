import useGovernanceAssets from '@hooks/useGovernanceAssets'
import useRealm from '@hooks/useRealm'
import {
  MintMaxVoteWeightSource,
  PROGRAM_VERSION_V1,
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

export interface RealmConfigForm {
  governedAccount: AssetAccount | undefined
  minCommunityTokensToCreateGovernance: number
  communityVoterWeightAddin: string
  removeCouncil: boolean
  maxCommunityVoterWeightAddin: string
  communityMintSupplyFactor: number
}

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
  const { realm, mint, realmInfo, councilMint, config } = useRealm()
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
      type: InstructionInputType.SWITCHED_INPUT,
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
        config?.account?.communityTokenConfig.voterWeightAddin?.toBase58() ||
        '',
      name: 'communityVoterWeightAddin',
      type: InstructionInputType.INPUT,
      inputType: 'text',
      hide: realmInfo?.programVersion === PROGRAM_VERSION_V1,
    },
    {
      label: 'Community max voter weight addin',
      initialValue:
        config?.account?.communityTokenConfig.maxVoterWeightAddin?.toBase58() ||
        '',
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
