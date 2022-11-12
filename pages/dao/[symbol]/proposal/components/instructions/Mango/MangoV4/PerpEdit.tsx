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
import { tryGetMint } from '@utils/tokens'

interface PerpEditForm {
  governedAccount: AssetAccount | null
  oracleConfFilter: number
  baseTokenName: string
  name: string
  maintAssetWeight: number
  initAssetWeight: number
  maintLiabWeight: number
  initLiabWeight: number
  liquidationFee: number
  makerFee: number
  takerFee: number
  minFunding: number
  maxFunding: number
  impactQuantity: number
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
  const shouldBeGoverned = index !== 0 && governance
  const programId: PublicKey | undefined = realmInfo?.programId
  const [form, setForm] = useState<PerpEditForm>({
    governedAccount: null,
    oracleConfFilter: 0,
    baseTokenName: '',
    name: '',
    maintAssetWeight: 0,
    initAssetWeight: 0,
    maintLiabWeight: 0,
    initLiabWeight: 0,
    liquidationFee: 0,
    makerFee: 0,
    takerFee: 0,
    minFunding: 0,
    maxFunding: 0,
    impactQuantity: 0,
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
      const bank = group.banksMap.get(form.baseTokenName.toUpperCase())!
      const mintInfo = group.mintInfosMap.get(bank.tokenIndex)!
      const mint = await tryGetMint(connection.current, mintInfo.mint)
      const perpMarket = group.perpMarketsMap.get(form.name)!
      //Mango instruction call and serialize

      //TODO dao sol account as payer
      const ix = await client.program.methods
        .perpEditMarket(
          bank.oracle,
          {
            confFilter: {
              val: I80F48.fromNumber(form.oracleConfFilter).getData(),
            },
          } as any, // future: nested custom types dont typecheck, fix if possible?
          bank.tokenIndex,
          mint!.account.decimals!,
          Number(form.maintAssetWeight),
          Number(form.initAssetWeight),
          Number(form.maintLiabWeight),
          Number(form.initLiabWeight),
          Number(form.liquidationFee),
          Number(form.makerFee),
          Number(form.takerFee),
          Number(form.minFunding),
          Number(form.maxFunding),
          new BN(form.impactQuantity)
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
      label: 'Base token name',
      initialValue: form.baseTokenName,
      type: InstructionInputType.INPUT,
      name: 'baseTokenName',
    },

    {
      label: 'Oracle Configuration Filter',
      initialValue: form.oracleConfFilter,
      type: InstructionInputType.INPUT,
      inputType: 'number',
      name: 'oracleConfFilter',
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
