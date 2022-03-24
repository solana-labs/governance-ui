/* eslint-disable @typescript-eslint/no-non-null-assertion */
import React from 'react'
import * as yup from 'yup'
;('@hooks/useGovernedMultiTypeAccounts')
import useInstructionFormBuilder from '@hooks/useInstructionFormBuilder'
import { createObligationAccount } from '@tools/sdk/solend/createObligationAccount'
import { GovernedMultiTypeAccount } from '@utils/tokens'
import { CreateSolendObligationAccountForm } from '@utils/uiTypes/proposalCreationTypes'

const CreateObligationAccount = ({
  index,
  governedAccount,
}: {
  index: number
  governedAccount?: GovernedMultiTypeAccount
}) => {
  const {
    wallet,
    connection,
  } = useInstructionFormBuilder<CreateSolendObligationAccountForm>({
    index,
    initialFormValues: {
      governedAccount,
    },
    schema: yup.object().shape({
      governedAccount: yup
        .object()
        .nullable()
        .required('Governed account is required'),
    }),
    buildInstruction: async function () {
      return createObligationAccount({
        fundingAddress: wallet!.publicKey!,
        walletAddress: governedAccount!.governance.pubkey,
      })
    },
  })

  // Hardcoded gate used to be clear about what cluster is supported for now
  if (connection.cluster !== 'mainnet') {
    return <>This instruction does not support {connection.cluster}</>
  }

  // only need governance select for this instruction
  return null
}

export default CreateObligationAccount
