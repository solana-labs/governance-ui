/* eslint-disable @typescript-eslint/no-non-null-assertion */
import React, { useContext, useEffect, useState } from 'react'
import { PublicKey } from '@solana/web3.js'
import * as yup from 'yup'
import { isFormValid, validatePubkey } from '@utils/formValidation'
import { UiInstruction } from '@utils/uiTypes/proposalCreationTypes'
import { NewProposalContext } from '../../../../new'
import useGovernanceAssets from '@hooks/useGovernanceAssets'
import { Governance } from '@solana/spl-governance'
import { ProgramAccount } from '@solana/spl-governance'
import useWalletStore from 'stores/useWalletStore'
import { serializeInstructionToBase64 } from '@solana/spl-governance'
import { AccountType, AssetAccount } from '@utils/uiTypes/assets'
import InstructionForm, {
  InstructionInput,
  InstructionInputType,
} from '../../FormCreator'
import UseMangoV4 from '../../../../../../../../hooks/useMangoV4'
import { PerpMarketIndex } from '@blockworks-foundation/mango-v4'
import { getChangedValues, getNullOrTransform } from '@utils/mangoV4Tools'
import { BN } from '@coral-xyz/anchor'
import AdvancedOptionsDropdown from '@components/NewRealmWizard/components/AdvancedOptionsDropdown'
import Switch from '@components/Switch'

const keyToLabel = {
  oraclePk: 'Oracle',
  oracleConfFilter: 'Oracle Confidence Filter',
  maxStalenessSlots: 'Max Staleness Slots',
  name: 'Name',
  perp: 'Perp',
  baseDecimals: 'Base Decimals',
  maintBaseAssetWeight: 'Maintenance Base Asset Weight',
  initBaseAssetWeight: 'Init Base Asset Weight',
  maintBaseLiabWeight: 'Maintenance Base Liab Weight',
  initBaseLiabWeight: 'Init Base Liab Weight',
  maintOverallAssetWeight: 'Maint Overall Asset Weight',
  initOverallAssetWeight: 'Init Overall Asset Weight',
  baseLiquidationFee: 'Base Liquidation Fee',
  makerFee: 'Maker Fee',
  takerFee: 'Taker Fee',
  feePenalty: 'Fee Penalty',
  minFunding: 'Min Funding',
  maxFunding: 'Max Funding',
  impactQuantity: 'Impact Quantity',
  groupInsuranceFund: 'Group Insurance Fund',
  settleFeeFlat: 'Settle Fee Flat',
  settleFeeAmountThreshold: 'Settle Fee Amount Threshold',
  settleFeeFractionLowHealth: 'Settle Fee Fraction Low Health',
  stablePriceDelayIntervalSeconds: 'Stable Price Delay Interval Seconds',
  stablePriceDelayGrowthLimit: 'Stable Price Delay Growth Limit',
  stablePriceGrowthLimit: 'Stable Price Growth Limit',
  settlePnlLimitFactor: 'Settle Pnl Limit Factor',
  settlePnlLimitWindowSize: 'Settle Pnl Limit Window Size',
  reduceOnly: 'Reduce Only',
  resetStablePrice: 'Reset Stable Price',
  positivePnlLiquidationFee: 'Positive Pnl Liquidation Fee',
}

type NameMarketIndexVal = {
  name: string
  value: PerpMarketIndex
}
interface PerpEditForm {
  governedAccount: AssetAccount | null
  perp: null | NameMarketIndexVal
  oraclePk: string
  name: string
  oracleConfFilter: number
  maxStalenessSlots: number
  baseDecimals: number
  maintBaseAssetWeight: number
  initBaseAssetWeight: number
  maintBaseLiabWeight: number
  initBaseLiabWeight: number
  maintOverallAssetWeight: number
  initOverallAssetWeight: number
  baseLiquidationFee: number
  makerFee: number
  takerFee: number
  feePenalty: number
  minFunding: number
  maxFunding: number
  impactQuantity: number
  groupInsuranceFund: boolean
  settleFeeFlat: number
  settleFeeAmountThreshold: number
  settleFeeFractionLowHealth: number
  stablePriceDelayIntervalSeconds: number
  stablePriceDelayGrowthLimit: number
  stablePriceGrowthLimit: number
  settlePnlLimitFactor: number
  settlePnlLimitWindowSize: number
  reduceOnly: boolean
  resetStablePrice: boolean
  positivePnlLiquidationFee: number
}

const defaultFormValues = {
  governedAccount: null,
  name: '',
  perp: null,
  oraclePk: '',
  oracleConfFilter: 0,
  maxStalenessSlots: 0,
  baseDecimals: 0,
  maintBaseAssetWeight: 0,
  initBaseAssetWeight: 0,
  maintBaseLiabWeight: 0,
  initBaseLiabWeight: 0,
  maintOverallAssetWeight: 0,
  initOverallAssetWeight: 0,
  baseLiquidationFee: 0,
  makerFee: 0,
  takerFee: 0,
  feePenalty: 0,
  minFunding: 0,
  maxFunding: 0,
  impactQuantity: 0,
  groupInsuranceFund: false,
  settleFeeFlat: 0,
  settleFeeAmountThreshold: 0,
  settleFeeFractionLowHealth: 0,
  stablePriceDelayIntervalSeconds: 0,
  stablePriceDelayGrowthLimit: 0,
  stablePriceGrowthLimit: 0,
  settlePnlLimitFactor: 0,
  settlePnlLimitWindowSize: 0,
  reduceOnly: false,
  resetStablePrice: false,
  positivePnlLiquidationFee: 0,
}

const PerpEdit = ({
  index,
  governance,
}: {
  index: number
  governance: ProgramAccount<Governance> | null
}) => {
  const wallet = useWalletStore((s) => s.current)
  const { mangoClient, mangoGroup, getAdditionalLabelInfo } = UseMangoV4()
  const { assetAccounts } = useGovernanceAssets()
  const [perps, setPerps] = useState<NameMarketIndexVal[]>([])
  const [forcedValues, setForcedValues] = useState<string[]>([])
  const solAccounts = assetAccounts.filter(
    (x) =>
      x.type === AccountType.SOL &&
      ((mangoGroup?.admin &&
        x.extensions.transferAddress?.equals(mangoGroup.admin)) ||
        (mangoGroup?.securityAdmin &&
          x.extensions.transferAddress?.equals(mangoGroup.securityAdmin)))
  )
  const shouldBeGoverned = !!(index !== 0 && governance)
  const [form, setForm] = useState<PerpEditForm>({ ...defaultFormValues })
  const [originalFormValues, setOriginalFormValues] = useState<PerpEditForm>({
    ...defaultFormValues,
  })
  const [formErrors, setFormErrors] = useState({})
  const { handleSetInstructions } = useContext(NewProposalContext)

  const validateInstruction = async (): Promise<boolean> => {
    const { isValid, validationErrors } = await isFormValid(schema, form)
    setFormErrors(validationErrors)
    return isValid
  }
  async function getInstruction(): Promise<UiInstruction> {
    const isValid = await validateInstruction()
    let serializedInstruction = ''
    if (
      isValid &&
      form.governedAccount?.governance?.account &&
      wallet?.publicKey
    ) {
      const perpMarket = mangoGroup!.perpMarketsMapByMarketIndex.get(
        form.perp!.value
      )!
      const values = getChangedValues<PerpEditForm>(
        originalFormValues,
        form,
        forcedValues
      )

      const oracleConfFilter = getNullOrTransform(
        values.oracleConfFilter,
        null,
        Number
      )
      const maxStalenessSlots = getNullOrTransform(
        values.maxStalenessSlots,
        null,
        Number
      )
      const isThereNeedOfSendingOracleConfig =
        oracleConfFilter || maxStalenessSlots
      //Mango instruction call and serialize
      const ix = await mangoClient!.program.methods
        .perpEditMarket(
          getNullOrTransform(values.oraclePk, PublicKey),
          isThereNeedOfSendingOracleConfig
            ? {
                confFilter: Number(form.oracleConfFilter),
                maxStalenessSlots: maxStalenessSlots,
              }
            : null,
          getNullOrTransform(values.baseDecimals, null, Number),
          getNullOrTransform(values.maintBaseAssetWeight, null, Number),
          getNullOrTransform(values.initBaseAssetWeight, null, Number),
          getNullOrTransform(values.maintBaseLiabWeight, null, Number),
          getNullOrTransform(values.initBaseLiabWeight, null, Number),
          getNullOrTransform(values.maintOverallAssetWeight, null, Number),
          getNullOrTransform(values.initOverallAssetWeight, null, Number),
          getNullOrTransform(values.baseLiquidationFee, null, Number),
          getNullOrTransform(values.makerFee, null, Number),
          getNullOrTransform(values.takerFee, null, Number),
          getNullOrTransform(values.minFunding, null, Number),
          getNullOrTransform(values.maxFunding, null, Number),
          getNullOrTransform(values.impactQuantity, BN),
          values.groupInsuranceFund,
          getNullOrTransform(values.feePenalty, null, Number),
          getNullOrTransform(values.settleFeeFlat, null, Number),
          getNullOrTransform(values.settleFeeAmountThreshold, null, Number),
          getNullOrTransform(values.settleFeeFractionLowHealth, null, Number),
          getNullOrTransform(
            values.stablePriceDelayIntervalSeconds,
            null,
            Number
          ),
          getNullOrTransform(values.stablePriceDelayGrowthLimit, null, Number),
          getNullOrTransform(values.stablePriceGrowthLimit, null, Number),
          getNullOrTransform(values.settlePnlLimitFactor, null, Number),
          getNullOrTransform(values.settlePnlLimitWindowSize, BN),
          values.reduceOnly,
          values.resetStablePrice,
          getNullOrTransform(values.positivePnlLiquidationFee, null, Number),
          getNullOrTransform(values.name, null, String)
        )
        .accounts({
          group: mangoGroup!.publicKey,
          admin: form.governedAccount.extensions.transferAddress,
          perpMarket: perpMarket.publicKey,
          oracle:
            getNullOrTransform(values.oraclePk, PublicKey) || perpMarket.oracle,
        })
        .instruction()

      serializedInstruction = serializeInstructionToBase64(ix)
    }
    const obj: UiInstruction = {
      serializedInstruction: serializedInstruction,
      isValid,
      governance: form.governedAccount?.governance,
    }
    return obj
  }

  useEffect(() => {
    handleSetInstructions(
      { governedAccount: form.governedAccount?.governance, getInstruction },
      index
    )
    // eslint-disable-next-line react-hooks/exhaustive-deps -- TODO please fix, it can cause difficult bugs. You might wanna check out https://bobbyhadz.com/blog/react-hooks-exhaustive-deps for info. -@asktree
  }, [form, forcedValues])
  const schema = yup.object().shape({
    governedAccount: yup
      .object()
      .nullable()
      .required('Program governed account is required'),
    oraclePk: yup
      .string()
      .required()
      .test('is-valid-address', 'Please enter a valid PublicKey', (value) =>
        value ? validatePubkey(value) : true
      ),
  })
  useEffect(() => {
    const getTokens = async () => {
      const currentTokens = [
        ...mangoGroup!.perpMarketsMapByMarketIndex.values(),
      ].map((x) => ({
        name: x.name,
        value: x.perpMarketIndex,
      }))
      setPerps(currentTokens)
    }
    if (mangoGroup) {
      getTokens()
    }
  }, [mangoGroup?.publicKey.toBase58()])

  useEffect(() => {
    if (form.perp && mangoGroup) {
      const currentPerp = mangoGroup!.perpMarketsMapByMarketIndex.get(
        form.perp.value
      )!
      const vals = {
        ...form,
        oraclePk: currentPerp.oracle.toBase58(),
        name: currentPerp.name,
        oracleConfFilter: currentPerp.oracleConfig.confFilter.toNumber(),
        maxStalenessSlots: currentPerp.oracleConfig.maxStalenessSlots.toNumber(),
        baseDecimals: currentPerp.baseDecimals,
        maintBaseAssetWeight: currentPerp.maintBaseAssetWeight.toNumber(),
        initBaseAssetWeight: currentPerp.initBaseAssetWeight.toNumber(),
        maintBaseLiabWeight: currentPerp.maintBaseLiabWeight.toNumber(),
        initBaseLiabWeight: currentPerp.initBaseLiabWeight.toNumber(),
        maintOverallAssetWeight: currentPerp.maintOverallAssetWeight.toNumber(),
        initOverallAssetWeight: currentPerp.initOverallAssetWeight.toNumber(),
        liquidationFee: currentPerp.baseLiquidationFee.toNumber(),
        makerFee: currentPerp.makerFee.toNumber(),
        takerFee: currentPerp.takerFee.toNumber(),
        feePenalty: currentPerp.feePenalty,
        minFunding: currentPerp.minFunding.toNumber(),
        maxFunding: currentPerp.maxFunding.toNumber(),
        impactQuantity: currentPerp.impactQuantity.toNumber(),
        groupInsuranceFund: currentPerp.groupInsuranceFund,
        settleFeeFlat: currentPerp.settleFeeFlat,
        settleFeeAmountThreshold: currentPerp.settleFeeAmountThreshold,
        settleFeeFractionLowHealth: currentPerp.settleFeeFractionLowHealth,
        stablePriceDelayIntervalSeconds:
          currentPerp.stablePriceModel.delayIntervalSeconds,
        stablePriceDelayGrowthLimit:
          currentPerp.stablePriceModel.delayGrowthLimit,
        stablePriceGrowthLimit: currentPerp.stablePriceModel.stableGrowthLimit,
        settlePnlLimitFactor: currentPerp.settlePnlLimitFactor,
        settlePnlLimitWindowSize: currentPerp.settlePnlLimitWindowSizeTs.toNumber(),
        reduceOnly: currentPerp.reduceOnly,
        resetStablePrice: false,
        positivePnlLiquidationFee: currentPerp.positivePnlLiquidationFee.toNumber(),
      }
      setForm({
        ...vals,
      })
      setOriginalFormValues({ ...vals })
    }
  }, [form.perp?.value])
  const inputs: InstructionInput[] = [
    {
      label: 'Governance',
      initialValue: form.governedAccount,
      name: 'governedAccount',
      type: InstructionInputType.GOVERNED_ACCOUNT,
      shouldBeGoverned: shouldBeGoverned as any,
      governance: governance,
      options: solAccounts,
    },
    {
      label: keyToLabel['perp'],
      name: 'perp',
      type: InstructionInputType.SELECT,
      initialValue: form.perp,
      options: perps,
    },
    {
      label: keyToLabel['name'],
      initialValue: form.name,
      type: InstructionInputType.INPUT,
      name: 'name',
    },
    {
      label: keyToLabel['oraclePk'],
      initialValue: form.oraclePk,
      type: InstructionInputType.INPUT,
      name: 'oraclePk',
    },
    {
      label: keyToLabel['oracleConfFilter'],
      subtitle: getAdditionalLabelInfo('confFilter'),
      initialValue: form.oracleConfFilter,
      type: InstructionInputType.INPUT,
      inputType: 'number',
      name: 'oracleConfFilter',
    },
    {
      label: keyToLabel['maxStalenessSlots'],
      subtitle: getAdditionalLabelInfo('maxStalenessSlots'),
      initialValue: form.maxStalenessSlots,
      type: InstructionInputType.INPUT,
      inputType: 'number',
      name: 'maxStalenessSlots',
    },
    {
      label: keyToLabel['baseDecimals'],
      initialValue: form.baseDecimals,
      type: InstructionInputType.INPUT,
      inputType: 'number',
      name: 'baseDecimals',
    },
    {
      label: keyToLabel['stablePriceDelayGrowthLimit'],
      subtitle: getAdditionalLabelInfo('stablePriceDelayGrowthLimit'),
      initialValue: form.stablePriceDelayGrowthLimit,
      type: InstructionInputType.INPUT,
      inputType: 'number',
      name: 'stablePriceDelayGrowthLimit',
    },
    {
      label: keyToLabel['stablePriceGrowthLimit'],
      subtitle: getAdditionalLabelInfo('stablePriceGrowthLimit'),
      initialValue: form.stablePriceGrowthLimit,
      type: InstructionInputType.INPUT,
      inputType: 'number',
      name: 'stablePriceGrowthLimit',
    },
    {
      label: keyToLabel['maintBaseAssetWeight'],
      subtitle: getAdditionalLabelInfo('maintBaseAssetWeight'),
      initialValue: form.maintBaseAssetWeight,
      type: InstructionInputType.INPUT,
      inputType: 'number',
      name: 'maintBaseAssetWeight',
    },
    {
      label: keyToLabel['initBaseAssetWeight'],
      subtitle: getAdditionalLabelInfo('initBaseAssetWeight'),
      initialValue: form.initBaseAssetWeight,
      type: InstructionInputType.INPUT,
      inputType: 'number',
      name: 'initBaseAssetWeight',
    },
    {
      label: keyToLabel['maintBaseLiabWeight'],
      subtitle: getAdditionalLabelInfo('maintBaseLiabWeight'),
      initialValue: form.maintBaseLiabWeight,
      type: InstructionInputType.INPUT,
      inputType: 'number',
      name: 'maintBaseLiabWeight',
    },
    {
      label: keyToLabel['initBaseLiabWeight'],
      subtitle: getAdditionalLabelInfo('initBaseLiabWeight'),
      initialValue: form.initBaseLiabWeight,
      type: InstructionInputType.INPUT,
      inputType: 'number',
      name: 'initBaseLiabWeight',
    },
    {
      label: keyToLabel['maintOverallAssetWeight'],
      subtitle: getAdditionalLabelInfo('maintOverallAssetWeight'),
      initialValue: form.maintOverallAssetWeight,
      type: InstructionInputType.INPUT,
      inputType: 'number',
      name: 'maintOverallAssetWeight',
    },
    {
      label: keyToLabel['initOverallAssetWeight'],
      subtitle: getAdditionalLabelInfo('initOverallAssetWeight'),
      initialValue: form.initOverallAssetWeight,
      type: InstructionInputType.INPUT,
      inputType: 'number',
      name: 'initOverallAssetWeight',
    },
    {
      label: keyToLabel['baseLiquidationFee'],
      subtitle: getAdditionalLabelInfo('baseLiquidationFee'),
      initialValue: form.baseLiquidationFee,
      type: InstructionInputType.INPUT,
      inputType: 'number',
      name: 'baseLiquidationFee',
    },
    {
      label: keyToLabel['makerFee'],
      subtitle: getAdditionalLabelInfo('makerFee'),
      initialValue: form.makerFee,
      type: InstructionInputType.INPUT,
      inputType: 'number',
      name: 'makerFee',
    },
    {
      label: keyToLabel['takerFee'],
      subtitle: getAdditionalLabelInfo('takerFee'),
      initialValue: form.takerFee,
      type: InstructionInputType.INPUT,
      inputType: 'number',
      name: 'takerFee',
    },
    {
      label: keyToLabel['feePenalty'],
      subtitle: getAdditionalLabelInfo('feePenalty'),
      initialValue: form.feePenalty,
      type: InstructionInputType.INPUT,
      inputType: 'number',
      name: 'feePenalty',
    },
    {
      label: keyToLabel['groupInsuranceFund'],
      subtitle: getAdditionalLabelInfo('groupInsuranceFund'),
      initialValue: form.groupInsuranceFund,
      type: InstructionInputType.SWITCH,
      name: 'groupInsuranceFund',
    },
    {
      label: keyToLabel['reduceOnly'],
      subtitle: getAdditionalLabelInfo('reduceOnly'),
      initialValue: form.reduceOnly,
      type: InstructionInputType.SWITCH,
      name: 'reduceOnly',
    },
    {
      label: keyToLabel['resetStablePrice'],
      subtitle: getAdditionalLabelInfo('resetStablePrice'),
      initialValue: form.resetStablePrice,
      type: InstructionInputType.SWITCH,
      name: 'resetStablePrice',
    },
    {
      label: keyToLabel['settleFeeFlat'],
      subtitle: getAdditionalLabelInfo('settleFeeFlat'),
      initialValue: form.settleFeeFlat,
      type: InstructionInputType.INPUT,
      inputType: 'number',
      name: 'settleFeeFlat',
    },
    {
      label: keyToLabel['settleFeeAmountThreshold'],
      subtitle: getAdditionalLabelInfo('settleFeeAmountThreshold'),
      initialValue: form.settleFeeAmountThreshold,
      type: InstructionInputType.INPUT,
      inputType: 'number',
      name: 'settleFeeAmountThreshold',
    },
    {
      label: keyToLabel['settleFeeFractionLowHealth'],
      subtitle: getAdditionalLabelInfo('settleFeeFractionLowHealth'),
      initialValue: form.settleFeeFractionLowHealth,
      type: InstructionInputType.INPUT,
      inputType: 'number',
      name: 'settleFeeFractionLowHealth',
    },
    {
      label: keyToLabel['stablePriceDelayIntervalSeconds'],
      subtitle: getAdditionalLabelInfo('stablePriceDelayIntervalSeconds'),
      initialValue: form.stablePriceDelayIntervalSeconds,
      type: InstructionInputType.INPUT,
      inputType: 'number',
      name: 'stablePriceDelayIntervalSeconds',
    },
    {
      label: keyToLabel['settlePnlLimitFactor'],
      subtitle: getAdditionalLabelInfo('settlePnlLimitFactor'),
      initialValue: form.settlePnlLimitFactor,
      type: InstructionInputType.INPUT,
      inputType: 'number',
      name: 'settlePnlLimitFactor',
    },
    {
      label: keyToLabel['settlePnlLimitWindowSize'],
      subtitle: getAdditionalLabelInfo('settlePnlLimitWindowSize'),
      initialValue: form.settlePnlLimitWindowSize,
      type: InstructionInputType.INPUT,
      inputType: 'number',
      name: 'settlePnlLimitWindowSize',
    },
    {
      label: keyToLabel['minFunding'],
      subtitle: getAdditionalLabelInfo('minFunding'),
      initialValue: form.minFunding,
      type: InstructionInputType.INPUT,
      inputType: 'number',
      name: 'minFunding',
    },
    {
      label: keyToLabel['maxFunding'],
      subtitle: getAdditionalLabelInfo('maxFunding'),
      initialValue: form.maxFunding,
      type: InstructionInputType.INPUT,
      inputType: 'number',
      name: 'maxFunding',
    },
    {
      label: keyToLabel['impactQuantity'],
      subtitle: getAdditionalLabelInfo('impactQuantity'),
      initialValue: form.impactQuantity,
      type: InstructionInputType.INPUT,
      inputType: 'number',
      name: 'impactQuantity',
    },
    {
      label: keyToLabel['positivePnlLiquidationFee'],
      subtitle: getAdditionalLabelInfo('positivePnlLiquidationFee'),
      initialValue: form.positivePnlLiquidationFee,
      type: InstructionInputType.INPUT,
      inputType: 'number',
      name: 'positivePnlLiquidationFee',
    },
  ]
  return (
    <>
      {form && (
        <>
          <InstructionForm
            outerForm={form}
            setForm={setForm}
            inputs={inputs}
            setFormErrors={setFormErrors}
            formErrors={formErrors}
          ></InstructionForm>
          <AdvancedOptionsDropdown title="More">
            <h3>Force values</h3>
            <div>
              {Object.keys(defaultFormValues)
                .filter((x) => x !== 'governedAccount')
                .filter((x) => x !== 'perp')
                .map((key) => (
                  <>
                    <div className="text-sm mb-3">
                      <div className="mb-2">{keyToLabel[key]}</div>
                      <div className="flex flex-row text-xs items-center">
                        <Switch
                          checked={
                            forcedValues.find((x) => x === key) ? true : false
                          }
                          onChange={(checked) => {
                            if (checked) {
                              setForcedValues([...forcedValues, key])
                            } else {
                              setForcedValues([
                                ...forcedValues.filter((x) => x !== key),
                              ])
                            }
                          }}
                        />
                      </div>
                    </div>
                  </>
                ))}
            </div>
          </AdvancedOptionsDropdown>
        </>
      )}
    </>
  )
}

export default PerpEdit
