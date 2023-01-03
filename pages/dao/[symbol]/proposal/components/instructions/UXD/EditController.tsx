import * as yup from 'yup';
import useInstructionFormBuilder from '@hooks/useInstructionFormBuilder';
import { GovernedMultiTypeAccount } from '@utils/tokens';
import { UXDEditControllerForm } from '@utils/uiTypes/proposalCreationTypes';
import Switch from '@components/Switch';
import { useState } from 'react';
import createEditControllerInstruction from '@tools/sdk/uxdProtocol/createEditControllerInstruction';
import InputNumber from '@components/inputs/InputNumber';

const schema = yup.object().shape({
  governedAccount: yup
    .object()
    .nullable()
    .required('Governance account is required'),
  uiRedeemableGlobalSupplyCap: yup
    .number()
    .min(0, 'Redeemable global supply cap should be min 0'),
});

const EditControllerDepository = ({
  index,
  governedAccount,
}: {
  index: number;
  governedAccount?: GovernedMultiTypeAccount;
}) => {
  const [
    redeemableGlobalSupplyCapChange,
    setRedeemableGlobalSupplyCapChange,
  ] = useState<boolean>(false);

  const {
    form,
    formErrors,
    handleSetForm,
  } = useInstructionFormBuilder<UXDEditControllerForm>({
    index,
    initialFormValues: {
      governedAccount,
    },
    schema,
    buildInstruction: async function ({ form, governedAccountPubkey }) {
      return createEditControllerInstruction({
        uxdProgramId: form.governedAccount!.governance!.account.governedAccount,
        authority: governedAccountPubkey,

        // TODO
        // Temporary authority override for tests with mainnet test program
        //authority: new PublicKey(
        //  '8cJ5KH2ExX2rrY6DbzAqrBMDkQxYZfyedB1C4L4osc5N',
        // ),
        // ================

        redeemableGlobalSupplyCap: redeemableGlobalSupplyCapChange
          ? form.uiRedeemableGlobalSupplyCap!
          : undefined,
      });
    },
  });

  return (
    <>
      <h5>Redeemable Global Supply Cap</h5>
      <Switch
        checked={redeemableGlobalSupplyCapChange}
        onChange={(checked) => setRedeemableGlobalSupplyCapChange(checked)}
      />
      {redeemableGlobalSupplyCapChange ? (
        <InputNumber
          label="Redeemable Global Supply Cap"
          value={form.uiRedeemableGlobalSupplyCap}
          min={0}
          max={10 ** 12}
          onChange={(value) =>
            handleSetForm({
              value,
              propertyName: 'uiRedeemableGlobalSupplyCap',
            })
          }
          error={formErrors['uiRedeemableGlobalSupplyCap']}
        />
      ) : null}
    </>
  );
};

export default EditControllerDepository;
