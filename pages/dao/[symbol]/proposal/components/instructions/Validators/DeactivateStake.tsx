import React, { useContext, useEffect, useState } from 'react'

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
import useWalletStore from 'stores/useWalletStore'
import { web3 } from '@coral-xyz/anchor'
import useGovernanceAssets from '@hooks/useGovernanceAssets'
import GovernedAccountSelect from '../../GovernedAccountSelect'
import { bs58 } from '@coral-xyz/anchor/dist/cjs/utils/bytes'
import { StakeAccount, StakeState } from '@utils/uiTypes/assets'
import StakeAccountSelect from '../../StakeAccountSelect'
import { getFilteredProgramAccounts } from '@utils/helpers'
import useLegacyConnectionContext from '@hooks/useLegacyConnectionContext'

const DeactivateValidatorStake = ({
  index,
  governance,
}: {
  index: number
  governance: ProgramAccount<Governance> | null
}) => {
  const connection = useLegacyConnectionContext()
  const programId: PublicKey = StakeProgram.programId
  const { governedTokenAccountsWithoutNfts } = useGovernanceAssets()
  const shouldBeGoverned = !!(index !== 0 && governance)

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

  const setStakingAccount = (value) => {
    handleSetForm({
      value: value,
      propertyName: 'stakingAccount',
    })
  }

  const getStakeAccounts = async (): Promise<StakeAccount[]> => {
    if (!form.governedTokenAccount) return []

    const stakingAccounts = await getFilteredProgramAccounts(
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
        {
          memcmp: {
            offset: 172,
            bytes: bs58.encode([255, 255, 255, 255, 255, 255, 255, 255]), // equivalent to u64::max for deactivation epoch / not deactivated yet
          },
        },
      ]
    )

    return stakingAccounts.map((x) => {
      const validatorPk = web3.PublicKey.decode(
        x.accountInfo.data.slice(124, 124 + 32)
      )
      return {
        stakeAccount: x.publicKey,
        state: StakeState.Active,
        delegatedValidator: validatorPk as web3.PublicKey,
        amount: x.accountInfo.lamports / web3.LAMPORTS_PER_SOL,
      }
    })
  }

  //getStakeAccounts().then(x => setStakeAccounts(x))

  const [stakeAccounts, setStakeAccounts] = useState<StakeAccount[]>([])

  const validateInstruction = async (): Promise<boolean> => {
    if (!form.governedTokenAccount) return false

    const stakingAccounts = await getStakeAccounts()
    setStakeAccounts(stakingAccounts)

    if (
      !form.stakingAccount ||
      !form.stakingAccount.stakeAccount ||
      !form.stakingAccount.delegatedValidator
    )
      return false
    return true
  }

  async function getInstruction(): Promise<UiInstruction> {
    const isValid = await validateInstruction()
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
      !form.governedTokenAccount?.isSol ||
      !form.stakingAccount?.stakeAccount
    ) {
      console.log('Invalid form')
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
