/* eslint-disable @typescript-eslint/no-non-null-assertion */
import * as yup from 'yup'
import useInstructionFormBuilder from '@hooks/useInstructionFormBuilder'
import createSetRedeemableGlobalSupplyCapInstruction from '@tools/sdk/uxdProtocol/createSetRedeemableGlobalSupplyCapInstruction'
import { SetRedeemableGlobalSupplyCapForm } from '@utils/uiTypes/proposalCreationTypes'
import Input from '@components/inputs/Input'
import { GovernedMultiTypeAccount } from '@utils/tokens'

const SetRedeemGlobalSupplyCap = ({
  index,
  governedAccount,
}: {
  index: number
  governedAccount?: GovernedMultiTypeAccount
}) => {
  const {
    form,
    formErrors,
    handleSetForm,
  } = useInstructionFormBuilder<SetRedeemableGlobalSupplyCapForm>({
    index,
    initialFormValues: {
      governedAccount,
      supplyCap: 0,
    },
    schema: yup.object().shape({
      governedAccount: yup
        .object()
        .nullable()
        .required('Program governed account is required'),
      supplyCap: yup
        .number()
        .moreThan(0, 'Redeemable global supply cap should be more than 0')
        .required('Redeemable global supply cap is required'),
    }),
    buildInstruction: async function () {
      if (!governedAccount?.governance?.account) {
        throw new Error('Governance must be a Program Account Governance')
      }
      return createSetRedeemableGlobalSupplyCapInstruction(
        form.governedAccount!.governance.account.governedAccount,
        form.supplyCap,
        form.governedAccount!.governance.pubkey
      )
    },
  })

  return (
    <Input
      label="Redeem Global Supply Cap"
      value={form.supplyCap}
      type="number"
      min={0}
      onChange={(evt) =>
        handleSetForm({
          value: evt.target.value,
          propertyName: 'supplyCap',
        })
      }
      error={formErrors['supplyCap']}
    />
  )
}

export default SetRedeemGlobalSupplyCap
