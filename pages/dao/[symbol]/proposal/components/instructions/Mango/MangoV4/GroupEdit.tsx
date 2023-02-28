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
import { AccountType, AssetAccount } from '@utils/uiTypes/assets'
import InstructionForm, {
  InstructionInput,
  InstructionInputType,
} from '../../FormCreator'
import UseMangoV4 from '../../../../../../../../hooks/useMangoV4'
import { BN } from '@coral-xyz/anchor'
import { getChangedValues, getNullOrTransform } from '@utils/mangoV4Tools'

type GroupEditForm = {
  governedAccount: AssetAccount | null
  admin: string
  fastListingAdmin: string
  securityAdmin: string
  testing: number
  version: number
  depositLimitQuote: number
}

const defaultFormValues = {
  governedAccount: null,
  admin: '',
  fastListingAdmin: '',
  securityAdmin: '',
  testing: 0,
  version: 0,
  depositLimitQuote: 0,
}

const GroupEdit = ({
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
      ((mangoGroup?.admin &&
        x.extensions.transferAddress?.equals(mangoGroup.admin)) ||
        (mangoGroup?.securityAdmin &&
          x.extensions.transferAddress?.equals(mangoGroup.securityAdmin)))
  )
  const shouldBeGoverned = !!(index !== 0 && governance)
  const programId: PublicKey | undefined = realmInfo?.programId
  const [originalFormValues, setOriginalFormValues] = useState<GroupEditForm>({
    ...defaultFormValues,
  })
  const [form, setForm] = useState<GroupEditForm>({ ...defaultFormValues })
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
      const values = getChangedValues<GroupEditForm>(originalFormValues, form)
      //Mango instruction call and serialize
      const ix = await mangoClient!.program.methods
        .groupEdit(
          getNullOrTransform(values.admin, PublicKey),
          getNullOrTransform(values.fastListingAdmin, PublicKey),
          getNullOrTransform(values.securityAdmin, PublicKey),
          getNullOrTransform(values.testing, null, Number),
          getNullOrTransform(values.version, null, Number),
          getNullOrTransform(values.depositLimitQuote, BN)
        )
        .accounts({
          group: mangoGroup!.publicKey,
          admin: mangoGroup!.admin,
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
  useEffect(() => {
    const getGroupParams = async () => {
      const vals = {
        ...form,
        admin: mangoGroup!.admin.toBase58(),
        fastListingAdmin: mangoGroup!.fastListingAdmin.toBase58(),
        securityAdmin: mangoGroup!.securityAdmin.toBase58(),
        testing: mangoGroup!.testing,
        version: mangoGroup!.version,
      }
      setForm({
        ...vals,
      })
      setOriginalFormValues({ ...vals })
    }
    if (mangoGroup) {
      getGroupParams()
    }
  }, [mangoGroup?.publicKey.toBase58()])

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
      label: `Admin`,
      subtitle: getAdditionalLabelInfo('admin'),
      initialValue: form.admin,
      type: InstructionInputType.INPUT,
      name: 'admin',
    },
    {
      label: `Fast Listing Admin`,
      subtitle: getAdditionalLabelInfo('fastListingAdmin'),
      initialValue: form.fastListingAdmin,
      type: InstructionInputType.INPUT,
      name: 'fastListingAdmin',
    },
    {
      label: `Security Admin`,
      subtitle: getAdditionalLabelInfo('securityAdmin'),
      initialValue: form.securityAdmin,
      type: InstructionInputType.INPUT,
      name: 'securityAdmin',
    },
    {
      label: `Testing`,
      subtitle: getAdditionalLabelInfo('testing'),
      initialValue: form.testing,
      type: InstructionInputType.INPUT,
      inputType: 'number',
      name: 'testing',
    },
    {
      label: `Version`,
      subtitle: getAdditionalLabelInfo('version'),
      initialValue: form.version,
      type: InstructionInputType.INPUT,
      inputType: 'number',
      name: 'version',
    },
    {
      label: `Deposit Limit Quote`,
      subtitle: getAdditionalLabelInfo('depositLimitQuote'),
      initialValue: form.depositLimitQuote,
      type: InstructionInputType.INPUT,
      inputType: 'number',
      name: 'depositLimitQuote',
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

export default GroupEdit
