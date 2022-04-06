import * as yup from 'yup'
import useInstructionFormBuilder from '@hooks/useInstructionFormBuilder'
import { initObligationAccount } from '@tools/sdk/solend/initObligationAccount'
import { GovernedMultiTypeAccount } from '@utils/tokens'
import { InitSolendObligationAccountForm } from '@utils/uiTypes/proposalCreationTypes'

const schema = yup.object().shape({
  governedAccount: yup
    .object()
    .nullable()
    .required('Governed account is required'),
})

const InitObligationAccount = ({
  index,
  governedAccount,
}: {
  index: number
  governedAccount?: GovernedMultiTypeAccount
}) => {
  const {
    connection,
  } = useInstructionFormBuilder<InitSolendObligationAccountForm>({
    index,
    initialFormValues: {
      governedAccount,
    },
    schema,
    buildInstruction: async function ({ governedAccountPubkey }) {
      return initObligationAccount({
        obligationOwner: governedAccountPubkey,
      })
    },
  })

  // Hardcoded gate used to be clear about what cluster is supported for now
  if (connection.cluster !== 'mainnet') {
    return <>This instruction does not support {connection.cluster}</>
  }

  return null
}

export default InitObligationAccount
