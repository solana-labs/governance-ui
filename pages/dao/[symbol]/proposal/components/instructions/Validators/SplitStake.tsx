import React, { useContext, useEffect, useState } from 'react'
import * as yup from 'yup'

import {
  Governance,
  ProgramAccount,
  serializeInstructionToBase64,
} from '@solana/spl-governance'

import { Connection, PublicKey, StakeProgram } from '@solana/web3.js'

import {
  UiInstruction,
  ValidatorWithdrawStakeForm,
} from '@utils/uiTypes/proposalCreationTypes'
import { NewProposalContext } from '../../../new'
import { isFormValid } from '@utils/formValidation'
import { web3 } from '@coral-xyz/anchor'
import useGovernanceAssets from '@hooks/useGovernanceAssets'
import GovernedAccountSelect from '../../GovernedAccountSelect'
import StakeAccountSelect from '../../StakeAccountSelect'
import Input from '@components/inputs/Input'
import { bs58 } from '@coral-xyz/anchor/dist/cjs/utils/bytes'
import { StakeAccount, StakeState } from '@utils/uiTypes/assets'
import { parseMintNaturalAmountFromDecimal } from '@tools/sdk/units'
import { getFilteredProgramAccounts } from '@utils/helpers'
import useLegacyConnectionContext from '@hooks/useLegacyConnectionContext'

const SplitStake = ({
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
        .min(0.001, 'Amount must be positive number')
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
    const authorizedPubkey = form.governedTokenAccount.extensions
      .transferAddress!
    const stakePubkey = new PublicKey(form.stakingAccount.stakeAccount)
    const rent = await connection.current.getMinimumBalanceForRentExemption(200)
    const splitStakeAccount = await genShortestUnusedSeed(
      connection.current,
      authorizedPubkey,
      StakeProgram.programId
    )

    const instruction = web3.StakeProgram.splitWithSeed({
      stakePubkey,
      authorizedPubkey,
      splitStakePubkey: splitStakeAccount.derived,
      lamports: realAmount + rent,
      basePubkey: authorizedPubkey,
      seed: splitStakeAccount.seed!,
    })

    return {
      serializedInstruction: '',
      additionalSerializedInstructions: instruction.instructions.map((x) =>
        serializeInstructionToBase64(x)
      ),
      isValid: true,
      governance: form.governedTokenAccount.governance,
      chunkBy: 1,
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
        type="token"
      ></GovernedAccountSelect>
      <StakeAccountSelect
        label="Staking Account"
        stakeAccounts={stakeAccounts}
        value={form.stakingAccount}
        error={formErrors['stakingAccount']}
        onChange={setStakingAccount}
      />
      <Input
        label="Split Amount"
        value={form.amount}
        error={formErrors['amount']}
        type="number"
        onChange={setAmount}
      />
    </>
  )
}

const genShortestUnusedSeed = async (
  connection: Connection,
  basePubkey: PublicKey,
  programId: PublicKey
) => {
  const MAX_SEED_LEN = 32
  const ASCII_MAX = 127
  let len = 1
  // find the smallest available seed to optimize for small tx size
  while (len <= MAX_SEED_LEN) {
    const codes = new Array(len).fill(0)
    while (!codes.every((c) => c === ASCII_MAX)) {
      // check current seed unused
      const seed = String.fromCharCode(...codes)
      // eslint-disable-next-line no-await-in-loop
      const derived = await PublicKey.createWithSeed(
        basePubkey,
        seed,
        programId
      )
      // eslint-disable-next-line no-await-in-loop
      const balance = await connection.getBalance(derived)
      if (balance === 0) {
        return {
          base: basePubkey,
          derived,
          seed,
        }
      }
      // current seed used, increment code
      codes[codes.length - 1]++
      for (let i = codes.length - 1; i > 0; i--) {
        const prevI = i - 1
        if (codes[i] > ASCII_MAX) {
          codes[i] = 0
          codes[prevI]++
        }
      }
    }
    // all seeds of current len are used
    len++
  }
  throw new Error('No unused seeds found')
}

export default SplitStake
