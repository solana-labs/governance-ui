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
import { BN } from '@blockworks-foundation/mango-client'
import { AccountType, AssetAccount } from '@utils/uiTypes/assets'
import InstructionForm, {
  InstructionInput,
  InstructionInputType,
} from '../../FormCreator'
import UseMangoV4 from '@hooks/useMangoV4'

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
  settleTokenIndex: number
  settlePnlLimitFactor: number
  settlePnlLimitWindowSize: number
}

const PerpCreate = ({
  index,
  governance,
}: {
  index: number
  governance: ProgramAccount<Governance> | null
}) => {
  const wallet = useWalletStore((s) => s.current)
  const { getClient, GROUP } = UseMangoV4()
  const { realmInfo } = useRealm()
  const { assetAccounts } = useGovernanceAssets()
  const governedProgramAccounts = assetAccounts.filter(
    (x) => x.type === AccountType.SOL
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
    maintPnlAssetWeight: 1,
    initPnlAssetWeight: 1,
    liquidationFee: 0.0125,
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
      const client = await getClient(connection, wallet)
      const group = await client.getGroup(GROUP)
      const bids = new Keypair()
      const asks = new Keypair()
      const eventQueue = new Keypair()
      const perpMarketIndex = group.perpMarketsMapByName.size
      const bookSideSize = client.program.coder.accounts.size(
        (client.program.account.bookSide as any)._idlAccount
      )
      const eventQueueSize = client.program.coder.accounts.size(
        (client.program.account.eventQueue as any)._idlAccount
      )
      prerequisiteInstructionsSigners = [bids, asks, eventQueue]
      prerequisiteInstructions = [
        SystemProgram.createAccount({
          programId: client.program.programId,
          space: bookSideSize,
          lamports: await connection.current.getMinimumBalanceForRentExemption(
            bookSideSize
          ),
          fromPubkey: wallet.publicKey,
          newAccountPubkey: bids.publicKey,
        }),
        SystemProgram.createAccount({
          programId: client.program.programId,
          space: bookSideSize,
          lamports: await connection.current.getMinimumBalanceForRentExemption(
            bookSideSize
          ),
          fromPubkey: wallet.publicKey,
          newAccountPubkey: asks.publicKey,
        }),
        SystemProgram.createAccount({
          programId: client.program.programId,
          space: eventQueueSize,
          lamports: await connection.current.getMinimumBalanceForRentExemption(
            eventQueueSize
          ),
          fromPubkey: wallet.publicKey,
          newAccountPubkey: eventQueue.publicKey,
        }),
      ]
      const ix = await client.program.methods
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
          Number(form.maintPnlAssetWeight),
          Number(form.initPnlAssetWeight),
          Number(form.liquidationFee),
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
          new BN(form.settlePnlLimitWindowSize)
        )
        .accounts({
          group: group.publicKey,
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
      options: governedProgramAccounts,
    },
    {
      label: 'Perp Name',
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
      label: 'Quote Lot Size',
      initialValue: form.quoteLotSize,
      type: InstructionInputType.INPUT,
      inputType: 'number',
      name: 'quoteLotSize',
    },
    {
      label: 'Base Lot Size',
      initialValue: form.baseLotSize,
      type: InstructionInputType.INPUT,
      inputType: 'number',
      name: 'baseLotSize',
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
      label: 'Settle Token Index',
      initialValue: form.settleTokenIndex,
      type: InstructionInputType.INPUT,
      inputType: 'number',
      name: 'settleTokenIndex',
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

export default PerpCreate
