/* eslint-disable @typescript-eslint/no-non-null-assertion */
import React, { useContext, useEffect, useState } from 'react'
import useRealm from '@hooks/useRealm'
import { PublicKey } from '@solana/web3.js'
import * as yup from 'yup'
import { isFormValid } from '@utils/formValidation'
import {
  UiInstruction,
  WithdrawInsuranceFromMangoDepositoryForm,
} from '@utils/uiTypes/proposalCreationTypes'
import { NewProposalContext } from '../../new'
import useGovernanceAssets from '@hooks/useGovernanceAssets'
import useWalletStore from 'stores/useWalletStore'
import {
  serializeInstructionToBase64,
  Governance,
  GovernanceAccountType,
  ProgramAccount,
} from '@solana/spl-governance'
import Input from '@components/inputs/Input'
import { debounce } from '@utils/debounce'
import GovernedAccountSelect from '../GovernedAccountSelect'
import { GovernedMultiTypeAccount } from '@utils/tokens'
import createWithdrawInsuranceFromMangoDepositoryInstruction from '@tools/sdk/uxdProtocol/createWithdrawInsuranceFromMangoDepositoryInstruction'
import Select from '@components/inputs/Select'
import {
  getDepositoryMintSymbols,
  getInsuranceMintSymbols,
} from '@tools/sdk/uxdProtocol/uxdClient'

const WithdrawInsuranceFromMangoDepository = ({
  index,
  governance,
}: {
  index: number
  governance: ProgramAccount<Governance> | null
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
  const [form, setForm] = useState<WithdrawInsuranceFromMangoDepositoryForm>({
    governedAccount: undefined,
    programId: programId?.toString(),
    collateralName: '',
    insuranceName: '',
    insuranceWithdrawnAmount: 0,
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
      const createIx = await createWithdrawInsuranceFromMangoDepositoryInstruction(
        connection,
        form.governedAccount?.governance.account.governedAccount,
        form.governedAccount?.governance.pubkey,
        form.collateralName,
        form.insuranceName,
        form.insuranceWithdrawnAmount
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
    if (form.collateralName) {
      debounce.debounceFcn(async () => {
        const { validationErrors } = await isFormValid(schema, form)
        setFormErrors(validationErrors)
      })
    }
  }, [form.collateralName])

  useEffect(() => {
    if (form.insuranceName) {
      debounce.debounceFcn(async () => {
        const { validationErrors } = await isFormValid(schema, form)
        setFormErrors(validationErrors)
      })
    }
  }, [form.insuranceName])

  useEffect(() => {
    if (form.insuranceWithdrawnAmount) {
      debounce.debounceFcn(async () => {
        const { validationErrors } = await isFormValid(schema, form)
        setFormErrors(validationErrors)
      })
    }
  }, [form.insuranceWithdrawnAmount])

  useEffect(() => {
    handleSetInstructions(
      { governedAccount: form.governedAccount?.governance, getInstruction },
      index
    )
  }, [form])

  const schema = yup.object().shape({
    collateralName: yup.string().required('Collateral Name is required'),
    insuranceName: yup.string().required('Insurance Name is required'),
    insuranceWithdrawnAmount: yup
      .number()
      .moreThan(0, 'Insurance Withdrawn amount should be more than 0')
      .required('Insurance Withdrawn amount is required'),
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

      <Select
        label="Collateral Name"
        value={form.collateralName}
        placeholder="Please select..."
        onChange={(value) =>
          handleSetForm({ value, propertyName: 'collateralName' })
        }
        error={formErrors['collateralName']}
      >
        {getDepositoryMintSymbols(connection.cluster).map((value, i) => (
          <Select.Option key={value + i} value={value}>
            {value}
          </Select.Option>
        ))}
      </Select>

      <Select
        label="Insurance Name"
        value={form.insuranceName}
        placeholder="Please select..."
        onChange={(value) =>
          handleSetForm({ value, propertyName: 'insuranceName' })
        }
        error={formErrors['insuranceName']}
      >
        {getInsuranceMintSymbols(connection.cluster).map((value, i) => (
          <Select.Option key={value + i} value={value}>
            {value}
          </Select.Option>
        ))}
      </Select>

      <Input
        label="Insurance Withdrawn Amount"
        value={form.insuranceWithdrawnAmount}
        type="number"
        min={0}
        onChange={(evt) =>
          handleSetForm({
            value: evt.target.value,
            propertyName: 'insuranceWithdrawnAmount',
          })
        }
        error={formErrors['insuranceWithdrawnAmount']}
      />
    </>
  )
}

export default WithdrawInsuranceFromMangoDepository
