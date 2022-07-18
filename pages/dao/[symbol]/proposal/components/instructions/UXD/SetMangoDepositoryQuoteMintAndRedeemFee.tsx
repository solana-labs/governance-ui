import * as yup from 'yup';
import Select from '@components/inputs/Select';
import useInstructionFormBuilder from '@hooks/useInstructionFormBuilder';
import {
  getDepositoryMintSymbols,
  getInsuranceMintSymbols,
} from '@tools/sdk/uxdProtocol/uxdClient';
import { GovernedMultiTypeAccount } from '@utils/tokens';
import { UXDSetMangoDepositoryQuoteMintAndRedeemFeeForm } from '@utils/uiTypes/proposalCreationTypes';
import SelectOptionList from '../../SelectOptionList';
import Input from '@components/inputs/Input';
import createSetMangoDepositoryQuoteMintAndRedeemFeeInstruction from '@tools/sdk/uxdProtocol/createSetMangoDepositoryQuoteMintAndRedeemFeeInstruction';

const schema = yup.object().shape({
  governedAccount: yup
    .object()
    .nullable()
    .required('Governance account is required'),
  collateralName: yup.string().required('Collateral Name address is required'),
  insuranceName: yup.string().required('Insurance Name address is required'),
  uiQuoteMintAndRedeemFee: yup
    .number()
    .moreThan(0, 'Quote Mint and Redeem fee should be more than 0')
    .required('Quote Mint and Redeem fee is required'),
});

const UXDSetMangoDepositoryQuoteMintAndRedeemFee = ({
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
  } = useInstructionFormBuilder<UXDSetMangoDepositoryQuoteMintAndRedeemFeeForm>(
    {
      index,
      initialFormValues: {
        governedAccount,
      },
      schema,

      buildInstruction: async function ({ form, governedAccountPubkey }) {
        return createSetMangoDepositoryQuoteMintAndRedeemFeeInstruction({
          connection,
          uxdProgramId: form.governedAccount!.governance!.account
            .governedAccount,
          authority: governedAccountPubkey,
          depositoryMintName: form.collateralName!,
          insuranceMintName: form.insuranceName!,
          quoteFee: form.uiQuoteMintAndRedeemFee!,
        });
      },
    },
  );

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

      <Input
        label="Quote Mint and Redeem Fee (bps)"
        value={form.uiQuoteMintAndRedeemFee}
        type="number"
        min={0}
        max={255}
        onChange={(evt) =>
          handleSetForm({
            value: evt.target.value,
            propertyName: 'uiQuoteMintAndRedeemFee',
          })
        }
        error={formErrors['uiQuoteMintAndRedeemFee']}
      />
    </>
  );
};

export default UXDSetMangoDepositoryQuoteMintAndRedeemFee;
