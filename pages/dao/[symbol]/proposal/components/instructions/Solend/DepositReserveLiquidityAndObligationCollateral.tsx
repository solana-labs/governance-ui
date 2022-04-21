import * as yup from 'yup';
import Input from '@components/inputs/Input';
import Select from '@components/inputs/Select';
import useInstructionFormBuilder from '@hooks/useInstructionFormBuilder';
import SolendConfiguration from '@tools/sdk/solend/configuration';
import { depositReserveLiquidityAndObligationCollateral } from '@tools/sdk/solend/depositReserveLiquidityAndObligationCollateral';
import { uiAmountToNativeBN } from '@tools/sdk/units';
import { GovernedMultiTypeAccount } from '@utils/tokens';
import { DepositReserveLiquidityAndObligationCollateralForm } from '@utils/uiTypes/proposalCreationTypes';
import SelectOptionList from '../../SelectOptionList';

const schema = yup.object().shape({
  governedAccount: yup
    .object()
    .nullable()
    .required('Governed account is required'),
  lendingMarketName: yup.string().required('Lending market is required'),
  tokenName: yup.string().required('Token name is required'),
  uiAmount: yup
    .number()
    .moreThan(0, 'Amount should be more than 0')
    .required('Amount is required'),
});

const DepositReserveLiquidityAndObligationCollateral = ({
  index,
  governedAccount,
}: {
  index: number;
  governedAccount?: GovernedMultiTypeAccount;
}) => {
  const {
    form,
    connection,
    formErrors,
    handleSetForm,
  } = useInstructionFormBuilder<DepositReserveLiquidityAndObligationCollateralForm>(
    {
      index,
      initialFormValues: {
        governedAccount,
        uiAmount: 0,
      },
      schema,
      buildInstruction: async function ({ governedAccountPubkey, form }) {
        const {
          supportedTokens,
        } = SolendConfiguration.getSupportedLendingMarketInformation(
          form.lendingMarketName!,
        );

        if (!supportedTokens[form.tokenName!]) {
          throw new Error(
            `Unsupported token ${form.tokenName!} for Lending market ${
              form.lendingMarketName
            }`,
          );
        }
        return depositReserveLiquidityAndObligationCollateral({
          obligationOwner: governedAccountPubkey,
          liquidityAmount: uiAmountToNativeBN(
            form.uiAmount!,
            supportedTokens[form.tokenName!]!.decimals,
          ),
          lendingMarketName: form.lendingMarketName!,
          tokenName: form.tokenName!,
        });
      },
    },
  );

  // Hardcoded gate used to be clear about what cluster is supported for now
  if (connection.cluster !== 'mainnet') {
    return <>This instruction does not support {connection.cluster}</>;
  }

  return (
    <>
      <Select
        label="Lending Market"
        value={form.lendingMarketName}
        placeholder="Please select..."
        onChange={(value) =>
          handleSetForm({ value, propertyName: 'lendingMarketName' })
        }
        error={formErrors['baseTokenName']}
      >
        <SelectOptionList
          list={SolendConfiguration.getSupportedLendingMarketNames()}
        />
      </Select>
      {form.lendingMarketName && (
        <Select
          label="Token Name"
          value={form.tokenName}
          placeholder="Please select..."
          onChange={(value) =>
            handleSetForm({ value, propertyName: 'tokenName' })
          }
          error={formErrors['tokenName']}
        >
          <SelectOptionList
            list={Object.keys(
              SolendConfiguration.getSupportedLendingMarketInformation(
                form.lendingMarketName,
              ).supportedTokens,
            )}
          />
        </Select>
      )}

      <Input
        label="Amount to deposit"
        value={form.uiAmount}
        type="number"
        min="0"
        onChange={(evt) =>
          handleSetForm({
            value: evt.target.value,
            propertyName: 'uiAmount',
          })
        }
        error={formErrors['uiAmount']}
      />
    </>
  );
};

export default DepositReserveLiquidityAndObligationCollateral;
