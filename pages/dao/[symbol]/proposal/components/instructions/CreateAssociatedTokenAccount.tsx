/* eslint-disable @typescript-eslint/no-non-null-assertion */
import React from 'react'
import * as yup from 'yup'
import Select from '@components/inputs/Select'
import useInstructionFormBuilder from '@hooks/useInstructionFormBuilder'
import { createAssociatedTokenAccount } from '@utils/associated'
import { getSplTokenMintAddressByUIName, SPL_TOKENS } from '@utils/splTokens'
import { GovernedMultiTypeAccount } from '@utils/tokens'
import { CreateAssociatedTokenAccountForm } from '@utils/uiTypes/proposalCreationTypes'

const CreateAssociatedTokenAccount = ({
  index,
  governedAccount,
}: {
  index: number
  governedAccount?: GovernedMultiTypeAccount
}) => {
  const {
    wallet,
    form,
    formErrors,
    handleSetForm,
  } = useInstructionFormBuilder<CreateAssociatedTokenAccountForm>({
    index,
    initialFormValues: {
      governedAccount,
    },
    schema: yup.object().shape({
      governedAccount: yup
        .object()
        .nullable()
        .required('Governed account is required'),
      splTokenMintUIName: yup.string().required('SPL Token Mint is required'),
    }),
    buildInstruction: async function () {
      const [tx] = await createAssociatedTokenAccount(
        // fundingAddress
        wallet!.publicKey!,

        // walletAddress
        governedAccount!.governance.pubkey,

        // splTokenMintAddress
        getSplTokenMintAddressByUIName(form.splTokenMintUIName!)
      )
      return tx
    },
  })

  return (
    <Select
      label="SPL Token Mint"
      value={form.splTokenMintUIName}
      placeholder="Please select..."
      onChange={(value) =>
        handleSetForm({ value, propertyName: 'splTokenMintUIName' })
      }
      error={formErrors['baseTokenName']}
    >
      {Object.entries(SPL_TOKENS).map(([key, { name, mint }]) => (
        <Select.Option key={key} value={name}>
          <div className="flex flex-col">
            <span>{name}</span>

            <span className="text-gray-500 text-sm">{mint.toString()}</span>
          </div>
        </Select.Option>
      ))}
    </Select>
  )
}

export default CreateAssociatedTokenAccount
