import * as yup from 'yup';
import Input from '@components/inputs/Input';
import useInstructionFormBuilder from '@hooks/useInstructionFormBuilder';
import createSetMangoDepositoriesRedeemableSoftCapInstruction from '@tools/sdk/uxdProtocol/createSetMangoDepositoriesRedeemableSoftCapInstruction';
import { GovernedMultiTypeAccount } from '@utils/tokens';
import { UXDSetMangoDepositoriesRedeemableSoftCapForm } from '@utils/uiTypes/proposalCreationTypes';

const schema = yup.object().shape({
  governedAccount: yup
    .object()
    .nullable()
    .required('Governance account is required'),
  softCap: yup
    .number()
    .moreThan(0, 'Redeemable soft cap should be more than 0')
    .required('Redeemable soft cap is required'),
});

const SetMangoDepositoriesRedeemableSoftCap = ({
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
  } = useInstructionFormBuilder<UXDSetMangoDepositoriesRedeemableSoftCapForm>({
    index,
    initialFormValues: {
      governedAccount,
      softCap: 0,
    },
    schema,
    buildInstruction: async function ({ form, governedAccountPubkey }) {
      return createSetMangoDepositoriesRedeemableSoftCapInstruction({
        uxdProgramId: form.governedAccount!.governance!.account.governedAccount,
        softCapUiAmount: form.softCap,
        authority: governedAccountPubkey,
      });
    },
  });

  return (
    <Input
      label="Redeem Global Supply Cap"
      value={form.softCap}
      type="number"
      min={0}
      onChange={(evt) =>
        handleSetForm({
          value: evt.target.value,
          propertyName: 'softCap',
        })
      }
      error={formErrors['softCap']}
    />
  );
};

export default SetMangoDepositoriesRedeemableSoftCap;
