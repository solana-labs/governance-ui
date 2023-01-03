import { Provider } from '@project-serum/anchor';
import { TransactionInstruction, PublicKey } from '@solana/web3.js';
import {
  Controller,
  UXD_DECIMALS,
} from '@uxd-protocol/uxd-client';
import type { ConnectionContext } from 'utils/connection';
import { getCredixLpDepository, uxdClient } from './uxdClient';

const createRegisterCredixLpDepositoryInstruction = async ({
  connection,
  uxdProgramId,
  authority,
  payer,
  depositoryMintName,
  mintingFeeInBps,
  redeemingFeeInBps,
  redeemableDepositorySupplyCap,
}: {
  connection: ConnectionContext;
  uxdProgramId: PublicKey;
  authority: PublicKey;
  payer: PublicKey;
  depositoryMintName: string;
  mintingFeeInBps: number;
  redeemingFeeInBps: number;
  redeemableDepositorySupplyCap: number;
}): Promise<TransactionInstruction> => {
  const client = uxdClient(uxdProgramId);

  const depository = await getCredixLpDepository(connection, uxdProgramId, depositoryMintName);

  return client.createRegisterCredixLpDepositoryInstruction(
    new Controller('UXD', UXD_DECIMALS, uxdProgramId),
    depository,
    authority,
    mintingFeeInBps,
    redeemingFeeInBps,
    redeemableDepositorySupplyCap,
    Provider.defaultOptions(),
    payer,
  );
};

export default createRegisterCredixLpDepositoryInstruction;
