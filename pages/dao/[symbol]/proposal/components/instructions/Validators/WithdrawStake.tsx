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
  ValidatorWithdrawStakeForm,
} from '@utils/uiTypes/proposalCreationTypes'
import { NewProposalContext } from '../../../new'
import { isFormValid } from '@utils/formValidation'
import useWalletStore from 'stores/useWalletStore'
import { web3 } from '@project-serum/anchor'
import useGovernanceAssets from '@hooks/useGovernanceAssets'
import GovernedAccountSelect from '../../GovernedAccountSelect'
import { getFilteredProgramAccounts } from '@blockworks-foundation/mango-client'
import StakeAccountSelect from '../../StakeAccountSelect'
import Input from '@components/inputs/Input'
import { bs58 } from '@project-serum/anchor/dist/cjs/utils/bytes'
import { StakeAccount, StakeState } from '@utils/uiTypes/assets'
import { parseMintNaturalAmountFromDecimal } from '@tools/sdk/units'

const WithdrawValidatorStake = ({
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

  const [form, setForm] = useState<ValidatorWithdrawStakeForm>({
    stakingAccount: undefined,
    governedTokenAccount: undefined,
    amount: 0,
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

  const setStakingAccount = (value) => {
    handleSetForm({
      value: value,
      propertyName: 'stakingAccount',
    })
  }

  const setAmount = (event) => {
    const value = event.target.value
    handleSetForm({
      value: value,
      propertyName: 'amount',
    })
  }

  const getStakeAccounts = async (): Promise<StakeAccount[]> => {
    if (!form.governedTokenAccount) return []

    const accountsNotYetStaked = await getFilteredProgramAccounts(
      connection.current,
      StakeProgram.programId,
      [
        {
          memcmp: {
            offset: 0,
            bytes: bs58.encode([1, 0, 0, 0]),
          },
        },
        {
          memcmp: {
            offset: 44,
            bytes: form.governedTokenAccount.pubkey.toBase58(),
          },
        },
      ]
    )

    const accountsStaked = await getFilteredProgramAccounts(
      connection.current,
      StakeProgram.programId,
      [
        {
          memcmp: {
            offset: 0,
            bytes: bs58.encode([2, 0, 0, 0]),
          },
        },
        {
          memcmp: {
            offset: 44,
            bytes: form.governedTokenAccount.pubkey.toBase58(),
          },
        },
      ]
    )

    const stakingAccounts = accountsNotYetStaked.concat(
      accountsStaked.filter((x) => {
        // filter all accounts which are not yet deactivated
        const data = x.accountInfo.data.slice(172, 172 + 8)
        return !data.equals(
          Buffer.from([255, 255, 255, 255, 255, 255, 255, 255])
        )
      })
    )

    return stakingAccounts.map((x) => {
      return {
        stakeAccount: x.publicKey,
        state: StakeState.Inactive,
        delegatedValidator: web3.PublicKey.default,
        amount: x.accountInfo.lamports / web3.LAMPORTS_PER_SOL,
      }
    })
  }

  const [stakeAccounts, setStakeAccounts] = useState<StakeAccount[]>([])

  const validateInstruction = async (): Promise<boolean> => {
    const stakingAccounts = await getStakeAccounts()
    setStakeAccounts(stakingAccounts)

    if (
      !form.stakingAccount ||
      !form.stakingAccount.stakeAccount ||
      !form.stakingAccount.delegatedValidator
    )
      return false

    const schema = yup.object().shape({
      amount: yup
        .number()
        .min(1, 'Amount must be positive number')
        .required('Amount is required'),
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
    const realAmount = parseMintNaturalAmountFromDecimal(form.amount!, 9)
    const instruction = web3.StakeProgram.withdraw({
      stakePubkey: new PublicKey(form.stakingAccount.stakeAccount),
      authorizedPubkey: form.governedTokenAccount.pubkey,
      lamports: realAmount,
      toPubkey: form.governedTokenAccount.pubkey,
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
    // eslint-disable-next-line react-hooks/exhaustive-deps -- TODO please fix, it can cause difficult bugs. You might wanna check out https://bobbyhadz.com/blog/react-hooks-exhaustive-deps for info. -@asktree
  }, [form])

  useEffect(() => {
    handleSetInstructions(
      { governedAccount: governedAccount, getInstruction },
      index
    )
    // eslint-disable-next-line react-hooks/exhaustive-deps -- TODO please fix, it can cause difficult bugs. You might wanna check out https://bobbyhadz.com/blog/react-hooks-exhaustive-deps for info. -@asktree
  }, [form])
  useEffect(() => {
    setGovernedAccount(form.governedTokenAccount?.governance)
    if (form.governedTokenAccount) {
      getStakeAccounts().then((x) => setStakeAccounts(x))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- TODO please fix, it can cause difficult bugs. You might wanna check out https://bobbyhadz.com/blog/react-hooks-exhaustive-deps for info. -@asktree
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
        Withraw from staking account for a validator. You can only withdraw from
        inactivated stake accounts.
      </div>
    </>
  )
}

export default WithdrawValidatorStake
