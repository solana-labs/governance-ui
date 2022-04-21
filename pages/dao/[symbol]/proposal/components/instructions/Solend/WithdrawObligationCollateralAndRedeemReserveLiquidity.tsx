import * as yup from 'yup';
import { PublicKey } from '@solana/web3.js';
import Input from '@components/inputs/Input';
import Select from '@components/inputs/Select';
import useInstructionFormBuilder from '@hooks/useInstructionFormBuilder';
import SolendConfiguration from '@tools/sdk/solend/configuration';
import { withdrawObligationCollateralAndRedeemReserveLiquidity } from '@tools/sdk/solend/withdrawObligationCollateralAndRedeemReserveLiquidity';
import { uiAmountToNativeBN } from '@tools/sdk/units';
import { GovernedMultiTypeAccount } from '@utils/tokens';
import { WithdrawObligationCollateralAndRedeemReserveLiquidityForm } from '@utils/uiTypes/proposalCreationTypes';
import SelectOptionList from '../../SelectOptionList';

const schema = yup.object().shape({
  governedAccount: yup
    .object()
    .nullable()
    .required('Governed account is required'),
  tokenName: yup.string().required('Token Name is required'),
  uiAmount: yup
    .number()
    .moreThan(0, 'Amount should be more than 0')
    .required('Amount is required'),
});

const WithdrawObligationCollateralAndRedeemReserveLiquidity = ({
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
  } = useInstructionFormBuilder<WithdrawObligationCollateralAndRedeemReserveLiquidityForm>(
    {
      index,
      initialFormValues: {
        governedAccount,
        uiAmount: 0,
      },
      schema,
      buildInstruction: async function ({ form, governedAccountPubkey }) {
        const {
          supportedTokens,
        } = SolendConfiguration.getSupportedLendingMarketInformation(
          form.lendingMarketName!,
        );
        const token = supportedTokens[form.tokenName!];

        if (!token) {
          throw new Error(
            `Unsupported token ${form.tokenName!} for Lending market ${
              form.lendingMarketName
            }`,
          );
        }
        return withdrawObligationCollateralAndRedeemReserveLiquidity({
          obligationOwner: governedAccountPubkey,
          liquidityAmount: uiAmountToNativeBN(form.uiAmount!, token.decimals),
          lendingMarketName: form.lendingMarketName!,
          ...(form.destinationLiquidity && {
            destinationLiquidity: new PublicKey(form.destinationLiquidity),
          }),
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
        error={formErrors['lendingMarketName']}
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
        label="Amount to withdraw"
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

      <Input
        label="Destination Account (Optional - default to governance ATA"
        value={form.destinationLiquidity}
        type="string"
        onChange={(evt) =>
          handleSetForm({
            value: evt.target.value,
            propertyName: 'destinationLiquidity',
          })
        }
        error={formErrors['destinationLiquidity']}
      />
    </>
  );
};

export default WithdrawObligationCollateralAndRedeemReserveLiquidity;
