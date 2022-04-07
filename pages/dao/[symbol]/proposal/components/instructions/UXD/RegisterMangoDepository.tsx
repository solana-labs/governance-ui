import * as yup from 'yup';
import Select from '@components/inputs/Select';
import useInstructionFormBuilder from '@hooks/useInstructionFormBuilder';
import createRegisterMangoDepositoryInstruction from '@tools/sdk/uxdProtocol/createRegisterMangoDepositoryInstruction';
import {
  getDepositoryMintSymbols,
  getInsuranceMintSymbols,
} from '@tools/sdk/uxdProtocol/uxdClient';
import { GovernedMultiTypeAccount } from '@utils/tokens';
import { RegisterMangoDepositoryForm } from '@utils/uiTypes/proposalCreationTypes';
import SelectOptionList from '../../SelectOptionList';

const schema = yup.object().shape({
  governedAccount: yup
    .object()
    .nullable()
    .required('Governance account is required'),
  collateralName: yup.string().required('Valid Collateral name is required'),
  insuranceName: yup.string().required('Valid Insurance name is required'),
});

const RegisterMangoDepository = ({
  index,
  governedAccount,
}: {
  index: number;
  governedAccount?: GovernedMultiTypeAccount;
}) => {
  const {
    connection,
    form,
    formErrors,
    handleSetForm,
  } = useInstructionFormBuilder<RegisterMangoDepositoryForm>({
    index,
    initialFormValues: {
      governedAccount,
    },
    schema,
    buildInstruction: async function ({ form, wallet, governedAccountPubkey }) {
      return createRegisterMangoDepositoryInstruction(
        connection,
        form.governedAccount!.governance.account.governedAccount,
        governedAccountPubkey,
        wallet.publicKey!,
        form.collateralName!,
        form.insuranceName!,
      );
    },
  });

  return (
    <>
      <Select
        label="Collateral Name"
        value={form.collateralName}
        placeholder="Please select..."
        onChange={(value) =>
          handleSetForm({ value, propertyName: 'collateralName' })
        }
        error={formErrors['collateralName']}
      >
        <SelectOptionList list={getDepositoryMintSymbols(connection.cluster)} />
      </Select>

      <Select
        label="Insurance Name"
        value={form.insuranceName}
        placeholder="Please select..."
        onChange={(value) =>
          handleSetForm({ value, propertyName: 'insuranceName' })
        }
        error={formErrors['insuranceName']}
      >
        <SelectOptionList list={getInsuranceMintSymbols(connection.cluster)} />
      </Select>
    </>
  );
};

export default RegisterMangoDepository;
