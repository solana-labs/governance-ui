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
import { BN, I80F48 } from '@blockworks-foundation/mango-client'
import { AccountType, AssetAccount } from '@utils/uiTypes/assets'
import InstructionForm, {
  InstructionInput,
  InstructionInputType,
} from '../../FormCreator'
import UseMangoV4 from '@hooks/useMangoV4'

interface EditTokenForm {
  governedAccount: AssetAccount | null
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

const EditToken = ({
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
  const [form, setForm] = useState<EditTokenForm>({
    governedAccount: null,
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
      const bank = group.getFirstBankByMint(new PublicKey(form.mintPk))
      const mintInfo = group.mintInfosMapByTokenIndex.get(bank.tokenIndex)!
      //Mango instruction call and serialize
      const ix = await client.program.methods
        .tokenEdit(
          new PublicKey(form.oraclePk),
          {
            confFilter: {
              val: I80F48.fromNumber(Number(form.oracleConfFilter)).getData(),
            },
          } as any, // future: nested custom types dont typecheck, fix if possible?
          form.groupInsuranceFund,
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
          new BN(form.netBorrowLimitPerWindowQuote),
          new BN(form.netBorrowLimitWindowSizeTs),
          Number(form.borrowWeightScaleStartQuote),
          Number(form.depositWeightScaleStartQuote),
          form.resetStablePrice,
          form.resetNetBorrowLimit,
          form.reduceOnly
        )
        .accounts({
          group: group.publicKey,
          oracle: form.oraclePk ? new PublicKey(form.oraclePk) : bank.oracle,
          admin: ADMIN_PK,
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
      label: 'Mint Pk',
      initialValue: form.mintPk,
      type: InstructionInputType.INPUT,
      name: 'mintPk',
    },
    {
      label: 'Oracle Pk',
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
      label: 'Token Name',
      initialValue: form.name,
      type: InstructionInputType.INPUT,
      name: 'name',
    },
    {
      label: 'Adjustment Factor',
      initialValue: form.adjustmentFactor,
      type: InstructionInputType.INPUT,
      inputType: 'number',
      name: 'adjustmentFactor',
    },
    {
      label: 'Util 0',
      initialValue: form.util0,
      type: InstructionInputType.INPUT,
      inputType: 'number',
      name: 'util0',
    },
    {
      label: 'Rate 0',
      initialValue: form.rate0,
      type: InstructionInputType.INPUT,
      inputType: 'number',
      name: 'rate0',
    },
    {
      label: 'Util 1',
      initialValue: form.util1,
      type: InstructionInputType.INPUT,
      inputType: 'number',
      name: 'util1',
    },
    {
      label: 'Rate 1',
      initialValue: form.rate1,
      type: InstructionInputType.INPUT,
      inputType: 'number',
      name: 'rate1',
    },
    {
      label: 'Max Rate',
      initialValue: form.maxRate,
      type: InstructionInputType.INPUT,
      inputType: 'number',
      name: 'maxRate',
    },
    {
      label: 'Loan Fee Rate',
      initialValue: form.loanFeeRate,
      type: InstructionInputType.INPUT,
      inputType: 'number',
      name: 'loanFeeRate',
    },
    {
      label: 'Loan Origination Fee Rate',
      initialValue: form.loanOriginationFeeRate,
      type: InstructionInputType.INPUT,
      inputType: 'number',
      name: 'loanOriginationFeeRate',
    },
    {
      label: 'Maint Asset Weight',
      initialValue: form.maintAssetWeight,
      type: InstructionInputType.INPUT,
      inputType: 'number',
      name: 'maintAssetWeight',
    },
    {
      label: 'Init Asset Weight',
      initialValue: form.initAssetWeight,
      type: InstructionInputType.INPUT,
      inputType: 'number',
      name: 'initAssetWeight',
    },
    {
      label: 'Maint Liab Weight',
      initialValue: form.maintLiabWeight,
      type: InstructionInputType.INPUT,
      inputType: 'number',
      name: 'maintLiabWeight',
    },
    {
      label: 'Init Liab Weight',
      initialValue: form.initLiabWeight,
      type: InstructionInputType.INPUT,
      inputType: 'number',
      name: 'initLiabWeight',
    },
    {
      label: 'Liquidation Fee',
      initialValue: form.liquidationFee,
      type: InstructionInputType.INPUT,
      inputType: 'number',
      name: 'liquidationFee',
    },
    {
      label: 'Group Insurance Fund',
      initialValue: form.groupInsuranceFund,
      type: InstructionInputType.SWITCH,
      name: 'groupInsuranceFund',
    },
    {
      label: 'Stable Price Delay Interval Seconds',
      initialValue: form.stablePriceDelayIntervalSeconds,
      type: InstructionInputType.INPUT,
      inputType: 'number',
      name: 'stablePriceDelayIntervalSeconds',
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
      label: 'Min Vault To Deposits Ratio',
      initialValue: form.minVaultToDepositsRatio,
      type: InstructionInputType.INPUT,
      inputType: 'number',
      name: 'minVaultToDepositsRatio',
    },
    {
      label: 'Net Borrow Limit Per Window Quote',
      initialValue: form.netBorrowLimitPerWindowQuote,
      type: InstructionInputType.INPUT,
      inputType: 'number',
      name: 'netBorrowLimitPerWindowQuote',
    },
    {
      label: 'Net Borrow Limit Window Size Ts',
      initialValue: form.netBorrowLimitWindowSizeTs,
      type: InstructionInputType.INPUT,
      inputType: 'number',
      name: 'netBorrowLimitWindowSizeTs',
    },
    {
      label: 'Borrow Weight Scale Start Quote',
      initialValue: form.borrowWeightScaleStartQuote,
      type: InstructionInputType.INPUT,
      inputType: 'number',
      name: 'borrowWeightScaleStartQuote',
    },
    {
      label: 'Deposit Weight Scale Start Quote',
      initialValue: form.depositWeightScaleStartQuote,
      type: InstructionInputType.INPUT,
      inputType: 'number',
      name: 'depositWeightScaleStartQuote',
    },
    {
      label: 'Reset Stable Price',
      initialValue: form.resetStablePrice,
      type: InstructionInputType.SWITCH,
      name: 'resetStablePrice',
    },
    {
      label: 'Reset Net Borrow Limit',
      initialValue: form.resetNetBorrowLimit,
      type: InstructionInputType.SWITCH,
      name: 'resetNetBorrowLimit',
    },
    {
      label: 'Reduce Only',
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
