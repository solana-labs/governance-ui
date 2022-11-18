import * as yup from 'yup';
import useInstructionFormBuilder from '@hooks/useInstructionFormBuilder';
import { GovernedMultiTypeAccount } from '@utils/tokens';
import { UXDEditIdentityDepositoryForm } from '@utils/uiTypes/proposalCreationTypes';
import Input from '@components/inputs/Input';
import Switch from '@components/Switch';
import { useState } from 'react';
import createEditIdentityDepositoryInstruction from '@tools/sdk/uxdProtocol/createEditIdentityDepositoryInstruction';
import { USDC, USDC_DECIMALS } from '@uxd-protocol/uxd-client';

const schema = yup.object().shape({
  governedAccount: yup
    .object()
    .nullable()
    .required('Governance account is required'),
  mintingDisabled: yup.boolean(),
  uiRedeemableAmountUnderManagementCap: yup
    .number()
    .min(0, 'Redeemable amount under management cap should be min 0'),
});

const RegisterMercurialVaultDepository = ({
  index,
  governedAccount,
}: {
  index: number;
  governedAccount?: GovernedMultiTypeAccount;
}) => {
  const [mintingDisabledChange, setMintingDisabledChange] = useState<boolean>(
    false,
  );

  const [
    uiRedeemableAmountUnderManagementCapChange,
    setUiRedeemableAmountUnderManagementCapChange,
  ] = useState<boolean>(false);

  const {
    connection,
    form,
    formErrors,
    handleSetForm,
  } = useInstructionFormBuilder<UXDEditIdentityDepositoryForm>({
    index,
    initialFormValues: {
      governedAccount,
      mintingDisabled: false,
    },
    schema,
    buildInstruction: async function ({ form, governedAccountPubkey }) {
      return createEditIdentityDepositoryInstruction({
        connection,
        uxdProgramId: form.governedAccount!.governance!.account.governedAccount,
        authority: governedAccountPubkey, // new PublicKey('aca3VWxwBeu8FTZowJ9hfSKGzntjX68EXh1N9xpE1PC'),

        // TODO
        // Temporary authority override for tests with mainnet test program
        // authority: new PublicKey(
        //  '8cJ5KH2ExX2rrY6DbzAqrBMDkQxYZfyedB1C4L4osc5N',
        // ),
        // ================

        collateralMint: USDC /*new PublicKey(
          '6L9fgyYtbz34JvwvYyL6YzJDAywz9PKGttuZuWyuoqje',
        ),*/,
        collateralMintSymbol: 'USDC',
        collateralMintDecimals: USDC_DECIMALS,

        mintingDisabled: mintingDisabledChange
          ? form.mintingDisabled!
          : undefined,

        redeemableAmountUnderManagementCap: uiRedeemableAmountUnderManagementCapChange
          ? form.uiRedeemableAmountUnderManagementCap!
          : undefined,
      });
    },
  });

  return (
    <>
      <h5>Minting Disable</h5>
      <div className="flex">
        <span className="mr-2">Do not change</span>
        <Switch
          checked={mintingDisabledChange}
          onChange={(checked) => setMintingDisabledChange(checked)}
        />
        <span className="ml-2">Change</span>
      </div>

      {mintingDisabledChange ? (
        <div className="flex">
          <span className="mr-2">Minting is Enabled</span>
          <Switch
            checked={form.mintingDisabled!}
            onChange={(checked) =>
              handleSetForm({
                value: checked,
                propertyName: 'mintingDisabled',
              })
            }
          />
          <span className="ml-2">Minting is Disabled</span>
        </div>
      ) : null}

      <h5>Redeemable Depository Supply Cap</h5>
      <Switch
        checked={uiRedeemableAmountUnderManagementCapChange}
        onChange={(checked) => {
          handleSetForm({
            value: undefined,
            propertyName: 'uiRedeemableAmountUnderManagementCap',
          });
          setUiRedeemableAmountUnderManagementCapChange(checked);
        }}
      />
      {uiRedeemableAmountUnderManagementCapChange ? (
        <Input
          value={form.uiRedeemableAmountUnderManagementCap}
          type="number"
          min={0}
          max={10 ** 12}
          onChange={(evt) =>
            handleSetForm({
              value: evt.target.value,
              propertyName: 'uiRedeemableAmountUnderManagementCap',
            })
          }
          error={formErrors['uiRedeemableAmountUnderManagementCap']}
        />
      ) : null}
    </>
  );
};

export default RegisterMercurialVaultDepository;
