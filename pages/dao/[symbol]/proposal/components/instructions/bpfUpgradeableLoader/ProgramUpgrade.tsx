import * as yup from 'yup';
import { PublicKey } from '@solana/web3.js';
import Input from '@components/inputs/Input';
import useInstructionFormBuilder from '@hooks/useInstructionFormBuilder';
import { createUpgradeInstruction } from '@tools/sdk/bpfUpgradeableLoader/createUpgradeInstruction';
import { GovernedMultiTypeAccount } from '@utils/tokens';
import {
  ProgramUpgradeForm,
  programUpgradeFormNameOf,
} from '@utils/uiTypes/proposalCreationTypes';
import { validateAccount, validateBuffer } from '@utils/validations';
import useWalletStore from 'stores/useWalletStore';
import ProgramUpgradeInfo from './ProgramUpgradeInfo';

const ProgramUpgrade = ({
  index,
  governedAccount,
}: {
  index: number;
  governedAccount?: GovernedMultiTypeAccount;
}) => {
  const connection = useWalletStore((s) => s.connection);
  const {
    form,
    formErrors,
    handleSetForm,
  } = useInstructionFormBuilder<ProgramUpgradeForm>({
    index,
    initialFormValues: {
      governedAccount,
    },
    schema: yup.object().shape({
      bufferAddress: yup
        .string()
        .test('bufferTest', 'Invalid buffer', async function (val: string) {
          if (val) {
            try {
              await validateBuffer(
                connection,
                val,
                form.governedAccount?.governance?.pubkey,
              );
              return true;
            } catch (e) {
              return this.createError({
                message: `${e}`,
              });
            }
          } else {
            return this.createError({
              message: `Buffer address is required`,
            });
          }
        }),
      governedAccount: yup
        .object()
        .nullable()
        .required('Program governed account is required'),

      bufferSpillAddress: yup
        .string()
        .test(
          'bufferSpillAddressTest',
          'Invalid buffer spill address',
          async function (val: string) {
            if (val) {
              try {
                await validateAccount(connection, val);
                return true;
              } catch (ex) {
                return this.createError({
                  message: `${ex}`,
                });
              }
              return true;
            } else {
              return this.createError({
                message: `Buffer spill address is required`,
              });
            }
          },
        ),
    }),
    buildInstruction: async function ({ form, wallet, governedAccountPubkey }) {
      if (!governedAccount?.governance?.account) {
        throw new Error('Governance must be a Program Account Governance');
      }

      const bufferSpillAddress = form.bufferSpillAddress
        ? new PublicKey(form.bufferSpillAddress)
        : wallet.publicKey!;

      return createUpgradeInstruction(
        form.governedAccount!.governance!.account.governedAccount,
        new PublicKey(form.bufferAddress!),
        governedAccountPubkey,
        bufferSpillAddress,
      );
    },
  });

  return (
    <>
      <Input
        label="Buffer address"
        value={form.bufferAddress}
        type="text"
        onChange={(evt) =>
          handleSetForm({
            value: evt.target.value,
            propertyName: programUpgradeFormNameOf('bufferAddress'),
          })
        }
        error={formErrors[programUpgradeFormNameOf('bufferAddress')]}
      />

      <ProgramUpgradeInfo
        governancePk={form.governedAccount?.governance?.pubkey}
      ></ProgramUpgradeInfo>

      <Input
        label="Buffer spill address"
        value={form.bufferSpillAddress}
        type="text"
        onChange={(evt) =>
          handleSetForm({
            value: evt.target.value,
            propertyName: programUpgradeFormNameOf('bufferSpillAddress'),
          })
        }
        error={formErrors[programUpgradeFormNameOf('bufferSpillAddress')]}
      />
    </>
  );
};

export default ProgramUpgrade;
