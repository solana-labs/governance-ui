/* eslint-disable @typescript-eslint/no-non-null-assertion */
import React, { useContext, useEffect, useState } from 'react'
import useRealm from '@hooks/useRealm'
import { PublicKey } from '@solana/web3.js'
import * as yup from 'yup'
import { isFormValid } from '@utils/formValidation'
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

type NameMarketIndexVal = {
  name: string
  value: PerpMarketIndex
}
interface PerpEditForm {
  governedAccount: AssetAccount | null
  perp: null | NameMarketIndexVal
  oraclePk: string
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
  const { realmInfo } = useRealm()
  const { assetAccounts } = useGovernanceAssets()
  const [perps, setPerps] = useState<NameMarketIndexVal[]>([])
  const solAccounts = assetAccounts.filter(
    (x) =>
      x.type === AccountType.SOL &&
      ((mangoGroup?.admin &&
        x.extensions.transferAddress?.equals(mangoGroup.admin)) ||
        (mangoGroup?.securityAdmin &&
          x.extensions.transferAddress?.equals(mangoGroup.securityAdmin)))
  )
  const shouldBeGoverned = !!(index !== 0 && governance)
  const programId: PublicKey | undefined = realmInfo?.programId
  const [form, setForm] = useState<PerpEditForm>({ ...defaultFormValues })
  const [originalFormValues, setOriginalFormValues] = useState<PerpEditForm>({
    ...defaultFormValues,
  })
  const [formErrors, setFormErrors] = useState({})
  const { handleSetInstructions } = useContext(NewProposalContext)
  const handleSetForm = ({ propertyName, value }) => {
    setFormErrors({})
    setForm({ ...form, [propertyName]: value })
  }
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
      programId &&
      form.governedAccount?.governance?.account &&
      wallet?.publicKey
    ) {
      const perpMarket = mangoGroup!.perpMarketsMapByMarketIndex.get(
        form.perp!.value
      )!
      const values = getChangedValues<PerpEditForm>(originalFormValues, form)
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
          getNullOrTransform(values.positivePnlLiquidationFee, null, Number)
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
    handleSetForm({
      propertyName: 'programId',
      value: programId?.toString(),
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps -- TODO please fix, it can cause difficult bugs. You might wanna check out https://bobbyhadz.com/blog/react-hooks-exhaustive-deps for info. -@asktree
  }, [realmInfo?.programId])
  useEffect(() => {
    handleSetInstructions(
      { governedAccount: form.governedAccount?.governance, getInstruction },
      index
    )
    // eslint-disable-next-line react-hooks/exhaustive-deps -- TODO please fix, it can cause difficult bugs. You might wanna check out https://bobbyhadz.com/blog/react-hooks-exhaustive-deps for info. -@asktree
  }, [form])
  const schema = yup.object().shape({
    governedAccount: yup
      .object()
      .nullable()
      .required('Program governed account is required'),
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
        positivePnlLiquidationFee:
          //@ts-ignore
          currentPerp.positivePnlLiquidationFee?.toNumber() || 0,
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
      label: 'Perp',
      name: 'perp',
      type: InstructionInputType.SELECT,
      initialValue: form.perp,
      options: perps,
    },
    {
      label: 'Oracle',
      initialValue: form.oraclePk,
      type: InstructionInputType.INPUT,
      name: 'oraclePk',
    },
    {
      label: `Oracle Confidence Filter`,
      subtitle: getAdditionalLabelInfo('confFilter'),
      initialValue: form.oracleConfFilter,
      type: InstructionInputType.INPUT,
      inputType: 'number',
      name: 'oracleConfFilter',
    },
    {
      label: `Max Staleness Slots`,
      subtitle: getAdditionalLabelInfo('maxStalenessSlots'),
      initialValue: form.maxStalenessSlots,
      type: InstructionInputType.INPUT,
      inputType: 'number',
      name: 'maxStalenessSlots',
    },
    {
      label: 'Base Decimals',
      initialValue: form.baseDecimals,
      type: InstructionInputType.INPUT,
      inputType: 'number',
      name: 'baseDecimals',
    },
    {
      label: `Stable Price Delay Growth Limit`,
      subtitle: getAdditionalLabelInfo('stablePriceDelayGrowthLimit'),
      initialValue: form.stablePriceDelayGrowthLimit,
      type: InstructionInputType.INPUT,
      inputType: 'number',
      name: 'stablePriceDelayGrowthLimit',
    },
    {
      label: `Stable Price Growth Limit`,
      subtitle: getAdditionalLabelInfo('stablePriceGrowthLimit'),
      initialValue: form.stablePriceGrowthLimit,
      type: InstructionInputType.INPUT,
      inputType: 'number',
      name: 'stablePriceGrowthLimit',
    },
    {
      label: `Maintenance Base Asset Weight`,
      subtitle: getAdditionalLabelInfo('maintBaseAssetWeight'),
      initialValue: form.maintBaseAssetWeight,
      type: InstructionInputType.INPUT,
      inputType: 'number',
      name: 'maintBaseAssetWeight',
    },
    {
      label: `Maintenance Base Liab Weight`,
      subtitle: getAdditionalLabelInfo('maintBaseLiabWeight'),
      initialValue: form.maintBaseLiabWeight,
      type: InstructionInputType.INPUT,
      inputType: 'number',
      name: 'maintBaseLiabWeight',
    },
    {
      label: `Maint Overall Asset Weight`,
      subtitle: getAdditionalLabelInfo('maintOverallAssetWeight'),
      initialValue: form.maintOverallAssetWeight,
      type: InstructionInputType.INPUT,
      inputType: 'number',
      name: 'maintOverallAssetWeight',
    },
    {
      label: `Init Base Liab Weight`,
      subtitle: getAdditionalLabelInfo('initBaseLiabWeight'),
      initialValue: form.initBaseLiabWeight,
      type: InstructionInputType.INPUT,
      inputType: 'number',
      name: 'initBaseLiabWeight',
    },
    {
      label: `Init Base Asset Weight`,
      subtitle: getAdditionalLabelInfo('initBaseAssetWeight'),
      initialValue: form.initBaseAssetWeight,
      type: InstructionInputType.INPUT,
      inputType: 'number',
      name: 'initBaseAssetWeight',
    },

    {
      label: `Base Liquidation Fee`,
      subtitle: getAdditionalLabelInfo('baseLiquidationFee'),
      initialValue: form.baseLiquidationFee,
      type: InstructionInputType.INPUT,
      inputType: 'number',
      name: 'baseLiquidationFee',
    },
    {
      label: `Init Overall Asset Weight`,
      subtitle: getAdditionalLabelInfo('initOverallAssetWeight'),
      initialValue: form.initOverallAssetWeight,
      type: InstructionInputType.INPUT,
      inputType: 'number',
      name: 'initOverallAssetWeight',
    },
    {
      label: `Maker Fee`,
      subtitle: getAdditionalLabelInfo('makerFee'),
      initialValue: form.makerFee,
      type: InstructionInputType.INPUT,
      inputType: 'number',
      name: 'makerFee',
    },
    {
      label: `Taker Fee`,
      subtitle: getAdditionalLabelInfo('takerFee'),
      initialValue: form.takerFee,
      type: InstructionInputType.INPUT,
      inputType: 'number',
      name: 'takerFee',
    },
    {
      label: `Fee Penalty`,
      subtitle: getAdditionalLabelInfo('feePenalty'),
      initialValue: form.feePenalty,
      type: InstructionInputType.INPUT,
      inputType: 'number',
      name: 'feePenalty',
    },
    {
      label: `Group Insurance Fund`,
      subtitle: getAdditionalLabelInfo('groupInsuranceFund'),
      initialValue: form.groupInsuranceFund,
      type: InstructionInputType.SWITCH,
      name: 'groupInsuranceFund',
    },
    {
      label: `Reduce Only`,
      subtitle: getAdditionalLabelInfo('reduceOnly'),
      initialValue: form.reduceOnly,
      type: InstructionInputType.SWITCH,
      name: 'reduceOnly',
    },
    {
      label: `Reset Stable Price`,
      subtitle: getAdditionalLabelInfo('resetStablePrice'),
      initialValue: form.resetStablePrice,
      type: InstructionInputType.SWITCH,
      name: 'resetStablePrice',
    },
    {
      label: `Settle Fee Flat`,
      subtitle: getAdditionalLabelInfo('settleFeeFlat'),
      initialValue: form.settleFeeFlat,
      type: InstructionInputType.INPUT,
      inputType: 'number',
      name: 'settleFeeFlat',
    },
    {
      label: `Settle Fee Amount Threshold`,
      subtitle: getAdditionalLabelInfo('settleFeeAmountThreshold'),
      initialValue: form.settleFeeAmountThreshold,
      type: InstructionInputType.INPUT,
      inputType: 'number',
      name: 'settleFeeAmountThreshold',
    },
    {
      label: `Settle Fee Fraction Low Health`,
      subtitle: getAdditionalLabelInfo('settleFeeFractionLowHealth'),
      initialValue: form.settleFeeFractionLowHealth,
      type: InstructionInputType.INPUT,
      inputType: 'number',
      name: 'settleFeeFractionLowHealth',
    },
    {
      label: `Stable Price Delay Interval Seconds`,
      subtitle: getAdditionalLabelInfo('stablePriceDelayIntervalSeconds'),
      initialValue: form.stablePriceDelayIntervalSeconds,
      type: InstructionInputType.INPUT,
      inputType: 'number',
      name: 'stablePriceDelayIntervalSeconds',
    },
    {
      label: `Settle Pnl Limit Factor`,
      subtitle: getAdditionalLabelInfo('settlePnlLimitFactor'),
      initialValue: form.settlePnlLimitFactor,
      type: InstructionInputType.INPUT,
      inputType: 'number',
      name: 'settlePnlLimitFactor',
    },
    {
      label: `Settle Pnl Limit Window Size`,
      subtitle: getAdditionalLabelInfo('settlePnlLimitWindowSize'),
      initialValue: form.settlePnlLimitWindowSize,
      type: InstructionInputType.INPUT,
      inputType: 'number',
      name: 'settlePnlLimitWindowSize',
    },
    {
      label: `Min Funding`,
      subtitle: getAdditionalLabelInfo('minFunding'),
      initialValue: form.minFunding,
      type: InstructionInputType.INPUT,
      inputType: 'number',
      name: 'minFunding',
    },
    {
      label: `Max Funding`,
      subtitle: getAdditionalLabelInfo('maxFunding'),
      initialValue: form.maxFunding,
      type: InstructionInputType.INPUT,
      inputType: 'number',
      name: 'maxFunding',
    },
    {
      label: `Impact Quantity`,
      subtitle: getAdditionalLabelInfo('impactQuantity'),
      initialValue: form.impactQuantity,
      type: InstructionInputType.INPUT,
      inputType: 'number',
      name: 'impactQuantity',
    },
    {
      label: `Positive Pnl Liquidation Fee`,
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

export default PerpEdit
