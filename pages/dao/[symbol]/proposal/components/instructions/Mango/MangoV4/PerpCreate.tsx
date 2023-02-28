/* eslint-disable @typescript-eslint/no-non-null-assertion */
import React, { useContext, useEffect, useState } from 'react'
import useRealm from '@hooks/useRealm'
import {
  Keypair,
  PublicKey,
  SystemProgram,
  TransactionInstruction,
} from '@solana/web3.js'
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
import { BN } from '@coral-xyz/anchor'

interface PerpCreateForm {
  governedAccount: AssetAccount | null
  oraclePk: string
  name: string
  oracleConfFilter: number
  baseDecimals: number
  quoteLotSize: number
  baseLotSize: number
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
  settleTokenIndex: number
  settlePnlLimitFactor: number
  settlePnlLimitWindowSize: number
  positivePnlLiquidationFee: number
}

const PerpCreate = ({
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
  const solAccounts = assetAccounts.filter(
    (x) =>
      x.type === AccountType.SOL &&
      mangoGroup?.admin &&
      x.extensions.transferAddress?.equals(mangoGroup?.admin)
  )
  const { connection } = useWalletStore()
  const shouldBeGoverned = !!(index !== 0 && governance)
  const programId: PublicKey | undefined = realmInfo?.programId
  const [form, setForm] = useState<PerpCreateForm>({
    governedAccount: null,
    oracleConfFilter: 0.1,
    oraclePk: '',
    name: '',
    baseDecimals: 6,
    quoteLotSize: 10,
    baseLotSize: 100,
    maintBaseAssetWeight: 0.975,
    initBaseAssetWeight: 0.95,
    maintBaseLiabWeight: 1.025,
    initBaseLiabWeight: 1.05,
    maintOverallAssetWeight: 1,
    initOverallAssetWeight: 1,
    baseLiquidationFee: 0.0125,
    makerFee: -0.0001,
    takerFee: 0.0004,
    feePenalty: 5,
    minFunding: -0.05,
    maxFunding: 0.05,
    impactQuantity: 100,
    groupInsuranceFund: true,
    settleFeeFlat: 1000,
    settleFeeAmountThreshold: 1000000,
    settleFeeFractionLowHealth: 0.01,
    settleTokenIndex: 0,
    settlePnlLimitFactor: 1.0,
    settlePnlLimitWindowSize: 2 * 60 * 60,
    positivePnlLiquidationFee: 0,
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
    let prerequisiteInstructions: TransactionInstruction[] = []
    let prerequisiteInstructionsSigners: Keypair[] = []
    if (
      isValid &&
      programId &&
      form.governedAccount?.governance?.account &&
      wallet?.publicKey
    ) {
      const bids = new Keypair()
      const asks = new Keypair()
      const eventQueue = new Keypair()
      const perpMarketIndex = mangoGroup!.perpMarketsMapByName.size
      const bookSideSize = mangoClient!.program.coder.accounts.size(
        (mangoClient!.program.account.bookSide as any)._idlAccount
      )
      const eventQueueSize = mangoClient!.program.coder.accounts.size(
        (mangoClient!.program.account.eventQueue as any)._idlAccount
      )
      prerequisiteInstructionsSigners = [bids, asks, eventQueue]
      prerequisiteInstructions = [
        SystemProgram.createAccount({
          programId: mangoClient!.program.programId,
          space: bookSideSize,
          lamports: await connection.current.getMinimumBalanceForRentExemption(
            bookSideSize
          ),
          fromPubkey: wallet.publicKey,
          newAccountPubkey: bids.publicKey,
        }),
        SystemProgram.createAccount({
          programId: mangoClient!.program.programId,
          space: bookSideSize,
          lamports: await connection.current.getMinimumBalanceForRentExemption(
            bookSideSize
          ),
          fromPubkey: wallet.publicKey,
          newAccountPubkey: asks.publicKey,
        }),
        SystemProgram.createAccount({
          programId: mangoClient!.program.programId,
          space: eventQueueSize,
          lamports: await connection.current.getMinimumBalanceForRentExemption(
            eventQueueSize
          ),
          fromPubkey: wallet.publicKey,
          newAccountPubkey: eventQueue.publicKey,
        }),
      ]
      const ix = await mangoClient!.program.methods
        .perpCreateMarket(
          Number(perpMarketIndex),
          form.name,
          {
            confFilter: Number(form.oracleConfFilter),
            maxStalenessSlots: null,
          },
          Number(form.baseDecimals),
          new BN(form.quoteLotSize),
          new BN(form.baseLotSize),
          Number(form.maintBaseAssetWeight),
          Number(form.initBaseAssetWeight),
          Number(form.maintBaseLiabWeight),
          Number(form.initBaseLiabWeight),
          Number(form.maintOverallAssetWeight),
          Number(form.initOverallAssetWeight),
          Number(form.baseLiquidationFee),
          Number(form.makerFee),
          Number(form.takerFee),
          Number(form.minFunding),
          Number(form.maxFunding),
          new BN(form.impactQuantity),
          form.groupInsuranceFund,
          Number(form.feePenalty),
          Number(form.settleFeeFlat),
          Number(form.settleFeeAmountThreshold),
          Number(form.settleFeeFractionLowHealth),
          Number(form.settleTokenIndex),
          Number(form.settlePnlLimitFactor),
          new BN(form.settlePnlLimitWindowSize),
          Number(form.positivePnlLiquidationFee)
        )
        .accounts({
          group: mangoGroup!.publicKey,
          admin: form.governedAccount.extensions.transferAddress,
          oracle: new PublicKey(form.oraclePk),
          bids: bids.publicKey,
          asks: asks.publicKey,
          eventQueue: eventQueue.publicKey,
          payer: form.governedAccount.extensions.transferAddress,
        })
        .signers([bids, asks, eventQueue])
        .instruction()

      serializedInstruction = serializeInstructionToBase64(ix)
    }
    const obj: UiInstruction = {
      prerequisiteInstructions: prerequisiteInstructions,
      prerequisiteInstructionsSigners: prerequisiteInstructionsSigners,
      shouldSplitIntoSeparateTxs: true,
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
      options: solAccounts,
    },
    {
      label: 'Perp Name',
      initialValue: form.name,
      type: InstructionInputType.INPUT,
      name: 'name',
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
      label: 'Base Decimals',
      initialValue: form.baseDecimals,
      type: InstructionInputType.INPUT,
      inputType: 'number',
      name: 'baseDecimals',
    },
    {
      label: `Quote Lot Size`,
      subtitle: getAdditionalLabelInfo('quoteLotSize'),
      initialValue: form.quoteLotSize,
      type: InstructionInputType.INPUT,
      inputType: 'number',
      name: 'quoteLotSize',
    },
    {
      label: `Base Lot Size`,
      subtitle: getAdditionalLabelInfo('baseLotSize'),
      initialValue: form.baseLotSize,
      type: InstructionInputType.INPUT,
      inputType: 'number',
      name: 'baseLotSize',
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
      label: `Settle Token Index`,
      subtitle: getAdditionalLabelInfo('settleTokenIndex'),
      initialValue: form.settleTokenIndex,
      type: InstructionInputType.INPUT,
      inputType: 'number',
      name: 'settleTokenIndex',
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

export default PerpCreate
