import { Provider } from '@project-serum/anchor';
import { TransactionInstruction, PublicKey } from '@solana/web3.js';
import { ConnectionContext } from '@utils/connection';
import {
  Controller,
  UXD_DECIMALS,
} from '@uxd-protocol/uxd-client';
import { getCredixLpDepository, uxdClient } from './uxdClient';

const createEditCredixLpDepositoryInstruction = async ({
  connection,
  uxdProgramId,
  authority,
  depositoryMintName,
  mintingFeeInBps,
  redeemingFeeInBps,
  redeemableAmountUnderManagementCap,
}: {
  connection: ConnectionContext;
  uxdProgramId: PublicKey;
  authority: PublicKey;
  depositoryMintName: string;
  mintingFeeInBps?: number;
  redeemingFeeInBps?: number;
  redeemableAmountUnderManagementCap?: number;
}): Promise<TransactionInstruction> => {
  const client = uxdClient(uxdProgramId);

  const depository = await getCredixLpDepository(connection, uxdProgramId, depositoryMintName);

  return client.createEditCredixLpDepositoryInstruction(
    new Controller('UXD', UXD_DECIMALS, uxdProgramId),
    depository,
    authority,
    {
      redeemableAmountUnderManagementCap,
      mintingFeeInBps,
      redeemingFeeInBps,
    },
    Provider.defaultOptions(),
  );
};

export default createEditCredixLpDepositoryInstruction;
