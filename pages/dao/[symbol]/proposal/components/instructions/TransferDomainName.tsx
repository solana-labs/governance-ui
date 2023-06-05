import React, { useContext, useEffect, useMemo, useState } from 'react'
import * as yup from 'yup'
import {
  Governance,
  ProgramAccount,
  serializeInstructionToBase64,
} from '@solana/spl-governance'
import { PublicKey } from '@solana/web3.js'
import { validateInstruction } from '@utils/instructionTools'
import {
  DomainNameTransferForm,
  UiInstruction,
} from '@utils/uiTypes/proposalCreationTypes'
import { transferInstruction, NAME_PROGRAM_ID } from '@bonfida/spl-name-service'
import { NewProposalContext } from '../../new'
import GovernedAccountSelect from '../GovernedAccountSelect'

import { LoadingDots } from '@components/Loading'
import useGovernanceAssets from '@hooks/useGovernanceAssets'
import Select from '@components/inputs/Select'
import Input from '@components/inputs/Input'
import { isPublicKey } from '@tools/core/pubkey'
import { AssetAccount } from '@utils/uiTypes/assets'
import { useDomainQuery } from '@hooks/queries/domain'

const TransferDomainName = ({
  index,
  governance,
}: {
  index: number
  governance: ProgramAccount<Governance> | null
}) => {
  const shouldBeGoverned = !!(index !== 0 && governance)
  const { handleSetInstructions } = useContext(NewProposalContext)

  const { assetAccounts } = useGovernanceAssets()

  const [formErrors, setFormErrors] = useState({})
  const [form, setForm] = useState<DomainNameTransferForm>({
    destinationAccount: '',
    governedAccount: undefined,
    domainAddress: undefined,
  })

  const { data: accountDomains, status } = useDomainQuery(
    form.governedAccount?.pubkey
  )

  const selectedDomain = useMemo(
    () => accountDomains?.find((d) => d.domainAddress === form.domainAddress),
    [accountDomains, form.domainAddress]
  )

  const handleSetForm = ({ propertyName, value }) => {
    setFormErrors({})
    setForm({ ...form, [propertyName]: value })
  }

  async function getInstruction(): Promise<UiInstruction> {
    const isValid = await validateInstruction({
      schema,
      form,
      setFormErrors,
    })

    const obj: UiInstruction = {
      serializedInstruction: '',
      isValid,
      governance: form.governedAccount?.governance,
    }

    if (
      isValid &&
      form.destinationAccount &&
      form.domainAddress &&
      form.governedAccount
    ) {
      const nameProgramId = new PublicKey(NAME_PROGRAM_ID)
      const nameAccountKey = new PublicKey(form.domainAddress)
      const newOwnerKey = new PublicKey(form.destinationAccount)
      const nameOwner = form.governedAccount.pubkey

      const transferIx = transferInstruction(
        nameProgramId,
        nameAccountKey,
        newOwnerKey,
        nameOwner
      )

      obj.serializedInstruction = serializeInstructionToBase64(transferIx)
    }
    return obj
  }

  useEffect(() => {
    // if governed account should change the domain address field should be cleared
    handleSetForm({
      value: undefined,
      propertyName: 'domainAddress',
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.governedAccount])

  useEffect(() => {
    handleSetInstructions(
      { governedAccount: form.governedAccount?.governance, getInstruction },
      index
    )
    // eslint-disable-next-line react-hooks/exhaustive-deps -- TODO please fix, it can cause difficult bugs. You might wanna check out https://bobbyhadz.com/blog/react-hooks-exhaustive-deps for info. -@asktree
  }, [form])

  const schema = yup.object().shape({
    governedAccount: yup
      .object()
      .nullable()
      .required('Governed account is required'),
    destinationAccount: yup
      .string()
      .required('Please provide a valid destination account')
      .test({
        name: 'is-valid-account',
        test(val, ctx) {
          if (!val || !isPublicKey(val)) {
            return ctx.createError({
              message: 'Please verify the account address',
            })
          }
          return true
        },
      }),
    domainAddress: yup.string().required('Please select a domain name'),
  })

  return (
    <>
      <GovernedAccountSelect
        label="Governance"
        governedAccounts={assetAccounts}
        onChange={(value: AssetAccount) => {
          handleSetForm({ value, propertyName: 'governedAccount' })
        }}
        value={form.governedAccount}
        error={formErrors['governedAccount']}
        shouldBeGoverned={shouldBeGoverned}
        governance={governance}
        type="wallet"
      ></GovernedAccountSelect>
      <Input
        label="Destination Account"
        value={form.destinationAccount}
        type="text"
        onChange={(element) =>
          handleSetForm({
            propertyName: 'destinationAccount',
            value: element.target.value,
          })
        }
        error={formErrors['destinationAccount']}
      />
      {form.governedAccount && status === 'loading' ? (
        <div className="mt-5">
          <div>Looking up Domains...</div>
          <LoadingDots />
        </div>
      ) : (
        <Select
          className=""
          label="Domain"
          value={selectedDomain ? selectedDomain.domainName + '.sol' : ''}
          placeholder="Please select..."
          error={formErrors['domainAddress']}
          onChange={(value) => {
            handleSetForm({
              value: accountDomains?.find((d) => d.domainName === value)
                ?.domainAddress,
              propertyName: 'domainAddress',
            })
          }}
        >
          {accountDomains?.map(
            (domain, index) =>
              domain.domainAddress && (
                <Select.Option
                  key={domain.domainName! + index}
                  value={domain.domainName}
                >
                  <div className="text-fgd-1 mb-2">{domain.domainName}.sol</div>
                  <div className="">{domain.domainAddress}</div>
                </Select.Option>
              )
          )}
        </Select>
      )}
    </>
  )
}

export default TransferDomainName
