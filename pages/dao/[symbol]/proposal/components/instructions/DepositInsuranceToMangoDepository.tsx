/* eslint-disable @typescript-eslint/no-non-null-assertion */
import React, { useContext, useEffect, useState } from 'react'
import useRealm from '@hooks/useRealm'
import { PublicKey } from '@solana/web3.js'
import * as yup from 'yup'
import { isFormValid } from '@utils/formValidation'
import {
  UiInstruction,
  DepositInsuranceToMangoDepositoryForm,
} from '@utils/uiTypes/proposalCreationTypes'
import { NewProposalContext } from '../../new'
import useGovernanceAssets from '@hooks/useGovernanceAssets'
import { Governance, GovernanceAccountType } from '@models/accounts'
import { ParsedAccount } from '@models/core/accounts'
import useWalletStore from 'stores/useWalletStore'
import { serializeInstructionToBase64 } from '@models/serialisation'
import Input from '@components/inputs/Input'
import { debounce } from '@utils/debounce'
import GovernedAccountSelect from '../GovernedAccountSelect'
import { GovernedMultiTypeAccount } from '@utils/tokens'
import createDepositInsuranceToMangoDepositoryInstruction from '@tools/sdk/uxdProtocol/createDepositInsuranceToMangoDepositoryInstruction'

const DepositInsuranceToMangoDepository = ({
  index,
  governance,
}: {
  index: number
  governance: ParsedAccount<Governance> | null
}) => {
  const connection = useWalletStore((s) => s.connection)
  const wallet = useWalletStore((s) => s.current)
  const { realmInfo } = useRealm()
  const { getGovernancesByAccountType } = useGovernanceAssets()
  const governedProgramAccounts = getGovernancesByAccountType(
    GovernanceAccountType.ProgramGovernance
  ).map((x) => {
    return {
      governance: x,
    }
  })
  const shouldBeGoverned = index !== 0 && governance
  const programId: PublicKey | undefined = realmInfo?.programId
  const [form, setForm] = useState<DepositInsuranceToMangoDepositoryForm>({
    governedAccount: undefined,
    programId: programId?.toString(),
    collateralMint: '',
    insuranceMint: '',
    insuranceDepositedAmount: 0,
    controllerPda: '',
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
      form.governedAccount?.governance?.info &&
      wallet?.publicKey
    ) {
      const createIx = await createDepositInsuranceToMangoDepositoryInstruction(
        connection,
        form.governedAccount?.governance.info.governedAccount,
        form.governedAccount?.governance.pubkey,
        new PublicKey(form.collateralMint),
        new PublicKey(form.insuranceMint),
        form.insuranceDepositedAmount || 0,
        new PublicKey(form.controllerPda)
      )
      serializedInstruction = serializeInstructionToBase64(createIx)
    }
    const obj: UiInstruction = {
      serializedInstruction,
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
    if (form.collateralMint) {
      debounce.debounceFcn(async () => {
        const { validationErrors } = await isFormValid(schema, form)
        setFormErrors(validationErrors)
      })
    }
  }, [form.collateralMint])
  useEffect(() => {
    if (form.insuranceMint) {
      debounce.debounceFcn(async () => {
        const { validationErrors } = await isFormValid(schema, form)
        setFormErrors(validationErrors)
      })
    }
  }, [form.insuranceMint])
  useEffect(() => {
    handleSetInstructions(
      { governedAccount: form.governedAccount?.governance, getInstruction },
      index
    )
  }, [form])
  const schema = yup.object().shape({
    collateralMint: yup
      .string()
      .required('Collateral Mint address is required'),
    insuranceMint: yup.string().required('Insurance Mint address is required'),
    governedAccount: yup
      .object()
      .nullable()
      .required('Program governed account is required'),
  })

  return (
    <>
      <GovernedAccountSelect
        label="Governance"
        governedAccounts={governedProgramAccounts as GovernedMultiTypeAccount[]}
        onChange={(value) => {
          handleSetForm({ value, propertyName: 'governedAccount' })
        }}
        value={form.governedAccount}
        error={formErrors['governedAccount']}
        shouldBeGoverned={shouldBeGoverned}
        governance={governance}
      ></GovernedAccountSelect>
      <Input
        label="Collateral Mint"
        value={form.collateralMint}
        type="text"
        onChange={(evt) =>
          handleSetForm({
            value: evt.target.value,
            propertyName: 'collateralMint',
          })
        }
        error={formErrors['collateralMint']}
      />
      <Input
        label="Insurance Mint"
        value={form.insuranceMint}
        type="test"
        onChange={(evt) =>
          handleSetForm({
            value: evt.target.value,
            propertyName: 'insuranceMint',
          })
        }
        error={formErrors['insuranceMint']}
      />
      <Input
        label="Insurance Deposited Amount"
        value={form.insuranceDepositedAmount}
        type="number"
        min={0}
        max={10 ** 12}
        onChange={(evt) =>
          handleSetForm({
            value: evt.target.value,
            propertyName: 'insuranceDepositedAmount',
          })
        }
        error={formErrors['global']}
      />
      <Input
        label="Controller Address"
        value={form.controllerPda}
        type="text"
        onChange={(evt) =>
          handleSetForm({
            value: evt.target.value,
            propertyName: 'controllerPda',
          })
        }
        error={formErrors['controllerPda']}
      />
    </>
  )
}

export default DepositInsuranceToMangoDepository
