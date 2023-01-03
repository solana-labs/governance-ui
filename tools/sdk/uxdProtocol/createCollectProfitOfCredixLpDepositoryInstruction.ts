import { Provider } from '@project-serum/anchor';
import { TransactionInstruction, PublicKey } from '@solana/web3.js';
import {
  Controller,
  UXD_DECIMALS,
} from '@uxd-protocol/uxd-client';
import type { ConnectionContext } from 'utils/connection';
import { uxdClient, getCredixLpDepository } from './uxdClient';

const createCollectProfitOfCredixLpDepositoryInstruction = async ({
  connection,
  uxdProgramId,
  authority,
  depositoryMintName,
  payer,
}: {
  connection: ConnectionContext;
  uxdProgramId: PublicKey;
  authority: PublicKey;
  depositoryMintName: string;
  payer: PublicKey;
}): Promise<TransactionInstruction> => {
  const client = uxdClient(uxdProgramId);

  const depository = await getCredixLpDepository(connection, uxdProgramId, depositoryMintName);

  return client.createCollectProfitOfCredixLpDepositoryInstruction(
    new Controller('UXD', UXD_DECIMALS, uxdProgramId),
    depository,
    authority,
    Provider.defaultOptions(),
    payer,
  );
};

export default createCollectProfitOfCredixLpDepositoryInstruction;
