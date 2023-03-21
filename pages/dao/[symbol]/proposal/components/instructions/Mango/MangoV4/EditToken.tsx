/* eslint-disable @typescript-eslint/no-non-null-assertion */
import React, { useContext, useEffect, useState } from 'react'
import { AccountMeta, PublicKey } from '@solana/web3.js'
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
import UseMangoV4 from '@hooks/useMangoV4'
import { getChangedValues, getNullOrTransform } from '@utils/mangoV4Tools'
import { BN } from '@coral-xyz/anchor'
import AdvancedOptionsDropdown from '@components/NewRealmWizard/components/AdvancedOptionsDropdown'
import Switch from '@components/Switch'

const keyToLabel = {
  oraclePk: 'Oracle',
  oracleConfFilter: 'Oracle Confidence Filter',
  maxStalenessSlots: 'Max Staleness Slots',
  mintPk: 'Mint',
  name: 'Name',
  adjustmentFactor: 'Interest rate adjustment factor',
  util0: 'Interest rate utilization point 0',
  rate0: 'Interest rate point 0',
  util1: 'Interest rate utilization point 1',
  rate1: 'Interest rate point 1',
  maxRate: 'Interest rate max rate',
  loanFeeRate: 'Loan Fee Rate',
  loanOriginationFeeRate: 'Loan Origination Fee Rate',
  maintAssetWeight: 'Maintenance Asset Weight',
  initAssetWeight: 'Init Asset Weight',
  maintLiabWeight: 'Maintenance Liab Weight',
  initLiabWeight: 'Init Liab Weight',
  liquidationFee: 'Liquidation Fee',
  groupInsuranceFund: 'Group Insurance Fund',
  stablePriceDelayIntervalSeconds: 'Stable Price Delay Interval Seconds',
  stablePriceDelayGrowthLimit: 'Stable Price Delay Growth Limit',
  stablePriceGrowthLimit: 'Stable Price Growth Limit',
  minVaultToDepositsRatio: 'Min Vault To Deposits Ratio',
  netBorrowLimitPerWindowQuote: 'Net Borrow Limit Per Window Quote',
  netBorrowLimitWindowSizeTs: 'Net Borrow Limit Window Size Ts',
  borrowWeightScaleStartQuote: 'Borrow Weight Scale Start Quote',
  depositWeightScaleStartQuote: 'Deposit Weight Scale Start Quote',
  resetStablePrice: 'Reset Stable Price',
  resetNetBorrowLimit: 'Reset Net Borrow Limit',
  reduceOnly: 'Reduce Only',
}

type NamePkVal = {
  name: string
  value: PublicKey
}

interface EditTokenForm {
  governedAccount: AssetAccount | null
  token: null | NamePkVal
  oraclePk: string
  oracleConfFilter: number
  maxStalenessSlots: number
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
  maxStalenessSlots: 0,
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
  const { assetAccounts } = useGovernanceAssets()
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
  const [tokens, setTokens] = useState<NamePkVal[]>([])
  const [originalFormValues, setOriginalFormValues] = useState<EditTokenForm>({
    ...defaultFormValues,
  })
  const [form, setForm] = useState<EditTokenForm>({
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
      const bank = mangoGroup!.getFirstBankByMint(new PublicKey(form.mintPk))
      const mintInfo = mangoGroup!.mintInfosMapByTokenIndex.get(
        bank.tokenIndex
      )!
      const values = getChangedValues<EditTokenForm>(
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

      const rateConfigs = {
        adjustmentFactor: getNullOrTransform(
          values.adjustmentFactor,
          null,
          Number
        ),
        util0: getNullOrTransform(values.util0, null, Number),
        rate0: getNullOrTransform(values.rate0, null, Number),
        util1: getNullOrTransform(values.util1, null, Number),
        rate1: getNullOrTransform(values.rate1, null, Number),
        maxRate: getNullOrTransform(values.maxRate, null, Number),
      }
      const isThereNeedOfSendingRateConfigs = Object.values(rateConfigs).filter(
        (x) => x !== null
      ).length
      //Mango instruction call and serialize
      const ix = await mangoClient!.program.methods
        .tokenEdit(
          getNullOrTransform(values.oraclePk, PublicKey),
          isThereNeedOfSendingOracleConfig
            ? {
                confFilter: Number(form.oracleConfFilter),
                maxStalenessSlots: maxStalenessSlots,
              }
            : null,
          values.groupInsuranceFund,
          isThereNeedOfSendingRateConfigs
            ? {
                adjustmentFactor: Number(form.adjustmentFactor),
                util0: Number(form.util0),
                rate0: Number(form.rate0),
                util1: Number(form.util1),
                rate1: Number(form.rate1),
                maxRate: Number(form.maxRate),
              }
            : null,
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
          values.reduceOnly,
          getNullOrTransform(values.name, null, String)
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
    handleSetInstructions(
      { governedAccount: form.governedAccount?.governance, getInstruction },
      index
    )
    // eslint-disable-next-line react-hooks/exhaustive-deps -- TODO please fix, it can cause difficult bugs. You might wanna check out https://bobbyhadz.com/blog/react-hooks-exhaustive-deps for info. -@asktree
  }, [form, forcedValues])
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
    if (wallet?.publicKey && mangoGroup) {
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
        maxStalenessSlots: currentToken.oracleConfig.maxStalenessSlots.toNumber(),
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
    mintPk: yup
      .string()
      .required()
      .test('is-valid-address1', 'Please enter a valid PublicKey', (value) =>
        value ? validatePubkey(value) : true
      ),
    oraclePk: yup
      .string()
      .required()
      .test('is-valid-address2', 'Please enter a valid PublicKey', (value) =>
        value ? validatePubkey(value) : true
      ),
    name: yup.string().required(),
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
      label: 'Token',
      name: 'token',
      type: InstructionInputType.SELECT,
      initialValue: form.token,
      options: tokens,
    },
    {
      label: keyToLabel['mintPk'],
      initialValue: form.mintPk,
      type: InstructionInputType.INPUT,
      name: 'mintPk',
    },
    {
      label: keyToLabel['oraclePk'],
      initialValue: form.oraclePk,
      type: InstructionInputType.INPUT,
      name: 'oraclePk',
    },
    {
      label: keyToLabel['confFilter'],
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
      label: keyToLabel['name'],
      initialValue: form.name,
      type: InstructionInputType.INPUT,
      name: 'name',
    },
    {
      label: keyToLabel['adjustmentFactor'],
      subtitle: getAdditionalLabelInfo('adjustmentFactor'),
      initialValue: form.adjustmentFactor,
      type: InstructionInputType.INPUT,
      inputType: 'number',
      name: 'adjustmentFactor',
    },
    {
      label: keyToLabel['util0'],
      initialValue: form.util0,
      subtitle: getAdditionalLabelInfo('util0'),
      type: InstructionInputType.INPUT,
      inputType: 'number',
      name: 'util0',
    },
    {
      label: keyToLabel['rate0'],
      subtitle: getAdditionalLabelInfo('rate0'),
      initialValue: form.rate0,
      type: InstructionInputType.INPUT,
      inputType: 'number',
      name: 'rate0',
    },
    {
      label: keyToLabel['util1'],
      subtitle: getAdditionalLabelInfo('util1'),
      initialValue: form.util1,
      type: InstructionInputType.INPUT,
      inputType: 'number',
      name: 'util1',
    },
    {
      label: keyToLabel['rate1'],
      subtitle: getAdditionalLabelInfo('rate1'),
      initialValue: form.rate1,
      type: InstructionInputType.INPUT,
      inputType: 'number',
      name: 'rate1',
    },
    {
      label: keyToLabel['maxRate'],
      subtitle: getAdditionalLabelInfo('maxRate'),
      initialValue: form.maxRate,
      type: InstructionInputType.INPUT,
      inputType: 'number',
      name: 'maxRate',
    },
    {
      label: keyToLabel['loanFeeRate'],
      subtitle: getAdditionalLabelInfo('loanFeeRate'),
      initialValue: form.loanFeeRate,
      type: InstructionInputType.INPUT,
      inputType: 'number',
      name: 'loanFeeRate',
    },
    {
      label: keyToLabel['loanOriginationFeeRate'],
      subtitle: getAdditionalLabelInfo('loanOriginationFeeRate'),
      initialValue: form.loanOriginationFeeRate,
      type: InstructionInputType.INPUT,
      inputType: 'number',
      name: 'loanOriginationFeeRate',
    },
    {
      label: keyToLabel['maintAssetWeight'],
      subtitle: getAdditionalLabelInfo('maintAssetWeight'),
      initialValue: form.maintAssetWeight,
      type: InstructionInputType.INPUT,
      inputType: 'number',
      name: 'maintAssetWeight',
    },
    {
      label: keyToLabel['initAssetWeight'],
      subtitle: getAdditionalLabelInfo('initAssetWeight'),
      initialValue: form.initAssetWeight,
      type: InstructionInputType.INPUT,
      inputType: 'number',
      name: 'initAssetWeight',
    },
    {
      label: keyToLabel['maintLiabWeight'],
      subtitle: getAdditionalLabelInfo('maintLiabWeight'),
      initialValue: form.maintLiabWeight,
      type: InstructionInputType.INPUT,
      inputType: 'number',
      name: 'maintLiabWeight',
    },
    {
      label: keyToLabel['initLiabWeight'],
      subtitle: getAdditionalLabelInfo('initLiabWeight'),
      initialValue: form.initLiabWeight,
      type: InstructionInputType.INPUT,
      inputType: 'number',
      name: 'initLiabWeight',
    },
    {
      label: keyToLabel['liquidationFee'],
      subtitle: getAdditionalLabelInfo('liquidationFee'),
      initialValue: form.liquidationFee,
      type: InstructionInputType.INPUT,
      inputType: 'number',
      name: 'liquidationFee',
    },
    {
      label: keyToLabel['groupInsuranceFund'],
      subtitle: getAdditionalLabelInfo('groupInsuranceFund'),
      initialValue: form.groupInsuranceFund,
      type: InstructionInputType.SWITCH,
      name: 'groupInsuranceFund',
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
      label: keyToLabel['minVaultToDepositsRatio'],
      subtitle: getAdditionalLabelInfo('minVaultToDepositsRatio'),
      initialValue: form.minVaultToDepositsRatio,
      type: InstructionInputType.INPUT,
      inputType: 'number',
      name: 'minVaultToDepositsRatio',
    },
    {
      label: keyToLabel['netBorrowLimitPerWindowQuote'],
      subtitle: getAdditionalLabelInfo('netBorrowLimitPerWindowQuote'),
      initialValue: form.netBorrowLimitPerWindowQuote,
      type: InstructionInputType.INPUT,
      inputType: 'number',
      name: 'netBorrowLimitPerWindowQuote',
    },
    {
      label: keyToLabel['netBorrowLimitWindowSizeTs'],
      subtitle: getAdditionalLabelInfo('netBorrowLimitWindowSizeTs'),
      initialValue: form.netBorrowLimitWindowSizeTs,
      type: InstructionInputType.INPUT,
      inputType: 'number',
      name: 'netBorrowLimitWindowSizeTs',
    },
    {
      label: keyToLabel['borrowWeightScaleStartQuote'],
      subtitle: getAdditionalLabelInfo('borrowWeightScaleStartQuote'),
      initialValue: form.borrowWeightScaleStartQuote,
      type: InstructionInputType.INPUT,
      inputType: 'number',
      name: 'borrowWeightScaleStartQuote',
    },
    {
      label: keyToLabel['depositWeightScaleStartQuote'],
      subtitle: getAdditionalLabelInfo('depositWeightScaleStartQuote'),
      initialValue: form.depositWeightScaleStartQuote,
      type: InstructionInputType.INPUT,
      inputType: 'number',
      name: 'depositWeightScaleStartQuote',
    },
    {
      label: keyToLabel['resetStablePrice'],
      subtitle: getAdditionalLabelInfo('resetStablePrice'),
      initialValue: form.resetStablePrice,
      type: InstructionInputType.SWITCH,
      name: 'resetStablePrice',
    },
    {
      label: keyToLabel['resetNetBorrowLimit'],
      subtitle: getAdditionalLabelInfo('resetNetBorrowLimit'),
      initialValue: form.resetNetBorrowLimit,
      type: InstructionInputType.SWITCH,
      name: 'resetNetBorrowLimit',
    },
    {
      label: keyToLabel['reduceOnly'],
      subtitle: getAdditionalLabelInfo('reduceOnly'),
      initialValue: form.reduceOnly,
      type: InstructionInputType.SWITCH,
      name: 'reduceOnly',
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
                .filter((x) => x !== 'token')
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

export default EditToken
