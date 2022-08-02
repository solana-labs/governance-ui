import * as yup from 'yup';
import useInstructionFormBuilder from '@hooks/useInstructionFormBuilder';
import { GovernedMultiTypeAccount } from '@utils/tokens';
import { OrcaWhirlpoolOpenPositionForm } from '@utils/uiTypes/proposalCreationTypes';
import useOrcaWhirlpoolClient from '@hooks/useOrcaWhirlpoolClient';
import orcaConfiguration, {
  WhirlpoolName,
} from '@tools/sdk/orca/configuration';
import SelectOrcaWhirlpool from '@components/SelectOrcaWhirlpool';
import { getSplTokenNameByMint } from '@utils/splTokens';
import { PriceMath, TickUtil } from '@orca-so/whirlpools-sdk';
import { useEffect, useState } from 'react';
import Decimal from 'decimal.js';
import Input from '@components/inputs/Input';
import { whirlpoolOpenPosition } from '@tools/sdk/orca/whirlpoolOpenPosition';
import { WhirlpoolImpl } from '@orca-so/whirlpools-sdk/dist/impl/whirlpool-impl';

const schema = yup.object().shape({
  governedAccount: yup
    .object()
    .nullable()
    .required('Governed account is required'),
  whirlpoolName: yup.string().required('Whirlpool name is required'),
  uiLowerPrice: yup
    .number()
    .min(0)
    .typeError('Lower price has to be a number')
    .required('Lower price is required'),
  uiUpperPrice: yup
    .number()
    .min(0)
    .typeError('Upper price has to be a number')
    .required('Upper price is required'),
});

const OrcaWhirlpoolOpenPosition = ({
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
  } = useInstructionFormBuilder<OrcaWhirlpoolOpenPositionForm>({
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

      const lowerPrice = new Decimal(form.uiLowerPrice!);
      const upperPrice = new Decimal(form.uiUpperPrice!);
      const poolData = selectedWhirlpool.getData();
      const tokenADecimal = selectedWhirlpool.getTokenAInfo().decimals;
      const tokenBDecimal = selectedWhirlpool.getTokenBInfo().decimals;

      const tickLower = TickUtil.getInitializableTickIndex(
        PriceMath.priceToTickIndex(lowerPrice, tokenADecimal, tokenBDecimal),
        poolData.tickSpacing,
      );

      const tickUpper = TickUtil.getInitializableTickIndex(
        PriceMath.priceToTickIndex(upperPrice, tokenADecimal, tokenBDecimal),
        poolData.tickSpacing,
      );

      const { ix } = await whirlpoolOpenPosition({
        whirlpool: selectedWhirlpool as WhirlpoolImpl,
        tickLower,
        tickUpper,
        authority: governedAccountPubkey,
        payer: wallet.publicKey,
      });

      return ix;
    },
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

      const whirlpool = await orcaWhirlpoolClient.getPool(
        whirlpoolConfiguration.publicKey,
      );

      if (quit) {
        return;
      }

      setSelectedWhirlpool(whirlpool as WhirlpoolImpl);
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

      {selectedWhirlpool ? (
        <>
          <div className="p-4 border border-fgd-4 space-y-4">
            <h3>
              Price range :{' '}
              <em>
                {getSplTokenNameByMint(selectedWhirlpool.getTokenBInfo().mint)}{' '}
                per{' '}
                {getSplTokenNameByMint(selectedWhirlpool.getTokenAInfo().mint)}
              </em>
            </h3>

            <Input
              min={0}
              label="Lower Price"
              value={form.uiLowerPrice}
              type="number"
              onChange={(evt) =>
                handleSetForm({
                  value: evt.target.value,
                  propertyName: 'uiLowerPrice',
                })
              }
              error={formErrors['uiLowerPrice']}
            />

            <Input
              min={0}
              label="Upper Price"
              value={form.uiUpperPrice}
              type="number"
              onChange={(evt) =>
                handleSetForm({
                  value: evt.target.value,
                  propertyName: 'uiUpperPrice',
                })
              }
              error={formErrors['uiUpperPrice']}
            />
          </div>
        </>
      ) : null}
    </>
  );
};

export default OrcaWhirlpoolOpenPosition;
