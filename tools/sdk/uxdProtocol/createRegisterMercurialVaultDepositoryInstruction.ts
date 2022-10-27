import { Provider } from '@project-serum/anchor';
import { TransactionInstruction, PublicKey } from '@solana/web3.js';
import {
  Controller,
  MercurialVaultDepository,
  UXD_DECIMALS,
} from '@uxd-protocol/uxd-client';
import type { ConnectionContext } from 'utils/connection';
import { getDepositoryMintInfo, uxdClient } from './uxdClient';

const createRegisterMercurialVaultDepositoryInstruction = async ({
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
  const {
    address: collateralMint,
    decimals: collateralDecimals,
  } = getDepositoryMintInfo(connection.cluster, depositoryMintName);

  const client = uxdClient(uxdProgramId);

  console.log('Register', {
    mint: collateralMint.toBase58(),
    name: depositoryMintName,
    symbol: depositoryMintName,
    decimals: collateralDecimals,
  });

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

  return client.createRegisterMercurialVaultDepositoryInstruction(
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

export default createRegisterMercurialVaultDepositoryInstruction;
