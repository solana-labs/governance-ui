import { Provider } from '@project-serum/anchor';
import { TransactionInstruction, PublicKey } from '@solana/web3.js';
import {
  Controller,
  UXD_DECIMALS,
} from '@uxd-protocol/uxd-client';
import type { ConnectionContext } from 'utils/connection';
import { uxdClient, getCredixLpDepository } from './uxdClient';

const createRedeemFromCredixLpDepositoryInstruction = async ({
  connection,
  uxdProgramId,
  authority,
  depositoryMintName,
  redeemableAmount,
  payer,
}: {
  connection: ConnectionContext;
  uxdProgramId: PublicKey;
  authority: PublicKey;
  depositoryMintName: string;
  redeemableAmount: number;
  payer: PublicKey;
}): Promise<TransactionInstruction> => {
  const client = uxdClient(uxdProgramId);

  const depository = await getCredixLpDepository(connection, uxdProgramId, depositoryMintName);

  return client.createRedeemFromCredixLpDepositoryInstruction(
    new Controller('UXD', UXD_DECIMALS, uxdProgramId),
    depository,
    authority,
    redeemableAmount,
    Provider.defaultOptions(),
    payer,
  );
};

export default createRedeemFromCredixLpDepositoryInstruction;
