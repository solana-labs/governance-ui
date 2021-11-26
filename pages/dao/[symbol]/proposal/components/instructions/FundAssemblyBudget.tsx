import React, { useContext, useEffect, useState } from 'react'
import dayjs from 'dayjs'
import * as yup from 'yup'
import * as anchor from '@project-serum/anchor'

import useInstructions from '@hooks/useInstructions'
import { PublicKey, TransactionInstruction } from '@solana/web3.js'
import useRealm from 'hooks/useRealm'
import { Governance } from 'models/accounts'
import { ParsedAccount } from 'models/core/accounts'
import useWalletStore from 'stores/useWalletStore'
import {
  FundAssemblyBudgetForm,
  Instruction,
} from 'utils/uiTypes/proposalCreationTypes'
import { NewProposalContext } from '../../new'
import { isFormValid } from '@utils/formValidation'
import SourceTokenAccountSelect from '../SourceTokenAccountSelect'
import { StyledLabel } from '@components/inputs/styles'

import { serializeInstructionToBase64 } from '@models/serialisation'
import { AssemblyClient } from '@models/assembly'
import Input from '@components/inputs/Input'
import { Wallet } from '@project-serum/anchor'

const AddNewDistributorForm = ({ form, setForm }) => {
  const [authority, setAuthority] = useState('')
  const [amount, setAmount] = useState('')

  const submit = (e) => {
    const distributors = form.distributors.concat([{ amount, authority }])
    setForm({
      ...form,
      distributors,
    })
    e.preventDefault()
    setAuthority('')
    setAmount('')
  }

  return (
    <div className="mb-3 border border-fgd-4 p-4 md:p-6 rounded-lg">
      <form onSubmit={submit}>
        <div>
          <StyledLabel>Authority</StyledLabel>

          <input
            className="p-3 w-full bg-bkg-1 rounded-md text-sm text-fgd-1 border border-fgd-3 default-transition max-w-lg hover:border-primary-light focus:border-primary-light focus:outline-none border-fgd-4"
            type="text"
            name="authority"
            value={authority}
            placeholder="User's SOL / wallet address"
            onChange={(e) => setAuthority(e.target.value)}
          />
        </div>

        <div className="pt-4">
          <StyledLabel> Amount:</StyledLabel>

          <input
            className="p-3 w-full bg-bkg-1 rounded-md text-sm text-fgd-1 border border-fgd-3 default-transition max-w-lg hover:border-primary-light focus:border-primary-light focus:outline-none border-fgd-4"
            type="number"
            name="amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
        </div>

        <input
          type="submit"
          value="Add new allocation"
          onSubmit={submit}
          className="mt-3 bg-bkg-2 border border-primary-light default-transition font-bold rounded-full px-4 py-1 text-primary-light text-xs hover:border-primary-dark hover:text-primary-dark focus:outline-none disabled:border-fgd-3 disabled:text-fgd-3 disabled:cursor-not-allowed"
        />
      </form>
    </div>
  )
}

const FundAssemblyBudget = ({
  index,
  governance,
}: {
  index: number
  governance: ParsedAccount<Governance> | null
}) => {
  const connection = useWalletStore((s) => s.connection.current)
  const wallet = useWalletStore((s) => s.current)
  const { realmInfo } = useRealm()
  const { governedTokenAccounts } = useInstructions()
  const shouldBeGoverned = index !== 0 && governance
  const programId: PublicKey | undefined = realmInfo?.programId
  const [form, setForm] = useState<FundAssemblyBudgetForm>({
    governedAccount: undefined,
    rewardMintInfo: undefined,
    distributors: [],
    distEnd: dayjs().endOf('month'),
    reviewEnd: dayjs().endOf('month').add(7, 'days'),
    redeemStart: dayjs().endOf('month').add(7, 'days').add(1, 'minute'),
  })

  const [formErrors, setFormErrors] = useState({})

  const { handleSetInstructions } = useContext(NewProposalContext)
  const handleSetForm = ({ propertyName, value }) => {
    setFormErrors({})
    setForm({ ...form, [propertyName]: value })
  }
  const setMintInfo = (value) => {
    setForm({ ...form, rewardMintInfo: value })
  }
  const setFormDate = (propertyName) => (event) =>
    handleSetForm({
      propertyName,
      value: dayjs(event.target.value),
    })

  const validateInstruction = async (): Promise<boolean> => {
    const { isValid, validationErrors } = await isFormValid(schema, form)
    setFormErrors(validationErrors)
    return isValid
  }
  async function getInstructions(): Promise<Instruction[]> {
    const isValid = await validateInstruction()
    const now = new Date()
    const instructions: TransactionInstruction[] = []

    console.log(
      'getInstructions',
      !!isValid,
      !!programId,
      !!form.distributors.length,
      form.distEnd.isAfter(now),
      form.reviewEnd.isAfter(form.distEnd),
      form.redeemStart.isAfter(form.reviewEnd)
    )

    if (
      isValid &&
      programId &&
      form.distributors.length >= 0 &&
      form.distEnd.isAfter(now) &&
      form.reviewEnd.isAfter(form.distEnd) &&
      form.redeemStart.isAfter(form.reviewEnd)
    ) {
      const programId = new PublicKey(
        '7BcUuHjJFLkcY2ahoMqwAjntC8F822fTAs4V2MZSZLw9'
      )

      console.log({ connection, wallet })
      const provider = new anchor.Provider(
        connection,
        (wallet as unknown) as Wallet,
        anchor.Provider.defaultOptions()
      )

      console.log({ provider })

      const client = await AssemblyClient.connect(programId, provider)

      const rewardMintPk = form.governedAccount?.mint?.publicKey
      const governancePk = form.governedAccount?.governance?.pubkey
      const distributors = form.distributors.map((v) => ({
        ...v,
        authority: new PublicKey(v.authority),
      }))

      const distMintPk = await client.prepareDistMint(
        rewardMintPk!,
        distributors,
        governancePk
      )

      console.log('distMintPk', distMintPk.toString())

      const { ix } = await client.createDistributorInstruction(
        distMintPk,
        rewardMintPk!,
        governancePk!,
        form.distEnd.unix(),
        form.redeemStart.unix()
      )
      instructions.push(ix)

      const ixs = await client.mintBudgetInstructions(
        distMintPk,
        rewardMintPk!,
        distributors,
        governancePk
      )

      console.log('ixs', ixs)

      instructions.push(...ixs)
    }

    const ixs: Instruction[] = instructions.map((ix) => ({
      serializedInstruction: serializeInstructionToBase64(ix),
      isValid,
      governedAccount: form.governedAccount,
    }))
    return ixs
  }

  useEffect(() => {
    handleSetForm({
      propertyName: 'programId',
      value: programId?.toString(),
    })
  }, [realmInfo?.programId])
  useEffect(() => {
    setMintInfo(form.governedAccount?.mint?.account)
  }, [form.governedAccount?.token?.publicKey])

  useEffect(() => {
    handleSetInstructions(
      { governedAccount: form.governedAccount, getInstructions },
      index
    )
  }, [form])

  const schema = yup.object().shape({
    governedAccount: yup
      .object()
      .nullable()
      .required('Source account is required'),
  })

  return (
    <>
      <Input
        label="Distribution End"
        value={form.distEnd.format('YYYY-MM-DDThh:mm')}
        type="datetime-local"
        onChange={setFormDate('distEnd')}
        error={formErrors['distEnd']}
      />
      <Input
        label="Review End"
        value={form.reviewEnd.format('YYYY-MM-DDThh:mm')}
        type="datetime-local"
        onChange={setFormDate('reviewEnd')}
        error={formErrors['reviewEnd']}
      />
      <Input
        label="Redemption Start"
        value={form.redeemStart.format('YYYY-MM-DDThh:mm')}
        type="datetime-local"
        onChange={setFormDate('redeemStart')}
        error={formErrors['redeemStart']}
      />
      <SourceTokenAccountSelect
        governedTokenAccounts={governedTokenAccounts}
        onChange={(value) =>
          handleSetForm({ value, propertyName: 'governedAccount' })
        }
        value={form.governedAccount?.token?.account?.address?.toString()}
        error={formErrors['governedAccount']}
        shouldBeGoverned={shouldBeGoverned}
        governance={governance}
      ></SourceTokenAccountSelect>
      <table className="table-auto gap-1 space-1 text-left">
        {form.distributors.length > 0 ? (
          <thead>
            <tr>
              <th>Authority</th>
              <th>Amount</th>
              <th></th>
            </tr>
          </thead>
        ) : (
          <></>
        )}
        <tbody>
          {form.distributors.map((d, i) => (
            <>
              <tr key={i}>
                <td className="pr-2">{d.authority.toString()}</td>
                <td className="pr-2">{d.amount.toString()}</td>
                <td>
                  <button
                    className="flex-4 border border-primary-light default-transition font-bold rounded-full px-4 py-1 text-primary-light text-xs hover:border-primary-dark hover:text-primary-dark focus:outline-none disabled:border-fgd-3 disabled:text-fgd-3 disabled:cursor-not-allowed"
                    onClick={() => {
                      const cpy = [...form.distributors]
                      cpy.splice(i, 1)
                      setForm({
                        ...form,
                        distributors: cpy,
                      })
                    }}
                  >
                    Remove
                  </button>
                </td>
              </tr>
            </>
          ))}
        </tbody>
      </table>
      <div>
        <AddNewDistributorForm form={form} setForm={setForm} />
      </div>
    </>
  )
}

export default FundAssemblyBudget
