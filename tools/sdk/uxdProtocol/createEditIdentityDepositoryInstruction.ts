import { Provider } from '@project-serum/anchor';
import { TransactionInstruction, PublicKey } from '@solana/web3.js';
import { ConnectionContext } from '@utils/connection';
import {
  Controller,
  IdentityDepository,
  UXD_DECIMALS,
} from '@uxd-protocol/uxd-client';
import { uxdClient } from './uxdClient';

const createEditIdentityDepositoryInstruction = async ({
  uxdProgramId,
  authority,
  collateralMint,
  collateralMintSymbol,
  collateralMintDecimals,
  redeemableAmountUnderManagementCap,
  mintingDisabled,
}: {
  connection: ConnectionContext;
  uxdProgramId: PublicKey;
  authority: PublicKey;
  collateralMint: PublicKey;
  collateralMintSymbol: string;
  collateralMintDecimals: number;
  redeemableAmountUnderManagementCap?: number;
  mintingDisabled?: boolean;
}): Promise<TransactionInstruction> => {
  const client = uxdClient(uxdProgramId);

  const identityDepository = new IdentityDepository(
    collateralMint,
    collateralMintSymbol,
    collateralMintDecimals,
    uxdProgramId,
  );

  return client.createEditIdentityDepositoryInstruction(
    new Controller('UXD', UXD_DECIMALS, uxdProgramId),
    identityDepository,
    authority,
    {
      redeemableAmountUnderManagementCap,
      mintingDisabled,
    },
    Provider.defaultOptions(),
  );
};

export default createEditIdentityDepositoryInstruction;
