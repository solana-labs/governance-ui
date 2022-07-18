import * as yup from 'yup';
import Select from '@components/inputs/Select';
import useInstructionFormBuilder from '@hooks/useInstructionFormBuilder';
import {
  getDepositoryMintSymbols,
  getInsuranceMintSymbols,
} from '@tools/sdk/uxdProtocol/uxdClient';
import { GovernedMultiTypeAccount } from '@utils/tokens';
import { UXDDisableDepositoryMintingForm } from '@utils/uiTypes/proposalCreationTypes';
import SelectOptionList from '../../SelectOptionList';
import createDisableDepositoryRegularMintingInstruction from '@tools/sdk/uxdProtocol/createDisableDepositoryRegularMintingInstruction';
import Switch from '@components/Switch';

const schema = yup.object().shape({
  governedAccount: yup
    .object()
    .nullable()
    .required('Governance account is required'),
  collateralName: yup.string().required('Collateral Name address is required'),
  insuranceName: yup.string().required('Insurance Name address is required'),
  disableMinting: yup.boolean().required('Disable Minting is required'),
});

const UXDDisableDepositoryMinting = ({
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
  } = useInstructionFormBuilder<UXDDisableDepositoryMintingForm>({
    index,
    initialFormValues: {
      governedAccount,
      disableMinting: true,
    },
    schema,

    buildInstruction: async function ({ form, governedAccountPubkey }) {
      return createDisableDepositoryRegularMintingInstruction({
        connection,
        uxdProgramId: form.governedAccount!.governance!.account.governedAccount,
        authority: governedAccountPubkey,
        depositoryMintName: form.collateralName!,
        insuranceMintName: form.insuranceName!,
        disableMinting: form.disableMinting,
      });
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

      <div className="flex">
        <span className="text-sm mr-2">Enable Minting</span>

        <Switch
          checked={form.disableMinting}
          onChange={(value) => {
            handleSetForm({ value, propertyName: 'disableMinting' });
          }}
        />

        <span className="text-sm ml-2">Disable Minting</span>
      </div>
    </>
  );
};

export default UXDDisableDepositoryMinting;
