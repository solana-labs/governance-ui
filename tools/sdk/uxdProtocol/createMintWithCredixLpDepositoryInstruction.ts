import { Provider } from '@project-serum/anchor';
import { TransactionInstruction, PublicKey } from '@solana/web3.js';
import {
  Controller,
  UXD_DECIMALS,
} from '@uxd-protocol/uxd-client';
import type { ConnectionContext } from 'utils/connection';
import { uxdClient, getCredixLpDepository } from './uxdClient';

const createMintWithCredixLpDepositoryInstruction = async ({
  connection,
  uxdProgramId,
  authority,
  depositoryMintName,
  collateralAmount,
  payer,
}: {
  connection: ConnectionContext;
  uxdProgramId: PublicKey;
  authority: PublicKey;
  depositoryMintName: string;
  collateralAmount: number;
  payer: PublicKey;
}): Promise<TransactionInstruction> => {
  const client = uxdClient(uxdProgramId);

  const depository = await getCredixLpDepository(connection, uxdProgramId, depositoryMintName);

  return client.createMintWithCredixLpDepositoryInstruction(
    new Controller('UXD', UXD_DECIMALS, uxdProgramId),
    depository,
    authority,
    collateralAmount,
    Provider.defaultOptions(),
    payer,
  );
};

export default createMintWithCredixLpDepositoryInstruction;
