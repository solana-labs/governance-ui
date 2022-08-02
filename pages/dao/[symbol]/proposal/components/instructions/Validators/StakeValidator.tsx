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
import { web3 } from '@project-serum/anchor'
import useGovernanceAssets from '@hooks/useGovernanceAssets'
import GovernedAccountSelect from '../../GovernedAccountSelect'

const StakeValidator = ({
  index,
  governance,
}: {
  index: number
  governance: ProgramAccount<Governance> | null
}) => {
  console.log('test')
  const connection = useWalletStore((s) => s.connection)
  const programId: PublicKey = StakeProgram.programId
  const { governedTokenAccountsWithoutNfts } = useGovernanceAssets()
  const shouldBeGoverned = index !== 0 && governance

  const [form, setForm] = useState<ValidatorStakingForm>({
    validatorVoteKey: '',
    amount: 0,
    seed: '',
    governedTokenAccount: undefined,
  })
  const [formErrors, setFormErrors] = useState({})
  const { handleSetInstructions } = useContext(NewProposalContext)

  const handleSetForm = ({ propertyName, value }) => {
    setFormErrors({})
    setForm({ ...form, [propertyName]: value })
  }

  const [governedAccount, setGovernedAccount] = useState<
    ProgramAccount<Governance> | undefined
  >(undefined)

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
    const validatorsStatus = await connection.current.getVoteAccounts()
    const validators = validatorsStatus.current.map((x) => x.votePubkey)
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
    const governancePk = governance?.pubkey
    const returnInvalid = (): UiInstruction => {
      return {
        serializedInstruction: '',
        isValid: false,
        governance: undefined,
      }
    }
    const governanceAccount = governance?.account

    console.log('testing')
    if (
      !connection ||
      !isValid ||
      !programId ||
      !governanceAccount ||
      !governancePk ||
      !form.governedTokenAccount?.isSol
    ) {
      return returnInvalid()
    }

    const nativeTreasury = form.governedTokenAccount.pubkey
    const prerequisiteInstructions: web3.TransactionInstruction[] = []

    const [stakeAccountAddress] = await web3.PublicKey.findProgramAddress(
      [nativeTreasury.toBuffer(), Buffer.from(form.seed, 'utf8')],
      web3.StakeProgram.programId
    )

    // check if stake account exists, if not create one
    if (!connection.current.getAccountInfo(stakeAccountAddress) == null) {
      console.log('C')
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
    console.log('D')
    return {
      serializedInstruction: serializeInstructionToBase64(tx.instructions[0]),
      isValid: true,
      governance: form.governedTokenAccount.governance,
      prerequisiteInstructions: prerequisiteInstructions,
      shouldSplitIntoSeparateTxs: true,
      signers: [],
    }
  }

  useEffect(() => {
    handleSetInstructions(
      {
        governedAccount: governedAccount,
        getInstruction,
      },
      index
    )
  }, [form])

  useEffect(() => {
    handleSetInstructions(
      { governedAccount: governedAccount, getInstruction },
      index
    )
  }, [form])
  useEffect(() => {
    setGovernedAccount(form.governedTokenAccount?.governance)
  }, [form.governedTokenAccount])

  return (
    <>
      <GovernedAccountSelect
        label="Source account"
        governedAccounts={governedTokenAccountsWithoutNfts}
        onChange={(value) => {
          handleSetForm({ value, propertyName: 'governedTokenAccount' })
        }}
        value={form.governedTokenAccount}
        error={formErrors['governedTokenAccount']}
        shouldBeGoverned={shouldBeGoverned}
        governance={governance}
      ></GovernedAccountSelect>
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
