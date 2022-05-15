import { Provider } from '@project-serum/anchor';
import { TransactionInstruction, PublicKey } from '@solana/web3.js';
import { Controller, UXD_DECIMALS } from '@uxd-protocol/uxd-client';
import type { ConnectionContext } from 'utils/connection';
import {
  uxdClient,
  initializeMango,
  instantiateMangoDepository,
  getDepositoryMintKey,
  getInsuranceMintKey,
} from './uxdClient';

const createDepositInsuranceToMangoDepositoryInstruction = async (
  connection: ConnectionContext,
  uxdProgramId: PublicKey,
  authority: PublicKey,
  depositoryMintName: string,
  insuranceMintName: string,
  insuranceDepositedAmount: number,
): Promise<TransactionInstruction> => {
  const client = uxdClient(uxdProgramId);

  const mango = await initializeMango(connection.current, connection.cluster);

  const depository = instantiateMangoDepository(
    uxdProgramId,
    getDepositoryMintKey(connection.cluster, depositoryMintName),
    getInsuranceMintKey(connection.cluster, insuranceMintName),
  );

  return client.createDepositInsuranceToMangoDepositoryInstruction(
    insuranceDepositedAmount,
    new Controller('UXD', UXD_DECIMALS, uxdProgramId),
    depository,
    mango,
    authority,
    Provider.defaultOptions(),
  );
};

export default createDepositInsuranceToMangoDepositoryInstruction;
