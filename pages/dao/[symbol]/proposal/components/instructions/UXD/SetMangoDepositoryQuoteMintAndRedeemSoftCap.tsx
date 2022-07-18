import * as yup from 'yup';
import useInstructionFormBuilder from '@hooks/useInstructionFormBuilder';
import { GovernedMultiTypeAccount } from '@utils/tokens';
import { UXDSetMangoDepositoryQuoteMintAndRedeemSoftCapForm } from '@utils/uiTypes/proposalCreationTypes';
import Input from '@components/inputs/Input';
import createSetMangoDepositoriesRedeemableSoftCapInstruction from '@tools/sdk/uxdProtocol/createSetMangoDepositoriesRedeemableSoftCapInstruction';

const schema = yup.object().shape({
  governedAccount: yup
    .object()
    .nullable()
    .required('Governance account is required'),
  softCapUiAmount: yup
    .number()
    .moreThan(0, 'Soft Cap Amount should be more than 0')
    .required('Soft Cap Amount fee is required'),
});

const UXDSetMangoDepositoryQuoteMintAndRedeemSoftCap = ({
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
  } = useInstructionFormBuilder<UXDSetMangoDepositoryQuoteMintAndRedeemSoftCapForm>(
    {
      index,
      initialFormValues: {
        governedAccount,
      },
      schema,

      buildInstruction: async function ({ form, governedAccountPubkey }) {
        return createSetMangoDepositoriesRedeemableSoftCapInstruction({
          uxdProgramId: form.governedAccount!.governance!.account
            .governedAccount,
          authority: governedAccountPubkey,
          softCapUiAmount: form.softCapUiAmount!,
        });
      },
    },
  );

  return (
    <>
      <Input
        label="Soft Cap Amount"
        value={form.softCapUiAmount}
        type="number"
        min={0}
        max={10 ** 12}
        onChange={(evt) =>
          handleSetForm({
            value: evt.target.value,
            propertyName: 'softCapUiAmount',
          })
        }
        error={formErrors['softCapUiAmount']}
      />
    </>
  );
};

export default UXDSetMangoDepositoryQuoteMintAndRedeemSoftCap;
