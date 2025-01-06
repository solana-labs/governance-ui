import React, { useContext, useEffect, useState } from 'react'
import * as yup from 'yup'

import {
  Governance,
  ProgramAccount,
  serializeInstructionToBase64,
} from '@solana/spl-governance'

import {
  PublicKey,
  StakeProgram,
  TransactionInstruction,
} from '@solana/web3.js'
import BufferLayout from 'buffer-layout'

import {
  UiInstruction,
  ValidatorRemoveLockup,
} from '@utils/uiTypes/proposalCreationTypes'
import { NewProposalContext } from '../../../new'
import { isFormValid } from '@utils/formValidation'
//import { web3 } from '@coral-xyz/anchor'
import useGovernanceAssets from '@hooks/useGovernanceAssets'
import GovernedAccountSelect from '../../GovernedAccountSelect'
import Input from '@components/inputs/Input'
//import { bs58 } from '@coral-xyz/anchor/dist/cjs/utils/bytes'
//import { StakeAccount, StakeState } from '@utils/uiTypes/assets'
//import { getFilteredProgramAccounts } from '@utils/helpers'
import useLegacyConnectionContext from '@hooks/useLegacyConnectionContext'

const RemoveLockup = ({
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
  const [form, setForm] = useState<ValidatorRemoveLockup>({
    governedTokenAccount: undefined,
    stakeAccount: '',
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

  const setStakeAccount = (event) => {
    const value = event.target.value
    handleSetForm({
      value: value,
      propertyName: 'stakeAccount',
    })
  }

  //   const getStakeAccounts = async (): Promise<StakeAccount[]> => {
  //     if (!form.governedTokenAccount) return []

  //     const accountsNotYetStaked = await getFilteredProgramAccounts(
  //       connection.current,
  //       StakeProgram.programId,
  //       [
  //         {
  //           memcmp: {
  //             offset: 0,
  //             bytes: bs58.encode([1, 0, 0, 0]),
  //           },
  //         },
  //         {
  //           memcmp: {
  //             offset: 44,
  //             bytes: form.governedTokenAccount.pubkey.toBase58(),
  //           },
  //         },
  //       ]
  //     )

  //     const accountsStaked = await getFilteredProgramAccounts(
  //       connection.current,
  //       StakeProgram.programId,
  //       [
  //         {
  //           memcmp: {
  //             offset: 0,
  //             bytes: bs58.encode([2, 0, 0, 0]),
  //           },
  //         },
  //         {
  //           memcmp: {
  //             offset: 44,
  //             bytes: form.governedTokenAccount.pubkey.toBase58(),
  //           },
  //         },
  //       ]
  //     )

  //     const stakingAccounts = accountsNotYetStaked.concat(
  //       accountsStaked.filter((x) => {
  //         // filter all accounts which are not yet deactivated
  //         const data = x.accountInfo.data.slice(172, 172 + 8)
  //         return !data.equals(
  //           Buffer.from([255, 255, 255, 255, 255, 255, 255, 255])
  //         )
  //       })
  //     )

  //     return stakingAccounts.map((x) => {
  //       return {
  //         stakeAccount: x.publicKey,
  //         state: StakeState.Inactive,
  //         delegatedValidator: web3.PublicKey.default,
  //         amount: x.accountInfo.lamports / web3.LAMPORTS_PER_SOL,
  //       }
  //     })
  //   }

  //const [stakeAccounts, setStakeAccounts] = useState<StakeAccount[]>([])

  const validateInstruction = async (): Promise<boolean> => {
    //const stakingAccounts = await getStakeAccounts()
    //setStakeAccounts(stakingAccounts)

    if (!form.stakeAccount) return false

    const schema = yup.object().shape({
      stakeAccount: yup.string().required('Stake account is required'),
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
    console.log(governanceAccount)
    if (
      !connection ||
      !isValid ||
      !programId ||
      !governanceAccount ||
      !governancePk ||
      !form.governedTokenAccount?.isSol ||
      !form.stakeAccount
    ) {
      return returnInvalid()
    }

    const authorizedPubkey = form.governedTokenAccount.extensions
      .transferAddress!
    const stakePubkey = new PublicKey(form.stakeAccount)

    //greed dao test pubkey stake account pk 14SPGuYJANnAhmpKy6bwXKJ5Njqxnr8k2jZ9DnzN84de

    const layout = BufferLayout.struct([
      BufferLayout.u32('instruction'),
      BufferLayout.u8('hasUnixTimestamp'),
      BufferLayout.ns64('unixTimestamp'),
      BufferLayout.u8('hasEpoch'),
      //add epoch field if needed
      BufferLayout.u8('hasCustodian'),
      //add custodian field if needed
    ])
    const data = Buffer.alloc(layout.span)

    //any date in past will unlock the stake account.
    layout.encode(
      {
        //lockup instruction index in stake program
        instruction: 6,
        //option padding
        hasUnixTimestamp: 1,
        //any past time unixtimestamp
        unixTimestamp: 1715685793,
      },
      data
    )

    const keys = [
      {
        pubkey: stakePubkey,
        isWritable: true,
        isSigner: false,
      },
      {
        pubkey: authorizedPubkey,
        isWritable: false,
        isSigner: true,
      },
    ]

    const instruction = new TransactionInstruction({
      keys,
      programId,
      data,
    })

    return {
      serializedInstruction: serializeInstructionToBase64(instruction),
      additionalSerializedInstructions: [],
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
  }, [form, governedAccount])
  useEffect(() => {
    setGovernedAccount(form.governedTokenAccount?.governance)
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
      <Input
        label="Stake"
        value={form.stakeAccount}
        error={formErrors['stakeAccount']}
        type="text"
        onChange={setStakeAccount}
      />
    </>
  )
}

export default RemoveLockup
