import { Provider } from '@project-serum/anchor';
import { TransactionInstruction, PublicKey } from '@solana/web3.js';
import {
  Controller,
  CredixLpDepository,
  UXD_DECIMALS,
} from '@uxd-protocol/uxd-client';
import type { ConnectionContext } from 'utils/connection';
import { uxdClient, getDepositoryMintInfo } from './uxdClient';

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
  const {
    address: collateralMint,
    decimals: collateralDecimals,
  } = getDepositoryMintInfo(connection.cluster, depositoryMintName);

  const client = uxdClient(uxdProgramId);

  const depository = await CredixLpDepository.initialize({
    connection: connection.current,
    collateralMint: {
      mint: collateralMint,
      name: depositoryMintName,
      symbol: depositoryMintName,
      decimals: collateralDecimals,
    },
    uxdProgramId,
  });

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
