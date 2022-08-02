import React, { useContext, useEffect, useState } from 'react'
import Input from 'components/inputs/Input'
import * as yup from 'yup'

import {
  Governance,
  ProgramAccount,
  serializeInstructionToBase64,
} from '@solana/spl-governance'

import { PublicKey, StakeProgram } from '@solana/web3.js'

import {
  UiInstruction,
  ValidatorStakingForm,
} from '@utils/uiTypes/proposalCreationTypes'
import { NewProposalContext } from '../../../new'
import { isFormValid } from '@utils/formValidation'
import useWalletStore from 'stores/useWalletStore'
import { DEFAULT_GOVERNANCE_PROGRAM_ID } from '@components/instructions/tools'
import { web3 } from '@project-serum/anchor'
import { ConnectionContext } from '@utils/connection'

async function checkAccount(
  connection: ConnectionContext,
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
    seed: '',
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

  const setSeed = (event) => {
    const value = event.target.value
    handleSetForm({
      value: value,
      propertyName: 'seed',
    })
  }

  const setAmount = (event) => {
    const value = event.target.value
    handleSetForm({
      value: value,
      propertyName: 'amount',
    })
  }

  const validateInstruction = async (): Promise<boolean> => {
    const validatorsStatus = connection.current.getVoteAccounts()
    const validators: [string] = ['']
    validatorsStatus.then((x) =>
      validators.push(...x.current.map((x) => x.votePubkey))
    )
    //const validator = validatorsStatus.current.map(x => x.votePubkey);

    const schema = yup.object().shape({
      validatorVoteKey: yup
        .string()
        .required('Validator vote address is required')
        .oneOf(validators),
      amount: yup
        .number()
        .min(1, 'Amount must be positive number')
        .required('Amount is required'),
      seed: yup.string().required('seed is required'),
    })
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

    const prerequisiteInstructions: web3.TransactionInstruction[] = []

    const [stakeAccountAddress] = await web3.PublicKey.findProgramAddress(
      [nativeTreasury.toBuffer(), Buffer.from(form.seed, 'utf8')],
      web3.StakeProgram.programId
    )

    // check if stake account exists, if not create one
    if (!connection.current.getAccountInfo(stakeAccountAddress) == null) {
      return returnInvalid() // stake account already exists
    }

    let tx = await web3.StakeProgram.createAccountWithSeed({
      fromPubkey: nativeTreasury,
      stakePubkey: stakeAccountAddress,
      basePubkey: nativeTreasury,
      seed: form.validatorVoteKey + form.seed,
      lamports: form.amount,
      authorized: { staker: nativeTreasury, withdrawer: nativeTreasury },
    })
    prerequisiteInstructions.push(...tx.instructions) // add instructions

    tx = await web3.StakeProgram.delegate({
      authorizedPubkey: nativeTreasury,
      stakePubkey: nativeTreasury,
      votePubkey: new web3.PublicKey(form.validatorVoteKey),
    })
    return {
      serializedInstruction: serializeInstructionToBase64(tx.instructions[0]),
      isValid: true,
      governance: governance,
      prerequisiteInstructions: prerequisiteInstructions,
      shouldSplitIntoSeparateTxs: true,
      signers: [],
    }
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
        label="Seed for stake address (will be added with validator address)"
        value={form.seed}
        error={formErrors['seed']}
        type="string"
        onChange={setSeed}
      />
      <Input
        label="Amount"
        value={form.amount}
        error={formErrors['amount']}
        type="number"
        min="1"
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
