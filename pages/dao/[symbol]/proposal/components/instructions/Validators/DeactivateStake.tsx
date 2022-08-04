import React, { useContext, useEffect, useState } from 'react'
import * as yup from 'yup'

import {
  Governance,
  ProgramAccount,
  serializeInstructionToBase64,
} from '@solana/spl-governance'

import { PublicKey, StakeProgram } from '@solana/web3.js'

import {
  UiInstruction,
  ValidatorDeactivateStakeForm,
} from '@utils/uiTypes/proposalCreationTypes'
import { NewProposalContext } from '../../../new'
import { isFormValid } from '@utils/formValidation'
import useWalletStore from 'stores/useWalletStore'
import { web3 } from '@project-serum/anchor'
import useGovernanceAssets from '@hooks/useGovernanceAssets'
import GovernedAccountSelect from '../../GovernedAccountSelect'
import { getFilteredProgramAccounts } from '@blockworks-foundation/mango-client'
import {
  StakeAccountSelect,
  StakeAccount,
  StakeState,
} from '../../StakeAccountSelect'

const DeactivateValidatorStake = ({
  index,
  governance,
}: {
  index: number
  governance: ProgramAccount<Governance> | null
}) => {
  const connection = useWalletStore((s) => s.connection)
  const programId: PublicKey = StakeProgram.programId
  const { governedTokenAccountsWithoutNfts } = useGovernanceAssets()
  const shouldBeGoverned = index !== 0 && governance

  const [form, setForm] = useState<ValidatorDeactivateStakeForm>({
    stakingAccount: undefined,
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

  const setStakingAccount = (event) => {
    const value = event.target.value
    handleSetForm({
      value: value,
      propertyName: 'stakingAccount',
    })
  }

  const [stakeAccounts, setStakeAccounts] = useState<StakeAccount[]>([])

  const validateInstruction = async (): Promise<boolean> => {
    const stakingAccounts = await getFilteredProgramAccounts(
      connection.current,
      StakeProgram.programId,
      [
        {
          memcmp: {
            offset: 0,
            bytes: new Uint8Array([2, 0, 0, 0]),
          },
        },
        {
          memcmp: {
            offset: 44,
            bytes: form.governedTokenAccount?.pubkey.toBase58(),
          },
        },
      ]
    )
    const stakingPks = stakingAccounts.map((x) => x.publicKey.toString())
    const stakingAccountsToDisplay: StakeAccount[] = stakingAccounts.map(
      (x) => {
        return {
          stakeAccount: x.publicKey,
          state: StakeState.Active,
          delegatedValidator: x.publicKey,
          amount: 0,
        }
      }
    )
    setStakeAccounts(stakingAccountsToDisplay)

    const schema = yup.object().shape({
      stakingAccount: yup
        .string()
        .required('Staking account to deactivate required')
        .oneOf(stakingPks),
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

    if (
      !connection ||
      !isValid ||
      !programId ||
      !governanceAccount ||
      !governancePk ||
      !form.governedTokenAccount?.isSol ||
      !form.stakingAccount?.stakeAccount
    ) {
      return returnInvalid()
    }
    const instruction = web3.StakeProgram.deactivate({
      stakePubkey: form.stakingAccount.stakeAccount,
      authorizedPubkey: form.governedTokenAccount.pubkey,
    })
    return {
      serializedInstruction: serializeInstructionToBase64(
        instruction.instructions[0]
      ),
      isValid: true,
      governance: form.governedTokenAccount.governance,
      shouldSplitIntoSeparateTxs: false,
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
        label="Treasury account"
        governedAccounts={governedTokenAccountsWithoutNfts.filter(
          (x) => x.isSol
        )}
        onChange={(value) => {
          handleSetForm({ value, propertyName: 'governedTokenAccount' })
        }}
        value={form.governedTokenAccount}
        error={formErrors['governedTokenAccount']}
        shouldBeGoverned={shouldBeGoverned}
        governance={governance}
      ></GovernedAccountSelect>
      <StakeAccountSelect
        label="Staking Account"
        stakeAccounts={stakeAccounts}
        value={form.stakingAccount}
        error={formErrors['stakingAccount']}
        onChange={setStakingAccount}
      />
      <div
        style={{
          fontSize: '14px',
          color: 'rgba(164, 172, 183, 1)',
          marginTop: '18px',
        }}
      >
        Deactivate the staking account for a validator. This will make the
        stakes available to withdraw at the next epoch (2-4 days).
      </div>
    </>
  )
}

export default DeactivateValidatorStake
