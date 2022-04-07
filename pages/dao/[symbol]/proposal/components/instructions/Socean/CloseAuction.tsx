import * as yup from 'yup';
import { PublicKey } from '@solana/web3.js';
import Input from '@components/inputs/Input';
import useInstructionFormBuilder from '@hooks/useInstructionFormBuilder';
import soceanConfig from '@tools/sdk/socean/configuration';
import { closeAuction } from '@tools/sdk/socean/instructions/closeAuction';
import { GovernedMultiTypeAccount } from '@utils/tokens';
import { SoceanCloseAuctionForm } from '@utils/uiTypes/proposalCreationTypes';

const schema = yup.object().shape({
  governedAccount: yup
    .object()
    .nullable()
    .required('Governed account is required'),
  auction: yup.string().required('Auction is required'),
  bondedMint: yup.string().required('Bonded mint is required'),
  destinationAccount: yup.string().required('Destination account is required'),
});

const CloseAuction = ({
  index,
  governedAccount,
}: {
  index: number;
  governedAccount?: GovernedMultiTypeAccount;
}) => {
  const {
    form,
    handleSetForm,
    formErrors,
  } = useInstructionFormBuilder<SoceanCloseAuctionForm>({
    index,
    initialFormValues: {
      governedAccount,
    },
    schema,
    buildInstruction: async function ({
      connection,
      wallet,
      cluster,
      form,
      governedAccountPubkey,
    }) {
      const programs = soceanConfig.getSoceanPrograms({
        connection,
        wallet,
        cluster,
      });
      return closeAuction({
        cluster: cluster,
        program: programs.DescendingAuction,
        auction: new PublicKey(form.auction!),
        authority: governedAccountPubkey,
        bondedMint: new PublicKey(form.bondedMint!),
        destinationAccount: new PublicKey(form.destinationAccount!),
      });
    },
  });

  return (
    <>
      <Input
        label="Auction"
        value={form.auction}
        type="string"
        onChange={(evt) =>
          handleSetForm({
            value: evt.target.value,
            propertyName: 'auction',
          })
        }
        error={formErrors['auction']}
      />

      <Input
        label="Bonded Mint"
        value={form.bondedMint}
        type="string"
        onChange={(evt) =>
          handleSetForm({
            value: evt.target.value,
            propertyName: 'bondedMint',
          })
        }
        error={formErrors['bondedMint']}
      />

      <Input
        label="Destination Account (Bonded mint TA/ATA)"
        value={form.destinationAccount}
        type="string"
        onChange={(evt) =>
          handleSetForm({
            value: evt.target.value,
            propertyName: 'destinationAccount',
          })
        }
        error={formErrors['destinationAccount']}
      />
    </>
  );
};

export default CloseAuction;
