import { Provider } from '@project-serum/anchor';
import { TransactionInstruction, PublicKey } from '@solana/web3.js';
import { ConnectionContext } from '@utils/connection';
import {
  Controller,
  MercurialVaultDepository,
  UXD_DECIMALS,
} from '@uxd-protocol/uxd-client';
import { getDepositoryMintInfo, uxdClient } from './uxdClient';

const createEditMercurialVaultDepositoryInstruction = async ({
  connection,
  uxdProgramId,
  authority,
  depositoryMintName,
  redeemableAmountUnderManagementCap,
  mintingFeeInBps,
  redeemingFeeInBps,
  mintingDisabled,
  profitsBeneficiaryCollateral,
}: {
  connection: ConnectionContext;
  uxdProgramId: PublicKey;
  authority: PublicKey;
  depositoryMintName: string;
  redeemableAmountUnderManagementCap?: number;
  mintingFeeInBps?: number;
  redeemingFeeInBps?: number;
  mintingDisabled?: boolean;
  profitsBeneficiaryCollateral?: string;
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

  return client.createEditMercurialVaultDepositoryInstruction(
    new Controller('UXD', UXD_DECIMALS, uxdProgramId),
    depository,
    authority,
    {
      redeemableAmountUnderManagementCap,
      mintingFeeInBps,
      redeemingFeeInBps,
      mintingDisabled,
      profitsBeneficiaryCollateral: new PublicKey(profitsBeneficiaryCollateral ?? ""),
    },
    Provider.defaultOptions(),
  );
};

export default createEditMercurialVaultDepositoryInstruction;
