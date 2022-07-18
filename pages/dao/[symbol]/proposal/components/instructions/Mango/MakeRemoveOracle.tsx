/* eslint-disable @typescript-eslint/no-non-null-assertion */
import React, { useContext, useEffect, useState } from 'react'
import useRealm from '@hooks/useRealm'
import { PublicKey } from '@solana/web3.js'
import * as yup from 'yup'
import { isFormValid } from '@utils/formValidation'
import {
  UiInstruction,
  MangoRemoveOracleForm,
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
  makeRemoveOracleInstruction,
} from '@blockworks-foundation/mango-client'
import { AccountType } from '@utils/uiTypes/assets'
import InstructionForm, {
  InstructionInput,
  InstructionInputType,
} from '../FormCreator'
import { usePrevious } from '@hooks/usePrevious'

const MakeRemoveOracle = ({
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
  const shouldBeGoverned = index !== 0 && governance
  const programId: PublicKey | undefined = realmInfo?.programId
  const [form, setForm] = useState<MangoRemoveOracleForm>({
    governedAccount: null,
    mangoGroup: null,
    adminPk: '',
    oraclePk: null,
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

      //Mango instruction call and serialize
      const addOracleIx = makeRemoveOracleInstruction(
        groupConfig.mangoProgramId,
        new PublicKey(form.mangoGroup!.value),
        new PublicKey(form.adminPk),
        new PublicKey(form.oraclePk!.value)
      )

      serializedInstruction = serializeInstructionToBase64(addOracleIx)
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
  const previousProgramGov = usePrevious(
    form.governedAccount?.governance.pubkey.toBase58()
  )
  useEffect(() => {
    handleSetInstructions(
      { governedAccount: form.governedAccount?.governance, getInstruction },
      index
    )
    if (
      form.governedAccount?.governance.pubkey.toBase58() !== form.adminPk &&
      previousProgramGov !== form.governedAccount?.governance.pubkey.toBase58()
    ) {
      handleSetForm({
        propertyName: 'adminPk',
        value: form.governedAccount?.governance.pubkey.toBase58(),
      })
    }
  }, [form])
  const schema = yup.object().shape({
    mangoGroup: yup.object().nullable().required('Mango group is required'),
    adminPk: yup.string().required('Admin Pk is required'),
    oraclePk: yup.object().nullable().required('Oracle Pk is required'),
    governedAccount: yup
      .object()
      .nullable()
      .required('Program governed account is required'),
  })
  const getOptionsForGroup = () => {
    const currentMangoGroup = IDS.groups.find(
      (x) => x.publicKey === form.mangoGroup?.value
    )!
    return form.mangoGroup
      ? currentMangoGroup.oracles.map((x) => {
          return {
            name: `${x.symbol}: ${x.publicKey} `,
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
      governance: governance,
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
      label: 'Oracle',
      initialValue: form.oraclePk,
      type: InstructionInputType.SELECT,
      name: 'oraclePk',
      options: getOptionsForGroup(),
    },
    {
      label: 'Admin PublicKey',
      initialValue: form.adminPk,
      type: InstructionInputType.INPUT,
      name: 'adminPk',
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

export default MakeRemoveOracle
