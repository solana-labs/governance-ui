import * as yup from 'yup';
import Select from '@components/inputs/Select';
import useInstructionFormBuilder from '@hooks/useInstructionFormBuilder';
import {
  getDepositoryMintSymbols,
  getInsuranceMintSymbols,
} from '@tools/sdk/uxdProtocol/uxdClient';
import { GovernedMultiTypeAccount } from '@utils/tokens';
import { UXDQuoteMintWithMangoDepositoryForm } from '@utils/uiTypes/proposalCreationTypes';
import SelectOptionList from '../../SelectOptionList';
import createQuoteMintWithMangoDepositoryInstruction from '@tools/sdk/uxdProtocol/createQuoteMintWithMangoDepositoryInstruction';
import Input from '@components/inputs/Input';
import { PublicKey } from '@solana/web3.js';

const schema = yup.object().shape({
  governedAccount: yup
    .object()
    .nullable()
    .required('Governance account is required'),
  uxdProgram: yup.string().required('UXD Program address is required'),
  collateralName: yup.string().required('Collateral Name address is required'),
  insuranceName: yup.string().required('Insurance Name address is required'),
  uiQuoteAmount: yup
    .number()
    .moreThan(0, 'Quote amount should be more than 0')
    .required('Quote Amount is required'),
});

const UXDQuoteMintWithMangoDepository = ({
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
  } = useInstructionFormBuilder<UXDQuoteMintWithMangoDepositoryForm>({
    index,
    initialFormValues: {
      governedAccount,
    },
    schema,
    shouldSplitIntoSeparateTxs: true,
    buildInstruction: async function ({ form, governedAccountPubkey, wallet }) {
      return createQuoteMintWithMangoDepositoryInstruction({
        connection,
        uxdProgramId: new PublicKey(form.uxdProgram!),
        authority: governedAccountPubkey,
        depositoryMintName: form.collateralName!,
        insuranceMintName: form.insuranceName!,
        quoteAmount: form.uiQuoteAmount!,
        payer: wallet.publicKey!,
      });
    },
  });

  return (
    <>
      <Input
        label="UXD Program"
        value={form.uxdProgram}
        type="string"
        onChange={(evt) =>
          handleSetForm({
            value: evt.target.value,
            propertyName: 'uxdProgram',
          })
        }
        error={formErrors['uxdProgram']}
      />

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
        label="Quote Amount"
        value={form.uiQuoteAmount}
        type="number"
        min={0}
        max={10 ** 12}
        onChange={(evt) =>
          handleSetForm({
            value: evt.target.value,
            propertyName: 'uiQuoteAmount',
          })
        }
        error={formErrors['uiQuoteAmount']}
      />
    </>
  );
};

export default UXDQuoteMintWithMangoDepository;
