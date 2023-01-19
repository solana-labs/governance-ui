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
import { BN, I80F48 } from '@blockworks-foundation/mango-client'
import { AccountType, AssetAccount } from '@utils/uiTypes/assets'
import InstructionForm, {
  InstructionInput,
  InstructionInputType,
} from '../../FormCreator'
import UseMangoV4 from '../../../../../../../../hooks/useMangoV4'

interface PerpEditForm {
  governedAccount: AssetAccount | null
  oraclePk: ''
  name: ''
  oracleConfFilter: number
  baseDecimals: number
  maintBaseAssetWeight: number
  initBaseAssetWeight: number
  maintBaseLiabWeight: number
  initBaseLiabWeight: number
  maintPnlAssetWeight: number
  initPnlAssetWeight: number
  liquidationFee: number
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
}

const PerpEdit = ({
  index,
  governance,
}: {
  index: number
  governance: ProgramAccount<Governance> | null
}) => {
  const wallet = useWalletStore((s) => s.current)
  const { getClient, ADMIN_PK, GROUP_NUM } = UseMangoV4()
  const { realmInfo } = useRealm()
  const { assetAccounts } = useGovernanceAssets()
  const governedProgramAccounts = assetAccounts.filter(
    (x) => x.type === AccountType.PROGRAM
  )
  const { connection } = useWalletStore()
  const shouldBeGoverned = !!(index !== 0 && governance)
  const programId: PublicKey | undefined = realmInfo?.programId
  const [form, setForm] = useState<PerpEditForm>({
    governedAccount: null,
    oraclePk: '',
    name: '',
    oracleConfFilter: 0,
    baseDecimals: 0,
    maintBaseAssetWeight: 0,
    initBaseAssetWeight: 0,
    maintBaseLiabWeight: 0,
    initBaseLiabWeight: 0,
    maintPnlAssetWeight: 0,
    initPnlAssetWeight: 0,
    liquidationFee: 0,
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
      const client = await getClient(connection, wallet)
      const group = await client.getGroupForCreator(ADMIN_PK, GROUP_NUM)
      const perpMarket = group.perpMarketsMapByName.get(form.name)!
      //Mango instruction call and serialize

      //TODO dao sol account as payer
      const ix = await client.program.methods
        .perpEditMarket(
          new PublicKey(form.oraclePk),
          {
            confFilter: {
              val: I80F48.fromNumber(Number(form.oracleConfFilter)).getData(),
            },
          } as any,
          form.baseDecimals,
          form.maintBaseAssetWeight,
          form.initBaseAssetWeight,
          form.maintBaseLiabWeight,
          form.initBaseLiabWeight,
          form.maintPnlAssetWeight,
          form.initPnlAssetWeight,
          form.liquidationFee,
          form.makerFee,
          form.takerFee,
          form.minFunding,
          form.maxFunding,
          form.impactQuantity !== null ? new BN(form.impactQuantity) : null,
          form.groupInsuranceFund,
          form.feePenalty,
          form.settleFeeFlat,
          form.settleFeeAmountThreshold,
          form.settleFeeFractionLowHealth,
          form.stablePriceDelayIntervalSeconds,
          form.stablePriceDelayGrowthLimit,
          form.stablePriceGrowthLimit,
          form.settlePnlLimitFactor,
          form.settlePnlLimitWindowSize !== null
            ? new BN(form.settlePnlLimitWindowSize)
            : null,
          form.reduceOnly
        )
        .accounts({
          group: group.publicKey,
          admin: ADMIN_PK,
          perpMarket: perpMarket.publicKey,
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
  const inputs: InstructionInput[] = [
    {
      label: 'Governance',
      initialValue: form.governedAccount,
      name: 'governedAccount',
      type: InstructionInputType.GOVERNED_ACCOUNT,
      shouldBeGoverned: shouldBeGoverned as any,
      governance: governance,
      options: governedProgramAccounts,
    },
    {
      label: 'Token Name',
      initialValue: form.name,
      type: InstructionInputType.INPUT,
      name: 'name',
    },
    {
      label: 'Oracle',
      initialValue: form.oraclePk,
      type: InstructionInputType.INPUT,
      name: 'oraclePk',
    },

    {
      label: 'Oracle Configuration Filter',
      initialValue: form.oracleConfFilter,
      type: InstructionInputType.INPUT,
      inputType: 'number',
      name: 'oracleConfFilter',
    },
    {
      label: 'Base Decimals',
      initialValue: form.baseDecimals,
      type: InstructionInputType.INPUT,
      inputType: 'number',
      name: 'baseDecimals',
    },
    {
      label: 'Stable Price Delay Growth Limit',
      initialValue: form.stablePriceDelayGrowthLimit,
      type: InstructionInputType.INPUT,
      inputType: 'number',
      name: 'stablePriceDelayGrowthLimit',
    },
    {
      label: 'Stable Price Growth Limit',
      initialValue: form.stablePriceGrowthLimit,
      type: InstructionInputType.INPUT,
      inputType: 'number',
      name: 'stablePriceGrowthLimit',
    },
    {
      label: 'Maint Base Asset Weight',
      initialValue: form.maintBaseAssetWeight,
      type: InstructionInputType.INPUT,
      inputType: 'number',
      name: 'maintBaseAssetWeight',
    },
    {
      label: 'Init Base Asset Weight',
      initialValue: form.initBaseAssetWeight,
      type: InstructionInputType.INPUT,
      inputType: 'number',
      name: 'initBaseAssetWeight',
    },
    {
      label: 'Maint Base Liab Weight',
      initialValue: form.maintBaseLiabWeight,
      type: InstructionInputType.INPUT,
      inputType: 'number',
      name: 'maintBaseLiabWeight',
    },
    {
      label: 'Init Base Liab Weight',
      initialValue: form.initBaseLiabWeight,
      type: InstructionInputType.INPUT,
      inputType: 'number',
      name: 'initBaseLiabWeight',
    },
    {
      label: 'Maint Base Liab Weight',
      initialValue: form.maintBaseLiabWeight,
      type: InstructionInputType.INPUT,
      inputType: 'number',
      name: 'maintBaseLiabWeight',
    },
    {
      label: 'Maint Pnl Asset Weight',
      initialValue: form.maintPnlAssetWeight,
      type: InstructionInputType.INPUT,
      inputType: 'number',
      name: 'maintPnlAssetWeight',
    },
    {
      label: 'Liquidation Fee',
      initialValue: form.liquidationFee,
      type: InstructionInputType.INPUT,
      inputType: 'number',
      name: 'liquidationFee',
    },
    {
      label: 'Init Pnl Asset Weight',
      initialValue: form.initPnlAssetWeight,
      type: InstructionInputType.INPUT,
      inputType: 'number',
      name: 'initPnlAssetWeight',
    },
    {
      label: 'Maker Fee',
      initialValue: form.makerFee,
      type: InstructionInputType.INPUT,
      inputType: 'number',
      name: 'makerFee',
    },
    {
      label: 'Taker Fee',
      initialValue: form.takerFee,
      type: InstructionInputType.INPUT,
      inputType: 'number',
      name: 'takerFee',
    },
    {
      label: 'Fee Penalty',
      initialValue: form.feePenalty,
      type: InstructionInputType.INPUT,
      inputType: 'number',
      name: 'feePenalty',
    },
    {
      label: 'Group Insurance Fund',
      initialValue: form.groupInsuranceFund,
      type: InstructionInputType.SWITCH,
      name: 'groupInsuranceFund',
    },
    {
      label: 'Reduce Only',
      initialValue: form.reduceOnly,
      type: InstructionInputType.SWITCH,
      name: 'reduceOnly',
    },
    {
      label: 'Settle Fee Flat',
      initialValue: form.settleFeeFlat,
      type: InstructionInputType.INPUT,
      inputType: 'number',
      name: 'settleFeeFlat',
    },
    {
      label: 'Settle Fee Amount Threshold',
      initialValue: form.settleFeeAmountThreshold,
      type: InstructionInputType.INPUT,
      inputType: 'number',
      name: 'settleFeeAmountThreshold',
    },
    {
      label: 'Settle Fee Fraction Low Health',
      initialValue: form.settleFeeFractionLowHealth,
      type: InstructionInputType.INPUT,
      inputType: 'number',
      name: 'settleFeeFractionLowHealth',
    },
    {
      label: 'Stable Price Delay Interval Seconds',
      initialValue: form.stablePriceDelayIntervalSeconds,
      type: InstructionInputType.INPUT,
      inputType: 'number',
      name: 'stablePriceDelayIntervalSeconds',
    },
    {
      label: 'Settle Pnl Limit Factor',
      initialValue: form.settlePnlLimitFactor,
      type: InstructionInputType.INPUT,
      inputType: 'number',
      name: 'settlePnlLimitFactor',
    },
    {
      label: 'Settle Pnl Limit Window Size',
      initialValue: form.settlePnlLimitWindowSize,
      type: InstructionInputType.INPUT,
      inputType: 'number',
      name: 'settlePnlLimitWindowSize',
    },
    {
      label: 'Min Funding',
      initialValue: form.minFunding,
      type: InstructionInputType.INPUT,
      inputType: 'number',
      name: 'minFunding',
    },
    {
      label: 'Max Funding',
      initialValue: form.maxFunding,
      type: InstructionInputType.INPUT,
      inputType: 'number',
      name: 'maxFunding',
    },
    {
      label: 'Impact Quantity',
      initialValue: form.impactQuantity,
      type: InstructionInputType.INPUT,
      inputType: 'number',
      name: 'impactQuantity',
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
