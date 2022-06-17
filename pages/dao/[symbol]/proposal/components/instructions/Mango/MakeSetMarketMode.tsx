/* eslint-disable @typescript-eslint/no-non-null-assertion */
import React, { useContext, useEffect, useState } from 'react'
import useRealm from '@hooks/useRealm'
import { PublicKey } from '@solana/web3.js'
import * as yup from 'yup'
import { isFormValid } from '@utils/formValidation'
import {
  UiInstruction,
  MangoMakeSetMarketModeForm,
} from '@utils/uiTypes/proposalCreationTypes'
import { NewProposalContext } from '../../../new'
import useGovernanceAssets from '@hooks/useGovernanceAssets'
import { Governance } from '@solana/spl-governance'
import { ProgramAccount } from '@solana/spl-governance'
import useWalletStore from 'stores/useWalletStore'
import { serializeInstructionToBase64 } from '@solana/spl-governance'
import {
  IDS,
  makeSetMarketModeInstruction,
  BN,
} from '@blockworks-foundation/mango-client'
import { AccountType } from '@utils/uiTypes/assets'
import InstructionForm, {
  InstructionInput,
  InstructionInputType,
} from '../FormCreator'

const ASSET_TYPE = [
  {
    name: 'Token',
    value: 0,
  },
  {
    name: 'Perp',
    value: 1,
  },
]

const MARKET_MODE = [
  {
    name: 'Default',
    value: 0,
  },
  {
    name: 'Active',
    value: 1,
  },
  {
    name: 'CloseOnly',
    value: 2,
  },
  {
    name: 'ForceCloseOnly',
    value: 3,
  },
  {
    name: 'Inactive',
    value: 4,
  },
  {
    name: 'SwappingSpotMarket',
    value: 5,
  },
]

const MakeSetMarketMode = ({
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
  const [form, setForm] = useState<MangoMakeSetMarketModeForm>({
    governedAccount: null,
    mangoGroup: null,
    marketIndex: null,
    adminPk: '',
    marketMode: null,
    marketType: null,
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
      //Mango instruction call and serialize
      console.log(
        form.governedAccount.governance.account.governedAccount,
        new PublicKey(form.mangoGroup!.value),
        new PublicKey(form.adminPk),
        new BN(form.marketIndex!.value),
        Number(form.marketMode!.value),
        Number(form.marketType)
      )
      const addOracleIx = makeSetMarketModeInstruction(
        form.governedAccount.governance.account.governedAccount,
        new PublicKey(form.mangoGroup!.value),
        new PublicKey(form.adminPk),
        new BN(form.marketIndex!.value),
        Number(form.marketMode!.value),
        Number(form.marketType)
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

  useEffect(() => {
    handleSetInstructions(
      { governedAccount: form.governedAccount?.governance, getInstruction },
      index
    )
  }, [form])
  const schema = yup.object().shape({
    bufferAddress: yup.number(),
    governedAccount: yup
      .object()
      .nullable()
      .required('Program governed account is required'),
  })
  const getOptionsForMarketIndex = () => {
    return form.mangoGroup && form.marketType
      ? IDS.groups.find((x) => x.publicKey === form.mangoGroup?.value)![
          Number(form.marketType.value) === 0 ? 'spotMarkets' : 'perpMarkets'
        ]
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
      label: 'Market type',
      initialValue: form.marketType,
      type: InstructionInputType.SELECT,
      name: 'marketType',
      options: ASSET_TYPE,
    },
    {
      label: 'Market index',
      initialValue: form.marketIndex,
      type: InstructionInputType.SELECT,
      name: 'marketIndex',
      options: getOptionsForMarketIndex(),
    },
    {
      label: 'Market mode',
      initialValue: form.marketMode,
      type: InstructionInputType.SELECT,
      name: 'marketMode',
      options: MARKET_MODE,
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

export default MakeSetMarketMode
