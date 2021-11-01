import React, { useContext, useEffect, useState } from 'react'
import dayjs from 'dayjs'
import * as yup from 'yup'

import useInstructions from '@hooks/useInstructions'
import { PublicKey } from '@solana/web3.js'
import useRealm from 'hooks/useRealm'
import { Governance } from 'models/accounts'
import { ParsedAccount } from 'models/core/accounts'
import useWalletStore from 'stores/useWalletStore'
import {
  FundAssemblyBudgetForm,
  Instruction,
} from 'utils/uiTypes/proposalCreationTypes'
import { getMintMinAmountAsDecimal } from '@tools/sdk/units'
import { precision } from '@utils/formatting'
import { NewProposalContext } from '../../new'
import { isFormValid } from '@utils/formValidation'
import SourceTokenAccountSelect from '../SourceTokenAccountSelect'
import { validateDestinationAccAddress } from '@utils/validations'
import { StyledLabel } from '@components/inputs/styles'

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
  const connection = useWalletStore((s) => s.connection)
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
    redeemStart: dayjs().endOf('month').add(7, 'days'),
  })

  const [formErrors, setFormErrors] = useState({})
  const mintMinAmount = form.rewardMintInfo
    ? getMintMinAmountAsDecimal(form.rewardMintInfo)
    : 1
  const currentPrecision = precision(mintMinAmount)
  const { handleSetInstructions } = useContext(NewProposalContext)
  const handleSetForm = ({ propertyName, value }) => {
    setFormErrors({})
    setForm({ ...form, [propertyName]: value })
  }
  const setMintInfo = (value) => {
    setForm({ ...form, rewardMintInfo: value })
  }

  const validateInstruction = async (): Promise<boolean> => {
    const { isValid, validationErrors } = await isFormValid(schema, form)
    setFormErrors(validationErrors)
    return isValid
  }
  async function getInstructions(): Promise<Instruction[]> {
    const isValid = await validateInstruction()
    const now = new Date()
    let serializedInstruction = ''

    if (
      isValid &&
      programId &&
      form.distributors.length > 0 &&
      form.rewardMintInfo &&
      form.distEnd.isAfter(now) &&
      form.reviewEnd.isAfter(form.distEnd) &&
      form.redeemStart.isAfter(form.reviewEnd)
    ) {
      /* TODO: create all instructions
      const mintAmount = parseMintNaturalAmountFromDecimal(
        form.amount!,
        form.mintInfo?.decimals
      )

      const transferIx = Token.createTransferInstruction(
        TOKEN_PROGRAM_ID,
        form.governedAccount.token?.account.address,
        new PublicKey(form.destinationAccount),
        form.governedAccount.governance!.pubkey,
        [],
        mintAmount
      )
      serializedInstruction = serializeInstructionToBase64(transferIx)
      */
      serializedInstruction = ''
    }
    const ixs: Instruction[] = [
      {
        serializedInstruction,
        isValid,
        governedAccount: form.governedAccount,
      },
    ]
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
