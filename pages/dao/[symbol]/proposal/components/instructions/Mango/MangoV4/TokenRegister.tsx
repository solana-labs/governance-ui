/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { useContext, useEffect, useState } from 'react'
import { PublicKey, SYSVAR_RENT_PUBKEY } from '@solana/web3.js'
import * as yup from 'yup'
import { isFormValid, validatePubkey } from '@utils/formValidation'
import { UiInstruction } from '@utils/uiTypes/proposalCreationTypes'
import { NewProposalContext } from '../../../../new'
import useGovernanceAssets from '@hooks/useGovernanceAssets'
import { Governance } from '@solana/spl-governance'
import { ProgramAccount } from '@solana/spl-governance'
import { serializeInstructionToBase64 } from '@solana/spl-governance'
import { AccountType, AssetAccount } from '@utils/uiTypes/assets'
import InstructionForm, { InstructionInput } from '../../FormCreator'
import { InstructionInputType } from '../../inputInstructionType'
import UseMangoV4 from '../../../../../../../../hooks/useMangoV4'
import { toNative } from '@blockworks-foundation/mango-v4'
import { BN } from '@coral-xyz/anchor'
import useWalletOnePointOh from '@hooks/useWalletOnePointOh'
import ForwarderProgram, {
  useForwarderProgramHelpers,
} from '@components/ForwarderProgram/ForwarderProgram'
import { REDUCE_ONLY_OPTIONS } from '@utils/Mango/listingTools'
import ProgramSelector from '@components/Mango/ProgramSelector'
import useProgramSelector from '@components/Mango/useProgramSelector'

interface TokenRegisterForm {
  governedAccount: AssetAccount | null
  mintPk: string
  oraclePk: string
  fallbackOracle: string
  oracleConfFilter: number
  maxStalenessSlots: string
  name: string
  adjustmentFactor: number
  util0: number
  rate0: number
  util1: number
  rate1: number
  maxRate: number
  loanFeeRate: number
  loanOriginationFeeRate: number
  maintAssetWeight: number
  initAssetWeight: number
  maintLiabWeight: number
  initLiabWeight: number
  liquidationFee: number
  minVaultToDepositsRatio: number
  netBorrowLimitWindowSizeTs: number
  netBorrowLimitPerWindowQuote: number
  tokenIndex: number
  holdupTime: number
  stablePriceDelayIntervalSeconds: number
  stablePriceGrowthLimit: number
  stablePriceDelayGrowthLimit: number
  tokenConditionalSwapTakerFeeRate: number
  tokenConditionalSwapMakerFeeRate: number
  flashLoanSwapFeeRate: number
  reduceOnly: { name: string; value: number }
  borrowWeightScaleStartQuote: number
  depositWeightScaleStartQuote: number
  interestCurveScaling: number
  interestTargetUtilization: number
  depositLimit: number
  insuranceFound: boolean
  zeroUtilRate: number
  platformLiquidationFee: number
  disableAssetLiquidation: boolean
  collateralFeePerDay: number
  tier: string
}

const TokenRegister = ({
  index,
  governance,
}: {
  index: number
  governance: ProgramAccount<Governance> | null
}) => {
  const wallet = useWalletOnePointOh()
  const programSelectorHook = useProgramSelector()
  const { mangoClient, mangoGroup, getAdditionalLabelInfo } = UseMangoV4(
    programSelectorHook.program?.val,
    programSelectorHook.program?.group
  )
  const { assetAccounts } = useGovernanceAssets()
  const forwarderProgramHelpers = useForwarderProgramHelpers()

  const solAccounts = assetAccounts.filter(
    (x) =>
      x.type === AccountType.SOL &&
      mangoGroup?.admin &&
      x.extensions.transferAddress?.equals(mangoGroup?.admin)
  )
  const shouldBeGoverned = !!(index !== 0 && governance)
  const [form, setForm] = useState<TokenRegisterForm>({
    governedAccount: null,
    mintPk: '',
    maxStalenessSlots: '',
    oraclePk: '',
    fallbackOracle: '',
    oracleConfFilter: 0.1,
    name: '',
    adjustmentFactor: 0.004, // rate parameters are chosen to be the same for all high asset weight tokens,
    util0: 0.7,
    rate0: 0.1,
    util1: 0.85,
    rate1: 0.2,
    maxRate: 2.0,
    loanFeeRate: 0.005,
    loanOriginationFeeRate: 0.0005,
    maintAssetWeight: 1,
    initAssetWeight: 1,
    maintLiabWeight: 1,
    initLiabWeight: 1,
    liquidationFee: 0,
    minVaultToDepositsRatio: 0.2,
    netBorrowLimitWindowSizeTs: 24 * 60 * 60,
    netBorrowLimitPerWindowQuote: toNative(1000000, 6).toNumber(),
    tokenIndex: 0,
    holdupTime: 0,
    stablePriceDelayIntervalSeconds: 60 * 60,
    stablePriceGrowthLimit: 0.0003,
    stablePriceDelayGrowthLimit: 0.06,
    tokenConditionalSwapTakerFeeRate: 0,
    tokenConditionalSwapMakerFeeRate: 0,
    flashLoanSwapFeeRate: 0,
    reduceOnly: REDUCE_ONLY_OPTIONS[0],
    borrowWeightScaleStartQuote: toNative(10000, 6).toNumber(),
    depositWeightScaleStartQuote: toNative(10000, 6).toNumber(),
    depositLimit: 0,
    interestTargetUtilization: 0.5,
    interestCurveScaling: 4,
    insuranceFound: false,
    zeroUtilRate: 0,
    platformLiquidationFee: 0,
    disableAssetLiquidation: false,
    collateralFeePerDay: 0,
    tier: '',
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
      const ix = await mangoClient!.program.methods
        .tokenRegister(
          Number(form.tokenIndex),
          form.name,
          {
            confFilter: Number(form.oracleConfFilter),
            maxStalenessSlots:
              form.maxStalenessSlots !== ''
                ? Number(form.maxStalenessSlots)
                : null,
          },
          {
            adjustmentFactor: Number(form.adjustmentFactor),
            util0: Number(form.util0),
            rate0: Number(form.rate0),
            util1: Number(form.util1),
            rate1: Number(form.rate1),
            maxRate: Number(form.maxRate),
          },
          Number(form.loanFeeRate),
          Number(form.loanOriginationFeeRate),
          Number(form.maintAssetWeight),
          Number(form.initAssetWeight),
          Number(form.maintLiabWeight),
          Number(form.initLiabWeight),
          Number(form.liquidationFee),
          Number(form.stablePriceDelayIntervalSeconds),
          Number(form.stablePriceDelayGrowthLimit),
          Number(form.stablePriceGrowthLimit),
          Number(form.minVaultToDepositsRatio),
          new BN(form.netBorrowLimitWindowSizeTs),
          new BN(form.netBorrowLimitPerWindowQuote),
          Number(form.borrowWeightScaleStartQuote),
          Number(form.depositWeightScaleStartQuote),
          Number(form.reduceOnly.value),
          Number(form.tokenConditionalSwapTakerFeeRate),
          Number(form.tokenConditionalSwapMakerFeeRate),
          Number(form.flashLoanSwapFeeRate),
          Number(form.interestCurveScaling),
          Number(form.interestTargetUtilization),
          form.insuranceFound,
          new BN(form.depositLimit),
          Number(form.zeroUtilRate),
          Number(form.platformLiquidationFee),
          form.disableAssetLiquidation,
          Number(form.collateralFeePerDay),
          form.tier
        )
        .accounts({
          group: mangoGroup!.publicKey,
          admin: form.governedAccount.extensions.transferAddress,
          mint: new PublicKey(form.mintPk),
          oracle: new PublicKey(form.oraclePk),
          payer: form.governedAccount.extensions.transferAddress,
          rent: SYSVAR_RENT_PUBKEY,
          fallbackOracle: new PublicKey(form.fallbackOracle),
        })
        .instruction()

      serializedInstruction = serializeInstructionToBase64(
        forwarderProgramHelpers.withForwarderWrapper(ix)
      )
    }
    const obj: UiInstruction = {
      serializedInstruction: serializedInstruction,
      isValid,
      chunkBy: 1,
      governance: form.governedAccount?.governance,
      customHoldUpTime: form.holdupTime,
    }
    return obj
  }

  useEffect(() => {
    handleSetInstructions(
      { governedAccount: form.governedAccount?.governance, getInstruction },
      index
    )
    // eslint-disable-next-line react-hooks/exhaustive-deps -- TODO please fix, it can cause difficult bugs. You might wanna check out https://bobbyhadz.com/blog/react-hooks-exhaustive-deps for info. -@asktree
  }, [
    form,
    forwarderProgramHelpers.form,
    forwarderProgramHelpers.withForwarderWrapper,
  ])
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
    mintPk: yup
      .string()
      .required()
      .test('is-valid-address1', 'Please enter a valid PublicKey', (value) =>
        value ? validatePubkey(value) : true
      ),
    name: yup.string().required(),
    tokenIndex: yup.string().required(),
  })
  useEffect(() => {
    const tokenIndex =
      !mangoGroup || mangoGroup?.banksMapByTokenIndex.size === 0
        ? 0
        : Math.max(...[...mangoGroup!.banksMapByTokenIndex.keys()]) + 1
    setForm({
      ...form,
      tokenIndex: tokenIndex,
    })
  }, [mangoGroup?.banksMapByTokenIndex.size])

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
      label: 'Instruction hold up time (days)',
      initialValue: form.holdupTime,
      type: InstructionInputType.INPUT,
      inputType: 'number',
      name: 'holdupTime',
    },
    {
      label: 'Mint PublicKey',
      initialValue: form.mintPk,
      type: InstructionInputType.INPUT,
      name: 'mintPk',
    },
    {
      label: `Oracle PublicKey`,
      initialValue: form.oraclePk,
      type: InstructionInputType.INPUT,
      name: 'oraclePk',
    },
    {
      label: `Fallback oracle`,
      initialValue: form.fallbackOracle,
      type: InstructionInputType.INPUT,
      name: 'fallbackOracle',
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
      label: 'Token Name',
      initialValue: form.name,
      type: InstructionInputType.INPUT,
      name: 'name',
    },
    {
      label: `Token Index`,
      initialValue: form.tokenIndex,
      type: InstructionInputType.INPUT,
      inputType: 'number',
      name: 'tokenIndex',
    },
    {
      label: `Interest rate adjustment factor`,
      subtitle: getAdditionalLabelInfo('adjustmentFactor'),
      initialValue: form.adjustmentFactor,
      type: InstructionInputType.INPUT,
      inputType: 'number',
      name: 'adjustmentFactor',
    },
    {
      label: `Interest rate utilization point 0`,
      subtitle: getAdditionalLabelInfo('util0'),
      initialValue: form.util0,
      type: InstructionInputType.INPUT,
      inputType: 'number',
      name: 'util0',
    },
    {
      label: `Interest rate point 0`,
      subtitle: getAdditionalLabelInfo('rate0'),
      initialValue: form.rate0,
      type: InstructionInputType.INPUT,
      inputType: 'number',
      name: 'rate0',
    },
    {
      label: `Interest rate utilization point 1`,
      subtitle: getAdditionalLabelInfo('util1'),
      initialValue: form.util1,
      type: InstructionInputType.INPUT,
      inputType: 'number',
      name: 'util1',
    },
    {
      label: `Interest rate point 1`,
      subtitle: getAdditionalLabelInfo('rate1'),
      initialValue: form.rate1,
      type: InstructionInputType.INPUT,
      inputType: 'number',
      name: 'rate1',
    },
    {
      label: `Interest rate max rate`,
      subtitle: getAdditionalLabelInfo('maxRate'),
      initialValue: form.maxRate,
      type: InstructionInputType.INPUT,
      inputType: 'number',
      name: 'maxRate',
    },
    {
      label: `Loan Fee Rate`,
      subtitle: getAdditionalLabelInfo('loanFeeRate'),
      initialValue: form.loanFeeRate,
      type: InstructionInputType.INPUT,
      inputType: 'number',
      name: 'loanFeeRate',
    },
    {
      label: `Loan Origination Fee Rate`,
      subtitle: getAdditionalLabelInfo('loanOriginationFeeRate'),
      initialValue: form.loanOriginationFeeRate,
      type: InstructionInputType.INPUT,
      inputType: 'number',
      name: 'loanOriginationFeeRate',
    },
    {
      label: 'Maintenance Asset Weight',
      subtitle: getAdditionalLabelInfo('maintAssetWeight'),
      initialValue: form.maintAssetWeight,
      type: InstructionInputType.INPUT,
      inputType: 'number',
      name: 'maintAssetWeight',
    },
    {
      label: `Init Asset Weight`,
      subtitle: getAdditionalLabelInfo('initAssetWeight'),
      initialValue: form.initAssetWeight,
      type: InstructionInputType.INPUT,
      inputType: 'number',
      name: 'initAssetWeight',
    },
    {
      label: `Maintenance Liab Weight`,
      subtitle: getAdditionalLabelInfo('maintLiabWeight'),
      initialValue: form.maintLiabWeight,
      type: InstructionInputType.INPUT,
      inputType: 'number',
      name: 'maintLiabWeight',
    },
    {
      label: `Init Liab Weight`,
      subtitle: getAdditionalLabelInfo('initLiabWeight'),
      initialValue: form.initLiabWeight,
      type: InstructionInputType.INPUT,
      inputType: 'number',
      name: 'initLiabWeight',
    },
    {
      label: `Liquidation Fee`,
      subtitle: getAdditionalLabelInfo('liquidationFee'),
      initialValue: form.liquidationFee,
      type: InstructionInputType.INPUT,
      inputType: 'number',
      name: 'liquidationFee',
    },
    {
      label: `Min Vault To Deposits Ratio`,
      subtitle: getAdditionalLabelInfo('minVaultToDepositsRatio'),
      initialValue: form.minVaultToDepositsRatio,
      type: InstructionInputType.INPUT,
      inputType: 'number',
      name: 'minVaultToDepositsRatio',
    },
    {
      label: `Net Borrow Limit Window Size`,
      subtitle: getAdditionalLabelInfo('netBorrowLimitWindowSizeTs'),
      initialValue: form.netBorrowLimitWindowSizeTs,
      type: InstructionInputType.INPUT,
      inputType: 'number',
      name: 'netBorrowLimitWindowSizeTs',
    },
    {
      label: `Net Borrow Limit Per Window Quote`,
      subtitle: getAdditionalLabelInfo('netBorrowLimitPerWindowQuote'),
      initialValue: form.netBorrowLimitPerWindowQuote,
      type: InstructionInputType.INPUT,
      inputType: 'number',
      name: 'netBorrowLimitPerWindowQuote',
    },
    {
      label: 'Reduce only',
      subtitle: getAdditionalLabelInfo('reduceOnly'),
      initialValue: form.reduceOnly,
      type: InstructionInputType.SELECT,
      options: REDUCE_ONLY_OPTIONS,
      name: 'reduceOnly',
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
      label: `Stable Price Growth Limit`,
      subtitle: getAdditionalLabelInfo('stablePriceGrowthLimit'),
      initialValue: form.stablePriceGrowthLimit,
      type: InstructionInputType.INPUT,
      inputType: 'number',
      name: 'stablePriceGrowthLimit',
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
      label: `Token Conditional Swap Taker Fee Rate`,
      subtitle: getAdditionalLabelInfo('tokenConditionalSwapTakerFeeRate'),
      initialValue: form.tokenConditionalSwapTakerFeeRate,
      type: InstructionInputType.INPUT,
      inputType: 'number',
      name: 'tokenConditionalSwapTakerFeeRate',
    },
    {
      label: `Token Conditional Swap Maker Fee Rate`,
      subtitle: getAdditionalLabelInfo('tokenConditionalSwapMakerFeeRate'),
      initialValue: form.tokenConditionalSwapMakerFeeRate,
      type: InstructionInputType.INPUT,
      inputType: 'number',
      name: 'tokenConditionalSwapMakerFeeRate',
    },
    {
      label: `Flash Loan Deposit Fee Rate`,
      subtitle: getAdditionalLabelInfo('flashLoanSwapFeeRate'),
      initialValue: form.flashLoanSwapFeeRate,
      type: InstructionInputType.INPUT,
      inputType: 'number',
      name: 'flashLoanSwapFeeRate',
    },
    {
      label: `Borrow Weight Scale Start Quote`,
      subtitle: getAdditionalLabelInfo('borrowWeightScaleStartQuote'),
      initialValue: form.borrowWeightScaleStartQuote,
      type: InstructionInputType.INPUT,
      inputType: 'number',
      name: 'borrowWeightScaleStartQuote',
    },
    {
      label: `Deposit Weight Scale Start Quote`,
      subtitle: getAdditionalLabelInfo('depositWeightScaleStartQuote'),
      initialValue: form.depositWeightScaleStartQuote,
      type: InstructionInputType.INPUT,
      inputType: 'number',
      name: 'depositWeightScaleStartQuote',
    },
    {
      label: `Interest Curve Scaling`,
      subtitle: getAdditionalLabelInfo('interestCurveScaling'),
      initialValue: form.interestCurveScaling,
      type: InstructionInputType.INPUT,
      inputType: 'number',
      name: 'interestCurveScaling',
    },
    {
      label: `Interest Target Utilization`,
      subtitle: getAdditionalLabelInfo('interestTargetUtilization'),
      initialValue: form.interestTargetUtilization,
      type: InstructionInputType.INPUT,
      inputType: 'number',
      name: 'interestTargetUtilization',
    },
    {
      label: `Deposit Limit`,
      subtitle: getAdditionalLabelInfo('depositLimit'),
      initialValue: form.depositLimit,
      type: InstructionInputType.INPUT,
      inputType: 'number',
      name: 'depositLimit',
    },
    {
      label: `Insurance Found`,
      subtitle: getAdditionalLabelInfo('insuranceFound'),
      initialValue: form.insuranceFound,
      type: InstructionInputType.SWITCH,
      name: 'insuranceFound',
    },
    {
      label: 'Zero Util Rate',
      subtitle: getAdditionalLabelInfo('zeroUtilRate'),
      initialValue: form.zeroUtilRate,
      type: InstructionInputType.INPUT,
      inputType: 'number',
      name: 'zeroUtilRate',
    },
    {
      label: 'Platform Liquidation Fee',
      subtitle: getAdditionalLabelInfo('platformLiquidationFee'),
      initialValue: form.platformLiquidationFee,
      type: InstructionInputType.INPUT,
      inputType: 'number',
      name: 'platformLiquidationFee',
    },
    {
      label: 'Disable Asset Liquidation',
      subtitle: getAdditionalLabelInfo('disableAssetLiquidation'),
      initialValue: form.disableAssetLiquidation,
      type: InstructionInputType.SWITCH,
      name: 'disableAssetLiquidation',
    },
    {
      label: 'Collateral Fee Per Day',
      subtitle: getAdditionalLabelInfo('collateralFeePerDay'),
      initialValue: form.collateralFeePerDay,
      type: InstructionInputType.INPUT,
      inputType: 'number',
      name: 'collateralFeePerDay',
    },
    {
      label: 'Token Tier',
      initialValue: form.tier,
      type: InstructionInputType.INPUT,
      name: 'tier',
    },
  ]

  return (
    <>
      <ProgramSelector
        programSelectorHook={programSelectorHook}
      ></ProgramSelector>
      {form && (
        <InstructionForm
          outerForm={form}
          setForm={setForm}
          inputs={inputs}
          setFormErrors={setFormErrors}
          formErrors={formErrors}
        ></InstructionForm>
      )}
      <ForwarderProgram {...forwarderProgramHelpers}></ForwarderProgram>
    </>
  )
}

export default TokenRegister
