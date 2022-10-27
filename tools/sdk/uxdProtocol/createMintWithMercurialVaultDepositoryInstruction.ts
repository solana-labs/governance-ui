import { Provider } from '@project-serum/anchor';
import { TransactionInstruction, PublicKey } from '@solana/web3.js';
import {
  Controller,
  MercurialVaultDepository,
  UXD_DECIMALS,
} from '@uxd-protocol/uxd-client';
import type { ConnectionContext } from 'utils/connection';
import { uxdClient, getDepositoryMintInfo } from './uxdClient';

const createMintWithMercurialVaultDepositoryInstruction = async ({
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
  const {
    address: collateralMint,
    decimals: collateralDecimals,
  } = getDepositoryMintInfo(connection.cluster, depositoryMintName);

  const client = uxdClient(uxdProgramId);

  const depository = await MercurialVaultDepository.initialize({
    connection: connection.current,
    collateralMint: {
      mint: collateralMint,
      name: depositoryMintName,
      symbol: depositoryMintName,
      decimals: collateralDecimals,
    },
    uxdProgramId,
  });

  return client.createMintWithMercurialVaultDepositoryInstruction(
    new Controller('UXD', UXD_DECIMALS, uxdProgramId),
    depository,
    authority,
    collateralAmount,
    Provider.defaultOptions(),
    payer,
  );
};

export default createMintWithMercurialVaultDepositoryInstruction;
