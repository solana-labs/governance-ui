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
import { BN } from '@project-serum/anchor'
import { getChangedValues, getNullOrTransform } from './tools'

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
  const { getClient, GROUP } = UseMangoV4()
  const { realmInfo } = useRealm()
  const { assetAccounts } = useGovernanceAssets()
  const governedProgramAccounts = assetAccounts.filter(
    (x) => x.type === AccountType.SOL
  )
  const { connection } = useWalletStore()
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
      const client = await getClient(connection, wallet)
      const group = await client.getGroup(GROUP)
      const values = getChangedValues<GroupEditForm>(originalFormValues, form)
      //Mango instruction call and serialize
      const ix = await client.program.methods
        .groupEdit(
          getNullOrTransform(values.admin, PublicKey),
          getNullOrTransform(values.fastListingAdmin, PublicKey),
          getNullOrTransform(values.securityAdmin, PublicKey),
          getNullOrTransform(values.testing, null, Number),
          getNullOrTransform(values.version, null, Number),
          getNullOrTransform(values.depositLimitQuote, BN)
        )
        .accounts({
          group: group.publicKey,
          admin: group.admin,
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
      const client = await getClient(connection, wallet!)
      const group = await client.getGroup(GROUP)
      const vals = {
        ...form,
        admin: group.admin.toBase58(),
        fastListingAdmin: group.fastListingAdmin.toBase58(),
        securityAdmin: group.securityAdmin.toBase58(),
        testing: group.testing,
        version: group.version,
      }
      setForm({
        ...vals,
      })
      setOriginalFormValues({ ...vals })
    }
    if (wallet?.publicKey) {
      getGroupParams()
    }
  }, [connection && wallet?.publicKey?.toBase58()])

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
      label: 'Admin',
      initialValue: form.admin,
      type: InstructionInputType.INPUT,
      name: 'admin',
    },
    {
      label: 'Fast Listing Admin',
      initialValue: form.fastListingAdmin,
      type: InstructionInputType.INPUT,
      name: 'fastListingAdmin',
    },
    {
      label: 'Security Admin',
      initialValue: form.securityAdmin,
      type: InstructionInputType.INPUT,
      name: 'securityAdmin',
    },
    {
      label: 'Testing',
      initialValue: form.testing,
      type: InstructionInputType.INPUT,
      inputType: 'number',
      name: 'testing',
    },
    {
      label: 'Version',
      initialValue: form.version,
      type: InstructionInputType.INPUT,
      inputType: 'number',
      name: 'version',
    },
    {
      label: 'Deposit Limit Quote',
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
