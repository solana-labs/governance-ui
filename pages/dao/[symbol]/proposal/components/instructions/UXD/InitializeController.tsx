import * as yup from 'yup'
import { PublicKey } from '@solana/web3.js'
import Input from '@components/inputs/Input'
import useInstructionFormBuilder from '@hooks/useInstructionFormBuilder'
import createInitializeControllerInstruction from '@tools/sdk/uxdProtocol/createInitializeControllerInstruction'
import { GovernedMultiTypeAccount } from '@utils/tokens'
import { InitializeControllerForm } from '@utils/uiTypes/proposalCreationTypes'

const InitializeController = ({
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
  } = useInstructionFormBuilder<InitializeControllerForm>({
    index,
    initialFormValues: {
      governedAccount,
      mintDecimals: 0,
    },
    schema: yup.object().shape({
      mintDecimals: yup
        .number()
        .min(0, 'Mint decimals cannot be less than 0')
        .max(9, 'Mint decimals cannot be more than 9')
        .required('Mint Decimals is required'),
      governedAccount: yup
        .object()
        .nullable()
        .required('Governance account is required'),
    }),
    buildInstruction: async function () {
      if (!governedAccount?.governance?.account) {
        throw new Error('Governance must be a Program Account Governance')
      }
      return createInitializeControllerInstruction(
        form.governedAccount!.governance.account.governedAccount,
        form.mintDecimals,
        form.governedAccount!.governance.pubkey,
        new PublicKey(wallet!.publicKey!.toBase58())
      )
    },
  })

  return (
    <>
      <Input
        label="Mint Decimals"
        value={form.mintDecimals}
        type="number"
        min={0}
        max={9}
        onChange={(evt) =>
          handleSetForm({
            value: evt.target.value,
            propertyName: 'mintDecimals',
          })
        }
        error={formErrors['mintDecimals']}
      />
    </>
  )
}

export default InitializeController
