/* eslint-disable @typescript-eslint/no-non-null-assertion */
import React, { useContext, useEffect, useState } from 'react'
import useRealm from '@hooks/useRealm'
import { PublicKey } from '@solana/web3.js'
import * as yup from 'yup'
import { isFormValid } from '@utils/formValidation'
import {
  UiInstruction,
  MangoRemovePerpMarketForm,
} from '@utils/uiTypes/proposalCreationTypes'
import { NewProposalContext } from '../../../new'
import useGovernanceAssets from '@hooks/useGovernanceAssets'
import { Governance } from '@solana/spl-governance'
import { ProgramAccount } from '@solana/spl-governance'
import useWalletStore from 'stores/useWalletStore'
import { serializeInstructionToBase64 } from '@solana/spl-governance'
import {
  IDS,
  Config,
  MangoClient,
  makeRemovePerpMarketInstruction,
} from '@blockworks-foundation/mango-client'
import { AccountType } from '@utils/uiTypes/assets'
import InstructionForm, {
  InstructionInput,
  InstructionInputType,
} from '../FormCreator'

const MakeRemovePerpMarket = ({
  index,
  governance,
}: {
  index: number
  governance: ProgramAccount<Governance> | null
}) => {
  const wallet = useWalletStore((s) => s.current)
  const { realmInfo } = useRealm()
  const { assetAccounts } = useGovernanceAssets()
  const governedProgramAccounts = assetAccounts.filter(
    (x) => x.type === AccountType.PROGRAM
  )
  const connection = useWalletStore((s) => s.connection)
  const shouldBeGoverned = index !== 0 && governance
  const programId: PublicKey | undefined = realmInfo?.programId
  const [form, setForm] = useState<MangoRemovePerpMarketForm>({
    governedAccount: null,
    mangoGroup: null,
    marketPk: null,
    adminPk: '',
    mngoDaoVaultPk: '',
    mngoVaultPk: null,
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
      const groupConfig = Config.ids().groups.find((c) =>
        c.publicKey.equals(new PublicKey(form.mangoGroup!.value))
      )!
      const client = new MangoClient(
        connection.current,
        groupConfig.mangoProgramId
      )
      const perpMarketInfo = groupConfig.perpMarkets.find(
        (x) => x.publicKey.toBase58() === form.marketPk?.value
      )
      const group = await client.getMangoGroup(groupConfig.publicKey)
      const perpMarket = await group.loadPerpMarket(
        connection.current,
        perpMarketInfo!.marketIndex,
        perpMarketInfo!.baseDecimals,
        perpMarketInfo!.quoteDecimals
      )

      //Mango instruction call and serialize
      const removePerpMarketIx = makeRemovePerpMarketInstruction(
        groupConfig.mangoProgramId,
        new PublicKey(form.mangoGroup!.value),
        new PublicKey(form.adminPk),
        perpMarket.publicKey,
        perpMarket.eventQueue,
        perpMarket.bids,
        perpMarket.asks,
        perpMarket.mngoVault,
        new PublicKey(form.mngoDaoVaultPk),
        new PublicKey(form.adminPk)
      )

      serializedInstruction = serializeInstructionToBase64(removePerpMarketIx)
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
  }, [realmInfo?.programId])

  useEffect(() => {
    handleSetInstructions(
      { governedAccount: form.governedAccount?.governance, getInstruction },
      index
    )
  }, [form])
  const schema = yup.object().shape({
    mangoGroup: yup.object().nullable().required('Mango group is required'),
    marketIndex: yup.object().nullable().required('Market index is required'),
    adminPk: yup.string().required('Admin Pk is required'),
    marketMode: yup.object().nullable().required('Market Mode is required'),
    marketType: yup.object().nullable().required('Market Type is required'),
    governedAccount: yup
      .object()
      .nullable()
      .required('Program governed account is required'),
  })
  const getOptionsForMarketIndex = () => {
    const currentMangoGroup = IDS.groups.find(
      (x) => x.publicKey === form.mangoGroup?.value
    )!
    return form.mangoGroup
      ? currentMangoGroup['perpMarkets'].map((x) => {
          return {
            name: x.name,
            value: x.publicKey,
          }
        })
      : []
  }
  const inputs: InstructionInput[] = [
    {
      label: 'Governance',
      initialValue: form.governedAccount,
      name: 'governedAccount',
      type: InstructionInputType.GOVERNED_ACCOUNT,
      shouldBeGoverned: shouldBeGoverned as any,
      governance: form.governedAccount?.governance,
      options: governedProgramAccounts,
    },
    {
      label: 'Mango group',
      initialValue: form.mangoGroup,
      type: InstructionInputType.SELECT,
      name: 'mangoGroup',
      options: IDS.groups.map((x) => {
        return { name: x.name, value: x.publicKey }
      }),
    },
    {
      label: 'Market',
      initialValue: form.marketPk,
      type: InstructionInputType.SELECT,
      name: 'marketPk',
      options: getOptionsForMarketIndex(),
    },
    {
      label: 'Admin PublicKey',
      initialValue: form.adminPk,
      type: InstructionInputType.INPUT,
      name: 'adminPk',
    },
    {
      label: 'Mango DAO Vault PublicKey',
      initialValue: form.mngoDaoVaultPk,
      type: InstructionInputType.INPUT,
      name: 'mngoDaoVaultPk',
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

export default MakeRemovePerpMarket
