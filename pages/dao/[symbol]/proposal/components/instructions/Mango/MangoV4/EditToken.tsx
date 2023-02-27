/* eslint-disable @typescript-eslint/no-non-null-assertion */
import React, { useContext, useEffect, useState } from 'react'
import useRealm from '@hooks/useRealm'
import { AccountMeta, PublicKey } from '@solana/web3.js'
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
import UseMangoV4 from '@hooks/useMangoV4'
import { getChangedValues, getNullOrTransform } from '@utils/mangoV4Tools'
import { BN } from '@coral-xyz/anchor'

type NamePkVal = {
  name: string
  value: PublicKey
}

interface EditTokenForm {
  governedAccount: AssetAccount | null
  token: null | NamePkVal
  oraclePk: string
  oracleConfFilter: number
  mintPk: string
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
  groupInsuranceFund: boolean
  stablePriceDelayIntervalSeconds: number
  stablePriceDelayGrowthLimit: number
  stablePriceGrowthLimit: number
  minVaultToDepositsRatio: number
  netBorrowLimitPerWindowQuote: number
  netBorrowLimitWindowSizeTs: number
  borrowWeightScaleStartQuote: number
  depositWeightScaleStartQuote: number
  resetStablePrice: boolean
  resetNetBorrowLimit: boolean
  reduceOnly: boolean
}

const defaultFormValues = {
  governedAccount: null,
  token: null,
  oraclePk: '',
  oracleConfFilter: 0,
  mintPk: '',
  name: '',
  adjustmentFactor: 0,
  util0: 0,
  rate0: 0,
  util1: 0,
  rate1: 0,
  maxRate: 0,
  loanFeeRate: 0,
  loanOriginationFeeRate: 0,
  maintAssetWeight: 0,
  initAssetWeight: 0,
  maintLiabWeight: 0,
  initLiabWeight: 0,
  liquidationFee: 0,
  stablePriceDelayIntervalSeconds: 0,
  stablePriceDelayGrowthLimit: 0,
  stablePriceGrowthLimit: 0,
  minVaultToDepositsRatio: 0,
  netBorrowLimitPerWindowQuote: 0,
  netBorrowLimitWindowSizeTs: 0,
  borrowWeightScaleStartQuote: 0,
  depositWeightScaleStartQuote: 0,
  groupInsuranceFund: false,
  resetStablePrice: false,
  resetNetBorrowLimit: false,
  reduceOnly: false,
}

const EditToken = ({
  index,
  governance,
}: {
  index: number
  governance: ProgramAccount<Governance> | null
}) => {
  const wallet = useWalletStore((s) => s.current)
  const { getAdditionalLabelInfo, mangoClient, mangoGroup } = UseMangoV4()
  const { realmInfo } = useRealm()
  const { assetAccounts } = useGovernanceAssets()
  const solAccounts = assetAccounts.filter(
    (x) =>
      x.type === AccountType.SOL &&
      ((mangoGroup?.admin &&
        x.extensions.transferAddress?.equals(mangoGroup.admin)) ||
        (mangoGroup?.securityAdmin &&
          x.extensions.transferAddress?.equals(mangoGroup.securityAdmin)))
  )
  const shouldBeGoverned = !!(index !== 0 && governance)
  const [tokens, setTokens] = useState<NamePkVal[]>([])
  const programId: PublicKey | undefined = realmInfo?.programId
  const [originalFormValues, setOriginalFormValues] = useState<EditTokenForm>({
    ...defaultFormValues,
  })
  const [form, setForm] = useState<EditTokenForm>({
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
      const bank = mangoGroup!.getFirstBankByMint(new PublicKey(form.mintPk))
      const mintInfo = mangoGroup!.mintInfosMapByTokenIndex.get(
        bank.tokenIndex
      )!
      const values = getChangedValues<EditTokenForm>(originalFormValues, form)
      //Mango instruction call and serialize
      const ix = await mangoClient!.program.methods
        .tokenEdit(
          getNullOrTransform(values.oraclePk, PublicKey),
          {
            confFilter: Number(form.oracleConfFilter),
            maxStalenessSlots: null,
          },
          values.groupInsuranceFund,
          {
            adjustmentFactor: Number(form.adjustmentFactor),
            util0: Number(form.util0),
            rate0: Number(form.rate0),
            util1: Number(form.util1),
            rate1: Number(form.rate1),
            maxRate: Number(form.maxRate),
          },
          getNullOrTransform(values.loanFeeRate, null, Number),
          getNullOrTransform(values.loanOriginationFeeRate, null, Number),
          getNullOrTransform(values.maintAssetWeight, null, Number),
          getNullOrTransform(values.initAssetWeight, null, Number),
          getNullOrTransform(values.maintLiabWeight, null, Number),
          getNullOrTransform(values.initLiabWeight, null, Number),
          getNullOrTransform(values.liquidationFee, null, Number),
          getNullOrTransform(
            values.stablePriceDelayIntervalSeconds,
            null,
            Number
          ),
          getNullOrTransform(values.stablePriceDelayGrowthLimit, null, Number),
          getNullOrTransform(values.stablePriceGrowthLimit, null, Number),
          getNullOrTransform(values.minVaultToDepositsRatio, null, Number),
          getNullOrTransform(values.netBorrowLimitPerWindowQuote, BN),
          getNullOrTransform(values.netBorrowLimitWindowSizeTs, BN),
          getNullOrTransform(values.borrowWeightScaleStartQuote, null, Number),
          getNullOrTransform(values.depositWeightScaleStartQuote, null, Number),
          values.resetStablePrice,
          values.resetNetBorrowLimit,
          values.reduceOnly
        )
        .accounts({
          group: mangoGroup!.publicKey,
          oracle: form.oraclePk ? new PublicKey(form.oraclePk) : bank.oracle,
          admin: form.governedAccount.extensions.transferAddress,
          mintInfo: mintInfo.publicKey,
        })
        .remainingAccounts([
          {
            pubkey: bank.publicKey,
            isWritable: true,
            isSigner: false,
          } as AccountMeta,
        ])
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
  useEffect(() => {
    const getTokens = async () => {
      const currentTokens = [...mangoGroup!.banksMapByMint.values()].map(
        (x) => ({
          name: x[0].name,
          value: x[0].mint,
        })
      )
      setTokens(currentTokens)
    }
    if (wallet?.publicKey) {
      getTokens()
    }
  }, [mangoGroup?.publicKey.toBase58()])
  useEffect(() => {
    if (form.token && mangoGroup) {
      const currentToken = mangoGroup!.banksMapByMint.get(
        form.token.value.toBase58()
      )![0]
      const groupInsuranceFund = mangoGroup.mintInfosMapByMint.get(
        form.token.value.toBase58()
      )?.groupInsuranceFund
      const vals = {
        ...form,
        oraclePk: currentToken.oracle.toBase58(),
        oracleConfFilter: currentToken.oracleConfig.confFilter.toNumber(),
        mintPk: currentToken.mint.toBase58(),
        name: currentToken.name,
        adjustmentFactor: currentToken.adjustmentFactor.toNumber(),
        util0: currentToken.util0.toNumber(),
        rate0: currentToken.rate0.toNumber(),
        util1: currentToken.util1.toNumber(),
        rate1: currentToken.rate1.toNumber(),
        maxRate: currentToken.maxRate.toNumber(),
        loanFeeRate: currentToken.loanFeeRate.toNumber(),
        loanOriginationFeeRate: currentToken.loanOriginationFeeRate.toNumber(),
        maintAssetWeight: currentToken.maintAssetWeight.toNumber(),
        initAssetWeight: currentToken.initAssetWeight.toNumber(),
        maintLiabWeight: currentToken.maintLiabWeight.toNumber(),
        initLiabWeight: currentToken.initLiabWeight.toNumber(),
        liquidationFee: currentToken.liquidationFee.toNumber(),
        stablePriceDelayIntervalSeconds:
          currentToken.stablePriceModel.delayIntervalSeconds,
        stablePriceDelayGrowthLimit:
          currentToken.stablePriceModel.delayGrowthLimit,
        stablePriceGrowthLimit: currentToken.stablePriceModel.stableGrowthLimit,
        minVaultToDepositsRatio: currentToken.minVaultToDepositsRatio,
        netBorrowLimitPerWindowQuote: currentToken.netBorrowLimitPerWindowQuote.toNumber(),
        netBorrowLimitWindowSizeTs: currentToken.netBorrowLimitWindowSizeTs.toNumber(),
        borrowWeightScaleStartQuote: currentToken.borrowWeightScaleStartQuote,
        depositWeightScaleStartQuote: currentToken.depositWeightScaleStartQuote,
        groupInsuranceFund: !!groupInsuranceFund,
        reduceOnly: currentToken.reduceOnly,
      }
      setForm({
        ...vals,
      })
      setOriginalFormValues({ ...vals })
    }
  }, [form.token?.value.toBase58()])
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
      options: solAccounts,
    },
    {
      label: 'Tokens',
      name: 'token',
      type: InstructionInputType.SELECT,
      initialValue: form.token,
      options: tokens,
    },
    {
      label: 'Mint PublicKey',
      initialValue: form.mintPk,
      type: InstructionInputType.INPUT,
      name: 'mintPk',
    },
    {
      label: 'Oracle PublicKey',
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
      label: 'Token Name',
      initialValue: form.name,
      type: InstructionInputType.INPUT,
      name: 'name',
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
      initialValue: form.util0,
      subtitle: getAdditionalLabelInfo('util0'),
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
      label: ` Interest rate utilization point 1`,
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
      label: `Maintenance Asset Weight`,
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
      label: `Group Insurance Fund`,
      subtitle: getAdditionalLabelInfo('groupInsuranceFund'),
      initialValue: form.groupInsuranceFund,
      type: InstructionInputType.SWITCH,
      name: 'groupInsuranceFund',
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
      label: `Min Vault To Deposits Ratio`,
      subtitle: getAdditionalLabelInfo('minVaultToDepositsRatio'),
      initialValue: form.minVaultToDepositsRatio,
      type: InstructionInputType.INPUT,
      inputType: 'number',
      name: 'minVaultToDepositsRatio',
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
      label: `Net Borrow Limit Window Size Ts`,
      subtitle: getAdditionalLabelInfo('netBorrowLimitWindowSizeTs'),
      initialValue: form.netBorrowLimitWindowSizeTs,
      type: InstructionInputType.INPUT,
      inputType: 'number',
      name: 'netBorrowLimitWindowSizeTs',
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
      label: `Reset Stable Price`,
      subtitle: getAdditionalLabelInfo('resetStablePrice'),
      initialValue: form.resetStablePrice,
      type: InstructionInputType.SWITCH,
      name: 'resetStablePrice',
    },
    {
      label: `Reset Net Borrow Limit`,
      subtitle: getAdditionalLabelInfo('resetNetBorrowLimit'),
      initialValue: form.resetNetBorrowLimit,
      type: InstructionInputType.SWITCH,
      name: 'resetNetBorrowLimit',
    },
    {
      label: `Reduce Only`,
      subtitle: getAdditionalLabelInfo('reduceOnly'),
      initialValue: form.reduceOnly,
      type: InstructionInputType.SWITCH,
      name: 'reduceOnly',
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

export default EditToken
