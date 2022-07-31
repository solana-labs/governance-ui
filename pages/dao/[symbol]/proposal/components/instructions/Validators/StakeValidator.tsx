import React, { useContext, useEffect, useState } from 'react'
import Input from 'components/inputs/Input'
import * as yup from 'yup'

import { Governance, ProgramAccount } from '@solana/spl-governance'

import { PublicKey, StakeProgram } from '@solana/web3.js'

import {
  UiInstruction,
  ValidatorStakingForm,
} from '@utils/uiTypes/proposalCreationTypes'
import { NewProposalContext } from '../../../new'
import { isFormValid } from '@utils/formValidation'
import useWalletStore from 'stores/useWalletStore'
import { DEFAULT_GOVERNANCE_PROGRAM_ID } from '@components/instructions/tools'

async function checkAccount(
  connection: any,
  account: PublicKey,
  owner: PublicKey
): Promise<boolean> {
  const accountInfo = await connection.current.getAccountInfo(account)
  if (
    accountInfo &&
    accountInfo.lamports > 0 &&
    accountInfo.owner.equals(owner)
  ) {
    return true
  }
  return false
}

const StakeValidator = ({
  index,
  governance,
}: {
  index: number
  governance: ProgramAccount<Governance> | null
}) => {
  const connection = useWalletStore((s) => s.connection)
  const programId: PublicKey = StakeProgram.programId
  const governanceAccount = governance?.account
  const governanceVar = governance

  const [form, setForm] = useState<ValidatorStakingForm>({
    validatorVoteKey: '',
    amount: 0,
  })
  const [formErrors, setFormErrors] = useState({})
  const { handleSetInstructions } = useContext(NewProposalContext)

  const handleSetForm = ({ propertyName, value }) => {
    setFormErrors({})
    setForm({ ...form, [propertyName]: value })
  }

  const setValidatorVoteKey = (event) => {
    const value = event.target.value
    handleSetForm({
      value: value,
      propertyName: 'validatorVoteKey',
    })
  }

  const setAmount = (event) => {
    const value = event.target.value
    handleSetForm({
      value: value,
      propertyName: 'depositedAmount',
    })
  }

  const schema = yup.object().shape({
    tokenAccount: yup.object().nullable().required('Token account is required'),
    validatorVoteKey: yup
      .string()
      .required('Validator vote address is required'),
    amount: yup
      .number()
      .nullable()
      .min(0, 'Amount must be positive number')
      .required('Amount is required'),
  })

  const validateInstruction = async (): Promise<boolean> => {
    const { isValid, validationErrors } = await isFormValid(schema, form)
    setFormErrors(validationErrors)
    return isValid
  }

  async function getInstruction(): Promise<UiInstruction> {
    const isValid = await validateInstruction()
    const governance = governanceVar
    const governancePk = governance?.pubkey
    const governanceProgramPk = new PublicKey(DEFAULT_GOVERNANCE_PROGRAM_ID)
    const returnInvalid = (): UiInstruction => {
      return {
        serializedInstruction: '',
        isValid: false,
        governance: undefined,
      }
    }

    if (
      !connection ||
      !isValid ||
      !programId ||
      !governanceAccount ||
      !governancePk
    ) {
      return returnInvalid()
    }

    const [nativeTreasury] = await PublicKey.findProgramAddress(
      [Buffer.from('native-treasury'), governancePk.toBuffer()],
      governanceProgramPk
    )
    if (
      !(await checkAccount(connection, nativeTreasury, governanceProgramPk))
    ) {
      return returnInvalid()
    }
    const [nativeTreasuryStakeAccount] = await PublicKey.findProgramAddress(
      [Buffer.from('native-treasury-stake-account'), governancePk.toBuffer()],
      governanceProgramPk
    )

    // check if stake account exists, if not create one
    if (
      !(await checkAccount(
        connection,
        nativeTreasuryStakeAccount,
        governanceProgramPk
      ))
    ) {
    }
    return returnInvalid()
  }

  useEffect(() => {
    handleSetInstructions(
      {
        governedAccount: governanceAccount,
        getInstruction,
      },
      index
    )
  }, [form])

  return (
    <>
      <Input
        label="Validator Vote Address"
        value={form.validatorVoteKey}
        error={formErrors['validatorVoteKey']}
        type="string"
        onChange={setValidatorVoteKey}
      />
      <Input
        label="Amount"
        value={form.amount}
        error={formErrors['amount']}
        type="number"
        onChange={setAmount}
      />
      <div
        style={{
          fontSize: '14px',
          color: 'rgba(164, 172, 183, 1)',
          marginTop: '18px',
        }}
      >
        Stake tokens into validator from native sol treasury.
      </div>
      <div
        style={{
          fontSize: '14px',
          color: 'rgba(164, 172, 183, 1)',
          marginTop: '18px',
        }}
      >
        Please ensure that the SOL native treasury account holds enough SOL to
        stake.
      </div>
    </>
  )
}

export default StakeValidator
