import { Provider } from '@project-serum/anchor';
import { TransactionInstruction, PublicKey } from '@solana/web3.js';
import { ConnectionContext } from '@utils/connection';
import { Controller, UXD_DECIMALS } from '@uxd-protocol/uxd-client';
import {
  getDepositoryMintInfo,
  getInsuranceMintInfo,
  instantiateMangoDepository,
  uxdClient,
} from './uxdClient';

const createEditMangoDepositoryInstruction = async ({
  connection,
  uxdProgramId,
  authority,
  depositoryMintName,
  insuranceMintName,
  quoteMintAndRedeemFee,
  redeemableAmountUnderManagementCap,
}: {
  connection: ConnectionContext;
  uxdProgramId: PublicKey;
  authority: PublicKey;
  depositoryMintName: string;
  insuranceMintName: string;
  quoteMintAndRedeemFee?: number;
  redeemableAmountUnderManagementCap?: number;
}): Promise<TransactionInstruction> => {
  const {
    address: depositoryMint,
    decimals: depositoryDecimals,
  } = getDepositoryMintInfo(connection.cluster, depositoryMintName);

  const {
    address: insuranceMint,
    decimals: insuranceDecimals,
  } = getInsuranceMintInfo(connection.cluster, insuranceMintName);

  const depository = instantiateMangoDepository({
    uxdProgramId,
    depositoryMint,
    insuranceMint,
    depositoryName: depositoryMintName,
    depositoryDecimals,
    insuranceName: insuranceMintName,
    insuranceDecimals,
  });

  const client = uxdClient(uxdProgramId);

  return client.createEditMangoDepositoryInstruction(
    new Controller('UXD', UXD_DECIMALS, uxdProgramId),
    depository,
    authority,
    {
      quoteMintAndRedeemFee,
      redeemableAmountUnderManagementCap,
    },
    Provider.defaultOptions(),
  );
};

export default createEditMangoDepositoryInstruction;
