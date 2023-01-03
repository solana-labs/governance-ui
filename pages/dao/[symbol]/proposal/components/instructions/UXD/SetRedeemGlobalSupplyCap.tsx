/* eslint-disable @typescript-eslint/no-non-null-assertion */
import * as yup from 'yup';
import useInstructionFormBuilder from '@hooks/useInstructionFormBuilder';
import createSetRedeemableGlobalSupplyCapInstruction from '@tools/sdk/uxdProtocol/createSetRedeemableGlobalSupplyCapInstruction';
import { UXDSetRedeemableGlobalSupplyCapForm } from '@utils/uiTypes/proposalCreationTypes';
import { GovernedMultiTypeAccount } from '@utils/tokens';
import InputNumber from '@components/inputs/InputNumber';

const schema = yup.object().shape({
  governedAccount: yup
    .object()
    .nullable()
    .required('Program governed account is required'),
  supplyCap: yup
    .number()
    .moreThan(0, 'Redeemable global supply cap should be more than 0')
    .required('Redeemable global supply cap is required'),
});

const SetRedeemGlobalSupplyCap = ({
  index,
  governedAccount,
}: {
  index: number;
  governedAccount?: GovernedMultiTypeAccount;
}) => {
  const {
    form,
    formErrors,
    handleSetForm,
  } = useInstructionFormBuilder<UXDSetRedeemableGlobalSupplyCapForm>({
    index,
    initialFormValues: {
      governedAccount,
      supplyCap: 0,
    },
    schema,
    buildInstruction: async function ({ form, governedAccountPubkey }) {
      return createSetRedeemableGlobalSupplyCapInstruction({
        uxdProgramId: form.governedAccount!.governance!.account.governedAccount,
        supplyCapUiAmount: form.supplyCap,
        authority: governedAccountPubkey,
      });
    },
  });

  return (
    <InputNumber
      label="Redeem Global Supply Cap"
      value={form.supplyCap}
      min={0}
      onChange={(value) =>
        handleSetForm({
          value: value,
          propertyName: 'supplyCap',
        })
      }
      error={formErrors['supplyCap']}
    />
  );
};

export default SetRedeemGlobalSupplyCap;
