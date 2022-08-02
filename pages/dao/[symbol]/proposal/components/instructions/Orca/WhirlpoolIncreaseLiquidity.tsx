import * as yup from 'yup';
import useInstructionFormBuilder from '@hooks/useInstructionFormBuilder';
import { GovernedMultiTypeAccount } from '@utils/tokens';
import { OrcaWhirlpoolIncreaseLiquidityForm } from '@utils/uiTypes/proposalCreationTypes';
import useOrcaWhirlpoolClient from '@hooks/useOrcaWhirlpoolClient';
import orcaConfiguration, {
  WhirlpoolName,
  WhirlpoolPositionInfo,
} from '@tools/sdk/orca/configuration';
import SelectOrcaWhirlpool from '@components/SelectOrcaWhirlpool';
import { getSplTokenNameByMint } from '@utils/splTokens';
import { useEffect, useState } from 'react';
import Input from '@components/inputs/Input';
import { WhirlpoolImpl } from '@orca-so/whirlpools-sdk/dist/impl/whirlpool-impl';
import { whirlpoolIncreaseLiquidity } from '@tools/sdk/orca/whirlpoolIncreaseLiquidity';
import useOrcaWhirlpoolPositions from '@hooks/useOrcaWhirlpoolPositions';
import SelectOrcaWhirlpoolPosition from '@components/SelectOrcaWhirlpoolPosition';

const schema = yup.object().shape({
  governedAccount: yup
    .object()
    .nullable()
    .required('Governed account is required'),
  whirlpoolName: yup.string().required('Whirlpool name is required'),
  positionInfo: yup.object().nullable().required('Position is required'),
  uiSlippage: yup
    .number()
    .min(0)
    .max(100)
    .typeError('Slippage has to be a number')
    .required('Slippage is required'),
  uiAmountTokenA: yup
    .number()
    .min(0)
    .typeError('Amount token A has to be a number')
    .required('Amount token A is required'),
});

const OrcaWhirlpoolIncreaseLiquidity = ({
  index,
  governedAccount,
}: {
  index: number;
  governedAccount?: GovernedMultiTypeAccount;
}) => {
  const orcaWhirlpoolClient = useOrcaWhirlpoolClient();
  const whirlpools = orcaConfiguration.Whirlpools;

  const [
    selectedWhirlpool,
    setSelectedWhirlpool,
  ] = useState<WhirlpoolImpl | null>(null);

  const {
    form,
    handleSetForm,
    formErrors,
    governedAccountPubkey,
  } = useInstructionFormBuilder<OrcaWhirlpoolIncreaseLiquidityForm>({
    index,
    initialFormValues: {
      governedAccount,
    },
    schema,
    buildInstruction: async function ({
      cluster,
      wallet,
      governedAccountPubkey,
    }) {
      if (cluster !== 'mainnet') {
        throw new Error('Other cluster than mainnet are not supported yet.');
      }

      if (!orcaWhirlpoolClient) {
        throw new Error('Orca whirlpool client is not loaded yet.');
      }

      if (!selectedWhirlpool) {
        throw new Error('No selected whirlpool');
      }

      if (!wallet.publicKey) {
        throw new Error('No connected wallet');
      }

      return whirlpoolIncreaseLiquidity({
        whirlpool: selectedWhirlpool,
        position: form.positionInfo!.publicKey,
        uiSlippage: form.uiSlippage!,
        uiAmountTokenA: form.uiAmountTokenA!,
        authority: governedAccountPubkey,
      });
    },
  });

  const positionsInfo = useOrcaWhirlpoolPositions({
    authority: governedAccountPubkey,
    whirlpool: selectedWhirlpool ?? undefined,
  });

  useEffect(() => {
    let quit = false;

    (async () => {
      if (!orcaWhirlpoolClient) {
        return;
      }

      if (!form.whirlpoolName) {
        setSelectedWhirlpool(null);
        return;
      }

      const whirlpoolConfiguration = whirlpools[form.whirlpoolName!];

      const whirlpool = (await orcaWhirlpoolClient.getPool(
        whirlpoolConfiguration.publicKey,
      )) as WhirlpoolImpl;

      if (quit) {
        return;
      }

      setSelectedWhirlpool(whirlpool);
    })();

    return () => {
      quit = true;
    };
  }, [orcaWhirlpoolClient, form.whirlpoolName]);

  return (
    <>
      <SelectOrcaWhirlpool
        title="Whirlpool"
        whirlpools={whirlpools}
        selectedValue={form.whirlpoolName}
        onSelect={(poolName: WhirlpoolName) =>
          handleSetForm({
            value: poolName,
            propertyName: 'whirlpoolName',
          })
        }
      />

      {selectedWhirlpool && positionsInfo !== null ? (
        <SelectOrcaWhirlpoolPosition
          title="Position"
          positionsInfo={positionsInfo}
          selectedValue={form.positionInfo}
          onSelect={(positionInfo: WhirlpoolPositionInfo) =>
            handleSetForm({
              value: positionInfo,
              propertyName: 'positionInfo',
            })
          }
        />
      ) : null}

      {selectedWhirlpool && form.positionInfo ? (
        <>
          <Input
            min={0}
            max={100}
            label="Slippage in % from 0 to 100"
            value={form.uiSlippage}
            type="number"
            onChange={(evt) =>
              handleSetForm({
                value: evt.target.value,
                propertyName: 'uiSlippage',
              })
            }
            error={formErrors['uiSlippage']}
          />

          <Input
            min={0}
            label={`${getSplTokenNameByMint(
              selectedWhirlpool.getTokenAInfo().mint,
            )} Amount To Deposit`}
            value={form.uiAmountTokenA}
            type="number"
            onChange={(evt) =>
              handleSetForm({
                value: evt.target.value,
                propertyName: 'uiAmountTokenA',
              })
            }
            error={formErrors['uiAmountTokenA']}
          />
        </>
      ) : null}
    </>
  );
};

export default OrcaWhirlpoolIncreaseLiquidity;
